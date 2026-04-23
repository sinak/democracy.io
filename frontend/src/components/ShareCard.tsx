import { useEffect, useState, type ReactNode } from 'react';

const socialShares = [
  {
    name: 'Facebook',
    getLink: (shareUrl: string, shareText: string) =>
      `https://www.facebook.com/sharer/sharer.php?${new URLSearchParams({
        app_id: '709021229138321',
        u: shareUrl,
        display: 'popup',
        quote: shareText,
      }).toString()}`,
    svg: (
      <svg width="30" height="30" viewBox="0 0 1900 1900" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <path
          d="M1376 128q119 0 203.5 84.5t84.5 203.5v960q0 119-84.5 203.5t-203.5 84.5h-188v-595h199l30-232h-229v-148q0-56 23.5-84t91.5-28l122-1v-207q-63-9-178-9-136 0-217.5 80t-81.5 226v171h-200v232h200v595h-532q-119 0-203.5-84.5t-84.5-203.5v-960q0-119 84.5-203.5t203.5-84.5h960z"
          fill="currentColor"
        />
      </svg>
    ),
  },
  {
    name: 'X',
    getLink: (shareUrl: string, shareText: string) =>
      `https://twitter.com/intent/tweet?${new URLSearchParams({
        text: shareText,
        url: shareUrl,
        related: 'eff,efflive',
      }).toString()}`,
    svg: (
      <svg width="30" height="30" viewBox="0 0 1200 1227" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <path
          d="M714.163 519.284 1160.89 0h-105.86L667.137 450.887 357.328 0H0l468.492 681.821L0 1226.37h105.866l409.625-476.152 327.181 476.152H1200L714.137 519.284h.026zM569.165 687.828l-47.468-67.894L144.011 79.694h162.604l304.797 436.064 47.468 67.894 396.236 567.79H892.512L569.165 687.854v-.026z"
          fill="currentColor"
        />
      </svg>
    ),
  },
];

function TextIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path
        d="M4 5.75C4 4.784 4.784 4 5.75 4h12.5c.966 0 1.75.784 1.75 1.75v8.5A1.75 1.75 0 0 1 18.25 16H9.915l-3.876 3.322A.75.75 0 0 1 4.75 18.75V16h-1A1.75 1.75 0 0 1 2 14.25v-8.5C2 4.784 2.784 4 3.75 4H4v1.75Zm2.25-.25A.25.25 0 0 0 6 5.75v10.164l2.833-2.428A.75.75 0 0 1 9.32 13.25h8.93a.25.25 0 0 0 .25-.25v-7.25a.25.25 0 0 0-.25-.25H6.25Z"
        fill="currentColor"
      />
      <path
        d="M7 8.25a.75.75 0 0 1 .75-.75h8.5a.75.75 0 0 1 0 1.5h-8.5A.75.75 0 0 1 7 8.25Zm0 3.5A.75.75 0 0 1 7.75 11h5.5a.75.75 0 0 1 0 1.5h-5.5A.75.75 0 0 1 7 11.75Z"
        fill="currentColor"
      />
    </svg>
  );
}

function LinkIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path
        d="M10.78 6.47a.75.75 0 0 1 0 1.06L8.56 9.75a2.75 2.75 0 1 0 3.89 3.89l1.22-1.22a.75.75 0 1 1 1.06 1.06l-1.22 1.22a4.25 4.25 0 1 1-6.01-6.01l2.22-2.22a.75.75 0 0 1 1.06 0Z"
        fill="currentColor"
      />
      <path
        d="M14.28 8.22a4.25 4.25 0 0 1 6.01 6.01l-2.22 2.22a4.25 4.25 0 0 1-6.01-6.01l1.22-1.22a.75.75 0 1 1 1.06 1.06l-1.22 1.22a2.75 2.75 0 1 0 3.89 3.89l2.22-2.22a2.75 2.75 0 0 0-3.89-3.89l-1.22 1.22a.75.75 0 1 1-1.06-1.06l1.22-1.22Z"
        fill="currentColor"
      />
    </svg>
  );
}

async function copyText(value: string) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(value);
    return;
  }

  const textarea = document.createElement('textarea');
  textarea.value = value;
  textarea.setAttribute('readonly', 'true');
  textarea.style.position = 'absolute';
  textarea.style.left = '-9999px';
  document.body.appendChild(textarea);
  textarea.select();
  const copied = document.execCommand('copy');
  document.body.removeChild(textarea);

  if (!copied) {
    throw new Error('Copy command failed.');
  }
}

export function ShareCard({
  className,
  contextLink,
  feedbackIdle,
  headline,
  id,
  kicker,
  secondaryActions,
  shareText,
  shareUrl,
  shareUrlLabel,
  showShareUrl = false,
  subtitle,
  textActionLabel = 'Text a friend',
}: {
  className?: string;
  contextLink?: ReactNode;
  feedbackIdle: ReactNode;
  headline: ReactNode;
  id?: string;
  kicker: ReactNode;
  secondaryActions?: ReactNode;
  shareText: string;
  shareUrl: string;
  shareUrlLabel?: string;
  showShareUrl?: boolean;
  subtitle: ReactNode;
  textActionLabel?: string;
}) {
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied' | 'error'>('idle');
  const smsLink = `sms:?&body=${encodeURIComponent(shareText)}`;
  const copyLabel =
    copyStatus === 'copied' ? 'Link copied' : copyStatus === 'error' ? 'Copy failed' : 'Copy link';
  const rootClassName = ['share-card', className].filter(Boolean).join(' ');

  useEffect(() => {
    if (copyStatus === 'idle') {
      return;
    }

    const timer = window.setTimeout(() => {
      setCopyStatus('idle');
    }, 2400);

    return () => {
      window.clearTimeout(timer);
    };
  }, [copyStatus]);

  const handleCopyLink = async () => {
    try {
      await copyText(shareUrl);
      setCopyStatus('copied');
    } catch (error) {
      console.warn('Copy link failed.', error);
      setCopyStatus('error');
    }
  };

  const sharePopup = (link: string) => {
    window.open(link, 'Share', 'width=650,height=400');
  };

  return (
    <div id={id} className={rootClassName}>
      <div className="share-card-body">
        <div className="share-card-kicker">{kicker}</div>
        <p className="share-card-headline">{headline}</p>
        <p className="share-card-subtitle">{subtitle}</p>

        {showShareUrl ? (
          <div className="share-card-url">
            <span>{shareUrlLabel || 'Share link'}</span>
            <a href={shareUrl}>{shareUrl}</a>
          </div>
        ) : null}

        {contextLink ? (
          <p className="share-card-context-link">{contextLink}</p>
        ) : null}
      </div>

      <div className="share-card-primary-actions">
        <a className="share-card-action-button" href={smsLink}>
          <TextIcon />
          <span>{textActionLabel}</span>
        </a>

        <button type="button" className="share-card-action-button share-card-copy-button" onClick={handleCopyLink}>
          <LinkIcon />
          <span>{copyLabel}</span>
        </button>
      </div>

      <div className="share-card-feedback" aria-live="polite">
        {copyStatus === 'copied'
          ? 'The share link is ready to paste anywhere.'
          : copyStatus === 'error'
            ? 'Copying failed. You can still use the text button or share below.'
            : feedbackIdle}
      </div>

      <div className="share-card-social">
        <div className="share-card-social-title">Or share publicly</div>

        <div className="share-card-social-grid">
          {socialShares.map((share) => (
            <button
              type="button"
              className="share-card-social-button"
              onClick={() => sharePopup(share.getLink(shareUrl, shareText))}
              key={share.name}
            >
              <span className="share-card-social-icon">{share.svg}</span>
              <span className="share-card-social-label">{share.name}</span>
            </button>
          ))}
        </div>
      </div>

      {secondaryActions ? (
        <div className="share-card-secondary-actions">{secondaryActions}</div>
      ) : null}
    </div>
  );
}
