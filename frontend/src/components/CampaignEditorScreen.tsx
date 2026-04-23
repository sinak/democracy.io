import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  archiveCampaign,
  createCampaign,
  getOrganizerCampaign,
  publishCampaign,
} from '../helpers/campaign-api';
import { uploadCampaignBackgroundImage } from '../helpers/campaign-assets';
import {
  buildCampaignPublicUrl,
  canCopyCampaignPublicUrl,
  containsRawHtml,
  createEmptyCampaignEditorValues,
  normalizeCampaignEditorSlug,
  parseCampaignEditorValues,
  serializeCampaignEditorRequest,
  validateCampaignEditor,
  type CampaignEditorValues,
} from '../helpers/campaign-editor';
import { useAuth } from '../context/AuthContext';
import type { Campaign } from '../types';
import { CampaignEditorForm, CampaignEditorSidebar, type CampaignEditorNotice } from './CampaignEditorForm';
import { LoadingSpinner } from './LoadingSpinner';
import { OrganizerPageLayout } from './OrganizerPageLayout';

function normalizeEditorError(error: unknown, fallbackMessage: string) {
  return error instanceof Error ? error.message : fallbackMessage;
}

export function CampaignEditorScreen({
  campaignId,
  mode,
}: {
  campaignId?: string;
  mode: 'create' | 'edit';
}) {
  const location = useLocation();
  const navigate = useNavigate();
  const { session, user } = useAuth();
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [values, setValues] = useState<CampaignEditorValues>(createEmptyCampaignEditorValues());
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(mode === 'edit');
  const [isUploading, setIsUploading] = useState(false);
  const [notice, setNotice] = useState<CampaignEditorNotice | null>(null);
  const [pendingAction, setPendingAction] = useState<'create' | 'publish' | 'archive' | null>(null);

  useEffect(() => {
    const flashMessage =
      typeof (location.state as { flashMessage?: unknown } | null)?.flashMessage === 'string'
        ? ((location.state as { flashMessage?: string }).flashMessage ?? null)
        : null;

    if (!flashMessage) {
      return;
    }

    setNotice({
      tone: 'success',
      message: flashMessage,
    });
    navigate(location.pathname, { replace: true, state: null });
  }, [location.pathname, location.state, navigate]);

  useEffect(() => {
    let active = true;

    if (mode !== 'edit') {
      setIsLoading(false);
      return;
    }

    if (!session?.access_token || !campaignId) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    void getOrganizerCampaign(session.access_token, campaignId)
      .then((nextCampaign) => {
        if (!active) {
          return;
        }

        const nextValues = parseCampaignEditorValues(nextCampaign);

        setCampaign(nextCampaign);
        setValues(nextValues);
        setFieldErrors({});
      })
      .catch((error) => {
        if (!active) {
          return;
        }

        setNotice({
          tone: 'error',
          message: normalizeEditorError(error, 'Unable to load this campaign.'),
        });
      })
      .finally(() => {
        if (active) {
          setIsLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [campaignId, mode, session?.access_token]);

  function setFieldValue(field: keyof CampaignEditorValues, value: string) {
    setNotice(null);
    setFieldErrors((currentErrors) => {
      if (!currentErrors[field]) {
        return currentErrors;
      }

      const nextErrors = { ...currentErrors };
      delete nextErrors[field];
      return nextErrors;
    });

    if (field === 'slug') {
      return;
    }

    if (field === 'title') {
      setValues((currentValues) => ({
        ...currentValues,
        title: value,
        slug:
          mode === 'create'
            ? normalizeCampaignEditorSlug(value)
            : currentValues.slug,
      }));
      return;
    }

    setValues((currentValues) => ({
      ...currentValues,
      [field]: value,
    }));
  }

  async function handleCreate() {
    if (!session?.access_token) {
      return;
    }

    const validation = validateCampaignEditor(values, 'publish', {
      requireSlug: false,
    });
    setFieldErrors(validation.fieldErrors);

    if (!validation.isValid) {
      setNotice({
        tone: 'error',
        message: 'Finish the required fields before creating the campaign.',
      });
      return;
    }

    setPendingAction('create');
    setNotice(null);

    try {
      const createdCampaign = await createCampaign(
        session.access_token,
        serializeCampaignEditorRequest(validation.normalizedValues)
      );
      const publishedCampaign = await publishCampaign(
        session.access_token,
        createdCampaign.id
      );

      navigate(`/organizer/campaigns/${publishedCampaign.id}/edit`, {
        replace: true,
        state: { flashMessage: 'Campaign created and enabled.' },
      });
    } catch (error) {
      setNotice({
        tone: 'error',
        message: normalizeEditorError(error, 'Unable to create this campaign.'),
      });
    } finally {
      setPendingAction(null);
    }
  }

  async function handlePublish() {
    if (!session?.access_token) {
      return;
    }

    setPendingAction('publish');
    setNotice(null);

    try {
      if (!campaign) {
        return;
      }

      const publishedCampaign = await publishCampaign(session.access_token, campaign.id);
      setCampaign(publishedCampaign);
      setValues(parseCampaignEditorValues(publishedCampaign));
      setNotice({
        tone: 'success',
        message: 'Campaign enabled.',
      });
    } catch (error) {
      setNotice({
        tone: 'error',
        message: normalizeEditorError(error, 'Unable to enable this campaign.'),
      });
    } finally {
      setPendingAction(null);
    }
  }

  async function handleArchive() {
    if (!session?.access_token || !campaign) {
      return;
    }

    setPendingAction('archive');
    setNotice(null);

    try {
      const archivedCampaign = await archiveCampaign(session.access_token, campaign.id);

      setCampaign(archivedCampaign);
      setValues(parseCampaignEditorValues(archivedCampaign));
      setNotice({
        tone: 'success',
        message: 'Campaign disabled.',
      });
    } catch (error) {
      setNotice({
        tone: 'error',
        message: normalizeEditorError(error, 'Unable to disable this campaign.'),
      });
    } finally {
      setPendingAction(null);
    }
  }

  async function handleUpload(file: File) {
    if (!session?.access_token || !user?.id) {
      return;
    }

    setIsUploading(true);
    setNotice(null);

    try {
      const result = await uploadCampaignBackgroundImage({
        accessToken: session.access_token,
        file,
        userId: user.id,
      });

      setValues((currentValues) => ({
        ...currentValues,
        backgroundImageUrl: result.publicUrl,
      }));
      setFieldErrors((currentErrors) => {
        if (!currentErrors.backgroundImageUrl) {
          return currentErrors;
        }

        const nextErrors = { ...currentErrors };
        delete nextErrors.backgroundImageUrl;
        return nextErrors;
      });
      setNotice({
        tone: 'success',
        message: 'Background image uploaded.',
      });
    } catch (error) {
      setNotice({
        tone: 'error',
        message: normalizeEditorError(error, 'Unable to upload the background image.'),
      });
    } finally {
      setIsUploading(false);
    }
  }

  async function handleCopyPublicUrl() {
    if (!campaign || !canCopyCampaignPublicUrl(campaign)) {
      return;
    }

    if (!navigator.clipboard?.writeText) {
      setNotice({
        tone: 'error',
        message: 'Clipboard access is not available in this browser.',
      });
      return;
    }

    try {
      await navigator.clipboard.writeText(buildCampaignPublicUrl(campaign.slug));
      setNotice({
        tone: 'success',
        message: 'Public URL copied.',
      });
    } catch (error) {
      setNotice({
        tone: 'error',
        message: normalizeEditorError(error, 'Unable to copy the public URL.'),
      });
    }
  }

  const hasRawHtml = containsRawHtml(values.descriptionMarkdown);
  const title =
    mode === 'create'
      ? 'Create an organizer campaign'
      : campaign?.title || 'Campaign manager';
  const intro =
    mode === 'create'
      ? `Signed in as ${user?.email || 'an organizer'}. Create the public campaign once here. After creation, the content locks and you can only enable or disable it.`
      : 'Review the saved campaign details and control whether supporters can access it.';

  return (
    <OrganizerPageLayout
      eyebrow={mode === 'create' ? 'Organizer workspace' : 'Campaign manager'}
      showHero={mode !== 'create'}
      sidebarPlacement={mode === 'create' ? 'below' : 'side'}
      title={title}
      intro={intro}
      sidebar={
        <CampaignEditorSidebar
          campaign={campaign}
          hasRawHtml={hasRawHtml}
          showPublishingNotes={mode !== 'create'}
          values={values}
        />
      }
      sidebarMode="stack"
    >
      {isLoading ? (
        <LoadingSpinner
          className="organizer-inline-loading"
          message="Loading campaign editor..."
          secondaryMessage="Fetching the live campaign contract before rendering the editor."
        />
      ) : (
        <CampaignEditorForm
          campaign={campaign}
          fieldErrors={fieldErrors}
          isUploading={isUploading}
          notice={notice}
          onArchive={campaign ? () => void handleArchive() : null}
          onCopyPublicUrl={
            campaign && canCopyCampaignPublicUrl(campaign)
              ? () => void handleCopyPublicUrl()
              : null
          }
          onFieldChange={setFieldValue}
          onPublish={() => void handlePublish()}
          onSave={() => void handleCreate()}
          onUpload={(file) => void handleUpload(file)}
          pendingAction={pendingAction}
          values={values}
        />
      )}
    </OrganizerPageLayout>
  );
}
