import React from 'react';
import { render } from '@testing-library/react';
import { describe, expect, it } from '../vendor/vitest/index.js';
import {
  applyActiveCampaignState,
  buildResetWizardState,
  defaultWizardState,
} from '../src/context/WizardContext.tsx';
import {
  buildCampaignPath,
  getCampaignSlugFromPath,
  isCampaignPath,
} from '../src/helpers/campaign-path.ts';
import {
  getCampaignComposePrefill,
  getPublicCampaignContent,
} from '../src/helpers/public-campaign.ts';
import { PublicCampaignLayout } from '../src/pages/PublicCampaign.tsx';
import type { PublicCampaign } from '../src/types.ts';

function createCampaign(overrides: Partial<PublicCampaign> = {}): PublicCampaign {
  return {
    id: 'campaign-123',
    title: 'Protect Public Libraries',
    slug: 'protect-public-libraries',
    summary: JSON.stringify({
      schema: 'campaign-editor/v1',
      suggestedSubject: 'Protect public libraries',
      suggestedMessage: 'Please protect federal support for public libraries.',
      backgroundImageUrl: '',
    }),
    bodyMarkdown: '## Why this matters\n\n**Safe** copy with <script>alert(1)</script> blocked.',
    organizationName: 'Civic Readers',
    organizationUrl: 'https://example.org/libraries',
    status: 'published',
    publishedAt: '2026-04-08T12:00:00.000Z',
    firstPublishedAt: '2026-04-08T12:00:00.000Z',
    createdAt: '2026-04-08T12:00:00.000Z',
    updatedAt: '2026-04-08T12:00:00.000Z',
    stats: {
      pageViews: 42,
      flowStarts: 10,
      peopleTakenAction: 7,
      totalMessagesSent: 19,
    },
    ...overrides,
  };
}

describe('public campaign frontend helpers', () => {
  it('builds root-level campaign paths and still recognizes legacy campaign URLs', () => {
    expect(buildCampaignPath('protect-public-libraries')).toBe('/protect-public-libraries');
    expect(getCampaignSlugFromPath('/protect-public-libraries')).toBe('protect-public-libraries');
    expect(getCampaignSlugFromPath('/campaigns/protect-public-libraries')).toBe(
      'protect-public-libraries'
    );
    expect(getCampaignSlugFromPath('/location')).toBeNull();
    expect(isCampaignPath('/protect-public-libraries')).toBe(true);
    expect(isCampaignPath('/campaigns/protect-public-libraries')).toBe(true);
    expect(isCampaignPath('/privacy-policy')).toBe(false);
  });

  it('renders the campaign page layout with the stats rail and safe markdown output', () => {
    const campaign = createCampaign();
    const campaignContent = getPublicCampaignContent(campaign);
    const { container } = render(
      <PublicCampaignLayout
        campaign={campaign}
        campaignContent={campaignContent}
        heroImageReady={false}
        addressCard={<div>Address form</div>}
      />
    );

    expect(container.textContent.includes('Protect Public Libraries')).toBe(true);
    expect(container.textContent.includes('Address form')).toBe(true);
    expect(container.textContent.includes('People have taken action')).toBe(true);
    expect(container.textContent.includes('Total messages sent')).toBe(true);
    expect(container.textContent.includes('7')).toBe(true);
    expect(container.textContent.includes('19')).toBe(true);
    expect(container.innerHTML.includes('campaign-public-page__hero is-fallback')).toBe(true);
    expect(container.innerHTML.includes('<strong>Safe</strong> copy')).toBe(true);
    expect(container.innerHTML.includes('<script>alert(1)</script>')).toBe(false);
    expect(container.innerHTML.includes('&lt;script&gt;alert(1)&lt;/script&gt;')).toBe(true);
  });

  it('keeps the red fallback hero treatment when no usable background image is active', () => {
    const campaign = createCampaign({
      summary: JSON.stringify({
        schema: 'campaign-editor/v1',
        suggestedSubject: 'Protect public libraries',
        suggestedMessage: 'Please protect federal support for public libraries.',
        backgroundImageUrl: 'https://example.org/hero.jpg',
      }),
    });
    const campaignContent = getPublicCampaignContent(campaign);
    const { container } = render(
      <PublicCampaignLayout
        campaign={campaign}
        campaignContent={campaignContent}
        heroImageReady={false}
        addressCard={<div>Address form</div>}
      />
    );

    expect(container.innerHTML.includes('campaign-public-page__hero is-fallback')).toBe(true);
    expect(container.innerHTML.includes('background-image')).toBe(false);
  });

  it('applies campaign context with a stable session id and preserves it across flow resets', () => {
    const campaign = createCampaign();
    const activatedState = applyActiveCampaignState(
      {
        ...defaultWizardState,
        legislators: [
          {
            bioguideId: 'A000360',
            title: 'Rep',
            firstName: 'Ada',
            lastName: 'Lovelace',
            state: 'CA',
            district: 12,
            defunct: false,
          },
        ],
        bioguideIdsBySelection: {
          A000360: true,
        },
      },
      campaign,
      () => 'session-123'
    );

    const resetState = buildResetWizardState(activatedState, {
      preserveCampaignContext: true,
    });
    const revisitedState = applyActiveCampaignState(
      activatedState,
      campaign,
      () => 'session-999'
    );

    expect(activatedState.activeCampaign?.slug).toBe('protect-public-libraries');
    expect(activatedState.campaignSessionId).toBe('session-123');
    expect(activatedState.legislators.length).toBe(0);
    expect(revisitedState.campaignSessionId).toBe('session-123');
    expect(resetState.activeCampaign?.slug).toBe('protect-public-libraries');
    expect(resetState.campaignSessionId).toBe('session-123');
    expect(resetState.legislators.length).toBe(0);
    expect(Object.keys(resetState.bioguideIdsBySelection).length).toBe(0);
  });

  it('prefills compose from the campaign only when the draft starts empty', () => {
    const campaign = createCampaign();
    const prefill = getCampaignComposePrefill({}, campaign);
    const blockedPrefill = getCampaignComposePrefill(
      {
        subject: 'My own subject',
        message: '',
      },
      campaign
    );

    expect(prefill).toEqual({
      subject: 'Protect public libraries',
      message: 'Please protect federal support for public libraries.',
    });
    expect(blockedPrefill).toBeNull();
  });

  it('preserves the legacy generic flow when no campaign context exists', () => {
    const prefill = getCampaignComposePrefill({}, null);

    expect(prefill).toBeNull();
  });
});
