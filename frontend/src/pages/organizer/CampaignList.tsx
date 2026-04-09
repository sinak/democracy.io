import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { CampaignStatusBadge } from '../../components/CampaignStatusBadge';
import { HelperCard } from '../../components/HelperCard';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { OrganizerPageLayout } from '../../components/OrganizerPageLayout';
import { useAuth } from '../../context/AuthContext';
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

  const counts = useMemo(() => {
    return campaigns.reduce(
      (summary, campaign) => {
        summary.total += 1;
        summary[campaign.status] += 1;
        return summary;
      },
      {
        total: 0,
        draft: 0,
        published: 0,
        archived: 0,
        disabled: 0,
      }
    );
  }, [campaigns]);

  return (
    <OrganizerPageLayout
      eyebrow="Organizer workspace"
      title="Campaigns tied to your account"
      intro={`Signed in as ${user?.email || 'an organizer'}. Create drafts, refine the campaign copy, publish when it is ready, and keep track of disabled or archived work without leaving the workspace.`}
      actions={
        <Link
          to="/organizer/campaigns/new"
          className="btn btn-lg btn-orange organizer-primary-action"
        >
          Create a campaign
        </Link>
      }
      sidebarMode="stack"
      sidebar={
        <>
          <HelperCard title="Your campaign states">
            <dl className="organizer-meta-list organizer-meta-list--stacked">
              <div>
                <dt>Total</dt>
                <dd>{counts.total}</dd>
              </div>
              <div>
                <dt>Drafts</dt>
                <dd>{counts.draft}</dd>
              </div>
              <div>
                <dt>Published</dt>
                <dd>{counts.published}</dd>
              </div>
              <div>
                <dt>Archived</dt>
                <dd>{counts.archived}</dd>
              </div>
              <div>
                <dt>Disabled</dt>
                <dd>{counts.disabled}</dd>
              </div>
            </dl>
          </HelperCard>

          <HelperCard title="Workflow notes">
            <p>Drafts stay fully editable, including the slug.</p>
            <p>
              Once a campaign is published for the first time, the slug locks and the future public
              path becomes stable.
            </p>
            <p>
              Disabled campaigns stay visible here so you can review them, but only admins can
              restore them.
            </p>
          </HelperCard>
        </>
      }
    >
      {error ? <div className="alert alert-danger organizer-alert">{error}</div> : null}

      {isLoading ? (
        <LoadingSpinner
          className="organizer-inline-loading"
          message="Loading organizer campaigns..."
          secondaryMessage="Fetching the live campaign list from the organizer API."
        />
      ) : campaigns.length === 0 ? (
        <div className="organizer-empty-state">
          <h2>No campaigns yet</h2>
          <p>
            Start your first draft here. Any signed-in email can create campaigns, save draft copy,
            and publish later.
          </p>
        </div>
      ) : (
        <div className="organizer-card-stack">
          {campaigns.map((campaign) => (
            <article key={campaign.id} className="organizer-campaign-card">
              <div className="organizer-campaign-card__header">
                <div>
                  <CampaignStatusBadge status={campaign.status} />
                  <h2>{campaign.title}</h2>
                  <p className="organizer-card-kicker">
                    {getCampaignStatusLabel(campaign)}
                    {' '}
                    · /campaigns/{campaign.slug}
                  </p>
                </div>

                <Link
                  to={`/organizer/campaigns/${campaign.id}/edit`}
                  className="organizer-inline-link"
                >
                  Open editor
                </Link>
              </div>

              <p>{summarizeCampaignRecord(campaign)}</p>

              {campaign.status === 'disabled' ? (
                <p className="organizer-card-status-note">
                  Disabled campaigns stay read-only here until an admin restores them.
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
