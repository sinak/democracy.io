import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CampaignStatusBadge } from '../../components/CampaignStatusBadge';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { OrganizerPageLayout } from '../../components/OrganizerPageLayout';
import { useAuth } from '../../context/AuthContext';
import { buildCampaignPath } from '../../helpers/campaign-path';
import {
  buildCampaignPublicUrl,
  getCampaignStatusLabel,
  summarizeCampaignRecord,
} from '../../helpers/campaign-editor';
import { listOrganizerCampaigns } from '../../helpers/campaign-api';
import type { Campaign } from '../../types';

async function copyText(value: string) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(value);
    return;
  }

  const textarea = document.createElement('textarea');
  textarea.value = value;
  textarea.setAttribute('readonly', 'true');
  textarea.style.position = 'absolute';
  textarea.style.left = '-9999px';
  document.body.appendChild(textarea);
  textarea.select();
  const copied = document.execCommand('copy');
  document.body.removeChild(textarea);

  if (!copied) {
    throw new Error('Copy command failed.');
  }
}

export function OrganizerCampaignList() {
  const { session, user } = useAuth();
  const accessToken = session?.access_token || null;
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [copyStatus, setCopyStatus] = useState<{
    campaignId: string;
    status: 'copied' | 'error';
  } | null>(null);
  const [loadResult, setLoadResult] = useState<{
    accessToken: string;
    error: string | null;
  } | null>(null);
  const error =
    loadResult?.accessToken === accessToken ? loadResult.error : null;
  const isLoading = Boolean(accessToken && loadResult?.accessToken !== accessToken);

  useEffect(() => {
    let active = true;

    if (!accessToken) {
      return;
    }

    void listOrganizerCampaigns(accessToken)
      .then((nextCampaigns) => {
        if (!active) {
          return;
        }

        setCampaigns(nextCampaigns);
        setLoadResult({ accessToken, error: null });
      })
      .catch((nextError) => {
        if (!active) {
          return;
        }

        setLoadResult({
          accessToken,
          error:
            nextError instanceof Error
              ? nextError.message
              : 'Unable to load organizer campaigns.',
        });
      });

    return () => {
      active = false;
    };
  }, [accessToken]);

  useEffect(() => {
    if (!copyStatus) {
      return;
    }

    const timer = window.setTimeout(() => {
      setCopyStatus(null);
    }, 2400);

    return () => {
      window.clearTimeout(timer);
    };
  }, [copyStatus]);

  const handleCopyCampaignUrl = async (campaign: Campaign) => {
    try {
      await copyText(buildCampaignPublicUrl(campaign.slug));
      setCopyStatus({ campaignId: campaign.id, status: 'copied' });
    } catch (copyError) {
      console.warn('Copy campaign link failed.', copyError);
      setCopyStatus({ campaignId: campaign.id, status: 'error' });
    }
  };

  return (
    <OrganizerPageLayout
      eyebrow="Organizer workspace"
      title="Campaigns"
      intro=""
      showHero={false}
    >
      {error ? <div className="alert alert-danger organizer-alert">{error}</div> : null}

      <header className="organizer-campaign-list-header">
        <div className="organizer-campaign-list-header__copy">
          <div className="organizer-eyebrow organizer-eyebrow--left">Organizer workspace</div>
          <h1 className="organizer-campaign-list-title">Campaigns</h1>
          <p className="organizer-campaign-list-intro">
            Signed in as {user?.email || 'an organizer'}. Create campaign content once, then come
            back here to enable or disable it. Only one campaign can stay enabled at a time.
          </p>

          <Link
            to="/organizer/campaigns/new"
            className="site-nav__link organizer-campaign-list-action"
          >
            Create a new campaign
          </Link>
        </div>
      </header>

      {isLoading ? (
        <LoadingSpinner
          className="organizer-inline-loading"
          message="Loading organizer campaigns..."
          secondaryMessage="Fetching the live campaign list from the organizer API."
        />
      ) : campaigns.length === 0 ? (
        <div className="organizer-placeholder-block">
          <span className="organizer-eyebrow organizer-eyebrow--left">No campaigns yet</span>
          <h2>Start your first campaign</h2>
          <p>
            Create your first campaign here. Once it exists, the content stays read-only and you
            can only enable or disable it.
          </p>
        </div>
      ) : (
        <div className="organizer-card-stack organizer-card-stack--campaign-list">
          {campaigns.map((campaign) => {
            const publicUrl = buildCampaignPublicUrl(campaign.slug);
            const activeCopyStatus =
              copyStatus?.campaignId === campaign.id ? copyStatus.status : null;

            return (
              <article
                key={campaign.id}
                className="organizer-campaign-card organizer-campaign-card--campaign-list"
              >
                <div className="organizer-campaign-card__header">
                  <div>
                    <div className="organizer-campaign-card__meta-row">
                      <CampaignStatusBadge status={campaign.status} />
                      <span className="organizer-card-kicker">
                        {getCampaignStatusLabel(campaign)}
                        {' '}
                        · {buildCampaignPath(campaign.slug)}
                      </span>
                    </div>
                    <h2>{campaign.title}</h2>
                  </div>

                  <Link
                    to={`/organizer/campaigns/${campaign.id}/edit`}
                    className="organizer-inline-link"
                  >
                    Manage campaign
                  </Link>
                </div>

                <p>{summarizeCampaignRecord(campaign)}</p>

                {campaign.status === 'disabled' ? (
                  <p className="organizer-card-status-note">
                    This campaign was disabled by an admin and will stay unavailable until it is
                    restored.
                  </p>
                ) : campaign.status === 'archived' ? (
                  <p className="organizer-card-status-note">
                    This campaign is disabled. Visitors can still open the page, but the contact form
                    stays hidden until you enable it again.
                  </p>
                ) : null}

                <div className="organizer-campaign-card__share-row">
                  <div className="organizer-campaign-card__public-link">
                    <span>Public link</span>
                    <a href={publicUrl} target="_blank" rel="noreferrer">
                      {publicUrl}
                    </a>
                  </div>

                  <div className="organizer-campaign-card__share-actions">
                    <button
                      type="button"
                      className="site-nav__button organizer-campaign-card__share-button"
                      onClick={() => {
                        void handleCopyCampaignUrl(campaign);
                      }}
                    >
                      {activeCopyStatus === 'copied'
                        ? 'Link copied'
                        : activeCopyStatus === 'error'
                          ? 'Copy failed'
                          : 'Copy link'}
                    </button>
                    <Link
                      to={`/organizer/campaigns/${campaign.id}/share`}
                      state={{ campaign }}
                      className="site-nav__link organizer-campaign-card__share-button"
                    >
                      Share link
                    </Link>
                  </div>
                </div>

                <dl className="organizer-meta-list organizer-meta-list--single">
                  <div>
                    <dt>Flow starts</dt>
                    <dd>{campaign.stats.flowStarts}</dd>
                  </div>
                </dl>
              </article>
            );
          })}
        </div>
      )}
    </OrganizerPageLayout>
  );
}
