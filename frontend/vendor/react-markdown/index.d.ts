import type {
  AnchorHTMLAttributes,
  BlockquoteHTMLAttributes,
  ElementType,
  HTMLAttributes,
  ImgHTMLAttributes,
  InputHTMLAttributes,
  LiHTMLAttributes,
  OlHTMLAttributes,
  ReactElement,
  ReactNode,
  TableHTMLAttributes,
  TdHTMLAttributes,
  ThHTMLAttributes,
} from 'react';

export interface ExtraProps {
  node?: unknown;
}

export type UrlTransform = (
  url: string,
  key?: 'a' | 'img'
) => string | null | undefined;

export type LinkTarget =
  | string
  | ((href: string, children: ReactNode, title: string | null) => string | undefined);

export interface Components
  extends Partial<{
  a: ElementType<AnchorHTMLAttributes<HTMLAnchorElement> & ExtraProps>;
  blockquote: ElementType<BlockquoteHTMLAttributes<HTMLElement> & ExtraProps>;
  code: ElementType<HTMLAttributes<HTMLElement> & ExtraProps>;
  del: ElementType<HTMLAttributes<HTMLElement> & ExtraProps>;
  em: ElementType<HTMLAttributes<HTMLElement> & ExtraProps>;
  h1: ElementType<HTMLAttributes<HTMLHeadingElement> & ExtraProps>;
  h2: ElementType<HTMLAttributes<HTMLHeadingElement> & ExtraProps>;
  h3: ElementType<HTMLAttributes<HTMLHeadingElement> & ExtraProps>;
  h4: ElementType<HTMLAttributes<HTMLHeadingElement> & ExtraProps>;
  h5: ElementType<HTMLAttributes<HTMLHeadingElement> & ExtraProps>;
  h6: ElementType<HTMLAttributes<HTMLHeadingElement> & ExtraProps>;
  hr: ElementType<HTMLAttributes<HTMLHRElement> & ExtraProps>;
  img: ElementType<ImgHTMLAttributes<HTMLImageElement> & ExtraProps>;
  input: ElementType<InputHTMLAttributes<HTMLInputElement> & ExtraProps>;
  li: ElementType<LiHTMLAttributes<HTMLLIElement> & ExtraProps>;
  ol: ElementType<OlHTMLAttributes<HTMLOListElement> & ExtraProps>;
  p: ElementType<HTMLAttributes<HTMLParagraphElement> & ExtraProps>;
  pre: ElementType<HTMLAttributes<HTMLPreElement> & ExtraProps>;
  strong: ElementType<HTMLAttributes<HTMLElement> & ExtraProps>;
  table: ElementType<TableHTMLAttributes<HTMLTableElement> & ExtraProps>;
  tbody: ElementType<HTMLAttributes<HTMLTableSectionElement> & ExtraProps>;
  td: ElementType<TdHTMLAttributes<HTMLTableCellElement> & ExtraProps>;
  th: ElementType<ThHTMLAttributes<HTMLTableCellElement> & ExtraProps>;
  thead: ElementType<HTMLAttributes<HTMLTableSectionElement> & ExtraProps>;
  tr: ElementType<HTMLAttributes<HTMLTableRowElement> & ExtraProps>;
  ul: ElementType<HTMLAttributes<HTMLUListElement> & ExtraProps>;
}> {
  [tagName: string]: ElementType<any> | undefined;
}

export interface Options {
  children?: string | null;
  components?: Components;
  remarkPlugins?: readonly unknown[];
  skipHtml?: boolean;
  allowedElements?: readonly string[];
  disallowedElements?: readonly string[];
  unwrapDisallowed?: boolean;
  urlTransform?: UrlTransform;
  linkTarget?: LinkTarget;
}

export type ReactMarkdownOptions = Options;

declare function ReactMarkdown(options: Options): ReactElement;

export declare function defaultUrlTransform(
  url: string,
  key?: 'a' | 'img'
): string | null;

export declare const uriTransformer: typeof defaultUrlTransform;

export default ReactMarkdown;
