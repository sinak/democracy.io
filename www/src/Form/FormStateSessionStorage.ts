import {
  MessageSenderAddress,
  LegislatorContact,
  MessageResponse
} from "../../../server/src/models";

const SESSION_STORAGE_KEY = "FormState";

export interface StoredFormState {
  addressInputFields: {
    streetAddress: string;
    city: string;
    zipCode: string;
  };
  messageSenderAddress: MessageSenderAddress | undefined;
  messageResponses: MessageResponse[];
  legislatorContacts: LegislatorContact[];
  selectedBioguides: string[];
}

export function setSessionStorage(state: StoredFormState) {
  sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(state));
}

export function getSessionStorage(): StoredFormState | null {
  const item = sessionStorage.getItem(SESSION_STORAGE_KEY);
  if (item) {
    return JSON.parse(item);
  } else {
    return null;
  }
}

export function clearSessionStorage(): void {
  sessionStorage.removeItem(SESSION_STORAGE_KEY);
}

export function getRedactedDebugData() {
  const formState = getSessionStorage();
  if (!formState) return null;

  return {
    city: formState.addressInputFields.city,
    zipCode: formState.addressInputFields.zipCode
  };
}
