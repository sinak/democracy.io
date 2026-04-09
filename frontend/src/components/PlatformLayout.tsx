import { Outlet } from 'react-router-dom';
import { SiteHeader } from './SiteHeader';

export function PlatformLayout() {
  return (
    <div className="content organizer-platform">
      <div className="main organizer-platform__main">
        <SiteHeader />
        <Outlet />
      </div>
    </div>
  );
}
