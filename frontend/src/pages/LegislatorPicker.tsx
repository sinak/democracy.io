import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWizard } from '../context/WizardContext';
import { useApi } from '../hooks/useApi';
import { useStepGuard } from '../hooks/useStepGuard';
import { LoadingSpinner } from '../components/LoadingSpinner';

export function LegislatorPicker() {
  useStepGuard(['address']);

  const navigate = useNavigate();
  const api = useApi();
  const {
    canonicalAddress,
    legislators,
    bioguideIdsBySelection,
    setLegislators,
    setBioguideIdsBySelection,
  } = useWizard();

  const [loading, setLoading] = useState(legislators.length === 0);
  const [loadingDelay, setLoadingDelay] = useState(true);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setLoadingDelay(false);
    }, 350);

    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (legislators.length > 0 || !canonicalAddress) return;

    api
      .findLegislatorsByDistrict(
        canonicalAddress.components.stateAbbreviation,
        canonicalAddress.district
      )
      .then((legs) => {
        if (legs && legs.length > 0) {
          setLegislators(legs);
        }
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, []);

  const toggleSelection = (bioguideId: string) => {
    setBioguideIdsBySelection({
      ...bioguideIdsBySelection,
      [bioguideId]: !bioguideIdsBySelection[bioguideId],
    });
  };

  const anySelected = Object.values(bioguideIdsBySelection).some(Boolean);

  const handleSubmit = () => {
    navigate('/compose');
  };

  if (loadingDelay && loading) {
    return <div className="row" />;
  }

  if (loading) {
    return (
      <div className="row">
        <LoadingSpinner message="Finding your representatives ..." />
      </div>
    );
  }

  return (
    <div className="row">
      <div id="pick-legislators" className="whitebox col-sm-9 col-md-8 col-md-offset-3">
        <button className="btn-sm btn-warning back-button" onClick={() => navigate('/')}>
          Go back
        </button>

        <div className="whitebox-container">
          <p>Choose which representatives you'd like to write to:</p>

          {legislators.map((legislator) => {
            const disabled = legislator.defunct || legislator.comingSoon;
            return (
              <div className="repOption checkbox" key={legislator.bioguideId}>
                <input
                  type="checkbox"
                  id={legislator.bioguideId}
                  checked={!!bioguideIdsBySelection[legislator.bioguideId]}
                  disabled={!!disabled}
                  onChange={() => toggleSelection(legislator.bioguideId)}
                />
                <label
                  htmlFor={legislator.bioguideId}
                  className={legislator.defunct ? 'defunct-legislator' : ''}
                >
                  {legislator.title}. {legislator.firstName} {legislator.lastName}
                  {legislator.defunct && (
                    <div>
                      Sorry, we can't message this legislator at the moment. We are working to
                      fix the problem. Please contact them{' '}
                      <a target="_blank" rel="noopener noreferrer" href={legislator.contact_url}>
                        here
                      </a>{' '}
                      instead.
                    </div>
                  )}
                  {legislator.comingSoon && <span> [Coming soon]</span>}
                </label>
              </div>
            );
          })}

          <button
            type="submit"
            className="btn btn-lg btn-orange"
            disabled={!anySelected}
            onClick={handleSubmit}
          >
            Write to them!
          </button>
        </div>
      </div>
    </div>
  );
}
