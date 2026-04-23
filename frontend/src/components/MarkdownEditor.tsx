import { useDeferredValue, useRef, useState } from 'react';
import { containsRawHtml } from '../helpers/campaign-editor';
import { CampaignMarkdownPreview } from './CampaignMarkdownPreview';

interface MarkdownEditorProps {
  disabled?: boolean;
  value: string;
  onChange: (value: string) => void;
}

interface EditorSelection {
  selectionEnd: number;
  selectionStart: number;
  value: string;
}

interface MarkdownShortcut {
  label: string;
  title: string;
  apply: (value: string, selectionStart: number, selectionEnd: number) => EditorSelection;
}

type EditorPane = 'write' | 'preview';

function countWords(value: string) {
  const trimmedValue = value.trim();

  if (!trimmedValue) {
    return 0;
  }

  return trimmedValue.split(/\s+/).length;
}

function countLines(value: string) {
  if (!value.trim()) {
    return 0;
  }

  return value.split(/\r?\n/).length;
}

function wrapSelection(
  value: string,
  selectionStart: number,
  selectionEnd: number,
  before: string,
  after: string,
  placeholder: string
): EditorSelection {
  const selectedText = value.slice(selectionStart, selectionEnd);
  const nextText = selectedText || placeholder;
  const nextValue =
    value.slice(0, selectionStart) + before + nextText + after + value.slice(selectionEnd);
  const nextSelectionStart = selectionStart + before.length;

  return {
    value: nextValue,
    selectionStart: nextSelectionStart,
    selectionEnd: nextSelectionStart + nextText.length,
  };
}

function replaceSelection(
  value: string,
  selectionStart: number,
  selectionEnd: number,
  replacement: string
): EditorSelection {
  const nextValue = value.slice(0, selectionStart) + replacement + value.slice(selectionEnd);

  return {
    value: nextValue,
    selectionStart,
    selectionEnd: selectionStart + replacement.length,
  };
}

function prefixSelectedLines(
  value: string,
  selectionStart: number,
  selectionEnd: number,
  prefix: string,
  placeholderLines: string[]
): EditorSelection {
  const selectedText = value.slice(selectionStart, selectionEnd);
  const lines = selectedText ? selectedText.split(/\r?\n/) : placeholderLines;
  const prefixedLines = lines.map((line) => `${prefix}${line}`);

  return replaceSelection(value, selectionStart, selectionEnd, prefixedLines.join('\n'));
}

function insertLink(value: string, selectionStart: number, selectionEnd: number): EditorSelection {
  const selectedText = value.slice(selectionStart, selectionEnd);
  const linkText = selectedText || 'Link text';
  const urlPlaceholder = 'https://example.org';
  const nextValue =
    value.slice(0, selectionStart) +
    `[${linkText}](${urlPlaceholder})` +
    value.slice(selectionEnd);
  const urlStart = selectionStart + linkText.length + 3;

  return {
    value: nextValue,
    selectionStart: urlStart,
    selectionEnd: urlStart + urlPlaceholder.length,
  };
}

function insertHeading(
  value: string,
  selectionStart: number,
  selectionEnd: number
): EditorSelection {
  const selectedText = value.slice(selectionStart, selectionEnd);
  const headingText = selectedText || 'Section heading';
  const nextValue =
    value.slice(0, selectionStart) + `## ${headingText}` + value.slice(selectionEnd);
  const headingStart = selectionStart + 3;

  return {
    value: nextValue,
    selectionStart: headingStart,
    selectionEnd: headingStart + headingText.length,
  };
}

function insertImage(value: string, selectionStart: number, selectionEnd: number): EditorSelection {
  const altPlaceholder = 'Describe the image';
  const urlPlaceholder = 'https://images.example.org/banner.jpg';
  const markdown = `![${altPlaceholder}](${urlPlaceholder})`;
  const nextValue = value.slice(0, selectionStart) + markdown + value.slice(selectionEnd);
  const urlStart = selectionStart + altPlaceholder.length + 4;

  return {
    value: nextValue,
    selectionStart: urlStart,
    selectionEnd: urlStart + urlPlaceholder.length,
  };
}

const MARKDOWN_SHORTCUTS: MarkdownShortcut[] = [
  {
    label: 'Heading',
    title: 'Insert a section heading',
    apply: insertHeading,
  },
  {
    label: 'Bold',
    title: 'Bold the selected text',
    apply(value, selectionStart, selectionEnd) {
      return wrapSelection(value, selectionStart, selectionEnd, '**', '**', 'Important point');
    },
  },
  {
    label: 'Link',
    title: 'Insert a markdown link',
    apply: insertLink,
  },
  {
    label: 'List',
    title: 'Turn the selection into a bullet list',
    apply(value, selectionStart, selectionEnd) {
      return prefixSelectedLines(value, selectionStart, selectionEnd, '- ', [
        'First point',
        'Second point',
      ]);
    },
  },
  {
    label: 'Quote',
    title: 'Insert a block quote',
    apply(value, selectionStart, selectionEnd) {
      return prefixSelectedLines(value, selectionStart, selectionEnd, '> ', [
        'Supporter or organizer quote',
      ]);
    },
  },
  {
    label: 'Image',
    title: 'Insert a markdown image',
    apply: insertImage,
  },
];

export function MarkdownEditor({
  disabled = false,
  onChange,
  value,
}: MarkdownEditorProps) {
  const deferredValue = useDeferredValue(value);
  const [activePane, setActivePane] = useState<EditorPane>('write');
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const wordCount = countWords(value);
  const lineCount = countLines(value);
  const hasRawHtml = containsRawHtml(value);

  function handleShortcut(shortcut: MarkdownShortcut) {
    const textarea = textareaRef.current;

    if (!textarea || disabled) {
      return;
    }

    const nextSelection = shortcut.apply(
      value,
      textarea.selectionStart ?? value.length,
      textarea.selectionEnd ?? value.length
    );

    onChange(nextSelection.value);

    requestAnimationFrame(() => {
      const nextTextarea = textareaRef.current;

      if (!nextTextarea) {
        return;
      }

      nextTextarea.focus();
      nextTextarea.setSelectionRange(nextSelection.selectionStart, nextSelection.selectionEnd);
    });
  }

  return (
    <div className={`markdown-editor markdown-editor--show-${activePane}`}>
      <div className="markdown-editor__toolbar">
        <div
          aria-label="Markdown formatting shortcuts"
          className="markdown-editor__toolbar-actions"
          role="toolbar"
        >
          <span className="markdown-editor__toolbar-label">Format</span>
          {MARKDOWN_SHORTCUTS.map((shortcut) => (
            <button
              key={shortcut.label}
              className="markdown-editor__toolbar-button"
              disabled={disabled}
              type="button"
              title={shortcut.title}
              onClick={() => handleShortcut(shortcut)}
              onMouseDown={(event) => event.preventDefault()}
            >
              {shortcut.label}
            </button>
          ))}
        </div>

        <div
          aria-label="Description editor view"
          className="markdown-editor__view-toggle"
          role="group"
        >
          <button
            aria-pressed={activePane === 'write'}
            className={activePane === 'write' ? 'is-active' : ''}
            type="button"
            onClick={() => setActivePane('write')}
          >
            Write
          </button>
          <button
            aria-pressed={activePane === 'preview'}
            className={activePane === 'preview' ? 'is-active' : ''}
            type="button"
            onClick={() => setActivePane('preview')}
          >
            Preview
          </button>
        </div>
      </div>

      <div className="markdown-editor__body">
        <section className="markdown-editor__pane markdown-editor__pane--write">
          <div className="markdown-editor__pane-header">
            <div>
              <span>Write</span>
              <p>Keep the copy scannable. Headings, bullets, links, and quotes all render cleanly.</p>
            </div>
            <strong>{wordCount} words / {lineCount} lines</strong>
          </div>

          <textarea
            aria-label="Campaign description markdown"
            className="form-control organizer-editor-textarea organizer-editor-textarea--description markdown-editor__textarea"
            disabled={disabled}
            name="descriptionMarkdown"
            placeholder={
              '## Why this campaign matters\n\nExplain the stakes, what supporters should know, and what action you want them to take.'
            }
            ref={textareaRef}
            value={value}
            onChange={(event) => onChange(event.target.value)}
          />

          <div className="markdown-editor__support">
            {hasRawHtml ? (
              <p className="markdown-editor__warning">
                HTML tags were detected in this draft. They will not render on the public page.
              </p>
            ) : null}

            <details className="markdown-editor__help">
              <summary>Markdown help</summary>
              <p>
                Use Markdown for structure. See the
                {' '}
                <a
                  href="https://www.markdownguide.org/basic-syntax/"
                  rel="noreferrer noopener"
                  target="_blank"
                >
                  Markdown Guide basic syntax reference
                </a>
                . Images must use external http or https URLs. Raw HTML stays plain text.
              </p>
              <div className="markdown-editor__syntax-list">
                <code>## Heading</code>
                <code>- Bullet list</code>
                <code>[Link](https://example.org)</code>
                <code>![Alt text](https://image-url)</code>
              </div>
            </details>
          </div>
        </section>

        <section className="markdown-editor__pane markdown-editor__pane--preview">
          <div className="markdown-editor__pane-header">
            <div>
              <span>Live preview</span>
              <p>Matches the campaign description renderer used on the public page.</p>
            </div>
          </div>

          <div className="markdown-editor__preview-frame">
            {deferredValue ? (
              <CampaignMarkdownPreview markdown={deferredValue} />
            ) : (
              <p className="markdown-editor__preview-empty">
                Start drafting on the left to see the supporter-facing description here.
              </p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
