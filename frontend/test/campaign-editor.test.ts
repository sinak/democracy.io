import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { describe, expect, it } from '../vendor/vitest/index.js';
import {
  buildCampaignPublicUrl,
  createEmptyCampaignEditorValues,
  isCampaignSlugLocked,
  serializeCampaignEditorRequest,
  validateCampaignEditor,
} from '../src/helpers/campaign-editor.ts';

describe('campaign editor helpers', () => {
  it('validates required publish fields and URL rules', () => {
    const result = validateCampaignEditor(
      {
        ...createEmptyCampaignEditorValues(),
        organizationUrl: 'notaurl',
        descriptionMarkdown: '![Local image](/relative-image.png)',
      },
      'publish'
    );

    expect(result.isValid).toBe(false);
    expect(result.fieldErrors).toEqual({
      title: 'Add a campaign title.',
      slug: 'Add a campaign slug.',
      organizationUrl: 'Use a full http or https URL.',
      descriptionMarkdown: 'Markdown images must use full http or https URLs.',
      suggestedSubject: 'Add a suggested subject line.',
      suggestedMessage: 'Add a suggested message.',
    });
  });

  it('locks the slug after first publish', () => {
    expect(isCampaignSlugLocked({ firstPublishedAt: '2026-04-08T12:00:00.000Z' })).toBe(true);
    expect(isCampaignSlugLocked({ firstPublishedAt: null })).toBe(false);
  });

  it('allows create mode submissions without a slug and omits it from the request', () => {
    const values = {
      ...createEmptyCampaignEditorValues(),
      title: '!!!',
    };

    const validation = validateCampaignEditor(values, 'draft', { requireSlug: false });

    expect(validation.isValid).toBe(true);
    expect(validation.fieldErrors).toEqual({});
    expect(serializeCampaignEditorRequest(validation.normalizedValues)).toEqual({
      title: '!!!',
      summary:
        '{"schema":"campaign-editor/v1","suggestedSubject":"","suggestedMessage":"","backgroundImageUrl":""}',
      bodyMarkdown: null,
      organizationName: null,
      organizationUrl: null,
    });
  });

  it('blocks reserved root-level slugs and builds root-level public URLs', () => {
    const values = {
      ...createEmptyCampaignEditorValues(),
      title: 'Save public libraries',
      slug: 'location',
    };

    const validation = validateCampaignEditor(values, 'draft');

    expect(validation.isValid).toBe(false);
    expect(validation.fieldErrors.slug).toBe('That public path is reserved. Choose a different slug.');
    expect(buildCampaignPublicUrl('save-public-libraries')).toBe(
      'http://localhost:3000/save-public-libraries'
    );
  });

  it('renders markdown safely without parsing raw html', () => {
    const markup = renderToStaticMarkup(
      React.createElement(
        ReactMarkdown,
        {
          remarkPlugins: [remarkGfm],
        },
        '<script>alert(1)</script>\n\n**Safe** text'
      )
    );

    expect(markup.includes('<script>alert(1)</script>')).toBe(false);
    expect(markup.includes('&lt;script&gt;alert(1)&lt;/script&gt;')).toBe(true);
    expect(markup.includes('<strong>Safe</strong> text')).toBe(true);
  });
});
