import { config } from '../config.js';
import type {
  TopicSuggestionChoice,
  TopicSuggestionInput,
  TopicSuggestionRequest,
  TopicSuggestionResult,
} from '../types.js';
import { createChatCompletion } from './openrouter.js';

const MAX_TOPIC_SUGGESTION_ATTEMPTS = 3;

const systemPrompt = [
  'You classify constituent messages into congressional contact-form topics.',
  'Return valid JSON only.',
  'The JSON object must have exactly one array field named "topics".',
  'Each item in "topics" must have exactly two string fields: "bioguideId" and "selectedTopic".',
  'Choose exactly one topic for each provided bioguideId.',
  'selectedTopic must match one of the provided options verbatim.',
  'Never invent topics, explain your reasoning, or include extra keys.',
  'Base your choices only on the message text and the allowed options.',
  'If a message is broad or ambiguous, choose the closest broad option from the list.',
].join(' ');

export class TopicSuggestionServiceError extends Error {
  statusCode: number;

  constructor(message: string, statusCode = 502) {
    super(message);
    this.name = 'TopicSuggestionServiceError';
    this.statusCode = statusCode;
  }
}

function isRetryableError(error: unknown): boolean {
  if (!(error instanceof TopicSuggestionServiceError)) {
    return false;
  }

  return (
    error.message === 'OpenRouter returned invalid JSON.' ||
    error.message === 'OpenRouter returned an invalid topic payload.' ||
    error.message === 'OpenRouter returned an empty response.' ||
    error.message === 'OpenRouter did not return any valid topic suggestions.'
  );
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

function normalizeOption(value: string): string {
  return value.trim().replace(/\s+/g, ' ').toLowerCase();
}

function parseJsonContent(rawContent: string): TopicSuggestionResult {
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
    throw new TopicSuggestionServiceError('OpenRouter returned invalid JSON.');
  }

  if (
    !parsed ||
    typeof parsed !== 'object' ||
    !Array.isArray((parsed as TopicSuggestionResult).topics)
  ) {
    throw new TopicSuggestionServiceError('OpenRouter returned an invalid topic payload.');
  }

  return parsed as TopicSuggestionResult;
}

function buildUserPrompt(request: TopicSuggestionRequest): string {
  return JSON.stringify(
    {
      task: 'Choose the best matching topic for each congressional contact form.',
      message: request.message,
      topics: request.topics.map((topic) => ({
        bioguideId: topic.bioguideId,
        legislatorName: topic.legislatorName,
        currentTopic: topic.currentTopic || null,
        allowedOptions: topic.options,
      })),
      outputRequirements: {
        format: 'json_object',
        requiredKeys: ['topics'],
        topicsItem: {
          bioguideId: 'The matching bioguideId from the input.',
          selectedTopic: 'One allowed option copied exactly.',
        },
      },
    },
    null,
    2
  );
}

function normalizeSuggestions(
  requestTopics: TopicSuggestionInput[],
  result: TopicSuggestionResult
): TopicSuggestionResult {
  const requestTopicMap = new Map(
    requestTopics.map((topic) => [topic.bioguideId, topic] as const)
  );
  const validSelections = new Map<string, TopicSuggestionChoice>();

  for (const entry of result.topics) {
    if (
      !entry ||
      typeof entry !== 'object' ||
      typeof entry.bioguideId !== 'string' ||
      typeof entry.selectedTopic !== 'string'
    ) {
      continue;
    }

    const requestTopic = requestTopicMap.get(entry.bioguideId);
    if (!requestTopic) {
      continue;
    }

    const matchedOption = requestTopic.options.find(
      (option) => normalizeOption(option) === normalizeOption(entry.selectedTopic)
    );

    if (!matchedOption) {
      continue;
    }

    validSelections.set(entry.bioguideId, {
      bioguideId: entry.bioguideId,
      selectedTopic: matchedOption,
    });
  }

  const topics = requestTopics
    .map((topic) => validSelections.get(topic.bioguideId))
    .filter((topic): topic is TopicSuggestionChoice => Boolean(topic));

  if (topics.length === 0) {
    throw new TopicSuggestionServiceError('OpenRouter did not return any valid topic suggestions.');
  }

  return { topics };
}

export async function suggestTopics(
  request: TopicSuggestionRequest
): Promise<TopicSuggestionResult> {
  if (!config.openRouter.apiKey) {
    throw new TopicSuggestionServiceError('OPENROUTER_API_KEY is not configured.', 500);
  }

  let lastError: unknown;

  for (let attempt = 1; attempt <= MAX_TOPIC_SUGGESTION_ATTEMPTS; attempt += 1) {
    try {
      const response = await createChatCompletion({
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: buildUserPrompt(request) },
        ],
        response_format: {
          type: 'json_object',
        },
        max_tokens: Math.min(config.openRouter.maxCompletionTokens, 400),
        temperature: 0,
      });

      const rawContent = extractTextContent(response.choices?.[0]?.message?.content);
      if (!rawContent) {
        throw new TopicSuggestionServiceError('OpenRouter returned an empty response.');
      }

      return normalizeSuggestions(request.topics, parseJsonContent(rawContent));
    } catch (error) {
      lastError = error;

      if (attempt === MAX_TOPIC_SUGGESTION_ATTEMPTS || !isRetryableError(error)) {
        throw error;
      }
    }
  }

  throw lastError;
}
