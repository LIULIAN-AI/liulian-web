import { apiClient } from "../apiClient";

const EXCLUDED_PARTNER_NAMES = ["newlink"];

function shouldIncludePartner(partner: unknown): boolean {
  if (!partner || typeof partner !== "object") {
    return true;
  }

  const partnerName = "name" in partner && typeof partner.name === "string"
    ? partner.name.trim().toLowerCase()
    : "";
  const partnerLogoLink = "logoLink" in partner && typeof partner.logoLink === "string"
    ? partner.logoLink.trim().toLowerCase()
    : "";

  return !EXCLUDED_PARTNER_NAMES.some(
    (excludedName) =>
      partnerName.includes(excludedName) || partnerLogoLink.includes(excludedName)
  );
}

// 新媒体链接
export const getNewsLink = async (type: string) => {
  try {
    const params = new URLSearchParams();
    params.append('resourceType', type);
    const response = await apiClient({
      url: '/homepage/getResourceUrlsByType',
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
// 返回市场公司谷歌下载量前10的数据
export const getMarketingByDownload = async () => {
  try {
    const response = await apiClient({
      url: '/homepage/getMarketingByDownload',
      options: {
        method: 'POST',
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
// 查询当前用户最近搜索的内容
export const getSearchWordsByUser = async () => {
  try {
    const response = await apiClient({
      url: '/homepage/getSearchWordsByUser',
      options: {
        method: 'GET',
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      },
      requireAuth: true,
      token:  localStorage.getItem('token'),
      useCache: false // 启用缓存
    });
    return response;
  } catch (error) {
    console.error('Error fetching news link:', error);
    throw error;
  }
}

// 关于我们-合作伙伴
export const getOurPartner = async () => {
  try {
    const response = await apiClient({
      url: '/homepage/getOurPartner',
      options: {
        method: 'POST',
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      },
      requireAuth: false,
      useCache: false // 启用缓存
    });
    return Array.isArray(response) ? response.filter(shouldIncludePartner) : response;
  } catch (error) {
    console.error('Error fetching news link:', error);
    throw error;
  }
}

// 关于我们-我们的团队
export const getOurTeam = async () => {
  try {
    const response = await apiClient({
      url: '/homepage/getOurTeam',
      options: {
        method: 'POST',
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

// 关于我们-联系我们
export const getContactUs = async (email: string) => {
  try {
    const response = await apiClient({
      url: '/homepage/contactUs',
      options: {
        method: 'POST',
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({email: email})
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