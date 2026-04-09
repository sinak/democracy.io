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
  ShareTopicRequest,
  ShareTopicResult,
  TopicSuggestionRequest,
  TopicSuggestionResult,
} from '../types';
import { apiFetch } from '../helpers/api-client';

export function useApi() {
  return {
    verifyAddress(address: string): Promise<CanonicalAddress[]> {
      return apiFetch(`/location/verify?address=${encodeURIComponent(address)}`);
    },

    findLegislatorsByDistrict(state: string, district: number): Promise<Legislator[]> {
      return apiFetch(
        `/legislators/findByDistrict?state=${encodeURIComponent(state)}&district=${district}`
      );
    },

    getFormElements(bioguideIds: string[]): Promise<LegislatorFormElements[]> {
      const ids = bioguideIds.join(',');
      return apiFetch(
        `/formElements/findByLegislatorBioguideIds?bioguideIds=${encodeURIComponent(ids)}`
      );
    },

    submitMessages(messages: Message[]): Promise<MessageResponse[]> {
      return apiFetch('/legislators/message', {
        method: 'POST',
        body: JSON.stringify(messages),
      });
    },

    sendMessageCopy(request: EmailCopyRequest): Promise<void> {
      return apiFetch('/message-copy', {
        method: 'POST',
        body: JSON.stringify(request),
      }).then(() => undefined);
    },

    draftMessage(request: DraftMessageRequest): Promise<DraftMessageResult> {
      return apiFetch('/draft-message', {
        method: 'POST',
        body: JSON.stringify(request),
      });
    },

    suggestTopics(request: TopicSuggestionRequest): Promise<TopicSuggestionResult> {
      return apiFetch('/topic-suggestion', {
        method: 'POST',
        body: JSON.stringify(request),
      });
    },

    getShareTopic(request: ShareTopicRequest): Promise<ShareTopicResult> {
      return apiFetch('/share-topic', {
        method: 'POST',
        body: JSON.stringify(request),
      });
    },

    submitCaptcha(solution: CaptchaSolution): Promise<MessageResponse> {
      return apiFetch('/captchaSolution', {
        method: 'POST',
        body: JSON.stringify(solution),
      });
    },

    subscribe(data: { sender: { firstName: string; lastName: string; email: string }; canonicalAddress: CanonicalAddress }): Promise<void> {
      return apiFetch('/subscription', {
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
