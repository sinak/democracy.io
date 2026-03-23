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

export interface Campaign {
  uuid?: string;
  tag?: string;
  orgURL?: string;
  orgName?: string;
}

export interface Message {
  bioguideId: string;
  topic?: string;
  subject: string;
  message: string;
  sender: MessageSender;
  canonicalAddress: CanonicalAddress;
  campaign: Campaign;
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
