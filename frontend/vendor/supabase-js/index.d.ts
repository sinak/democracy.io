export interface User {
  id: string;
  email: string | null;
}

export interface Session {
  access_token: string;
  refresh_token: string;
  expires_at?: number;
  expires_in?: number;
  token_type?: string;
  user: User | null;
}

export interface AuthError {
  message: string;
}

export interface AuthResponse {
  data: {
    session: Session | null;
    user: User | null;
  };
  error: AuthError | null;
}

export interface SessionResponse {
  data: {
    session: Session | null;
  };
  error: AuthError | null;
}

export type AuthChangeEvent =
  | 'SIGNED_IN'
  | 'SIGNED_OUT'
  | 'TOKEN_REFRESHED'
  | 'INITIAL_SESSION';

export interface SupabaseClient {
  auth: {
    getSession(): Promise<SessionResponse>;
    onAuthStateChange(
      callback: (event: AuthChangeEvent, session: Session | null) => void
    ): {
      data: {
        subscription: {
          unsubscribe(): void;
        };
      };
    };
    signInWithOtp(input: {
      email: string;
      options?: {
        emailRedirectTo?: string;
        shouldCreateUser?: boolean;
        data?: Record<string, unknown>;
      };
    }): Promise<AuthResponse>;
    signOut(): Promise<{ error: AuthError | null }>;
    setSession(input: {
      access_token: string;
      refresh_token: string;
      expires_at?: number;
      expires_in?: number;
      token_type?: string;
    }): Promise<AuthResponse>;
    exchangeCodeForSession(code: string): Promise<AuthResponse>;
    verifyOtp(input: {
      token_hash: string;
      type: string;
    }): Promise<AuthResponse>;
  };
}

export declare function createClient(
  projectUrl: string,
  anonKey: string,
  options?: {
    auth?: {
      storageKey?: string;
      storage?: Storage;
    };
  }
): SupabaseClient;
