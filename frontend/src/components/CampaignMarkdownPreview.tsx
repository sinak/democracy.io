import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

function isSafeLinkHref(value: string | undefined) {
  if (!value) {
    return false;
  }

  if (value.startsWith('#') || value.startsWith('/')) {
    return true;
  }

  try {
    const url = new URL(value);
    return ['http:', 'https:', 'mailto:', 'tel:'].includes(url.protocol);
  } catch {
    return false;
  }
}

function isSafeExternalImageHref(value: string | undefined) {
  if (!value) {
    return false;
  }

  try {
    const url = new URL(value);
    return ['http:', 'https:'].includes(url.protocol);
  } catch {
    return false;
  }
}

export function CampaignMarkdownPreview({
  markdown,
}: {
  markdown: string;
}) {
  return (
    <div className="campaign-markdown-preview" data-testid="campaign-markdown-preview">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          a({ children, href }) {
            if (!isSafeLinkHref(href)) {
              return <span>{children}</span>;
            }

            return (
              <a href={href} rel="noreferrer noopener" target="_blank">
                {children}
              </a>
            );
          },
          img({ alt, src }) {
            if (!isSafeExternalImageHref(src)) {
              return (
                <span className="campaign-markdown-preview__blocked-image">
                  {alt || 'Blocked image'}
                </span>
              );
            }

            return <img alt={alt || ''} src={src} loading="lazy" />;
          },
        }}
      >
        {markdown}
      </ReactMarkdown>
    </div>
  );
}
