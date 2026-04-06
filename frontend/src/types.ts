export interface AddressComponents {
  primaryNumber: string;
  streetName: string;
  streetPredirection?: string;
  streetPostdirection?: string;
  streetSuffix?: string;
  secondaryNumber?: string;
  cityName: string;
  defaultCityName?: string;
  stateAbbreviation: string;
  stateName?: string;
  zipcode: string;
  plus4Code?: string;
}

export interface CanonicalAddress {
  inputId?: string;
  inputIndex?: number;
  address: string;
  county: string;
  longitude: number;
  latitude: number;
  district: number;
  components: AddressComponents;
}

export interface Legislator {
  bioguideId: string;
  title: string;
  firstName: string;
  lastName: string;
  state: string;
  district: number | null;
  defunct: boolean;
  contact_url?: string;
  comingSoon?: boolean;
}

export interface FormElement {
  value: string;
  maxLength?: number;
  optionsHash: Record<string, string> | string[];
}

export interface LegislatorFormElements {
  bioguideId: string;
  formElements: FormElement[];
}

export interface MessageSender {
  namePrefix: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  parenPhone: string;
  county?: string;
}

export interface Message {
  bioguideId: string;
  recipientName?: string;
  topic?: string;
  subject: string;
  message: string;
  sender: MessageSender;
  canonicalAddress: CanonicalAddress;
  campaign: {
    uuid: string;
    orgURL: string;
    orgName: string;
  };
}

export interface MessageResponse {
  bioguideId: string;
  status: string;
  url?: string;
  uid?: string;
}

export interface EmailCopyRequest {
  messages: Message[];
}

export interface ShareDraft {
  subject: string;
  message: string;
  selectedTopics: string[];
}

export interface ShareTopicRequest {
  message: string;
  subject?: string;
  selectedTopics?: string[];
}

export interface ShareTopicResult {
  topic: string;
}

export interface CaptchaSolution {
  bioguideId: string;
  answer: string;
  uid: string;
}

export interface TopicOption {
  bioguideId: string;
  name: string;
  options: string[];
  optionsHash: Record<string, string> | string[];
  selected: string;
}

export interface CountyData {
  selected?: string;
  options?: string[];
}

export type DraftMode = 'generate' | 'rewrite';

export interface DraftRecipient {
  bioguideId: string;
  title: string;
  firstName: string;
  lastName: string;
}

export interface DraftTopic {
  bioguideId: string;
  legislatorName: string;
  selectedTopic: string;
}

export interface TopicSuggestionInput {
  bioguideId: string;
  legislatorName: string;
  options: string[];
  currentTopic?: string;
}

export interface TopicSuggestionRequest {
  message: string;
  topics: TopicSuggestionInput[];
}

export interface TopicSuggestionChoice {
  bioguideId: string;
  selectedTopic: string;
}

export interface TopicSuggestionResult {
  topics: TopicSuggestionChoice[];
}

export interface DraftLocation {
  stateAbbreviation: string;
  district: number | string;
  county?: string;
}

export interface DraftConstraints {
  subjectMaxLength?: number;
  messageMaxLength?: number;
}

export interface DraftMessageRequest {
  mode: DraftMode;
  instruction: string;
  currentDraft?: {
    subject?: string;
    message?: string;
  };
  recipients: DraftRecipient[];
  topics?: DraftTopic[];
  location?: DraftLocation;
  constraints?: DraftConstraints;
}

export interface DraftMessageResult {
  subject: string;
  message: string;
}
