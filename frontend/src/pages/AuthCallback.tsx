import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { OrganizerPageLayout } from '../components/OrganizerPageLayout';
import { consumePostAuthRedirect } from '../helpers/auth-redirect';
import { restoreSupabaseSessionFromUrl } from '../lib/supabase-browser';

export function AuthCallback() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function restoreSession() {
      const result = await restoreSupabaseSessionFromUrl();

      if (!active) {
        return;
      }

      if (result.error || !result.session) {
        setError(result.error?.message || 'We could not restore your organizer session.');
        return;
      }

      navigate(consumePostAuthRedirect(), { replace: true });
    }

    void restoreSession();

    return () => {
      active = false;
    };
  }, [navigate]);

  return (
    <OrganizerPageLayout
      eyebrow="Organizer access"
      title="Restoring your session"
      intro="Democracy.io is finishing the organizer sign-in flow and routing you back to the page you requested."
      sidebar={
        <>
          <p>This callback route is reserved for the Supabase magic-link return flow.</p>
          <p>
            If the link expired or was opened in a different browser, use the organizer sign-in
            page to request another link.
          </p>
        </>
      }
    >
      {error ? (
        <div className="alert alert-danger organizer-alert">
          {error}{' '}
          <Link to="/organizer/sign-in" className="organizer-inline-link">
            Request another magic link.
          </Link>
        </div>
      ) : (
        <div className="organizer-copy">
          <p>Checking the callback payload, restoring the session, and preparing the protected shell.</p>
        </div>
      )}
    </OrganizerPageLayout>
  );
}
