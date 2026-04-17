import { parseCampaignEditorValues } from './campaign-editor';
import { buildCampaignPath } from './campaign-path';
import type { PublicCampaign } from '../types';

export interface PublicCampaignContent {
  descriptionMarkdown: string;
  suggestedSubject: string;
  suggestedMessage: string;
  backgroundImageUrl: string;
}

export interface ComposeDraftFields {
  subject?: string;
  message?: string;
}

export function getCampaignEntryPath(
  campaign: Pick<PublicCampaign, 'slug'> | null
) {
  return campaign ? buildCampaignPath(campaign.slug) : '/';
}

export function getPublicCampaignContent(
  campaign: Pick<
    PublicCampaign,
    'bodyMarkdown' | 'organizationName' | 'organizationUrl' | 'slug' | 'summary' | 'title'
  >
): PublicCampaignContent {
  const values = parseCampaignEditorValues(campaign);

  return {
    descriptionMarkdown: values.descriptionMarkdown,
    suggestedSubject: values.suggestedSubject,
    suggestedMessage: values.suggestedMessage,
    backgroundImageUrl: values.backgroundImageUrl,
  };
}

export function getCampaignComposePrefill(
  formData: ComposeDraftFields,
  campaign: Pick<
    PublicCampaign,
    'bodyMarkdown' | 'organizationName' | 'organizationUrl' | 'slug' | 'summary' | 'title'
  > | null
) {
  if (!campaign) {
    return null;
  }

  if (formData.subject?.trim() || formData.message?.trim()) {
    return null;
  }

  const content = getPublicCampaignContent(campaign);

  if (!content.suggestedSubject && !content.suggestedMessage) {
    return null;
  }

  return {
    subject: formData.subject || content.suggestedSubject,
    message: formData.message || content.suggestedMessage,
  };
}
