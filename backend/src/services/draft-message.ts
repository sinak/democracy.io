import { config } from '../config.js';
import type {
  DraftConstraints,
  DraftMessageRequest,
  DraftMessageResult,
} from '../types.js';
import { createChatCompletion } from './openrouter.js';

const systemPrompt = [
  'You help users draft constituent emails to members of Congress.',
  'Return valid JSON only.',
  'The JSON object must have exactly two string fields: "subject" and "message".',
  'Write a concise, polite, plain-text subject and message.',
  'Do not include any greeting, salutation, or recipient name in the message.',
  'Do not include any closing signature, sender name, email, phone number, or address.',
  'Do not use markdown, bullets, or code formatting.',
  'Do not invent personal facts, legislative facts, or district facts that were not provided.',
  'The message field must contain only the body text that should appear after "Dear [Representative/Senator LastName],".',
].join(' ');

export class DraftServiceError extends Error {
  statusCode: number;

  constructor(message: string, statusCode = 502) {
    super(message);
    this.name = 'DraftServiceError';
    this.statusCode = statusCode;
  }
}

function extractTextContent(
  content: string | Array<{ type?: string; text?: string }> | undefined
): string {
  if (typeof content === 'string') {
    return content;
  }

  if (!Array.isArray(content)) {
    return '';
  }

  return content
    .map((part) => {
      if (typeof part?.text === 'string') {
        return part.text;
      }

      return '';
    })
    .join('');
}

function parseJsonContent(rawContent: string): DraftMessageResult {
  const trimmed = rawContent
    .trim()
    .replace(/^```json\s*/i, '')
    .replace(/^```/, '')
    .replace(/```$/, '')
    .trim();

  let parsed: unknown;

  try {
    parsed = JSON.parse(trimmed);
  } catch {
    throw new DraftServiceError('OpenRouter returned invalid JSON.');
  }

  if (
    !parsed ||
    typeof parsed !== 'object' ||
    typeof (parsed as DraftMessageResult).subject !== 'string' ||
    typeof (parsed as DraftMessageResult).message !== 'string'
  ) {
    throw new DraftServiceError('OpenRouter returned an invalid draft payload.');
  }

  return parsed as DraftMessageResult;
}

function normalizeSubject(subject: string): string {
  let value = subject.replace(/\s+/g, ' ').trim();

  const quoted = value.match(/^["“](.*)["”]$/);
  if (quoted) {
    value = quoted[1].trim();
  }

  return value;
}

function stripLeadingSalutation(message: string): string {
  const lines = message.split('\n');

  while (lines[0]?.trim() === '') {
    lines.shift();
  }

  const firstLine = lines[0]?.trim() || '';
  const salutationPattern = /^(dear|hello|hi)\b/i;

  if (salutationPattern.test(firstLine) && firstLine.includes(',')) {
    lines.shift();
  }

  while (lines[0]?.trim() === '') {
    lines.shift();
  }

  return lines.join('\n').trim();
}

function stripTrailingSignature(message: string): string {
  const lines = message.split('\n');

  while (lines.length > 0 && lines[lines.length - 1]?.trim() === '') {
    lines.pop();
  }

  const signoffPattern = /^(sincerely|best|regards|respectfully|thank you|thanks|warmly|yours truly)[,!.\s]*$/i;

  for (let i = Math.max(0, lines.length - 3); i < lines.length; i += 1) {
    const currentLine = lines[i]?.trim() || '';
    const trailingLines = lines.slice(i + 1).map((line) => line.trim());

    if (
      signoffPattern.test(currentLine) &&
      trailingLines.every((line) => line !== '' && line.split(/\s+/).length <= 4)
    ) {
      return lines.slice(0, i).join('\n').trim();
    }
  }

  return lines.join('\n').trim();
}

function normalizeMessage(message: string): string {
  const normalized = message.replace(/\r\n?/g, '\n').trim();
  return stripTrailingSignature(stripLeadingSalutation(normalized));
}

function enforceLength(value: string, maxLength: number | undefined, fieldName: string) {
  if (typeof maxLength === 'number' && value.length > maxLength) {
    throw new DraftServiceError(`Generated ${fieldName} exceeds the ${maxLength}-character limit.`);
  }
}

function normalizeDraft(
  draft: DraftMessageResult,
  constraints: DraftConstraints | undefined
): DraftMessageResult {
  const subject = normalizeSubject(draft.subject);
  const message = normalizeMessage(draft.message);

  if (!subject) {
    throw new DraftServiceError('OpenRouter returned an empty subject.');
  }

  if (!message) {
    throw new DraftServiceError('OpenRouter returned an empty message body.');
  }

  enforceLength(subject, constraints?.subjectMaxLength, 'subject');
  enforceLength(message, constraints?.messageMaxLength, 'message');

  return { subject, message };
}

function buildUserPrompt(request: DraftMessageRequest): string {
  const payload = {
    task:
      request.mode === 'rewrite'
        ? 'Rewrite the existing draft based on the user instruction.'
        : 'Generate a new draft based on the user instruction.',
    instruction: request.instruction,
    recipients: request.recipients.map((recipient) => ({
      bioguideId: recipient.bioguideId,
      name: `${recipient.title}. ${recipient.firstName} ${recipient.lastName}`,
    })),
    topics: request.topics || [],
    location: request.location || null,
    currentDraft:
      request.mode === 'rewrite'
        ? {
            subject: request.currentDraft?.subject || '',
            message: request.currentDraft?.message || '',
          }
        : null,
    constraints: request.constraints || null,
    outputRequirements: {
      format: 'json_object',
      requiredKeys: ['subject', 'message'],
      subject: 'A concise plain-text subject line.',
      message: 'The body only, without a greeting, salutation, or signature.',
    },
    styleGuidance: [
      'Be polite and concise.',
      'Explain why the issue matters to the sender.',
      'Keep the content usable as a body-only message for multiple legislators.',
    ],
  };

  return JSON.stringify(payload, null, 2);
}

export async function generateDraft(request: DraftMessageRequest): Promise<DraftMessageResult> {
  if (!config.openRouter.apiKey) {
    throw new DraftServiceError('OPENROUTER_API_KEY is not configured.', 500);
  }

  const response = await createChatCompletion({
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: buildUserPrompt(request) },
    ],
    response_format: {
      type: 'json_object',
    },
    max_tokens: config.openRouter.maxCompletionTokens,
    temperature: config.openRouter.temperature,
  });

  const rawContent = extractTextContent(response.choices?.[0]?.message?.content);
  if (!rawContent) {
    throw new DraftServiceError('OpenRouter returned an empty response.');
  }

  return normalizeDraft(parseJsonContent(rawContent), request.constraints);
}
