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

export function buildCampaignPath(slug: string) {
  return `/${slug}`;
}

export function buildLegacyCampaignPath(slug: string) {
  return `/campaigns/${slug}`;
}

export function isReservedCampaignSlug(slug: string) {
  return RESERVED_CAMPAIGN_SLUGS.has(slug.toLowerCase());
}

export function getCampaignSlugFromPath(path: string) {
  const legacyMatch = path.match(/^\/campaigns\/([^/]+)\/?$/);

  if (legacyMatch?.[1]) {
    return legacyMatch[1];
  }

  const rootMatch = path.match(/^\/([^/]+)\/?$/);

  if (!rootMatch?.[1] || isReservedCampaignSlug(rootMatch[1])) {
    return null;
  }

  return rootMatch[1];
}

export function isCampaignPath(path: string) {
  return Boolean(getCampaignSlugFromPath(path));
}
