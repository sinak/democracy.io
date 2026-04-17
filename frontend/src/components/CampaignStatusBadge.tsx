import type { CampaignStatus } from '../types';

export function CampaignStatusBadge({ status }: { status: CampaignStatus }) {
  const label =
    status === 'published'
      ? 'Enabled'
      : status === 'archived'
        ? 'Disabled'
        : status === 'disabled'
          ? 'Disabled by admin'
          : 'Draft';

  return (
    <span className={`organizer-status-badge is-${status}`}>
      {label}
    </span>
  );
}
