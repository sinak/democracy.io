export declare class JSDOM {
  window: {
    document: {
      body: {
        innerHTML: string;
        textContent: string;
      };
      documentElement: {
        innerHTML: string;
      };
      createElement(tagName: string): unknown;
    };
    navigator: {
      userAgent: string;
    };
    location: URL;
    history: {
      replaceState(): void;
      pushState(): void;
    };
    matchMedia(): {
      matches: boolean;
      media: string;
      onchange: null;
      addListener(): void;
      removeListener(): void;
      addEventListener(): void;
      removeEventListener(): void;
      dispatchEvent(): boolean;
    };
  };
  constructor(html?: string, options?: { url?: string });
}
