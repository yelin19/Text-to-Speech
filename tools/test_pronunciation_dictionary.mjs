import assert from 'node:assert/strict';
import {
  applyPronunciationRules,
  DEFAULT_PRONUNCIATION_RULES,
  loadPronunciationRules,
  MAX_PRONUNCIATION_RULES,
  savePronunciationRules,
} from '../web/pronunciation-dictionary.js';

function memoryStorage() {
  const values = new Map();
  return {
    getItem: (key) => values.has(key) ? values.get(key) : null,
    setItem: (key, value) => values.set(key, value),
  };
}

assert.equal(
  applyPronunciationRules('နဂါး ပုဆိန်', DEFAULT_PRONUNCIATION_RULES),
  'န ဂါး ပဆိန်',
  'built-in Burmese pronunciation rules are applied',
);

const overlapRules = [
  { from: 'a', to: 'short' },
  { from: 'aa', to: 'long' },
  { from: 'a+b', to: 'literal' },
];
assert.equal(
  applyPronunciationRules('aaa a+b', overlapRules),
  'longshort literal',
  'longest matching phrase wins and regex characters are treated literally',
);
assert.equal(
  applyPronunciationRules('x', [{ from: 'x', to: 'xy' }, { from: 'xy', to: 'z' }]),
  'xy',
  'replacement output is not replaced recursively in the same pass',
);

const storage = memoryStorage();
const customRules = [{ from: 'foo', to: 'bar' }];
assert.equal(savePronunciationRules(customRules, storage), true);
assert.deepEqual(loadPronunciationRules(storage), customRules);
assert.equal(savePronunciationRules(customRules, undefined), false);

const excessRules = Array.from({ length: MAX_PRONUNCIATION_RULES + 5 }, (_, i) => ({
  from: `word-${i}`,
  to: `say-${i}`,
}));
savePronunciationRules(excessRules, storage);
assert.equal(loadPronunciationRules(storage).length, MAX_PRONUNCIATION_RULES);

console.log('pronunciation dictionary checks: ok');
