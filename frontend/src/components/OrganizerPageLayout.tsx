import type { ReactNode } from 'react';

interface OrganizerPageLayoutProps {
  eyebrow: string;
  title: string;
  intro: string;
  actions?: ReactNode;
  sidebar?: ReactNode;
  sidebarPlacement?: 'side' | 'below';
  sidebarMode?: 'panel' | 'stack';
  showHero?: boolean;
  children: ReactNode;
  tone?: 'organizer' | 'admin';
}

export function OrganizerPageLayout({
  actions,
  children,
  eyebrow,
  intro,
  sidebar,
  sidebarPlacement = 'side',
  sidebarMode = 'panel',
  showHero = true,
  title,
  tone = 'organizer',
}: OrganizerPageLayoutProps) {
  const showSidebarBesideContent = Boolean(sidebar) && sidebarPlacement === 'side';

  return (
    <div className={`organizer-shell organizer-shell--${tone}`}>
      <div className="container">
        {showHero ? (
          <div className="row">
            <div className="col-sm-12 col-md-10 col-md-offset-1">
              <section className="whitebox organizer-hero-card">
                <div className="whitebox-container">
                  <div className="organizer-eyebrow">{eyebrow}</div>
                  <h1 className="organizer-page-title">{title}</h1>
                  <p className="organizer-page-intro">{intro}</p>
                  {actions ? <div className="organizer-page-actions">{actions}</div> : null}
                </div>
              </section>
            </div>
          </div>
        ) : null}

        <div className="row organizer-shell__body">
          <div
            className={
              showSidebarBesideContent
                ? 'col-sm-12 col-md-7 col-md-offset-1'
                : 'col-sm-12 col-md-10 col-md-offset-1'
            }
          >
            <section className="whitebox organizer-content-card">
              <div className="whitebox-container">{children}</div>
            </section>
          </div>

          {showSidebarBesideContent ? (
            <div className="col-sm-12 col-md-3">
              {sidebarMode === 'stack' ? (
                <div className="organizer-sidebar-stack">{sidebar}</div>
              ) : (
                <div className="panel organizer-helper-panel">
                  <div className="panel-heading">Field notes</div>
                  <div className="panel-body">{sidebar}</div>
                </div>
              )}
            </div>
          ) : null}
        </div>

        {sidebar && sidebarPlacement === 'below' ? (
          <div className="row organizer-shell__sidebar-row">
            <div className="col-sm-12 col-md-10 col-md-offset-1">
              {sidebarMode === 'stack' ? (
                <div className="organizer-sidebar-stack">{sidebar}</div>
              ) : (
                <div className="panel organizer-helper-panel">
                  <div className="panel-heading">Field notes</div>
                  <div className="panel-body">{sidebar}</div>
                </div>
              )}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
