import {getRequestConfig} from 'next-intl/server';

// 支持的语言
export const locales = ['en', 'zh-CN', 'zh-HK'] as const;
export type Locale = typeof locales[number];
export const defaultLocale: Locale = 'en';

// 验证语言是否支持
export function isValidLocale(locale: string): locale is Locale {
  return locales.includes(locale as Locale);
}

export default getRequestConfig(async ({locale}) => {
  // 验证语言是否有效
  const validLocale = locale && isValidLocale(locale) ? locale : defaultLocale;

  return {
    locale: validLocale,
    messages: (await import(`./messages/${validLocale}.json`)).default
  };
});