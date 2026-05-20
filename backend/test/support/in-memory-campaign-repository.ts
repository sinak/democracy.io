import crypto from 'node:crypto';
import {
  CampaignConflictError,
  aggregateCampaignStats,
  defaultCampaignStats,
  type CampaignMessageSubmission,
  type CampaignRecord,
  type CampaignRepository,
} from '../../src/services/campaigns.js';
import type { Campaign, CampaignEvent, CampaignEventType, CampaignStatus } from '../../src/types.js';

interface SeedCampaignInput {
  id?: string;
  organizerUserId?: string;
  organizerEmail?: string;
  title: string;
  slug: string;
  summary?: string | null;
  bodyMarkdown?: string | null;
  organizationName?: string | null;
  organizationUrl?: string | null;
  status?: CampaignStatus;
  statusBeforeDisabled?: CampaignRecord['statusBeforeDisabled'];
  publishedAt?: string | null;
  firstPublishedAt?: string | null;
  archivedAt?: string | null;
  disabledAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

interface SeedCampaignEventInput {
  campaignId: string;
  type: CampaignEventType;
  metadata?: Record<string, unknown> | null;
  requestIpHash?: string | null;
  userAgent?: string | null;
  referrer?: string | null;
  createdAt?: string;
}

export interface InMemoryCampaignRepository extends CampaignRepository {
  seedCampaign(input: SeedCampaignInput): CampaignRecord;
  seedEvent(input: SeedCampaignEventInput): CampaignEvent;
  seedSubmission(input: CampaignMessageSubmission): void;
}

export function createInMemoryCampaignRepository(): InMemoryCampaignRepository {
  const campaigns = new Map<string, CampaignRecord>();
  let events: CampaignEvent[] = [];
  const submissions: CampaignMessageSubmission[] = [];

  function hydrateCampaign(campaign: CampaignRecord): CampaignRecord {
    return {
      ...campaign,
      stats: aggregateCampaignStats(campaign, events, submissions),
    };
  }

  function ensureUniqueSlug(slug: string, currentCampaignId?: string) {
    const normalizedSlug = slug.toLowerCase();

    for (const campaign of campaigns.values()) {
      if (campaign.slug.toLowerCase() === normalizedSlug && campaign.id !== currentCampaignId) {
        throw new CampaignConflictError('Campaign slug is already in use.');
      }
    }
  }

  function buildCampaignRecord(input: SeedCampaignInput): CampaignRecord {
    const now = new Date().toISOString();

    return {
      id: input.id || crypto.randomUUID(),
      organizerUserId: input.organizerUserId || 'user-1',
      organizerEmail: input.organizerEmail || 'user@example.com',
      title: input.title,
      slug: input.slug,
      summary: input.summary ?? null,
      bodyMarkdown: input.bodyMarkdown ?? null,
      organizationName: input.organizationName ?? null,
      organizationUrl: input.organizationUrl ?? null,
      status: input.status || 'draft',
      statusBeforeDisabled: input.statusBeforeDisabled || (input.status === 'disabled' ? 'draft' : input.status || 'draft'),
      publishedAt: input.publishedAt ?? null,
      firstPublishedAt: input.firstPublishedAt ?? null,
      archivedAt: input.archivedAt ?? null,
      disabledAt: input.disabledAt ?? null,
      createdAt: input.createdAt || now,
      updatedAt: input.updatedAt || input.createdAt || now,
      stats: defaultCampaignStats(),
    };
  }

  const repository = {
    async listByOrganizer(organizerUserId) {
      return Array.from(campaigns.values())
        .filter((campaign) => campaign.organizerUserId === organizerUserId)
        .sort((left, right) => right.createdAt.localeCompare(left.createdAt))
        .map(hydrateCampaign);
    },

    async listAll() {
      return Array.from(campaigns.values())
        .sort((left, right) => right.createdAt.localeCompare(left.createdAt))
        .map(hydrateCampaign);
    },

    async findById(id) {
      const campaign = campaigns.get(id);
      return campaign ? hydrateCampaign(campaign) : null;
    },

    async findBySlug(slug) {
      const normalizedSlug = slug.toLowerCase();
      const campaign =
        Array.from(campaigns.values()).find(
          (entry) => entry.slug.toLowerCase() === normalizedSlug
        ) || null;
      return campaign ? hydrateCampaign(campaign) : null;
    },

    async create(input) {
      ensureUniqueSlug(input.slug);

      const campaign = buildCampaignRecord({
        title: input.title,
        slug: input.slug,
        summary: input.summary,
        bodyMarkdown: input.bodyMarkdown,
        organizationName: input.organizationName,
        organizationUrl: input.organizationUrl,
        organizerUserId: input.organizerUserId,
        organizerEmail: input.organizerEmail,
        status: 'draft',
        statusBeforeDisabled: 'draft',
      });

      campaigns.set(campaign.id, campaign);
      return hydrateCampaign(campaign);
    },

    async update(campaign) {
      if (!campaigns.has(campaign.id)) {
        throw new Error('Campaign not found in repository.');
      }

      ensureUniqueSlug(campaign.slug, campaign.id);

      const updatedCampaign = {
        ...campaign,
        updatedAt: new Date().toISOString(),
      };

      campaigns.set(updatedCampaign.id, updatedCampaign);
      return hydrateCampaign(updatedCampaign);
    },

    async delete(id) {
      campaigns.delete(id);
      events = events.filter((event) => event.campaignId !== id);
    },

    async createEvent(event) {
      const createdEvent: CampaignEvent = {
        id: crypto.randomUUID(),
        campaignId: event.campaignId,
        type: event.type,
        metadata: event.metadata,
        requestIpHash: event.requestIpHash,
        userAgent: event.userAgent,
        referrer: event.referrer,
        createdAt: new Date().toISOString(),
      };

      events.push(createdEvent);
      return createdEvent;
    },

    seedCampaign(input) {
      ensureUniqueSlug(input.slug, input.id);
      const campaign = buildCampaignRecord(input);
      campaigns.set(campaign.id, campaign);
      return hydrateCampaign(campaign);
    },

    seedEvent(input) {
      const event: CampaignEvent = {
        id: crypto.randomUUID(),
        campaignId: input.campaignId,
        type: input.type,
        metadata: input.metadata ?? null,
        requestIpHash: input.requestIpHash ?? null,
        userAgent: input.userAgent ?? null,
        referrer: input.referrer ?? null,
        createdAt: input.createdAt || new Date().toISOString(),
      };

      events.push(event);
      return event;
    },

    seedSubmission(input) {
      submissions.push(input);
    },
  } satisfies InMemoryCampaignRepository;

  return repository;
}

export function buildPublishedCampaignSeed(overrides: Partial<SeedCampaignInput> = {}): SeedCampaignInput {
  const publishedAt = overrides.publishedAt || new Date().toISOString();

  return {
    title: 'Published campaign',
    slug: 'published-campaign',
    status: 'published',
    statusBeforeDisabled: 'published',
    publishedAt,
    firstPublishedAt: overrides.firstPublishedAt || publishedAt,
    ...overrides,
  };
}
