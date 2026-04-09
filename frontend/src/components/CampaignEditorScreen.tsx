import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  archiveCampaign,
  createCampaign,
  getOrganizerCampaign,
  publishCampaign,
  updateCampaign,
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
  toCampaignUpdateRequest,
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
  const [pendingAction, setPendingAction] = useState<'save' | 'publish' | 'archive' | null>(null);
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);

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
        setSlugManuallyEdited(
          nextCampaign.slug !== normalizeCampaignEditorSlug(nextCampaign.title)
        );
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

    if (field === 'title') {
      setValues((currentValues) => ({
        ...currentValues,
        title: value,
        slug:
          mode !== 'create' && !campaign?.firstPublishedAt && !slugManuallyEdited
            ? normalizeCampaignEditorSlug(value)
            : currentValues.slug,
      }));
      return;
    }

    if (field === 'slug') {
      setSlugManuallyEdited(true);
      setValues((currentValues) => ({
        ...currentValues,
        slug: normalizeCampaignEditorSlug(value),
      }));
      return;
    }

    setValues((currentValues) => ({
      ...currentValues,
      [field]: value,
    }));
  }

  async function handleSave() {
    if (!session?.access_token) {
      return;
    }

    const validation = validateCampaignEditor(values, 'draft', {
      requireSlug: mode !== 'create',
    });
    setFieldErrors(validation.fieldErrors);

    if (!validation.isValid) {
      setNotice({
        tone: 'error',
        message: 'Fix the highlighted fields before saving the draft.',
      });
      return;
    }

    setPendingAction('save');
    setNotice(null);

    try {
      if (!campaign) {
        const createdCampaign = await createCampaign(
          session.access_token,
          serializeCampaignEditorRequest(validation.normalizedValues)
        );

        navigate(`/organizer/campaigns/${createdCampaign.id}/edit`, {
          replace: true,
          state: { flashMessage: 'Draft saved.' },
        });
        return;
      }

      const nextCampaign = await updateCampaign(
        session.access_token,
        campaign.id,
        toCampaignUpdateRequest(validation.normalizedValues)
      );
      const nextValues = parseCampaignEditorValues(nextCampaign);

      setCampaign(nextCampaign);
      setValues(nextValues);
      setSlugManuallyEdited(
        nextCampaign.slug !== normalizeCampaignEditorSlug(nextCampaign.title)
      );
      setNotice({
        tone: 'success',
        message:
          nextCampaign.status === 'draft'
            ? 'Draft saved.'
            : 'Campaign changes saved.',
      });
    } catch (error) {
      setNotice({
        tone: 'error',
        message: normalizeEditorError(error, 'Unable to save this campaign.'),
      });
    } finally {
      setPendingAction(null);
    }
  }

  async function handlePublish() {
    if (!session?.access_token) {
      return;
    }

    const validation = validateCampaignEditor(values, 'publish', {
      requireSlug: mode !== 'create',
    });
    setFieldErrors(validation.fieldErrors);

    if (!validation.isValid) {
      setNotice({
        tone: 'error',
        message: 'Finish the required fields before publishing.',
      });
      return;
    }

    setPendingAction('publish');
    setNotice(null);

    try {
      const upsertedCampaign = campaign
        ? await updateCampaign(
            session.access_token,
            campaign.id,
            toCampaignUpdateRequest(validation.normalizedValues)
          )
        : await createCampaign(
            session.access_token,
            serializeCampaignEditorRequest(validation.normalizedValues)
          );
      const publishedCampaign = await publishCampaign(
        session.access_token,
        upsertedCampaign.id
      );

      if (!campaign) {
        navigate(`/organizer/campaigns/${publishedCampaign.id}/edit`, {
          replace: true,
          state: { flashMessage: 'Campaign published.' },
        });
        return;
      }

      setCampaign(publishedCampaign);
      setValues(parseCampaignEditorValues(publishedCampaign));
      setNotice({
        tone: 'success',
        message: 'Campaign published.',
      });
    } catch (error) {
      setNotice({
        tone: 'error',
        message: normalizeEditorError(error, 'Unable to publish this campaign.'),
      });
    } finally {
      setPendingAction(null);
    }
  }

  async function handleArchive() {
    if (!session?.access_token || !campaign) {
      return;
    }

    const validation = validateCampaignEditor(values, 'draft');
    setFieldErrors(validation.fieldErrors);

    if (!validation.isValid) {
      setNotice({
        tone: 'error',
        message: 'Fix the highlighted fields before archiving.',
      });
      return;
    }

    setPendingAction('archive');
    setNotice(null);

    try {
      await updateCampaign(
        session.access_token,
        campaign.id,
        toCampaignUpdateRequest(validation.normalizedValues)
      );

      const archivedCampaign = await archiveCampaign(session.access_token, campaign.id);

      setCampaign(archivedCampaign);
      setValues(parseCampaignEditorValues(archivedCampaign));
      setNotice({
        tone: 'success',
        message: 'Campaign archived.',
      });
    } catch (error) {
      setNotice({
        tone: 'error',
        message: normalizeEditorError(error, 'Unable to archive this campaign.'),
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
      : campaign?.title || 'Campaign editor';
  const intro =
    mode === 'create'
      ? `Signed in as ${user?.email || 'an organizer'}. Draft here first, then publish when the copy and background image are ready.`
      : 'Edit the campaign content, upload the background image, and manage publication without leaving the organizer workspace.';

  return (
    <OrganizerPageLayout
      eyebrow={mode === 'create' ? 'Organizer workspace' : 'Campaign editor'}
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
          onSave={() => void handleSave()}
          onUpload={(file) => void handleUpload(file)}
          pendingAction={pendingAction}
          showSlugField={mode !== 'create'}
          values={values}
        />
      )}
    </OrganizerPageLayout>
  );
}
