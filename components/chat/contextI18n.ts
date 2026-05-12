import type { useTranslations } from 'next-intl';

export const COMPONENT_LABEL_KEYS: Record<string, string> = {
  about: 'context.compAbout',
  establishment: 'context.compEstablishment',
  bank_header: 'context.compBankHeader',
  related_banks: 'context.compRelatedBanks',
  product_innovation: 'context.compProductInnovation',
  product_highlights: 'context.compProductHighlights',
  management_team: 'context.compManagementTeam',
  shareholders: 'context.compShareholders',
  marketing_strategy: 'context.compMarketingStrategy',
  app_performance: 'context.compAppPerformance',
  web3_offerings: 'context.compWeb3Offerings',
  tech_stack: 'context.compTechStack',
  funding_summary: 'context.compFundingSummary',
  financial_overview: 'context.compFinancialOverview',
};

export const SOURCE_VALUE_KEYS: Record<string, string> = {
  frontend_snapshot: 'context.sourceFrontendSnapshot',
  database: 'context.sourceDatabase',
  api_response: 'context.sourceApiResponse',
};

export const FIELD_LABEL_KEYS: Record<string, string> = {
  bankName: 'context.fieldBankName',
  bank_name: 'context.fieldBankName',
  sortId: 'context.fieldSortId',
  source: 'context.fieldSource',
  ceo: 'context.fieldCeo',
  founded: 'context.fieldFounded',
  establishedTime: 'context.fieldEstablishedTime',
  description: 'context.fieldDescription',
  companyStrategy: 'context.fieldCompanyStrategy',
  depositMarketShare: 'context.fieldDepositMarketShare',
  campaignsCount: 'context.fieldCampaignsCount',
  appStoreStar: 'context.fieldAppStoreStar',
  googlePlayStar: 'context.fieldGooglePlayStar',
  website: 'context.fieldWebsite',
  totalCount: 'context.fieldTotalCount',
  filter: 'context.fieldFilter',
  productName: 'context.fieldProductName',
  productType: 'context.fieldProductType',
  productDescription: 'context.fieldProductDescription',
  productLink: 'context.fieldProductLink',
  customerSegment: 'context.fieldCustomerSegment',
  clientTag: 'context.fieldClientTag',
  marketCap: 'context.fieldMarketCap',
  profitOrLoss: 'context.fieldProfitOrLoss',
  breakEven: 'context.fieldBreakEven',
  ifBreakEven: 'context.fieldIfBreakEven',
  leadInvestor: 'context.fieldLeadInvestor',
  year: 'context.fieldYear',
  techSummary: 'context.fieldTechSummary',
  summary: 'context.fieldSummary',
  fundingRoundsCount: 'context.fieldFundingRoundsCount',
  investmentRoundsCount: 'context.fieldInvestmentRoundsCount',
  location: 'context.fieldLocation',
  revenue: 'context.fieldRevenue',
  companySize: 'context.fieldCompanySize',
  company_size: 'context.fieldCompanySize',
  companyId: 'context.fieldCompanyId',
  company_id: 'context.fieldCompanyId',
  bankCode: 'context.fieldBankCode',
  bank_code: 'context.fieldBankCode',
  bankSwift: 'context.fieldBankSwift',
  bank_swift: 'context.fieldBankSwift',
  founder: 'context.fieldFounder',
  owners: 'context.fieldOwners',
  employees: 'context.fieldEmployees',
  financialSummary: 'context.fieldFinancialSummary',
};

function humanizeKey(key: string): string {
  return key
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/_/g, ' ')
    .replace(/^\w/, (c) => c.toUpperCase());
}

export function componentLabel(t: ReturnType<typeof useTranslations<'Chat'>>, comp: string): string {
  const key = COMPONENT_LABEL_KEYS[comp];
  if (key) return t(key as any);
  return humanizeKey(comp);
}

export function fieldLabel(t: ReturnType<typeof useTranslations<'Chat'>>, key: string): string {
  const labelKey = FIELD_LABEL_KEYS[key];
  if (labelKey) return t(labelKey as any);
  return humanizeKey(key);
}

export function fieldValue(t: ReturnType<typeof useTranslations<'Chat'>>, key: string, val: any): string {
  if (key === 'source') {
    const vk = SOURCE_VALUE_KEYS[String(val ?? '')];
    if (vk) return t(vk as any);
  }
  return String(val ?? '');
}
