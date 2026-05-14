export type NewsCard = {
    title: string;
    authority?: string;
    date: string;
    dateTag?: string;
    source: string;
    tag: string[] | string;
    imgUrl: string;
    imgType?: number | null;
    description?: string | null;
    type?: string;
}

export type ReportCard = {
    name: string;
    companyName: string;
    year: string;
    link: string;
    imgType?: number | null;
}

export type Page<T> = {
    imgType?: number | null;
    content: T[];
    numberOfElements: number;
    totalPages: number;
    totalElements: number;
    size: number;
    number: number;
}

export type CommonResponse = {
    data: any
}
