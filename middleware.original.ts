import { locales, defaultLocale } from './i18n';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// 简单的中间件配置，避免next-intl中间件导致的路由问题
export function middleware(request: NextRequest) {
  // 获取当前路径
  const pathname = request.nextUrl.pathname;
  
  // 处理根路径重定向
  if (pathname === '/') {
    const url = request.nextUrl.clone();
    url.pathname = `/homepage`;
    return NextResponse.redirect(url);
  }
  
  // 从cookie获取语言设置
  const localeCookie = request.cookies.get('NEXT_LOCALE');
  const locale = localeCookie?.value || defaultLocale;
  
  // 创建响应
  const response = NextResponse.next();
  
  // 如果语言cookie不存在或无效，设置默认语言
  if (!localeCookie || !locales.includes(locale as typeof locales[number])) {
    response.cookies.set('NEXT_LOCALE', defaultLocale, {
      path: '/',
      sameSite: 'lax'
    });
  }
  
  return response;
}

export const config = {
  matcher: ['/((?!api|_next|.*\\..*).*)']
}