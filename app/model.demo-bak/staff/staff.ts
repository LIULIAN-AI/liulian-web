// Staff Employee Data (from NoAndTechController.getById)
export interface StaffEmployeeData {
    companySortId: string;
    website?: string;
    employeeSize?: number;
    sizeCategory?: string;
    techSummary?: string;
}

// Management Data (单个管理成员)
export interface ManagementData {
    // 由于后端使用@JsonUnwrapped，字段直接展开
    companySortId: string;
    managementName: string;
    managementTitle?: string;
    managementDepartment?: string;
    directorType?: string;
    imgUrl?: string;
    img_url?: string;
    management_department?: string;
    management_title?: string;
    director_type?: string;
}

// Management Page Data (分页数据)
export interface ManagementPageData {
    content: ManagementData[];
    totalPages: number;
    totalElements: number;
    size: number;
    number: number;
    first: boolean;
    last: boolean;
}

// Shareholder Data (单个股东)
export interface ShareholderData {
    // 由于后端使用@JsonUnwrapped，字段直接展开
    companySortId: string;
    shareholderName: string;
    shareholderDescription?: string;
    sharePercentage?: number;
    shareholderTag?: string;
    shareholder_description?: string;
    shareholder_tag?:string;
}

// Shareholder Page Data (分页数据)
export interface ShareholderPageData {
    content: ShareholderData[];
    totalPages: number;
    totalElements: number;
    size: number;
    number: number;
    first: boolean;
    last: boolean;
}

// Staff Summary Data
export interface StaffSummaryData {
    staffMembers: number;
    shareholders: number;
    directors: number;
}

// Staff Page Data
export interface StaffPageData {
    summary: StaffSummaryData;
    employeeData: StaffEmployeeData | null;
    managementList: ManagementData[];
    managementTeamList: ManagementData[];
    shareholderList: ShareholderData[];
    totalManagementPages: number;
    totalManagementTeamPages: number;
    totalShareholderPages: number;
} 