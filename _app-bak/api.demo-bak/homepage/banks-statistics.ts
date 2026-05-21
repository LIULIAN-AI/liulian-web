import { apiClient } from "../apiClient";
// 获取初始银行列表
export const initBanks = async () => {
  try {
    const response = await apiClient({
      url: '/homepage/banks/initial',
      options: {
        method: 'GET',
        headers: {
          "Content-Type": "application/json",
        },
      },
      requireAuth: false,
      useCache: true // 启用缓存
    });
    return response;
  } catch (error) {
    console.error('Failed to fetch initial banks:', error);
    throw error;
  }
}
// 获取银行搜索列表
export const getSearchBanks = async (params: URLSearchParams, city?: string) => {
  try {
    const response = await apiClient({
      url: `/homepage/esSearch?${params}${city ? `&location=${city}` : ''}`,
      options: {
        method: 'GET',
        headers: {
          "Content-Type": "application/json",
        },
      },
      requireAuth: false,
      useCache: false // 启用缓存
    });
    return response;
  } catch (error) {
    console.error('Failed to fetch search banks:', error);
    throw error;
  }
}
// 获取全部地区
export const getLocationAll = async () => {
  try {
    const response = await apiClient({
      url: `/location/all`,
      options: {
        method: 'GET',
        headers: {
          "Content-Type": "application/json",
        },
      },
      requireAuth: false,
      useCache: true // 启用缓存
    });
    return response;
  } catch (error) {
    console.error('Failed to fetch search banks:', error);
    throw error;
  }
}
// 获取地区的某个城市
export const postRegionGetCountries = async (region: string) => {
  try {
    const params = new URLSearchParams();
    params.append('region', region);
    const response = await apiClient({
      url: '/location/region/getCountries',
      options: {
        method: 'POST',
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: params
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

// 获取新兴银行接口
export const getBanksStatistics = async () => {
  try {
    const response = await apiClient({
      url: `/homepage/getBanksStatistics`,
      options: {
        method: 'POST',
        headers: {
          "Content-Type": "application/json",
        },
      },
      requireAuth: false,
      useCache: true // 启用缓存
    });
    return response;
  } catch (error) {
    console.error('Failed to fetch search getBanksStatistics:', error);
    throw error;
  }
}
