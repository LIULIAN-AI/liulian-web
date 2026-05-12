'use client';
import { useEffect, useRef, useState } from 'react';

interface PerformanceMetrics {
  navigationStart: number;
  pageLoadTime: number;
  apiResponseTime: number;
  cacheHitRate: number;
}

export default function PerformanceMonitor() {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    navigationStart: 0,
    pageLoadTime: 0,
    apiResponseTime: 0,
    cacheHitRate: 0
  });
  
  const navigationStartRef = useRef<number>(0);
  const apiStartTimeRef = useRef<number>(0);

  useEffect(() => {
    // 监听页面加载性能
    const handlePageLoad = () => {
      const loadTime = performance.now() - navigationStartRef.current;
      setMetrics(prev => ({
        ...prev,
        pageLoadTime: loadTime
      }));
    };

    // 监听路由变化
    const handleRouteChange = () => {
      navigationStartRef.current = performance.now();
    };

    // 监听API请求
    const originalFetch = window.fetch;
    window.fetch = function(...args) {
      apiStartTimeRef.current = performance.now();
      
      return originalFetch.apply(this, args).then(response => {
        const responseTime = performance.now() - apiStartTimeRef.current;
        setMetrics(prev => ({
          ...prev,
          apiResponseTime: responseTime
        }));
        return response;
      });
    };

    // 设置初始导航开始时间
    navigationStartRef.current = performance.now();

    // 添加事件监听器
    window.addEventListener('load', handlePageLoad);
    window.addEventListener('beforeunload', handleRouteChange);

    return () => {
      window.removeEventListener('load', handlePageLoad);
      window.removeEventListener('beforeunload', handleRouteChange);
      window.fetch = originalFetch;
    };
  }, []);

  // 只在开发环境显示
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div style={{
      position: 'fixed',
      top: '10px',
      right: '10px',
      background: 'rgba(0, 0, 0, 0.8)',
      color: 'white',
      padding: '10px',
      borderRadius: '5px',
      fontSize: '12px',
      zIndex: 9999,
      fontFamily: 'monospace'
    }}>
      <div>🚀 性能监控</div>
      <div>页面加载: {metrics.pageLoadTime.toFixed(2)}ms</div>
      <div>API响应: {metrics.apiResponseTime.toFixed(2)}ms</div>
      <div>缓存命中: {metrics.cacheHitRate.toFixed(1)}%</div>
    </div>
  );
}
