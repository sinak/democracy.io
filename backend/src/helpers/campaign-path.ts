const RESERVED_CAMPAIGN_SLUGS = new Set([
  'admin',
  'api',
  'auth',
  'campaigns',
  'captcha',
  'compose',
  'health',
  'location',
  'organizer',
  'privacy-policy',
  'thanks',
]);

export function isReservedCampaignSlug(slug: string) {
  return RESERVED_CAMPAIGN_SLUGS.has(slug);
}
