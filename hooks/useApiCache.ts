'use client';
import { useState, useCallback, useRef } from 'react';
import { cacheManager } from '@/utils/cacheManager';

const CACHE_DURATION = 5 * 60 * 1000; // 5分钟缓存

interface UseApiCacheOptions {
  cacheDuration?: number;
  staleWhileRevalidate?: boolean;
}

export function useApiCache<T>(
  key: string,
  apiCall: () => Promise<T>,
  options: UseApiCacheOptions = {}
) {
  const { cacheDuration = CACHE_DURATION, staleWhileRevalidate = true } = options;
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchData = useCallback(async (forceRefresh = false) => {
    // 取消之前的请求
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // 如果有缓存且未过期，直接返回缓存数据
    if (!forceRefresh && cacheManager.has(key)) {
      const cached = cacheManager.get<T>(key);
      if (cached) {
        setData(cached);
        setLoading(false);
        setError(null);
        
        // 如果启用 stale-while-revalidate，在后台更新数据
        if (staleWhileRevalidate) {
          fetchData(true);
        }
        return cached;
      }
    }

    // 如果有正在进行的请求，等待它完成
    const existingPromise = cacheManager.getPromise<T>(key);
    if (existingPromise) {
      try {
        const result = await existingPromise;
        setData(result);
        setLoading(false);
        setError(null);
        return result;
      } catch (err) {
        // 如果缓存的请求失败，继续执行新的请求
      }
    }

    setLoading(true);
    setError(null);

    // 创建新的 AbortController
    abortControllerRef.current = new AbortController();

    try {
      const promise = apiCall();
      
      // 将 promise 存储到缓存中，防止重复请求
      cacheManager.setPromise(key, promise, cacheDuration);

      const result = await promise;
      
      // 更新缓存
      cacheManager.set(key, result, cacheDuration);
      cacheManager.updatePromiseResult(key, result);

      setData(result);
      setLoading(false);
      setError(null);
      
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      setLoading(false);
      
      // 如果请求失败，清除缓存的 promise
      cacheManager.delete(key);
      
      throw err;
    }
  }, [key, apiCall, cacheDuration, staleWhileRevalidate]);

  const clearCache = useCallback(() => {
    cacheManager.delete(key);
    setData(null);
  }, [key]);

  const clearAllCache = useCallback(() => {
    cacheManager.clear();
    setData(null);
  }, []);

  return {
    data,
    loading,
    error,
    fetchData,
    clearCache,
    clearAllCache,
    isCached: cacheManager.has(key)
  };
}
