import axios from 'axios';
import { Router } from 'express';
import { makeError, makeResponse } from '../helpers/response.js';
import {
  TopicSuggestionServiceError,
  suggestTopics,
} from '../services/topic-suggestion.js';
import type {
  TopicSuggestionInput,
  TopicSuggestionRequest,
} from '../types.js';

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

function parseOptions(value: unknown, fieldName: string): string[] {
  if (!Array.isArray(value) || value.length === 0) {
    throw new Error(`${fieldName} must be a non-empty array.`);
  }

  const options = value.map((option, index) =>
    parseRequiredString(option, `${fieldName} option ${index + 1}`)
  );

  return Array.from(new Set(options));
}

function parseTopics(value: unknown): TopicSuggestionInput[] {
  if (!Array.isArray(value) || value.length === 0) {
    throw new Error('topics must be a non-empty array.');
  }

  return value.map((topic, index) => {
    if (!isRecord(topic)) {
      throw new Error(`topic ${index + 1} is invalid.`);
    }

    return {
      bioguideId: parseRequiredString(topic.bioguideId, `topic ${index + 1} bioguideId`),
      legislatorName: parseRequiredString(topic.legislatorName, `topic ${index + 1} legislatorName`),
      options: parseOptions(topic.options, `topic ${index + 1} options`),
      currentTopic: parseOptionalString(topic.currentTopic),
    };
  });
}

function parseTopicSuggestionRequest(body: unknown): TopicSuggestionRequest {
  if (!isRecord(body)) {
    throw new Error('Topic suggestion request body must be an object.');
  }

  return {
    message: parseRequiredString(body.message, 'message'),
    topics: parseTopics(body.topics),
  };
}

router.post('/topic-suggestion', async (req, res) => {
  try {
    const request = parseTopicSuggestionRequest(req.body);
    const suggestions = await suggestTopics(request);
    res.json(makeResponse(suggestions));
  } catch (err) {
    if (err instanceof TopicSuggestionServiceError) {
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
