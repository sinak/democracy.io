import { useState, type FormEvent } from 'react';
import { validateAddressResponse, getAddressData } from '../helpers/address';
import { useApi } from '../hooks/useApi';
import { useWizard } from '../context/WizardContext';
import type { CanonicalAddress } from '../types';

interface AddressCaptureCardProps {
  className?: string;
  submitLabel?: string;
  onVerified: (address: CanonicalAddress) => Promise<void> | void;
}

export function AddressCaptureCard({
  className = '',
  submitLabel = 'Submit',
  onVerified,
}: AddressCaptureCardProps) {
  const api = useApi();
  const { canonicalAddress } = useWizard();
  const prior = getAddressData(canonicalAddress);
  const [address, setAddress] = useState(prior.address);
  const [city, setCity] = useState(prior.city);
  const [postal, setPostal] = useState(prior.postal);
  const [error, setError] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [touched, setTouched] = useState(false);

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
        return;
      }

      await onVerified(validation as CanonicalAddress);
    } catch (err) {
      const validation = validateAddressResponse(err, null, postal.trim());
      setError(typeof validation === 'string' ? validation : 'An unexpected error occurred.');
      setVerifying(false);
    }
  }

  return (
    <div id="address" className={`whitebox ${className}`.trim()}>
      <div className="whitebox-container clearfix">
        <form name="addressForm" onSubmit={handleSubmit}>
          <div className="clearfix">
            <div id="addressInputs" className={`clearfix ${isValid ? 'addressValid' : ''}`}>
              <div className="form-group">
                <label htmlFor="streetAddress1">Street address</label>
                <input
                  type="text"
                  id="streetAddress1"
                  name="address"
                  autoComplete="street-address"
                  required
                  value={address}
                  onChange={(event) => setAddress(event.target.value)}
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
                      onChange={(event) => setCity(event.target.value)}
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
                      name="postal"
                      autoComplete="postal-code"
                      required
                      pattern="\d{5}"
                      value={postal}
                      onChange={(event) => setPostal(event.target.value)}
                      className="form-control input-lg"
                      placeholder="20500"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div id="submitAddress" className={`clearfix ${isValid ? 'addressValid' : ''}`}>
              <button type="submit" className="btn btn-lg btn-orange" disabled={verifying}>
                {verifying ? 'Verifying...' : submitLabel}
              </button>
            </div>
          </div>

          {error && touched ? <div className="alert alert-danger">{error}</div> : null}
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
  );
}
