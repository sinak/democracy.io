import crypto from 'node:crypto';
import { config } from '../config.js';

export function hashIpAddress(ipAddress?: string) {
  if (!ipAddress) {
    return null;
  }

  return crypto.pbkdf2Sync(ipAddress, config.ipSalt, 10_000, 32, 'sha256').toString('base64');
}
