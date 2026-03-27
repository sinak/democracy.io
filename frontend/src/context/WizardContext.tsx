import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import type {
  CanonicalAddress,
  EmailCopyRequest,
  Legislator,
  LegislatorFormElements,
  MessageResponse,
} from '../types';

interface WizardState {
  canonicalAddress: CanonicalAddress | null;
  legislators: Legislator[];
  bioguideIdsBySelection: Record<string, boolean>;
  legislatorsFormElements: LegislatorFormElements[];
  messageResponses: MessageResponse[];
  emailCopyRequest: EmailCopyRequest | null;
  emailCopySent: boolean;
}

interface WizardContextType extends WizardState {
  setCanonicalAddress: (addr: CanonicalAddress) => void;
  setLegislators: (legs: Legislator[]) => void;
  setBioguideIdsBySelection: (sel: Record<string, boolean>) => void;
  setLegislatorsFormElements: (elems: LegislatorFormElements[]) => void;
  setMessageResponses: (responses: MessageResponse[]) => void;
  setEmailCopyRequest: (request: EmailCopyRequest | null) => void;
  setEmailCopySent: (sent: boolean) => void;
  getSelectedLegislators: () => Legislator[];
  getSelectedBioguideIds: () => string[];
  clearData: () => void;
}

const STORAGE_KEY = 'dio';

const defaultState: WizardState = {
  canonicalAddress: null,
  legislators: [],
  bioguideIdsBySelection: {},
  legislatorsFormElements: [],
  messageResponses: [],
  emailCopyRequest: null,
  emailCopySent: false,
};

function loadState(): WizardState {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (raw) return { ...defaultState, ...JSON.parse(raw) };
  } catch {
    // ignore
  }
  return { ...defaultState };
}

function saveState(state: WizardState) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore
  }
}

const WizardContext = createContext<WizardContextType | null>(null);

export function WizardProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<WizardState>(loadState);

  const update = useCallback((partial: Partial<WizardState>) => {
    setState((prev) => {
      const next = { ...prev, ...partial };
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

  const getSelectedLegislators = useCallback(() => {
    return state.legislators.filter((l) => state.bioguideIdsBySelection[l.bioguideId]);
  }, [state.legislators, state.bioguideIdsBySelection]);

  const getSelectedBioguideIds = useCallback(() => {
    return Object.entries(state.bioguideIdsBySelection)
      .filter(([, selected]) => selected)
      .map(([id]) => id);
  }, [state.bioguideIdsBySelection]);

  const clearData = useCallback(() => {
    const cleared = { ...defaultState };
    saveState(cleared);
    setState(cleared);
  }, []);

  return (
    <WizardContext.Provider
      value={{
        ...state,
        setCanonicalAddress,
        setLegislators,
        setBioguideIdsBySelection,
        setLegislatorsFormElements,
        setMessageResponses,
        setEmailCopyRequest,
        setEmailCopySent,
        getSelectedLegislators,
        getSelectedBioguideIds,
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
