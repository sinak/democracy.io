import { apiFetch, type ApiError } from './api-client';
import type {
  Campaign,
  CampaignDetailResponse,
  CampaignEvent,
  CampaignListResponse,
  CreateCampaignEventRequest,
  CreateCampaignRequest,
  PublicCampaign,
  PublicCampaignResponse,
  UpdateCampaignRequest,
} from '../types';

export type CampaignApiError = ApiError;

export function listOrganizerCampaigns(accessToken: string) {
  return apiFetch<CampaignListResponse>('/campaigns', { accessToken }).then(
    (response) => response.campaigns
  );
}

export function createCampaign(accessToken: string, input: CreateCampaignRequest) {
  return apiFetch<CampaignDetailResponse>('/campaigns', {
    method: 'POST',
    body: JSON.stringify(input),
    accessToken,
  }).then((response) => response.campaign);
}

export function getOrganizerCampaign(accessToken: string, campaignId: string) {
  return apiFetch<CampaignDetailResponse>(`/campaigns/${campaignId}`, {
    accessToken,
  }).then((response) => response.campaign);
}

export function updateCampaign(
  accessToken: string,
  campaignId: string,
  input: UpdateCampaignRequest
) {
  return apiFetch<CampaignDetailResponse>(`/campaigns/${campaignId}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
    accessToken,
  }).then((response) => response.campaign);
}

export function publishCampaign(accessToken: string, campaignId: string) {
  return apiFetch<CampaignDetailResponse>(`/campaigns/${campaignId}/publish`, {
    method: 'POST',
    accessToken,
  }).then((response) => response.campaign);
}

export function archiveCampaign(accessToken: string, campaignId: string) {
  return apiFetch<CampaignDetailResponse>(`/campaigns/${campaignId}/archive`, {
    method: 'POST',
    accessToken,
  }).then((response) => response.campaign);
}

export function deleteCampaign(accessToken: string, campaignId: string) {
  return apiFetch<void>(`/campaigns/${campaignId}`, {
    method: 'DELETE',
    accessToken,
  });
}

export function listAdminCampaigns(accessToken: string) {
  return apiFetch<CampaignListResponse>('/admin/campaigns', { accessToken }).then(
    (response) => response.campaigns
  );
}

export function disableCampaign(accessToken: string, campaignId: string) {
  return apiFetch<CampaignDetailResponse>(`/admin/campaigns/${campaignId}/disable`, {
    method: 'POST',
    accessToken,
  }).then((response) => response.campaign);
}

export function restoreCampaign(accessToken: string, campaignId: string) {
  return apiFetch<CampaignDetailResponse>(`/admin/campaigns/${campaignId}/restore`, {
    method: 'POST',
    accessToken,
  }).then((response) => response.campaign);
}

export function getPublicCampaign(slug: string) {
  return apiFetch<PublicCampaignResponse>(`/public/campaigns/${slug}`).then(
    (response) => response.campaign
  );
}

export function recordPublicCampaignEvent(
  slug: string,
  input: CreateCampaignEventRequest
) {
  return apiFetch<{ event: CampaignEvent }>(`/public/campaigns/${slug}/events`, {
    method: 'POST',
    body: JSON.stringify(input),
  }).then((response) => response.event);
}

export async function resolveAdminAccess(accessToken: string) {
  try {
    await listAdminCampaigns(accessToken);
    return true;
  } catch (error) {
    const apiError = error as CampaignApiError;

    if (apiError.code === 401 || apiError.code === 403) {
      return false;
    }

    throw error;
  }
}

export type { Campaign, PublicCampaign };
