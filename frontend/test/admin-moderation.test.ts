import { describe, expect, it } from '../vendor/vitest/index.js';
import { getCampaignModerationActionLabel } from '../src/helpers/campaign-editor.ts';

describe('campaign moderation helpers', () => {
  it('shows restore only for disabled campaigns and disable for every other state', () => {
    expect(getCampaignModerationActionLabel('disabled')).toBe('Restore');
    expect(getCampaignModerationActionLabel('draft')).toBe('Disable');
    expect(getCampaignModerationActionLabel('published')).toBe('Disable');
    expect(getCampaignModerationActionLabel('archived')).toBe('Disable');
  });
});
