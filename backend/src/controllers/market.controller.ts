import { Request, Response } from 'express';

const rnd = (a: number, b: number) => Math.floor(Math.random() * (b - a + 1)) + a;
const pick = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

const INDUSTRIES = [
  { name: 'AI & Machine Learning', growth: 42, size: '$150B', competition: 'High', hiring: 'Rapidly Growing', opportunity: 'Very High', risk: 'Medium' },
  { name: 'Cybersecurity', growth: 35, size: '$250B', competition: 'High', hiring: 'Growing', opportunity: 'Very High', risk: 'Low' },
  { name: 'Cloud Computing', growth: 28, size: '$600B', competition: 'Very High', hiring: 'Growing', opportunity: 'High', risk: 'Low' },
  { name: 'HealthTech / MedTech', growth: 24, size: '$300B', competition: 'Medium', hiring: 'Growing', opportunity: 'High', risk: 'Medium' },
  { name: 'FinTech', growth: 22, size: '$400B', competition: 'High', hiring: 'Stable', opportunity: 'High', risk: 'Medium' },
  { name: 'EdTech', growth: 18, size: '$120B', competition: 'Medium', hiring: 'Growing', opportunity: 'High', risk: 'Medium' },
  { name: 'Renewable Energy / EV', growth: 30, size: '$900B', competition: 'Medium', hiring: 'Growing', opportunity: 'Very High', risk: 'Medium' },
  { name: 'Logistics & Supply Chain', growth: 15, size: '$500B', competition: 'Medium', hiring: 'Stable', opportunity: 'Medium', risk: 'Low' },
  { name: 'SaaS / B2B Software', growth: 20, size: '$200B', competition: 'Very High', hiring: 'Growing', opportunity: 'High', risk: 'Low' },
  { name: 'E-Commerce', growth: 12, size: '$5T', competition: 'Very High', hiring: 'Stable', opportunity: 'Medium', risk: 'High' },
  { name: 'Traditional Printing', growth: -8, size: '$250B', competition: 'Medium', hiring: 'Declining', opportunity: 'Low', risk: 'High' },
  { name: 'DVD / Physical Media', growth: -25, size: '$10B', competition: 'Low', hiring: 'Declining', opportunity: 'Very Low', risk: 'Very High' },
  { name: 'Fax Services', growth: -18, size: '$3B', competition: 'Low', hiring: 'Declining', opportunity: 'Very Low', risk: 'Very High' },
];

// ─── Industry Reports ──────────────────────────────────────────────────────

export const getIndustryReports = async (_req: Request, res: Response) => {
  try {
    res.json(INDUSTRIES);
  } catch (err) { console.error(err); res.status(500).json({ error: 'Internal Server Error' }); }
};

export const getIndustryDetail = async (req: Request, res: Response) => {
  try {
    const { name } = req.params;
    const industry = INDUSTRIES.find(i => i.name.toLowerCase().includes(decodeURIComponent(name).toLowerCase())) || INDUSTRIES[0];

    res.json({
      ...industry,
      topCompanies: ['Company Alpha', 'Tech Giant Corp', 'Innovate LLC', 'Global Solutions', 'NextGen Systems'],
      emergingCompanies: ['StartupX', 'DisruptAI', 'NovaTech', 'QuickScale'],
      marketOpportunities: ['Enterprise automation', 'SMB digitisation', 'Emerging market expansion', 'AI integration'],
      risks: ['Regulatory changes', 'Economic downturn', 'Talent shortage', 'Technology disruption'],
      skillsInDemand: ['Python', 'Cloud Architecture', 'Product Management', 'Data Science', 'DevOps'],
      techAdoption: rnd(55, 95),
      fiveYearOutlook: industry.growth > 0 ? 'Positive — continued growth expected' : 'Declining — market contraction likely',
    });
  } catch (err) { console.error(err); res.status(500).json({ error: 'Internal Server Error' }); }
};

// ─── Business Opportunity Finder ───────────────────────────────────────────

export const getBusinessOpportunities = async (req: Request, res: Response) => {
  try {
    const { country, industry } = req.query;

    const opportunities = [
      { title: 'SaaS HR Platform', country: country || 'USA', industry: 'HR Technology', demand: 'Very High', competition: 'Medium', entryBarrier: 'Medium', potential: '$50M-$500M', timeToMarket: '6-12 months', recommendation: 'Strong opportunity — growing remote workforce driving demand' },
      { title: 'AI Sales CRM', country: country || 'Global', industry: 'CRM / SaaS', demand: 'High', competition: 'High', entryBarrier: 'Low', potential: '$100M+', timeToMarket: '3-6 months', recommendation: 'Differentiate with vertical-specific AI features' },
      { title: 'Cybersecurity Audit Tool', country: country || 'Europe', industry: 'Cybersecurity', demand: 'Very High', competition: 'Medium', entryBarrier: 'High', potential: '$20M-$200M', timeToMarket: '12-18 months', recommendation: 'Compliance regulations driving adoption' },
      { title: 'EdTech LMS Platform', country: country || 'Asia', industry: 'Education', demand: 'High', competition: 'Medium', entryBarrier: 'Low', potential: '$10M-$100M', timeToMarket: '4-8 months', recommendation: 'Post-pandemic hybrid learning adoption' },
      { title: 'Supply Chain Visibility SaaS', country: country || 'Global', industry: 'Logistics', demand: 'High', competition: 'Low', entryBarrier: 'Medium', potential: '$50M+', timeToMarket: '8-12 months', recommendation: 'Major pain point with limited quality solutions' },
    ];

    res.json({ opportunities, growingMarkets: INDUSTRIES.filter(i => i.growth > 0).slice(0, 8), decliningMarkets: INDUSTRIES.filter(i => i.growth < 0) });
  } catch (err) { console.error(err); res.status(500).json({ error: 'Internal Server Error' }); }
};

// ─── Country Market Analysis ───────────────────────────────────────────────

export const getCountryMarket = async (req: Request, res: Response) => {
  try {
    const countries = [
      { country: 'USA', gdpGrowth: 2.5, techSpend: '$1.8T', topIndustries: ['AI/ML', 'SaaS', 'FinTech', 'HealthTech'], talentPool: 'Large', businessClimate: 'Excellent', recommendedSectors: ['AI Software', 'Cybersecurity', 'HR Tech'] },
      { country: 'Canada', gdpGrowth: 2.1, techSpend: '$120B', topIndustries: ['AI', 'Clean Energy', 'FinTech'], talentPool: 'Large', businessClimate: 'Excellent', recommendedSectors: ['CleanTech', 'AI', 'EdTech'] },
      { country: 'UK', gdpGrowth: 1.8, techSpend: '$200B', topIndustries: ['FinTech', 'AI', 'Creative Tech'], talentPool: 'Large', businessClimate: 'Good', recommendedSectors: ['FinTech', 'LegalTech', 'HealthTech'] },
      { country: 'Bangladesh', gdpGrowth: 6.2, techSpend: '$5B', topIndustries: ['RMG', 'IT Services', 'FinTech'], talentPool: 'Growing', businessClimate: 'Improving', recommendedSectors: ['SaaS HR', 'ERP', 'EdTech', 'FinTech'] },
      { country: 'India', gdpGrowth: 7.0, techSpend: '$120B', topIndustries: ['IT Services', 'SaaS', 'FinTech', 'EdTech'], talentPool: 'Very Large', businessClimate: 'Good', recommendedSectors: ['SaaS', 'AI', 'HealthTech'] },
    ];
    res.json(countries);
  } catch (err) { console.error(err); res.status(500).json({ error: 'Internal Server Error' }); }
};

// ─── Growth Prediction ─────────────────────────────────────────────────────

export const getGrowthPrediction = async (req: Request, res: Response) => {
  try {
    const { industry } = req.query;
    const ind = INDUSTRIES.find(i => i.name.toLowerCase().includes((industry as string || '').toLowerCase())) || INDUSTRIES[0];

    res.json({
      industry: ind.name,
      currentGrowth: `${ind.growth}%`,
      prediction1Year: `${ind.growth + rnd(-3, 5)}%`,
      prediction3Year: `${ind.growth + rnd(-5, 10)}%`,
      prediction5Year: `${ind.growth + rnd(-8, 15)}%`,
      growthProbability: ind.growth > 0 ? rnd(65, 90) : rnd(10, 30),
      signals: {
        hiringMomentum: pick(['Strong', 'Moderate', 'Weak']),
        fundingActivity: pick(['Very Active', 'Active', 'Moderate', 'Low']),
        patentFilings: pick(['High', 'Medium', 'Low']),
        startupActivity: pick(['Booming', 'Active', 'Slow']),
      },
      businessHealthScore: rnd(60, 95),
      expansionSignals: ind.growth > 15 ? ['New market entries', 'VC funding surge', 'Talent migration', 'Corporate M&A activity'] : ['Consolidation underway', 'Cost optimization focus'],
    });
  } catch (err) { console.error(err); res.status(500).json({ error: 'Internal Server Error' }); }
};

// ─── AI Business Advisor ───────────────────────────────────────────────────

export const askBusinessAdvisor = async (req: Request, res: Response) => {
  try {
    const { question } = req.body;
    if (!question) return res.status(400).json({ error: 'question is required' });

    const q = question.toLowerCase();
    let answer = '';

    if (q.includes('saas') || q.includes('software')) {
      answer = 'The SaaS market is experiencing strong growth at 20%+ annually. Key opportunities include vertical SaaS (industry-specific solutions), AI-first products, and SMB-focused tools. The global SaaS market is projected to reach $700B+ by 2030.';
    } else if (q.includes('bangladesh') || q.includes('bd')) {
      answer = 'Bangladesh presents excellent opportunities in: HR & Payroll SaaS (rapid workforce formalisation), EdTech (large youth population), FinTech (mobile banking growth), and ERP for SMEs. The digital economy is growing at 15%+ annually.';
    } else if (q.includes('canada')) {
      answer = 'Canada has strong demand for: AI/ML solutions (government-backed AI strategy), Clean Energy Tech (net-zero commitments), HR Tech for remote teams, and Healthcare IT. The market is welcoming to international SaaS companies.';
    } else if (q.includes('hiring') || q.includes('talent')) {
      answer = 'Current high-demand roles globally: AI/ML Engineers (+85% YoY), Data Scientists (+45%), Cybersecurity Specialists (+65%), Cloud Architects (+40%), Product Managers (+30%). Remote hiring has expanded the global talent pool significantly.';
    } else if (q.includes('ai') || q.includes('artificial intelligence')) {
      answer = 'AI adoption is at an inflection point. B2B AI tools, AI-powered CRM, AI recruiting, and AI document generation are all seeing 3-5x growth. Enterprise AI spend is forecast to exceed $1T by 2027. Key differentiators: domain-specific training, data privacy, and integration ecosystem.';
    } else {
      answer = `Based on current market intelligence, the topic "${question}" intersects with several growing sectors. Key considerations: market size, competition intensity, technology adoption curve, and regulatory environment. I recommend conducting a detailed SWOT analysis and ICP definition before market entry.`;
    }

    res.json({ question, answer, generatedAt: new Date().toISOString(), disclaimer: 'AI-generated market intelligence — not professional financial advice.' });
  } catch (err) { console.error(err); res.status(500).json({ error: 'Internal Server Error' }); }
};

// ─── Weekly Market Report ─────────────────────────────────────────────────

export const getWeeklyReport = async (_req: Request, res: Response) => {
  try {
    res.json({
      weekOf: new Date().toLocaleDateString(),
      headlines: [
        { sector: 'AI Software', event: 'Global AI investment reaches record $50B in Q1', sentiment: 'Positive' },
        { sector: 'Cybersecurity', event: 'Major data breach drives 40% spike in enterprise security spending', sentiment: 'Positive' },
        { sector: 'SaaS', event: 'SMB SaaS adoption up 28% — SMEs shifting from legacy to cloud', sentiment: 'Positive' },
        { sector: 'Traditional Printing', event: 'Industry revenue down 12% as digital transformation accelerates', sentiment: 'Negative' },
        { sector: 'EV & Clean Energy', event: 'New government subsidies announced for EV fleet transitions', sentiment: 'Positive' },
      ],
      topGrowthSectors: INDUSTRIES.filter(i => i.growth > 20).map(i => i.name),
      hiringHotspots: ['San Francisco', 'London', 'Bangalore', 'Toronto', 'Berlin'],
      emergingOpportunities: ['AI Compliance Tools', 'Remote Work Infrastructure', 'Health Data Analytics'],
    });
  } catch (err) { console.error(err); res.status(500).json({ error: 'Internal Server Error' }); }
};
