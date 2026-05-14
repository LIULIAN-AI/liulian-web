import { apiClient } from "../apiClient";

// Defensive guard — these endpoints reject missing/blank ids with an
// "ID is null" error that surfaces as a global antd toast. During route
// transitions (especially the brief moment before `useParams` settles)
// children can fire with an empty/"undefined"/"null" string, which
// triggers the banner even though the page eventually renders fine.
// Returning null short-circuits the request and lets callers no-op.
function isMissingId(id: string | null | undefined): boolean {
  if (id === null || id === undefined) return true;
  const trimmed = String(id).trim();
  return trimmed === '' || trimmed === 'undefined' || trimmed === 'null';
}

export async function getStaffEmployeeData({
  companySortId,
  token
}: {
  companySortId: string;
  token?: string | null;
}) {
  if (isMissingId(companySortId)) return null;
  const response = await apiClient({
    url: `/NoAndTech/getById?id=${companySortId}`,
    options: {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    },
    token: token
  });

  return response;
}

export async function getManagementList({
    companySortId,
    page = 0,
    size = 10,
    token
} : {
    companySortId: string,
    page?: number,
    size?: number,
    token?: string | null
}) {
    if (isMissingId(companySortId)) return { content: [], totalElements: 0 };
    const response = await apiClient({
        url: `/management/getListById?id=${companySortId}&page=${page}&size=${size}`,
        options: {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        },
        token: token
    });

    return response;
}

export async function getShareholderList({
    companySortId,
    page = 0,
    size = 10,
    token
} : {
    companySortId: string,
    page?: number,
    size?: number,
    token?: string | null
}) {
    if (isMissingId(companySortId)) return { content: [], totalElements: 0 };
    const response = await apiClient({
        url: `/staffShareholder/getListById?id=${companySortId}&page=${page}&size=${size}`,
        options: {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        },
        token: token
    });

    return response;
}