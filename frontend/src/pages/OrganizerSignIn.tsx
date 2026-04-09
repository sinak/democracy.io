import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  normalizeRedirectPath,
  readPostAuthRedirect,
  rememberPostAuthRedirect,
} from '../helpers/auth-redirect';

export function OrganizerSignIn() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { authError, isLoading, signInWithOtp, user } = useAuth();
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const redirectTarget = normalizeRedirectPath(
    searchParams.get('next'),
    readPostAuthRedirect()
  );

  useEffect(() => {
    rememberPostAuthRedirect(redirectTarget);
  }, [redirectTarget]);

  useEffect(() => {
    if (!isLoading && user) {
      navigate(readPostAuthRedirect(), { replace: true });
    }
  }, [isLoading, navigate, user]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await signInWithOtp(email.trim().toLowerCase(), redirectTarget);
      setEmailSent(true);
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : 'Unable to send a magic link.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="organizer-shell organizer-auth-shell">
      <div className="container">
        <div className="row">
          <div className="col-sm-12 col-md-6 col-md-offset-3">
            <section className="whitebox organizer-auth-card">
              <div className="whitebox-container">
                <h1 className="organizer-page-title organizer-auth-title">Sign in</h1>

                {emailSent ? (
                  <div className="alert alert-success organizer-alert organizer-auth-alert">
                    A sign-in link has been sent to <strong>{email}</strong>.
                  </div>
                ) : (
                  <form
                    className="organizer-sign-in-form organizer-sign-in-form--compact"
                    onSubmit={handleSubmit}
                  >
                    <div className="form-group">
                      <label htmlFor="organizer-email">Email</label>
                      <input
                        id="organizer-email"
                        type="email"
                        autoComplete="email"
                        className="form-control input-lg"
                        placeholder="you@example.org"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        required
                      />
                    </div>

                    <button
                      type="submit"
                      className="btn btn-lg btn-orange organizer-primary-action"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? 'Sending sign-in link...' : 'Send sign-in link'}
                    </button>
                  </form>
                )}

                {error || authError ? (
                  <div className="alert alert-danger organizer-alert organizer-auth-alert">
                    {error || authError}
                  </div>
                ) : null}
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
