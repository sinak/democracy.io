import { describe, expect, it } from '../vendor/vitest/index.js';
import { makePOTCMessage } from '../src/helpers/potc.js';
import type { Message } from '../src/types.js';

function buildMessage(overrides: Partial<Message> = {}): Message {
  return {
    bioguideId: 'A000360',
    recipientName: 'Rep. Ada Lovelace',
    subject: 'Protect democracy',
    message: 'Dear Rep. Lovelace,\nPlease support this issue.',
    sender: {
      namePrefix: 'Ms.',
      firstName: 'Taylor',
      lastName: 'Rivera',
      email: 'taylor@example.com',
      phone: '555-555-5555',
      parenPhone: '(555) 555-5555',
      county: 'Alameda',
    },
    canonicalAddress: {
      address: '123 Main St',
      county: 'Alameda',
      district: '12',
      components: {
        primaryNumber: '123',
        streetName: 'Main',
        streetSuffix: 'St',
        cityName: 'Oakland',
        stateAbbreviation: 'CA',
        stateName: 'California',
        zipcode: '94612',
      },
    },
    campaign: {},
    ...overrides,
  };
}

describe('POTC campaign metadata', () => {
  it('preserves campaign identifiers and tag overrides for campaign sends', () => {
    const result = makePOTCMessage(
      buildMessage({
        campaign: {
          uuid: 'campaign-123',
          tag: 'public-campaign-slug',
          orgName: 'Civic Action',
          orgURL: 'https://example.org/campaign',
        },
      }),
      'generated-fallback-tag'
    );

    expect(result).toEqual({
      bio_id: 'A000360',
      campaign_tag: 'public-campaign-slug',
      fields: {
        $NAME_PREFIX: 'Ms.',
        $NAME_FIRST: 'Taylor',
        $NAME_LAST: 'Rivera',
        $NAME_FULL: 'Taylor Rivera',
        $ADDRESS_STREET: '123 Main St',
        $ADDRESS_CITY: 'Oakland',
        $ADDRESS_STATE_POSTAL_ABBREV: 'CA',
        $ADDRESS_STATE_FULL: 'California',
        $ADDRESS_COUNTY: 'Alameda',
        $ADDRESS_ZIP5: '94612',
        $ADDRESS_ZIP_PLUS_4: '94612',
        $PHONE: '555-555-5555',
        $PHONE_PARENTHESES: '(555) 555-5555',
        $EMAIL: 'taylor@example.com',
        $SUBJECT: 'Protect democracy',
        $MESSAGE: 'Dear Rep. Lovelace,\nPlease support this issue.',
        $CAMPAIGN_UUID: 'campaign-123',
        $ORG_URL: 'https://example.org/campaign',
        $ORG_NAME: 'Civic Action',
      },
    });
  });

  it('falls back to the generated tag for generic sends without campaign context', () => {
    const result = makePOTCMessage(buildMessage(), 'generated-fallback-tag');

    expect(result.campaign_tag).toBe('generated-fallback-tag');
    expect(result.fields.$CAMPAIGN_UUID).toBe(undefined);
    expect(result.fields.$ORG_URL).toBe(undefined);
    expect(result.fields.$ORG_NAME).toBe(undefined);
  });
});
