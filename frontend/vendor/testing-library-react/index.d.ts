import type { ReactElement } from 'react';

export interface RenderResult {
  container: {
    innerHTML: string;
    textContent: string;
  };
  rerender(ui: ReactElement): RenderResult;
  unmount(): void;
  asFragment(): string;
  getByText(matcher: string | RegExp | ((value: string) => boolean)): unknown;
  queryByText(matcher: string | RegExp | ((value: string) => boolean)): unknown | null;
}

export declare function render(ui: ReactElement): RenderResult;
export declare function cleanup(): void;

export declare const screen: {
  getByText(matcher: string | RegExp | ((value: string) => boolean)): unknown;
  queryByText(matcher: string | RegExp | ((value: string) => boolean)): unknown | null;
};
