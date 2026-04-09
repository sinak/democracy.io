export {
  after,
  afterEach,
  before,
  beforeEach,
  describe,
  it,
  test,
} from 'node:test';

export interface Expectation<T> {
  toBe(expected: T): void;
  toEqual(expected: unknown): void;
  toBeTruthy(): void;
  toBeNull(): void;
}

export declare function expect<T>(actual: T): Expectation<T>;
