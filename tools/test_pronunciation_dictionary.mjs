import assert from 'node:assert/strict';
import {
  applyPronunciationRules,
  DEFAULT_PRONUNCIATION_RULES,
  loadPronunciationRules,
  parsePronunciationRulesText,
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
  'န ဂါး ပယ်ဆိန်',
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

assert.deepEqual(
  parsePronunciationRulesText('# QuickEdit rules\nနဂါး=န ဂါး\nပုဆိန်=ပယ်ဆိန်\nအမည်\tအသံထွက်\nတစ် → တစ်'),
  {
    rules: [
      { from: 'နဂါး', to: 'န ဂါး' },
      { from: 'ပုဆိန်', to: 'ပယ်ဆိန်' },
      { from: 'အမည်', to: 'အသံထွက်' },
      { from: 'တစ်', to: 'တစ်' },
    ],
    errors: [],
  },
  'TXT bulk import accepts equals, arrow, and tab separators while skipping comments',
);
assert.equal(
  parsePronunciationRulesText('စကား → အသံ\nစကား → ထပ်တူ').errors.length,
  1,
  'TXT bulk import reports duplicate source words',
);
assert.equal(
  parsePronunciationRulesText('မခွဲထားသောစာသား').errors.length,
  1,
  'TXT bulk import reports malformed lines instead of silently ignoring them',
);

const storage = memoryStorage();
const customRules = [{ from: 'foo', to: 'bar' }];
assert.equal(savePronunciationRules(customRules, storage), true);
assert.deepEqual(loadPronunciationRules(storage), customRules);
assert.equal(savePronunciationRules(customRules, undefined), false);

const manyRules = Array.from({ length: 250 }, (_, i) => ({
  from: `word-${i}`,
  to: `say-${i}`,
}));
assert.equal(savePronunciationRules(manyRules, storage), true);
assert.equal(loadPronunciationRules(storage).length, manyRules.length, 'rules are not truncated at 100 entries');

console.log('pronunciation dictionary checks: ok');
