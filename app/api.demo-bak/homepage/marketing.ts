import { apiClient } from "../apiClient";
import {
  DEMO_BANK_MARKETING_ID,
  demoBankMarketing,
  isDemoBankSortId,
} from '@/app/mock/demoBank';

export const getMarketingId = async (MarketingId:string) => {
    if (isDemoBankSortId(MarketingId)) {
      return DEMO_BANK_MARKETING_ID;
    }
    const params = new URLSearchParams();
    params.append('marketingSortId', MarketingId);
    const response = await apiClient({
        url: `/marketing/getMarketing`,
        options: {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: params.toString()
        },
        requireAuth: false,
        useCache: true // 启用缓存
    });
    return response;
}
export const getMarketingOverview = async (MarketingId:string) => {
  if (MarketingId === DEMO_BANK_MARKETING_ID) {
    return {
      companyStrategy: demoBankMarketing.companyStrategy,
    };
  }
  const params = new URLSearchParams();
    params.append('MarketingId', MarketingId);
    const response = await apiClient({
        url: `/marketing/${MarketingId}/overview`,
        options: {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: params.toString()
        },
        requireAuth: false,
        useCache: false // 启用缓存
    });
    return response;
}

export const getCampaignList = async (marketingSortId: string) => {
  try {
    const params = new URLSearchParams();
    params.append('marketingSortId', marketingSortId);
    const response = await apiClient({
      url: `/campaign/list?${params.toString()}`,
      options: {
        method: 'GET',
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      },
      requireAuth: false,
      useCache: false // 启用缓存
    });
    return response;
  } catch (error) {
    console.error('Error fetching news link:', error);
    throw error;
  }
}

export const getFinancialsById = async (companyId: string) => {
  try {
    const response = await apiClient({
      url: `/financials/getById?bankId=${companyId}`,
      options: {
        method: 'GET',
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      },
      requireAuth: false,
      useCache: true // 启用缓存
    });
    return response;
  } catch (error) {
    console.error('Error fetching news link:', error);
    throw error;
  }
}

export const getReportLatest = async (companySortId:string) => {
    const response = await apiClient({
        url: `/report/${companySortId}/latest`,
        options: {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        },
        requireAuth: false,
        useCache: true // 启用缓存
    });
    return response;
}

export const postReportFilter = async (params: any) => {
  try {
    const response = await apiClient({
      url: '/report/filterFin',
      options: {
        method: 'POST',
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(params)
      },
      requireAuth: false,
      useCache: false // 启用缓存
    });
    return response;
  } catch (error) {
    console.error('Error fetching news filter:', error);
    throw error;
  }
}


// 下载pdf
export const postDownloadFileByUrl = async (companyId: string) => {
  try {
    const params = new URLSearchParams();
    params.append('companyId', companyId);
    const response = await apiClient({
      url: '/resource/downloadFileByUrl',
      options: {
        method: 'POST',
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: params
      },
      requireAuth: false,
      useCache: true // 启用缓存
    });
    return response;
  } catch (error) {
    console.error('Error fetching news link:', error);
    throw error;
  }
}



