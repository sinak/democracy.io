import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AddressCaptureCard } from '../components/AddressCaptureCard';
import { useAuth } from '../context/AuthContext';
import { useWizard } from '../context/WizardContext';
import { setClarityTag, trackClarityEvent, upgradeClaritySession } from '../helpers/clarity';
import { reportDiagnostic } from '../helpers/diagnostics';
import type { CanonicalAddress } from '../types';

const VISIBILITY_CHECKS = [
  { phase: 'post-animation', delayMs: 2500 },
  { phase: 'settled', delayMs: 6000 },
] as const;
const VISIBILITY_HIDDEN_REPORTED_KEY = 'dio:location-entry-hidden-reported';
const VISIBILITY_VISIBLE_REPORTED_KEY = 'dio:location-entry-visible-reported';
const DEFAULT_VISIBILITY_SUCCESS_SAMPLE_RATE = 0.02;
const ADDRESS_FORM_ELEMENT_IDS = [
  'form-scope',
  'location-entry',
  'locationInputs',
  'street1',
  'city1',
  'zip1',
  'submitLocation',
];
const ADDRESS_FORM_INTERACTIVE_ELEMENT_IDS = ['street1', 'city1', 'zip1', 'submitLocation'];
const TRANSPARENT_REASONS = new Set(['opacity-zero', 'hidden-ancestor-opacity-zero']);

function getVisibilitySuccessSampleRate() {
  const parsed = Number(import.meta.env.VITE_ADDRESS_VISIBILITY_SUCCESS_SAMPLE_RATE);
  if (!Number.isFinite(parsed)) return DEFAULT_VISIBILITY_SUCCESS_SAMPLE_RATE;
  return Math.max(0, Math.min(1, parsed));
}

function getSessionFlag(key: string) {
  try {
    return sessionStorage.getItem(key) === '1';
  } catch {
    return false;
  }
}

function setSessionFlag(key: string) {
  try {
    sessionStorage.setItem(key, '1');
  } catch {
    // Diagnostics are best-effort when storage is blocked.
  }
}

function isDiagnosticsForced() {
  try {
    const params = new URLSearchParams(window.location.search);
    if (params.get('dioDiagnostics') === '1') return true;
  } catch {
    // Ignore URL parsing failures.
  }

  try {
    return localStorage.getItem('dio:diagnostics') === '1';
  } catch {
    return false;
  }
}

function getElementSnapshot(id: string) {
  const element = document.getElementById(id);
  if (!element) return { id, present: false };

  const rect = element.getBoundingClientRect();
  const style = window.getComputedStyle(element);

  return {
    id,
    present: true,
    tagName: element.tagName.toLowerCase(),
    className: element.className,
    display: style.display,
    visibility: style.visibility,
    opacity: style.opacity,
    position: style.position,
    width: style.width,
    height: style.height,
    animationName: style.animationName,
    rect: {
      x: rect.x,
      y: rect.y,
      width: rect.width,
      height: rect.height,
    },
  };
}

function describeElement(element: Element | null) {
  if (!element) return null;
  const htmlElement = element as HTMLElement;
  return {
    id: htmlElement.id || null,
    tagName: element.tagName.toLowerCase(),
    className:
      typeof htmlElement.className === 'string'
        ? htmlElement.className
        : String(htmlElement.className),
  };
}

function getHiddenAncestor(element: HTMLElement | null) {
  let current: HTMLElement | null = element;

  while (current) {
    const style = window.getComputedStyle(current);
    const rect = current.getBoundingClientRect();

    if (style.display === 'none') {
      return {
        id: current.id || null,
        tagName: current.tagName.toLowerCase(),
        reason: 'display-none',
      };
    }
    if (style.visibility === 'hidden') {
      return {
        id: current.id || null,
        tagName: current.tagName.toLowerCase(),
        reason: 'visibility-hidden',
      };
    }
    if (style.opacity === '0') {
      return {
        id: current.id || null,
        tagName: current.tagName.toLowerCase(),
        reason: 'opacity-zero',
      };
    }
    if (rect.width === 0 || rect.height === 0) {
      return {
        id: current.id || null,
        tagName: current.tagName.toLowerCase(),
        reason: 'zero-rect',
      };
    }

    if (current.id === 'wrapper') break;
    current = current.parentElement;
  }

  return null;
}

function isOffscreen(rect: DOMRect) {
  return (
    rect.bottom <= 0 ||
    rect.right <= 0 ||
    rect.top >= window.innerHeight ||
    rect.left >= window.innerWidth
  );
}

function getHitTestSnapshot(element: HTMLElement, rect: DOMRect) {
  if (rect.width === 0 || rect.height === 0) {
    return { hitTestable: false, topElement: null };
  }
  if (isOffscreen(rect)) {
    return { hitTestable: false, topElement: null };
  }

  const x = Math.min(Math.max(rect.left + rect.width / 2, 0), window.innerWidth - 1);
  const y = Math.min(Math.max(rect.top + rect.height / 2, 0), window.innerHeight - 1);
  const topElement = document.elementFromPoint(x, y);

  return {
    hitTestable: !!topElement && (element === topElement || element.contains(topElement)),
    topElement: describeElement(topElement),
  };
}

function getStorageSnapshot() {
  try {
    return {
      sessionStorageAvailable: true,
      hasWizardState: sessionStorage.getItem('dio') !== null,
    };
  } catch {
    return {
      sessionStorageAvailable: false,
      hasWizardState: null,
    };
  }
}

function getAddressFormVisibilitySnapshot(phase: string) {
  const entry = document.getElementById('location-entry');
  const streetInput = document.getElementById('street1');
  const entryRect = entry?.getBoundingClientRect();
  const entryStyle = entry ? window.getComputedStyle(entry) : null;
  const hiddenAncestor = getHiddenAncestor(entry);
  const hitTest = entry && entryRect ? getHitTestSnapshot(entry, entryRect) : null;

  const reasons: string[] = [];
  if (!entry) reasons.push('element-missing');
  if (entryRect && (entryRect.width === 0 || entryRect.height === 0)) reasons.push('zero-rect');
  if (entryRect && isOffscreen(entryRect)) reasons.push('offscreen');
  if (entryStyle?.opacity === '0') reasons.push('opacity-zero');
  if (entryStyle?.visibility === 'hidden') reasons.push('visibility-hidden');
  if (entryStyle?.display === 'none') reasons.push('display-none');
  if (entry && entryRect && hitTest && !hitTest.hitTestable) reasons.push('not-hit-testable');
  if (hiddenAncestor) reasons.push(`hidden-ancestor-${hiddenAncestor.reason}`);
  if (!streetInput) reasons.push('street-input-missing');

  if (
    hitTest?.topElement &&
    hitTest.topElement.id &&
    ADDRESS_FORM_INTERACTIVE_ELEMENT_IDS.includes(hitTest.topElement.id)
  ) {
    const index = reasons.indexOf('not-hit-testable');
    if (index !== -1) reasons.splice(index, 1);
  }

  const isTransparentAndInteractable =
    reasons.length > 0 &&
    reasons.every((reason) => TRANSPARENT_REASONS.has(reason)) &&
    hitTest?.hitTestable === true &&
    !!hitTest.topElement?.id &&
    ADDRESS_FORM_INTERACTIVE_ELEMENT_IDS.includes(hitTest.topElement.id);

  let status = 'visible';
  if (!entry || !streetInput) {
    status = 'missing';
  } else if (reasons.includes('offscreen')) {
    status = 'offscreen';
  } else if (reasons.includes('not-hit-testable')) {
    status = 'obscured';
  } else if (isTransparentAndInteractable) {
    status = 'transparent-hit-testable';
  } else if (reasons.length > 0) {
    status = 'hidden';
  }

  return {
    phase,
    status,
    reasons,
    hiddenAncestor,
    hitTest,
    elements: ADDRESS_FORM_ELEMENT_IDS.map(getElementSnapshot),
    path: window.location.pathname,
    hash: window.location.hash,
    userAgent: navigator.userAgent,
    language: navigator.language,
    cookieEnabled: navigator.cookieEnabled,
    doNotTrack: navigator.doNotTrack,
    webdriver: navigator.webdriver,
    windowWidth: window.innerWidth,
    windowHeight: window.innerHeight,
    devicePixelRatio: window.devicePixelRatio,
    documentReadyState: document.readyState,
    visibilityState: document.visibilityState,
    prefersReducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    dataPagename: document.getElementById('wrapper')?.getAttribute('data-pagename'),
    dataPagefrom: document.getElementById('wrapper')?.getAttribute('data-pagefrom'),
    diagnosticsForced: isDiagnosticsForced(),
    storage: getStorageSnapshot(),
  };
}

function shouldReportVisibleSnapshot(phase: string, forced: boolean) {
  if (getSessionFlag(VISIBILITY_VISIBLE_REPORTED_KEY) && !forced) return false;
  if (forced) return true;
  if (phase !== 'post-animation') return false;
  return Math.random() < getVisibilitySuccessSampleRate();
}

function forceAddressFormVisible() {
  for (const id of ['form-scope', 'location-entry']) {
    const element = document.getElementById(id);
    if (!element) continue;

    element.style.setProperty('display', 'block', 'important');
    element.style.setProperty('opacity', '1', 'important');
    element.style.setProperty('visibility', 'visible', 'important');
    element.style.setProperty('animation', 'none', 'important');
  }
}

export function Home() {
  const navigate = useNavigate();
  const { isLoading, user } = useAuth();
  const { clearCampaignContext, clearData, setCanonicalAddress } = useWizard();
  const campaignCtaTarget =
    user ? '/organizer/campaigns/new' : '/organizer/sign-in?next=%2Forganizer%2Fcampaigns%2Fnew';

  useEffect(() => {
    clearCampaignContext();
  }, [clearCampaignContext]);

  useEffect(() => {
    setClarityTag('flow', 'address');
    trackClarityEvent('address-form-mounted');

    let cancelled = false;
    const timers: number[] = [];
    const forced = isDiagnosticsForced();

    const runVisibilityCheck = (phase: string) => {
      if (cancelled) return;

      const snapshot = getAddressFormVisibilitySnapshot(phase);
      if (snapshot.visibilityState !== 'visible' && !forced) return;

      if (snapshot.reasons.length > 0) {
        if (getSessionFlag(VISIBILITY_HIDDEN_REPORTED_KEY) && !forced) return;

        const isTransparentHitTestable = snapshot.status === 'transparent-hit-testable';
        const diagnosticName = isTransparentHitTestable
          ? 'address-form-transparent'
          : 'address-form-invisible';

        setClarityTag('address_form_visibility', snapshot.reasons);
        setClarityTag('address_form_visibility_status', snapshot.status);
        setClarityTag('address_form_visibility_phase', phase);
        trackClarityEvent(diagnosticName);
        if (!isTransparentHitTestable) {
          upgradeClaritySession('address-form-invisible');
        }

        reportDiagnostic(diagnosticName, {
          level: isTransparentHitTestable ? 'info' : 'warning',
          tags: {
            flow: 'address',
            step: 'home',
            diagnostic: 'visibility',
            visibility_status: snapshot.status,
            phase,
            forced_diagnostics: String(forced),
          },
          extra: snapshot,
        });
        if (!forced) setSessionFlag(VISIBILITY_HIDDEN_REPORTED_KEY);
        forceAddressFormVisible();
        return;
      }

      if (shouldReportVisibleSnapshot(phase, forced)) {
        setClarityTag('address_form_visibility_status', snapshot.status);
        trackClarityEvent('address-form-visible');

        reportDiagnostic('address-form-visible', {
          level: 'info',
          tags: {
            flow: 'address',
            step: 'home',
            diagnostic: 'visibility',
            visibility_status: snapshot.status,
            phase,
            forced_diagnostics: String(forced),
          },
          extra: snapshot,
        });
        setSessionFlag(VISIBILITY_VISIBLE_REPORTED_KEY);
      }
    };

    const scheduleCheck = (phase: string, delayMs: number) => {
      timers.push(window.setTimeout(() => runVisibilityCheck(phase), delayMs));
    };

    for (const check of VISIBILITY_CHECKS) {
      scheduleCheck(check.phase, check.delayMs);
    }

    const handleFocus = () => scheduleCheck('window-focus', 250);
    const handleResize = () => scheduleCheck('window-resize', 500);
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        scheduleCheck('document-visible', 250);
      }
    };

    window.addEventListener('focus', handleFocus);
    window.addEventListener('resize', handleResize);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      cancelled = true;
      for (const timer of timers) window.clearTimeout(timer);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  async function handleVerifiedAddress(address: CanonicalAddress) {
    clearData();
    setCanonicalAddress(address);
    navigate('/location');
  }

  return (
    <div className="row">
      <div className="col-sm-11 col-md-8 col-lg-7 supporter-entry-shell">
        <AddressCaptureCard onVerified={handleVerifiedAddress} />

        {!isLoading ? (
          <div className="supporter-entry-shell__campaign-cta">
            <Link to={campaignCtaTarget} className="supporter-entry-shell__campaign-link">
              Create a campaign &gt;
            </Link>
          </div>
        ) : null}
      </div>
    </div>
  );
}
