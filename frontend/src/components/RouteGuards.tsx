import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  buildReturnToPath,
  rememberPostAuthRedirect,
} from '../helpers/auth-redirect';
import { LoadingSpinner } from './LoadingSpinner';

function GuardLoadingState() {
  return (
    <div className="container organizer-guard-loading">
      <div className="row">
        <div className="col-sm-12 col-md-8 col-md-offset-2">
          <div className="whitebox">
            <div className="whitebox-container">
              <LoadingSpinner message="Checking your organizer access..." />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function RequireOrganizerAuth() {
  const location = useLocation();
  const { isLoading, user } = useAuth();

  if (isLoading) {
    return <GuardLoadingState />;
  }

  if (!user) {
    const nextPath = buildReturnToPath(
      location.pathname,
      location.search,
      location.hash
    );

    rememberPostAuthRedirect(nextPath);
    return <Navigate to={`/organizer/sign-in?next=${encodeURIComponent(nextPath)}`} replace />;
  }

  return <Outlet />;
}

export function RequireAdminAuth() {
  const location = useLocation();
  const { isAdmin, isLoading, user } = useAuth();

  if (isLoading) {
    return <GuardLoadingState />;
  }

  if (!user) {
    const nextPath = buildReturnToPath(
      location.pathname,
      location.search,
      location.hash
    );

    rememberPostAuthRedirect(nextPath);
    return <Navigate to={`/organizer/sign-in?next=${encodeURIComponent(nextPath)}`} replace />;
  }

  if (!isAdmin) {
    return <Navigate to="/organizer/campaigns" replace />;
  }

  return <Outlet />;
}
