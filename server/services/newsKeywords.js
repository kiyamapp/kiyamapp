// ===== EVENT CATEGORIES WITH BASE WEIGHTS =====

const EVENT_CATEGORIES = {
  nuclear: {
    weight: 25,
    keywords: [
      'nuclear', 'nükleer', 'atomic', 'atom bombası', 'uranium', 'uranyum',
      'radioactive', 'radyoaktif', 'nuclear war', 'nükleer savaş', 'warhead',
      'hydrogen bomb', 'hidrojen bombası', 'nuclear missile', 'icbm',
      'nuclear threat', 'nükleer tehdit', 'nuclear strike', 'nükleer saldırı'
    ]
  },
  worldWar: {
    weight: 30,
    keywords: [
      'world war', 'dünya savaşı', 'global war', 'küresel savaş',
      'world war 3', 'ww3', '3. dünya savaşı', 'total war',
      'nato war', 'nato savaş', 'superpower conflict'
    ]
  },
  majorWar: {
    weight: 15,
    keywords: [
      'war', 'savaş', 'invasion', 'istila', 'military operation', 'askeri operasyon',
      'airstrike', 'hava saldırısı', 'bombing', 'bombalama', 'bombardment',
      'ground offensive', 'kara harekatı', 'siege', 'kuşatma', 'occupation', 'işgal'
    ]
  },
  terrorism: {
    weight: 12,
    keywords: [
      'terrorism', 'terör', 'terrorist attack', 'terör saldırısı', 'suicide bomb',
      'canlı bomba', 'car bomb', 'hostage', 'rehine', 'mass shooting',
      'katliam', 'massacre'
    ]
  },
  naturalDisaster: {
    weight: 10,
    keywords: [
      'earthquake', 'deprem', 'tsunami', 'volcano', 'yanardağ', 'eruption', 'patlama',
      'hurricane', 'kasırga', 'typhoon', 'tayfun', 'tornado', 'cyclone', 'siklon',
      'flood', 'sel', 'wildfire', 'orman yangını', 'landslide', 'heyelan',
      'drought', 'kuraklık', 'famine', 'kıtlık'
    ]
  },
  pandemic: {
    weight: 15,
    keywords: [
      'pandemic', 'pandemi', 'plague', 'veba', 'epidemic', 'salgın',
      'outbreak', 'new virus', 'yeni virüs', 'mutation', 'mutasyon',
      'bird flu', 'kuş gribi', 'ebola', 'cholera', 'kolera'
    ]
  },
  genocide: {
    weight: 25,
    keywords: [
      'genocide', 'soykırım', 'ethnic cleansing', 'etnik temizlik',
      'crimes against humanity', 'insanlığa karşı suç', 'mass grave',
      'toplu mezar', 'war crime', 'savaş suçu'
    ]
  },
  economicCollapse: {
    weight: 8,
    keywords: [
      'economic collapse', 'ekonomik çöküş', 'market crash', 'borsa çöküşü',
      'hyperinflation', 'hiperenflasyon', 'bank run', 'global recession',
      'küresel durgunluk', 'depression', 'buhran', 'default', 'temerrüt'
    ]
  },
  civilUnrest: {
    weight: 5,
    keywords: [
      'coup', 'darbe', 'revolution', 'devrim', 'civil war', 'iç savaş',
      'uprising', 'ayaklanma', 'martial law', 'sıkıyönetim', 'state of emergency',
      'olağanüstü hal'
    ]
  },
  environmental: {
    weight: 6,
    keywords: [
      'climate crisis', 'iklim krizi', 'extinction', 'yok oluş', 'ice melt',
      'buzul erimesi', 'sea level', 'deniz seviyesi', 'ozone', 'ozon',
      'deforestation', 'ormansızlaşma', 'species extinct', 'tür yok olması'
    ]
  },
  religious: {
    weight: 8,
    keywords: [
      'antichrist', 'deccal', 'apocalypse', 'kıyamet', 'armageddon',
      'prophecy', 'kehanet', 'end times', 'ahir zaman', 'false prophet',
      'sahte peygamber', 'rapture', 'mesih', 'mehdi', 'mahdi'
    ]
  },
  // POSITIVE categories (reduce index)
  peace: {
    weight: -10,
    keywords: [
      'peace deal', 'barış anlaşması', 'ceasefire', 'ateşkes', 'peace treaty',
      'barış antlaşması', 'peace agreement', 'peace talks', 'barış görüşmeleri',
      'war ends', 'savaş bitti', 'conflict resolved', 'truce', 'mütareke'
    ]
  },
  recovery: {
    weight: -5,
    keywords: [
      'recovery', 'iyileşme', 'reconstruction', 'yeniden yapılanma',
      'aid delivered', 'yardım ulaştı', 'humanitarian aid', 'insani yardım',
      'cure found', 'tedavi bulundu', 'vaccine success', 'aşı başarısı'
    ]
  }
};

// ===== COUNTRY INVOLVEMENT MODIFIERS =====
const COUNTRY_MODIFIERS = {
  high: {
    modifier: 2.0,
    keywords: ['america', 'amerika', 'united states', 'abd', 'usa', 'u.s.',
               'israel', 'israil', 'iran', 'russia', 'rusya', 'china', 'çin',
               'nato', 'north korea', 'kuzey kore']
  },
  medium: {
    modifier: 1.5,
    keywords: ['turkey', 'türkiye', 'germany', 'almanya', 'france', 'fransa',
               'uk', 'united kingdom', 'ingiltere', 'japan', 'japonya',
               'india', 'hindistan', 'pakistan', 'saudi', 'suudi',
               'ukraine', 'ukrayna', 'taiwan', 'tayvan']
  }
};

// ===== DEATH TOLL SCORING =====
// Extracts numbers related to casualties from text
function extractCasualties(text) {
  const lower = text.toLowerCase();
  let deaths = 0;
  let injured = 0;

  // Patterns for death counts
  const deathPatterns = [
    /(\d[\d,.]*)\s*(?:dead|killed|died|death toll|ölü|öldü|hayatını kaybetti|can kaybı|şehit)/gi,
    /(?:killed|öldürüldü|öldü|death toll|can kaybı)\s*(?:of|:)?\s*(\d[\d,.]*)/gi,
    /(?:at least|en az)\s*(\d[\d,.]*)\s*(?:dead|killed|ölü|kişi öldü)/gi,
    /(\d[\d,.]*)\s*(?:people|kişi|civilians|sivil)\s*(?:killed|died|dead|öldü|hayatını kaybetti)/gi
  ];

  // Patterns for injury counts
  const injuryPatterns = [
    /(\d[\d,.]*)\s*(?:injured|wounded|hurt|yaralı|yaralandı)/gi,
    /(?:injured|wounded|yaralı)\s*(?:of|:)?\s*(\d[\d,.]*)/gi
  ];

  for (const pattern of deathPatterns) {
    let match;
    while ((match = pattern.exec(lower)) !== null) {
      const num = parseInt(match[1].replace(/[,.]/g, ''));
      if (num > deaths && num < 10000000) deaths = num;
    }
  }

  for (const pattern of injuryPatterns) {
    let match;
    while ((match = pattern.exec(lower)) !== null) {
      const num = parseInt(match[1].replace(/[,.]/g, ''));
      if (num > injured && num < 10000000) injured = num;
    }
  }

  // Also try to catch "thousands" patterns
  if (/thousands?\s*(?:dead|killed|ölü)/i.test(lower)) deaths = Math.max(deaths, 2000);
  if (/hundreds?\s*(?:dead|killed|ölü)/i.test(lower)) deaths = Math.max(deaths, 200);
  if (/binlerce\s*(?:ölü|kişi öldü|can kaybı)/i.test(lower)) deaths = Math.max(deaths, 2000);
  if (/yüzlerce\s*(?:ölü|kişi öldü|can kaybı)/i.test(lower)) deaths = Math.max(deaths, 200);

  return { deaths, injured };
}

// Score deaths: 0-10: +0, 11-50: +1, 51-200: +3, 200+: +10
function scoreDeaths(count) {
  if (count <= 10) return 0;
  if (count <= 50) return 1;
  if (count <= 200) return 3;
  if (count <= 1000) return 10;
  if (count <= 10000) return 20;
  return 30;
}

// Score injuries: similar but lower scale
function scoreInjuries(count) {
  if (count <= 20) return 0;
  if (count <= 100) return 0.5;
  if (count <= 500) return 1;
  return 2;
}

// ===== MAIN SCORING FUNCTION =====
function scoreHeadline(text) {
  const lower = text.toLowerCase();
  let baseScore = 0;
  let maxCategoryWeight = 0;
  let matchedCategories = [];
  let countryMultiplier = 1.0;
  let details = [];

  // 1. Match event categories
  for (const [catName, cat] of Object.entries(EVENT_CATEGORIES)) {
    for (const kw of cat.keywords) {
      if (lower.includes(kw)) {
        if (!matchedCategories.includes(catName)) {
          matchedCategories.push(catName);
          // Use the highest category weight, don't stack
          if (Math.abs(cat.weight) > Math.abs(maxCategoryWeight)) {
            maxCategoryWeight = cat.weight;
          }
          details.push(`[${catName}:${cat.weight > 0 ? '+' : ''}${cat.weight}]`);
        }
        break; // One match per category is enough
      }
    }
  }

  baseScore = maxCategoryWeight;

  // 2. Check country involvement
  for (const [level, config] of Object.entries(COUNTRY_MODIFIERS)) {
    for (const kw of config.keywords) {
      if (lower.includes(kw)) {
        if (config.modifier > countryMultiplier) {
          countryMultiplier = config.modifier;
          details.push(`[country:x${config.modifier} ${kw}]`);
        }
        break;
      }
    }
  }

  // 3. Extract and score casualties
  const { deaths, injured } = extractCasualties(text);
  const deathScore = scoreDeaths(deaths);
  const injuryScore = scoreInjuries(injured);

  if (deathScore > 0) details.push(`[deaths:${deaths}→+${deathScore}]`);
  if (injuryScore > 0) details.push(`[injured:${injured}→+${injuryScore}]`);

  // 4. Calculate final score
  // Formula: (categoryWeight + deathScore + injuryScore) * countryMultiplier
  const rawScore = baseScore + deathScore + injuryScore;
  const finalScore = rawScore * countryMultiplier;

  // 5. Determine magnitude
  let magnitude = 'minimal'; // minimal change
  const absScore = Math.abs(finalScore);
  if (absScore >= 30) magnitude = 'major';       // Big event: world war, 200+ dead
  else if (absScore >= 15) magnitude = 'moderate'; // Notable event
  else if (absScore >= 5) magnitude = 'minor';     // Small event
  // else minimal: barely moves the index

  return {
    score: Math.round(finalScore * 100) / 100,
    magnitude,
    categories: matchedCategories,
    countryMultiplier,
    deaths,
    injured,
    details: details.join(' ')
  };
}

module.exports = { scoreHeadline, extractCasualties, EVENT_CATEGORIES, COUNTRY_MODIFIERS };
