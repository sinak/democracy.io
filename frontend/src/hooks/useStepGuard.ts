import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWizard } from '../context/WizardContext';

/**
 * Redirects to a previous step if required data is missing.
 */
export function useStepGuard(requirements: ('address' | 'legislators' | 'selections' | 'responses')[]) {
  const navigate = useNavigate();
  const { canonicalAddress, legislators, bioguideIdsBySelection, messageResponses } = useWizard();

  useEffect(() => {
    for (const req of requirements) {
      switch (req) {
        case 'address':
          if (!canonicalAddress) {
            navigate('/', { replace: true });
            return;
          }
          break;
        case 'legislators':
          if (legislators.length === 0) {
            navigate('/', { replace: true });
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
  }, []);  // Only check on mount
}
