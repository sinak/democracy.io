import { describe, expect, it } from '../vendor/vitest/index.js';
import {
  consumePostAuthRedirect,
  readPostAuthRedirect,
  rememberPostAuthRedirect,
} from '../src/helpers/auth-redirect.ts';
import { hasSupabaseAuthParams } from '../src/lib/supabase-browser.ts';

describe('post-auth redirect storage', () => {
  it('falls back to localStorage when the confirmation link opens in a new tab', () => {
    rememberPostAuthRedirect('/organizer/campaigns/new');

    expect(window.sessionStorage.getItem('democracy.io.post-auth-redirect')).toBe(
      '/organizer/campaigns/new'
    );
    expect(window.localStorage.getItem('democracy.io.post-auth-redirect')).toBe(
      '/organizer/campaigns/new'
    );

    window.sessionStorage.clear();

    expect(readPostAuthRedirect()).toBe('/organizer/campaigns/new');
    expect(consumePostAuthRedirect()).toBe('/organizer/campaigns/new');
    expect(window.localStorage.getItem('democracy.io.post-auth-redirect')).toBeNull();
  });
});

describe('hasSupabaseAuthParams', () => {
  it('detects access-token hash payloads on non-callback routes', () => {
    expect(
      hasSupabaseAuthParams('http://localhost:3000/#access_token=token&refresh_token=refresh')
    ).toBe(true);
  });

  it('detects query-string callback codes', () => {
    expect(hasSupabaseAuthParams('http://localhost:3000/auth/callback?code=abc123')).toBe(true);
  });

  it('ignores normal app routes without auth payloads', () => {
    expect(hasSupabaseAuthParams('http://localhost:3000/organizer/sign-in')).toBe(false);
  });
});
