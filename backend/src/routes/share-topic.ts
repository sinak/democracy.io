import axios from 'axios';
import { Router } from 'express';
import { makeError, makeResponse } from '../helpers/response.js';
import {
  ShareTopicServiceError,
  generateShareTopic,
} from '../services/share-topic.js';
import type { ShareTopicRequest } from '../types.js';

const router = Router();

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function parseRequiredString(value: unknown, fieldName: string): string {
  if (typeof value !== 'string' || value.trim() === '') {
    throw new Error(`${fieldName} is required.`);
  }

  return value.trim();
}

function parseOptionalString(value: unknown): string | undefined {
  if (typeof value !== 'string') {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed === '' ? undefined : trimmed;
}

function parseSelectedTopics(value: unknown): string[] | undefined {
  if (value == null) {
    return undefined;
  }

  if (!Array.isArray(value)) {
    throw new Error('selectedTopics must be an array.');
  }

  const topics = value
    .map((topic, index) => parseRequiredString(topic, `selectedTopics item ${index + 1}`))
    .filter(Boolean);

  return topics.length > 0 ? Array.from(new Set(topics)) : undefined;
}

function parseShareTopicRequest(body: unknown): ShareTopicRequest {
  if (!isRecord(body)) {
    throw new Error('Share topic request body must be an object.');
  }

  return {
    message: parseRequiredString(body.message, 'message'),
    subject: parseOptionalString(body.subject),
    selectedTopics: parseSelectedTopics(body.selectedTopics),
  };
}

router.post('/share-topic', async (req, res) => {
  try {
    const request = parseShareTopicRequest(req.body);
    const result = await generateShareTopic(request);
    res.json(makeResponse(result));
  } catch (err) {
    if (err instanceof ShareTopicServiceError) {
      return res.status(err.statusCode).json(makeError({ message: err.message }, err.statusCode));
    }

    if (axios.isAxiosError(err)) {
      const statusCode = err.response?.status || 502;
      const message =
        err.response?.data?.error?.message ||
        err.response?.data?.message ||
        'OpenRouter request failed.';

      return res.status(statusCode).json(makeError({ message }, statusCode));
    }

    const message = err instanceof Error ? err.message : String(err);
    return res.status(400).json(makeError({ message }, 400));
  }
});

export default router;
