import { config } from '../config.js';
import type { ShareTopicRequest, ShareTopicResult } from '../types.js';
import { createChatCompletion } from './openrouter.js';

const systemPrompt = [
  'You extract one short issue topic from a constituent message.',
  'Return valid JSON only.',
  'The JSON object must have exactly one string field named "topic".',
  'The topic must be specific, plain text, and in sentence case.',
  'Keep the topic between 2 and 6 words when possible.',
  'Do not mention Congress, representatives, messaging, democracy.io, or calls to action.',
  'Do not use quotation marks, hashtags, emojis, or trailing punctuation.',
  'Ignore salutations, signatures, and recipient names.',
].join(' ');

export class ShareTopicServiceError extends Error {
  statusCode: number;

  constructor(message: string, statusCode = 502) {
    super(message);
    this.name = 'ShareTopicServiceError';
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

function parseJsonContent(rawContent: string): ShareTopicResult {
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
    throw new ShareTopicServiceError('OpenRouter returned invalid JSON.');
  }

  if (
    !parsed ||
    typeof parsed !== 'object' ||
    typeof (parsed as ShareTopicResult).topic !== 'string'
  ) {
    throw new ShareTopicServiceError('OpenRouter returned an invalid share topic payload.');
  }

  return parsed as ShareTopicResult;
}

function normalizeTopic(topic: string): string {
  let value = topic
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/^["“](.*)["”]$/, '$1')
    .replace(/[.!?,:;]+$/, '')
    .trim();

  if (!value) {
    throw new ShareTopicServiceError('OpenRouter returned an empty share topic.');
  }

  if (value.length > 80) {
    throw new ShareTopicServiceError('OpenRouter returned a share topic that is too long.');
  }

  return value;
}

function buildUserPrompt(request: ShareTopicRequest): string {
  const selectedTopics = Array.from(
    new Set((request.selectedTopics || []).map((topic) => topic.trim()).filter(Boolean))
  );

  return JSON.stringify(
    {
      task: 'Identify the core issue topic of this completed constituent message.',
      subject: request.subject || null,
      message: request.message,
      selectedTopicHints: selectedTopics,
      outputRequirements: {
        format: 'json_object',
        requiredKeys: ['topic'],
        topic:
          'A short issue label in sentence case, suitable for a social sharing prompt.',
      },
    },
    null,
    2
  );
}

export async function generateShareTopic(
  request: ShareTopicRequest
): Promise<ShareTopicResult> {
  if (!config.openRouter.apiKey) {
    throw new ShareTopicServiceError('OPENROUTER_API_KEY is not configured.', 500);
  }

  const response = await createChatCompletion({
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: buildUserPrompt(request) },
    ],
    response_format: {
      type: 'json_object',
    },
    max_tokens: Math.min(config.openRouter.maxCompletionTokens, 120),
    temperature: 0.2,
  });

  const rawContent = extractTextContent(response.choices?.[0]?.message?.content);
  if (!rawContent) {
    throw new ShareTopicServiceError('OpenRouter returned an empty response.');
  }

  return { topic: normalizeTopic(parseJsonContent(rawContent).topic) };
}
