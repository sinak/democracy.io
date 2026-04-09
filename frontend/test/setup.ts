import { afterEach, beforeEach } from '../vendor/vitest/index.js';
import { cleanup } from '@testing-library/react';
import { JSDOM } from 'jsdom';

function createStorage() {
  const store = new Map<string, string>();

  return {
    getItem(key: string) {
      return store.has(key) ? store.get(key)! : null;
    },
    setItem(key: string, value: string) {
      store.set(key, String(value));
    },
    removeItem(key: string) {
      store.delete(key);
    },
    clear() {
      store.clear();
    },
  };
}

const dom = new JSDOM('', { url: 'http://localhost:3000/' });
const localStorage = createStorage();
const sessionStorage = createStorage();

Object.defineProperty(globalThis, 'window', {
  value: dom.window,
  writable: true,
});
Object.defineProperty(globalThis, 'document', {
  value: dom.window.document,
  writable: true,
});
Object.defineProperty(globalThis, 'navigator', {
  value: dom.window.navigator,
  writable: true,
});
Object.defineProperty(globalThis, 'location', {
  value: dom.window.location,
  writable: true,
});
Object.defineProperty(globalThis, 'localStorage', {
  value: localStorage,
  writable: true,
});
Object.defineProperty(globalThis, 'sessionStorage', {
  value: sessionStorage,
  writable: true,
});

window.localStorage = localStorage;
window.sessionStorage = sessionStorage;
window.matchMedia = dom.window.matchMedia;

beforeEach(() => {
  localStorage.clear();
  sessionStorage.clear();
});

afterEach(() => {
  cleanup();
});
