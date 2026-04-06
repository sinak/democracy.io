import type {
  CanonicalAddress,
  DraftConstraints,
  DraftMessageRequest,
  DraftMode,
  Legislator,
  LegislatorFormElements,
  TopicOption,
} from '../types';

interface BuildDraftRequestOptions {
  mode: DraftMode;
  instruction: string;
  formData: Record<string, string>;
  legislators: Legislator[];
  topicOptions: Record<string, TopicOption>;
  canonicalAddress: CanonicalAddress;
  formElements: LegislatorFormElements[];
}

function getTightestMaxLength(
  formElements: LegislatorFormElements[],
  fieldValue: '$SUBJECT' | '$MESSAGE'
): number | undefined {
  const limits = formElements
    .flatMap((entry) => entry.formElements)
    .filter((entry) => entry.value === fieldValue && typeof entry.maxLength === 'number')
    .map((entry) => entry.maxLength as number)
    .filter((length) => length > 0);

  if (limits.length === 0) {
    return undefined;
  }

  return Math.min(...limits);
}

function getConstraints(formElements: LegislatorFormElements[]): DraftConstraints | undefined {
  const subjectMaxLength = getTightestMaxLength(formElements, '$SUBJECT');
  const messageMaxLength = getTightestMaxLength(formElements, '$MESSAGE');

  if (subjectMaxLength == null && messageMaxLength == null) {
    return undefined;
  }

  return {
    subjectMaxLength,
    messageMaxLength,
  };
}

export function buildDraftMessageRequest({
  mode,
  instruction,
  formData,
  legislators,
  topicOptions,
  canonicalAddress,
  formElements,
}: BuildDraftRequestOptions): DraftMessageRequest {
  const request: DraftMessageRequest = {
    mode,
    instruction: instruction.trim(),
    recipients: legislators.map((legislator) => ({
      bioguideId: legislator.bioguideId,
      title: legislator.title,
      firstName: legislator.firstName,
      lastName: legislator.lastName,
    })),
    topics: Object.values(topicOptions)
      .filter((topic) => topic.selected)
      .map((topic) => ({
        bioguideId: topic.bioguideId,
        legislatorName: topic.name,
        selectedTopic: topic.selected,
      })),
    location: {
      stateAbbreviation: canonicalAddress.components.stateAbbreviation,
      district: canonicalAddress.district,
      county: canonicalAddress.county,
    },
  };

  const constraints = getConstraints(formElements);
  if (constraints) {
    request.constraints = constraints;
  }

  if (mode === 'rewrite') {
    request.currentDraft = {
      subject: formData.subject?.trim() || undefined,
      message: formData.message?.trim() || undefined,
    };
  }

  return request;
}
