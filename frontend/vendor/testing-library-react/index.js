import { renderToStaticMarkup } from 'react-dom/server';

let currentHtml = '';
let currentContainer = null;

function decodeHtml(value) {
  return value
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"');
}

function stripTags(value) {
  return decodeHtml(value.replace(/<[^>]+>/g, ' '));
}

function normalizeText(value) {
  return value.replace(/\s+/g, ' ').trim();
}

function createContainer(html) {
  const textContent = normalizeText(stripTags(html));

  return {
    innerHTML: html,
    textContent,
  };
}

function matches(matcher) {
  const text = currentContainer?.textContent || '';

  if (typeof matcher === 'string') {
    return text.includes(normalizeText(matcher));
  }

  if (matcher instanceof RegExp) {
    return matcher.test(text);
  }

  if (typeof matcher === 'function') {
    return matcher(text);
  }

  return false;
}

function queryByText(matcher) {
  if (!currentContainer) {
    return null;
  }

  return matches(matcher) ? currentContainer : null;
}

function getByText(matcher) {
  const result = queryByText(matcher);

  if (!result) {
    throw new Error(`Unable to find text matcher: ${String(matcher)}`);
  }

  return result;
}

export function cleanup() {
  currentHtml = '';
  currentContainer = null;
}

export function render(ui) {
  currentHtml = renderToStaticMarkup(ui);
  currentContainer = createContainer(currentHtml);

  return {
    container: currentContainer,
    rerender(nextUi) {
      return render(nextUi);
    },
    unmount() {
      cleanup();
    },
    asFragment() {
      return currentHtml;
    },
    getByText,
    queryByText,
  };
}

export const screen = {
  getByText,
  queryByText,
};
