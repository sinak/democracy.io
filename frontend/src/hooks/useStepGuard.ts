import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWizard } from '../context/WizardContext';
import { getCampaignEntryPath } from '../helpers/public-campaign';

/**
 * Redirects to a previous step if required data is missing.
 */
export function useStepGuard(requirements: ('address' | 'legislators' | 'selections' | 'responses')[]) {
  const navigate = useNavigate();
  const {
    activeCampaign,
    canonicalAddress,
    legislators,
    bioguideIdsBySelection,
    messageResponses,
  } = useWizard();

  useEffect(() => {
    const entryPath = getCampaignEntryPath(activeCampaign);

    for (const req of requirements) {
      switch (req) {
        case 'address':
          if (!canonicalAddress) {
            navigate(entryPath, { replace: true });
            return;
          }
          break;
        case 'legislators':
          if (legislators.length === 0) {
            navigate(entryPath, { replace: true });
            return;
          }
          break;
        case 'selections': {
          const hasSelections = Object.values(bioguideIdsBySelection).some(Boolean);
          if (!hasSelections || !canonicalAddress) {
            navigate('/location', { replace: true });
            return;
          }
          break;
        }
        case 'responses':
          if (messageResponses.length === 0) {
            navigate('/location', { replace: true });
            return;
          }
          break;
      }
    }
  }, [activeCampaign, bioguideIdsBySelection, canonicalAddress, legislators.length, messageResponses.length, navigate, requirements]);
}
