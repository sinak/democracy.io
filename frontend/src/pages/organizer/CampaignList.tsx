import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CampaignStatusBadge } from '../../components/CampaignStatusBadge';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { OrganizerPageLayout } from '../../components/OrganizerPageLayout';
import { useAuth } from '../../context/AuthContext';
import { buildCampaignPath } from '../../helpers/campaign-path';
import {
  getCampaignStatusLabel,
  summarizeCampaignRecord,
} from '../../helpers/campaign-editor';
import { listOrganizerCampaigns } from '../../helpers/campaign-api';
import type { Campaign } from '../../types';

function formatDate(value: string | null) {
  if (!value) {
    return 'Not yet';
  }

  return new Date(value).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function OrganizerCampaignList() {
  const { session, user } = useAuth();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;

    if (!session?.access_token) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    void listOrganizerCampaigns(session.access_token)
      .then((nextCampaigns) => {
        if (!active) {
          return;
        }

        setCampaigns(nextCampaigns);
        setError(null);
      })
      .catch((nextError) => {
        if (!active) {
          return;
        }

        setError(
          nextError instanceof Error
            ? nextError.message
            : 'Unable to load organizer campaigns.'
        );
      })
      .finally(() => {
        if (active) {
          setIsLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [session?.access_token]);

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
          {campaigns.map((campaign) => (
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

              <dl className="organizer-meta-list">
                <div>
                  <dt>Updated</dt>
                  <dd>{formatDate(campaign.updatedAt)}</dd>
                </div>
                <div>
                  <dt>First publish</dt>
                  <dd>{formatDate(campaign.firstPublishedAt)}</dd>
                </div>
                <div>
                  <dt>Messages sent</dt>
                  <dd>{campaign.stats.totalMessagesSent}</dd>
                </div>
                <div>
                  <dt>Flow starts</dt>
                  <dd>{campaign.stats.flowStarts}</dd>
                </div>
              </dl>
            </article>
          ))}
        </div>
      )}
    </OrganizerPageLayout>
  );
}
