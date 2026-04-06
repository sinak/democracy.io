import { Router } from 'express';
import { makeError, makeResponse } from '../helpers/response.js';
import {
  MessageCopyServiceError,
  sendMessageCopy,
} from '../services/message-copy.js';
import type { EmailCopyRequest, Message } from '../types.js';

const router = Router();

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function parseMessageCopyRequest(body: unknown): EmailCopyRequest {
  if (!isRecord(body)) {
    throw new MessageCopyServiceError(
      'Message copy request body must be an object.',
      400,
    );
  }

  const { messages } = body;
  if (!Array.isArray(messages) || messages.length === 0) {
    throw new MessageCopyServiceError(
      'messages must be a non-empty array.',
      400,
    );
  }

  return { messages: messages as Message[] };
}

router.post('/message-copy', async (req, res) => {
  try {
    const request = parseMessageCopyRequest(req.body);
    await sendMessageCopy(request.messages);
    res.json(makeResponse({}));
  } catch (err) {
    if (err instanceof MessageCopyServiceError) {
      return res
        .status(err.statusCode)
        .json(makeError({ message: err.message }, err.statusCode));
    }

    const message = err instanceof Error ? err.message : String(err);
    return res.status(500).json(makeError({ message }, 500));
  }
});

export default router;
