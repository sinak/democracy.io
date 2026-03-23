import axios from 'axios';
import { config } from '../config.js';
import { logger } from '../logger.js';

const potcApi = axios.create({
  baseURL: config.potc.baseUrl,
  params: { debug_key: config.potc.debugKey || undefined },
});

potcApi.interceptors.response.use(
  (res) => {
    logger.http(`[POTC] ${res.config.method?.toUpperCase()} ${res.config.url} ${res.status}`);
    return res;
  },
  (error) => {
    if (error.response) {
      logger.http(`[POTC] ${error.config?.method?.toUpperCase()} ${error.config?.url} ${error.response.status}`);
    }
    return Promise.reject(error);
  }
);

export function getFormElementsForRepIdsFromPOTC(bioguideIds: string[]) {
  return potcApi.post('/retrieve-form-elements', { bio_ids: bioguideIds });
}

export function sendMessage(message: any) {
  return potcApi.post('/fill-out-form', message);
}

export function solveCaptcha(solution: any) {
  return potcApi.post('/fill-out-captcha', solution);
}
