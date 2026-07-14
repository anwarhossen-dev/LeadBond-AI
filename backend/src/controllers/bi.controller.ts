import { Request, Response } from 'express';
import prisma from '../prisma';

// ─── helpers ───────────────────────────────────────────────────────────────

const rnd = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

const pickOne = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

// ─── 1. Business Profile Analysis ──────────────────────────────────────────

export const getBusinessProfile = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const company = await prisma.company.findUnique({
      where: { id },
      include: { leadScores: { orderBy: { scoredAt: 'desc' }, take: 1 } }
    });
    if (!company) return res.status(404).json({ error: 'Company not found' });

    const companyTypes = ['Startup', 'SME', 'Enterprise', 'Government'];
    const businessModels = ['B2B', 'B2C', 'D2C', 'SaaS', 'Marketplace'];
    const fundingStatuses = ['Bootstrapped', 'Seed', 'Series A', 'Series B', 'IPO', 'Private Equity'];

    const profile = {
      companyType: pickOne(companyTypes),
      businessModel: pickOne(businessModels),
      industry: company.industry,
      subIndustry: 'Enterprise Software',
      yearsInBusiness: rnd(2, 25),
      employeeGrowth: parseFloat((Math.random() * 40 - 5).toFixed(1)),
      revenueEstimate: `$${rnd(1, 50)}M`,
      fundingStatus: pickOne(fundingStatuses),
      branchCount: rnd(1, 20),
      marketPresence: 'Regional',
      digitalPresenceScore: rnd(55, 98),
      websiteQualityScore: rnd(60, 95),
      socialMediaActivity: pickOne(['Very Active', 'Active', 'Moderate', 'Low']),
      hiringActivity: rnd(30, 100),
      expansionScore: rnd(40, 95),
      businessRiskScore: rnd(10, 60),
    };

    res.json(profile);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// ─── 2. Product Intelligence ────────────────────────────────────────────────

export const getProductIntelligence = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const company = await prisma.company.findUnique({ where: { id } });
    if (!company) return res.status(404).json({ error: 'Company not found' });

    const sampleProducts = [
      { name: 'CRM Pro', category: 'CRM Software', isBestSeller: true, isPremium: true, isNewLaunch: false, availability: 'In Stock', rating: 4.7, reviewsCount: 312, growthRate: 28, demandLevel: 'High' },
      { name: 'HRHub HRMS', category: 'HR Software', isBestSeller: false, isPremium: true, isNewLaunch: true, availability: 'In Stock', rating: 4.5, reviewsCount: 198, growthRate: 35, demandLevel: 'High' },
      { name: 'InventPro', category: 'Inventory', isBestSeller: false, isPremium: false, isNewLaunch: false, availability: 'Limited', rating: 3.9, reviewsCount: 87, growthRate: 5, demandLevel: 'Medium' },
      { name: 'MobileApp v2', category: 'Mobile Apps', isBestSeller: false, isPremium: false, isNewLaunch: false, availability: 'Beta', rating: 3.2, reviewsCount: 44, growthRate: -3, demandLevel: 'Low' },
    ];

    res.json({
      portfolioScore: rnd(78, 95),
      bestCategory: 'HR Software',
      weakCategory: 'Mobile Apps',
      recommendation: 'Expand ERP Integration and invest in mobile-first strategy',
      skuCount: rnd(12, 80),
      priceRangeMin: 49,
      priceRangeMax: 4999,
      products: sampleProducts,
      aiSummary: `${company.companyName} maintains a strong product portfolio with growing demand in HR and CRM verticals. Mobile segment needs investment.`,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// ─── 3. Sales Intelligence ──────────────────────────────────────────────────

export const getSalesIntelligence = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const company = await prisma.company.findUnique({ where: { id } });
    if (!company) return res.status(404).json({ error: 'Company not found' });

    const monthlyBase = rnd(80, 600) * 1000;
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const monthly = months.map(m => ({ month: m, revenue: Math.round(monthlyBase * (0.8 + Math.random() * 0.5)) }));
    const quarterly = [
      { quarter: 'Q1', revenue: monthly.slice(0,3).reduce((a,b) => a + b.revenue, 0) },
      { quarter: 'Q2', revenue: monthly.slice(3,6).reduce((a,b) => a + b.revenue, 0) },
      { quarter: 'Q3', revenue: monthly.slice(6,9).reduce((a,b) => a + b.revenue, 0) },
      { quarter: 'Q4', revenue: monthly.slice(9,12).reduce((a,b) => a + b.revenue, 0) },
    ];

    res.json({
      estimatedMonthlyRevenue: monthlyBase,
      estimatedAnnualRevenue: monthlyBase * 12,
      salesGrowthPct: parseFloat((Math.random() * 45 + 5).toFixed(1)),
      salesDeclinePct: parseFloat((Math.random() * 5).toFixed(1)),
      revenueTrend: pickOne(['Upward', 'Stable', 'Downward']),
      seasonalSales: 'Q4 peak — Oct to Dec',
      repeatCustomerRate: parseFloat((Math.random() * 40 + 35).toFixed(1)),
      conversionRate: parseFloat((Math.random() * 10 + 3).toFixed(1)),
      averageOrderValue: rnd(800, 12000),
      customerLifetimeValue: rnd(5000, 80000),
      leadConversion: parseFloat((Math.random() * 15 + 5).toFixed(1)),
      salesVelocity: parseFloat((Math.random() * 30 + 10).toFixed(1)),
      forecast30Days: Math.round(monthlyBase * 1.05),
      forecast60Days: Math.round(monthlyBase * 2.1),
      forecast90Days: Math.round(monthlyBase * 3.2),
      forecast365Days: Math.round(monthlyBase * 13),
      monthlySalesData: monthly,
      quarterlySalesData: quarterly,
      yearlySalesData: [{ year: 2023, revenue: monthlyBase * 11 }, { year: 2024, revenue: monthlyBase * 12.5 }, { year: 2025, revenue: monthlyBase * 14 }],
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// ─── 4. Business Growth Report ──────────────────────────────────────────────

export const getGrowthReport = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const company = await prisma.company.findUnique({ where: { id } });
    if (!company) return res.status(404).json({ error: 'Company not found' });

    const growth = rnd(65, 95);
    const finance = rnd(60, 90);
    const marketing = rnd(70, 98);
    const technology = rnd(75, 99);
    const overall = Math.round((growth + finance + marketing + technology) / 4);

    res.json({ growth, finance, marketing, technology, overall });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// ─── 5. Market Trend Analysis ───────────────────────────────────────────────

export const getMarketTrends = async (_req: Request, res: Response) => {
  try {
    const growing = ['AI Software', 'Cyber Security', 'Cloud Computing', 'EV & Clean Energy', 'Healthcare Tech', 'EdTech'];
    const declining = ['DVD & Physical Media', 'Traditional Printing', 'Fax Services', 'Legacy IT Hardware'];
    res.json({ growing, declining, lastUpdated: new Date().toISOString() });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// ─── 6. Competitor Analysis ─────────────────────────────────────────────────

export const getCompetitorAnalysis = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const company = await prisma.company.findUnique({ where: { id } });
    if (!company) return res.status(404).json({ error: 'Company not found' });

    const competitors = [
      {
        name: 'CompetitorA Corp',
        website: 'https://competitora.com',
        revenue: `$${rnd(10, 100)}M`,
        employees: rnd(100, 2000),
        productsCount: rnd(5, 30),
        marketShare: parseFloat((Math.random() * 20 + 5).toFixed(1)),
        pricingStrategy: pickOne(['Premium', 'Competitive', 'Penetration', 'Freemium']),
        hiringTrend: pickOne(['Growing', 'Stable', 'Declining']),
      },
      {
        name: 'RivalTech Solutions',
        website: 'https://rivaltech.io',
        revenue: `$${rnd(5, 60)}M`,
        employees: rnd(50, 800),
        productsCount: rnd(3, 15),
        marketShare: parseFloat((Math.random() * 15 + 2).toFixed(1)),
        pricingStrategy: pickOne(['Value', 'Competitive', 'Freemium']),
        hiringTrend: pickOne(['Growing', 'Stable']),
      },
    ];

    res.json({
      companyName: company.companyName,
      competitors,
      aiRecommendation: 'Competitor is growing faster in hiring. Recommend increasing digital marketing spend and accelerating product launches.',
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// ─── 7. Customer Analysis ────────────────────────────────────────────────────

export const getCustomerAnalysis = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const company = await prisma.company.findUnique({ where: { id } });
    if (!company) return res.status(404).json({ error: 'Company not found' });

    res.json({
      targetAudience: 'Mid-market B2B Companies',
      customerSegment: 'Enterprise & SMB',
      primaryCountry: company.country || 'USA',
      genderDemographic: 'Mixed',
      ageGroup: '28-45',
      incomeLevel: 'High ($100K+)',
      buyingBehavior: 'Annual contracts, procurement-driven',
      engagementScore: rnd(65, 95),
      churnRate: parseFloat((Math.random() * 15 + 3).toFixed(1)),
      predictedChurnRate: parseFloat((Math.random() * 12 + 2).toFixed(1)),
      loyaltyScore: rnd(60, 92),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// ─── 8. Lead Scoring ────────────────────────────────────────────────────────

export const getLeadScoring = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const company = await prisma.company.findUnique({
      where: { id },
      include: { leadScores: { orderBy: { scoredAt: 'desc' }, take: 1 } }
    });
    if (!company) return res.status(404).json({ error: 'Company not found' });

    const score = company.leadScores[0]?.aiScore ?? rnd(60, 99);
    const isHot = score >= 80;

    res.json({
      leadScore: score,
      tier: score >= 90 ? 'Hot Lead' : score >= 70 ? 'Warm Lead' : 'Cold Lead',
      isHot,
      reasons: [
        'Recently expanded hiring by 30%+',
        'Estimated revenue growing 20%+ YoY',
        'New office opening signals',
        'High website traffic spike detected',
        'Active social media engagement',
      ].slice(0, rnd(2, 5)),
      scoredAt: company.leadScores[0]?.scoredAt ?? new Date(),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// ─── 9. ICP Matching ────────────────────────────────────────────────────────

export const getIcpMatch = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const company = await prisma.company.findUnique({ where: { id } });
    if (!company) return res.status(404).json({ error: 'Company not found' });

    res.json({
      matchScore: rnd(70, 99),
      targetIndustry: company.industry,
      employeeRange: '100 – 500',
      revenueMin: '$10M+',
      targetCountry: company.country || 'USA',
      matchReason: `${company.companyName} aligns strongly with your ideal customer profile based on industry, size, and revenue signals.`,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// ─── 10. SWOT Analysis ──────────────────────────────────────────────────────

export const getSwotAnalysis = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const company = await prisma.company.findUnique({ where: { id } });
    if (!company) return res.status(404).json({ error: 'Company not found' });

    res.json({
      strengths: ['Large and growing customer base', 'Strong brand recognition', 'Diverse product portfolio', 'Robust technical infrastructure'],
      weaknesses: ['Low hiring velocity in Q2', 'Weak mobile SEO performance', 'Limited international presence', 'High customer acquisition cost'],
      opportunities: ['AI integration across product line', 'Global market expansion', 'Strategic partnership potential', 'Untapped SMB market segment'],
      threats: ['Growing competitor funding rounds', 'Market saturation in core segment', 'Regulatory compliance changes', 'Economic downturn risk'],
      generatedAt: new Date().toISOString(),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// ─── 11. Financial Intelligence ─────────────────────────────────────────────

export const getFinancialIntelligence = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const company = await prisma.company.findUnique({ where: { id } });
    if (!company) return res.status(404).json({ error: 'Company not found' });

    const revenue = rnd(5, 100) * 1000000;
    const expenses = Math.round(revenue * (0.55 + Math.random() * 0.2));
    const profit = revenue - expenses;
    const ebitda = Math.round(profit * 1.15);

    res.json({
      revenue,
      profit,
      expenses,
      ebitda,
      cashFlow: Math.round(profit * 0.85),
      fundingTotal: rnd(0, 50) * 1000000,
      investors: ['Sequoia Capital', 'Andreessen Horowitz', 'SoftBank'].slice(0, rnd(0, 3)),
      growthRate: parseFloat((Math.random() * 35 + 5).toFixed(1)),
      burnRate: rnd(50000, 500000),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// ─── 12. Hiring Intelligence ────────────────────────────────────────────────

export const getHiringIntelligence = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const company = await prisma.company.findUnique({
      where: { id },
      include: { jobPostings: { orderBy: { postedDate: 'desc' }, take: 10 } }
    });
    if (!company) return res.status(404).json({ error: 'Company not found' });

    const departments = ['Engineering', 'Sales', 'Marketing', 'Operations', 'HR', 'Finance'];
    const depGrowth = departments.map(d => ({ department: d, openRoles: rnd(1, 15), trend: pickOne(['Growing', 'Stable', 'Declining']) }));

    res.json({
      openJobs: company.jobPostings.length || rnd(5, 40),
      hiringTrend: pickOne(['Rapidly Growing', 'Growing', 'Stable', 'Contracting']),
      remoteHiring: rnd(20, 70),
      salaryRange: '$60K – $180K',
      topSkillDemand: ['TypeScript', 'React', 'Node.js', 'AWS', 'Product Management'].slice(0, rnd(3, 5)),
      departmentGrowth: depGrowth,
      recentJobs: company.jobPostings.slice(0, 5),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// ─── 13. Technology Analysis ────────────────────────────────────────────────

export const getTechnologyAnalysis = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const company = await prisma.company.findUnique({ where: { id } });
    if (!company) return res.status(404).json({ error: 'Company not found' });

    const allFrameworks = ['React', 'Next.js', 'Vue.js', 'Angular', 'Laravel', 'ASP.NET', 'Spring Boot'];
    const allCloud = ['AWS', 'Azure', 'GCP'];
    const allDevOps = ['Docker', 'Kubernetes', 'Terraform', 'GitHub Actions'];
    const allPayments = ['Stripe', 'PayPal', 'Braintree'];
    const allEcomm = ['Shopify', 'WooCommerce', 'Magento'];

    const pick = (arr: string[], count: number) => arr.sort(() => 0.5 - Math.random()).slice(0, count);

    res.json({
      languages: pick(['PHP', 'Node.js', 'Python', 'Java', 'Go', 'Ruby'], rnd(2, 4)),
      frameworks: pick(allFrameworks, rnd(2, 4)),
      cloudProviders: pick(allCloud, rnd(1, 2)),
      devOps: pick(allDevOps, rnd(1, 3)),
      security: ['Cloudflare', 'SSL/TLS'].slice(0, rnd(1, 2)),
      eCommerce: pick(allEcomm, rnd(0, 2)),
      paymentGateways: pick(allPayments, rnd(1, 2)),
      detectedAt: new Date().toISOString(),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// ─── 14. Website Analysis ───────────────────────────────────────────────────

export const getWebsiteAnalysis = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const company = await prisma.company.findUnique({ where: { id } });
    if (!company) return res.status(404).json({ error: 'Company not found' });

    res.json({
      performance: rnd(60, 98),
      seoScore: rnd(55, 95),
      mobileFriendly: Math.random() > 0.2,
      accessibility: rnd(50, 95),
      sslActive: Math.random() > 0.05,
      domainAgeYears: parseFloat((Math.random() * 20 + 1).toFixed(1)),
      securityHeaders: ['X-Frame-Options', 'X-XSS-Protection', 'Content-Security-Policy', 'HSTS'].slice(0, rnd(2, 4)),
      pageSpeedMs: rnd(400, 3500),
      lighthouseScore: rnd(60, 98),
      scannedAt: new Date().toISOString(),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// ─── 15. Marketing Intelligence ─────────────────────────────────────────────

export const getMarketingIntelligence = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const company = await prisma.company.findUnique({ where: { id } });
    if (!company) return res.status(404).json({ error: 'Company not found' });

    res.json({
      seoScore: rnd(50, 95),
      backlinksCount: rnd(200, 15000),
      organicTraffic: rnd(5000, 500000),
      hasPaidAds: Math.random() > 0.3,
      activeChannels: ['Google Ads', 'Facebook Ads', 'LinkedIn Campaigns', 'Email Marketing'].slice(0, rnd(1, 4)),
      socialEngagement: pickOne(['High', 'Medium', 'Low']),
      emailMarketingScore: rnd(40, 90),
      brandMentionsCount: rnd(100, 10000),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// ─── 16. Sales Opportunity ──────────────────────────────────────────────────

export const getSalesOpportunity = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const company = await prisma.company.findUnique({ where: { id } });
    if (!company) return res.status(404).json({ error: 'Company not found' });

    res.json({
      opportunities: [
        { product: 'ERP', level: 'High', reason: 'Company has 200+ employees and manual processes' },
        { product: 'CRM', level: 'High', reason: 'Growing sales team with no centralized lead management' },
        { product: 'HRMS', level: 'High', reason: 'Rapid hiring indicates HR automation need' },
        { product: 'Inventory Management', level: 'Medium', reason: 'Multi-branch operation detected' },
        { product: 'Accounting Software', level: 'Low', reason: 'Possible existing accounting solution' },
      ],
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// ─── 17. Risk Analysis ──────────────────────────────────────────────────────

export const getRiskAnalysis = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const company = await prisma.company.findUnique({ where: { id } });
    if (!company) return res.status(404).json({ error: 'Company not found' });

    const levels: ('Low' | 'Medium' | 'High')[] = ['Low', 'Medium', 'High'];
    const pick = () => pickOne(levels);
    const scores = [rnd(10, 40), rnd(10, 50), rnd(10, 40), rnd(5, 30), rnd(15, 55), rnd(10, 45)];
    const overall = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);

    res.json({
      bankruptcyRisk: pick(),
      financialRisk: pick(),
      hiringRisk: pick(),
      complianceRisk: pick(),
      cyberRisk: pick(),
      marketRisk: pick(),
      overallRiskScore: overall,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// ─── 18. AI Recommendation Engine ───────────────────────────────────────────

export const getAiRecommendations = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const company = await prisma.company.findUnique({ where: { id } });
    if (!company) return res.status(404).json({ error: 'Company not found' });

    res.json({
      companyName: company.companyName,
      hiringGrowthPulse: `${company.companyName} has increased hiring by ${rnd(20, 60)}% in the last 90 days.`,
      revenueGrowthPulse: `Revenue estimated to grow ${rnd(10, 35)}% based on expansion signals.`,
      suitableSolution: 'Enterprise CRM + HRMS Bundle',
      recommendedProduct: 'LeadBond HRMS',
      nextBestAction: 'Schedule discovery call — decision maker is active on LinkedIn.',
      confidenceScore: rnd(85, 99),
      opportunityMatrix: { ERP: 'High', CRM: 'High', HRMS: 'High', Inventory: 'Medium', Accounting: 'Low' },
      emailOutreach: `Subject: Scaling ${company.companyName}'s operations with LeadBond AI\n\nHi [Name],\n\nI noticed ${company.companyName} is rapidly expanding its team and operations. LeadBond AI can streamline your CRM, HR, and sales workflows in one unified platform.\n\nOpen to a 15-minute call this week?\n\nBest,\n[Your Name]`,
      generatedAt: new Date().toISOString(),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// ─── 19. Full Company BI Report (combined) ───────────────────────────────────

export const getFullBiReport = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const company = await prisma.company.findUnique({
      where: { id },
      include: {
        contacts: true,
        leadScores: { orderBy: { scoredAt: 'desc' }, take: 1 },
        jobPostings: { orderBy: { postedDate: 'desc' }, take: 5 },
        followups: { orderBy: { followUpDate: 'asc' }, take: 3 },
      }
    });
    if (!company) return res.status(404).json({ error: 'Company not found' });

    res.json({
      id: company.id,
      companyName: company.companyName,
      industry: company.industry,
      website: company.website,
      country: company.country,
      contacts: company.contacts,
      latestScore: company.leadScores[0] ?? null,
      recentJobs: company.jobPostings,
      followups: company.followups,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
