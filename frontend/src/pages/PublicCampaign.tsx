import { useEffect, useRef, useState, type ReactNode } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AddressCaptureCard } from '../components/AddressCaptureCard';
import { CampaignMarkdownPreview } from '../components/CampaignMarkdownPreview';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { useWizard } from '../context/WizardContext';
import { getPublicCampaign, recordPublicCampaignEvent } from '../helpers/campaign-api';
import {
  getPublicCampaignContent,
  type PublicCampaignContent,
} from '../helpers/public-campaign';
import type { CanonicalAddress, PublicCampaign } from '../types';

function CampaignStat({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="campaign-stat">
      <span className="campaign-stat__value">{value.toLocaleString()}</span>
      <span className="campaign-stat__label">{label}</span>
    </div>
  );
}

export function PublicCampaignLayout({
  campaign,
  campaignContent,
  heroImageReady,
  addressCard,
}: {
  campaign: PublicCampaign;
  campaignContent: PublicCampaignContent;
  heroImageReady: boolean;
  addressCard: ReactNode;
}) {
  return (
    <div className="campaign-public-page">
      <section
        className={`campaign-public-page__hero ${heroImageReady ? 'has-image' : 'is-fallback'}`}
        style={
          heroImageReady && campaignContent.backgroundImageUrl
            ? {
                backgroundImage: `linear-gradient(rgba(46, 20, 24, 0.42), rgba(46, 20, 24, 0.62)), url(${campaignContent.backgroundImageUrl})`,
              }
            : undefined
        }
        data-testid="campaign-hero"
      >
        <div className="container">
          <div className="campaign-public-page__main">
            <div className="campaign-public-page__copy">
              <p className="campaign-public-page__eyebrow">
                {campaign.organizationName || 'Public campaign'}
              </p>
              <h1>{campaign.title}</h1>
              <p className="campaign-public-page__lede">
                Send a message to your members of Congress through Democracy.io. Start with your
                address and continue with your own words.
              </p>
              {campaign.organizationUrl ? (
                <p className="campaign-public-page__meta">
                  <a href={campaign.organizationUrl} target="_blank" rel="noreferrer noopener">
                    Learn more about the organization
                  </a>
                </p>
              ) : null}
            </div>

            {addressCard}
          </div>
        </div>
      </section>

      <section className="campaign-public-page__description">
        <div className="container">
          <div className="campaign-public-page__description-grid">
            <div className="campaign-public-page__description-card whitebox">
              <div className="whitebox-container">
                <div className="campaign-public-page__description-header">
                  <span>Cause description</span>
                </div>
                {campaignContent.descriptionMarkdown ? (
                  <CampaignMarkdownPreview markdown={campaignContent.descriptionMarkdown} />
                ) : (
                  <p className="campaign-public-page__description-empty">
                    Additional campaign context has not been published yet.
                  </p>
                )}
              </div>
            </div>

            <aside className="campaign-public-page__sidebar" data-testid="campaign-stats-rail">
              <div className="campaign-stats-card">
                <div className="campaign-stats-card__header">Campaign activity</div>
                <CampaignStat
                  label="People have taken action"
                  value={campaign.stats.peopleTakenAction}
                />
                <CampaignStat
                  label="Total messages sent"
                  value={campaign.stats.totalMessagesSent}
                />
              </div>
            </aside>
          </div>
        </div>
      </section>
    </div>
  );
}

export function PublicCampaignPage() {
  const navigate = useNavigate();
  const { slug = '' } = useParams();
  const {
    campaignSessionId,
    clearCampaignContext,
    resetFlow,
    setActiveCampaign,
    setCanonicalAddress,
  } = useWizard();
  const [campaign, setCampaign] = useState<PublicCampaign | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [heroImageReady, setHeroImageReady] = useState(false);
  const pageViewLoggedRef = useRef(false);

  const campaignContent = campaign ? getPublicCampaignContent(campaign) : null;

  useEffect(() => {
    if (!slug) {
      setLoading(false);
      setError('Campaign not found.');
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    void getPublicCampaign(slug)
      .then((nextCampaign) => {
        if (cancelled) {
          return;
        }

        setCampaign(nextCampaign);
        setLoading(false);

        const nextSessionId = setActiveCampaign(nextCampaign);

        if (!pageViewLoggedRef.current) {
          pageViewLoggedRef.current = true;

          void recordPublicCampaignEvent(nextCampaign.slug, {
            type: 'page_view',
            metadata: nextSessionId
              ? {
                  campaignSessionId: nextSessionId,
                }
              : undefined,
          }).catch((nextError) => {
            console.warn('Campaign page view logging failed.', nextError);
          });
        }
      })
      .catch((nextError) => {
        if (cancelled) {
          return;
        }

        clearCampaignContext();
        setCampaign(null);
        setLoading(false);
        setError(
          nextError instanceof Error ? nextError.message : 'Unable to load this campaign right now.'
        );
      });

    return () => {
      cancelled = true;
    };
  }, [clearCampaignContext, setActiveCampaign, slug]);

  useEffect(() => {
    const backgroundImageUrl = campaignContent?.backgroundImageUrl;

    if (!backgroundImageUrl) {
      setHeroImageReady(false);
      return;
    }

    let cancelled = false;
    const image = new window.Image();

    image.onload = () => {
      if (!cancelled) {
        setHeroImageReady(true);
      }
    };

    image.onerror = () => {
      if (!cancelled) {
        setHeroImageReady(false);
      }
    };

    image.src = backgroundImageUrl;

    return () => {
      cancelled = true;
    };
  }, [campaignContent?.backgroundImageUrl]);

  async function handleVerifiedAddress(address: CanonicalAddress) {
    if (!campaign) {
      return;
    }

    const nextSessionId = campaignSessionId || setActiveCampaign(campaign);

    resetFlow({ preserveCampaignContext: true });
    setCanonicalAddress(address);
    navigate('/location');

    void recordPublicCampaignEvent(campaign.slug, {
      type: 'flow_start',
      metadata: nextSessionId
        ? {
            campaignSessionId: nextSessionId,
          }
        : undefined,
    }).catch((nextError) => {
      console.warn('Campaign flow start logging failed.', nextError);
    });
  }

  if (loading) {
    return (
      <div className="row">
        <div className="whitebox col-md-10">
          <LoadingSpinner
            className="whitebox-container"
            message="Loading campaign..."
            secondaryMessage="Fetching the live campaign page before rendering the public flow."
          />
        </div>
      </div>
    );
  }

  if (!campaign || error) {
    return (
      <div className="row">
        <div className="whitebox col-sm-10 col-md-8">
          <div className="whitebox-container">
            <h2>Campaign unavailable</h2>
            <p>{error || 'This campaign could not be loaded.'}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <PublicCampaignLayout
      campaign={campaign}
      campaignContent={campaignContent || getPublicCampaignContent(campaign)}
      heroImageReady={heroImageReady}
      addressCard={
        <AddressCaptureCard
          className="campaign-address-card"
          submitLabel="Find my representatives"
          onVerified={handleVerifiedAddress}
        />
      }
    />
  );
}
