import type {
  CanonicalAddress,
  CaptchaSolution,
  DraftMessageRequest,
  DraftMessageResult,
  EmailCopyRequest,
  Legislator,
  LegislatorFormElements,
  Message,
  MessageResponse,
  TopicSuggestionRequest,
  TopicSuggestionResult,
} from '../types';

const API_BASE = '/api/1';

type ApiError = Error & {
  code?: number;
  data?: unknown;
};

async function apiFetch<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!res.ok) {
    const error = new Error(`API error: ${res.status}`) as ApiError;
    error.code = res.status;

    try {
      const json = await res.json();
      if (typeof json?.message === 'string') {
        error.message = json.message;
      }
      error.data = json?.data;
    } catch {
      // Ignore non-JSON error bodies.
    }

    throw error;
  }

  const json = await res.json();
  // API returns JSend format: { status, data }
  return json.data ?? json;
}

export function useApi() {
  return {
    verifyAddress(address: string): Promise<CanonicalAddress[]> {
      return apiFetch(`${API_BASE}/location/verify?address=${encodeURIComponent(address)}`);
    },

    findLegislatorsByDistrict(state: string, district: number): Promise<Legislator[]> {
      return apiFetch(
        `${API_BASE}/legislators/findByDistrict?state=${encodeURIComponent(state)}&district=${district}`
      );
    },

    getFormElements(bioguideIds: string[]): Promise<LegislatorFormElements[]> {
      const ids = bioguideIds.join(',');
      return apiFetch(
        `${API_BASE}/formElements/findByLegislatorBioguideIds?bioguideIds=${encodeURIComponent(ids)}`
      );
    },

    submitMessages(messages: Message[]): Promise<MessageResponse[]> {
      return apiFetch(`${API_BASE}/legislators/message`, {
        method: 'POST',
        body: JSON.stringify(messages),
      });
    },

    sendMessageCopy(request: EmailCopyRequest): Promise<void> {
      return apiFetch(`${API_BASE}/message-copy`, {
        method: 'POST',
        body: JSON.stringify(request),
      }).then(() => undefined);
    },

    draftMessage(request: DraftMessageRequest): Promise<DraftMessageResult> {
      return apiFetch(`${API_BASE}/draft-message`, {
        method: 'POST',
        body: JSON.stringify(request),
      });
    },

    suggestTopics(request: TopicSuggestionRequest): Promise<TopicSuggestionResult> {
      return apiFetch(`${API_BASE}/topic-suggestion`, {
        method: 'POST',
        body: JSON.stringify(request),
      });
    },

    submitCaptcha(solution: CaptchaSolution): Promise<MessageResponse> {
      return apiFetch(`${API_BASE}/captchaSolution`, {
        method: 'POST',
        body: JSON.stringify(solution),
      });
    },

    subscribe(data: { sender: { firstName: string; lastName: string; email: string }; canonicalAddress: CanonicalAddress }): Promise<void> {
      return apiFetch(`${API_BASE}/subscription`, {
        method: 'POST',
        body: JSON.stringify(data),
      })
        .then(() => undefined)
        .catch(() => {
        // best-effort
        });
    },
  };
}
