import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AddressCaptureCard } from '../components/AddressCaptureCard';
import { useAuth } from '../context/AuthContext';
import { useWizard } from '../context/WizardContext';
import type { CanonicalAddress } from '../types';

export function Home() {
  const navigate = useNavigate();
  const { isLoading, user } = useAuth();
  const { clearCampaignContext, clearData, setCanonicalAddress } = useWizard();
  const campaignCtaTarget =
    user ? '/organizer/campaigns/new' : '/organizer/sign-in?next=%2Forganizer%2Fcampaigns%2Fnew';

  useEffect(() => {
    clearCampaignContext();
  }, [clearCampaignContext]);

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
