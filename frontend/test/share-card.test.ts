import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from '../vendor/vitest/index.js';
import { ShareCard } from '../src/components/ShareCard.tsx';

describe('ShareCard', () => {
  it('renders a visible public link when requested', () => {
    const markup = renderToStaticMarkup(
      React.createElement(ShareCard, {
        feedbackIdle: 'Campaign: Test campaign',
        headline: 'Your public campaign page is ready to share.',
        kicker: 'Campaign created',
        shareText: 'Share this campaign.',
        shareUrl: 'https://democracy.io/test-campaign',
        shareUrlLabel: 'Public link',
        showShareUrl: true,
        subtitle: 'Share Test campaign so supporters can write Congress.',
      })
    );

    expect(markup.includes('Public link')).toBe(true);
    expect(markup.includes('https://democracy.io/test-campaign')).toBe(true);
  });
});
