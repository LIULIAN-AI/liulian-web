import type { CompanyHeader } from '@/app/model/company/company';

export const DEMO_BANK_SORT_ID = 'demo-bank';
export const DEMO_BANK_COMPANY_ID = 'demo-bank';
export const DEMO_BANK_MARKETING_ID = 'demo-bank';

function normalizeId(value: string | null | undefined): string {
  return (value ?? '').trim().toLowerCase();
}

export function isDemoBankSortId(sortId: string | null | undefined): boolean {
  return normalizeId(sortId) === DEMO_BANK_SORT_ID;
}

export function isDemoBankCompanyId(companyId: string | null | undefined): boolean {
  return normalizeId(companyId) === DEMO_BANK_COMPANY_ID;
}

export function isDemoBankRoute(
  sortId: string | null | undefined,
  companyId: string | null | undefined,
): boolean {
  return isDemoBankSortId(sortId) || isDemoBankCompanyId(companyId);
}

export const demoBankHeader: CompanyHeader = {
  companyName: 'Nova Horizon Bank (Demo)',
  location: 'Hong Kong',
  tag: ['Digital Bank', 'SME Focus', 'Retail'],
  logoLink: '/images/defaultBank.svg',
  status: 'Live',
  website: 'https://demo.neobanker.local',
  following: false,
};

export const demoBankAboutData = {
  ceo: 'Elaine Wong',
  companySize: '501 - 1000 staffs',
  establishedTime: '2020-03-15',
  founder: 'Nova Financial Group',
  revenue: 'HKD 128,400,000 (FY2024)',
  location: 'Hong Kong',
  bankSwift: 'NHBKHKHHXXX',
  bankCode: '399',
  motto: 'Banking made proactive',
  numberOfUser: '520K+',
  owners: [
    {
      name: 'Nova Financial Group',
      percent: 61.0,
      website: 'https://demo.neobanker.local/investors',
    },
    {
      name: 'Eastbridge Capital',
      percent: 24.5,
      website: 'https://demo.neobanker.local/investors',
    },
  ],
};

export const demoBankApplicationData = {
  bankName: 'Nova Horizon Bank',
  appStoreStar: '4.7',
  googlePlayStar: '4.5',
  mediaAppList: [
    {
      title: 'instagram',
      imgUrl: '/images/bank-info/instagram.svg',
      url: 'https://instagram.com/novahorizonbank',
      num: '98K+',
    },
    {
      title: 'linkedin',
      imgUrl: '/images/bank-info/linkedIn.svg',
      url: 'https://linkedin.com/company/novahorizonbank',
      num: '73K+',
    },
    {
      title: 'facebook',
      imgUrl: '/images/bank-info/facebook.png',
      url: 'https://facebook.com/novahorizonbank',
      num: '120K+',
    },
    {
      title: 'youtube',
      imgUrl: '/images/bank-info/youtube.jpg',
      url: 'https://youtube.com/@novahorizonbank',
      num: '42K+',
    },
  ],
};

export const demoBankJurisdiction = {
  digitalBankLicense: true,
  rentDigitalBankLicense: false,
  digitalBankLicenseRentFrom: '',
  digitalInsuranceLicense: true,
  rentDigitalInsuranceLicense: false,
  digitalInsuranceLicenseRentFrom: '',
  updatedAt: '2026-03-31T00:00:00Z',
};

export const demoBankMarketing = {
  description:
    'Nova Horizon Bank positions itself as a digital-first bank for urban professionals and SMEs. The strategy combines lifestyle-led growth campaigns with productivity banking features.',
  companyStrategy:
    'Nova Horizon Bank uses a data-led growth strategy: app-first onboarding, personalized financial nudges, and bundled products for salaried users and SMEs. The go-to-market plan emphasizes social media education, payroll partnerships, and cross-sell journeys from deposit to card and lending.',
};

export const demoBankFinancialSortData = {
  financialList: [
    {
      name: 'assets',
      number: '8,640,000,000',
      letter: 'HKD',
      symbol: '-',
    },
    {
      name: 'breakevenNumber',
      number: '780,000,000',
      letter: 'HKD',
      symbol: '-',
    },
    {
      name: 'deposits',
      number: '6,420,000,000',
      letter: 'HKD',
      symbol: '-',
    },
    {
      name: 'loans',
      number: '3,980,000,000',
      letter: 'HKD',
      symbol: '-',
    },
    {
      name: 'leverage',
      number: '13.2',
      letter: 'x',
      symbol: '-',
    },
    {
      name: 'netInterestSpread',
      number: '2.9',
      letter: '%',
      symbol: '-',
    },
  ],
  content: [
    {
      assets: '8,640,000,000',
      breakevenNumber: '780,000,000',
      deopsits: '6,420,000,000',
      loans: '3,980,000,000',
      leverage: '13.2',
      netInterestSpread: '2.9',
    },
  ],
};

export const demoBankProducts = [
  {
    productDescription:
      'A zero-minimum digital account with instant virtual card issuance and salary auto-categorization.',
    productLink: 'https://demo.neobanker.local/products/nova-account',
    productName: 'Nova Account',
    productType: 'Account',
    clientTag: 'Retail',
    customerSegment: 'retail' as const,
  },
  {
    productDescription:
      'A cashback debit card with dynamic category boosts and spending insights for household budgeting.',
    productLink: 'https://demo.neobanker.local/products/nova-card',
    productName: 'Nova Card',
    productType: 'Card',
    clientTag: 'Retail',
    customerSegment: 'retail' as const,
  },
  {
    productDescription:
      'Flexible high-yield savings pockets with rules-based auto-transfer and short-term goals tracking.',
    productLink: 'https://demo.neobanker.local/products/nova-save',
    productName: 'Nova Save',
    productType: 'Deposit',
    clientTag: 'Savings',
    customerSegment: 'retail' as const,
  },
  {
    productDescription:
      'SME operating account with payroll API, invoice collection links, and reconciliation dashboard.',
    productLink: 'https://demo.neobanker.local/products/nova-sme',
    productName: 'Nova SME Hub',
    productType: 'Account',
    clientTag: 'SME',
    customerSegment: 'corporate' as const,
  },
  {
    productDescription:
      'Short-term working-capital line with transparent pricing and cashflow-based credit review.',
    productLink: 'https://demo.neobanker.local/products/nova-flex-credit',
    productName: 'Nova Flex Credit',
    productType: 'Loan',
    clientTag: 'SME',
    customerSegment: 'corporate' as const,
  },
];

export const demoBankManagement = [
  {
    name: 'Elaine Wong',
    title: 'Chief Executive Officer',
    background:
      'Former CFO at Eastbridge Capital; 18 years in regulated retail banking; led Nova digital transformation since 2020.',
    joinedAt: '2020-03-15',
  },
  {
    name: 'Marcus Liu',
    title: 'Chief Operating Officer',
    background:
      'Previously Head of Operations at HSBC HK Digital; specializes in KYC/AML automation and payment rails.',
    joinedAt: '2020-06-01',
  },
  {
    name: 'Priya Ramanathan',
    title: 'Chief Risk Officer',
    background:
      'ex-Standard Chartered; certified FRM; leads Nova\u2019s ECL framework and climate-risk stress testing.',
    joinedAt: '2021-01-10',
  },
  {
    name: 'Daniel Park',
    title: 'Chief Technology Officer',
    background:
      'Platform architect from Kakao Bank; led the rebuild of Nova\u2019s core ledger onto cloud-native services.',
    joinedAt: '2020-09-20',
  },
  {
    name: 'Sofia Rinaldi',
    title: 'Head of SME Banking',
    background:
      'Built the SME lending product line; ex-OCBC Wing Hang; focused on payroll APIs and working-capital lines.',
    joinedAt: '2021-08-05',
  },
];

export const demoBankShareholders = [
  {
    name: 'Nova Financial Group',
    percent: 61.0,
    type: 'Strategic',
    website: 'https://demo.neobanker.local/investors',
  },
  {
    name: 'Eastbridge Capital',
    percent: 24.5,
    type: 'Institutional',
    website: 'https://demo.neobanker.local/investors',
  },
  {
    name: 'Harbor Ventures Partners III',
    percent: 9.5,
    type: 'VC',
    website: 'https://demo.neobanker.local/investors',
  },
  {
    name: 'Employee ESOP Pool',
    percent: 5.0,
    type: 'Internal',
    website: 'https://demo.neobanker.local/investors',
  },
];

export const demoBankFunding = {
  totalRaised: 'HKD 1,420,000,000',
  rounds: [
    {
      round: 'Seed',
      date: '2019-11-02',
      amount: 'HKD 60,000,000',
      leadInvestor: 'Nova Financial Group',
    },
    {
      round: 'Series A',
      date: '2020-08-21',
      amount: 'HKD 210,000,000',
      leadInvestor: 'Eastbridge Capital',
    },
    {
      round: 'Series B',
      date: '2022-05-17',
      amount: 'HKD 450,000,000',
      leadInvestor: 'Harbor Ventures Partners III',
    },
    {
      round: 'Series C',
      date: '2024-09-30',
      amount: 'HKD 700,000,000',
      leadInvestor: 'Eastbridge Capital',
    },
  ],
};

export const demoBankAnnualReports = [
  {
    year: 'FY2024',
    url: 'https://demo.neobanker.local/reports/annual-2024.pdf',
    revenue: 'HKD 128,400,000',
    netIncome: 'HKD -86,500,000',
    NIM: '2.9%',
  },
  {
    year: 'FY2023',
    url: 'https://demo.neobanker.local/reports/annual-2023.pdf',
    revenue: 'HKD 97,200,000',
    netIncome: 'HKD -142,100,000',
    NIM: '2.4%',
  },
  {
    year: 'FY2022',
    url: 'https://demo.neobanker.local/reports/annual-2022.pdf',
    revenue: 'HKD 54,800,000',
    netIncome: 'HKD -198,700,000',
    NIM: '1.8%',
  },
];

export const demoBankCampaigns = [
  {
    name: 'Nova Everyday Cashback',
    channel: 'Social + OOH',
    startedAt: '2025-02-01',
    status: 'Live',
    reachMillions: 2.3,
  },
  {
    name: 'SME Launchpad 2025',
    channel: 'Partner events',
    startedAt: '2025-04-18',
    status: 'Live',
    reachMillions: 0.4,
  },
  {
    name: 'Salary Arrival Bonus',
    channel: 'In-app + Payroll partners',
    startedAt: '2024-10-10',
    status: 'Completed',
    reachMillions: 1.1,
  },
];

export const demoBankTechStack = {
  coreBanking: 'Cloud-native ledger (internal; built on PostgreSQL + Kafka)',
  frontend: 'Native iOS/Android + Progressive Web App',
  cloud: 'AWS primary, Alibaba Cloud DR',
  ai: 'On-device ML for fraud scoring; GLM + Claude for customer support agent',
  apis: 'Open API tier (read-only); PSD2-like payment initiation partners',
  security: 'SOC 2 Type II, ISO 27001; hardware-backed key management',
  notableIntegrations: [
    'FPS (Faster Payment System)',
    'eID / iAM Smart',
    'SWIFT gpi for cross-border',
    'Xero / QuickBooks for SME',
  ],
};

export const demoBankWeb3 = {
  stance:
    'Nova maintains a regulated Web3 product shelf, limited to HKMA-permitted digital-asset services through licensed partners.',
  offerings: [
    {
      name: 'Nova Crypto Wallet',
      status: 'Pilot',
      description: 'Custodial wallet for BTC/ETH available to professional investors only.',
    },
    {
      name: 'Tokenized Deposits',
      status: 'Research',
      description: 'Sandbox participant in HKMA Project Ensemble for tokenized deposits.',
    },
    {
      name: 'Stablecoin On-Ramp',
      status: 'Partner-powered',
      description: 'Fiat-to-USDC routing via a licensed VATP partner.',
    },
  ],
  licensesReferenced: ['VATP Licensed Partner', 'SFC Type 1 (via subsidiary)'],
};

export const demoBankSimilarBanks = [
  {
    id: 'sim-1',
    logoLink: '/images/defaultBank.svg',
    name: 'Atlas Digital Bank',
    location: 'Hong Kong',
    companySortId: 'atlas-demo',
  },
  {
    id: 'sim-2',
    logoLink: '/images/defaultBank.svg',
    name: 'Summit Neo Finance',
    location: 'Singapore',
    companySortId: 'summit-demo',
  },
  {
    id: 'sim-3',
    logoLink: '/images/defaultBank.svg',
    name: 'Harbor Future Bank',
    location: 'Hong Kong',
    companySortId: 'harbor-demo',
  },
];
