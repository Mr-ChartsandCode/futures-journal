const TRACKED_TICKERS = [
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

async function fetchEconAlerts() {
  try {
    const r = await fetch('https://nfs.faireconomy.media/ff_calendar_thisweek.json', {
      headers: { 'User-Agent': 'Mozilla/5.0' }
    })
    const data = await r.json()
    const now = new Date()
    const oneHour = 60 * 60 * 1000

    // Market close — 21:00 UTC = 4pm ET / 2pm MT
    const marketClose = new Date()
    marketClose.setUTCHours(21, 0, 0, 0)

    // Market open — 13:30 UTC = 9:30am ET
    const marketOpen = new Date()
    marketOpen.setUTCHours(13, 30, 0, 0)

    const G20_CURRENCIES = new Set([
  'USD','EUR','GBP','JPY','CAD','AUD','CNY','CNH','INR','BRL',
  'KRW','MXN','RUB','ZAR','TRY','SAR','ARS','IDR','CHF','SGD'
])

return (Array.isArray(data) ? data : [])
  .filter(e => {
  if (!G20_CURRENCIES.has(e.country)) return false
  if (e.impact !== 'High' && e.impact !== 'Medium') return false
  const eventTime = new Date(e.date)
  return eventTime <= now && now <= marketClose && now >= marketOpen
})
      .map(e => {
        const eventTime = new Date(e.date)
        const headline = `⚡ ${e.title} (${e.country}) — Released ${eventTime.toLocaleTimeString('en-US', 
          { hour: 'numeric', minute: '2-digit' })}${e.forecast ? ` | Forecast: ${e.forecast}` : ''}
          ${e.previous ? ` | Previous: ${e.previous}` : ''}`
        return {
          id: `econ-${e.title}-${e.date}`,
          headline,
          summary: `High impact US economic event. ${e.forecast ? `Forecast: ${e.forecast}.` : ''} ${e.previous ? `Previous: ${e.previous}.` : ''} ${e.actual ? `Actual result: ${e.actual}.` : ''}`,
          source: 'ECON ALERT',
          category: 'Alert',
          created_at: e.date,
          isAlert: true,
          alertType: 'economic',
          changePct: 0,
        }
      })
  } catch { return [] }
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Cache-Control', 's-maxage=90')

  const alerts = []
  const now = new Date().toISOString()

  try {
    // Check big movers — batch into groups of 20 to avoid URL length limits
    const BATCH_SIZE = 20
    const batches = []
    for (let i = 0; i < TRACKED_TICKERS.length; i += BATCH_SIZE) {
      batches.push(TRACKED_TICKERS.slice(i, i + BATCH_SIZE))
    }

    const batchResults = await Promise.allSettled(
      batches.map(async batch => {
        const symbols = batch.map(t => t.symbol).join(',')
        const r = await fetch(
          `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${symbols}&fields=symbol,shortName,regularMarketChangePercent,regularMarketPrice,regularMarketChange`,
          { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36' } }
        )
        const data = await r.json()
        return data?.quoteResponse?.result || []
      })
    )

    const allQuotes = batchResults
      .filter(r => r.status === 'fulfilled')
      .flatMap(r => r.value)

    for (const quote of allQuotes) {
      const pct = quote.regularMarketChangePercent
      if (Math.abs(pct) >= 3) {
        const dir = pct >= 0 ? 'up' : 'down'
        const sign = pct >= 0 ? '+' : ''
        alerts.push({
          id: `alert-mover-${quote.symbol}-${Date.now()}`,
          headline: `${quote.symbol} ${sign}${pct.toFixed(2)}% — ${quote.shortName || quote.symbol} moving significantly today`,
          summary: `${quote.shortName || quote.symbol} is ${dir} ${Math.abs(pct).toFixed(2)}% to $${quote.regularMarketPrice?.toFixed(2)}. This is a significant single-day move of ${sign}$${quote.regularMarketChange?.toFixed(2)} per share.`,
          source: 'TERMINAL ALERT',
          category: 'Alert',
          created_at: now,
          isAlert: true,
          alertType: 'mover',
          changePct: pct,
        })
      }
    }

    // Sort movers by magnitude
    const econAlerts = await fetchEconAlerts()
    const allAlerts = [...econAlerts, ...alerts]
    allAlerts.sort((a, b) => {
      if (a.alertType === 'economic' && b.alertType !== 'economic') return -1
      if (b.alertType === 'economic' && a.alertType !== 'economic') return 1
      return Math.abs(b.changePct) - Math.abs(a.changePct)
    })
    res.status(200).json({ alerts: allAlerts, count: allAlerts.length })
  } catch (err) {
    console.error('Alerts error:', err)
    res.status(200).json({ alerts: [], count: 0, error: err.message })
  }
}