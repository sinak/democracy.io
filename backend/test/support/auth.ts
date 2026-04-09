import { SignJWT, createLocalJWKSet, exportJWK, generateKeyPair } from 'jose';
import { createSupabaseJwtVerifier } from '../../src/auth.js';

interface TestTokenOptions {
  userId?: string;
  email?: string;
}

export async function createTestAuthHarness(projectUrl = 'https://example.supabase.co') {
  const { publicKey, privateKey } = await generateKeyPair('RS256');
  const publicJwk = await exportJWK(publicKey);
  const kid = 'test-key';

  const verifier = createSupabaseJwtVerifier({
    projectUrl,
    jwks: createLocalJWKSet({
      keys: [
        {
          ...publicJwk,
          alg: 'RS256',
          kid,
          use: 'sig',
        },
      ],
    }),
  });

  return {
    verifier,
    async createToken(options: TestTokenOptions = {}) {
      return new SignJWT({
        email: options.email || 'user@example.com',
        aud: 'authenticated',
      })
        .setProtectedHeader({ alg: 'RS256', kid })
        .setIssuer(`${projectUrl}/auth/v1`)
        .setSubject(options.userId || 'user-1')
        .setIssuedAt()
        .setExpirationTime('1h')
        .sign(privateKey);
    },
  };
}
