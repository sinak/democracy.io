import type { RequestHandler } from 'express';
import { createRemoteJWKSet, jwtVerify } from 'jose';
import type { JWTPayload, JWTVerifyGetKey } from 'jose';
import { config } from './config.js';
import { makeError } from './helpers/response.js';

export interface VerifiedSupabaseUser {
  userId: string;
  email: string;
  claims: JWTPayload;
}

export interface AuthenticatedRequestUser extends VerifiedSupabaseUser {
  isAdmin: boolean;
}

export interface AuthVerifier {
  verifyAccessToken(token: string): Promise<VerifiedSupabaseUser>;
}

export class AuthConfigurationError extends Error {}

export class AuthTokenError extends Error {}

function normalizeProjectUrl(projectUrl: string) {
  return projectUrl.trim().replace(/\/+$/, '');
}

export function deriveSupabaseAuthUrls(projectUrl: string) {
  const normalizedProjectUrl = normalizeProjectUrl(projectUrl);

  return {
    issuer: `${normalizedProjectUrl}/auth/v1`,
    jwksUrl: `${normalizedProjectUrl}/auth/v1/.well-known/jwks.json`,
  };
}

export function isAdminEmail(email: string) {
  return config.adminEmails.includes(email.trim().toLowerCase());
}

export function createSupabaseJwtVerifier(options: { projectUrl?: string; jwks?: JWTVerifyGetKey } = {}): AuthVerifier {
  const projectUrl = options.projectUrl || config.supabase.url;

  if (!projectUrl) {
    return {
      async verifyAccessToken() {
        throw new AuthConfigurationError('Supabase auth is not configured.');
      },
    };
  }

  const { issuer, jwksUrl } = deriveSupabaseAuthUrls(projectUrl);
  const jwks = options.jwks || createRemoteJWKSet(new URL(jwksUrl));

  return {
    async verifyAccessToken(token: string) {
      try {
        const { payload } = await jwtVerify(token, jwks, {
          issuer,
          audience: 'authenticated',
        });

        if (typeof payload.sub !== 'string' || !payload.sub) {
          throw new AuthTokenError('Supabase token is missing a subject claim.');
        }

        if (typeof payload.email !== 'string' || !payload.email) {
          throw new AuthTokenError('Supabase token is missing an email claim.');
        }

        return {
          userId: payload.sub,
          email: payload.email.toLowerCase(),
          claims: payload,
        };
      } catch (err) {
        if (err instanceof AuthTokenError) {
          throw err;
        }

        throw new AuthTokenError('Invalid bearer token.');
      }
    },
  };
}

function readBearerToken(authorizationHeader?: string) {
  if (!authorizationHeader) {
    return null;
  }

  const match = authorizationHeader.match(/^Bearer\s+(.+)$/i);
  return match?.[1] || null;
}

export function createAuthMiddleware(authVerifier: AuthVerifier = createSupabaseJwtVerifier()) {
  const requireAuthenticatedUser: RequestHandler = async (req, res, next) => {
    const token = readBearerToken(req.headers.authorization);

    if (!token) {
      return res.status(401).json(makeError({ message: 'Missing bearer token.' }, 401));
    }

    try {
      const verifiedUser = await authVerifier.verifyAccessToken(token);

      req.auth = {
        ...verifiedUser,
        isAdmin: isAdminEmail(verifiedUser.email),
      };

      next();
    } catch (err) {
      if (err instanceof AuthConfigurationError) {
        return res.status(503).json(makeError(err, 503));
      }

      return res.status(401).json(makeError(err, 401));
    }
  };

  const requireAdminUser: RequestHandler = (req, res, next) => {
    if (!req.auth) {
      return res.status(401).json(makeError({ message: 'Authentication is required.' }, 401));
    }

    if (!req.auth.isAdmin) {
      return res.status(403).json(makeError({ message: 'Admin access is required.' }, 403));
    }

    next();
  };

  return {
    requireAuthenticatedUser,
    requireAdminUser,
  };
}
