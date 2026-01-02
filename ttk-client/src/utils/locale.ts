import localeData from '@src/localization/locale-az.json';
export function t(key: keyof typeof localeData) {
  return localeData[key];
}
