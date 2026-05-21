import { apiClient } from "../apiClient";

export function newsChat({token, question} : {token?: string | null, question: string | undefined
}) {
    const requestBody = {
        question: question,
    }

    const response = apiClient({
        url: "/news/question",
        options: {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(requestBody),
        },
        token: token});

    return response;
} 

export function searchReportCards({
    page = 0,
    size = 11,
    region,
    year,
    companySortId,
    token,
}:{
    page: number,
    size: number,
    region?: string,
    year?: string,
    companySortId?: string,
    token?: string | null,
}) {
    const requestBody = {
        page: page,
        pageSize: size,
        locationSortId: region === ''? null : region, 
        year: year === ''? null : year,
        companySortId: companySortId,
    }

    const response = apiClient({
        url: "/report/filter", 
        options: {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(requestBody),
        },
        token: token});
    response

    return response;

}

export function searchNewsCards({
    page = 0,
    size = 11,
    region,
    type,
    startDate,
    endDate,
    companySortId,
    token,
    micro
}:{
    page: number, 
    size: number, 
    region?: string,
    type?: string,
    startDate?: string,
    endDate?: string,
    companySortId?: string,
    token?: string | null,
    micro?: string | null,
}) {
    const requestBody = {
        page: page,
        pageSize: size,
        locationSortId: region === '' ? null : region,
        type: type === '' ? null : type,
        companySortId: companySortId,
        startDate: startDate,
        endDate: endDate,
        micro: micro === '' ? null : micro,
    }


    const response = apiClient({
        url: "/news/filter", 
        options: {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(requestBody),
        },
        token: token});
    response

    return response;
}

export async function filterNews({
  keyword,
  type,
  page = 1,
  size = 10
}: {
  keyword: string;
  type: string;
  page?: number;
  size?: number;
}) {
  const response = await apiClient({
    url: `/news/filter`,
    options: {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        keyword,
        type,
        page,
        size
      })
    },
    requireAuth: false
  });

  return response;
}