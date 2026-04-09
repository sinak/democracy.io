import assert from 'node:assert/strict';

export {
  after,
  afterEach,
  before,
  beforeEach,
  describe,
  it,
  test,
} from 'node:test';

export function expect(actual) {
  return {
    toBe(expected) {
      assert.strictEqual(actual, expected);
    },
    toEqual(expected) {
      assert.deepStrictEqual(actual, expected);
    },
    toBeTruthy() {
      assert.ok(actual);
    },
    toBeNull() {
      assert.strictEqual(actual, null);
    },
  };
}
