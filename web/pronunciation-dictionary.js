export const PRONUNCIATION_STORAGE_KEY = 'sagapyaw-pronunciation-dictionary-v1';
export const MAX_PRONUNCIATION_RULES = 100;

export const DEFAULT_PRONUNCIATION_RULES = Object.freeze([
  Object.freeze({ from: 'နဂါး', to: 'န ဂါး' }),
  Object.freeze({ from: 'ပုဆိန်', to: 'ပဆိန်' }),
]);

function cleanRules(rules) {
  if (!Array.isArray(rules)) return [];
  const seen = new Set();
  const result = [];
  for (const rule of rules) {
    if (!rule || typeof rule.from !== 'string' || typeof rule.to !== 'string') continue;
    const from = rule.from.trim();
    const to = rule.to.trim();
    if (!from || !to || seen.has(from)) continue;
    seen.add(from);
    result.push({ from, to });
    if (result.length >= MAX_PRONUNCIATION_RULES) break;
  }
  return result;
}

export function loadPronunciationRules(storage = globalThis.localStorage) {
  try {
    const saved = storage?.getItem(PRONUNCIATION_STORAGE_KEY);
    if (saved === null || saved === undefined) return DEFAULT_PRONUNCIATION_RULES.map((rule) => ({ ...rule }));
    return cleanRules(JSON.parse(saved));
  } catch {
    return DEFAULT_PRONUNCIATION_RULES.map((rule) => ({ ...rule }));
  }
}

export function savePronunciationRules(rules, storage = globalThis.localStorage) {
  const cleaned = cleanRules(rules);
  try {
    if (!storage) return false;
    storage.setItem(PRONUNCIATION_STORAGE_KEY, JSON.stringify(cleaned));
    return true;
  } catch {
    return false;
  }
}

export function applyPronunciationRules(text, rules = loadPronunciationRules()) {
  if (typeof text !== 'string' || !text || !Array.isArray(rules)) return text;
  const usable = cleanRules(rules).sort((a, b) => b.from.length - a.from.length);
  if (!usable.length) return text;
  const replacements = new Map(usable.map(({ from, to }) => [from, to]));
  const pattern = new RegExp(usable.map(({ from }) => from.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|'), 'gu');
  return text.replace(pattern, (match) => replacements.get(match) ?? match);
}
