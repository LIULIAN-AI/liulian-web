/**
 * 统一缓存管理器
 * 解决多个缓存系统并存的问题，提供统一的缓存接口
 */

import { config } from '@/config/environment';

interface CacheItem<T = any> {
  data: T;
  timestamp: number;
  promise?: Promise<T>;
}

class CacheManager {
  private cache = new Map<string, CacheItem>();
  private readonly defaultTTL = config.cacheDuration; // 使用环境变量配置

  /**
   * 设置缓存
   */
  set<T>(key: string, data: T, ttl: number = this.defaultTTL): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now() + ttl,
    });
  }

  /**
   * 获取缓存
   */
  get<T>(key: string): T | null {
    const item = this.cache.get(key);
    if (!item) return null;

    // 检查是否过期
    if (Date.now() > item.timestamp) {
      this.cache.delete(key);
      return null;
    }

    return item.data as T;
  }

  /**
   * 检查缓存是否存在且未过期
   */
  has(key: string): boolean {
    const item = this.cache.get(key);
    if (!item) return false;

    if (Date.now() > item.timestamp) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  /**
   * 删除缓存
   */
  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  /**
   * 清空所有缓存
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * 获取缓存大小
   */
  size(): number {
    return this.cache.size;
  }

  /**
   * 清理过期缓存
   */
  cleanup(): void {
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (now > item.timestamp) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * 设置带Promise的缓存（用于请求去重）
   */
  setPromise<T>(key: string, promise: Promise<T>, ttl: number = this.defaultTTL): void {
    this.cache.set(key, {
      data: null as any,
      timestamp: Date.now() + ttl,
      promise,
    });
  }

  /**
   * 获取Promise缓存
   */
  getPromise<T>(key: string): Promise<T> | null {
    const item = this.cache.get(key);
    return item?.promise || null;
  }

  /**
   * 更新Promise缓存的结果
   */
  updatePromiseResult<T>(key: string, data: T): void {
    const item = this.cache.get(key);
    if (item) {
      item.data = data;
      delete item.promise;
    }
  }
}

// 创建全局缓存实例
export const cacheManager = new CacheManager();

// 预定义的缓存键生成器
export const cacheKeys = {
  header: (companySortId: string) => `header-${companySortId}`,
  staff: (companySortId: string) => `staff-${companySortId}`,
  management: (companySortId: string, page: number, size: number) => `management-${companySortId}-${page}-${size}`,
  shareholder: (companySortId: string, page: number, size: number) => `shareholder-${companySortId}-${page}-${size}`,
  marketing: (companySortId: string) => `marketing-${companySortId}`,
  products: (companySortId: string) => `products-${companySortId}`,
  web3: (companySortId: string) => `web3-${companySortId}`,
  tech: (companySortId: string) => `tech-${companySortId}`,
  financials: (companySortId: string) => `financials-${companySortId}`,
  overview: (companySortId: string) => `overview-${companySortId}`,
  // Marketing子数据缓存键
  marketingStrategy: (companySortId: string) => `marketing-strategy-${companySortId}`,
  socialMediaLinks: (companySortId: string) => `social-media-links-${companySortId}`,
  appRecord: (companySortId: string) => `app-record-${companySortId}`,
  socialMediaRank: (companySortId: string) => `social-media-rank-${companySortId}`,
  appRank: (companySortId: string) => `app-rank-${companySortId}`,
  swotData: (companySortId: string) => `swot-data-${companySortId}`,
  pieChartData: (companySortId: string) => `pie-chart-data-${companySortId}`,
  commentData: (companySortId: string) => `comment-data-${companySortId}`,
  competitorData: (companySortId: string) => `competitor-data-${companySortId}`,
};

// 定期清理过期缓存
if (typeof window !== 'undefined') {
  setInterval(() => {
    cacheManager.cleanup();
  }, config.cacheCleanupInterval); // 使用环境变量配置
}

export default cacheManager;
