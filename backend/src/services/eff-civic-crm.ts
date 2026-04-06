import axios from 'axios';
import { config } from '../config.js';
import { logger } from '../logger.js';

const effCivicCrm = axios.create({
  baseURL: config.effCivicCrm.url,
  params: { site_key: config.effCivicCrm.siteKey || undefined },
});

effCivicCrm.interceptors.response.use(
  (res) => {
    logger.http(`[EFF CRM] ${res.config.method?.toUpperCase()} ${res.config.url} ${res.status}`);
    return res;
  },
  (error) => {
    if (error.response) {
      logger.http(`[EFF CRM] ${error.config?.method?.toUpperCase()} ${error.config?.url} ${error.response.status}`);
    }
    return Promise.reject(error);
  }
);

export function subscribeToEFFMailingList(params: {
  contact_params: { email: string; first_name: string; last_name: string; source: string; subscribe: boolean };
  address_params: { street: string; city: string; state: string; zip: string; country: string };
}) {
  const formData = new URLSearchParams();
  formData.append('method', 'import_contact');
  formData.append('data', JSON.stringify(params));

  return effCivicCrm.post('/civicrm/eff-action-api', formData.toString(), {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  });
}
