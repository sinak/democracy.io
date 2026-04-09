import crypto from 'node:crypto';
import type { Pool as PgPool } from 'pg';
import {
  type Campaign,
  type CampaignEvent,
  type CampaignEventType,
  type CampaignStats,
  type CampaignStatus,
  type CreateCampaignEventRequest,
  type CreateCampaignRequest,
  type PublicCampaign,
  type UpdateCampaignRequest,
} from '../types.js';
import { hashIpAddress } from '../helpers/ip-address.js';
import { getPostgresPool } from './postgres.js';

type NonDisabledCampaignStatus = Exclude<CampaignStatus, 'disabled'>;
const RANDOM_CAMPAIGN_SLUG_BYTE_LENGTH = 6;
const RANDOM_CAMPAIGN_SLUG_MAX_ATTEMPTS = 5;

export interface CampaignRecord extends Campaign {
  statusBeforeDisabled: NonDisabledCampaignStatus;
}

interface NewCampaignRecord {
  organizerUserId: string;
  organizerEmail: string;
  title: string;
  slug: string;
  summary: string | null;
  bodyMarkdown: string | null;
  organizationName: string | null;
  organizationUrl: string | null;
}

interface NewCampaignEventRecord {
  campaignId: string;
  type: CampaignEventType;
  metadata: Record<string, unknown> | null;
  requestIpHash: string | null;
  userAgent: string | null;
  referrer: string | null;
}

export interface CampaignActor {
  userId: string;
  email: string;
}

export interface CampaignEventContext {
  requestIp?: string;
  userAgent?: string;
  referrer?: string;
}

export interface CampaignMessageSubmission {
  batchId: string;
  campaignUuid: string | null;
  campaignTag: string | null;
  deliveryStatus: string;
  deliveryError: string | null;
}

export interface CampaignRepository {
  listByOrganizer(organizerUserId: string): Promise<CampaignRecord[]>;
  listAll(): Promise<CampaignRecord[]>;
  findById(id: string): Promise<CampaignRecord | null>;
  findBySlug(slug: string): Promise<CampaignRecord | null>;
  create(input: NewCampaignRecord): Promise<CampaignRecord>;
  update(campaign: CampaignRecord): Promise<CampaignRecord>;
  createEvent(event: NewCampaignEventRecord): Promise<CampaignEvent>;
}

export interface CampaignService {
  listOrganizerCampaigns(actor: CampaignActor): Promise<Campaign[]>;
  createCampaign(actor: CampaignActor, input: CreateCampaignRequest): Promise<Campaign>;
  getOrganizerCampaign(actor: CampaignActor, campaignId: string): Promise<Campaign>;
  updateCampaign(actor: CampaignActor, campaignId: string, input: UpdateCampaignRequest): Promise<Campaign>;
  publishCampaign(actor: CampaignActor, campaignId: string): Promise<Campaign>;
  archiveCampaign(actor: CampaignActor, campaignId: string): Promise<Campaign>;
  listAdminCampaigns(): Promise<Campaign[]>;
  disableCampaign(campaignId: string): Promise<Campaign>;
  restoreCampaign(campaignId: string): Promise<Campaign>;
  getPublicCampaignBySlug(slug: string): Promise<PublicCampaign>;
  recordPublicCampaignEvent(
    slug: string,
    input: CreateCampaignEventRequest,
    context?: CampaignEventContext
  ): Promise<CampaignEvent>;
}

class CampaignError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number
  ) {
    super(message);
  }
}

export class CampaignValidationError extends CampaignError {
  constructor(message: string) {
    super(message, 400);
  }
}

export class CampaignNotFoundError extends CampaignError {
  constructor(message = 'Campaign not found.') {
    super(message, 404);
  }
}

export class CampaignConflictError extends CampaignError {
  constructor(message: string) {
    super(message, 409);
  }
}

export class CampaignStateError extends CampaignError {
  constructor(message: string) {
    super(message, 409);
  }
}

export class CampaignConfigurationError extends CampaignError {
  constructor(message: string) {
    super(message, 503);
  }
}

export function getCampaignErrorStatusCode(err: unknown) {
  return err instanceof CampaignError ? err.statusCode : 500;
}

function defaultCampaignStats(): CampaignStats {
  return {
    pageViews: 0,
    flowStarts: 0,
    peopleTakenAction: 0,
    totalMessagesSent: 0,
  };
}

function toIsoString(value: unknown) {
  if (!value) {
    return null;
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  const date = new Date(String(value));
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

function parseCampaignStats(row: Record<string, unknown>): CampaignStats {
  return {
    pageViews: Number(row.page_views ?? 0),
    flowStarts: Number(row.flow_starts ?? 0),
    peopleTakenAction: Number(row.people_taken_action ?? 0),
    totalMessagesSent: Number(row.total_messages_sent ?? 0),
  };
}

function mapCampaignRow(row: Record<string, unknown>): CampaignRecord {
  return {
    id: String(row.id),
    organizerUserId: String(row.organizer_user_id),
    organizerEmail: String(row.organizer_email),
    title: String(row.title),
    slug: String(row.slug),
    summary: row.summary == null ? null : String(row.summary),
    bodyMarkdown: row.body_markdown == null ? null : String(row.body_markdown),
    organizationName: row.organization_name == null ? null : String(row.organization_name),
    organizationUrl: row.organization_url == null ? null : String(row.organization_url),
    status: row.status as CampaignStatus,
    statusBeforeDisabled: row.status_before_disabled as NonDisabledCampaignStatus,
    publishedAt: toIsoString(row.published_at),
    firstPublishedAt: toIsoString(row.first_published_at),
    archivedAt: toIsoString(row.archived_at),
    disabledAt: toIsoString(row.disabled_at),
    createdAt: toIsoString(row.created_at) || new Date(0).toISOString(),
    updatedAt: toIsoString(row.updated_at) || new Date(0).toISOString(),
    stats: parseCampaignStats(row),
  };
}

function mapCampaignEventRow(row: Record<string, unknown>): CampaignEvent {
  return {
    id: String(row.id),
    campaignId: String(row.campaign_id),
    type: row.event_type as CampaignEventType,
    metadata: (row.metadata as Record<string, unknown> | null) ?? null,
    requestIpHash: row.request_ip_hash == null ? null : String(row.request_ip_hash),
    userAgent: row.user_agent == null ? null : String(row.user_agent),
    referrer: row.referrer == null ? null : String(row.referrer),
    createdAt: toIsoString(row.created_at) || new Date(0).toISOString(),
  };
}

function assertObjectPayload(value: unknown, message: string) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new CampaignValidationError(message);
  }
}

function normalizeRequiredString(value: unknown, fieldName: string) {
  if (typeof value !== 'string' || !value.trim()) {
    throw new CampaignValidationError(`${fieldName} is required.`);
  }

  return value.trim();
}

function normalizeOptionalString(value: unknown, fieldName: string) {
  if (value == null) {
    return null;
  }

  if (typeof value !== 'string') {
    throw new CampaignValidationError(`${fieldName} must be a string.`);
  }

  const trimmedValue = value.trim();
  return trimmedValue ? trimmedValue : null;
}

function normalizeOptionalMarkdown(value: unknown, fieldName: string) {
  if (value == null) {
    return null;
  }

  if (typeof value !== 'string') {
    throw new CampaignValidationError(`${fieldName} must be a string.`);
  }

  return value.trim() ? value : null;
}

export function normalizeCampaignSlug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-');
}

function normalizeCreateCampaignInput(input: CreateCampaignRequest) {
  assertObjectPayload(input, 'Campaign request body must be an object.');

  const title = normalizeRequiredString(input.title, 'title');
  const slug =
    typeof input.slug === 'string' && input.slug.trim()
      ? normalizeCampaignSlug(input.slug)
      : null;

  if (typeof input.slug === 'string' && input.slug.trim() && !slug) {
    throw new CampaignValidationError('slug must contain letters or numbers.');
  }

  return {
    title,
    slug,
    summary: normalizeOptionalString(input.summary, 'summary'),
    bodyMarkdown: normalizeOptionalMarkdown(input.bodyMarkdown, 'bodyMarkdown'),
    organizationName: normalizeOptionalString(input.organizationName, 'organizationName'),
    organizationUrl: normalizeOptionalString(input.organizationUrl, 'organizationUrl'),
  };
}

function normalizeUpdateCampaignInput(input: UpdateCampaignRequest) {
  assertObjectPayload(input, 'Campaign request body must be an object.');

  const normalized: Partial<NewCampaignRecord> = {};

  if (Object.prototype.hasOwnProperty.call(input, 'title')) {
    normalized.title = normalizeRequiredString(input.title, 'title');
  }

  if (Object.prototype.hasOwnProperty.call(input, 'slug')) {
    if (typeof input.slug !== 'string' || !input.slug.trim()) {
      throw new CampaignValidationError('slug is required.');
    }

    normalized.slug = normalizeCampaignSlug(input.slug);

    if (!normalized.slug) {
      throw new CampaignValidationError('slug must contain letters or numbers.');
    }
  }

  if (Object.prototype.hasOwnProperty.call(input, 'summary')) {
    normalized.summary = normalizeOptionalString(input.summary, 'summary');
  }

  if (Object.prototype.hasOwnProperty.call(input, 'bodyMarkdown')) {
    normalized.bodyMarkdown = normalizeOptionalMarkdown(input.bodyMarkdown, 'bodyMarkdown');
  }

  if (Object.prototype.hasOwnProperty.call(input, 'organizationName')) {
    normalized.organizationName = normalizeOptionalString(input.organizationName, 'organizationName');
  }

  if (Object.prototype.hasOwnProperty.call(input, 'organizationUrl')) {
    normalized.organizationUrl = normalizeOptionalString(input.organizationUrl, 'organizationUrl');
  }

  return normalized;
}

function stripInternalCampaign(campaign: CampaignRecord): Campaign {
  const { statusBeforeDisabled: _statusBeforeDisabled, ...publicCampaign } = campaign;
  return publicCampaign;
}

function toPublicCampaign(campaign: Campaign): PublicCampaign {
  return {
    id: campaign.id,
    title: campaign.title,
    slug: campaign.slug,
    summary: campaign.summary,
    bodyMarkdown: campaign.bodyMarkdown,
    organizationName: campaign.organizationName,
    organizationUrl: campaign.organizationUrl,
    status: 'published',
    publishedAt: campaign.publishedAt,
    firstPublishedAt: campaign.firstPublishedAt,
    createdAt: campaign.createdAt,
    updatedAt: campaign.updatedAt,
    stats: campaign.stats,
  };
}

function isUniqueViolation(err: unknown) {
  return typeof err === 'object' && err !== null && (err as { code?: unknown }).code === '23505';
}

function generateRandomCampaignSlug() {
  return crypto.randomBytes(RANDOM_CAMPAIGN_SLUG_BYTE_LENGTH).toString('hex');
}

function isSuccessfulSubmission(submission: CampaignMessageSubmission) {
  const normalizedStatus = submission.deliveryStatus.trim().toLowerCase();
  return !submission.deliveryError && normalizedStatus !== 'error' && normalizedStatus !== 'failed';
}

export function createCampaignService(repository: CampaignRepository): CampaignService {
  async function createUniqueCampaignSlug() {
    for (let attempt = 0; attempt < RANDOM_CAMPAIGN_SLUG_MAX_ATTEMPTS; attempt += 1) {
      const slug = generateRandomCampaignSlug();

      if (!(await repository.findBySlug(slug))) {
        return slug;
      }
    }

    throw new CampaignConflictError('Unable to generate a unique campaign slug.');
  }

  async function requireOwnedCampaign(actor: CampaignActor, campaignId: string) {
    const campaign = await repository.findById(campaignId);

    if (!campaign || campaign.organizerUserId !== actor.userId) {
      throw new CampaignNotFoundError();
    }

    return campaign;
  }

  async function requireCampaign(campaignId: string) {
    const campaign = await repository.findById(campaignId);

    if (!campaign) {
      throw new CampaignNotFoundError();
    }

    return campaign;
  }

  async function requirePublishedCampaignBySlug(slug: string) {
    const normalizedSlug = normalizeCampaignSlug(slug);
    const campaign = await repository.findBySlug(normalizedSlug);

    if (!campaign || campaign.status !== 'published') {
      throw new CampaignNotFoundError();
    }

    return campaign;
  }

  return {
    async listOrganizerCampaigns(actor) {
      const campaigns = await repository.listByOrganizer(actor.userId);
      return campaigns.map(stripInternalCampaign);
    },

    async createCampaign(actor, input) {
      const normalizedInput = normalizeCreateCampaignInput(input);
      const campaign = await repository.create({
        organizerUserId: actor.userId,
        organizerEmail: actor.email,
        ...normalizedInput,
        slug: normalizedInput.slug ?? (await createUniqueCampaignSlug()),
      });

      return stripInternalCampaign(campaign);
    },

    async getOrganizerCampaign(actor, campaignId) {
      return stripInternalCampaign(await requireOwnedCampaign(actor, campaignId));
    },

    async updateCampaign(actor, campaignId, input) {
      const campaign = await requireOwnedCampaign(actor, campaignId);

      if (campaign.status === 'disabled') {
        throw new CampaignStateError('Disabled campaigns cannot be edited.');
      }

      const normalizedUpdates = normalizeUpdateCampaignInput(input);

      if (
        normalizedUpdates.slug &&
        (campaign.status !== 'draft' || campaign.firstPublishedAt !== null)
      ) {
        throw new CampaignStateError('Campaign slugs can only be edited while the campaign is still a draft.');
      }

      const updatedCampaign = await repository.update({
        ...campaign,
        ...normalizedUpdates,
      });

      return stripInternalCampaign(updatedCampaign);
    },

    async publishCampaign(actor, campaignId) {
      const campaign = await requireOwnedCampaign(actor, campaignId);

      if (campaign.status === 'disabled') {
        throw new CampaignStateError('Disabled campaigns cannot be published.');
      }

      if (campaign.status === 'published') {
        return stripInternalCampaign(campaign);
      }

      if (campaign.status !== 'draft') {
        throw new CampaignStateError('Only draft campaigns can be published.');
      }

      const publishedAt = new Date().toISOString();
      const updatedCampaign = await repository.update({
        ...campaign,
        status: 'published',
        statusBeforeDisabled: 'published',
        publishedAt,
        firstPublishedAt: campaign.firstPublishedAt || publishedAt,
        archivedAt: null,
        disabledAt: null,
      });

      return stripInternalCampaign(updatedCampaign);
    },

    async archiveCampaign(actor, campaignId) {
      const campaign = await requireOwnedCampaign(actor, campaignId);

      if (campaign.status === 'disabled') {
        throw new CampaignStateError('Disabled campaigns cannot be archived.');
      }

      if (campaign.status === 'archived') {
        return stripInternalCampaign(campaign);
      }

      const archivedAt = new Date().toISOString();
      const updatedCampaign = await repository.update({
        ...campaign,
        status: 'archived',
        statusBeforeDisabled: 'archived',
        archivedAt,
      });

      return stripInternalCampaign(updatedCampaign);
    },

    async listAdminCampaigns() {
      const campaigns = await repository.listAll();
      return campaigns.map(stripInternalCampaign);
    },

    async disableCampaign(campaignId) {
      const campaign = await requireCampaign(campaignId);

      if (campaign.status === 'disabled') {
        return stripInternalCampaign(campaign);
      }

      const updatedCampaign = await repository.update({
        ...campaign,
        status: 'disabled',
        statusBeforeDisabled: campaign.status,
        disabledAt: new Date().toISOString(),
      });

      return stripInternalCampaign(updatedCampaign);
    },

    async restoreCampaign(campaignId) {
      const campaign = await requireCampaign(campaignId);

      if (campaign.status !== 'disabled') {
        throw new CampaignStateError('Only disabled campaigns can be restored.');
      }

      const updatedCampaign = await repository.update({
        ...campaign,
        status: campaign.statusBeforeDisabled,
        disabledAt: null,
      });

      return stripInternalCampaign(updatedCampaign);
    },

    async getPublicCampaignBySlug(slug) {
      const campaign = stripInternalCampaign(await requirePublishedCampaignBySlug(slug));
      return toPublicCampaign(campaign);
    },

    async recordPublicCampaignEvent(slug, input, context) {
      const campaign = await requirePublishedCampaignBySlug(slug);

      assertObjectPayload(input, 'Campaign event request body must be an object.');

      if (input.type !== 'page_view' && input.type !== 'flow_start') {
        throw new CampaignValidationError('Campaign event type must be page_view or flow_start.');
      }

      if (input.metadata != null && (typeof input.metadata !== 'object' || Array.isArray(input.metadata))) {
        throw new CampaignValidationError('Campaign event metadata must be an object.');
      }

      return repository.createEvent({
        campaignId: campaign.id,
        type: input.type,
        metadata: input.metadata ?? null,
        requestIpHash: hashIpAddress(context?.requestIp),
        userAgent: context?.userAgent || null,
        referrer: context?.referrer || null,
      });
    },
  };
}

const CAMPAIGN_SELECT_SQL = `
  select
    c.id,
    c.organizer_user_id,
    c.organizer_email,
    c.title,
    c.slug,
    c.summary,
    c.body_markdown,
    c.organization_name,
    c.organization_url,
    c.status,
    c.status_before_disabled,
    c.published_at,
    c.first_published_at,
    c.archived_at,
    c.disabled_at,
    c.created_at,
    c.updated_at,
    coalesce(event_stats.page_views, 0)::integer as page_views,
    coalesce(event_stats.flow_starts, 0)::integer as flow_starts,
    coalesce(message_stats.people_taken_action, 0)::integer as people_taken_action,
    coalesce(message_stats.total_messages_sent, 0)::integer as total_messages_sent
  from public.campaigns c
  left join lateral (
    select
      count(*) filter (where ce.event_type = 'page_view')::integer as page_views,
      count(*) filter (where ce.event_type = 'flow_start')::integer as flow_starts
    from public.campaign_events ce
    where ce.campaign_id = c.id
  ) event_stats on true
  left join lateral (
    select
      count(distinct ms.batch_id) filter (
        where ms.delivery_error is null
          and lower(ms.delivery_status) not in ('error', 'failed')
          and (ms.campaign_uuid = c.id::text or ms.campaign_tag = c.slug)
      )::integer as people_taken_action,
      count(*) filter (
        where ms.delivery_error is null
          and lower(ms.delivery_status) not in ('error', 'failed')
          and (ms.campaign_uuid = c.id::text or ms.campaign_tag = c.slug)
      )::integer as total_messages_sent
    from public.message_submissions ms
  ) message_stats on true
`;

export function createPostgresCampaignRepository(getPool: () => PgPool | null = getPostgresPool): CampaignRepository {
  function requirePool() {
    const pool = getPool();

    if (!pool) {
      throw new CampaignConfigurationError('Campaign storage is not configured.');
    }

    return pool;
  }

  async function selectCampaigns(whereClause = '', values: unknown[] = []) {
    const pool = requirePool();
    const result = await pool.query(`${CAMPAIGN_SELECT_SQL} ${whereClause}`, values);
    return result.rows.map((row) => mapCampaignRow(row as Record<string, unknown>));
  }

  async function selectCampaignById(id: string) {
    const [campaign] = await selectCampaigns('where c.id = $1 limit 1', [id]);
    return campaign || null;
  }

  return {
    async listByOrganizer(organizerUserId) {
      return selectCampaigns('where c.organizer_user_id = $1 order by c.created_at desc', [organizerUserId]);
    },

    async listAll() {
      return selectCampaigns('order by c.created_at desc');
    },

    async findById(id) {
      return selectCampaignById(id);
    },

    async findBySlug(slug) {
      const [campaign] = await selectCampaigns('where c.slug = $1 limit 1', [slug]);
      return campaign || null;
    },

    async create(input) {
      const pool = requirePool();

      try {
        const result = await pool.query(
          `
            insert into public.campaigns (
              organizer_user_id,
              organizer_email,
              title,
              slug,
              summary,
              body_markdown,
              organization_name,
              organization_url,
              status,
              status_before_disabled
            ) values (
              $1, $2, $3, $4, $5, $6, $7, $8, 'draft', 'draft'
            )
            returning id
          `,
          [
            input.organizerUserId,
            input.organizerEmail,
            input.title,
            input.slug,
            input.summary,
            input.bodyMarkdown,
            input.organizationName,
            input.organizationUrl,
          ]
        );

        return (await selectCampaignById(String(result.rows[0]?.id))) as CampaignRecord;
      } catch (err) {
        if (isUniqueViolation(err)) {
          throw new CampaignConflictError('Campaign slug is already in use.');
        }

        throw err;
      }
    },

    async update(campaign) {
      const pool = requirePool();

      try {
        await pool.query(
          `
            update public.campaigns
            set
              title = $2,
              slug = $3,
              summary = $4,
              body_markdown = $5,
              organization_name = $6,
              organization_url = $7,
              status = $8,
              status_before_disabled = $9,
              published_at = $10,
              first_published_at = $11,
              archived_at = $12,
              disabled_at = $13,
              updated_at = now()
            where id = $1
          `,
          [
            campaign.id,
            campaign.title,
            campaign.slug,
            campaign.summary,
            campaign.bodyMarkdown,
            campaign.organizationName,
            campaign.organizationUrl,
            campaign.status,
            campaign.statusBeforeDisabled,
            campaign.publishedAt,
            campaign.firstPublishedAt,
            campaign.archivedAt,
            campaign.disabledAt,
          ]
        );

        return (await selectCampaignById(campaign.id)) as CampaignRecord;
      } catch (err) {
        if (isUniqueViolation(err)) {
          throw new CampaignConflictError('Campaign slug is already in use.');
        }

        throw err;
      }
    },

    async createEvent(event) {
      const pool = requirePool();
      const result = await pool.query(
        `
          insert into public.campaign_events (
            campaign_id,
            event_type,
            metadata,
            request_ip_hash,
            user_agent,
            referrer
          ) values (
            $1, $2, $3, $4, $5, $6
          )
          returning
            id,
            campaign_id,
            event_type,
            metadata,
            request_ip_hash,
            user_agent,
            referrer,
            created_at
        `,
        [
          event.campaignId,
          event.type,
          event.metadata,
          event.requestIpHash,
          event.userAgent,
          event.referrer,
        ]
      );

      return mapCampaignEventRow(result.rows[0] as Record<string, unknown>);
    },
  };
}

export function matchesCampaignSubmission(
  campaign: Pick<Campaign, 'id' | 'slug'>,
  submission: Pick<CampaignMessageSubmission, 'campaignUuid' | 'campaignTag'>
) {
  return submission.campaignUuid === campaign.id || submission.campaignTag === campaign.slug;
}

export function aggregateCampaignStats(
  campaign: Pick<Campaign, 'id' | 'slug'>,
  events: Array<Pick<CampaignEvent, 'campaignId' | 'type'>>,
  submissions: CampaignMessageSubmission[]
) {
  const matchingEvents = events.filter((event) => event.campaignId === campaign.id);
  const matchingSubmissions = submissions.filter(
    (submission) => matchesCampaignSubmission(campaign, submission) && isSuccessfulSubmission(submission)
  );

  return {
    pageViews: matchingEvents.filter((event) => event.type === 'page_view').length,
    flowStarts: matchingEvents.filter((event) => event.type === 'flow_start').length,
    peopleTakenAction: new Set(matchingSubmissions.map((submission) => submission.batchId)).size,
    totalMessagesSent: matchingSubmissions.length,
  };
}

export { defaultCampaignStats, isSuccessfulSubmission };
