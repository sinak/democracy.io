import type {
  TopicOption,
  TopicSuggestionRequest,
} from '../types';

export function buildTopicSuggestionRequest(
  message: string,
  topicOptions: Record<string, TopicOption>
): TopicSuggestionRequest {
  return {
    message: message.trim(),
    topics: Object.values(topicOptions).map((topic) => ({
      bioguideId: topic.bioguideId,
      legislatorName: topic.name,
      options: topic.options,
      currentTopic: topic.selected,
    })),
  };
}
