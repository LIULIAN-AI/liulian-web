'use client'

import { useState, useCallback, useEffect } from 'react';

/**
 * 判断是否是国内（大陆）的工具函数
 * 基于浏览器语言和时区进行判断
 */

/**
 * 检查是否在浏览器环境中
 */
function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof window.navigator !== 'undefined';
}
/**
 * 判断是否是国内（大陆）的核心逻辑
 */
export function isMainlandChina(): boolean {
  // 使用缓存结果
  if (!isBrowser()) {
    return false;
  }
  // 1. 检查语言
  const language = window.navigator.language || '';
  const languages = window.navigator.languages || [language];
  // 中国大陆特征语言
  const isChineseSimplified = languages.some(lang =>
    lang.toLowerCase().includes('zh-cn') ||
    lang.toLowerCase().includes('zh-hans')
  );

  // 2. 检查时区
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  // 中国大陆主要时区
  const chinaTimezones = [
    'Asia/Shanghai',
    'Asia/Chongqing',
    'Asia/Harbin',
    'Asia/Urumqi',
    'Asia/Kashgar',
    'Asia/Beijing'
  ];
  // 港澳台特殊时区
  const specialTimezones = ['Asia/Hong_Kong', 'Asia/Macau', 'Asia/Taipei'];
  const isSpecialTimezone = specialTimezones.includes(timezone);
  const isChinaTimezone = chinaTimezones.includes(timezone);

  // 逻辑优化：更清晰的判断顺序
  if (isSpecialTimezone) {
    return false;
  }
  if (isChineseSimplified && isChinaTimezone) {
    return true;
  }
  if (!isChineseSimplified && isChinaTimezone) {
    return false;
  }
  // 其他所有情况都不是大陆
  return false;
}

/**
 * React Hook版本，支持响应式更新
 */
export function useIsMainland(): boolean {
  // const [isMainland, setIsMainland] = useState(false);
  
  // useEffect(() => {
  //   setIsMainland(isMainlandChina());
  //   // 监听可能的区域变化（如用户手动切换语言）
  //   const handleLanguageChange = () => {
  //     setIsMainland(isMainlandChina());
  //   };
    
  //   window.addEventListener('languagechange', handleLanguageChange);
  //   return () => window.removeEventListener('languagechange', handleLanguageChange);
  // }, []);
  
  // return isMainland;
  return true; // 目前只有大陆的服务器
}

/**
 * 手动设置区域（用于用户手动切换）
 */
export function setUserRegion(isMainland: boolean): void {
}

/**
 * 获取区域相关的配置
 */
export function getRegionConfig() {
  const isMainland = isMainlandChina();
  
  return {
    isMainland,
    // 可以根据需要添加更多区域相关配置
    apiBaseUrl: isMainland ? 'https://api.cn.example.com' : 'https://api.global.example.com',
    currency: isMainland ? 'CNY' : 'USD',
    language: isMainland ? 'zh-CN' : 'en',
    timezone: isMainland ? 'Asia/Shanghai' : 'UTC',
  };
}