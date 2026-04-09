import crypto from 'node:crypto';
import type { Message } from '../types.js';
import { logger } from '../logger.js';
import { getPostgresPool } from './postgres.js';
import { extractErrorMessage } from '../helpers/error-message.js';
import { hashIpAddress } from '../helpers/ip-address.js';

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
  } catch (err) {
    logger.warn(
      `[Message Submissions] Failed to persist ${messages.length} message record(s): ${extractErrorMessage(err)}`
    );
  }
}
