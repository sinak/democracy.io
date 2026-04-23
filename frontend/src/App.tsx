import { Fragment, useEffect, useLayoutEffect, useRef, useState } from 'react';
import {
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
  useParams,
} from 'react-router-dom';
import { AppFooter } from './components/AppFooter';
import { PlatformLayout } from './components/PlatformLayout';
import { ProgressBar } from './components/ProgressBar';
import { RequireAdminAuth, RequireOrganizerAuth } from './components/RouteGuards';
import { CampaignFlowBanner } from './components/CampaignFlowBanner';
import { SiteHeader } from './components/SiteHeader';
import { TypewriterText } from './components/TypewriterText';
import { WhyDio } from './components/WhyDio';
import { useAuth } from './context/AuthContext';
import { buildReturnToPath } from './helpers/auth-redirect';
import {
  buildCampaignPath,
  isCampaignPath,
  isReservedCampaignSlug,
} from './helpers/campaign-path';
import { AuthCallback } from './pages/AuthCallback';
import { OrganizerSignIn } from './pages/OrganizerSignIn';
import { CampaignModerationShell } from './pages/admin/CampaignModerationShell';
import { Home } from './pages/Home';
import { LegislatorPicker } from './pages/LegislatorPicker';
import { MessageForm } from './pages/MessageForm';
import { Captcha } from './pages/Captcha';
import { PublicCampaignPage } from './pages/PublicCampaign';
import { Thanks } from './pages/Thanks';
import { CampaignCreateShell } from './pages/organizer/CampaignCreateShell';
import { CampaignEditShell } from './pages/organizer/CampaignEditShell';
import { OrganizerCampaignList } from './pages/organizer/CampaignList';
import { CampaignShareShell } from './pages/organizer/CampaignShareShell';

const PAGE_TITLES: Record<string, string> = {
  '/': '',
  '/location': 'Who do you want to write to?',
  '/compose': 'Write your message',
  '/captcha': 'Verify that you\'re a human',
  '/thanks': 'Message sent!',
};

function getPageName(path: string) {
  if (path === '/') return 'home';
  if (path === '/location') return 'location';
  if (path === '/compose') return 'compose';
  if (path === '/captcha') return 'captcha';
  if (path === '/thanks') return 'thanks';
  if (isCampaignPath(path)) return 'campaign';
  return 'home';
}

function LegacyCampaignRedirect() {
  const { slug = '' } = useParams();

  return <Navigate to={buildCampaignPath(slug)} replace />;
}

function PublicCampaignRoute() {
  const { slug = '' } = useParams();

  if (!slug || isReservedCampaignSlug(slug)) {
    return <Navigate to="/" replace />;
  }

  return <PublicCampaignPage />;
}

function SupporterRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/:slug" element={<PublicCampaignRoute />} />
      <Route path="/campaigns/:slug" element={<LegacyCampaignRedirect />} />
      <Route path="/location" element={<LegislatorPicker />} />
      <Route path="/compose" element={<MessageForm />} />
      <Route path="/captcha" element={<Captcha />} />
      <Route path="/thanks" element={<Thanks />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function SupporterFlow() {
  const location = useLocation();
  const pageName = getPageName(location.pathname);
  const prevPathRef = useRef(location.pathname);
  const prevPageNameRef = useRef(pageName);
  const [pageFrom, setPageFrom] = useState('new-visit');
  const title = PAGE_TITLES[location.pathname] || '';

  useLayoutEffect(() => {
    if (prevPathRef.current !== location.pathname) {
      setPageFrom(prevPageNameRef.current);
      prevPathRef.current = location.pathname;
      prevPageNameRef.current = pageName;
    }
  }, [location.pathname, pageName]);

  return (
    <div id="wrapper" className="content" data-pagename={pageName} data-pagefrom={pageFrom}>
      <div className="main">
        <SiteHeader />

        <noscript>
          <div className="text-center">
            <h3>Democracy.io requires Javascript to work.</h3>
            <h4>Please load the site using a browser that supports Javascript.</h4>
          </div>
        </noscript>

        {pageName === 'home' ? (
          <div className="header">
            <TypewriterText
              text="Write to your representatives"
              initialDelay={500}
              speed={30}
              skipAnimation={pageFrom !== 'new-visit'}
            />
          </div>
        ) : pageName !== 'campaign' && title ? (
          <h1 className="header">{title}</h1>
        ) : null}

        {pageName !== 'campaign' ? <ProgressBar /> : null}
        {pageName !== 'home' && pageName !== 'campaign' ? <CampaignFlowBanner /> : null}

        {pageName === 'campaign' ? (
          <div id="form-scope" className="ng-enter" key={location.pathname}>
            <SupporterRoutes />
          </div>
        ) : (
          <div className="container">
            <div id="form-scope" className="ng-enter" key={location.pathname}>
              <SupporterRoutes />
            </div>
          </div>
        )}
      </div>

      {pageName === 'home' ? <WhyDio /> : null}
    </div>
  );
}

function PendingPostAuthRedirect() {
  const location = useLocation();
  const navigate = useNavigate();
  const {
    clearPendingPostAuthRedirect,
    isLoading,
    pendingPostAuthRedirect,
    user,
  } = useAuth();

  useEffect(() => {
    if (isLoading || !user || !pendingPostAuthRedirect) {
      return;
    }

    const currentPath = buildReturnToPath(
      location.pathname,
      location.search,
      location.hash
    );

    clearPendingPostAuthRedirect();

    if (currentPath !== pendingPostAuthRedirect) {
      navigate(pendingPostAuthRedirect, { replace: true });
    }
  }, [
    clearPendingPostAuthRedirect,
    isLoading,
    location.hash,
    location.pathname,
    location.search,
    navigate,
    pendingPostAuthRedirect,
    user,
  ]);

  return null;
}

export default function App() {
  return (
    <Fragment>
      <PendingPostAuthRedirect />

      <Routes>
        <Route element={<PlatformLayout />}>
          <Route path="/organizer/sign-in" element={<OrganizerSignIn />} />
          <Route path="/auth/callback" element={<AuthCallback />} />

          <Route path="/organizer" element={<RequireOrganizerAuth />}>
            <Route index element={<Navigate to="campaigns" replace />} />
            <Route path="campaigns" element={<OrganizerCampaignList />} />
            <Route path="campaigns/new" element={<CampaignCreateShell />} />
            <Route path="campaigns/:campaignId/share" element={<CampaignShareShell />} />
            <Route path="campaigns/:campaignId/edit" element={<CampaignEditShell />} />
          </Route>

          <Route path="/admin" element={<RequireAdminAuth />}>
            <Route index element={<Navigate to="campaigns" replace />} />
            <Route path="campaigns" element={<CampaignModerationShell />} />
          </Route>
        </Route>

        <Route path="*" element={<SupporterFlow />} />
      </Routes>

      <AppFooter />
    </Fragment>
  );
}
