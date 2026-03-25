import { useState } from 'react'

const TICKERS = [
  // Technology — XLK
  { symbol: 'MSFT',  name: 'Microsoft',           sector: 'Technology', cap: 3100 },
  { symbol: 'AAPL',  name: 'Apple',               sector: 'Technology', cap: 3000 },
  { symbol: 'NVDA',  name: 'Nvidia',              sector: 'Technology', cap: 2900 },
  { symbol: 'AVGO',  name: 'Broadcom',            sector: 'Technology', cap: 780 },
  { symbol: 'ORCL',  name: 'Oracle',              sector: 'Technology', cap: 460 },
  { symbol: 'CRM',   name: 'Salesforce',          sector: 'Technology', cap: 290 },
  { symbol: 'ACN',   name: 'Accenture',           sector: 'Technology', cap: 195 },
  { symbol: 'IBM',   name: 'IBM',                 sector: 'Technology', cap: 210 },
  { symbol: 'CSCO',  name: 'Cisco',               sector: 'Technology', cap: 200 },
  { symbol: 'ADBE',  name: 'Adobe',               sector: 'Technology', cap: 185 },
  { symbol: 'QCOM',  name: 'Qualcomm',            sector: 'Technology', cap: 165 },
  { symbol: 'TXN',   name: 'Texas Instruments',   sector: 'Technology', cap: 160 },
  { symbol: 'AMD',   name: 'AMD',                 sector: 'Technology', cap: 160 },
  { symbol: 'INTU',  name: 'Intuit',              sector: 'Technology', cap: 155 },
  { symbol: 'AMAT',  name: 'Applied Materials',   sector: 'Technology', cap: 130 },
  { symbol: 'PANW',  name: 'Palo Alto',           sector: 'Technology', cap: 115 },
  { symbol: 'KLAC',  name: 'KLA Corp',            sector: 'Technology', cap: 110 },
  { symbol: 'LRCX',  name: 'Lam Research',        sector: 'Technology', cap: 100 },
  { symbol: 'MU',    name: 'Micron',              sector: 'Technology', cap: 100 },
  { symbol: 'INTC',  name: 'Intel',               sector: 'Technology', cap: 90 },
  { symbol: 'SNPS',  name: 'Synopsys',            sector: 'Technology', cap: 85 },
  { symbol: 'CDNS',  name: 'Cadence',             sector: 'Technology', cap: 80 },
  { symbol: 'FTNT',  name: 'Fortinet',            sector: 'Technology', cap: 75 },
  { symbol: 'ADSK',  name: 'Autodesk',            sector: 'Technology', cap: 70 },
  { symbol: 'CTSH',  name: 'Cognizant',           sector: 'Technology', cap: 35 },
  { symbol: 'IT',    name: 'Gartner',             sector: 'Technology', cap: 45 },
  { symbol: 'ANSS',  name: 'Ansys',               sector: 'Technology', cap: 30 },
  { symbol: 'PTC',   name: 'PTC Inc',             sector: 'Technology', cap: 25 },
  { symbol: 'JNPR',  name: 'Juniper Networks',    sector: 'Technology', cap: 12 },

  // Communication Services — XLC
  { symbol: 'GOOGL', name: 'Alphabet A',          sector: 'Communication Services', cap: 2100 },
  { symbol: 'GOOG',  name: 'Alphabet C',          sector: 'Communication Services', cap: 2050 },
  { symbol: 'META',  name: 'Meta',                sector: 'Communication Services', cap: 1600 },
  { symbol: 'NFLX',  name: 'Netflix',             sector: 'Communication Services', cap: 380 },
  { symbol: 'DIS',   name: 'Disney',              sector: 'Communication Services', cap: 170 },
  { symbol: 'CMCSA', name: 'Comcast',             sector: 'Communication Services', cap: 140 },
  { symbol: 'VZ',    name: 'Verizon',             sector: 'Communication Services', cap: 160 },
  { symbol: 'T',     name: 'AT&T',                sector: 'Communication Services', cap: 130 },
  { symbol: 'TMUS',  name: 'T-Mobile',            sector: 'Communication Services', cap: 250 },
  { symbol: 'CHTR',  name: 'Charter Comm',        sector: 'Communication Services', cap: 50 },
  { symbol: 'EA',    name: 'Electronic Arts',     sector: 'Communication Services', cap: 35 },
  { symbol: 'WBD',   name: 'Warner Bros',         sector: 'Communication Services', cap: 25 },
  { symbol: 'PARA',  name: 'Paramount',           sector: 'Communication Services', cap: 10 },
  { symbol: 'OMC',   name: 'Omnicom',             sector: 'Communication Services', cap: 18 },
  { symbol: 'IPG',   name: 'Interpublic',         sector: 'Communication Services', cap: 10 },
  { symbol: 'TTWO',  name: 'Take-Two',            sector: 'Communication Services', cap: 30 },
  { symbol: 'LYV',   name: 'Live Nation',         sector: 'Communication Services', cap: 25 },
  { symbol: 'FOXA',  name: 'Fox Corp A',          sector: 'Communication Services', cap: 22 },

  // Consumer Discretionary — XLY
  { symbol: 'AMZN',  name: 'Amazon',              sector: 'Consumer Discretionary', cap: 2100 },
  { symbol: 'TSLA',  name: 'Tesla',               sector: 'Consumer Discretionary', cap: 800 },
  { symbol: 'HD',    name: 'Home Depot',          sector: 'Consumer Discretionary', cap: 340 },
  { symbol: 'MCD',   name: "McDonald's",          sector: 'Consumer Discretionary', cap: 210 },
  { symbol: 'LOW',   name: "Lowe's",              sector: 'Consumer Discretionary', cap: 130 },
  { symbol: 'SBUX',  name: 'Starbucks',           sector: 'Consumer Discretionary', cap: 90 },
  { symbol: 'NKE',   name: 'Nike',                sector: 'Consumer Discretionary', cap: 80 },
  { symbol: 'BKNG',  name: 'Booking Holdings',    sector: 'Consumer Discretionary', cap: 160 },
  { symbol: 'TJX',   name: 'TJX Companies',       sector: 'Consumer Discretionary', cap: 130 },
  { symbol: 'ABNB',  name: 'Airbnb',              sector: 'Consumer Discretionary', cap: 80 },
  { symbol: 'CMG',   name: 'Chipotle',            sector: 'Consumer Discretionary', cap: 75 },
  { symbol: 'GM',    name: 'General Motors',      sector: 'Consumer Discretionary', cap: 50 },
  { symbol: 'F',     name: 'Ford',                sector: 'Consumer Discretionary', cap: 45 },
  { symbol: 'ORLY',  name: "O'Reilly Auto",       sector: 'Consumer Discretionary', cap: 70 },
  { symbol: 'AZO',   name: 'AutoZone',            sector: 'Consumer Discretionary', cap: 55 },
  { symbol: 'MAR',   name: 'Marriott',            sector: 'Consumer Discretionary', cap: 65 },
  { symbol: 'HLT',   name: 'Hilton',              sector: 'Consumer Discretionary', cap: 55 },
  { symbol: 'RCL',   name: 'Royal Caribbean',     sector: 'Consumer Discretionary', cap: 60 },
  { symbol: 'CCL',   name: 'Carnival',            sector: 'Consumer Discretionary', cap: 25 },
  { symbol: 'EBAY',  name: 'eBay',                sector: 'Consumer Discretionary', cap: 30 },
  { symbol: 'YUM',   name: 'Yum Brands',          sector: 'Consumer Discretionary', cap: 35 },
  { symbol: 'DRI',   name: 'Darden',              sector: 'Consumer Discretionary', cap: 20 },
  { symbol: 'ROST',  name: 'Ross Stores',         sector: 'Consumer Discretionary', cap: 45 },
  { symbol: 'BBY',   name: 'Best Buy',            sector: 'Consumer Discretionary', cap: 15 },
  { symbol: 'APTV',  name: 'Aptiv',               sector: 'Consumer Discretionary', cap: 12 },

  // Consumer Staples — XLP
  { symbol: 'WMT',   name: 'Walmart',             sector: 'Consumer Staples', cap: 770 },
  { symbol: 'COST',  name: 'Costco',              sector: 'Consumer Staples', cap: 400 },
  { symbol: 'PG',    name: 'Procter & Gamble',    sector: 'Consumer Staples', cap: 370 },
  { symbol: 'KO',    name: 'Coca-Cola',           sector: 'Consumer Staples', cap: 290 },
  { symbol: 'PEP',   name: 'PepsiCo',             sector: 'Consumer Staples', cap: 210 },
  { symbol: 'PM',    name: 'Philip Morris',       sector: 'Consumer Staples', cap: 220 },
  { symbol: 'MO',    name: 'Altria',              sector: 'Consumer Staples', cap: 90 },
  { symbol: 'MDLZ',  name: 'Mondelez',            sector: 'Consumer Staples', cap: 80 },
  { symbol: 'CL',    name: 'Colgate-Palmolive',   sector: 'Consumer Staples', cap: 60 },
  { symbol: 'GIS',   name: 'General Mills',       sector: 'Consumer Staples', cap: 35 },
  { symbol: 'KHC',   name: 'Kraft Heinz',         sector: 'Consumer Staples', cap: 30 },
  { symbol: 'KMB',   name: 'Kimberly-Clark',      sector: 'Consumer Staples', cap: 40 },
  { symbol: 'STZ',   name: 'Constellation Brands',sector: 'Consumer Staples', cap: 40 },
  { symbol: 'HSY',   name: 'Hershey',             sector: 'Consumer Staples', cap: 30 },
  { symbol: 'SYY',   name: 'Sysco',               sector: 'Consumer Staples', cap: 35 },
  { symbol: 'ADM',   name: 'Archer-Daniels',      sector: 'Consumer Staples', cap: 25 },
  { symbol: 'CAG',   name: 'ConAgra',             sector: 'Consumer Staples', cap: 15 },
  { symbol: 'TAP',   name: 'Molson Coors',        sector: 'Consumer Staples', cap: 10 },

  // Financials — XLF
  { symbol: 'BRK.B', name: 'Berkshire Hathaway',  sector: 'Financials', cap: 1000 },
  { symbol: 'JPM',   name: 'JPMorgan',            sector: 'Financials', cap: 700 },
  { symbol: 'V',     name: 'Visa',                sector: 'Financials', cap: 540 },
  { symbol: 'MA',    name: 'Mastercard',          sector: 'Financials', cap: 460 },
  { symbol: 'BAC',   name: 'Bank of America',     sector: 'Financials', cap: 310 },
  { symbol: 'WFC',   name: 'Wells Fargo',         sector: 'Financials', cap: 220 },
  { symbol: 'GS',    name: 'Goldman Sachs',       sector: 'Financials', cap: 180 },
  { symbol: 'AXP',   name: 'American Express',    sector: 'Financials', cap: 180 },
  { symbol: 'MS',    name: 'Morgan Stanley',      sector: 'Financials', cap: 160 },
  { symbol: 'SPGI',  name: 'S&P Global',          sector: 'Financials', cap: 150 },
  { symbol: 'BLK',   name: 'BlackRock',           sector: 'Financials', cap: 120 },
  { symbol: 'C',     name: 'Citigroup',           sector: 'Financials', cap: 130 },
  { symbol: 'CB',    name: 'Chubb',               sector: 'Financials', cap: 110 },
  { symbol: 'PGR',   name: 'Progressive',         sector: 'Financials', cap: 140 },
  { symbol: 'MMC',   name: 'Marsh McLennan',      sector: 'Financials', cap: 100 },
  { symbol: 'AON',   name: 'Aon',                 sector: 'Financials', cap: 80 },
  { symbol: 'ICE',   name: 'Intercontinental',    sector: 'Financials', cap: 90 },
  { symbol: 'CME',   name: 'CME Group',           sector: 'Financials', cap: 80 },
  { symbol: 'USB',   name: 'US Bancorp',          sector: 'Financials', cap: 70 },
  { symbol: 'PNC',   name: 'PNC Financial',       sector: 'Financials', cap: 65 },
  { symbol: 'TFC',   name: 'Truist Financial',    sector: 'Financials', cap: 55 },
  { symbol: 'COF',   name: 'Capital One',         sector: 'Financials', cap: 60 },
  { symbol: 'MCO',   name: "Moody's",             sector: 'Financials', cap: 75 },
  { symbol: 'SCHW',  name: 'Charles Schwab',      sector: 'Financials', cap: 120 },
  { symbol: 'BK',    name: 'BNY Mellon',          sector: 'Financials', cap: 55 },
  { symbol: 'STT',   name: 'State Street',        sector: 'Financials', cap: 30 },
  { symbol: 'FITB',  name: 'Fifth Third',         sector: 'Financials', cap: 25 },
  { symbol: 'RF',    name: 'Regions Financial',   sector: 'Financials', cap: 22 },
  { symbol: 'CFG',   name: 'Citizens Financial',  sector: 'Financials', cap: 18 },
  { symbol: 'HBAN',  name: 'Huntington Bancshares',sector: 'Financials', cap: 20 },
  { symbol: 'MTB',   name: 'M&T Bank',            sector: 'Financials', cap: 25 },
  { symbol: 'FDS',   name: 'FactSet',             sector: 'Financials', cap: 18 },
  { symbol: 'MSCI',  name: 'MSCI Inc',            sector: 'Financials', cap: 40 },

  // Healthcare — XLV
  { symbol: 'LLY',   name: 'Eli Lilly',           sector: 'Healthcare', cap: 700 },
  { symbol: 'UNH',   name: 'UnitedHealth',        sector: 'Healthcare', cap: 470 },
  { symbol: 'JNJ',   name: 'J&J',                 sector: 'Healthcare', cap: 370 },
  { symbol: 'ABBV',  name: 'AbbVie',              sector: 'Healthcare', cap: 310 },
  { symbol: 'MRK',   name: 'Merck',               sector: 'Healthcare', cap: 240 },
  { symbol: 'TMO',   name: 'Thermo Fisher',       sector: 'Healthcare', cap: 200 },
  { symbol: 'ABT',   name: 'Abbott',              sector: 'Healthcare', cap: 210 },
  { symbol: 'ISRG',  name: 'Intuitive Surgical',  sector: 'Healthcare', cap: 190 },
  { symbol: 'DHR',   name: 'Danaher',             sector: 'Healthcare', cap: 160 },
  { symbol: 'SYK',   name: 'Stryker',             sector: 'Healthcare', cap: 130 },
  { symbol: 'BSX',   name: 'Boston Scientific',   sector: 'Healthcare', cap: 120 },
  { symbol: 'AMGN',  name: 'Amgen',               sector: 'Healthcare', cap: 140 },
  { symbol: 'GILD',  name: 'Gilead',              sector: 'Healthcare', cap: 110 },
  { symbol: 'MDT',   name: 'Medtronic',           sector: 'Healthcare', cap: 110 },
  { symbol: 'BMY',   name: 'Bristol-Myers',       sector: 'Healthcare', cap: 120 },
  { symbol: 'PFE',   name: 'Pfizer',              sector: 'Healthcare', cap: 160 },
  { symbol: 'REGN',  name: 'Regeneron',           sector: 'Healthcare', cap: 90 },
  { symbol: 'ZTS',   name: 'Zoetis',              sector: 'Healthcare', cap: 80 },
  { symbol: 'CI',    name: 'Cigna',               sector: 'Healthcare', cap: 90 },
  { symbol: 'ELV',   name: 'Elevance Health',     sector: 'Healthcare', cap: 100 },
  { symbol: 'HUM',   name: 'Humana',              sector: 'Healthcare', cap: 35 },
  { symbol: 'CVS',   name: 'CVS Health',          sector: 'Healthcare', cap: 60 },
  { symbol: 'MCK',   name: 'McKesson',            sector: 'Healthcare', cap: 70 },
  { symbol: 'A',     name: 'Agilent',             sector: 'Healthcare', cap: 30 },
  { symbol: 'IQV',   name: 'IQVIA',               sector: 'Healthcare', cap: 35 },
  { symbol: 'BAX',   name: 'Baxter',              sector: 'Healthcare', cap: 12 },
  { symbol: 'BDX',   name: 'Becton Dickinson',    sector: 'Healthcare', cap: 60 },
  { symbol: 'HOLX',  name: 'Hologic',             sector: 'Healthcare', cap: 15 },
  { symbol: 'IDXX',  name: 'IDEXX Labs',          sector: 'Healthcare', cap: 35 },
  { symbol: 'MTD',   name: 'Mettler-Toledo',      sector: 'Healthcare', cap: 25 },
  { symbol: 'RMD',   name: 'ResMed',              sector: 'Healthcare', cap: 30 },
  { symbol: 'TECH',  name: 'Bio-Techne',          sector: 'Healthcare', cap: 10 },
  { symbol: 'VAR',   name: 'Varian Medical',      sector: 'Healthcare', cap: 15 },
  { symbol: 'VTRS',  name: 'Viatris',             sector: 'Healthcare', cap: 12 },
  { symbol: 'ALGN',  name: 'Align Technology',    sector: 'Healthcare', cap: 15 },

  // Energy — XLE
  { symbol: 'XOM',   name: 'ExxonMobil',          sector: 'Energy', cap: 490 },
  { symbol: 'CVX',   name: 'Chevron',             sector: 'Energy', cap: 270 },
  { symbol: 'COP',   name: 'ConocoPhillips',      sector: 'Energy', cap: 120 },
  { symbol: 'EOG',   name: 'EOG Resources',       sector: 'Energy', cap: 65 },
  { symbol: 'SLB',   name: 'SLB',                 sector: 'Energy', cap: 55 },
  { symbol: 'MPC',   name: 'Marathon Petroleum',  sector: 'Energy', cap: 55 },
  { symbol: 'PSX',   name: 'Phillips 66',         sector: 'Energy', cap: 50 },
  { symbol: 'VLO',   name: 'Valero Energy',       sector: 'Energy', cap: 45 },
  { symbol: 'OXY',   name: 'Occidental',          sector: 'Energy', cap: 40 },
  { symbol: 'PXD',   name: 'Pioneer Natural',     sector: 'Energy', cap: 35 },
  { symbol: 'DVN',   name: 'Devon Energy',        sector: 'Energy', cap: 20 },
  { symbol: 'HAL',   name: 'Halliburton',         sector: 'Energy', cap: 25 },
  { symbol: 'BKR',   name: 'Baker Hughes',        sector: 'Energy', cap: 30 },
  { symbol: 'FANG',  name: 'Diamondback Energy',  sector: 'Energy', cap: 25 },
  { symbol: 'KMI',   name: 'Kinder Morgan',       sector: 'Energy', cap: 25 },
  { symbol: 'WMB',   name: 'Williams Companies',  sector: 'Energy', cap: 40 },
  { symbol: 'OKE',   name: 'ONEOK',               sector: 'Energy', cap: 45 },
  { symbol: 'HES',   name: 'Hess Corp',           sector: 'Energy', cap: 40 },
  { symbol: 'TRGP',  name: 'Targa Resources',     sector: 'Energy', cap: 35 },
  { symbol: 'APA',   name: 'APA Corp',            sector: 'Energy', cap: 10 },

  // Industrials — XLI
  { symbol: 'GE',    name: 'GE Aerospace',        sector: 'Industrials', cap: 200 },
  { symbol: 'RTX',   name: 'RTX Corp',            sector: 'Industrials', cap: 160 },
  { symbol: 'CAT',   name: 'Caterpillar',         sector: 'Industrials', cap: 170 },
  { symbol: 'HON',   name: 'Honeywell',           sector: 'Industrials', cap: 130 },
  { symbol: 'UPS',   name: 'UPS',                 sector: 'Industrials', cap: 100 },
  { symbol: 'DE',    name: 'John Deere',          sector: 'Industrials', cap: 110 },
  { symbol: 'LMT',   name: 'Lockheed Martin',     sector: 'Industrials', cap: 110 },
  { symbol: 'BA',    name: 'Boeing',              sector: 'Industrials', cap: 110 },
  { symbol: 'UNP',   name: 'Union Pacific',       sector: 'Industrials', cap: 140 },
  { symbol: 'FDX',   name: 'FedEx',               sector: 'Industrials', cap: 60 },
  { symbol: 'MMM',   name: '3M',                  sector: 'Industrials', cap: 70 },
  { symbol: 'GD',    name: 'General Dynamics',    sector: 'Industrials', cap: 70 },
  { symbol: 'NOC',   name: 'Northrop Grumman',    sector: 'Industrials', cap: 65 },
  { symbol: 'EMR',   name: 'Emerson Electric',    sector: 'Industrials', cap: 55 },
  { symbol: 'ETN',   name: 'Eaton Corp',          sector: 'Industrials', cap: 120 },
  { symbol: 'ITW',   name: 'Illinois Tool Works', sector: 'Industrials', cap: 70 },
  { symbol: 'CSX',   name: 'CSX Corp',            sector: 'Industrials', cap: 55 },
  { symbol: 'NSC',   name: 'Norfolk Southern',    sector: 'Industrials', cap: 55 },
  { symbol: 'PH',    name: 'Parker Hannifin',     sector: 'Industrials', cap: 75 },
  { symbol: 'ROK',   name: 'Rockwell Automation', sector: 'Industrials', cap: 30 },
  { symbol: 'CARR',  name: 'Carrier Global',      sector: 'Industrials', cap: 55 },
  { symbol: 'OTIS',  name: 'Otis Worldwide',      sector: 'Industrials', cap: 35 },
  { symbol: 'CTAS',  name: 'Cintas',              sector: 'Industrials', cap: 70 },
  { symbol: 'VRSK',  name: 'Verisk',              sector: 'Industrials', cap: 35 },
  { symbol: 'EXPD',  name: 'Expeditors Intl',     sector: 'Industrials', cap: 18 },
  { symbol: 'FAST',  name: 'Fastenal',            sector: 'Industrials', cap: 40 },
  { symbol: 'GWW',   name: 'W.W. Grainger',       sector: 'Industrials', cap: 45 },
  { symbol: 'LHX',   name: 'L3Harris',            sector: 'Industrials', cap: 35 },
  { symbol: 'LDOS',  name: 'Leidos',              sector: 'Industrials', cap: 25 },
  { symbol: 'PWR',   name: 'Quanta Services',     sector: 'Industrials', cap: 35 },
  { symbol: 'CPRT',  name: 'Copart',              sector: 'Industrials', cap: 45 },
  { symbol: 'DAL',   name: 'Delta Air Lines',     sector: 'Industrials', cap: 30 },
  { symbol: 'UAL',   name: 'United Airlines',     sector: 'Industrials', cap: 20 },
  { symbol: 'AAL',   name: 'American Airlines',   sector: 'Industrials', cap: 10 },
  { symbol: 'LUV',   name: 'Southwest Airlines',  sector: 'Industrials', cap: 18 },
  { symbol: 'JBHT',  name: 'J.B. Hunt',           sector: 'Industrials', cap: 18 },

  // Materials — XLB
  { symbol: 'LIN',   name: 'Linde',               sector: 'Materials', cap: 210 },
  { symbol: 'APD',   name: 'Air Products',        sector: 'Materials', cap: 60 },
  { symbol: 'SHW',   name: 'Sherwin-Williams',    sector: 'Materials', cap: 90 },
  { symbol: 'ECL',   name: 'Ecolab',              sector: 'Materials', cap: 55 },
  { symbol: 'FCX',   name: 'Freeport-McMoRan',    sector: 'Materials', cap: 55 },
  { symbol: 'NEM',   name: 'Newmont',             sector: 'Materials', cap: 45 },
  { symbol: 'NUE',   name: 'Nucor',               sector: 'Materials', cap: 30 },
  { symbol: 'DOW',   name: 'Dow Inc',             sector: 'Materials', cap: 30 },
  { symbol: 'DD',    name: 'DuPont',              sector: 'Materials', cap: 30 },
  { symbol: 'PPG',   name: 'PPG Industries',      sector: 'Materials', cap: 28 },
  { symbol: 'VMC',   name: 'Vulcan Materials',    sector: 'Materials', cap: 30 },
  { symbol: 'MLM',   name: 'Martin Marietta',     sector: 'Materials', cap: 25 },
  { symbol: 'IP',    name: 'International Paper', sector: 'Materials', cap: 18 },
  { symbol: 'PKG',   name: 'Packaging Corp',      sector: 'Materials', cap: 18 },
  { symbol: 'ALB',   name: 'Albemarle',           sector: 'Materials', cap: 12 },
  { symbol: 'CE',    name: 'Celanese',            sector: 'Materials', cap: 10 },
  { symbol: 'CF',    name: 'CF Industries',       sector: 'Materials', cap: 15 },
  { symbol: 'MOS',   name: 'Mosaic',              sector: 'Materials', cap: 10 },
  { symbol: 'RPM',   name: 'RPM International',   sector: 'Materials', cap: 15 },
  { symbol: 'AVY',   name: 'Avery Dennison',      sector: 'Materials', cap: 15 },

  // Utilities — XLU
  { symbol: 'NEE',   name: 'NextEra Energy',      sector: 'Utilities', cap: 140 },
  { symbol: 'SO',    name: 'Southern Company',    sector: 'Utilities', cap: 90 },
  { symbol: 'DUK',   name: 'Duke Energy',         sector: 'Utilities', cap: 90 },
  { symbol: 'SRE',   name: 'Sempra',              sector: 'Utilities', cap: 50 },
  { symbol: 'AEP',   name: 'American Electric',   sector: 'Utilities', cap: 55 },
  { symbol: 'D',     name: 'Dominion Energy',     sector: 'Utilities', cap: 45 },
  { symbol: 'EXC',   name: 'Exelon',              sector: 'Utilities', cap: 40 },
  { symbol: 'XEL',   name: 'Xcel Energy',         sector: 'Utilities', cap: 30 },
  { symbol: 'PCG',   name: 'PG&E',                sector: 'Utilities', cap: 35 },
  { symbol: 'ED',    name: 'Consolidated Edison', sector: 'Utilities', cap: 30 },
  { symbol: 'EIX',   name: 'Edison International',sector: 'Utilities', cap: 25 },
  { symbol: 'WEC',   name: 'WEC Energy',          sector: 'Utilities', cap: 28 },
  { symbol: 'ES',    name: 'Eversource',          sector: 'Utilities', cap: 20 },
  { symbol: 'ETR',   name: 'Entergy',             sector: 'Utilities', cap: 22 },
  { symbol: 'FE',    name: 'FirstEnergy',         sector: 'Utilities', cap: 22 },
  { symbol: 'AWK',   name: 'American Water',      sector: 'Utilities', cap: 25 },
  { symbol: 'CMS',   name: 'CMS Energy',          sector: 'Utilities', cap: 18 },
  { symbol: 'CNP',   name: 'CenterPoint Energy',  sector: 'Utilities', cap: 20 },
  { symbol: 'LNT',   name: 'Alliant Energy',      sector: 'Utilities', cap: 15 },
  { symbol: 'NI',    name: 'NiSource',            sector: 'Utilities', cap: 15 },
  { symbol: 'PPL',   name: 'PPL Corp',            sector: 'Utilities', cap: 22 },
  { symbol: 'AES',   name: 'AES Corp',            sector: 'Utilities', cap: 15 },
  { symbol: 'VST',   name: 'Vistra',              sector: 'Utilities', cap: 45 },
  { symbol: 'CEG',   name: 'Constellation Energy',sector: 'Utilities', cap: 55 },

  // Real Estate — XLRE
  { symbol: 'PLD',   name: 'Prologis',            sector: 'Real Estate', cap: 100 },
  { symbol: 'AMT',   name: 'American Tower',      sector: 'Real Estate', cap: 90 },
  { symbol: 'EQIX',  name: 'Equinix',             sector: 'Real Estate', cap: 80 },
  { symbol: 'WELL',  name: 'Welltower',           sector: 'Real Estate', cap: 70 },
  { symbol: 'SPG',   name: 'Simon Property',      sector: 'Real Estate', cap: 55 },
  { symbol: 'DLR',   name: 'Digital Realty',      sector: 'Real Estate', cap: 50 },
  { symbol: 'PSA',   name: 'Public Storage',      sector: 'Real Estate', cap: 50 },
  { symbol: 'CCI',   name: 'Crown Castle',        sector: 'Real Estate', cap: 45 },
  { symbol: 'O',     name: 'Realty Income',       sector: 'Real Estate', cap: 50 },
  { symbol: 'SBAC',  name: 'SBA Communications',  sector: 'Real Estate', cap: 25 },
  { symbol: 'AVB',   name: 'AvalonBay',           sector: 'Real Estate', cap: 30 },
  { symbol: 'EQR',   name: 'Equity Residential',  sector: 'Real Estate', cap: 25 },
  { symbol: 'VTR',   name: 'Ventas',              sector: 'Real Estate', cap: 22 },
  { symbol: 'ARE',   name: 'Alexandria RE',       sector: 'Real Estate', cap: 18 },
  { symbol: 'BXP',   name: 'BXP Inc',             sector: 'Real Estate', cap: 12 },
  { symbol: 'ESS',   name: 'Essex Property',      sector: 'Real Estate', cap: 18 },
  { symbol: 'MAA',   name: 'Mid-America Apt',     sector: 'Real Estate', cap: 18 },
  { symbol: 'UDR',   name: 'UDR Inc',             sector: 'Real Estate', cap: 12 },
  { symbol: 'HST',   name: 'Host Hotels',         sector: 'Real Estate', cap: 15 },
  { symbol: 'KIM',   name: 'Kimco Realty',        sector: 'Real Estate', cap: 15 },
  { symbol: 'REG',   name: 'Regency Centers',     sector: 'Real Estate', cap: 12 },
  { symbol: 'NNN',   name: 'NNN REIT',            sector: 'Real Estate', cap: 10 },

  // Biotech — XBI
  { symbol: 'LLY',   name: 'Eli Lilly',           sector: 'Biotech', cap: 700 },
  { symbol: 'ABBV',  name: 'AbbVie',              sector: 'Biotech', cap: 310 },
  { symbol: 'AMGN',  name: 'Amgen',               sector: 'Biotech', cap: 140 },
  { symbol: 'GILD',  name: 'Gilead',              sector: 'Biotech', cap: 110 },
  { symbol: 'REGN',  name: 'Regeneron',           sector: 'Biotech', cap: 90 },
  { symbol: 'VRTX',  name: 'Vertex Pharma',       sector: 'Biotech', cap: 120 },
  { symbol: 'BIIB',  name: 'Biogen',              sector: 'Biotech', cap: 30 },
  { symbol: 'MRNA',  name: 'Moderna',             sector: 'Biotech', cap: 25 },
  { symbol: 'ILMN',  name: 'Illumina',            sector: 'Biotech', cap: 20 },
  { symbol: 'ALNY',  name: 'Alnylam',             sector: 'Biotech', cap: 25 },
  { symbol: 'BMRN',  name: 'BioMarin',            sector: 'Biotech', cap: 12 },
  { symbol: 'INCY',  name: 'Incyte',              sector: 'Biotech', cap: 15 },
  { symbol: 'EXAS',  name: 'Exact Sciences',      sector: 'Biotech', cap: 12 },
  { symbol: 'SGEN',  name: 'Seagen',              sector: 'Biotech', cap: 10 },
  { symbol: 'FATE',  name: 'Fate Therapeutics',   sector: 'Biotech', cap: 5 },
  { symbol: 'RCUS',  name: 'Arcus Biosciences',   sector: 'Biotech', cap: 3 },
  { symbol: 'FOLD',  name: 'Amicus Therapeutics', sector: 'Biotech', cap: 3 },
  { symbol: 'ARWR',  name: 'Arrowhead Pharma',    sector: 'Biotech', cap: 4 },
  { symbol: 'NTLA',  name: 'Intellia Therapeutics',sector: 'Biotech', cap: 3 },
  { symbol: 'BEAM',  name: 'Beam Therapeutics',   sector: 'Biotech', cap: 3 },
  { symbol: 'CRSP',  name: 'CRISPR Therapeutics', sector: 'Biotech', cap: 4 },
  { symbol: 'EDIT',  name: 'Editas Medicine',     sector: 'Biotech', cap: 2 },
  { symbol: 'RXRX',  name: 'Recursion Pharma',    sector: 'Biotech', cap: 3 },
  { symbol: 'SRRK',  name: 'Scholar Rock',        sector: 'Biotech', cap: 2 },
  { symbol: 'PTGX',  name: 'Protagonist Therapeutics', sector: 'Biotech', cap: 2 },
]

const SECTORS = [...new Set(TICKERS.map(t => t.sector))]

function fmt(n, decimals = 1) {
  if (n === null || n === undefined) return '—'
  const abs = Math.abs(n)
  if (abs >= 1e12) return `$${(n / 1e12).toFixed(decimals)}T`
  if (abs >= 1e9)  return `$${(n / 1e9).toFixed(decimals)}B`
  if (abs >= 1e6)  return `$${(n / 1e6).toFixed(decimals)}M`
  return `$${n.toLocaleString()}`
}

function pct(n) {
  if (n === null || n === undefined) return '—'
  return `${(n * 100).toFixed(1)}%`
}

function num(n, decimals = 2) {
  if (n === null || n === undefined) return '—'
  return n.toFixed(decimals)
}

function changeColor(val) {
  if (!val) return '#666'
  return parseFloat(val) >= 0 ? '#70c0ff' : '#ff6060'
}

const CARD = { background: 'linear-gradient(160deg,#111,#0a0a0a)', border: '1px solid #1e1e1e', borderTop: '1px solid #2a2a2a', borderRadius: 8, padding: '14px 16px', marginBottom: 10 }
const LABEL = { fontSize: 10, color: '#555', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8, fontWeight: 600 }
const ROW = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', borderBottom: '1px solid #111' }
const KEY = { fontSize: 13, color: '#888' }
const VAL = { fontSize: 13, fontWeight: 600, color: '#e0e0e0' }

export default function Fundamentals() {
  const [search, setSearch] = useState('')
  const [symbol, setSymbol] = useState('')
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState('overview')
  const [activeSector, setActiveSector] = useState('Technology')

  const suggestions = search.length > 0
    ? TICKERS.filter(t => t.symbol.startsWith(search.toUpperCase()) || t.name.toLowerCase().startsWith(search.toLowerCase())).slice(0, 8)
    : []

  async function fetchFundamentals(sym) {
    setLoading(true)
    setError(null)
    setData(null)
    setSymbol(sym)
    setSearch('')
    try {
      const res = await fetch(`/api/fundamentals?symbol=${sym}`)
      const json = await res.json()
      if (json.error) throw new Error(json.error)
      if (!json.profile) throw new Error('No data found for ' + sym)
      setData(json)
      setActiveTab('overview')
    } catch (err) {
      setError(err.message)
    }
    setLoading(false)
  }

  const sectorTickers = TICKERS
    .filter(t => t.sector === activeSector)
    .sort((a, b) => b.cap - a.cap)

  const TABS = ['overview', 'income', 'balance', 'cashflow', 'estimates']

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden', fontFamily: 'var(--font)' }}>

      <div style={{ borderBottom: '1px solid var(--border)', padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 16, background: 'linear-gradient(180deg,#0f0f0f,#000)', flexShrink: 0 }}>
        <span style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: '#f0f0f0' }}>Fundamentals</span>
        <div style={{ position: 'relative' }}>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && search && fetchFundamentals(search.toUpperCase())}
            placeholder="Search ticker or company..."
            style={{ width: 240, fontSize: 13, padding: '6px 10px', background: '#0a0a0a', border: '1px solid #2a2a2a', borderRadius: 6, color: '#f0f0f0' }}
          />
          {suggestions.length > 0 && (
            <div style={{ position: 'absolute', top: '100%', left: 0, background: '#111', border: '1px solid #222', borderRadius: 6, zIndex: 100, width: 240, marginTop: 2 }}>
              {suggestions.map(t => (
                <div key={t.symbol} onClick={() => fetchFundamentals(t.symbol)} style={{ padding: '8px 12px', cursor: 'pointer', fontSize: 13, color: '#e0e0e0', borderBottom: '1px solid #1a1a1a', display: 'flex', justifyContent: 'space-between' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#1a1a1a'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <span style={{ fontWeight: 700 }}>{t.symbol}</span>
                  <span style={{ color: '#555', fontSize: 12 }}>{t.name}</span>
                </div>
              ))}
            </div>
          )}
        </div>
        {symbol && <span style={{ fontSize: 12, color: '#555', letterSpacing: '0.05em' }}>VIEWING: <span style={{ color: '#70c0ff', fontWeight: 700 }}>{symbol}</span></span>}
      </div>

      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '180px 1fr', overflow: 'hidden' }}>

        <div style={{ borderRight: '1px solid #1a1a1a', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div style={{ padding: '8px 10px', borderBottom: '1px solid #1a1a1a', flexShrink: 0 }}>
            {SECTORS.map(s => (
              <button key={s} onClick={() => setActiveSector(s)} style={{
                display: 'block', width: '100%', textAlign: 'left', padding: '5px 8px',
                fontSize: 11, borderRadius: 4, border: 'none', cursor: 'pointer',
                fontFamily: 'var(--font)', marginBottom: 1, letterSpacing: '0.03em',
                background: activeSector === s ? '#001428' : 'transparent',
                color: activeSector === s ? '#70c0ff' : '#555',
                fontWeight: activeSector === s ? 700 : 400,
              }}>{s}</button>
            ))}
          </div>
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {sectorTickers.map(t => (
              <div key={t.symbol} onClick={() => fetchFundamentals(t.symbol)} style={{
                padding: '7px 10px', cursor: 'pointer', borderBottom: '1px solid #0f0f0f',
                background: symbol === t.symbol ? '#001428' : 'transparent',
                borderLeft: symbol === t.symbol ? '2px solid #0084ff' : '2px solid transparent',
                transition: 'background 0.1s',
              }}
                onMouseEnter={e => { if (symbol !== t.symbol) e.currentTarget.style.background = '#0d0d0d' }}
                onMouseLeave={e => { if (symbol !== t.symbol) e.currentTarget.style.background = 'transparent' }}
              >
                <div style={{ fontSize: 12, fontWeight: 700, color: symbol === t.symbol ? '#70c0ff' : '#e0e0e0' }}>{t.symbol}</div>
                <div style={{ fontSize: 10, color: '#444', marginTop: 1 }}>{t.name}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ overflowY: 'auto' }}>
          {!data && !loading && !error && (
            <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#333', fontSize: 13, letterSpacing: '0.05em' }}>
              SELECT A TICKER TO VIEW FUNDAMENTALS
            </div>
          )}

          {loading && (
            <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#555', fontSize: 12, letterSpacing: '0.05em' }}>
              LOADING {symbol}...
            </div>
          )}

          {error && (
            <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--red)', fontSize: 12 }}>
              {error}
            </div>
          )}

          {data && (
            <div style={{ padding: '16px 20px' }}>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
                    {data.profile.image && <img src={data.profile.image} alt="" style={{ width: 32, height: 32, borderRadius: 6 }} />}
                    <span style={{ fontSize: 22, fontWeight: 700, color: '#fff' }}>{data.profile.symbol}</span>
                    <span style={{ fontSize: 14, color: '#888' }}>{data.profile.companyName}</span>
                    <span style={{ fontSize: 11, padding: '2px 8px', background: '#001428', color: '#70c0ff', border: '1px solid #003080', borderRadius: 4 }}>{data.profile.sector}</span>
                  </div>
                  <div style={{ fontSize: 13, color: '#555' }}>{data.profile.exchange} · {data.profile.industry}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 28, fontWeight: 700, color: '#f0f0f0' }}>${data.currentPrice?.toFixed(2)}</div>
                  <div style={{ fontSize: 12, color: '#555' }}>Mkt Cap: {fmt(data.profile.marketCap)}</div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6,1fr)', gap: 6, marginBottom: 16 }}>
                {Object.entries(data.priceChanges || {}).map(([period, change]) => (
                  <div key={period} style={{ background: '#0a0a0a', border: '1px solid #1a1a1a', borderRadius: 6, padding: '8px 10px', textAlign: 'center' }}>
                    <div style={{ fontSize: 10, color: '#555', letterSpacing: '0.06em', marginBottom: 4 }}>{period}</div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: changeColor(change) }}>
                      {change ? `${parseFloat(change) >= 0 ? '+' : ''}${change}%` : '—'}
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', gap: 4, marginBottom: 16, borderBottom: '1px solid #1a1a1a', paddingBottom: 12 }}>
                {TABS.map(tab => (
                  <button key={tab} onClick={() => setActiveTab(tab)} style={{
                    fontSize: 11, padding: '5px 12px', borderRadius: 4, border: 'none', cursor: 'pointer',
                    fontFamily: 'var(--font)', fontWeight: activeTab === tab ? 700 : 400, letterSpacing: '0.04em',
                    background: activeTab === tab ? '#001428' : 'transparent',
                    color: activeTab === tab ? '#70c0ff' : '#555',
                    textTransform: 'uppercase',
                  }}>{tab}</button>
                ))}
              </div>

              {activeTab === 'overview' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <div>
                    <div style={CARD}>
                      <div style={LABEL}>Key ratios</div>
                      {[
                        ['P/E (TTM)', num(data.ratios?.priceToEarningsRatioTTM)],
                        ['P/B (TTM)', num(data.ratios?.priceToBookRatioTTM)],
                        ['P/FCF (TTM)', num(data.ratios?.priceToFreeCashFlowRatioTTM)],
                        ['P/S (TTM)', num(data.ratios?.priceToSalesRatioTTM)],
                        ['ROE (TTM)', pct(data.ratios?.returnOnEquityTTM)],
                        ['Debt/Equity', num(data.ratios?.debtToEquityRatioTTM)],
                        ['Current Ratio', num(data.ratios?.currentRatioTTM)],
                        ['Gross Margin', pct(data.ratios?.grossProfitMarginTTM)],
                        ['Net Margin', pct(data.ratios?.netProfitMarginTTM)],
                        ['FCF/OCF', pct(data.ratios?.freeCashFlowOperatingCashFlowRatioTTM)],
                      ].map(([k, v]) => (
                        <div key={k} style={ROW}>
                          <span style={KEY}>{k}</span>
                          <span style={VAL}>{v}</span>
                        </div>
                      ))}
                    </div>

                    <div style={CARD}>
                      <div style={LABEL}>Price targets</div>
                      {data.priceTarget && [
                        ['Consensus', `$${data.priceTarget.targetConsensus?.toFixed(2)}`],
                        ['Median', `$${data.priceTarget.targetMedian?.toFixed(2)}`],
                        ['High', `$${data.priceTarget.targetHigh?.toFixed(2)}`],
                        ['Low', `$${data.priceTarget.targetLow?.toFixed(2)}`],
                      ].map(([k, v]) => (
                        <div key={k} style={ROW}>
                          <span style={KEY}>{k}</span>
                          <span style={VAL}>{v}</span>
                        </div>
                      ))}
                      {data.priceTargetSummary && [
                        ['Last month avg', `$${data.priceTargetSummary.lastMonthAvgPriceTarget?.toFixed(2)} (${data.priceTargetSummary.lastMonthCount})`],
                        ['Last quarter avg', `$${data.priceTargetSummary.lastQuarterAvgPriceTarget?.toFixed(2)} (${data.priceTargetSummary.lastQuarterCount})`],
                        ['Last year avg', `$${data.priceTargetSummary.lastYearAvgPriceTarget?.toFixed(2)} (${data.priceTargetSummary.lastYearCount})`],
                      ].map(([k, v]) => (
                        <div key={k} style={ROW}>
                          <span style={KEY}>{k}</span>
                          <span style={VAL}>{v}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div style={CARD}>
                      <div style={LABEL}>Company</div>
                      {[
                        ['CEO', data.profile.ceo],
                        ['Employees', parseInt(data.profile.fullTimeEmployees)?.toLocaleString()],
                        ['IPO Date', data.profile.ipoDate],
                        ['Country', data.profile.country],
                      ].map(([k, v]) => (
                        <div key={k} style={ROW}>
                          <span style={KEY}>{k}</span>
                          <span style={VAL}>{v || '—'}</span>
                        </div>
                      ))}
                      <div style={{ marginTop: 10, fontSize: 12, color: '#555', lineHeight: 1.7 }}>
                        {data.profile.description?.slice(0, 300)}...
                      </div>
                    </div>

                    <div style={CARD}>
                      <div style={LABEL}>Earnings</div>
                      {(data.earnings || []).slice(0, 5).map((e, i) => (
                        <div key={i} style={ROW}>
                          <span style={KEY}>{e.date}</span>
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: 12, color: '#e0e0e0' }}>Est: {e.epsEstimated ? `$${e.epsEstimated}` : '—'}</div>
                            {e.epsActual !== null && <div style={{ fontSize: 11, color: e.epsActual >= e.epsEstimated ? '#70c0ff' : '#ff6060' }}>Actual: ${e.epsActual}</div>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'income' && (
                <div style={CARD}>
                  <div style={LABEL}>Income statement</div>
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                      <thead>
                        <tr style={{ borderBottom: '1px solid #222' }}>
                          <th style={{ padding: '8px', textAlign: 'left', color: '#555', fontWeight: 600, fontSize: 11 }}>Metric</th>
                          {(data.income || []).map(q => <th key={q.date} style={{ padding: '8px', textAlign: 'right', color: '#555', fontWeight: 600, fontSize: 11 }}>{q.date?.slice(0, 7)}</th>)}
                        </tr>
                      </thead>
                      <tbody>
                        {[
                          ['Revenue', 'revenue'],
                          ['Gross Profit', 'grossProfit'],
                          ['Operating Income', 'operatingIncome'],
                          ['Net Income', 'netIncome'],
                          ['EBITDA', 'ebitda'],
                          ['EPS', 'eps'],
                          ['EPS Diluted', 'epsDiluted'],
                        ].map(([label, key]) => (
                          <tr key={key} style={{ borderBottom: '1px solid #111' }}>
                            <td style={{ padding: '7px 8px', color: '#888' }}>{label}</td>
                            {(data.income || []).map(q => (
                              <td key={q.date} style={{ padding: '7px 8px', textAlign: 'right', color: '#e0e0e0' }}>
                                {key === 'eps' || key === 'epsDiluted' ? `$${q[key]?.toFixed(2)}` : fmt(q[key])}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {activeTab === 'balance' && (
                <div style={CARD}>
                  <div style={LABEL}>Balance sheet</div>
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                      <thead>
                        <tr style={{ borderBottom: '1px solid #222' }}>
                          <th style={{ padding: '8px', textAlign: 'left', color: '#555', fontWeight: 600, fontSize: 11 }}>Metric</th>
                          {(data.balance || []).map(q => <th key={q.date} style={{ padding: '8px', textAlign: 'right', color: '#555', fontWeight: 600, fontSize: 11 }}>{q.date?.slice(0, 7)}</th>)}
                        </tr>
                      </thead>
                      <tbody>
                        {[
                          ['Cash & ST Investments', 'cashAndShortTermInvestments'],
                          ['Total Assets', 'totalAssets'],
                          ['Total Debt', 'totalDebt'],
                          ['Net Debt', 'netDebt'],
                          ['Total Liabilities', 'totalLiabilities'],
                          ['Total Equity', 'totalEquity'],
                        ].map(([label, key]) => (
                          <tr key={key} style={{ borderBottom: '1px solid #111' }}>
                            <td style={{ padding: '7px 8px', color: '#888' }}>{label}</td>
                            {(data.balance || []).map(q => (
                              <td key={q.date} style={{ padding: '7px 8px', textAlign: 'right', color: '#e0e0e0' }}>
                                {fmt(q[key])}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {activeTab === 'cashflow' && (
                <div style={CARD}>
                  <div style={LABEL}>Cash flow</div>
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                      <thead>
                        <tr style={{ borderBottom: '1px solid #222' }}>
                          <th style={{ padding: '8px', textAlign: 'left', color: '#555', fontWeight: 600, fontSize: 11 }}>Metric</th>
                          {(data.cashflow || []).map(q => <th key={q.date} style={{ padding: '8px', textAlign: 'right', color: '#555', fontWeight: 600, fontSize: 11 }}>{q.date?.slice(0, 7)}</th>)}
                        </tr>
                      </thead>
                      <tbody>
                        {[
                          ['Operating Cash Flow', 'operatingCashFlow'],
                          ['Capital Expenditure', 'capitalExpenditure'],
                          ['Free Cash Flow', 'freeCashFlow'],
                          ['Net Income', 'netIncome'],
                          ['Stock Buybacks', 'commonStockRepurchased'],
                          ['Dividends Paid', 'commonDividendsPaid'],
                          ['Net Change in Cash', 'netChangeInCash'],
                        ].map(([label, key]) => (
                          <tr key={key} style={{ borderBottom: '1px solid #111' }}>
                            <td style={{ padding: '7px 8px', color: '#888' }}>{label}</td>
                            {(data.cashflow || []).map(q => (
                                <td key={q.date} style={{ padding: '7px 8px', textAlign: 'right', color: q[key] < 0 ? '#ff6060' : '#e0e0e0' }}>
                                {fmt(q[key])}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {activeTab === 'estimates' && (
                <div style={CARD}>
                  <div style={LABEL}>Analyst estimates — annual</div>
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                      <thead>
                        <tr style={{ borderBottom: '1px solid #222' }}>
                          <th style={{ padding: '8px', textAlign: 'left', color: '#555', fontWeight: 600, fontSize: 11 }}>Metric</th>
                          {(data.analyst || []).map(q => <th key={q.date} style={{ padding: '8px', textAlign: 'right', color: '#555', fontWeight: 600, fontSize: 11 }}>{q.date?.slice(0, 4)}</th>)}
                        </tr>
                      </thead>
                      <tbody>
                        {[
                          ['Revenue (avg)', 'revenueAvg'],
                          ['Revenue (low)', 'revenueLow'],
                          ['Revenue (high)', 'revenueHigh'],
                          ['EPS (avg)', 'epsAvg'],
                          ['EPS (low)', 'epsLow'],
                          ['EPS (high)', 'epsHigh'],
                          ['EBITDA (avg)', 'ebitdaAvg'],
                          ['Net Income (avg)', 'netIncomeAvg'],
                          ['# Analysts (EPS)', 'numAnalystsEps'],
                        ].map(([label, key]) => (
                          <tr key={key} style={{ borderBottom: '1px solid #111' }}>
                            <td style={{ padding: '7px 8px', color: '#888' }}>{label}</td>
                            {(data.analyst || []).map(q => (
                              <td key={q.date} style={{ padding: '7px 8px', textAlign: 'right', color: '#e0e0e0' }}>
                                {key.startsWith('eps') || key === 'numAnalystsEps'
                                  ? key === 'numAnalystsEps' ? q[key] : `$${q[key]?.toFixed(2)}`
                                  : fmt(q[key])}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}