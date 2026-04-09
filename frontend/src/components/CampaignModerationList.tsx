import type { Campaign } from '../types';
import { summarizeCampaignRecord } from '../helpers/campaign-editor';
import { CampaignStatusBadge } from './CampaignStatusBadge';

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

export function CampaignModerationList({
  campaigns,
  pendingId,
  onModerate,
}: {
  campaigns: Campaign[];
  pendingId: string | null;
  onModerate: (campaign: Campaign) => void;
}) {
  if (campaigns.length === 0) {
    return (
      <div className="organizer-empty-state">
        <h2>No campaigns match this view</h2>
        <p>Try widening the filters or wait for new organizer drafts to arrive.</p>
      </div>
    );
  }

  return (
    <div className="organizer-card-stack">
      {campaigns.map((campaign) => {
        const actionLabel =
          pendingId === campaign.id
            ? 'Saving...'
            : campaign.status === 'disabled'
              ? 'Restore'
              : 'Disable';

        return (
          <article key={campaign.id} className="organizer-campaign-card">
            <div className="organizer-campaign-card__header">
              <div>
                <CampaignStatusBadge status={campaign.status} />
                <h2>{campaign.title}</h2>
              </div>

              <button
                type="button"
                className="site-nav__button organizer-moderation-action"
                disabled={pendingId === campaign.id}
                onClick={() => onModerate(campaign)}
              >
                {actionLabel}
              </button>
            </div>

            <p>{summarizeCampaignRecord(campaign)}</p>

            <dl className="organizer-meta-list">
              <div>
                <dt>Organizer</dt>
                <dd>{campaign.organizerEmail}</dd>
              </div>
              <div>
                <dt>Slug</dt>
                <dd>/{campaign.slug}</dd>
              </div>
              <div>
                <dt>First publish</dt>
                <dd>{formatDate(campaign.firstPublishedAt)}</dd>
              </div>
              <div>
                <dt>Messages sent</dt>
                <dd>{campaign.stats.totalMessagesSent}</dd>
              </div>
            </dl>
          </article>
        );
      })}
    </div>
  );
}
