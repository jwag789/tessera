// Hints for one achievement line, the things recruiters skim for. Suggestions only; nothing is enforced.
export interface Hint {
  id: 'verb' | 'tense' | 'number' | 'phrase' | 'length';
  text: string;
}

const WEAK_START = new Set(['responsible', 'worked', 'helped', 'assisted', 'tasked', 'duties', 'involved', 'participated', 'was', 'were', 'did', 'handled', 'i', 'my', 'we']);
const FILLER: [RegExp, string][] = [
  [/\bresponsible for\b/i, 'responsible for'],
  [/\bduties included\b/i, 'duties included'],
  [/\bin charge of\b/i, 'in charge of'],
  [/\bworked on\b/i, 'worked on'],
  [/\bhelped (?:to )?\b/i, 'helped'],
  [/\bvarious\b/i, 'various'],
  [/\betc\b\.?/i, 'etc.']
];
const NUMBER = /\d|%|[$£€]|\b(?:one|two|three|four|five|six|seven|eight|nine|ten|twelve|dozens?|hundreds?|thousands?|millions?|billions?|double[ds]?|tripled?|half|halved|\w+fold|quadrupled?)\b/i;
export const MAX_LENGTH = 180;

export function coach(line: string): Hint[] {
  const text = line.trim();
  if (!text) return [];
  const hints: Hint[] = [];
  const first = text.split(/\s+/)[0].toLowerCase().replace(/[^a-z]/g, '');
  if (WEAK_START.has(first)) hints.push({ id: 'verb', text: 'Start with what you did: led, built, cut, grew' });
  else if (first.length > 4 && first.endsWith('ing')) hints.push({ id: 'tense', text: `Use the past tense, like “Led” or “Built”, not “${text.split(/\s+/)[0]}”` });
  const filler = FILLER.find(([re]) => re.test(text));
  if (filler && !(filler[1] === 'responsible for' && hints.some((h) => h.id === 'verb'))) hints.push({ id: 'phrase', text: `Cut “${filler[1]}” and say what you did` });
  if (!NUMBER.test(text)) hints.push({ id: 'number', text: 'Add a number: how many, how much, how fast' });
  if (text.length > MAX_LENGTH) hints.push({ id: 'length', text: `Trim to about two lines (${text.length} of ${MAX_LENGTH} characters)` });
  return hints;
}
