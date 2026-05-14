import { apiClient } from "../apiClient";
export const postCompanyOverviewById = async (companyId: string) => {
  if (!companyId || companyId === 'null') return null;

  try {
    const params = new URLSearchParams();
    params.append('companyId', companyId);
    const response = await apiClient({
      url: '/overview/getCompanyOverviewById',
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

export const postBankCompanyById = async (companyId: string) => {
  if (!companyId || companyId === 'null') return null;

  try {
    const params = new URLSearchParams();
    params.append('companyId', companyId);
    const response = await apiClient({
      url: '/company/bank/getCompanyById',
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

export const getCompanySortId = async (companySortId:string) => {
    const response = await apiClient({
        url: `/company/${companySortId}/overview`,
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


export const postFinancialsListById = async (companyId: string) => {
  try {
    const response = await apiClient({
      url: `/financials/getListById?id=${companyId}`,
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

export const postProductByCompanyId = async (companyId: string) => {
  if (!companyId || companyId === 'null') return null;

  try {
    const params = new URLSearchParams();
    params.append('companyId', companyId);
    const response = await apiClient({
      url: '/companyproduct/getProductByCompanyId',
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

export const postSimilarBanks = async (companyId: string) => {
  if (!companyId || companyId === 'null') return null;

  try {
    const params = new URLSearchParams();
    params.append('companyId', companyId);
    const response = await apiClient({
      url: '/overview/getSimilarBanks',
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
