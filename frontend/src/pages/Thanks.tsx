import { useEffect, useEffectEvent, useState } from 'react';
import { Link } from 'react-router-dom';
import { useWizard } from '../context/WizardContext';
import { useApi } from '../hooks/useApi';
import { buildCampaignPublicUrl } from '../helpers/campaign-editor';

const GOAL_COUNT = 3;

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

function getFallbackTopic(subject: string | undefined, selectedTopics: string[]): string {
  if (selectedTopics.length > 0) {
    return selectedTopics[0];
  }

  const normalizedSubject = subject?.trim().replace(/[.!?]+$/, '');
  if (normalizedSubject && normalizedSubject.length <= 80) {
    return normalizedSubject;
  }

  return '';
}

function buildGoalCopy(topic: string): string {
  if (!topic) {
    return `Help get ${GOAL_COUNT} more people to write Congress today.`;
  }

  return `Help get ${GOAL_COUNT} more people to write Congress about ${topic} today.`;
}

function buildShareMessage(topic: string, shareUrl: string): string {
  if (!topic) {
    return `I just wrote my representatives using Democracy.io. I'm trying to get ${GOAL_COUNT} more people to message Congress today. Will you send one too? ${shareUrl}`;
  }

  return `I just wrote my representatives about ${topic} using Democracy.io. I'm trying to get ${GOAL_COUNT} more people to message Congress today. Will you send one too? ${shareUrl}`;
}

function buildCampaignShareMessage(
  campaignTitle: string,
  shareUrl: string,
  topic: string
) {
  if (!topic) {
    return `I just wrote my representatives through the ${campaignTitle} campaign on Democracy.io. Will you send one too? ${shareUrl}`;
  }

  return `I just wrote my representatives about ${topic} through the ${campaignTitle} campaign on Democracy.io. Will you send one too? ${shareUrl}`;
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

export function Thanks() {
  const api = useApi();
  const { activeCampaign, shareDraft } = useWizard();
  const searchParams = new URLSearchParams(window.location.search);
  const previewTopic = searchParams.get('previewTopic')?.trim() || '';

  const shareUrl = activeCampaign
    ? buildCampaignPublicUrl(activeCampaign.slug)
    : new URL('/', window.location.origin).toString();
  const selectedTopics = shareDraft?.selectedTopics || [];
  const selectedTopicsJson = JSON.stringify(selectedTopics);
  const primaryMessage = shareDraft?.message || '';
  const primarySubject = shareDraft?.subject;
  const initialTopic = previewTopic || getFallbackTopic(primarySubject, selectedTopics);

  const [shareTopic, setShareTopic] = useState(initialTopic);
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied' | 'error'>('idle');

  const fetchShareTopic = useEffectEvent(
    async (
      request: { subject?: string; message: string; selectedTopics: string[] },
      onSuccess: (topic: string) => void
    ) => {
      try {
        const result = await api.getShareTopic(request);
        if (result.topic.trim()) {
          onSuccess(result.topic.trim());
        }
      } catch (error) {
        console.warn('Share topic generation failed.', error);
      }
    }
  );

  useEffect(() => {
    setShareTopic(initialTopic);
  }, [initialTopic]);

  useEffect(() => {
    if (!primaryMessage.trim() || previewTopic) {
      return;
    }

    let cancelled = false;
    const parsedSelectedTopics = JSON.parse(selectedTopicsJson) as string[];

    void fetchShareTopic(
      {
        subject: primarySubject,
        message: primaryMessage,
        selectedTopics: parsedSelectedTopics,
      },
      (topic) => {
        if (!cancelled) {
          setShareTopic(topic);
        }
      }
    );

    return () => {
      cancelled = true;
    };
  }, [primaryMessage, primarySubject, previewTopic, selectedTopicsJson]);

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

  const shareMessage = buildShareMessage(shareTopic, shareUrl);
  const campaignShareMessage = activeCampaign
    ? buildCampaignShareMessage(activeCampaign.title, shareUrl, shareTopic)
    : shareMessage;
  const shareText = activeCampaign ? campaignShareMessage : shareMessage;
  const smsLink = `sms:?&body=${encodeURIComponent(shareText)}`;
  const copyLabel =
    copyStatus === 'copied' ? 'Link copied' : copyStatus === 'error' ? 'Copy failed' : 'Copy link';

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
    <div className="row">
      <div id="thanks" className="col-sm-8 col-md-6 col-lg-5">
        <div className="thanks-body">
          <div className="thanks-kicker">
            {activeCampaign ? 'Campaign action complete' : 'Personal shares work best'}
          </div>
          <p className="thanks-headline">
            {activeCampaign
              ? `You took action on ${activeCampaign.title}. Help get ${GOAL_COUNT} more people to write Congress today.`
              : buildGoalCopy(shareTopic)}
          </p>
          <p className="thanks-subtitle">
            {activeCampaign
              ? `Share this campaign page so other supporters can send their own message${activeCampaign.organizationName ? ` with ${activeCampaign.organizationName}` : ''}.`
              : 'Start with a text or copy the link, then post it publicly if you want.'}
          </p>
          {activeCampaign ? (
            <p className="thanks-campaign-return">
              <Link to={`/campaigns/${activeCampaign.slug}`}>Back to the campaign page</Link>
            </p>
          ) : null}
        </div>

        <div className="thanks-primary-actions">
          <a className="thanks-action-button" href={smsLink}>
            <TextIcon />
            <span>Text a friend</span>
          </a>

          <button type="button" className="thanks-action-button thanks-copy-button" onClick={handleCopyLink}>
            <LinkIcon />
            <span>{copyLabel}</span>
          </button>
        </div>

        <div className="thanks-feedback" aria-live="polite">
          {copyStatus === 'copied'
            ? 'The share link is ready to paste anywhere.'
            : copyStatus === 'error'
              ? 'Copying failed. You can still use the text button or share below.'
              : activeCampaign
                ? `Campaign: ${activeCampaign.title}`
                : `Topic: ${shareTopic || 'your message'}`}
        </div>

        <div className="thanks-social">
          <div className="thanks-social-title">Or share publicly</div>

          <div className="thanks-social-grid">
            {socialShares.map((share) => (
              <button
                type="button"
                className="thanks-social-button"
                onClick={() => sharePopup(share.getLink(shareUrl, shareText))}
                key={share.name}
              >
                <span className="thanks-social-icon">{share.svg}</span>
                <span className="thanks-social-label">{share.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
