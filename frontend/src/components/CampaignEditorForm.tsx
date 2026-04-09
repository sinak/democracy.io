import { useDeferredValue } from 'react';
import { Link } from 'react-router-dom';
import {
  buildCampaignPublicUrl,
  canCopyCampaignPublicUrl,
  getCampaignStatusLabel,
  isCampaignSlugLocked,
  type CampaignEditorErrors,
  type CampaignEditorValues,
} from '../helpers/campaign-editor';
import type { Campaign } from '../types';
import { CampaignMarkdownPreview } from './CampaignMarkdownPreview';
import { CampaignStatusBadge } from './CampaignStatusBadge';
import { HelperCard } from './HelperCard';
import { MarkdownEditor } from './MarkdownEditor';

export interface CampaignEditorNotice {
  tone: 'success' | 'error' | 'info';
  message: string;
}

interface CampaignEditorFormProps {
  campaign: Campaign | null;
  values: CampaignEditorValues;
  fieldErrors: CampaignEditorErrors;
  isUploading: boolean;
  notice: CampaignEditorNotice | null;
  pendingAction: 'save' | 'publish' | 'archive' | null;
  onArchive: (() => void) | null;
  onCopyPublicUrl: (() => void) | null;
  onFieldChange: (field: keyof CampaignEditorValues, value: string) => void;
  onPublish: () => void;
  onSave: () => void;
  onUpload: (file: File) => void;
  showSlugField: boolean;
}

function formatDate(value: string | null) {
  if (!value) {
    return 'Not yet';
  }

  return new Date(value).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function renderNotice(notice: CampaignEditorNotice | null) {
  if (!notice) {
    return null;
  }

  const alertClassName =
    notice.tone === 'success'
      ? 'alert alert-success organizer-alert organizer-inline-alert'
      : notice.tone === 'error'
        ? 'alert alert-danger organizer-alert organizer-inline-alert'
        : 'alert alert-info organizer-alert organizer-inline-alert';

  return <div className={alertClassName}>{notice.message}</div>;
}

function EditorField({
  children,
  error,
  label,
}: {
  children: React.ReactNode;
  error?: string;
  label: string;
}) {
  return (
    <div className="organizer-editor-field">
      <label>{label}</label>
      {children}
      {error ? <p className="organizer-field-error">{error}</p> : null}
    </div>
  );
}

export function CampaignEditorSidebar({
  campaign,
  hasRawHtml,
  showPublishingNotes = true,
  values,
}: {
  campaign: Campaign | null;
  hasRawHtml: boolean;
  showPublishingNotes?: boolean;
  values: CampaignEditorValues;
}) {
  const deferredDescriptionMarkdown = useDeferredValue(values.descriptionMarkdown);
  const publicUrl =
    campaign && canCopyCampaignPublicUrl(campaign)
      ? buildCampaignPublicUrl(campaign.slug)
      : null;

  return (
    <>
      <HelperCard title="Campaign preview">
        <div className="organizer-preview-shell">
          <div
            className={`organizer-preview-hero ${values.backgroundImageUrl ? 'has-image' : ''}`}
            style={
              values.backgroundImageUrl
                ? {
                    backgroundImage: `linear-gradient(rgba(41, 28, 24, 0.42), rgba(41, 28, 24, 0.54)), url(${values.backgroundImageUrl})`,
                  }
                : undefined
            }
          >
            {campaign ? <CampaignStatusBadge status={campaign.status} /> : null}
            <h2>{values.title || 'Untitled campaign'}</h2>
            <p>
              {campaign
                ? getCampaignStatusLabel(campaign)
                : 'Draft preview for the future public campaign page'}
            </p>
          </div>

          <div className="organizer-preview-body">
            {publicUrl ? (
              <div className="organizer-preview-meta">
                <span>Future public URL</span>
                <p>{publicUrl}</p>
              </div>
            ) : null}

            {values.organizationName ? (
              <div className="organizer-preview-meta">
                <span>Organizer</span>
                <p>{values.organizationName}</p>
              </div>
            ) : null}

            <div className="organizer-preview-meta">
              <span>Suggested subject</span>
              <p>{values.suggestedSubject || 'Add a short subject line supporters can start from.'}</p>
            </div>

            <div className="organizer-preview-meta">
              <span>Suggested message</span>
              <p>
                {values.suggestedMessage ||
                  'Supporters will see your suggested message here once you add it.'}
              </p>
            </div>

            <div className="organizer-preview-copy">
              <span>Description preview</span>
              {deferredDescriptionMarkdown ? (
                <CampaignMarkdownPreview markdown={deferredDescriptionMarkdown} />
              ) : (
                <p className="organizer-preview-placeholder">
                  Add markdown to preview the campaign description.
                </p>
              )}
            </div>
          </div>
        </div>
      </HelperCard>

      {showPublishingNotes ? (
        <HelperCard title="Publishing notes">
          <p>
            Slugs stay editable until the first publish. After that, the public path locks even if
            the campaign is archived later.
          </p>
          <p>
            Markdown accepts regular formatting, links, and external image URLs. Raw HTML is shown as
            plain text and never rendered.
          </p>
          {hasRawHtml ? (
            <p className="organizer-helper-warning">
              HTML tags were detected in the description. They will be ignored in preview and on the
              future public page.
            </p>
          ) : null}
          <p>
            Background images upload into the public <strong>campaign-assets</strong> bucket under
            your user folder, then the resulting public URL is saved with the draft.
          </p>
          {campaign ? (
            <dl className="organizer-meta-list organizer-meta-list--compact">
              <div>
                <dt>Created</dt>
                <dd>{formatDate(campaign.createdAt)}</dd>
              </div>
              <div>
                <dt>First publish</dt>
                <dd>{formatDate(campaign.firstPublishedAt)}</dd>
              </div>
            </dl>
          ) : null}
        </HelperCard>
      ) : null}
    </>
  );
}

export function CampaignEditorForm({
  campaign,
  fieldErrors,
  isUploading,
  notice,
  onArchive,
  onCopyPublicUrl,
  onFieldChange,
  onPublish,
  onSave,
  onUpload,
  pendingAction,
  showSlugField,
  values,
}: CampaignEditorFormProps) {
  const isDisabledByAdmin = campaign?.status === 'disabled';
  const slugLocked = isCampaignSlugLocked(campaign);
  const canPublish = !isDisabledByAdmin && (!campaign || campaign.status === 'draft');
  const canArchive = Boolean(campaign && campaign.status !== 'disabled' && campaign.status !== 'archived');
  const saveLabel =
    !campaign || campaign.status === 'draft' ? 'Save draft' : 'Save changes';

  return (
    <div className="organizer-editor-shell">
      {campaign?.status === 'disabled' ? (
        <div className="alert alert-danger organizer-inline-alert">
          This campaign is currently disabled by an admin. You can review the content here, but
          editing and publishing are paused until the campaign is restored.
        </div>
      ) : null}

      {campaign?.firstPublishedAt ? (
        <div className="alert alert-info organizer-inline-alert">
          This campaign has already been published once, so the slug is locked at
          {' '}
          <strong>/{campaign.slug}</strong>.
        </div>
      ) : null}

      {renderNotice(notice)}

      <div className="organizer-editor-section">
        <h2>Campaign basics</h2>
        <div className="organizer-editor-grid">
          <EditorField error={fieldErrors.title} label="Campaign title">
            <input
              className="form-control input-lg"
              disabled={isDisabledByAdmin}
              name="title"
              type="text"
              value={values.title}
              onChange={(event) => onFieldChange('title', event.target.value)}
            />
          </EditorField>

          {showSlugField ? (
            <EditorField error={fieldErrors.slug} label="Campaign slug">
              <input
                aria-label="Campaign slug"
                className="form-control input-lg"
                data-testid="campaign-editor-slug"
                disabled={isDisabledByAdmin || slugLocked}
                name="slug"
                type="text"
                value={values.slug}
                onChange={(event) => onFieldChange('slug', event.target.value)}
              />
              <p className="organizer-field-hint">
                Future public route:
                {' '}
                <strong>/campaigns/{values.slug || 'your-slug'}</strong>
              </p>
            </EditorField>
          ) : null}

          <EditorField error={fieldErrors.organizationName} label="Organization name (optional)">
            <input
              className="form-control input-lg"
              disabled={isDisabledByAdmin}
              name="organizationName"
              type="text"
              value={values.organizationName}
              onChange={(event) => onFieldChange('organizationName', event.target.value)}
            />
          </EditorField>

          <EditorField error={fieldErrors.organizationUrl} label="Organization URL (optional)">
            <input
              className="form-control input-lg"
              disabled={isDisabledByAdmin}
              name="organizationUrl"
              placeholder="https://example.org"
              type="url"
              value={values.organizationUrl}
              onChange={(event) => onFieldChange('organizationUrl', event.target.value)}
            />
          </EditorField>
        </div>
      </div>

      <div className="organizer-editor-section">
        <h2>Campaign content</h2>

        <EditorField error={fieldErrors.descriptionMarkdown} label="Description markdown">
          <MarkdownEditor
            disabled={isDisabledByAdmin}
            value={values.descriptionMarkdown}
            onChange={(nextValue) => onFieldChange('descriptionMarkdown', nextValue)}
          />
          <p className="organizer-field-hint">
            Use Markdown for structure. See the
            {' '}
            <a
              href="https://www.markdownguide.org/basic-syntax/"
              rel="noreferrer noopener"
              target="_blank"
            >
              Markdown Guide basic syntax reference
            </a>
            . Images must use external http or https URLs.
          </p>
        </EditorField>

        <EditorField error={fieldErrors.backgroundImageUrl} label="Background image URL">
          <input
            className="form-control input-lg"
            disabled={isDisabledByAdmin || isUploading}
            name="backgroundImageUrl"
            placeholder="https://images.example.org/banner.jpg"
            type="url"
            value={values.backgroundImageUrl}
            onChange={(event) => onFieldChange('backgroundImageUrl', event.target.value)}
          />
          <div className="organizer-upload-row">
            <label className="organizer-upload-label">
              <span>{isUploading ? 'Uploading image...' : 'Upload image'}</span>
              <input
                disabled={isDisabledByAdmin || isUploading}
                type="file"
                accept="image/*"
                onChange={(event) => {
                  const [file] = Array.from(event.target.files || []);

                  if (file) {
                    onUpload(file);
                  }

                  event.target.value = '';
                }}
              />
            </label>
            <p className="organizer-field-hint">
              Uploads replace the URL with the public object path result.
            </p>
          </div>
        </EditorField>

        <div className="organizer-editor-grid">
          <EditorField error={fieldErrors.suggestedSubject} label="Suggested subject">
            <input
              className="form-control input-lg"
              disabled={isDisabledByAdmin}
              name="suggestedSubject"
              type="text"
              value={values.suggestedSubject}
              onChange={(event) => onFieldChange('suggestedSubject', event.target.value)}
            />
          </EditorField>

          <EditorField error={fieldErrors.suggestedMessage} label="Suggested message">
            <textarea
              className="form-control organizer-editor-textarea organizer-editor-textarea--message"
              disabled={isDisabledByAdmin}
              name="suggestedMessage"
              value={values.suggestedMessage}
              onChange={(event) => onFieldChange('suggestedMessage', event.target.value)}
            />
          </EditorField>
        </div>
      </div>

      <div className="organizer-editor-actions">
        <button
          type="button"
          className="btn btn-lg btn-orange organizer-editor-button"
          disabled={isDisabledByAdmin || pendingAction !== null}
          onClick={onSave}
        >
          {pendingAction === 'save' ? 'Saving...' : saveLabel}
        </button>

        {canPublish ? (
          <button
            type="button"
            className="site-nav__button organizer-editor-button organizer-editor-button--primary"
            disabled={pendingAction !== null}
            onClick={onPublish}
          >
            {pendingAction === 'publish' ? 'Publishing...' : 'Publish'}
          </button>
        ) : null}

        {canArchive && onArchive ? (
          <button
            type="button"
            className="site-nav__button organizer-editor-button"
            disabled={pendingAction !== null}
            onClick={onArchive}
          >
            {pendingAction === 'archive' ? 'Archiving...' : 'Archive'}
          </button>
        ) : null}

        {campaign ? (
          <Link to="/organizer/campaigns" className="organizer-inline-link organizer-editor-link">
            Back to campaigns
          </Link>
        ) : null}

        {campaign && onCopyPublicUrl ? (
          <button
            type="button"
            className="site-nav__button organizer-editor-button organizer-editor-button--ghost"
            disabled={pendingAction !== null}
            onClick={onCopyPublicUrl}
          >
            Copy public URL
          </button>
        ) : null}
      </div>
    </div>
  );
}
