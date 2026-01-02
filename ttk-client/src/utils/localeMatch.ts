import { EmptyStr } from '@src/static/string';

const vowelsMapping: Record<string, string> = {
  a: 'a',
  A: 'a',
  e: 'e',
  ə: 'e',
  E: 'e',
  Ə: 'e',
  i: 'i',
  ı: 'i',
  I: 'i',
  İ: 'i',
  o: 'o',
  ö: 'o',
  O: 'o',
  Ö: 'o',
  u: 'u',
  ü: 'u',
  U: 'u',
  Ü: 'u',
  g: 'g',
  ğ: 'g',
  G: 'g',
  Ğ: 'g',
  Ş: 's',
  ş: 's',
};

export function normalizeVowels(word: string) {
  return [...word].map((char) => vowelsMapping[char] || char).join(EmptyStr);
}
