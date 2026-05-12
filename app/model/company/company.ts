export type CompanyHeader = {
    companyName: string;
    location: string;
    tag: string[];
    logoLink: string;
    status: string;
    website?: string;
    following?: boolean;
}

export interface OverviewInfo {
    location: string;
    bankSwift: string;
    bankCode: string;
    publicCompany: boolean;
    revenue: string;
    website: string;
    status: string;
    tag: string[];
    foundedTime: string;
    founderName: string;
    ceoName: string;
    employeeSize: string;
    isDigitalBankLicense: boolean;
    isRentDigitalBankLicense: boolean;
    digitalBankLicenseRentFrom: string;
    isDigitalInsuranceLicense: boolean;
    isRentDigitalInsuranceLicense: boolean;
    digitalInsuranceLicenseRentFrom: string;
}

export interface TechData {
    companySortId: string;
    website: string;
    employeeSize: number;
    sizeCategory: string;
    techSummary?: string;
}

export interface RatingData {
    companySortId: string;
    rating?: number;
    grade?: string;
    margin?: boolean;
    derivatives?: boolean;
    web3Partners?: string;
    overallRating?: string;
    innovationScore?: string;
    adoptionLevel?: string;
    // 其他评级相关字段
    buyAndSellCryptocurrency?: Boolean;
    serviceFeeOrPlanFee?: string;
    nftIssue?: boolean;
    buyAndSellNFT?: boolean;
    cryptoPayment?: boolean;
    aiBotAvatar?: boolean;
    virtualBankingExperience?: string;
    metaversePlatform?: string;
    customerAcquisition?: string;
}

export interface GradeData {
    companySortId: string;
    grade?: string;
    technologyGrade?: string;
    strategyGrade?: string;
    implementationGrade?: string;
    // 其他等级相关字段
}

export type FinancialsInfo = {
    fundingRounds: string;
    fundingAmount: string;
    breakevenPoint: string;
    leadingInvestment: string;
    marketCap: string;
    currentProfit: string;
}

export type ProductSummaryInfo = {
    Personal : {
        "Account": boolean,
        "Payment": boolean,
        "Card": boolean,
        "Deposit": boolean,
        "Transfer": boolean,
        "Loan": boolean,
        "Investment": boolean,
        "Foreign_Exchange": boolean,
        "Insurance": boolean
    };

    Coroprate : {
        "Account": boolean,
        "Payment": boolean,
        "Card": boolean,
        "Deposit": boolean,
        "Transfer": boolean,
        "Loan": boolean,
        "Investment": boolean,
        "Foreign_Exchange": boolean,
        "Insurance": boolean
    }
}

export type ProductCard = {
    productName: string;
    productDescription: string;
    productLink: string;
    productType?: string;
    description?: string;
    features?: string[];
    benefits?: string[];
    clientTag?: string;
    innovative?: boolean;
    clientTagText?: string;
    customerSegment?: 'retail' | 'corporate';
}

export type CustomerSegment = 'all' | 'retail' | 'corporate';

const RETAIL_CLIENT_TAGS = new Set([
  'Retail',
  'General_public',
  'General Public',
  'Investor',
  'Savings',
  'Personal',
]);
const CORPORATE_CLIENT_TAGS = new Set([
  'Corporate',
  'Coroprate',
  'SME',
  'Startup',
  'Developer',
  'Business',
  'Enterprise',
]);

export function resolveCustomerSegment(
  product: Pick<ProductCard, 'customerSegment' | 'clientTag'>,
): 'retail' | 'corporate' {
  if (product.customerSegment === 'retail' || product.customerSegment === 'corporate') {
    return product.customerSegment;
  }
  const tag = (product.clientTag || '').trim();
  if (CORPORATE_CLIENT_TAGS.has(tag)) return 'corporate';
  if (RETAIL_CLIENT_TAGS.has(tag)) return 'retail';
  return 'retail';
}

export type Page<T> = {
    content: T[];
    numberOfElements: number;
    totalPages: number;
    totalElements: number;
    size: number;
    number: number;
}