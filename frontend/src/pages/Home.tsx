import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AddressCaptureCard } from '../components/AddressCaptureCard';
import { useWizard } from '../context/WizardContext';
import type { CanonicalAddress } from '../types';

export function Home() {
  const navigate = useNavigate();
  const { clearCampaignContext, clearData, setCanonicalAddress } = useWizard();

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
      </div>
    </div>
  );
}
