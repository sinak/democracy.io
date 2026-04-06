import axios from 'axios';
import { Router } from 'express';
import { makeError, makeResponse } from '../helpers/response.js';
import {
  DraftServiceError,
  generateDraft,
} from '../services/draft-message.js';
import type {
  DraftConstraints,
  DraftLocation,
  DraftMessageMode,
  DraftMessageRequest,
  DraftRecipient,
  DraftTopic,
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

function parseMode(value: unknown): DraftMessageMode {
  if (value === 'generate' || value === 'rewrite') {
    return value;
  }

  throw new Error('mode must be either "generate" or "rewrite".');
}

function parseRecipients(value: unknown): DraftRecipient[] {
  if (!Array.isArray(value) || value.length === 0) {
    throw new Error('At least one recipient is required.');
  }

  return value.map((recipient, index) => {
    if (!isRecord(recipient)) {
      throw new Error(`recipient ${index + 1} is invalid.`);
    }

    return {
      bioguideId: parseRequiredString(recipient.bioguideId, `recipient ${index + 1} bioguideId`),
      title: parseRequiredString(recipient.title, `recipient ${index + 1} title`),
      firstName: parseRequiredString(recipient.firstName, `recipient ${index + 1} firstName`),
      lastName: parseRequiredString(recipient.lastName, `recipient ${index + 1} lastName`),
    };
  });
}

function parseTopics(value: unknown): DraftTopic[] | undefined {
  if (value == null) {
    return undefined;
  }

  if (!Array.isArray(value)) {
    throw new Error('topics must be an array.');
  }

  return value.map((topic, index) => {
    if (!isRecord(topic)) {
      throw new Error(`topic ${index + 1} is invalid.`);
    }

    return {
      bioguideId: parseRequiredString(topic.bioguideId, `topic ${index + 1} bioguideId`),
      legislatorName: parseRequiredString(topic.legislatorName, `topic ${index + 1} legislatorName`),
      selectedTopic: parseRequiredString(topic.selectedTopic, `topic ${index + 1} selectedTopic`),
    };
  });
}

function parseLocation(value: unknown): DraftLocation | undefined {
  if (value == null) {
    return undefined;
  }

  if (!isRecord(value)) {
    throw new Error('location is invalid.');
  }

  const district = value.district;
  if (
    typeof district !== 'number' &&
    (typeof district !== 'string' || district.trim() === '')
  ) {
    throw new Error('location district is required.');
  }

  return {
    stateAbbreviation: parseRequiredString(value.stateAbbreviation, 'location stateAbbreviation'),
    district,
    county: parseOptionalString(value.county),
  };
}

function parseConstraints(value: unknown): DraftConstraints | undefined {
  if (value == null) {
    return undefined;
  }

  if (!isRecord(value)) {
    throw new Error('constraints is invalid.');
  }

  const parseLimit = (limit: unknown, fieldName: string) => {
    if (limit == null) {
      return undefined;
    }

    if (typeof limit !== 'number' || !Number.isFinite(limit) || limit <= 0) {
      throw new Error(`${fieldName} must be a positive number.`);
    }

    return Math.floor(limit);
  };

  return {
    subjectMaxLength: parseLimit(value.subjectMaxLength, 'subjectMaxLength'),
    messageMaxLength: parseLimit(value.messageMaxLength, 'messageMaxLength'),
  };
}

function parseCurrentDraft(value: unknown) {
  if (value == null) {
    return undefined;
  }

  if (!isRecord(value)) {
    throw new Error('currentDraft is invalid.');
  }

  return {
    subject: parseOptionalString(value.subject),
    message: parseOptionalString(value.message),
  };
}

function parseDraftRequest(body: unknown): DraftMessageRequest {
  if (!isRecord(body)) {
    throw new Error('Draft request body must be an object.');
  }

  const mode = parseMode(body.mode);
  const currentDraft = parseCurrentDraft(body.currentDraft);

  if (mode === 'rewrite' && !currentDraft?.subject && !currentDraft?.message) {
    throw new Error('Rewrite mode requires a current subject or message.');
  }

  return {
    mode,
    instruction: parseRequiredString(body.instruction, 'instruction'),
    currentDraft,
    recipients: parseRecipients(body.recipients),
    topics: parseTopics(body.topics),
    location: parseLocation(body.location),
    constraints: parseConstraints(body.constraints),
  };
}

router.post('/draft-message', async (req, res) => {
  try {
    const draftRequest = parseDraftRequest(req.body);
    const draft = await generateDraft(draftRequest);
    res.json(makeResponse(draft));
  } catch (err) {
    if (err instanceof DraftServiceError) {
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
