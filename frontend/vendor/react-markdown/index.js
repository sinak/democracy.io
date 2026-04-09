import { Fragment, createElement } from 'react';

const HEADING_RE = /^(#{1,6})[ \t]+(.+?)\s*#*\s*$/;
const LIST_MARKER_RE = /^(\s{0,3})([*+-]|\d+\.)\s+(.*)$/;
const FENCE_RE = /^```([^\s`]*)\s*$/;
const HR_RE = /^ {0,3}([-*_])(?:\s*\1){2,}\s*$/;
const TABLE_SEPARATOR_RE = /^:?-{3,}:?$/;
const SAFE_PROTOCOLS = new Set(['http', 'https', 'mailto', 'tel']);

export function defaultUrlTransform(url) {
  return sanitizeUrl(url);
}

export const uriTransformer = defaultUrlTransform;

export default function ReactMarkdown(options = {}) {
  const {
    allowedElements,
    children,
    components,
    disallowedElements,
    linkTarget,
    remarkPlugins,
    skipHtml,
    unwrapDisallowed = false,
    urlTransform = defaultUrlTransform,
  } = options;

  void remarkPlugins;
  void skipHtml;

  const context = {
    allowedElements: allowedElements ? new Set(allowedElements) : null,
    components: components || {},
    disallowedElements: disallowedElements ? new Set(disallowedElements) : new Set(),
    linkTarget,
    unwrapDisallowed,
    urlTransform,
  };
  const source = normalizeSource(children);
  const nodes = parseBlocks(source.split('\n'));

  return createElement(Fragment, null, renderBlocks(nodes, 'md', context));
}

function normalizeSource(value) {
  if (value == null) {
    return '';
  }

  return String(value).replace(/\r\n?/g, '\n').replace(/\t/g, '    ');
}

function sanitizeUrl(url) {
  if (typeof url !== 'string') {
    return null;
  }

  const value = url.trim();

  if (!value) {
    return null;
  }

  if (
    value.startsWith('#') ||
    value.startsWith('/') ||
    value.startsWith('./') ||
    value.startsWith('../') ||
    value.startsWith('?')
  ) {
    return value;
  }

  const protocolMatch = /^([a-zA-Z][a-zA-Z\d+.-]*):/.exec(value);

  if (!protocolMatch) {
    return value;
  }

  return SAFE_PROTOCOLS.has(protocolMatch[1].toLowerCase()) ? value : null;
}

function parseBlocks(lines) {
  const nodes = [];
  let index = 0;

  while (index < lines.length) {
    if (isBlank(lines[index])) {
      index += 1;
      continue;
    }

    const heading = parseHeading(lines[index]);

    if (heading) {
      nodes.push(heading);
      index += 1;
      continue;
    }

    const fence = parseFence(lines, index);

    if (fence) {
      nodes.push(fence.node);
      index = fence.nextIndex;
      continue;
    }

    if (HR_RE.test(lines[index])) {
      nodes.push({ type: 'thematicBreak' });
      index += 1;
      continue;
    }

    const table = parseTable(lines, index);

    if (table) {
      nodes.push(table.node);
      index = table.nextIndex;
      continue;
    }

    const blockquote = parseBlockquote(lines, index);

    if (blockquote) {
      nodes.push(blockquote.node);
      index = blockquote.nextIndex;
      continue;
    }

    const list = parseList(lines, index);

    if (list) {
      nodes.push(list.node);
      index = list.nextIndex;
      continue;
    }

    const paragraphLines = [];

    while (index < lines.length) {
      if (isBlank(lines[index])) {
        break;
      }

      if (startsBlock(lines, index) && paragraphLines.length > 0) {
        break;
      }

      paragraphLines.push(lines[index]);
      index += 1;
    }

    nodes.push({
      type: 'paragraph',
      children: parseInline(joinParagraphLines(paragraphLines)),
    });
  }

  return nodes;
}

function startsBlock(lines, index) {
  if (index >= lines.length) {
    return false;
  }

  const line = lines[index];

  return (
    Boolean(parseHeading(line)) ||
    FENCE_RE.test(line) ||
    HR_RE.test(line) ||
    /^>\s?/.test(line) ||
    Boolean(parseListMarker(line)) ||
    Boolean(parseTable(lines, index))
  );
}

function parseHeading(line) {
  const match = HEADING_RE.exec(line);

  if (!match) {
    return null;
  }

  return {
    type: 'heading',
    depth: match[1].length,
    children: parseInline(match[2].trim()),
  };
}

function parseFence(lines, startIndex) {
  const match = FENCE_RE.exec(lines[startIndex]);

  if (!match) {
    return null;
  }

  const language = match[1] || null;
  const content = [];
  let index = startIndex + 1;

  while (index < lines.length && !/^```/.test(lines[index])) {
    content.push(lines[index]);
    index += 1;
  }

  return {
    nextIndex: index < lines.length ? index + 1 : index,
    node: {
      type: 'codeBlock',
      language,
      value: content.join('\n'),
    },
  };
}

function parseBlockquote(lines, startIndex) {
  if (!/^>\s?/.test(lines[startIndex])) {
    return null;
  }

  const collected = [];
  let index = startIndex;

  while (index < lines.length) {
    const line = lines[index];

    if (/^>\s?/.test(line)) {
      collected.push(line.replace(/^>\s?/, ''));
      index += 1;
      continue;
    }

    if (isBlank(line) && index + 1 < lines.length && /^>\s?/.test(lines[index + 1])) {
      collected.push('');
      index += 1;
      continue;
    }

    break;
  }

  return {
    nextIndex: index,
    node: {
      type: 'blockquote',
      children: parseBlocks(collected),
    },
  };
}

function parseList(lines, startIndex) {
  const firstMarker = parseListMarker(lines[startIndex]);

  if (!firstMarker) {
    return null;
  }

  const ordered = firstMarker.ordered;
  const indent = firstMarker.indent;
  const items = [];
  let index = startIndex;

  while (index < lines.length) {
    const marker = parseListMarker(lines[index]);

    if (!marker || marker.indent !== indent || marker.ordered !== ordered) {
      break;
    }

    const itemLines = [marker.text];
    index += 1;

    while (index < lines.length) {
      if (isBlank(lines[index])) {
        const lookahead = findNextContentIndex(lines, index + 1);

        if (lookahead >= lines.length) {
          index = lookahead;
          break;
        }

        const nextMarker = parseListMarker(lines[lookahead]);

        if (nextMarker && nextMarker.indent === indent && nextMarker.ordered === ordered) {
          index = lookahead;
          break;
        }

        itemLines.push('');
        index += 1;
        continue;
      }

      const nextMarker = parseListMarker(lines[index]);

      if (nextMarker && nextMarker.indent === indent && nextMarker.ordered === ordered) {
        break;
      }

      if (leadingSpaces(lines[index]) < indent + 2) {
        break;
      }

      itemLines.push(stripListIndent(lines[index], indent));
      index += 1;
    }

    items.push(parseListItem(itemLines));
  }

  return {
    nextIndex: index,
    node: {
      type: 'list',
      items,
      ordered,
      start: ordered ? firstMarker.start : undefined,
    },
  };
}

function parseListItem(lines) {
  const normalized = [...lines];
  let task = false;
  let checked = false;

  if (normalized.length > 0) {
    const match = /^\[( |x|X)\]\s+(.*)$/.exec(normalized[0]);

    if (match) {
      task = true;
      checked = match[1].toLowerCase() === 'x';
      normalized[0] = match[2];
    }
  }

  return {
    type: 'listItem',
    checked,
    children: parseBlocks(normalized),
    task,
  };
}

function parseTable(lines, startIndex) {
  if (startIndex + 1 >= lines.length) {
    return null;
  }

  const header = splitTableRow(lines[startIndex]);

  if (header.length < 2) {
    return null;
  }

  const alignment = parseTableAlignment(lines[startIndex + 1], header.length);

  if (!alignment) {
    return null;
  }

  const rows = [];
  let index = startIndex + 2;

  while (index < lines.length && !isBlank(lines[index])) {
    const row = splitTableRow(lines[index]);

    if (row.length === 0) {
      break;
    }

    rows.push(padCells(row, header.length));
    index += 1;
  }

  return {
    nextIndex: index,
    node: {
      type: 'table',
      alignment,
      header: header.map((cell) => parseInline(cell)),
      rows: rows.map((row) => row.map((cell) => parseInline(cell))),
    },
  };
}

function splitTableRow(line) {
  const trimmed = line.trim();

  if (!trimmed.includes('|')) {
    return [];
  }

  let value = trimmed;

  if (value.startsWith('|')) {
    value = value.slice(1);
  }

  if (value.endsWith('|')) {
    value = value.slice(0, -1);
  }

  const cells = [];
  let buffer = '';

  for (let index = 0; index < value.length; index += 1) {
    const character = value[index];

    if (character === '\\' && index + 1 < value.length) {
      buffer += value[index + 1];
      index += 1;
      continue;
    }

    if (character === '|') {
      cells.push(buffer.trim());
      buffer = '';
      continue;
    }

    buffer += character;
  }

  cells.push(buffer.trim());

  return cells;
}

function parseTableAlignment(line, columnCount) {
  const cells = splitTableRow(line);

  if (cells.length !== columnCount) {
    return null;
  }

  const alignment = [];

  for (const cell of cells) {
    if (!TABLE_SEPARATOR_RE.test(cell)) {
      return null;
    }

    const starts = cell.startsWith(':');
    const ends = cell.endsWith(':');
    alignment.push(starts && ends ? 'center' : ends ? 'right' : starts ? 'left' : null);
  }

  return alignment;
}

function padCells(cells, length) {
  const result = cells.slice(0, length);

  while (result.length < length) {
    result.push('');
  }

  return result;
}

function parseInline(text) {
  const nodes = [];
  let buffer = '';
  let index = 0;

  while (index < text.length) {
    const character = text[index];

    if (character === '\\' && index + 1 < text.length) {
      buffer += text[index + 1];
      index += 2;
      continue;
    }

    if (character === '\n') {
      buffer += ' ';
      index += 1;
      continue;
    }

    if (character === '`') {
      const closing = findClosingDelimiter(text, '`', index + 1);

      if (closing !== -1) {
        pushText(nodes, buffer);
        buffer = '';
        nodes.push({
          type: 'inlineCode',
          value: text.slice(index + 1, closing),
        });
        index = closing + 1;
        continue;
      }
    }

    if (text.startsWith('![', index)) {
      const image = parseLinkLike(text, index, true);

      if (image) {
        pushText(nodes, buffer);
        buffer = '';
        nodes.push(image.node);
        index = image.nextIndex;
        continue;
      }
    }

    if (character === '[') {
      const link = parseLinkLike(text, index, false);

      if (link) {
        pushText(nodes, buffer);
        buffer = '';
        nodes.push(link.node);
        index = link.nextIndex;
        continue;
      }
    }

    if (text.startsWith('**', index) || text.startsWith('__', index) || text.startsWith('~~', index)) {
      const delimiter = text.slice(index, index + 2);
      const closing = findClosingDelimiter(text, delimiter, index + 2);

      if (closing !== -1) {
        const value = text.slice(index + 2, closing);

        if (value) {
          pushText(nodes, buffer);
          buffer = '';
          nodes.push({
            type: delimiter === '~~' ? 'delete' : 'strong',
            children: parseInline(value),
          });
          index = closing + 2;
          continue;
        }
      }
    }

    if (character === '*' || character === '_') {
      const closing = findClosingDelimiter(text, character, index + 1);

      if (closing !== -1) {
        const value = text.slice(index + 1, closing);

        if (value) {
          pushText(nodes, buffer);
          buffer = '';
          nodes.push({
            type: 'emphasis',
            children: parseInline(value),
          });
          index = closing + 1;
          continue;
        }
      }
    }

    buffer += character;
    index += 1;
  }

  pushText(nodes, buffer);
  return nodes;
}

function parseLinkLike(text, startIndex, image) {
  const labelStart = startIndex + (image ? 2 : 1);
  const labelEnd = findClosingBracket(text, labelStart);

  if (labelEnd === -1 || text[labelEnd + 1] !== '(') {
    return null;
  }

  const destinationEnd = findClosingParen(text, labelEnd + 2);

  if (destinationEnd === -1) {
    return null;
  }

  const label = text.slice(labelStart, labelEnd);
  const destination = parseLinkDestination(text.slice(labelEnd + 2, destinationEnd).trim());

  if (!destination.url) {
    return null;
  }

  return {
    nextIndex: destinationEnd + 1,
    node: image
      ? {
          type: 'image',
          alt: label,
          title: destination.title,
          url: destination.url,
        }
      : {
          type: 'link',
          children: parseInline(label),
          title: destination.title,
          url: destination.url,
        },
  };
}

function parseLinkDestination(value) {
  if (!value) {
    return { title: null, url: null };
  }

  const match = /^(?:<([^>]+)>|(\S+))(?:\s+["']([^"']*)["'])?$/.exec(value);

  if (!match) {
    return { title: null, url: null };
  }

  return {
    title: match[3] || null,
    url: match[1] || match[2] || null,
  };
}

function findClosingDelimiter(text, delimiter, startIndex) {
  let index = startIndex;

  while (index < text.length) {
    const found = text.indexOf(delimiter, index);

    if (found === -1) {
      return -1;
    }

    if (text[found - 1] !== '\\') {
      return found;
    }

    index = found + delimiter.length;
  }

  return -1;
}

function findClosingBracket(text, startIndex) {
  let depth = 0;

  for (let index = startIndex; index < text.length; index += 1) {
    const character = text[index];

    if (character === '\\') {
      index += 1;
      continue;
    }

    if (character === '[') {
      depth += 1;
      continue;
    }

    if (character === ']') {
      if (depth === 0) {
        return index;
      }

      depth -= 1;
    }
  }

  return -1;
}

function findClosingParen(text, startIndex) {
  let depth = 0;

  for (let index = startIndex; index < text.length; index += 1) {
    const character = text[index];

    if (character === '\\') {
      index += 1;
      continue;
    }

    if (character === '(') {
      depth += 1;
      continue;
    }

    if (character === ')') {
      if (depth === 0) {
        return index;
      }

      depth -= 1;
    }
  }

  return -1;
}

function pushText(nodes, value) {
  if (!value) {
    return;
  }

  const previous = nodes[nodes.length - 1];

  if (typeof previous === 'string') {
    nodes[nodes.length - 1] = previous + value;
    return;
  }

  nodes.push(value);
}

function parseListMarker(line) {
  const match = LIST_MARKER_RE.exec(line);

  if (!match) {
    return null;
  }

  const marker = match[2];

  return {
    indent: match[1].length,
    ordered: marker.endsWith('.'),
    start: marker.endsWith('.') ? Number.parseInt(marker, 10) : undefined,
    text: match[3],
  };
}

function leadingSpaces(line) {
  const match = /^ */.exec(line);
  return match ? match[0].length : 0;
}

function stripListIndent(line, indent) {
  const actualIndent = leadingSpaces(line);
  const stripCount = actualIndent >= indent + 2 ? indent + 2 : Math.min(actualIndent, indent);
  return line.slice(stripCount);
}

function findNextContentIndex(lines, startIndex) {
  let index = startIndex;

  while (index < lines.length && isBlank(lines[index])) {
    index += 1;
  }

  return index;
}

function joinParagraphLines(lines) {
  return lines.map((line) => line.trim()).join('\n');
}

function isBlank(line) {
  return line.trim() === '';
}

function renderBlocks(nodes, keyPrefix, context) {
  const rendered = [];

  nodes.forEach((node, index) => {
    const value = renderBlock(node, `${keyPrefix}-${index}`, context);

    if (value !== null && value !== undefined) {
      rendered.push(value);
    }
  });

  return rendered;
}

function renderBlock(node, key, context) {
  switch (node.type) {
    case 'paragraph':
      return renderElement(
        'p',
        { node },
        renderInlineNodes(node.children, `${key}-c`, context),
        key,
        context
      );
    case 'heading':
      return renderElement(
        `h${node.depth}`,
        { node },
        renderInlineNodes(node.children, `${key}-c`, context),
        key,
        context
      );
    case 'blockquote':
      return renderElement(
        'blockquote',
        { node },
        renderBlocks(node.children, `${key}-c`, context),
        key,
        context
      );
    case 'list':
      return renderElement(
        node.ordered ? 'ol' : 'ul',
        node.ordered && node.start && node.start !== 1 ? { node, start: node.start } : { node },
        node.items.map((item, index) => renderListItem(item, `${key}-i${index}`, context)),
        key,
        context
      );
    case 'table':
      return renderTable(node, key, context);
    case 'codeBlock':
      return renderElement(
        'pre',
        { node },
        renderElement(
          'code',
          node.language ? { className: `language-${node.language}`, node } : { node },
          node.value,
          `${key}-code`,
          context
        ),
        key,
        context
      );
    case 'thematicBreak':
      return renderElement('hr', { node }, undefined, key, context);
    default:
      return null;
  }
}

function renderListItem(item, key, context) {
  const simpleParagraph =
    item.children.length === 1 && item.children[0] && item.children[0].type === 'paragraph';
  const content = simpleParagraph
    ? renderInlineNodes(item.children[0].children, `${key}-c`, context)
    : renderBlocks(item.children, `${key}-c`, context);

  const children = [];

  if (item.task) {
    children.push(
      renderElement(
        'input',
        {
          checked: item.checked,
          disabled: true,
          node: item,
          readOnly: true,
          type: 'checkbox',
        },
        undefined,
        `${key}-checkbox`,
        context
      )
    );
    children.push(' ');
  }

  if (Array.isArray(content)) {
    children.push(...content);
  } else if (content !== null && content !== undefined) {
    children.push(content);
  }

  return renderElement('li', { node: item }, children, key, context);
}

function renderTable(node, key, context) {
  const header = renderElement(
    'thead',
    { node },
    renderElement(
      'tr',
      { node },
      node.header.map((cell, index) =>
        renderElement(
          'th',
          tableCellProps(node.alignment[index], node),
          renderInlineNodes(cell, `${key}-h${index}`, context),
          `${key}-h${index}`,
          context
        )
      ),
      `${key}-header-row`,
      context
    ),
    `${key}-thead`,
    context
  );
  const body = renderElement(
    'tbody',
    { node },
    node.rows.map((row, rowIndex) =>
      renderElement(
        'tr',
        { node },
        row.map((cell, cellIndex) =>
          renderElement(
            'td',
            tableCellProps(node.alignment[cellIndex], node),
            renderInlineNodes(cell, `${key}-r${rowIndex}c${cellIndex}`, context),
            `${key}-r${rowIndex}c${cellIndex}`,
            context
          )
        ),
        `${key}-r${rowIndex}`,
        context
      )
    ),
    `${key}-tbody`,
    context
  );

  return renderElement('table', { node }, [header, body], key, context);
}

function tableCellProps(alignment, node) {
  return alignment ? { node, style: { textAlign: alignment } } : { node };
}

function renderInlineNodes(nodes, keyPrefix, context) {
  const rendered = [];

  nodes.forEach((node, index) => {
    const value = renderInlineNode(node, `${keyPrefix}-${index}`, context);

    if (value !== null && value !== undefined) {
      rendered.push(value);
    }
  });

  return rendered;
}

function renderInlineNode(node, key, context) {
  if (typeof node === 'string') {
    return node;
  }

  switch (node.type) {
    case 'emphasis':
      return renderElement(
        'em',
        { node },
        renderInlineNodes(node.children, `${key}-c`, context),
        key,
        context
      );
    case 'strong':
      return renderElement(
        'strong',
        { node },
        renderInlineNodes(node.children, `${key}-c`, context),
        key,
        context
      );
    case 'delete':
      return renderElement(
        'del',
        { node },
        renderInlineNodes(node.children, `${key}-c`, context),
        key,
        context
      );
    case 'inlineCode':
      return renderElement('code', { node }, node.value, key, context);
    case 'link':
      return renderLink(node, key, context);
    case 'image':
      return renderImage(node, key, context);
    default:
      return null;
  }
}

function renderLink(node, key, context) {
  const href = context.urlTransform(node.url, 'a');
  const children = renderInlineNodes(node.children, `${key}-c`, context);

  if (!href) {
    return createElement(Fragment, { key }, children);
  }

  const target =
    typeof context.linkTarget === 'function'
      ? context.linkTarget(href, children, node.title)
      : context.linkTarget;
  const rel = target === '_blank' ? 'noreferrer' : undefined;

  return renderElement(
    'a',
    {
      href,
      node,
      rel,
      target,
      title: node.title || undefined,
    },
    children,
    key,
    context
  );
}

function renderImage(node, key, context) {
  const src = context.urlTransform(node.url, 'img');

  if (!src) {
    return node.alt || null;
  }

  return renderElement(
    'img',
    {
      alt: node.alt,
      node,
      src,
      title: node.title || undefined,
    },
    undefined,
    key,
    context
  );
}

function renderElement(tag, props, children, key, context) {
  const allowed =
    !context.allowedElements || context.allowedElements.size === 0 || context.allowedElements.has(tag);
  const disallowed = context.disallowedElements.has(tag);

  if (!allowed || disallowed) {
    if (!context.unwrapDisallowed) {
      return null;
    }

    return createElement(Fragment, { key }, children);
  }

  const Component = context.components[tag] || tag;
  const nextProps =
    typeof Component === 'string'
      ? omitNodeProp({ key, ...props })
      : { key, ...props };

  return children === undefined
    ? createElement(Component, nextProps)
    : createElement(Component, nextProps, children);
}

function omitNodeProp(props) {
  const { node, ...rest } = props;
  return rest;
}
