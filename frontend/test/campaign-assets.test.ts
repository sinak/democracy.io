import { describe, expect, it } from '../vendor/vitest/index.js';

describe('campaign asset upload', () => {
  it('uploads into the scoped campaign-assets bucket and returns the public URL', async () => {
    const originalFetch = globalThis.fetch;
    const originalSupabaseUrl = process.env.VITE_SUPABASE_URL;
    const originalSupabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
    const requests: Array<{
      input: RequestInfo | URL;
      init: RequestInit | undefined;
    }> = [];

    process.env.VITE_SUPABASE_URL = 'https://demo.supabase.co';
    process.env.VITE_SUPABASE_ANON_KEY = 'anon-public-key';

    globalThis.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
      requests.push({ input, init });
      return new Response(JSON.stringify({ Key: 'ok' }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    };

    try {
      const { uploadCampaignBackgroundImage } = await import('../src/helpers/campaign-assets.ts');
      const file = new File(['hello'], 'Banner Image.png', { type: 'image/png' });
      const result = await uploadCampaignBackgroundImage({
        accessToken: 'access-token',
        file,
        userId: 'user-123',
      });
      const request = requests[0];
      const headers = request.init?.headers as Record<string, string>;

      expect(requests.length).toBe(1);
      expect(String(request.input).includes('/storage/v1/object/campaign-assets/user-123/')).toBe(
        true
      );
      expect(request.init?.method).toBe('POST');
      expect(headers.Authorization).toBe('Bearer access-token');
      expect(headers.apikey).toBe('anon-public-key');
      expect(headers['x-upsert']).toBe('true');
      expect(result.publicUrl.includes('/storage/v1/object/public/campaign-assets/user-123/')).toBe(
        true
      );
      expect(result.publicUrl.endsWith('-banner-image.png')).toBe(true);
    } finally {
      globalThis.fetch = originalFetch;

      if (originalSupabaseUrl === undefined) {
        delete process.env.VITE_SUPABASE_URL;
      } else {
        process.env.VITE_SUPABASE_URL = originalSupabaseUrl;
      }

      if (originalSupabaseAnonKey === undefined) {
        delete process.env.VITE_SUPABASE_ANON_KEY;
      } else {
        process.env.VITE_SUPABASE_ANON_KEY = originalSupabaseAnonKey;
      }
    }
  });
});
