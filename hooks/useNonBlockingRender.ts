/**
 * 非阻塞渲染Hook
 * 解决页面切换时的渲染阻塞问题
 */

import { useState, useEffect, useCallback, useRef } from 'react';

interface NonBlockingRenderOptions {
  immediateRender?: boolean; // 是否立即渲染
  fallbackContent?: React.ReactNode; // 降级内容
  timeout?: number; // 超时时间，0表示无限制
}

export function useNonBlockingRender<T>(
  data: T | null,
  loading: boolean,
  options: NonBlockingRenderOptions = {}
) {
  const {
    immediateRender = true,
    fallbackContent = null,
    timeout = 0 // 默认无超时限制
  } = options;

  const [shouldRender, setShouldRender] = useState(immediateRender);
  const [hasData, setHasData] = useState(false);
  const [isTimedOut, setIsTimedOut] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 数据状态管理
  useEffect(() => {
    if (data) {
      setHasData(true);
    }
  }, [data]);

  // 超时处理 - 只有在timeout > 0时才启用超时机制
  useEffect(() => {
    if (loading && timeout > 0) {
      timeoutRef.current = setTimeout(() => {
        setIsTimedOut(true);
        setShouldRender(true); // 超时后强制渲染
      }, timeout);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [loading, timeout]);

  // 加载完成处理
  useEffect(() => {
    if (!loading) {
      setShouldRender(true);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    }
  }, [loading]);

  // 重置状态
  const reset = useCallback(() => {
    setShouldRender(immediateRender);
    setHasData(false);
    setIsTimedOut(false);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  }, [immediateRender]);

  return {
    shouldRender,
    hasData,
    isTimedOut,
    isLoading: loading && !isTimedOut,
    reset
  };
}
