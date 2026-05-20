import type {
  Campaign,
  CreateCampaignRequest,
  UpdateCampaignRequest,
  CampaignStatus,
} from '../types.ts';
import { buildCampaignPath, isReservedCampaignSlug } from './campaign-path';

export interface CampaignEditorValues {
  title: string;
  slug: string;
  organizationName: string;
  organizationUrl: string;
  descriptionMarkdown: string;
  suggestedSubject: string;
  suggestedMessage: string;
  backgroundImageUrl: string;
}

export type CampaignEditorField = keyof CampaignEditorValues;

export type CampaignEditorErrors = Partial<Record<CampaignEditorField, string>>;

export type CampaignValidationMode = 'draft' | 'publish';

interface StoredCampaignSummary {
  schema: 'campaign-editor/v1';
  suggestedSubject: string;
  suggestedMessage: string;
  backgroundImageUrl: string;
}

interface ParseableCampaignRecord {
  bodyMarkdown: string | null;
  summary: string | null;
  slug: string;
  title: string;
  organizationName: string | null;
  organizationUrl: string | null;
}

const CAMPAIGN_SUMMARY_SCHEMA = 'campaign-editor/v1';
const HTTP_PROTOCOLS = new Set(['http:', 'https:']);
const MARKDOWN_IMAGE_PATTERN =
  /!\[[^\]]*]\(\s*(<[^>]+>|[^)\s]+(?:\s+["'][^"']*["'])?)\s*\)/g;

function normalizeTextValue(value: string) {
  return value.trim();
}

function normalizeMultilineValue(value: string) {
  return value.trim();
}

function toOptionalValue(value: string) {
  const trimmedValue = value.trim();
  return trimmedValue ? trimmedValue : null;
}

function readSummaryPayload(summary: string | null) {
  if (!summary) {
    return null;
  }

  try {
    const parsedValue = JSON.parse(summary) as Partial<StoredCampaignSummary>;

    if (
      parsedValue?.schema !== CAMPAIGN_SUMMARY_SCHEMA ||
      typeof parsedValue.suggestedSubject !== 'string' ||
      typeof parsedValue.suggestedMessage !== 'string' ||
      typeof parsedValue.backgroundImageUrl !== 'string'
    ) {
      return null;
    }

    return parsedValue as StoredCampaignSummary;
  } catch {
    return null;
  }
}

function normalizeMarkdownImageDestination(destination: string) {
  const trimmedDestination = destination.trim();

  if (!trimmedDestination) {
    return '';
  }

  const unwrappedDestination =
    trimmedDestination.startsWith('<') && trimmedDestination.endsWith('>')
      ? trimmedDestination.slice(1, -1)
      : trimmedDestination;

  return unwrappedDestination.split(/\s+/u, 1)[0] ?? '';
}

function isValidHttpUrl(value: string) {
  try {
    const url = new URL(value);
    return HTTP_PROTOCOLS.has(url.protocol);
  } catch {
    return false;
  }
}

export function createEmptyCampaignEditorValues(): CampaignEditorValues {
  return {
    title: '',
    slug: '',
    organizationName: '',
    organizationUrl: '',
    descriptionMarkdown: '',
    suggestedSubject: '',
    suggestedMessage: '',
    backgroundImageUrl: '',
  };
}

export function normalizeCampaignEditorSlug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-');
}

export function normalizeCampaignEditorValues(
  values: CampaignEditorValues
): CampaignEditorValues {
  return {
    title: normalizeTextValue(values.title),
    slug: normalizeCampaignEditorSlug(values.slug),
    organizationName: normalizeTextValue(values.organizationName),
    organizationUrl: normalizeTextValue(values.organizationUrl),
    descriptionMarkdown: normalizeMultilineValue(values.descriptionMarkdown),
    suggestedSubject: normalizeTextValue(values.suggestedSubject),
    suggestedMessage: normalizeMultilineValue(values.suggestedMessage),
    backgroundImageUrl: normalizeTextValue(values.backgroundImageUrl),
  };
}

export function parseCampaignEditorValues(
  campaign: ParseableCampaignRecord
): CampaignEditorValues {
  const storedSummary = readSummaryPayload(campaign.summary);
  const hasLegacySummary = Boolean(campaign.summary && !storedSummary);
  const descriptionMarkdown =
    campaign.bodyMarkdown ||
    (hasLegacySummary ? campaign.summary?.trim() || '' : '');
  const suggestedSubject =
    storedSummary?.suggestedSubject ||
    (campaign.bodyMarkdown && hasLegacySummary ? campaign.summary?.trim() || '' : '');

  return {
    title: campaign.title,
    slug: campaign.slug,
    organizationName: campaign.organizationName || '',
    organizationUrl: campaign.organizationUrl || '',
    descriptionMarkdown,
    suggestedSubject,
    suggestedMessage: storedSummary?.suggestedMessage || '',
    backgroundImageUrl: storedSummary?.backgroundImageUrl || '',
  };
}

export function serializeCampaignEditorRequest(
  values: CampaignEditorValues,
  options?: { includeSlug?: boolean }
): CreateCampaignRequest {
  const normalizedValues = normalizeCampaignEditorValues(values);
  const includeSlug = options?.includeSlug ?? true;

  const summaryPayload = JSON.stringify({
    schema: CAMPAIGN_SUMMARY_SCHEMA,
    suggestedSubject: normalizedValues.suggestedSubject,
    suggestedMessage: normalizedValues.suggestedMessage,
    backgroundImageUrl: normalizedValues.backgroundImageUrl,
  } satisfies StoredCampaignSummary);

  const request: CreateCampaignRequest = {
    title: normalizedValues.title,
    summary: summaryPayload,
    bodyMarkdown: toOptionalValue(normalizedValues.descriptionMarkdown),
    organizationName: toOptionalValue(normalizedValues.organizationName),
    organizationUrl: toOptionalValue(normalizedValues.organizationUrl),
  };

  if (includeSlug && normalizedValues.slug) {
    request.slug = normalizedValues.slug;
  }

  return request;
}

export function toCampaignUpdateRequest(
  values: CampaignEditorValues
): UpdateCampaignRequest {
  return serializeCampaignEditorRequest(values);
}

export function extractMarkdownImageUrls(markdown: string) {
  const urls: string[] = [];

  for (const match of markdown.matchAll(MARKDOWN_IMAGE_PATTERN)) {
    const destination = normalizeMarkdownImageDestination(match[1] || '');

    if (destination) {
      urls.push(destination);
    }
  }

  return urls;
}

export function containsRawHtml(markdown: string) {
  return /<([a-z][a-z0-9-]*)(\s[^>]*)?>/i.test(markdown);
}

export function validateCampaignEditor(
  values: CampaignEditorValues,
  mode: CampaignValidationMode,
  options?: {
    requireSlug?: boolean;
  }
) {
  const normalizedValues = normalizeCampaignEditorValues(values);
  const requireSlug = options?.requireSlug ?? true;
  const fieldErrors: CampaignEditorErrors = {};
  const nextNormalizedValues = normalizedValues;

  if (!normalizedValues.title) {
    fieldErrors.title = 'Add a campaign title.';
  }

  if (requireSlug && !normalizedValues.slug) {
    fieldErrors.slug = 'Add a campaign slug.';
  }

  if (normalizedValues.slug && isReservedCampaignSlug(normalizedValues.slug)) {
    fieldErrors.slug = 'That public path is reserved. Choose a different slug.';
  }

  if (
    normalizedValues.organizationUrl &&
    !isValidHttpUrl(normalizedValues.organizationUrl)
  ) {
    fieldErrors.organizationUrl = 'Use a full http or https URL.';
  }

  if (
    normalizedValues.backgroundImageUrl &&
    !isValidHttpUrl(normalizedValues.backgroundImageUrl)
  ) {
    fieldErrors.backgroundImageUrl = 'Use a full http or https URL.';
  }

  if (
    extractMarkdownImageUrls(normalizedValues.descriptionMarkdown).some(
      (imageUrl) => !isValidHttpUrl(imageUrl)
    )
  ) {
    fieldErrors.descriptionMarkdown =
      'Markdown images must use full http or https URLs.';
  }

  if (mode === 'publish') {
    if (!normalizedValues.descriptionMarkdown) {
      fieldErrors.descriptionMarkdown = 'Add a campaign description.';
    }
  }

  return {
    fieldErrors,
    isValid: Object.keys(fieldErrors).length === 0,
    normalizedValues: nextNormalizedValues,
    hasRawHtml: containsRawHtml(normalizedValues.descriptionMarkdown),
  };
}

export function buildCampaignPublicUrl(
  slug: string,
  origin = window.location.origin
) {
  return new URL(buildCampaignPath(slug), origin).toString();
}

export function summarizeCampaignRecord(campaign: ParseableCampaignRecord) {
  const values = parseCampaignEditorValues(campaign);
  return summarizeCampaignValues(values);
}

export function summarizeCampaignValues(values: CampaignEditorValues) {
  const candidate =
    values.descriptionMarkdown || values.suggestedMessage || values.suggestedSubject;

  if (!candidate) {
    return 'No description has been added yet.';
  }

  const plainText = candidate
    .replace(MARKDOWN_IMAGE_PATTERN, ' ')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '$1')
    .replace(/[*_~`>#-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (!plainText) {
    return 'No description has been added yet.';
  }

  return plainText.length > 180
    ? `${plainText.slice(0, 177).trimEnd()}...`
    : plainText;
}

export function isCampaignSlugLocked(campaign: Pick<Campaign, 'firstPublishedAt'> | null) {
  return Boolean(campaign?.firstPublishedAt);
}

export function getCampaignStatusLabel(campaign: Pick<Campaign, 'status'>) {
  if (campaign.status === 'disabled') {
    return 'Disabled by admin';
  }

  if (campaign.status === 'archived') {
    return 'Disabled';
  }

  if (campaign.status === 'published') {
    return 'Enabled';
  }

  return 'Not enabled';
}

export function getCampaignModerationActionLabel(status: CampaignStatus) {
  return status === 'disabled' ? 'Restore' : 'Disable';
}

export function canCopyCampaignPublicUrl(campaign: Pick<Campaign, 'firstPublishedAt'> | null) {
  return Boolean(campaign?.firstPublishedAt);
}
