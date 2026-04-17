import { Link, useLocation } from 'react-router-dom';
import { useWizard } from '../context/WizardContext';
import { buildCampaignPath } from '../helpers/campaign-path';

function getCampaignFlowBannerShellClassName(pathname: string) {
  if (pathname === '/location') {
    return 'col-sm-9 col-md-8';
  }

  if (pathname === '/compose' || pathname === '/captcha') {
    return 'col-md-10';
  }

  if (pathname === '/thanks') {
    return 'col-sm-8 col-md-6 col-lg-5';
  }

  return 'col-md-10';
}

export function CampaignFlowBanner() {
  const location = useLocation();
  const { activeCampaign } = useWizard();

  if (!activeCampaign) {
    return null;
  }

  const shellClassName = getCampaignFlowBannerShellClassName(location.pathname);

  return (
    <div className="container">
      <div className="row">
        <div className={`campaign-flow-banner-shell ${shellClassName}`}>
          <div className="campaign-flow-banner">
            <div className="campaign-flow-banner__copy">
              <span className="campaign-flow-banner__eyebrow">Campaign</span>
              <strong>{activeCampaign.title}</strong>
              {activeCampaign.organizationName ? (
                <span>{activeCampaign.organizationName}</span>
              ) : null}
            </div>
            <Link className="campaign-flow-banner__link" to={buildCampaignPath(activeCampaign.slug)}>
              View campaign
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
