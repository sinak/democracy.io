import { useEffect, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { ShareCard } from '../../components/ShareCard';
import { useAuth } from '../../context/AuthContext';
import { getOrganizerCampaign } from '../../helpers/campaign-api';
import { buildCampaignPublicUrl } from '../../helpers/campaign-editor';
import type { Campaign } from '../../types';

interface CampaignShareLocationState {
  campaign?: Campaign;
}

function getCampaignFromLocationState(
  state: unknown,
  campaignId: string | undefined
) {
  const candidate = (state as CampaignShareLocationState | null)?.campaign;

  if (!candidate || candidate.id !== campaignId) {
    return null;
  }

  return candidate;
}

function buildOrganizerCampaignShareText(campaign: Campaign, shareUrl: string) {
  if (campaign.organizationName) {
    return `${campaign.organizationName} launched ${campaign.title} on Democracy.io. Use this page to write Congress: ${shareUrl}`;
  }

  return `${campaign.title} is live on Democracy.io. Use this page to write Congress: ${shareUrl}`;
}

export function CampaignShareShell() {
  const { campaignId } = useParams();
  const location = useLocation();
  const { session, user } = useAuth();
  const stateCampaign = getCampaignFromLocationState(location.state, campaignId);
  const [fetchedCampaign, setFetchedCampaign] = useState<Campaign | null>(null);
  const [loadError, setLoadError] = useState<{
    campaignId: string;
    message: string;
  } | null>(null);
  const campaign =
    stateCampaign || (fetchedCampaign?.id === campaignId ? fetchedCampaign : null);
  const visibleError =
    !campaign && loadError && loadError.campaignId === campaignId
      ? loadError.message
      : null;
  const canFetchCampaign = Boolean(session?.access_token && campaignId);
  const isLoading = !campaign && !visibleError && canFetchCampaign;

  useEffect(() => {
    let active = true;

    if (stateCampaign || !session?.access_token || !campaignId) {
      return;
    }

    void getOrganizerCampaign(session.access_token, campaignId)
      .then((nextCampaign) => {
        if (!active) {
          return;
        }

        setFetchedCampaign(nextCampaign);
        setLoadError(null);
      })
      .catch((nextError) => {
        if (!active) {
          return;
        }

        setLoadError({
          campaignId,
          message:
            nextError instanceof Error
              ? nextError.message
              : 'Unable to load this campaign.',
        });
      });

    return () => {
      active = false;
    };
  }, [campaignId, session?.access_token, stateCampaign]);

  const shareUrl = campaign ? buildCampaignPublicUrl(campaign.slug) : '';
  const shareText = campaign ? buildOrganizerCampaignShareText(campaign, shareUrl) : '';

  return (
    <div className="organizer-shell organizer-shell--organizer organizer-campaign-share-shell">
      <div className="container">
        <div className="row">
          {isLoading ? (
            <div className="col-sm-12 col-md-8 col-md-offset-2">
              <div className="whitebox organizer-campaign-share-loading">
                <div className="whitebox-container">
                  <LoadingSpinner
                    message="Loading campaign link..."
                    secondaryMessage="Fetching the public campaign page before showing share options."
                  />
                </div>
              </div>
            </div>
          ) : visibleError || !campaign ? (
            <div className="col-sm-12 col-md-8 col-md-offset-2">
              <div className="whitebox organizer-campaign-share-error">
                <div className="whitebox-container">
                  <div className="organizer-eyebrow">Campaign share</div>
                  <h1 className="organizer-page-title">Campaign link unavailable</h1>
                  <p className="organizer-page-intro">
                    {visibleError || 'This campaign could not be loaded.'}
                  </p>
                  <div className="organizer-page-actions">
                    <Link to="/organizer/campaigns" className="site-nav__link">
                      Back to campaigns
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <ShareCard
              className="col-sm-8 col-md-6 col-lg-5 organizer-campaign-share-card"
              feedbackIdle={`Campaign: ${campaign.title}`}
              headline="Your public campaign page is ready to share."
              kicker="Campaign created"
              secondaryActions={
                <>
                  <a
                    href={shareUrl}
                    className="organizer-inline-link"
                    rel="noreferrer"
                    target="_blank"
                  >
                    Open public page
                  </a>
                  <Link
                    to={`/organizer/campaigns/${campaign.id}/edit`}
                    className="organizer-inline-link"
                  >
                    Manage campaign
                  </Link>
                  <Link to="/organizer/campaigns" className="organizer-inline-link">
                    Back to campaigns
                  </Link>
                </>
              }
              shareText={shareText}
              shareUrl={shareUrl}
              shareUrlLabel="Public link"
              showShareUrl
              subtitle={`Share ${campaign.title} so supporters can send their own message to Congress${campaign.organizationName ? ` with ${campaign.organizationName}` : ''}.`}
              textActionLabel="Text this link"
            />
          )}
        </div>

        {campaign ? (
          <p className="organizer-campaign-share-user">
            Signed in as {user?.email || 'an organizer'}.
          </p>
        ) : null}
      </div>
    </div>
  );
}
