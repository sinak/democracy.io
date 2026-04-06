import axios from 'axios';
import { config } from '../config.js';
import { logger } from '../logger.js';

const smartyStreetsApi = axios.create({
  baseURL: config.smartyStreets.addressUrl,
  params: {
    'auth-id': config.smartyStreets.id,
    'auth-token': config.smartyStreets.token,
  },
});

smartyStreetsApi.interceptors.response.use(
  (res) => {
    logger.http(`[SmartyStreets] ${res.config.method?.toUpperCase()} ${res.config.url} ${res.status}`);
    return res;
  },
  (error) => {
    if (error.response) {
      logger.http(`[SmartyStreets] ${error.config?.method?.toUpperCase()} ${error.config?.url} ${error.response.status}`);
    }
    return Promise.reject(error);
  }
);

export function verifyAddress(address: string) {
  return smartyStreetsApi.get('/street-address', {
    params: { street: address },
  });
}
