import {
  isSupabaseConfigured,
  supabaseProjectUrl,
  supabasePublicAnonKey,
} from '../lib/supabase-browser.ts';

const CAMPAIGN_ASSET_BUCKET = 'campaign-assets';

function sanitizeFilename(value: string) {
  const normalizedValue = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, '-')
    .replace(/-{2,}/g, '-')
    .replace(/^-+|-+$/g, '');

  return normalizedValue || 'background-image';
}

function encodeStoragePath(value: string) {
  return value
    .split('/')
    .map((segment) => encodeURIComponent(segment))
    .join('/');
}

function buildStorageErrorMessage(payload: unknown, status: number) {
  if (
    typeof payload === 'object' &&
    payload !== null &&
    'message' in payload &&
    typeof payload.message === 'string'
  ) {
    return payload.message;
  }

  return `Storage upload failed (${status}).`;
}

function createAssetId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }

  return `${Date.now()}`;
}

export function buildCampaignAssetObjectPath(userId: string, filename: string) {
  return `${userId}/${createAssetId()}-${sanitizeFilename(filename)}`;
}

export function buildCampaignAssetPublicUrl(objectPath: string) {
  return `${supabaseProjectUrl}/storage/v1/object/public/${CAMPAIGN_ASSET_BUCKET}/${encodeStoragePath(objectPath)}`;
}

export async function uploadCampaignBackgroundImage({
  accessToken,
  file,
  userId,
}: {
  accessToken: string;
  file: File;
  userId: string;
}) {
  if (!isSupabaseConfigured || !supabaseProjectUrl || !supabasePublicAnonKey) {
    throw new Error('Supabase storage is not configured for the frontend.');
  }

  const objectPath = buildCampaignAssetObjectPath(userId, file.name || 'background-image');
  const uploadUrl = `${supabaseProjectUrl}/storage/v1/object/${CAMPAIGN_ASSET_BUCKET}/${encodeStoragePath(objectPath)}`;
  const response = await fetch(uploadUrl, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      apikey: supabasePublicAnonKey,
      'Content-Type': file.type || 'application/octet-stream',
      'x-upsert': 'true',
    },
    body: file,
  });

  if (!response.ok) {
    let payload: unknown = null;

    try {
      payload = await response.json();
    } catch {
      payload = null;
    }

    throw new Error(buildStorageErrorMessage(payload, response.status));
  }

  return {
    objectPath,
    publicUrl: buildCampaignAssetPublicUrl(objectPath),
  };
}
