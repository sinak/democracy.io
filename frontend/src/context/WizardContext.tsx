import { createContext, useContext, useRef, useState, useCallback, type ReactNode } from 'react';
import type {
  CanonicalAddress,
  EmailCopyRequest,
  Legislator,
  LegislatorFormElements,
  MessageResponse,
  PublicCampaign,
  ShareDraft,
} from '../types';

export interface WizardState {
  canonicalAddress: CanonicalAddress | null;
  legislators: Legislator[];
  bioguideIdsBySelection: Record<string, boolean>;
  legislatorsFormElements: LegislatorFormElements[];
  shareDraft: ShareDraft | null;
  messageResponses: MessageResponse[];
  emailCopyRequest: EmailCopyRequest | null;
  emailCopySent: boolean;
  activeCampaign: PublicCampaign | null;
  campaignSessionId: string | null;
}

interface WizardContextType extends WizardState {
  setCanonicalAddress: (addr: CanonicalAddress) => void;
  setLegislators: (legs: Legislator[]) => void;
  setBioguideIdsBySelection: (sel: Record<string, boolean>) => void;
  setLegislatorsFormElements: (elems: LegislatorFormElements[]) => void;
  setShareDraft: (draft: ShareDraft | null) => void;
  setMessageResponses: (responses: MessageResponse[]) => void;
  setEmailCopyRequest: (request: EmailCopyRequest | null) => void;
  setEmailCopySent: (sent: boolean) => void;
  setActiveCampaign: (campaign: PublicCampaign | null) => string | null;
  clearCampaignContext: () => void;
  getSelectedLegislators: () => Legislator[];
  getSelectedBioguideIds: () => string[];
  resetFlow: (options?: { preserveCampaignContext?: boolean }) => void;
  clearData: () => void;
}

const STORAGE_KEY = 'dio';

export const defaultWizardState: WizardState = {
  canonicalAddress: null,
  legislators: [],
  bioguideIdsBySelection: {},
  legislatorsFormElements: [],
  shareDraft: null,
  messageResponses: [],
  emailCopyRequest: null,
  emailCopySent: false,
  activeCampaign: null,
  campaignSessionId: null,
};

function loadState(): WizardState {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (raw) return { ...defaultWizardState, ...JSON.parse(raw) };
  } catch {
    // ignore
  }
  return { ...defaultWizardState };
}

function saveState(state: WizardState) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore
  }
}

export function createCampaignSessionId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }

  return `campaign-session-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function applyActiveCampaignState(
  state: WizardState,
  campaign: PublicCampaign | null,
  createSessionId: () => string = createCampaignSessionId
): WizardState {
  const sameCampaign = Boolean(
    campaign &&
      state.activeCampaign &&
      state.activeCampaign.id === campaign.id
  );

  const nextSessionId = campaign
    ? sameCampaign && state.campaignSessionId
      ? state.campaignSessionId
      : createSessionId()
    : null;

  return {
    ...state,
    ...(campaign && !sameCampaign
      ? {
          legislators: [],
          bioguideIdsBySelection: {},
          legislatorsFormElements: [],
          shareDraft: null,
          messageResponses: [],
          emailCopyRequest: null,
          emailCopySent: false,
        }
      : {}),
    activeCampaign: campaign,
    campaignSessionId: nextSessionId,
  };
}

export function buildResetWizardState(
  state: WizardState,
  options?: { preserveCampaignContext?: boolean }
): WizardState {
  return {
    ...defaultWizardState,
    ...(options?.preserveCampaignContext
      ? {
          activeCampaign: state.activeCampaign,
          campaignSessionId: state.campaignSessionId,
        }
      : {}),
  };
}

const WizardContext = createContext<WizardContextType | null>(null);

export function WizardProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<WizardState>(loadState);
  const stateRef = useRef(state);
  stateRef.current = state;

  const replaceState = useCallback((next: WizardState) => {
    stateRef.current = next;
    saveState(next);
    setState(next);
  }, []);

  const update = useCallback((partial: Partial<WizardState>) => {
    setState((prev) => {
      const next = { ...prev, ...partial };
      stateRef.current = next;
      saveState(next);
      return next;
    });
  }, []);

  const setCanonicalAddress = useCallback(
    (addr: CanonicalAddress) => update({ canonicalAddress: addr }),
    [update]
  );

  const setLegislators = useCallback(
    (legs: Legislator[]) => {
      const selections: Record<string, boolean> = {};
      for (const leg of legs) {
        selections[leg.bioguideId] = !leg.defunct && !leg.comingSoon;
      }
      update({ legislators: legs, bioguideIdsBySelection: selections });
    },
    [update]
  );

  const setBioguideIdsBySelection = useCallback(
    (sel: Record<string, boolean>) => update({ bioguideIdsBySelection: sel }),
    [update]
  );

  const setLegislatorsFormElements = useCallback(
    (elems: LegislatorFormElements[]) => update({ legislatorsFormElements: elems }),
    [update]
  );

  const setShareDraft = useCallback(
    (draft: ShareDraft | null) => update({ shareDraft: draft }),
    [update]
  );

  const setMessageResponses = useCallback(
    (responses: MessageResponse[]) => update({ messageResponses: responses }),
    [update]
  );

  const setEmailCopyRequest = useCallback(
    (request: EmailCopyRequest | null) => update({ emailCopyRequest: request }),
    [update]
  );

  const setEmailCopySent = useCallback(
    (sent: boolean) => update({ emailCopySent: sent }),
    [update]
  );

  const setActiveCampaign = useCallback((campaign: PublicCampaign | null) => {
    const next = applyActiveCampaignState(stateRef.current, campaign);

    replaceState(next);

    return next.campaignSessionId;
  }, [replaceState]);

  const clearCampaignContext = useCallback(() => {
    update({
      activeCampaign: null,
      campaignSessionId: null,
    });
  }, [update]);

  const getSelectedLegislators = useCallback(() => {
    const currentState = stateRef.current;

    return currentState.legislators.filter(
      (l) => currentState.bioguideIdsBySelection[l.bioguideId]
    );
  }, []);

  const getSelectedBioguideIds = useCallback(() => {
    return Object.entries(stateRef.current.bioguideIdsBySelection)
      .filter(([, selected]) => selected)
      .map(([id]) => id);
  }, []);

  const resetFlow = useCallback(
    (options?: { preserveCampaignContext?: boolean }) => {
      const cleared = buildResetWizardState(stateRef.current, options);

      replaceState(cleared);
    },
    [replaceState]
  );

  const clearData = useCallback(() => {
    replaceState({ ...defaultWizardState });
  }, [replaceState]);

  return (
    <WizardContext.Provider
      value={{
        ...state,
        setCanonicalAddress,
        setLegislators,
        setBioguideIdsBySelection,
        setLegislatorsFormElements,
        setShareDraft,
        setMessageResponses,
        setEmailCopyRequest,
        setEmailCopySent,
        setActiveCampaign,
        clearCampaignContext,
        getSelectedLegislators,
        getSelectedBioguideIds,
        resetFlow,
        clearData,
      }}
    >
      {children}
    </WizardContext.Provider>
  );
}

export function useWizard(): WizardContextType {
  const ctx = useContext(WizardContext);
  if (!ctx) throw new Error('useWizard must be used within WizardProvider');
  return ctx;
}
