import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Logo } from './Logo';

function NavLinkItem({
  label,
  to,
  isActive,
}: {
  label: string;
  to: string;
  isActive?: boolean;
}) {
  return (
    <Link to={to} className={`site-nav__link ${isActive ? 'is-active' : ''}`}>
      {label}
    </Link>
  );
}

export function SiteHeader() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAdmin, isLoading, user, signOut } = useAuth();

  async function handleSignOut() {
    await signOut();
    navigate('/organizer/sign-in', { replace: true });
  }

  return (
    <nav className="navbar navbar-static site-navbar">
      <div className="container">
        <div className="navbar-header">
          <div className="navbar-brand">
            <Logo />
          </div>
        </div>

        <div className="site-nav" aria-label="Primary">
          {!user && !isLoading ? (
            <NavLinkItem
              label="Organizer sign in"
              to="/organizer/sign-in"
              isActive={location.pathname === '/organizer/sign-in'}
            />
          ) : null}

          {user ? (
            <>
              <NavLinkItem
                label="Organizer"
                to="/organizer/campaigns"
                isActive={location.pathname.startsWith('/organizer')}
              />
              {isAdmin ? (
                <NavLinkItem
                  label="Admin"
                  to="/admin/campaigns"
                  isActive={location.pathname.startsWith('/admin')}
                />
              ) : null}
              <button type="button" className="site-nav__button" onClick={() => void handleSignOut()}>
                Sign out
              </button>
            </>
          ) : null}
        </div>
      </div>
    </nav>
  );
}
