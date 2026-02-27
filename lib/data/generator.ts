// lib/data/generator.ts
import { Company, Signal, SectorTag, FundingStage, HeadcountRange } from '@/lib/types'

// Realistic name components for generating company names
const NAME_PREFIXES = [
  'Aether', 'Nova', 'Pulse', 'Vertex', 'Synth', 'Flux', 'Nexus', 'Apex', 'Zeta', 'Arc',
  'Helix', 'Prism', 'Quantum', 'Cipher', 'Velo', 'Stratum', 'Nimbus', 'Cortex', 'Axiom', 'Forge',
  'Catalyst', 'Vector', 'Orion', 'Zenith', 'Kinetic', 'Aspect', 'Lumina', 'Sparq', 'Tensor', 'Halo',
  'Onyx', 'Ember', 'Crystal', 'Sigma', 'Delta', 'Omega', 'Alpha', 'Beta', 'Gamma', 'Theta',
  'Lunar', 'Solar', 'Stellar', 'Cosmic', 'Atomic', 'Photon', 'Neutron', 'Proton', 'Electron', 'Quark',
  'River', 'Ocean', 'Storm', 'Thunder', 'Lightning', 'Frost', 'Blaze', 'Terra', 'Aqua', 'Aero',
  'Blue', 'Green', 'Red', 'Silver', 'Golden', 'Iron', 'Steel', 'Carbon', 'Platinum', 'Titanium',
  'North', 'South', 'East', 'West', 'Central', 'Global', 'Metro', 'Urban', 'Rural', 'Civic',
  'Smart', 'Deep', 'Open', 'Clear', 'Pure', 'True', 'Fast', 'Swift', 'Rapid', 'Agile',
  'Cloud', 'Edge', 'Core', 'Node', 'Link', 'Hub', 'Net', 'Web', 'Grid', 'Stack'
]

const NAME_SUFFIXES = [
  'AI', 'Labs', 'Tech', 'Systems', 'Solutions', 'Dynamics', 'Analytics', 'Robotics', 'Ventures', 'Works',
  'Logic', 'Mind', 'Sense', 'Vision', 'Health', 'Bio', 'Med', 'Care', 'Life', 'Gen',
  'Pay', 'Bank', 'Capital', 'Finance', 'Wealth', 'Trade', 'Market', 'Exchange', 'Commerce', 'Payments',
  'Cloud', 'Data', 'Base', 'Store', 'Flow', 'Stream', 'Pipe', 'Bridge', 'Gate', 'Port',
  'Security', 'Shield', 'Guard', 'Safe', 'Trust', 'Verify', 'Auth', 'Identity', 'Access', 'Secure',
  'Space', 'Sphere', 'Box', 'Hub', 'Zone', 'Point', 'Spot', 'Place', 'Site', 'Area',
  'ify', 'ly', 'io', 'co', 'x', 'os', 'is', 'us', 'um', 'er'
]

const SECTORS: SectorTag[] = ['AI/ML', 'FinTech', 'HealthTech', 'Climate', 'Security', 'SaaS', 'DevTools', 'Infrastructure', 'Marketplace', 'Consumer', 'DeepTech']
const STAGES: FundingStage[] = ['Pre-Seed', 'Seed', 'Series A', 'Series B', 'Series C+']
const HEADCOUNTS: HeadcountRange[] = ['1-10', '11-50', '51-200', '201-500', '500+']

const GEOGRAPHIES = [
  'San Francisco, US', 'New York, US', 'Austin, US', 'Boston, US', 'Seattle, US', 'Los Angeles, US', 'Chicago, US', 'Miami, US', 'Denver, US', 'Atlanta, US',
  'London, UK', 'Berlin, DE', 'Paris, FR', 'Amsterdam, NL', 'Stockholm, SE', 'Dublin, IE', 'Zurich, CH', 'Barcelona, ES', 'Munich, DE', 'Copenhagen, DK',
  'Tel Aviv, IL', 'Singapore, SG', 'Sydney, AU', 'Toronto, CA', 'Vancouver, CA', 'Bangalore, IN', 'Tokyo, JP', 'Seoul, KR', 'São Paulo, BR', 'Mexico City, MX'
]

const INVESTORS = [
  'Sequoia Capital', 'Andreessen Horowitz', 'Lightspeed Ventures', 'Accel', 'Index Ventures',
  'Benchmark', 'Greylock Partners', 'General Catalyst', 'Bessemer Venture Partners', 'NEA',
  'Founders Fund', 'Khosla Ventures', 'Battery Ventures', 'Insight Partners', 'Tiger Global',
  'Coatue Management', 'Addition', 'Ribbit Capital', 'Slow Ventures', 'First Round Capital',
  'Y Combinator', 'Techstars', '500 Startups', 'SV Angel', 'Floodgate',
  'a16z crypto', 'Paradigm', 'Variant', 'Dragonfly Capital', 'Polychain Capital',
  'GV (Google Ventures)', 'Microsoft M12', 'Salesforce Ventures', 'Amazon Alexa Fund', 'Intel Capital',
  'Lux Capital', 'Spark Capital', 'Union Square Ventures', 'Redpoint Ventures', 'Scale Venture Partners'
]

const FOUNDER_FIRST_NAMES = [
  'Alex', 'Sarah', 'Michael', 'Emily', 'David', 'Jessica', 'James', 'Ashley', 'Daniel', 'Amanda',
  'Ryan', 'Stephanie', 'Kevin', 'Nicole', 'Brian', 'Rachel', 'Jason', 'Melissa', 'Eric', 'Lauren',
  'Raj', 'Priya', 'Wei', 'Li', 'Yuki', 'Kenji', 'Carlos', 'Maria', 'Ahmed', 'Fatima',
  'Ivan', 'Natasha', 'Hans', 'Ingrid', 'Pierre', 'Sophie', 'Giovanni', 'Giulia', 'Olga', 'Dmitri'
]

const FOUNDER_LAST_NAMES = [
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez',
  'Chen', 'Wang', 'Liu', 'Zhang', 'Kim', 'Lee', 'Park', 'Nguyen', 'Patel', 'Singh',
  'Anderson', 'Taylor', 'Thomas', 'Moore', 'Jackson', 'Martin', 'Thompson', 'White', 'Harris', 'Clark',
  'Müller', 'Schmidt', 'Dubois', 'Laurent', 'Rossi', 'Bianchi', 'Ivanov', 'Petrov', 'Johansson', 'Nielsen'
]

const TAGS_POOL = [
  'ai-native', 'b2b', 'b2c', 'saas', 'marketplace', 'platform', 'api-first', 'open-source', 'enterprise', 'smb',
  'mobile-first', 'web3', 'blockchain', 'fintech', 'healthtech', 'edtech', 'cleantech', 'biotech', 'medtech', 'agtech',
  'proptech', 'insurtech', 'legaltech', 'hrtech', 'martech', 'adtech', 'regtech', 'govtech', 'sporttech', 'foodtech',
  'agentic', 'llm-powered', 'computer-vision', 'nlp', 'robotics', 'iot', 'ar-vr', 'quantum', 'edge-computing', 'devtools',
  'deep-tech', 'hardware', 'consumer', 'vertical-saas', 'horizontal-saas', 'data-infra', 'security', 'compliance', 'automation', 'workflow'
]

const SIGNAL_TYPES: Signal['type'][] = ['funding', 'hiring', 'product', 'partnership', 'press', 'leadership']

const TAGLINES_BY_SECTOR: Record<SectorTag, string[]> = {
  'AI/ML': [
    'AI agents for enterprise workflows',
    'Autonomous intelligence for business operations',
    'Next-gen machine learning infrastructure',
    'AI-powered decision automation',
    'Intelligent process automation at scale',
    'Conversational AI for customer engagement',
    'Computer vision for industrial automation',
    'AI copilots for knowledge workers',
    'Foundation models for vertical industries',
    'Real-time ML inference platform'
  ],
  'FinTech': [
    'Modern banking infrastructure',
    'Embedded finance for platforms',
    'Real-time payments processing',
    'AI-powered fraud prevention',
    'Next-gen treasury management',
    'Decentralized lending protocol',
    'Smart contract payment rails',
    'Cross-border remittance simplified',
    'Automated compliance for fintechs',
    'Open banking API platform'
  ],
  'HealthTech': [
    'AI diagnostics for clinicians',
    'Remote patient monitoring platform',
    'Digital therapeutics for chronic conditions',
    'Healthcare workflow automation',
    'Clinical trial management reimagined',
    'Personalized medicine platform',
    'Mental health support at scale',
    'AI-powered drug discovery',
    'Patient engagement solutions',
    'Healthcare data interoperability'
  ],
  'Climate': [
    'Carbon capture and storage',
    'Grid-scale energy storage',
    'Smart grid optimization',
    'Electric fleet management',
    'Renewable energy marketplace',
    'Sustainable supply chain tracking',
    'Climate risk analytics',
    'Green hydrogen production',
    'Circular economy platform',
    'Carbon credit verification'
  ],
  'Security': [
    'Zero-trust security platform',
    'AI-powered threat detection',
    'Cloud security posture management',
    'Identity and access management',
    'Security operations automation',
    'Vulnerability management at scale',
    'API security for modern apps',
    'Endpoint protection reimagined',
    'Security awareness training',
    'DevSecOps pipeline security'
  ],
  'SaaS': [
    'All-in-one business platform',
    'Workflow automation simplified',
    'Team collaboration reimagined',
    'Customer success platform',
    'Revenue operations automation',
    'Product analytics for growth',
    'Customer data platform',
    'No-code business tools',
    'Enterprise resource planning',
    'Project management for teams'
  ],
  'DevTools': [
    'Developer productivity platform',
    'Code review automation',
    'CI/CD pipeline optimization',
    'API development platform',
    'Database management simplified',
    'Infrastructure as code',
    'Observability for modern apps',
    'Feature flag management',
    'Developer experience platform',
    'Cloud cost optimization'
  ],
  'Infrastructure': [
    'Enterprise procurement platform',
    'B2B marketplace infrastructure',
    'Sales intelligence automation',
    'Contract lifecycle management',
    'Vendor management simplified',
    'B2B payment processing',
    'Enterprise communication platform',
    'Business process automation',
    'Partner ecosystem management',
    'Supply chain visibility'
  ],
  'Marketplace': [
    'Headless commerce platform',
    'Social commerce infrastructure',
    'Personalization engine for retail',
    'Inventory management at scale',
    'Logistics optimization platform',
    'Returns management simplified',
    'Subscription commerce platform',
    'Multi-channel retail automation',
    'Commerce analytics platform',
    'Fulfillment network optimization'
  ],
  'Consumer': [
    'Personalized learning platform',
    'Skill assessment at scale',
    'Corporate training reimagined',
    'Language learning through AI',
    'Virtual classroom infrastructure',
    'Learning management system',
    'Student engagement platform',
    'Credential verification network',
    'Educational content marketplace',
    'Tutor matching platform'
  ],
  'DeepTech': [
    'Quantum computing as a service',
    'Advanced materials discovery',
    'Synthetic biology platform',
    'Robotics automation systems',
    'Space technology infrastructure',
    'Nuclear fusion research',
    'Brain-computer interfaces',
    'Advanced semiconductor design',
    'Next-gen sensor networks',
    'Autonomous systems platform'
  ],
  'Other': [
    'Innovative technology solutions',
    'Digital transformation platform',
    'Next-generation platform',
    'Disruptive technology solutions',
    'Breakthrough innovation platform',
    'Novel approach to industry challenges',
    'Transformative business solutions',
    'Pioneering technology platform',
    'Revolutionary market approach',
    'Category-defining platform'
  ]
}

// Seeded random number generator for consistency
function seededRandom(seed: number): () => number {
  return function() {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff
    return seed / 0x7fffffff
  }
}

function pick<T>(arr: readonly T[], random: () => number): T {
  return arr[Math.floor(random() * arr.length)]
}

function pickN<T>(arr: readonly T[], n: number, random: () => number): T[] {
  const shuffled = [...arr].sort(() => random() - 0.5)
  return shuffled.slice(0, n)
}

function generateCompanyName(index: number, random: () => number): string {
  const prefix = pick(NAME_PREFIXES, random)
  const suffix = pick(NAME_SUFFIXES, random)
  
  // Sometimes just use prefix or add a modifier
  const style = Math.floor(random() * 4)
  switch (style) {
    case 0: return `${prefix}${suffix}`
    case 1: return `${prefix} ${suffix}`
    case 2: return prefix
    default: return `${prefix}.${suffix.toLowerCase()}`
  }
}

function generateDomain(name: string): string {
  const clean = name.toLowerCase().replace(/[^a-z0-9]/g, '')
  const tlds = ['.ai', '.io', '.co', '.com', '.dev', '.tech', '.app', '.cloud', '.xyz', '.so']
  const tld = tlds[Math.floor(Math.random() * tlds.length)]
  return `${clean}${tld}`
}

function generateFundingAmount(stage: FundingStage, random: () => number): number {
  const ranges: Record<FundingStage, [number, number]> = {
    'Pre-Seed': [250000, 2000000],
    'Seed': [1500000, 8000000],
    'Series A': [8000000, 30000000],
    'Series B': [25000000, 80000000],
    'Series C+': [60000000, 500000000]
  }
  const [min, max] = ranges[stage] || [1000000, 10000000]
  return Math.round((min + random() * (max - min)) / 100000) * 100000
}

function generateTotalRaised(lastFunding: number, stage: FundingStage, random: () => number): number {
  const multipliers: Record<FundingStage, number> = {
    'Pre-Seed': 1,
    'Seed': 1.2,
    'Series A': 1.8,
    'Series B': 2.5,
    'Series C+': 4
  }
  return Math.round(lastFunding * (multipliers[stage] || 1) * (1 + random() * 0.5))
}

function generateFoundedYear(stage: FundingStage, random: () => number): number {
  const baseYear = 2025
  const yearsBack: Record<FundingStage, [number, number]> = {
    'Pre-Seed': [0, 1],
    'Seed': [1, 3],
    'Series A': [2, 5],
    'Series B': [3, 7],
    'Series C+': [5, 15]
  }
  const [min, max] = yearsBack[stage] || [1, 5]
  return baseYear - Math.floor(min + random() * (max - min))
}

function generateSignals(companyId: string, random: () => number): Signal[] {
  const signalCount = 1 + Math.floor(random() * 4) // 1-4 signals
  const signals: Signal[] = []
  
  for (let i = 0; i < signalCount; i++) {
    const type = pick(SIGNAL_TYPES, random)
    const signalTitles: Record<Signal['type'], string[]> = {
      'funding': ['Closed funding round', 'Raised new capital', 'Secured investment', 'Announced funding'],
      'hiring': ['Expanding engineering team', 'Hiring for growth roles', 'Open leadership positions', 'Building sales team'],
      'product': ['Launched new product', 'Major feature release', 'Platform update announced', 'New API capabilities'],
      'partnership': ['Strategic partnership announced', 'Integration partnership', 'Channel partnership formed', 'Technology alliance'],
      'press': ['Featured in press', 'Industry award received', 'Market expansion announced', 'Customer milestone reached'],
      'leadership': ['New executive hired', 'Board member added', 'Advisory board expanded', 'Leadership change announced'],
      'github': ['Open source release', 'Repository milestone', 'Major contribution', 'Community growth'],
      'other': ['Company update', 'Industry milestone', 'Notable achievement', 'Strategic move']
    }
    
    const sources = ['TechCrunch', 'Bloomberg', 'Forbes', 'Reuters', 'Company Blog', 'LinkedIn', 'Crunchbase', 'PitchBook', 'The Information', 'Business Insider']
    
    // Generate date within last 6 months
    const daysAgo = Math.floor(random() * 180)
    const date = new Date()
    date.setDate(date.getDate() - daysAgo)
    
    signals.push({
      id: `sig_${companyId}_${i + 1}`,
      type,
      title: pick(signalTitles[type], random),
      description: `${pick(signalTitles[type], random)} with significant implications for growth.`,
      source: pick(sources, random),
      sourceUrl: `https://example.com/news/${companyId}/${i}`,
      timestamp: date.toISOString(),
      confidence: pick(['high', 'medium', 'low'] as const, random),
      isNew: daysAgo < 14
    })
  }
  
  return signals
}

export function generateCompanies(count: number, startId: number = 1, seed: number = 42): Company[] {
  const random = seededRandom(seed)
  const companies: Company[] = []
  const usedNames = new Set<string>()
  
  for (let i = 0; i < count; i++) {
    const id = String(startId + i).padStart(3, '0')
    
    // Generate unique company name
    let name: string
    do {
      name = generateCompanyName(startId + i, random)
    } while (usedNames.has(name))
    usedNames.add(name)
    
    const sector = pick(SECTORS, random)
    const stage = pick(STAGES, random)
    const geography = pick(GEOGRAPHIES, random)
    const headcount = pick(HEADCOUNTS, random)
    const lastFundingAmount = generateFundingAmount(stage, random)
    const totalRaised = generateTotalRaised(lastFundingAmount, stage, random)
    const foundedYear = generateFoundedYear(stage, random)
    
    // Generate funding date within last 2 years
    const fundingDaysAgo = Math.floor(random() * 730)
    const fundingDate = new Date()
    fundingDate.setDate(fundingDate.getDate() - fundingDaysAgo)
    
    const investorCount = 1 + Math.floor(random() * 4)
    const founderCount = 1 + Math.floor(random() * 3)
    const tagCount = 2 + Math.floor(random() * 4)
    
    const taglines = TAGLINES_BY_SECTOR[sector] || TAGLINES_BY_SECTOR['AI/ML']
    
    const company: Company = {
      id: `comp_${id}`,
      name,
      domain: generateDomain(name),
      tagline: pick(taglines, random),
      description: `${name} is ${pick(['building', 'creating', 'developing', 'pioneering', 'revolutionizing'], random)} ${pick(taglines, random).toLowerCase()}. ${pick(['Founded by industry veterans', 'Backed by top-tier VCs', 'Growing rapidly', 'Disrupting the market', 'Leading the category'], random)}.`,
      sector,
      stage,
      geography,
      foundedYear,
      headcount,
      lastFundingAmount,
      lastFundingDate: fundingDate.toISOString().split('T')[0],
      totalRaised,
      investorNames: pickN(INVESTORS, investorCount, random),
      founderNames: Array.from({ length: founderCount }, () => 
        `${pick(FOUNDER_FIRST_NAMES, random)} ${pick(FOUNDER_LAST_NAMES, random)}`
      ),
      linkedinUrl: `https://linkedin.com/company/${generateDomain(name).split('.')[0]}`,
      twitterUrl: random() > 0.3 ? `https://twitter.com/${generateDomain(name).split('.')[0]}` : undefined,
      signals: generateSignals(id, random),
      notes: [],
      tags: pickN(TAGS_POOL, tagCount, random),
      lists: [],
      addedAt: new Date(Date.now() - Math.floor(random() * 365 * 24 * 60 * 60 * 1000)).toISOString(),
      updatedAt: new Date(Date.now() - Math.floor(random() * 30 * 24 * 60 * 60 * 1000)).toISOString()
    }
    
    companies.push(company)
  }
  
  return companies
}

// Generate 500 companies
export const GENERATED_COMPANIES = generateCompanies(500, 26, 12345)
