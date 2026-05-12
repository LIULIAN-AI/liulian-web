'use client';
import { useState, useEffect } from 'react';
import { Popover } from 'antd';
import { locales, defaultLocale } from '../i18n';
import styles from '@/app/css/LanguageSwitcher.module.css';
import { useRouter } from 'next/navigation';

export function LanguageSwitcher() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [currentLocale, setCurrentLocale] = useState<string>(defaultLocale);
  // 从cookie获取当前语言
  const getLocaleFromCookie = () => {
    const cookieValue = document.cookie
      .split('; ')
      .find(row => row.startsWith('NEXT_LOCALE='))?.split('=')[1];
    return cookieValue || defaultLocale;
  };

  // 组件挂载时获取当前语言
  useEffect(() => {
    setCurrentLocale(getLocaleFromCookie());
  }, []);
  // 语言名称映射
  const getLanguageName = (locale: string) => {
    switch (locale) {
      case 'en':
        return 'English';
      case 'zh-CN':
        return '简体中文';
      case 'zh-HK':
        return '繁体中文';
      default:
        return locale;
    }
  };

  const getNewLanguageName = (locale: string) => {
    switch (locale) {
      case 'en':
        return 'EN';
      case 'zh-CN':
        return '简';
      case 'zh-HK':
        return '繁';
      default:
        return locale;
    }
  };

  // 获取当前语言名称
  const getCurrentLanguageName = () => {
    return getLanguageName(currentLocale);
  };

  // 切换语言
  const switchLanguage = (locale: string) => {
    try {
      // 设置语言cookie
      document.cookie = `NEXT_LOCALE=${locale}; path=/; sameSite=lax`;
      setCurrentLocale(locale);
      // 刷新页面以应用新语言
      router.refresh();
    } catch (error) {
      console.error('Failed to switch language:', error);
      // 备用方案：使用location.reload
      window.location.reload();
    }
  };

  // 语言选项内容
  const content = (
    <div className={styles.languageSwitcher}>
      {locales.map((locale) => (
        <div
          key={locale}
          className={`${styles.languageCommon} ${currentLocale === locale ? styles.languageActive : ''}`}
          onClick={() => switchLanguage(locale)}
        >
          {getLanguageName(locale)}
        </div>
      ))}
    </div>
  );

  return (
    <Popover
      content={content}
      trigger="hover"
      open={open}
      onOpenChange={setOpen}
    >
      <div
        className={styles.showDefaultLanguage}
      >
        {getNewLanguageName(currentLocale)}
      </div>
    </Popover>
  );
}

export default LanguageSwitcher;