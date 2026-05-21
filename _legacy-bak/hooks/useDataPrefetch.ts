/**
 * 数据预加载Hook
 * 在用户进入银行页面时，立即开始预加载所有子页面的数据
 */

import { useCallback, useEffect, useRef } from 'react';
import { useAuth } from '@clerk/nextjs';
import { cacheManager, cacheKeys } from '@/utils/cacheManager';
import { 
  getMarketingStrategy, getSocialMediaLinks, getAppRecord, getSocialMediaRank, 
  getAppRank, getSwotData, getPieChartData, getCommentData, getCompetitorData 
} from '@/app/api/company/company';
import { 
  getStaffEmployeeData, getManagementList, getShareholderList 
} from '@/app/api/staff/staff';
import { 
  getTechData, getSpotlight, getProductSummaryInfo, getWeb3Strategy, getOverview 
} from '@/app/api/company/company';

interface PrefetchOptions {
  immediate?: boolean; // 是否立即开始预加载
  priority?: 'high' | 'medium' | 'low'; // 预加载优先级
}

export function useDataPrefetch(companySortId: string, options: PrefetchOptions = {}) {
  const { getToken } = useAuth();
  const { immediate = true, priority = 'medium' } = options;
  const prefetchStarted = useRef(false);

  // 预加载Marketing数据
  const prefetchMarketingData = useCallback(async () => {
    if (!companySortId) return;
    
    const token = await getToken();
    const marketingSortId:any = companySortId; // 假设marketingSortId与companySortId相同
    
    try {
      console.log('🚀 开始预加载Marketing数据...');
      
      // 并行预加载所有Marketing相关数据
      const promises = [
        getMarketingStrategy({ companySortId }),
        getSocialMediaLinks(marketingSortId),
        getAppRecord(marketingSortId),
        getSocialMediaRank(marketingSortId),
        getAppRank(marketingSortId),
        getSwotData(marketingSortId),
        getPieChartData(marketingSortId),
        getCommentData(marketingSortId),
        getCompetitorData(marketingSortId)
      ];

      const results = await Promise.allSettled(promises);
      
      // 缓存成功的数据
      const marketingCacheKeys = [
        cacheKeys.marketingStrategy(companySortId),
        cacheKeys.socialMediaLinks(companySortId),
        cacheKeys.appRecord(companySortId),
        cacheKeys.socialMediaRank(companySortId),
        cacheKeys.appRank(companySortId),
        cacheKeys.swotData(companySortId),
        cacheKeys.pieChartData(companySortId),
        cacheKeys.commentData(companySortId),
        cacheKeys.competitorData(companySortId)
      ];
      
      results.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          cacheManager.set(marketingCacheKeys[index], result.value);
        }
      });
      
      console.log('✅ Marketing数据预加载完成');
    } catch (error) {
      console.error('❌ Marketing数据预加载失败:', error);
    }
  }, [companySortId, getToken]);

  // 预加载Staff数据
  const prefetchStaffData = useCallback(async () => {
    if (!companySortId) return;
    
    const token = await getToken();
    
    try {
      console.log('🚀 开始预加载Staff数据...');
      
      const promises = [
        getStaffEmployeeData({ companySortId, token }),
        getManagementList({ companySortId, page: 0, size: 10, token }),
        getShareholderList({ companySortId, page: 0, size: 10, token })
      ];

      const results = await Promise.allSettled(promises);
      
      results.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          const cacheKey = `staff-${companySortId}-${index}`;
          cacheManager.set(cacheKey, result.value);
        }
      });
      
      console.log('✅ Staff数据预加载完成');
    } catch (error) {
      console.error('❌ Staff数据预加载失败:', error);
    }
  }, [companySortId, getToken]);

  // 预加载Products数据
  const prefetchProductsData = useCallback(async () => {
    if (!companySortId) return;
    
    try {
      console.log('🚀 开始预加载Products数据...');
      
      const promises = [
        getSpotlight({ companySortId }),
        getProductSummaryInfo({ companySortId })
      ];

      const results = await Promise.allSettled(promises);
      
      results.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          const cacheKey = `products-${companySortId}-${index}`;
          cacheManager.set(cacheKey, result.value);
        }
      });
      
      console.log('✅ Products数据预加载完成');
    } catch (error) {
      console.error('❌ Products数据预加载失败:', error);
    }
  }, [companySortId]);

  // 预加载Tech数据
  const prefetchTechData = useCallback(async () => {
    if (!companySortId) return;
    
    try {
      console.log('🚀 开始预加载Tech数据...');
      
      const result = await getTechData({ companySortId });
      cacheManager.set(cacheKeys.tech(companySortId), result);
      
      console.log('✅ Tech数据预加载完成');
    } catch (error) {
      console.error('❌ Tech数据预加载失败:', error);
    }
  }, [companySortId]);

  // 预加载Web3数据
  const prefetchWeb3Data = useCallback(async () => {
    if (!companySortId) return;
    
    try {
      console.log('🚀 开始预加载Web3数据...');
      
      const result = await getWeb3Strategy(companySortId);
      cacheManager.set(cacheKeys.web3(companySortId), result);
      
      console.log('✅ Web3数据预加载完成');
    } catch (error) {
      console.error('❌ Web3数据预加载失败:', error);
    }
  }, [companySortId]);

  // 预加载Overview数据
  const prefetchOverviewData = useCallback(async () => {
    if (!companySortId) return;
    
    try {
      console.log('🚀 开始预加载Overview数据...');
      
      const result = await getOverview({ companySortId });
      cacheManager.set(cacheKeys.overview(companySortId), result);
      
      console.log('✅ Overview数据预加载完成');
    } catch (error) {
      console.error('❌ Overview数据预加载失败:', error);
    }
  }, [companySortId]);

  // 预加载Financials数据
  const prefetchFinancialsData = useCallback(async () => {
    if (!companySortId) return;
    
    try {
      console.log('🚀 开始预加载Financials数据...');
      
      // Financials页面目前只有静态内容，无需预加载数据
      // 但为了保持一致性，我们仍然记录预加载完成
      console.log('✅ Financials数据预加载完成（静态内容）');
    } catch (error) {
      console.error('❌ Financials数据预加载失败:', error);
    }
  }, [companySortId]);

  // 预加载所有数据
  const prefetchAllData = useCallback(async () => {
    if (prefetchStarted.current) return;
    prefetchStarted.current = true;

    console.log('🚀 开始预加载所有银行子页面数据...');
    
    // 根据优先级决定预加载顺序
    if (priority === 'high') {
      // 高优先级：立即并行加载所有数据
      await Promise.allSettled([
        prefetchOverviewData(),
        prefetchMarketingData(),
        prefetchStaffData(),
        prefetchProductsData(),
        prefetchTechData(),
        prefetchWeb3Data(),
        prefetchFinancialsData()
      ]);
    } else {
      // 中低优先级：分批次加载，避免阻塞
      // 第一批：Overview、Marketing和Staff（最常用）
      await Promise.allSettled([
        prefetchOverviewData(),
        prefetchMarketingData(),
        prefetchStaffData()
      ]);
      
      // 第二批：其他页面
      setTimeout(() => {
        Promise.allSettled([
          prefetchProductsData(),
          prefetchTechData(),
          prefetchWeb3Data(),
          prefetchFinancialsData()
        ]);
      }, 1000);
    }
    
    console.log('✅ 所有数据预加载完成');
  }, [prefetchOverviewData, prefetchMarketingData, prefetchStaffData, prefetchProductsData, prefetchTechData, prefetchWeb3Data, prefetchFinancialsData, priority]);

  // 立即开始预加载
  useEffect(() => {
    if (immediate && companySortId && !prefetchStarted.current) {
      prefetchAllData();
    }
  }, [immediate, companySortId, prefetchAllData]);

  return {
    prefetchAllData,
    prefetchOverviewData,
    prefetchMarketingData,
    prefetchStaffData,
    prefetchProductsData,
    prefetchTechData,
    prefetchWeb3Data,
    prefetchFinancialsData
  };
}
