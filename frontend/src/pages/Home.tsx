import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWizard } from '../context/WizardContext';
import { useApi } from '../hooks/useApi';
import { validateAddressResponse, getAddressData } from '../helpers/address';
import { reportDiagnostic } from '../helpers/diagnostics';
import type { CanonicalAddress } from '../types';

const VISIBILITY_CHECK_DELAY_MS = 2500;
const VISIBILITY_REPORTED_KEY = 'dio:location-entry-visibility-reported';
const ADDRESS_FORM_ELEMENT_IDS = [
  'form-scope',
  'location-entry',
  'locationInputs',
  'street1',
  'city1',
  'zip1',
  'submitLocation',
];

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

function isHitTestable(element: HTMLElement, rect: DOMRect) {
  if (rect.width === 0 || rect.height === 0) return false;
  if (
    rect.bottom <= 0 ||
    rect.right <= 0 ||
    rect.top >= window.innerHeight ||
    rect.left >= window.innerWidth
  ) {
    return true;
  }

  const x = Math.min(Math.max(rect.left + rect.width / 2, 0), window.innerWidth - 1);
  const y = Math.min(Math.max(rect.top + rect.height / 2, 0), window.innerHeight - 1);
  const topElement = document.elementFromPoint(x, y);

  return !!topElement && (element === topElement || element.contains(topElement));
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
  const { canonicalAddress, clearData, setCanonicalAddress } = useWizard();
  const api = useApi();

  const prior = getAddressData(canonicalAddress);
  const [address, setAddress] = useState(prior.address);
  const [city, setCity] = useState(prior.city);
  const [postal, setPostal] = useState(prior.postal);
  const [error, setError] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem(VISIBILITY_REPORTED_KEY) === '1') return;

    const timer = window.setTimeout(() => {
      const entry = document.getElementById('location-entry');
      const streetInput = document.getElementById('street1');
      const entryRect = entry?.getBoundingClientRect();
      const entryStyle = entry ? window.getComputedStyle(entry) : null;
      const hiddenAncestor = getHiddenAncestor(entry);

      const reasons: string[] = [];
      if (!entry) reasons.push('element-missing');
      if (entryRect && (entryRect.width === 0 || entryRect.height === 0)) reasons.push('zero-rect');
      if (entryStyle?.opacity === '0') reasons.push('opacity-zero');
      if (entryStyle?.visibility === 'hidden') reasons.push('visibility-hidden');
      if (entryStyle?.display === 'none') reasons.push('display-none');
      if (entry && entryRect && !isHitTestable(entry, entryRect)) reasons.push('not-hit-testable');
      if (hiddenAncestor) reasons.push(`hidden-ancestor-${hiddenAncestor.reason}`);
      if (!streetInput) reasons.push('street-input-missing');

      if (reasons.length === 0) return;

      sessionStorage.setItem(VISIBILITY_REPORTED_KEY, '1');

      reportDiagnostic('address-form-invisible', {
        level: 'warning',
        tags: {
          flow: 'address',
          step: 'home',
          diagnostic: 'visibility',
        },
        extra: {
          reasons,
          hiddenAncestor,
          elements: ADDRESS_FORM_ELEMENT_IDS.map(getElementSnapshot),
          path: window.location.pathname,
          hash: window.location.hash,
          userAgent: navigator.userAgent,
          language: navigator.language,
          cookieEnabled: navigator.cookieEnabled,
          windowWidth: window.innerWidth,
          windowHeight: window.innerHeight,
          devicePixelRatio: window.devicePixelRatio,
          documentReadyState: document.readyState,
          prefersReducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
          dataPagefrom: document.getElementById('wrapper')?.getAttribute('data-pagefrom'),
        },
      });

      forceAddressFormVisible();
    }, VISIBILITY_CHECK_DELAY_MS);

    return () => window.clearTimeout(timer);
  }, []);

  const isValid = address.trim() !== '' && city.trim() !== '' && /^\d{5}$/.test(postal.trim());

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setTouched(true);
    if (!isValid) return;

    setError(null);
    setVerifying(true);

    const fullAddress = [address, city, postal].filter(Boolean).join(', ');

    try {
      const result = await api.verifyAddress(fullAddress);
      const validation = validateAddressResponse(null, result, postal.trim());

      if (typeof validation === 'string') {
        setError(validation);
        setVerifying(false);
      } else {
        clearData();
        setCanonicalAddress(validation as CanonicalAddress);
        navigate('/location');
      }
    } catch (err) {
      reportDiagnostic('address-verification-failed', {
        level: 'warning',
        tags: {
          flow: 'address',
          step: 'verify-address',
        },
        extra: {
          errorName: err instanceof Error ? err.name : null,
          errorMessage: err instanceof Error ? err.message : String(err),
          errorCode:
            typeof err === 'object' && err && 'code' in err
              ? String((err as { code?: unknown }).code)
              : null,
          path: window.location.pathname,
          hash: window.location.hash,
        },
        exception: err,
      });
      const validation = validateAddressResponse(err, null, postal.trim());
      setError(typeof validation === 'string' ? validation : 'An unexpected error occurred.');
      setVerifying(false);
    }
  }

  return (
    <>
      <div className="row">
        <div id="location-entry" className="whitebox col-sm-11 col-md-8 col-lg-7">
          <div className="whitebox-container clearfix">
            <form name="locationForm" onSubmit={handleSubmit}>
              <div className="clearfix">
                <div
                  id="locationInputs"
                  className={`clearfix ${isValid ? 'locationValid' : ''}`}
                >
                  <div className="form-group">
                    <label htmlFor="street1">Street address</label>
                    <input
                      type="text"
                      id="street1"
                      name="street"
                      autoComplete="street-address"
                      required
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="form-control input-lg"
                      placeholder="1600 Pennsylvania Ave"
                    />
                  </div>
                  <div className="row">
                    <div className="col-sm-8">
                      <div className="form-group">
                        <label htmlFor="city1">City</label>
                        <input
                          type="text"
                          id="city1"
                          name="city"
                          autoComplete="address-level2"
                          required
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          className="form-control input-lg"
                          placeholder="Washington, DC"
                        />
                      </div>
                    </div>
                    <div className="col-sm-4">
                      <div className="form-group">
                        <label htmlFor="zip1">Zip code</label>
                        <input
                          type="tel"
                          id="zip1"
                          name="zip"
                          autoComplete="postal-code"
                          required
                          pattern="\d{5}"
                          value={postal}
                          onChange={(e) => setPostal(e.target.value)}
                          className="form-control input-lg"
                          placeholder="20500"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div
                  id="submitLocation"
                  className={`clearfix ${isValid ? 'locationValid' : ''}`}
                >
                  <button
                    type="submit"
                    className="btn btn-lg btn-orange"
                    disabled={verifying}
                  >
                    {verifying ? 'Verifying...' : 'Submit'}
                  </button>
                </div>
              </div>

              {error && touched && (
                <div className="alert alert-danger">{error}</div>
              )}
            </form>

            <div className="whitebox-footer text-center">
              Democracy.io uses the{' '}
              <a href="https://smartystreets.com/" target="_blank" rel="noopener noreferrer">
                SmartyStreets Geocoding API
              </a>{' '}
              to look up your representatives.
            </div>
          </div>
        </div>
      </div>

    </>
  );
}
