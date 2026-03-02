const Alamet = require('../models/Alamet');
const IndexPoint = require('../models/IndexPoint');
const { scoreHeadline } = require('./newsKeywords');

// ===== ALAMET STATUS WEIGHTS (base index calculation) =====
const STATUS_WEIGHTS = {
  'Oldu': 1.0,         // Fully happened
  'Olmak Üzere': 0.6,  // About to happen
  'Olmadı': 0.0,       // Not happened
  'Olamayacak': -0.2   // Impossible
};

// ===== CELESTIAL EVENTS (astronomical events that spike the index) =====
const CELESTIAL_EVENTS = [
  // Ay tutulması - 2 Mart 2026 gece 03:33
  { date: '2026-03-02', hour: 3, minute: 33, name: 'Ay Tutulması / Lunar Eclipse', boost: 15, duration: 120 },
  // More events can be added here
];

let lastValue = null;
let newsCache = { headlines: [], fetchedAt: 0, scored: [] };

// ===== CALCULATE BASE INDEX FROM ALAMET STATUSES =====
// Returns a value 0-100 representing base apocalypse proximity
async function calculateBaseIndex() {
  const alametler = await Alamet.find({}).lean();
  if (alametler.length === 0) return 20;

  let totalWeight = 0;
  let maxPossible = alametler.length; // Each alamet max = 1.0

  for (const a of alametler) {
    totalWeight += (STATUS_WEIGHTS[a.status] || 0);
  }

  // Scale to 0-100
  const ratio = Math.max(0, totalWeight / maxPossible);
  return Math.round(ratio * 100 * 100) / 100;
}

// ===== CHECK CELESTIAL EVENT BOOST =====
function getCelestialBoost() {
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  let totalBoost = 0;
  let activeEvent = null;

  for (const event of CELESTIAL_EVENTS) {
    if (todayStr === event.date) {
      const eventMinutes = event.hour * 60 + event.minute;
      const diff = Math.abs(currentMinutes - eventMinutes);

      if (diff <= event.duration) {
        // Peak at exact time, fade out over duration
        const proximity = 1 - (diff / event.duration);
        const boost = event.boost * proximity;
        totalBoost += boost;
        activeEvent = event.name;
      }
    }
  }

  return { boost: Math.round(totalBoost * 100) / 100, event: activeEvent };
}

// ===== FETCH NEWS FROM RSS FEEDS =====
async function fetchNews() {
  const now = Date.now();
  // Cache for 3 minutes
  if (now - newsCache.fetchedAt < 3 * 60 * 1000 && newsCache.headlines.length > 0) {
    return newsCache;
  }

  const feeds = [
    'https://news.google.com/rss?hl=en&gl=US&ceid=US:en',
    'https://news.google.com/rss?hl=tr&gl=TR&ceid=TR:tr',
    'https://news.google.com/rss/topics/CAAqJggKIiBDQkFTRWdvSUwyMHZNRGx1YlY4U0FuUnlHZ0pVVWlnQVAB?hl=tr&gl=TR&ceid=TR:tr' // World news TR
  ];

  const headlines = [];

  for (const url of feeds) {
    try {
      const res = await fetch(url, {
        headers: { 'User-Agent': 'KiyamApp/1.0' },
        signal: AbortSignal.timeout(8000)
      });
      const xml = await res.text();

      // Extract titles
      const titleMatches = xml.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/g) ||
                           xml.match(/<title>(.*?)<\/title>/g) || [];

      // Extract pubDates for timeline
      const dateMatches = xml.match(/<pubDate>(.*?)<\/pubDate>/g) || [];

      for (let i = 1; i < Math.min(titleMatches.length, 30); i++) {
        const text = titleMatches[i]
          .replace(/<\/?title>/g, '')
          .replace(/<!\[CDATA\[|\]\]>/g, '')
          .trim();

        let pubDate = null;
        if (dateMatches[i - 1]) {
          pubDate = new Date(dateMatches[i - 1].replace(/<\/?pubDate>/g, ''));
        }

        if (text && text.length > 10) {
          headlines.push({ text, pubDate: pubDate || new Date() });
        }
      }
    } catch {
      // Feed unavailable, continue
    }
  }

  // Score all headlines
  const scored = headlines.map(h => {
    const result = scoreHeadline(h.text);
    return {
      headline: h.text,
      pubDate: h.pubDate,
      ...result
    };
  });

  // Sort by absolute score descending
  scored.sort((a, b) => Math.abs(b.score) - Math.abs(a.score));

  newsCache = {
    headlines: headlines.map(h => h.text),
    scored,
    fetchedAt: now
  };

  return newsCache;
}

// ===== CALCULATE NEWS DELTA =====
// Returns the delta (change) that news should apply to the index
async function calculateNewsDelta() {
  const { scored } = await fetchNews();
  if (scored.length === 0) return { delta: 0, topEvents: [], totalScore: 0 };

  let totalDelta = 0;
  const topEvents = [];

  for (const item of scored) {
    let delta = 0;

    // Convert score to index delta based on magnitude
    switch (item.magnitude) {
      case 'major':
        // Big events: 200+ deaths, world war, nuclear → significant index change
        delta = item.score * 0.08; // e.g., score 30 → delta +2.4
        break;
      case 'moderate':
        // Notable: delta = score * small factor
        delta = item.score * 0.03; // e.g., score 15 → delta +0.45
        break;
      case 'minor':
        // Small events: barely move
        delta = item.score * 0.008; // e.g., score 8 → delta +0.064
        break;
      default:
        // Minimal: near-zero
        delta = item.score * 0.002; // e.g., score 3 → delta +0.006
        break;
    }

    totalDelta += delta;

    if (Math.abs(item.score) >= 5) {
      topEvents.push({
        headline: item.headline,
        score: item.score,
        delta: Math.round(delta * 1000) / 1000,
        magnitude: item.magnitude,
        categories: item.categories,
        deaths: item.deaths,
        injured: item.injured,
        details: item.details
      });
    }
  }

  return {
    delta: Math.round(totalDelta * 1000) / 1000,
    topEvents: topEvents.slice(0, 15),
    totalScore: scored.reduce((sum, s) => sum + s.score, 0),
    headlineCount: scored.length
  };
}

// ===== GENERATE A NEW INDEX TICK =====
async function generateTick() {
  const baseIndex = await calculateBaseIndex();
  const newsData = await calculateNewsDelta();
  const celestial = getCelestialBoost();

  // Get last value
  if (lastValue === null) {
    const lastPoint = await IndexPoint.findOne().sort({ timestamp: -1 }).lean();
    lastValue = lastPoint ? lastPoint.value : baseIndex;
  }

  // Target = base + news delta + celestial
  const target = baseIndex + newsData.delta + celestial.boost;

  // Smooth transition: move 5% toward target each tick (no random noise!)
  const smoothing = 0.05;
  const newValue = lastValue + (target - lastValue) * smoothing;

  // Clamp to 0-100
  const clampedValue = Math.max(0, Math.min(100, newValue));
  const change = clampedValue - lastValue;

  // Determine if this is a significant change
  let magnitude = 'minimal';
  if (Math.abs(change) >= 0.5) magnitude = 'major';
  else if (Math.abs(change) >= 0.1) magnitude = 'moderate';
  else if (Math.abs(change) >= 0.02) magnitude = 'minor';

  // Build trigger description
  let trigger = '';
  if (celestial.event) {
    trigger = `🌑 ${celestial.event}`;
  } else if (newsData.topEvents.length > 0) {
    trigger = newsData.topEvents[0].headline;
  }

  const point = await IndexPoint.create({
    value: Math.round(clampedValue * 100) / 100,
    change: Math.round(change * 10000) / 10000,
    trigger,
    magnitude
  });

  lastValue = point.value;

  return {
    point,
    newsData,
    celestial,
    baseIndex,
    target: Math.round(target * 100) / 100
  };
}

// ===== ENGINE CONTROL =====
let tickInterval = null;

function startEngine(intervalMs = 10000) {
  if (tickInterval) return;
  console.log(`Index engine başlatıldı (${intervalMs / 1000}s aralıkla)`);
  generateTick().catch(console.error);
  tickInterval = setInterval(() => {
    generateTick().catch(console.error);
  }, intervalMs);
}

function stopEngine() {
  if (tickInterval) { clearInterval(tickInterval); tickInterval = null; }
}

module.exports = { generateTick, startEngine, stopEngine, fetchNews, calculateNewsDelta, getCelestialBoost };
