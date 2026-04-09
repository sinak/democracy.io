export class JSDOM {
  constructor(html = '', options = {}) {
    const location = new URL(options.url || 'http://localhost:3000/');
    const document = {
      body: {
        innerHTML: html,
        textContent: html.replace(/<[^>]+>/g, ' '),
      },
      documentElement: {
        innerHTML: html,
      },
      createElement(tagName) {
        return {
          tagName: String(tagName).toUpperCase(),
          style: {},
          children: [],
          appendChild(child) {
            this.children.push(child);
            return child;
          },
          setAttribute(name, value) {
            this[name] = value;
          },
          remove() {},
        };
      },
    };

    this.window = {
      document,
      navigator: { userAgent: 'jsdom-local' },
      location,
      history: {
        replaceState() {},
        pushState() {},
      },
      matchMedia() {
        return {
          matches: false,
          media: '',
          onchange: null,
          addListener() {},
          removeListener() {},
          addEventListener() {},
          removeEventListener() {},
          dispatchEvent() {
            return false;
          },
        };
      },
    };
  }
}
