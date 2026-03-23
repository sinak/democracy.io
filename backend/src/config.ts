import 'dotenv/config';

export const config = {
  port: parseInt(process.env.PORT || '3001', 10),

  smartyStreets: {
    addressUrl: process.env.SMARTY_STREETS_ADDRESS_URL || 'https://us-street.api.smartystreets.com',
    id: process.env.SMARTY_STREETS_ID || '',
    token: process.env.SMARTY_STREETS_TOKEN || '',
  },

  potc: {
    baseUrl: process.env.POTC_BASE_URL || 'https://congressforms.eff.org',
    debugKey: process.env.POTC_DEBUG_KEY || '',
  },

  effCivicCrm: {
    url: process.env.EFF_CIVIC_CRM_URL || 'https://supporters.eff.org',
    siteKey: process.env.EFF_CIVIC_CRM_SITE_KEY || '',
  },

  ipSalt: process.env.IP_SALT || 'default-salt',
  campaignTag: process.env.CAMPAIGN_TAG || 'democracy.io',
};
