import { Link } from 'react-router-dom';
import { useWizard } from '../context/WizardContext';
import { buildCampaignPath } from '../helpers/public-campaign';

export function CampaignFlowBanner() {
  const { activeCampaign } = useWizard();

  if (!activeCampaign) {
    return null;
  }

  return (
    <div className="container">
      <div className="campaign-flow-banner">
        <div className="campaign-flow-banner__copy">
          <span className="campaign-flow-banner__eyebrow">Campaign</span>
          <strong>{activeCampaign.title}</strong>
          {activeCampaign.organizationName ? <span>{activeCampaign.organizationName}</span> : null}
        </div>
        <Link className="campaign-flow-banner__link" to={buildCampaignPath(activeCampaign.slug)}>
          View campaign
        </Link>
      </div>
    </div>
  );
}
