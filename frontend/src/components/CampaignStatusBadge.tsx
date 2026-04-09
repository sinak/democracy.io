import type { CampaignStatus } from '../types';

export function CampaignStatusBadge({ status }: { status: CampaignStatus }) {
  return (
    <span className={`organizer-status-badge is-${status}`}>
      {status === 'disabled' ? 'Disabled' : status}
    </span>
  );
}

