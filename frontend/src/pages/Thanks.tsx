import { useEffect, useEffectEvent, useState } from 'react';
import { Link } from 'react-router-dom';
import { ShareCard } from '../components/ShareCard';
import { useWizard } from '../context/WizardContext';
import { buildCampaignPath } from '../helpers/campaign-path';
import { useApi } from '../hooks/useApi';
import { buildCampaignPublicUrl } from '../helpers/campaign-editor';

const GOAL_COUNT = 3;

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

  const shareMessage = buildShareMessage(shareTopic, shareUrl);
  const campaignShareMessage = activeCampaign
    ? buildCampaignShareMessage(activeCampaign.title, shareUrl, shareTopic)
    : shareMessage;
  const shareText = activeCampaign ? campaignShareMessage : shareMessage;

  return (
    <div className="row">
      <ShareCard
        id="thanks"
        className="col-sm-8 col-md-6 col-lg-5"
        contextLink={
          activeCampaign ? (
            <Link to={buildCampaignPath(activeCampaign.slug)}>Back to the campaign page</Link>
          ) : null
        }
        feedbackIdle={
          activeCampaign
            ? `Campaign: ${activeCampaign.title}`
            : `Topic: ${shareTopic || 'your message'}`
        }
        headline={
          activeCampaign
            ? `You took action on ${activeCampaign.title}. Help get ${GOAL_COUNT} more people to write Congress today.`
            : buildGoalCopy(shareTopic)
        }
        kicker={activeCampaign ? 'Campaign action complete' : 'Personal shares work best'}
        shareText={shareText}
        shareUrl={shareUrl}
        subtitle={
          activeCampaign
            ? `Share this campaign page so other supporters can send their own message${activeCampaign.organizationName ? ` with ${activeCampaign.organizationName}` : ''}.`
            : 'Start with a text or copy the link, then post it publicly if you want.'
        }
      />
    </div>
  );
}
