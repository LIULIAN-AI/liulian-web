import { apiClient } from "../apiClient";
import { RatingData } from "@/app/model/company/company";
export async function getHeader({
    companySortId
} : {
    companySortId: string,
}) {
    const response = await apiClient({
        url: `/company/${companySortId}/getHeader`,
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

export async function getNewHeader({
    companySortId,
    userId
} : {
    companySortId: string,
    userId: string | null,
}) {
    const params = new URLSearchParams();
    let userIdStr:any = userId ? userId : localStorage.getItem('userId')
    params.append('userId', userIdStr || '');
    params.append('companySortId', companySortId);
    const response = await apiClient({
        url: `/company/getCompany/getHeader`,
        options: {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: params,
        },
        requireAuth: false,
        useCache: false // 启用缓存
    });
    
    return response;
}

export async function getOverview({
    companySortId
} : {
    companySortId: string,
}) {
    const response = await apiClient({
        url: `/company/${companySortId}/getOverview`, 
        options: {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        },
        requireAuth: false
    });
    
    return response;
}

export async function getSpotlight ({
    companySortId
} : {
    companySortId: string,
}) {
    const response = await apiClient({
        url: `/company/${companySortId}/getSpotlight`,
        options: {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        },
        requireAuth: false
    });

    return response;
}

export async function getProductSummaryInfo ({
    companySortId 
} : {
    companySortId: string,
 }) {
    const response = await apiClient({
        url: `/companyproduct/${companySortId}/getSummaryInfo`,
        options: {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        },
        requireAuth: false
    })

    return response;
 }

 export async function filterProduct ({
  companySortId,
  productType,
  page,
  size,
  token
 } : {
  companySortId: string,
  productType: string,
  page: number,
  size: number,
  token?: string | undefined | null
 }) {
    const requestBody = {
        companySortId: companySortId,
        personalProductType: [productType],
        corporateProductType: [productType],
        page: page,
        pageSize: size,
        token: token
    }

    const response = await apiClient({
        url: `/companyproduct/filter`,
        options: {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(requestBody)
        },
        requireAuth: false
    })

    return response;
 }

 export async function getFinancialsInfo ({
  companySortId
 } : {
  companySortId: string,
 }) {
    const response = await apiClient({
        url: `/financials/${companySortId}/getFinancials`,
        options: {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        },
        requireAuth: false
    });

    return response;
 }

 export async function getFundingInfo ({
  companySortId,
  page,
  size
 } : {
  companySortId: string,
  page: number,
  size: number,
 }) {
    const response = await apiClient({
        url: `/ffunding/${companySortId}/getFunding?page=${page}&pageSize=${size}`,
        options: {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        },
        requireAuth: false
    });

    return response;
 }

 export async function getInvestmentInfo ({
    companySortId,
    page,
    size
   } : {
    companySortId: string,
    page: number,
    size: number,
   }) {
      const response = await apiClient({
          url: `/finvestment/${companySortId}/getInvestment?page=${page}&pageSize=${size}`,
          options: {
              method: "GET",
              headers: {
                  "Content-Type": "application/json",
              },
          },
          requireAuth: false
      });
  
      return response;
}

 export async function getTechData ({
   companySortId
} : {
   companySortId: string,
}) {
  const response = await apiClient({
      url: `/NoAndTech/getById?id=${companySortId}`,
      options: {
          method: "GET",
          headers: {
              "Content-Type": "application/json",
          },
      },
      requireAuth: false
  });
  
  return response;
}

 export async function getMarketingStrategy({
   companySortId,
 }: {
   companySortId: string;
 }) {
   const response = await apiClient({
     url: `/marketing/base-header/${companySortId}/${companySortId}`,
     options: {
       method: 'GET',
       headers: {
         'Content-Type': 'application/json',
       },
     },
     requireAuth: false
   });

   return response;
 }

 export interface SocialMediaLink {
   marketingSortId: string;
   socialMediaType: string;
   socialMediaLink: string;
 }

 export const getSocialMediaLinks = async (marketingSortId: string) => {
   const response = await apiClient({
     url: `/marketing/social-media-links/${marketingSortId}`,
     options: {
       method: 'GET',
       headers: {
         'Content-Type': 'application/json',
       },
     },
     requireAuth: false
   });

   return response as SocialMediaLink[];
 };

 export const getAppRecord = async (marketingSortId: string) => {
   const response = await apiClient({
     url: `/marketing/app-record/${marketingSortId}`,
     options: {
       method: 'GET',
       headers: {
         'Content-Type': 'application/json',
       },
     },
     requireAuth: false
   });

   return response as any;
 };
 //未完善 ========================================================================================
 interface ChartData {
      time: string;
      LinkedIn: number;
      Facebook: number;
      Youtube: number;
      Instagram: number;
    }

// 定义接口参数类型，明确需要的两个参数
interface GetSocialMediaRankParams {
  marketingSortId: string; // 原有参数：营销分类ID
  timeRange: string; // 新增参数：时间范围（day/month/year）
}

/**
 * 获取社交媒体排名数据
 * @param params - 包含marketingSortId和timeRange的参数对象
 * @returns 排名数据数组（ChartData[]）
 */
export const getSocialMediaRank = async (params: GetSocialMediaRankParams) => {
  const { marketingSortId, timeRange } = params;

  // 构造URL：保留marketingSortId作为路径参数，timeRange作为查询参数
  const url = `/marketing/social-media-rank/${marketingSortId}?timeRange=${encodeURIComponent(timeRange)}`;

  const response = await apiClient({
    url,
    options: {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    },
  });

  return response as ChartData[];
};

 interface AppRankingData {
   time: string;
   'App-Store': number;  // 替换rating1为App-Store
   'Google-Play': number; // 替换rating2为Google-Play
 }
 // 定义API请求函数
   export const getAppRank = async (params: GetSocialMediaRankParams) => {
    const { marketingSortId, timeRange } = params;
     const response = await apiClient({
       url: `/marketing/app-rank/${marketingSortId}?timeRange=${encodeURIComponent(timeRange)}`, // 路径对应App排名接口
       options: {
         method: 'GET',
         headers: {
           'Content-Type': 'application/json',
         },
       },
       requireAuth: false
     });

     return response as AppRankingData[];
   };

 interface SwotData{
    Strengths: string;
     Weaknesses: string;
     Opportunities: string;
     Threats: string;
   }
 // 定义API请求函数
   export const getSwotData = async (marketingSortId: string) => {
     const response = await apiClient({
       url: `/marketing/base-header/1/${marketingSortId}`, // 使用实际存在的接口
       options: {
         method: 'GET',
         headers: {
           'Content-Type': 'application/json',
         },
       },
       requireAuth: false
     });

     return response as SwotData;
   };


 interface PieChartData {
   name: string;
   value: number;
 }

  // 定义API请求函数（与getAppRecord风格一致）
  export const getPieChartData = async (marketingSortId: string) => {
    const response = await apiClient({
      url: `/marketing/media-info/${marketingSortId}`, // 使用实际存在的接口
      options: {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      },
      requireAuth: false
    });

    return response;
  };

interface CommentData {
    tag1: string;
    tag2: string;
    tag3: string;
    positive: string;
    negative: string;
  }

  // 定义API请求函数
  export const getCommentData = async (marketingSortId: string) => {
    const response = await apiClient({
      url: `/marketing/app-record/${marketingSortId}`, // 使用实际存在的接口
      options: {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      },
      requireAuth: false
    });

    return response as CommentData;
  };

  interface Competitor {
    Name: string;         // 银行名称（对应compBankSpan）
    Category: string;     // 类别（对应compBankTagSpan）
    logoURL: string;      // logo路径（对应img的src）
  }
  // 定义API请求函数
  export const getCompetitorData = async (marketingSortId: string) => {
    const response = await apiClient({
      url: `/marketing/social-media/${marketingSortId}/linkedin`, // 使用实际存在的接口
      options: {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      },
      requireAuth: false
    });

    return response as Competitor[];
  };

 interface Web3StrategyData {
    web3Strategy: string;
    companyName?: string;
    blockchainAdoption?: string;
    cryptoIntegration?: string;
    nftStrategy?: string;
    defiInvolvement?: string;
    metaversePresence?: string;
    regulatoryCompliance?: string;
    futurePlans?: string;
    rating?: RatingData;
    grade?: GradeData;
  }
  // API请求函数（URL参数名更新）
  export const getWeb3Strategy = async (companySortId: string) => {
    const response = await apiClient({
      url: `/web3/strategy/${companySortId}`, // 替换为companySortId
      options: {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      },
      requireAuth: false
    });
    return response as Web3StrategyData;
  };

  // API请求函数
  export const getRatingData = async (companySortId: string) => {
    const response = await apiClient({
      url: `/web3/company/${companySortId}`,
      options: {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      },
      requireAuth: false
    });

    return response as any;
  };
  interface GradeData {
      gradeDecentralization: number;
      gradeCBDC: number;
      gradeCrypto: number;
      gradeNFTs: number;
      gradeDeFi: number;
      gradeWeb3: number;
      gradeMeta: number;
      gradeInvest: number;
      technologyGrade?: string;
      strategyGrade?: string;
      implementationGrade?: string;
    }

  // API请求函数
    export const getGradeData = async (companySortId: string) => {
      const response = await apiClient({
        url: `/web3/company/${companySortId}`,
        options: {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        },
        requireAuth: false
      });

      return response as GradeData;
    };

export async function getHomepageData({
  companySortId
} : {
  companySortId: string,
}) {
  const response = await apiClient({
    url: `/homepage/data/${companySortId}`,
    options: {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    },
    requireAuth: false
  });

  return response;
}
