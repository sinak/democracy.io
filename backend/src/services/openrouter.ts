import axios from 'axios';
import { config } from '../config.js';
import { logger } from '../logger.js';

export interface OpenRouterMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface OpenRouterJsonSchema {
  name: string;
  strict: boolean;
  schema: Record<string, unknown>;
}

export type OpenRouterResponseFormat =
  | {
      type: 'json_schema';
      json_schema: OpenRouterJsonSchema;
    }
  | {
      type: 'json_object';
    };

export interface OpenRouterChatCompletionRequest {
  messages: OpenRouterMessage[];
  response_format?: OpenRouterResponseFormat;
  max_tokens?: number;
  temperature?: number;
}

export interface OpenRouterChatCompletionResponse {
  model?: string;
  choices?: Array<{
    message?: {
      content?: string | Array<{ type?: string; text?: string }>;
    };
  }>;
}

const headers: Record<string, string> = {
  'Content-Type': 'application/json',
};

if (config.openRouter.apiKey) {
  headers.Authorization = `Bearer ${config.openRouter.apiKey}`;
}

if (config.openRouter.httpReferer) {
  headers['HTTP-Referer'] = config.openRouter.httpReferer;
}

if (config.openRouter.title) {
  headers['X-OpenRouter-Title'] = config.openRouter.title;
}

const openRouterApi = axios.create({
  baseURL: config.openRouter.baseUrl,
  headers,
});

openRouterApi.interceptors.response.use(
  (res) => {
    const model = res.data?.model ? ` model=${res.data.model}` : '';
    logger.http(`[OpenRouter] ${res.config.method?.toUpperCase()} ${res.config.url} ${res.status}${model}`);
    return res;
  },
  (error) => {
    if (error.response) {
      logger.http(
        `[OpenRouter] ${error.config?.method?.toUpperCase()} ${error.config?.url} ${error.response.status}`
      );
    }
    return Promise.reject(error);
  }
);

export async function createChatCompletion(
  request: OpenRouterChatCompletionRequest
): Promise<OpenRouterChatCompletionResponse> {
  const response = await openRouterApi.post('/chat/completions', {
    model: config.openRouter.model,
    ...request,
  });

  return response.data as OpenRouterChatCompletionResponse;
}
