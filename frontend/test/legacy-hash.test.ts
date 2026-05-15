import { describe, expect, it } from '../vendor/vitest/index.js';
import {
  getLegacyHashRedirectTarget,
} from '../src/helpers/legacy-hash.ts';
import {
  normalizeRedirectPath,
} from '../src/helpers/auth-redirect.ts';

describe('getLegacyHashRedirectTarget', () => {
  it('converts legacy hash routes into browser paths', () => {
    expect(getLegacyHashRedirectTarget('/', '', '#/compose?draft=1')).toBe('/compose?draft=1');
  });

  it('converts legacy hashbang routes into browser paths', () => {
    expect(getLegacyHashRedirectTarget('/', '', '#!/location')).toBe('/location');
  });

  it('ignores non-legacy hashes', () => {
    expect(getLegacyHashRedirectTarget('/organizer/sign-in', '', '#top')).toBeNull();
  });
});

describe('normalizeRedirectPath', () => {
  it('keeps safe in-app organizer paths', () => {
    expect(normalizeRedirectPath('/organizer/campaigns/new')).toBe('/organizer/campaigns/new');
  });

  it('rejects external or callback redirects', () => {
    expect(normalizeRedirectPath('https://example.com')).toBe('/organizer/campaigns');
    expect(normalizeRedirectPath('/auth/callback')).toBe('/organizer/campaigns');
  });
});
