import crypto from 'node:crypto';
import type { Message, MessageResponse } from '../types.js';
import { config } from '../config.js';
import { logger } from '../logger.js';
import { getPostgresPool } from './postgres.js';
import {
  extractDeliveryErrorMessage,
  extractErrorMessage,
  formatDeliveryErrorForStorage,
  formatDeliveryResponseErrorForStorage,
} from '../helpers/error-message.js';

export interface MessageSubmissionResult {
  status: string;
  url?: string;
  uid?: string;
  errorMessage?: string;
}

interface PersistMessageSubmissionsParams {
  endpoint: string;
  messages: Message[];
  results: MessageSubmissionResult[];
  requestIp?: string;
  batchId?: string;
}

const DELIVERY_ERROR_STATUSES = new Set(['error', 'failed', 'failure']);

function hashIpAddress(ipAddress?: string) {
  if (!ipAddress) {
    return null;
  }

  return crypto.pbkdf2Sync(ipAddress, config.ipSalt, 10_000, 32, 'sha256').toString('base64');
}

function isDeliveryErrorStatus(status: string) {
  const normalizedStatus = status.toLowerCase();
  return (
    DELIVERY_ERROR_STATUSES.has(normalizedStatus) ||
    normalizedStatus.includes('error') ||
    normalizedStatus.includes('fail')
  );
}

export function makeMessageSubmissionResult(responseData: MessageResponse): MessageSubmissionResult {
  const status = responseData.status || 'submitted';
  const shouldStoreError = isDeliveryErrorStatus(status) || Boolean(extractDeliveryErrorMessage(responseData));

  return {
    status,
    url: responseData.url,
    uid: responseData.uid,
    errorMessage: shouldStoreError ? formatDeliveryResponseErrorForStorage(responseData) : undefined,
  };
}

export function makeMessageSubmissionErrorResult(err: unknown): MessageSubmissionResult {
  return {
    status: 'error',
    errorMessage: formatDeliveryErrorForStorage(err),
  };
}

export async function persistMessageSubmissions({
  endpoint,
  messages,
  results,
  requestIp,
  batchId = crypto.randomUUID(),
}: PersistMessageSubmissionsParams) {
  const pool = getPostgresPool();
  if (!pool || messages.length === 0) {
    return;
  }

  const requestIpHash = hashIpAddress(requestIp);
  const deliveryErrors = results
    .map((result, index) => ({ result, bioguideId: messages[index]?.bioguideId }))
    .filter(({ result }) => result.status.toLowerCase() === 'error' || result.errorMessage);

  try {
    await Promise.all(
      messages.map((message, index) => {
        const result = results[index] ?? {
          status: 'unknown',
          errorMessage: 'Missing delivery result during message persistence.',
        };

        return pool.query(
          `
            insert into message_submissions (
              batch_id,
              endpoint,
              request_ip_hash,
              bioguide_id,
              recipient_name,
              topic,
              subject,
              message_body,
              subject_length,
              message_length,
              state_abbreviation,
              district,
              county,
              campaign_tag,
              campaign_uuid,
              campaign_org_name,
              campaign_org_url,
              delivery_status,
              delivery_url,
              delivery_uid,
              delivery_error
            ) values (
              $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
              $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21
            )
          `,
          [
            batchId,
            endpoint,
            requestIpHash,
            message.bioguideId,
            message.recipientName ?? null,
            message.topic ?? null,
            message.subject,
            message.message,
            message.subject.length,
            message.message.length,
            message.canonicalAddress.components.stateAbbreviation ?? null,
            message.canonicalAddress.district != null ? String(message.canonicalAddress.district) : null,
            message.sender.county ?? message.canonicalAddress.county ?? null,
            message.campaign.tag ?? null,
            message.campaign.uuid ?? null,
            message.campaign.orgName ?? null,
            message.campaign.orgURL ?? null,
            result.status,
            result.url ?? null,
            result.uid ?? null,
            result.errorMessage ?? null,
          ]
        );
      })
    );

    logger.debug(`[Message Submissions] Stored ${messages.length} message record(s) for batch ${batchId}`);
    if (deliveryErrors.length > 0) {
      const errorSummary = deliveryErrors
        .map(({ result, bioguideId }) => `${bioguideId ?? 'unknown'}=${result.status}`)
        .join(', ');
      logger.warn(`[Message Submissions] Batch ${batchId} recorded delivery error(s): ${errorSummary}`);
    }
  } catch (err) {
    logger.warn(
      `[Message Submissions] Failed to persist ${messages.length} message record(s): ${extractErrorMessage(err)}`
    );
  }
}
