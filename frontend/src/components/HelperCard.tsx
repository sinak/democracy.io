import type { ReactNode } from 'react';

export function HelperCard({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="panel organizer-helper-panel organizer-helper-card">
      <div className="panel-heading">{title}</div>
      <div className="panel-body">{children}</div>
    </section>
  );
}

