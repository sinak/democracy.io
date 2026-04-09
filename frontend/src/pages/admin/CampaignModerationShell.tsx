import { useEffect, useMemo, useState } from 'react';
import { CampaignModerationList } from '../../components/CampaignModerationList';
import { HelperCard } from '../../components/HelperCard';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { OrganizerPageLayout } from '../../components/OrganizerPageLayout';
import { useAuth } from '../../context/AuthContext';
import {
  disableCampaign,
  listAdminCampaigns,
  restoreCampaign,
} from '../../helpers/campaign-api';
import type { Campaign, CampaignStatus } from '../../types';

type CampaignStatusFilter = CampaignStatus | 'all';

export function CampaignModerationShell() {
  const { session } = useAuth();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<CampaignStatusFilter>('all');
  const [query, setQuery] = useState('');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    if (!session?.access_token) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    void listAdminCampaigns(session.access_token)
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
          nextError instanceof Error ? nextError.message : 'Unable to load admin campaigns.'
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

  async function handleModeration(campaign: Campaign) {
    if (!session?.access_token) {
      return;
    }

    setPendingId(campaign.id);
    setError(null);
    setSuccessMessage(null);

    try {
      const nextCampaign =
        campaign.status === 'disabled'
          ? await restoreCampaign(session.access_token, campaign.id)
          : await disableCampaign(session.access_token, campaign.id);

      setCampaigns((currentCampaigns) =>
        currentCampaigns.map((item) => (item.id === campaign.id ? nextCampaign : item))
      );
      setSuccessMessage(
        nextCampaign.status === 'disabled'
          ? 'Campaign disabled.'
          : 'Campaign restored.'
      );
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : 'Unable to update the campaign.');
    } finally {
      setPendingId(null);
    }
  }

  const filteredCampaigns = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return campaigns.filter((campaign) => {
      const matchesStatus =
        statusFilter === 'all' ? true : campaign.status === statusFilter;
      const matchesQuery =
        !normalizedQuery ||
        campaign.title.toLowerCase().includes(normalizedQuery) ||
        campaign.slug.toLowerCase().includes(normalizedQuery) ||
        campaign.organizerEmail.toLowerCase().includes(normalizedQuery);

      return matchesStatus && matchesQuery;
    });
  }, [campaigns, query, statusFilter]);

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
      eyebrow="Admin moderation"
      title="Moderate organizer campaigns"
      intro="Review live campaign records, filter by status or organizer, and disable or restore campaigns without dropping into a separate back-office tool."
      tone="admin"
      sidebarMode="stack"
      sidebar={
        <>
          <HelperCard title="Moderation overview">
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

          <HelperCard title="Admin notes">
            <p>Disable hides a campaign in-app without deleting the organizer’s work.</p>
            <p>Restore returns the campaign to the state it held immediately before disable.</p>
            <p>
              Filters stay intentionally light so moderation keeps the same editorial feel as the
              organizer side.
            </p>
          </HelperCard>
        </>
      }
    >
      {error ? <div className="alert alert-danger organizer-alert">{error}</div> : null}
      {successMessage ? (
        <div className="alert alert-success organizer-alert organizer-inline-alert">
          {successMessage}
        </div>
      ) : null}

      <div className="organizer-filter-bar">
        <div className="organizer-filter-field">
          <label>Status filter</label>
          <select
            className="form-control input-lg"
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value as CampaignStatusFilter)}
          >
            <option value="all">All campaigns</option>
            <option value="draft">Drafts</option>
            <option value="published">Published</option>
            <option value="archived">Archived</option>
            <option value="disabled">Disabled</option>
          </select>
        </div>

        <div className="organizer-filter-field organizer-filter-field--search">
          <label>Search title, slug, or organizer</label>
          <input
            className="form-control input-lg"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>

        <div className="organizer-filter-summary">
          <span>{filteredCampaigns.length}</span>
          <p>campaigns in view</p>
        </div>
      </div>

      {isLoading ? (
        <LoadingSpinner
          className="organizer-inline-loading"
          message="Loading moderation queue..."
          secondaryMessage="Fetching the admin campaign list."
        />
      ) : (
        <CampaignModerationList
          campaigns={filteredCampaigns}
          pendingId={pendingId}
          onModerate={(campaign) => void handleModeration(campaign)}
        />
      )}
    </OrganizerPageLayout>
  );
}
