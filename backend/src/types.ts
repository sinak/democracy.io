export interface Legislator {
  bioguideId: string;
  title: string;
  firstName: string;
  lastName: string;
  state: string;
  district: number | null;
  chamber: 'senate' | 'house';
  defunct?: boolean;
  contact_url?: string;
  comingSoon?: boolean;
}

export interface AddressComponents {
  primaryNumber?: string;
  streetName?: string;
  streetPredirection?: string;
  streetPostdirection?: string;
  streetSuffix?: string;
  secondaryNumber?: string;
  cityName?: string;
  defaultCityName?: string;
  stateAbbreviation?: string;
  stateName?: string;
  zipcode?: string;
  plus4Code?: string;
}

export interface CanonicalAddress {
  inputId?: string;
  inputIndex?: number;
  address: string;
  county?: string;
  longitude?: number;
  latitude?: number;
  district?: string;
  components: AddressComponents;
}

export interface MessageSender {
  namePrefix?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  parenPhone?: string;
  county?: string;
}

export interface MessageCampaignMetadata {
  uuid?: string;
  tag?: string;
  orgURL?: string;
  orgName?: string;
}

export interface Message {
  bioguideId: string;
  recipientName?: string;
  topic?: string;
  subject: string;
  message: string;
  sender: MessageSender;
  canonicalAddress: CanonicalAddress;
  campaign: MessageCampaignMetadata;
}

export interface LegislatorFormElements {
  bioguideId: string;
  formElements: { value: string; maxLength?: number; optionsHash?: Record<string, string> }[];
}

export interface MessageResponse {
  bioguideId?: string;
  status?: string;
  url?: string;
  uid?: string;
}

export interface EmailCopyRequest {
  messages: Message[];
}

export interface ShareTopicRequest {
  message: string;
  subject?: string;
  selectedTopics?: string[];
}

export interface ShareTopicResult {
  topic: string;
}

export type DraftMessageMode = 'generate' | 'rewrite';

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
  mode: DraftMessageMode;
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

export type CampaignStatus = 'draft' | 'published' | 'archived' | 'disabled';

export type CampaignEventType = 'page_view' | 'flow_start';

export interface CampaignStats {
  pageViews: number;
  flowStarts: number;
  peopleTakenAction: number;
  totalMessagesSent: number;
}

export interface Campaign {
  id: string;
  organizerUserId: string;
  organizerEmail: string;
  title: string;
  slug: string;
  summary: string | null;
  bodyMarkdown: string | null;
  organizationName: string | null;
  organizationUrl: string | null;
  status: CampaignStatus;
  publishedAt: string | null;
  firstPublishedAt: string | null;
  archivedAt: string | null;
  disabledAt: string | null;
  createdAt: string;
  updatedAt: string;
  stats: CampaignStats;
}

export interface PublicCampaign {
  id: string;
  title: string;
  slug: string;
  summary: string | null;
  bodyMarkdown: string | null;
  organizationName: string | null;
  organizationUrl: string | null;
  status: Extract<CampaignStatus, 'published'>;
  publishedAt: string | null;
  firstPublishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  stats: CampaignStats;
}

export interface CampaignEvent {
  id: string;
  campaignId: string;
  type: CampaignEventType;
  metadata: Record<string, unknown> | null;
  requestIpHash: string | null;
  userAgent: string | null;
  referrer: string | null;
  createdAt: string;
}

export interface CreateCampaignRequest {
  title: string;
  slug?: string;
  summary?: string | null;
  bodyMarkdown?: string | null;
  organizationName?: string | null;
  organizationUrl?: string | null;
}

export interface UpdateCampaignRequest {
  title?: string;
  slug?: string;
  summary?: string | null;
  bodyMarkdown?: string | null;
  organizationName?: string | null;
  organizationUrl?: string | null;
}

export interface CampaignListResponse {
  campaigns: Campaign[];
}

export interface CampaignDetailResponse {
  campaign: Campaign;
}

export interface PublicCampaignResponse {
  campaign: PublicCampaign;
}

export interface CreateCampaignEventRequest {
  type: CampaignEventType;
  metadata?: Record<string, unknown> | null;
}

export interface CampaignEventResponse {
  event: CampaignEvent;
}
