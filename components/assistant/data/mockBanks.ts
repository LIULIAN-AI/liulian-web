import type { CompanyHeader } from '@/app/model/company/company';

export interface MockBankData {
  sortId: string;
  header: CompanyHeader;
  about: {
    ceo: string;
    companySize: string;
    establishedTime: string;
    founder: string;
    revenue: string;
    location: string;
    bankSwift: string;
    bankCode: string;
    numberOfUser: string;
  };
  financials: {
    assets: string;
    deposits: string;
    loans: string;
    leverage: string;
    netInterestSpread: string;
    roe: string;
    costToIncome: string;
    nplRatio: string;
  };
  quarterlyResults: {
    period: string;
    revenue: string;
    opex: string;
    netIncome: string;
    roe: string;
  }[];
  products: {
    productName: string;
    productType: string;
    productDescription: string;
    clientTag: string;
    customerSegment: 'retail' | 'corporate';
    productLink?: string;
  }[];
  management: {
    name: string;
    title: string;
    background: string;
    joinedAt: string;
  }[];
  watchMetrics: {
    label: string;
    value: number;
    unit: string;
    change: number;
    threshold?: number;
    breached?: boolean;
  }[];
  owners: {
    name: string;
    percent: number;
    website?: string;
  }[];
  campaigns: {
    name: string;
    channel: string;
    status: string;
    reach: string;
  }[];
}

export const MOCK_BANKS: MockBankData[] = [
  {
    sortId: 'demo-bank',
    header: {
      companyName: 'Nova Horizon Bank',
      location: 'Hong Kong',
      tag: ['Digital Bank', 'SME Focus', 'Retail'],
      logoLink: '/images/defaultBank.svg',
      status: 'Live',
      website: 'https://demo.liulian.local',
      following: false,
    },
    about: {
      ceo: 'Elaine Wong',
      companySize: '501–1000',
      establishedTime: '2020',
      founder: 'Nova Financial Group',
      revenue: 'HKD 128.4M',
      location: 'Hong Kong',
      bankSwift: 'NHBKHKHHXXX',
      bankCode: '399',
      numberOfUser: '520K+',
    },
    financials: {
      assets: 'HKD 8.64B',
      deposits: 'HKD 6.42B',
      loans: 'HKD 3.98B',
      leverage: '13.2x',
      netInterestSpread: '2.9%',
      roe: '13.5%',
      costToIncome: '58%',
      nplRatio: '0.8%',
    },
    quarterlyResults: [
      { period: 'Q1 2025', revenue: '28.1M', opex: '16.3M', netIncome: '8.2M', roe: '11.8%' },
      { period: 'Q2 2025', revenue: '31.4M', opex: '17.1M', netIncome: '10.1M', roe: '12.9%' },
      { period: 'Q3 2025', revenue: '33.7M', opex: '18.0M', netIncome: '11.5M', roe: '13.2%' },
      { period: 'Q4 2025', revenue: '35.2M', opex: '18.8M', netIncome: '12.0M', roe: '13.5%' },
    ],
    products: [
      { productName: 'Nova Account', productType: 'Account', productDescription: 'Zero-minimum digital account with instant virtual card issuance and salary auto-categorization.', clientTag: 'Retail', customerSegment: 'retail' },
      { productName: 'Nova Card', productType: 'Card', productDescription: 'Cashback debit card with dynamic category boosts and spending insights.', clientTag: 'Retail', customerSegment: 'retail' },
      { productName: 'Nova Save', productType: 'Deposit', productDescription: 'High-yield savings pockets with rules-based auto-transfer and goals tracking.', clientTag: 'Savings', customerSegment: 'retail' },
      { productName: 'Nova SME Hub', productType: 'Account', productDescription: 'SME operating account with payroll API, invoice collection, and reconciliation dashboard.', clientTag: 'SME', customerSegment: 'corporate' },
      { productName: 'Nova Flex Credit', productType: 'Loan', productDescription: 'Short-term working-capital line with transparent pricing and cashflow-based credit review.', clientTag: 'SME', customerSegment: 'corporate' },
    ],
    management: [
      { name: 'Elaine Wong', title: 'Chief Executive Officer', background: 'Former CFO at Eastbridge Capital; 18 years in regulated retail banking.', joinedAt: '2020-03-15' },
      { name: 'Marcus Liu', title: 'Chief Operating Officer', background: 'Previously Head of Operations at HSBC HK Digital; KYC/AML automation specialist.', joinedAt: '2020-06-01' },
      { name: 'Priya Ramanathan', title: 'Chief Risk Officer', background: 'ex-Standard Chartered; certified FRM; leads ECL framework and climate-risk stress testing.', joinedAt: '2021-01-10' },
      { name: 'Daniel Park', title: 'Chief Technology Officer', background: 'Platform architect from Kakao Bank; rebuilt core ledger onto cloud-native services.', joinedAt: '2020-09-20' },
    ],
    watchMetrics: [
      { label: 'Revenue', value: 128.4, unit: 'M', change: 12.3 },
      { label: 'ROE', value: 13.5, unit: '%', change: 2.1 },
      { label: 'NPL Ratio', value: 0.8, unit: '%', change: -0.1 },
    ],
    owners: [
      { name: 'Nova Financial Group', percent: 61.0, website: 'https://demo.liulian.local/investors' },
      { name: 'Eastbridge Capital', percent: 24.5, website: 'https://demo.liulian.local/investors' },
    ],
    campaigns: [
      { name: 'Nova Everyday Cashback', channel: 'Social + OOH', status: 'Live', reach: '2.3M' },
      { name: 'SME Launchpad 2025', channel: 'Partner events', status: 'Live', reach: '400K' },
      { name: 'Salary Arrival Bonus', channel: 'In-app', status: 'Completed', reach: '1.1M' },
    ],
  },
  {
    sortId: 'atlas-demo',
    header: {
      companyName: 'Atlas Digital Bank',
      location: 'Hong Kong',
      tag: ['Digital Bank', 'Retail Focus'],
      logoLink: '/images/defaultBank.svg',
      status: 'Live',
      website: 'https://atlas.demo.local',
      following: false,
    },
    about: {
      ceo: 'James Tan',
      companySize: '201–500',
      establishedTime: '2019',
      founder: 'Atlas Fintech Group',
      revenue: 'HKD 185M',
      location: 'Hong Kong',
      bankSwift: 'ATLSHKHHXXX',
      bankCode: '391',
      numberOfUser: '800K+',
    },
    financials: {
      assets: 'HKD 42B',
      deposits: 'HKD 36.5B',
      loans: 'HKD 18.2B',
      leverage: '15.8x',
      netInterestSpread: '2.1%',
      roe: '3.2%',
      costToIncome: '82%',
      nplRatio: '1.2%',
    },
    quarterlyResults: [
      { period: 'Q1 2025', revenue: '42.5M', opex: '34.8M', netIncome: '5.2M', roe: '2.8%' },
      { period: 'Q2 2025', revenue: '44.1M', opex: '35.9M', netIncome: '5.8M', roe: '3.0%' },
      { period: 'Q3 2025', revenue: '47.3M', opex: '38.1M', netIncome: '6.5M', roe: '3.1%' },
      { period: 'Q4 2025', revenue: '51.1M', opex: '41.2M', netIncome: '7.0M', roe: '3.2%' },
    ],
    products: [
      { productName: 'Atlas Current', productType: 'Account', productDescription: 'Everyday checking with real-time spend notifications and virtual cards.', clientTag: 'Retail', customerSegment: 'retail' },
      { productName: 'Atlas Rewards Card', productType: 'Card', productDescription: 'Points-based credit card with travel and dining category bonuses.', clientTag: 'Retail', customerSegment: 'retail' },
      { productName: 'Atlas Time Deposit', productType: 'Deposit', productDescription: 'Flexible term deposits from 1 to 12 months with competitive rates.', clientTag: 'Savings', customerSegment: 'retail' },
      { productName: 'Atlas Personal Loan', productType: 'Loan', productDescription: 'Unsecured personal loans with instant approval and fixed monthly payments.', clientTag: 'Retail', customerSegment: 'retail' },
    ],
    management: [
      { name: 'James Tan', title: 'Chief Executive Officer', background: 'Former MD at DBS Hong Kong; 15 years in digital banking transformation.', joinedAt: '2019-01-10' },
      { name: 'Lisa Chen', title: 'Chief Financial Officer', background: 'ex-Deloitte Partner; expertise in fintech audit and regulatory reporting.', joinedAt: '2019-06-01' },
      { name: 'Kevin Ho', title: 'Chief Technology Officer', background: 'Former VP Engineering at Revolut APAC; led mobile-first banking stack.', joinedAt: '2019-03-15' },
    ],
    watchMetrics: [
      { label: 'Revenue', value: 185, unit: 'M', change: 8.1 },
      { label: 'ROE', value: 3.2, unit: '%', change: -0.5, threshold: 5, breached: true },
      { label: 'NPL Ratio', value: 1.2, unit: '%', change: 0.1, threshold: 3, breached: false },
    ],
    owners: [
      { name: 'Atlas Fintech Group', percent: 72.0 },
      { name: 'Horizon Ventures', percent: 18.0 },
    ],
    campaigns: [
      { name: 'Atlas Launch Promo', channel: 'Digital', status: 'Completed', reach: '3.5M' },
      { name: 'Rewards Double Points', channel: 'Email + Push', status: 'Active', reach: '1.8M' },
    ],
  },
  {
    sortId: 'summit-demo',
    header: {
      companyName: 'Summit Neo Finance',
      location: 'Singapore',
      tag: ['Digital Bank', 'Cross-border', 'Wealth'],
      logoLink: '/images/defaultBank.svg',
      status: 'Live',
      website: 'https://summit.demo.local',
      following: false,
    },
    about: {
      ceo: 'Mei Lin Goh',
      companySize: '501–1000',
      establishedTime: '2020',
      founder: 'Summit Holdings Pte Ltd',
      revenue: 'SGD 92M',
      location: 'Singapore',
      bankSwift: 'SMTFSGSGXXX',
      bankCode: 'S201',
      numberOfUser: '600K+',
    },
    financials: {
      assets: 'SGD 28B',
      deposits: 'SGD 22.1B',
      loans: 'SGD 12.4B',
      leverage: '14.2x',
      netInterestSpread: '1.8%',
      roe: '1.8%',
      costToIncome: '91%',
      nplRatio: '0.6%',
    },
    quarterlyResults: [
      { period: 'Q1 2025', revenue: '20.5M', opex: '18.8M', netIncome: '1.2M', roe: '1.4%' },
      { period: 'Q2 2025', revenue: '21.8M', opex: '19.5M', netIncome: '1.6M', roe: '1.5%' },
      { period: 'Q3 2025', revenue: '23.9M', opex: '21.2M', netIncome: '1.9M', roe: '1.7%' },
      { period: 'Q4 2025', revenue: '25.8M', opex: '23.5M', netIncome: '1.6M', roe: '1.8%' },
    ],
    products: [
      { productName: 'Summit Global Account', productType: 'Account', productDescription: 'Multi-currency account with real-time FX conversion and zero markup on weekdays.', clientTag: 'Retail', customerSegment: 'retail' },
      { productName: 'Summit Wealth', productType: 'Investment', productDescription: 'Robo-advisory platform with ETF portfolios and automatic rebalancing.', clientTag: 'Investor', customerSegment: 'retail' },
      { productName: 'Summit Business Hub', productType: 'Account', productDescription: 'Cross-border business account with bulk payments and supplier management.', clientTag: 'SME', customerSegment: 'corporate' },
      { productName: 'Summit Trade Finance', productType: 'Loan', productDescription: 'Invoice financing and trade credit for SMEs with API-based document submission.', clientTag: 'SME', customerSegment: 'corporate' },
    ],
    management: [
      { name: 'Mei Lin Goh', title: 'Chief Executive Officer', background: 'Former Head of Digital Banking at OCBC; pioneer in ASEAN cross-border payments.', joinedAt: '2020-02-01' },
      { name: 'Raj Patel', title: 'Chief Product Officer', background: 'ex-TransferWise (Wise) APAC; built multi-currency wallet from 0 to 2M users.', joinedAt: '2020-05-15' },
      { name: 'Tomoko Saito', title: 'Chief Risk Officer', background: 'Former Basel III Implementation Lead at MAS-regulated bank; FRM certified.', joinedAt: '2021-03-01' },
    ],
    watchMetrics: [
      { label: 'Revenue', value: 92, unit: 'M', change: -3.2 },
      { label: 'ROE', value: 1.8, unit: '%', change: -1.8, threshold: 5, breached: true },
      { label: 'NPL Ratio', value: 0.6, unit: '%', change: -0.2 },
    ],
    owners: [
      { name: 'Summit Holdings Pte Ltd', percent: 55.0 },
      { name: 'Temasek Digital', percent: 30.0 },
    ],
    campaigns: [
      { name: 'Summit Cross-border Launch', channel: 'Fintech Conference', status: 'Completed', reach: '500K' },
      { name: 'Wealth Robo Advisor Promo', channel: 'Social + YouTube', status: 'Active', reach: '1.2M' },
    ],
  },
  {
    sortId: 'harbor-demo',
    header: {
      companyName: 'Harbor Future Bank',
      location: 'Hong Kong',
      tag: ['Digital Bank', 'Green Finance', 'ESG'],
      logoLink: '/images/defaultBank.svg',
      status: 'Live',
      website: 'https://harbor.demo.local',
      following: false,
    },
    about: {
      ceo: 'David Kwok',
      companySize: '101–200',
      establishedTime: '2021',
      founder: 'Harbor Green Capital',
      revenue: 'HKD 45.3M',
      location: 'Hong Kong',
      bankSwift: 'HBFBHKHHXXX',
      bankCode: '402',
      numberOfUser: '180K+',
    },
    financials: {
      assets: 'HKD 5.2B',
      deposits: 'HKD 3.8B',
      loans: 'HKD 1.6B',
      leverage: '10.4x',
      netInterestSpread: '2.4%',
      roe: '2.1%',
      costToIncome: '88%',
      nplRatio: '3.5%',
    },
    quarterlyResults: [
      { period: 'Q1 2025', revenue: '10.2M', opex: '9.1M', netIncome: '0.8M', roe: '1.6%' },
      { period: 'Q2 2025', revenue: '10.8M', opex: '9.4M', netIncome: '1.0M', roe: '1.9%' },
      { period: 'Q3 2025', revenue: '11.5M', opex: '10.1M', netIncome: '1.0M', roe: '2.0%' },
      { period: 'Q4 2025', revenue: '12.8M', opex: '11.0M', netIncome: '1.2M', roe: '2.1%' },
    ],
    products: [
      { productName: 'Harbor Green Account', productType: 'Account', productDescription: 'Carbon-tracking current account with tree-planting rewards for low-emission spending.', clientTag: 'Retail', customerSegment: 'retail' },
      { productName: 'Harbor ESG Deposit', productType: 'Deposit', productDescription: 'Green term deposits funding verified sustainability projects with above-market rates.', clientTag: 'Savings', customerSegment: 'retail' },
      { productName: 'Harbor Green Loan', productType: 'Loan', productDescription: 'Preferential-rate personal loans for EV purchases, solar panels, and home energy upgrades.', clientTag: 'Retail', customerSegment: 'retail' },
      { productName: 'Harbor ESG Corporate', productType: 'Account', productDescription: 'ESG-linked business account with sustainability reporting dashboard and carbon credit trading.', clientTag: 'SME', customerSegment: 'corporate' },
    ],
    management: [
      { name: 'David Kwok', title: 'Chief Executive Officer', background: 'Former Head of Sustainability at Bank of East Asia; 12 years in green finance.', joinedAt: '2021-01-10' },
      { name: 'Amanda Lee', title: 'Chief Sustainability Officer', background: 'ex-HKGFA; led HK Green Bond Framework development; CFA charterholder.', joinedAt: '2021-04-01' },
      { name: 'Raymond Fung', title: 'Chief Technology Officer', background: 'Former Lead Engineer at WeLab; built lending platform serving 50M+ users.', joinedAt: '2021-06-15' },
    ],
    watchMetrics: [
      { label: 'Revenue', value: 45.3, unit: 'M', change: -3.2 },
      { label: 'ROE', value: 2.1, unit: '%', change: -1.8, threshold: 5, breached: true },
      { label: 'NPL Ratio', value: 3.5, unit: '%', change: 0.7, threshold: 3, breached: true },
    ],
    owners: [
      { name: 'Harbor Green Capital', percent: 80.0 },
      { name: 'ESG Impact Fund', percent: 15.0 },
    ],
    campaigns: [
      { name: 'Green Banking Launch', channel: 'ESG Events', status: 'Completed', reach: '200K' },
      { name: 'Carbon Tracker Campaign', channel: 'Social + App', status: 'Active', reach: '350K' },
      { name: 'EV Loan Promo', channel: 'Partner dealerships', status: 'Planned', reach: '—' },
    ],
  },
];

export function getMockBank(sortId: string): MockBankData | undefined {
  return MOCK_BANKS.find((b) => b.sortId === sortId);
}

export function getAllMockBanks(): MockBankData[] {
  return MOCK_BANKS;
}

export function getMockBankNames(): { sortId: string; name: string }[] {
  return MOCK_BANKS.map((b) => ({ sortId: b.sortId, name: b.header.companyName }));
}
