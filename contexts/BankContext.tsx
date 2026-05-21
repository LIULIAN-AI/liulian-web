'use client';
// LEGACY · neobanker fintech surface. Kept compiling so existing
// chat / canvas tests transitively pass. The .demo-bak data
// sources are inlined as stubs below; rewire to LIULIAN endpoints
// when this context surfaces in a real LIULIAN page.
import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import { cacheManager, cacheKeys } from '@/utils/cacheManager';
import { useClerk } from '@clerk/nextjs';

// Stubs for the legacy fintech imports that moved to _app-bak/
// `CompanyHeader` type was at @/app/model/company/company
type CompanyHeader = {
  companyName?: string;
  following?: boolean;
  [k: string]: unknown;
};
// `getNewHeader` was at @/app/api/company/company
const getNewHeader = async (_args: { companySortId: string; userId: string | null }): Promise<CompanyHeader> => ({});
// `demoBankHeader` / `isDemoBankSortId` were at @/app/mock/demoBank
const demoBankHeader: CompanyHeader = {};
const isDemoBankSortId = (_id: string): boolean => false;

interface BankContextType {
  headerInfo: CompanyHeader | null;
  loading: boolean;
  error: string | null;
  navBarColor: number;
  setNavBarColor: (active: number) => void;
  loadHeaderInfo: (companySortId: string) => Promise<void>;
  clearCache: () => void;
  clearHeaderCache: (companySortId: string) => void;
  updateFollowingStatus: (isFollowing: boolean) => void;
}

const BankContext = createContext<BankContextType | undefined>(undefined);

export function BankProvider({ children }: { children: ReactNode }) {
  const { user } = useClerk();
  const [isClient, setIsClient] = useState(false);
  useEffect(() => {
    setIsClient(true);
  }, []);
  const [headerInfo, setHeaderInfo] = useState<CompanyHeader | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [navBarColor, setNavBarColor] = useState(-1); // 默认颜色
  const loadHeaderInfo = useCallback(async (companySortId: string) => {
    const cacheKey = cacheKeys.header(companySortId);

    if (isDemoBankSortId(companySortId)) {
      const demoHeader: CompanyHeader = { ...demoBankHeader };
      setHeaderInfo(demoHeader);
      cacheManager.set(cacheKey, demoHeader);
      return;
    }
    
    // 检查缓存
    const cached = cacheManager.get<CompanyHeader>(cacheKey);
    if (cached) {
      setHeaderInfo(cached);
      return;
    }

    // 如果已经有相同的数据，不重复请求
    // if (headerInfo && headerInfo.companyName && cacheManager.get(cacheKeys.header(companySortId))) {
    //   return;
    // }

    try {
      setLoading(true);
      setError(null);
      let userId: string | null = user?.id || null;
      if (isClient && !userId) {
        userId = localStorage.getItem('userId');
      }
      // 确保userId存在性检查
      if (!userId) {
        console.error("用户ID不存在");
      }
      const data = await getNewHeader({ companySortId, userId: userId });
      setHeaderInfo(data);
      
      // 更新缓存
      cacheManager.set(cacheKey, data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load header info');
      console.error('Failed to load header info:', err);
    } finally {
      setLoading(false);
    }
  }, [user, isClient]);
  // 只清除当前header的缓存，不影响其他数据
  const clearHeaderCache = useCallback((companySortId: string) => {
    const cacheKey = cacheKeys.header(companySortId);
    cacheManager.delete(cacheKey);
  }, []);
  const clearCache = useCallback(() => {
    cacheManager.clear();
    setHeaderInfo(null);
  }, []);
  // 直接更新following状态，实现无缝体验
  const updateFollowingStatus = useCallback((isFollowing: boolean) => {
    setHeaderInfo(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        following: isFollowing
      };
    });
  }, []);

  return (
    <BankContext.Provider value={{
      headerInfo,
      loading,
      error,
      navBarColor,
      setNavBarColor,
      loadHeaderInfo,
      clearCache,
      clearHeaderCache,
      updateFollowingStatus
    }}>
      {children}
    </BankContext.Provider>
  );
}

export function useBankContext() {
  const context = useContext(BankContext);
  if (context === undefined) {
    throw new Error('useBankContext must be used within a BankProvider');
  }
  return context;
}
