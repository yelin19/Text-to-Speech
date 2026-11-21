export const PRONUNCIATION_STORAGE_KEY = 'sagapyaw-pronunciation-dictionary-v1';

export const DEFAULT_PRONUNCIATION_RULES = Object.freeze([
  Object.freeze({ from: 'နဂါး', to: 'န ဂါး' }),
  Object.freeze({ from: 'ပုဆိန်', to: 'ပယ်ဆိန်' }),
]);

export function parsePronunciationRulesText(text) {
  const rules = [];
  const errors = [];
  if (typeof text !== 'string') return { rules, errors: ['ဖိုင်အကြောင်းအရာကို စာသားအဖြစ် ဖတ်မရပါ။'] };

  const delimiters = ['→', '=>', '->', '\t', '='];
  const seen = new Set();
  for (const [index, rawLine] of text.split(/\r?\n/u).entries()) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;
    const delimiter = delimiters.find((candidate) => line.includes(candidate));
    if (!delimiter) {
      errors.push(`${index + 1} ကြောင်း: မူရင်းစာသားနှင့် အသံထွက်စာသားကြားတွင် = သို့မဟုတ် → ခြားပေးပါ။`);
      continue;
    }
    const splitAt = line.indexOf(delimiter);
    const from = line.slice(0, splitAt).trim();
    const to = line.slice(splitAt + delimiter.length).trim();
    if (!from || !to) {
      errors.push(`${index + 1} ကြောင်း: မူရင်းစာသားနှင့် အသံထွက်စာသား နှစ်ခုလုံး ဖြည့်ပါ။`);
      continue;
    }
    if (from.length > 100 || to.length > 200) {
      errors.push(`${index + 1} ကြောင်း: မူရင်းစာသားကို စာလုံး 100 အထိ၊ အသံထွက်စာသားကို စာလုံး 200 အထိသာ ရေးနိုင်ပါသည်။`);
      continue;
    }
    if (seen.has(from)) {
      errors.push(`${index + 1} ကြောင်း: “${from}” မူရင်းစာသားကို ဖိုင်ထဲတွင် ထပ်နေပါသည်။`);
      continue;
    }
    seen.add(from);
    rules.push({ from, to });
  }
  if (!rules.length && !errors.length) errors.push('ထည့်သွင်းရန် စည်းမျဉ်း မတွေ့ပါ။');
  return { rules, errors };
}

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
