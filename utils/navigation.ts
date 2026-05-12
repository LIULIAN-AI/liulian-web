import { useRouter } from 'next/navigation';
import { useCallback, useRef } from 'react';

/**
 * 优化的导航Hook，提供预加载和防抖功能
 */
export function useOptimizedNavigation() {
  const router = useRouter();
  const isNavigating = useRef(false);
  const navigationTimeout = useRef<NodeJS.Timeout | null>(null);

  /**
   * 优化的导航函数
   * @param path 目标路径
   * @param options 导航选项
   */
  const navigate = useCallback((
    path: string, 
    options: {
      prefetch?: boolean;
      delay?: number;
      replace?: boolean;
    } = {}
  ) => {
    const { prefetch = true, delay = 50, replace = false } = options;

    // 防止重复导航
    if (isNavigating.current) {
      console.log('正在导航中，忽略重复请求:', path);
      return;
    }

    isNavigating.current = true;

    // 清理之前的超时
    if (navigationTimeout.current) {
      clearTimeout(navigationTimeout.current);
    }

    try {
      // 预加载目标页面
      if (prefetch) {
        router.prefetch(path);
      }

      // 延迟导航，给预加载一些时间
      navigationTimeout.current = setTimeout(() => {
        if (replace) {
          router.replace(path);
        } else {
          router.push(path);
        }
        
        // 重置导航状态
        setTimeout(() => {
          isNavigating.current = false;
        }, 100);
      }, delay);

    } catch (error) {
      console.error('导航失败:', error);
      isNavigating.current = false;
    }
  }, [router]);

  /**
   * 预加载页面
   * @param path 目标路径
   */
  const prefetch = useCallback((path: string) => {
    try {
      router.prefetch(path);
    } catch (error) {
      console.error('预加载失败:', error);
    }
  }, [router]);

  /**
   * 清理导航状态
   */
  const cleanup = useCallback(() => {
    if (navigationTimeout.current) {
      clearTimeout(navigationTimeout.current);
      navigationTimeout.current = null;
    }
    isNavigating.current = false;
  }, []);

  return {
    navigate,
    prefetch,
    cleanup,
    isNavigating: isNavigating.current
  };
}

/**
 * 批量预加载多个页面
 * @param paths 页面路径数组
 */
export function useBatchPrefetch(paths: string[]) {
  const router = useRouter();

  const prefetchAll = useCallback(() => {
    paths.forEach(path => {
      try {
        router.prefetch(path);
      } catch (error) {
        console.error(`预加载失败: ${path}`, error);
      }
    });
  }, [router, paths]);

  return { prefetchAll };
}

/**
 * 智能预加载 - 根据用户行为预测可能访问的页面
 */
export function useSmartPrefetch() {
  const router = useRouter();

  // 预加载相关页面
  const prefetchRelated = useCallback((currentPath: string) => {
    const relatedPaths: string[] = [];
    
    // 根据当前路径预加载相关页面
    if (currentPath.includes('/bank-info/')) {
      const sortId = currentPath.split('/')[2];
      relatedPaths.push(
        `/bank-info/${sortId}/products`,
        `/bank-info/${sortId}/marketing`,
        `/bank-info/${sortId}/financials`,
        `/bank-info/${sortId}/staff`,
        `/bank-info/${sortId}/tech`,
        `/bank-info/${sortId}/web3`
      );
    } else if (currentPath.includes('/banks-statistics')) {
      relatedPaths.push('/homepage', '/about-us', '/news&report');
    } else if (currentPath === '/') {
      relatedPaths.push('/banks-statistics', '/about-us', '/news&report');
    }

    // 批量预加载
    relatedPaths.forEach(path => {
      try {
        router.prefetch(path);
      } catch (error) {
        console.error(`智能预加载失败: ${path}`, error);
      }
    });
  }, [router]);

  return { prefetchRelated };
}
