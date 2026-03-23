import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWizard } from '../context/WizardContext';
import { useApi } from '../hooks/useApi';
import { validateAddressResponse, getAddressData } from '../helpers/address';
import type { CanonicalAddress } from '../types';

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
      const validation = validateAddressResponse(err, null, postal.trim());
      setError(typeof validation === 'string' ? validation : 'An unexpected error occurred.');
      setVerifying(false);
    }
  }

  return (
    <>
      <div className="row">
        <div id="address" className="whitebox col-sm-11 col-md-8 col-lg-7">
          <div className="whitebox-container clearfix">
            <form name="addressForm" onSubmit={handleSubmit}>
              <div className="clearfix">
                <div
                  id="addressInputs"
                  className={`clearfix ${isValid ? 'addressValid' : ''}`}
                >
                  <div className="form-group">
                    <label htmlFor="streetAddress1">Street address</label>
                    <input
                      type="text"
                      id="streetAddress1"
                      name="address"
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
                          name="postal"
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
                  id="submitAddress"
                  className={`clearfix ${isValid ? 'addressValid' : ''}`}
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

      <div id="brand">
        <span className="hidden-xs">
          Originally built by{' '}
          <a href="https://eff.org" className="img-link">
            <img width="40" src="/img/eff-logo.png" alt="EFF logo" />
          </a>{' '}
          now maintained by <a href="https://taskforce.is">Taskforce.is</a>
        </span>
        <span className="visible-xs">
          Originally built by <a href="https://eff.org">Electronic Frontier Foundation</a> now
          maintained by <a href="https://taskforce.is">Taskforce.is</a>
        </span>
      </div>
    </>
  );
}
