require('dotenv').config();
const mongoose = require('mongoose');
const IndexPoint = require('./models/IndexPoint');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/kiyamapp';

// ===== HISTORICAL TIMELINE =====
// Dünyanın yaratılışından bugüne - büyük olaylar ve endeks değerleri
// Endeks 0-100: Kıyamete yakınlık

const HISTORICAL_EVENTS = [
  // ===== YARATILIŞ VE İLK ÇAĞLAR =====
  { year: -4000, value: 2, trigger: 'Dünyanın yaratılışı / Creation of the World', magnitude: 'minimal' },
  { year: -3500, value: 3, trigger: '', magnitude: 'minimal' },
  { year: -3000, value: 3.5, trigger: 'İlk medeniyetler / First civilizations', magnitude: 'minimal' },
  { year: -2500, value: 4, trigger: 'Piramitlerin inşası / Building of Pyramids', magnitude: 'minimal' },
  { year: -2000, value: 5, trigger: 'Hz. İbrahim dönemi / Age of Abraham', magnitude: 'minor' },
  { year: -1500, value: 5.5, trigger: 'Hz. Musa ve Çıkış / Moses and Exodus', magnitude: 'minor' },
  { year: -1200, value: 7, trigger: 'Tunç Çağı Çöküşü / Bronze Age Collapse', magnitude: 'moderate' },
  { year: -1000, value: 6, trigger: 'Hz. Süleyman Tapınağı / Solomon\'s Temple', magnitude: 'minor' },
  { year: -800, value: 6.5, trigger: '', magnitude: 'minimal' },
  { year: -586, value: 10, trigger: 'Kudüs\'ün yıkılışı / Destruction of Jerusalem', magnitude: 'moderate' },
  { year: -500, value: 8, trigger: 'Buda ve Konfüçyüs dönemi / Age of Buddha & Confucius', magnitude: 'minor' },
  { year: -400, value: 7.5, trigger: '', magnitude: 'minimal' },
  { year: -334, value: 9, trigger: 'İskender\'in fetihleri / Alexander\'s Conquests', magnitude: 'minor' },
  { year: -200, value: 8, trigger: '', magnitude: 'minimal' },
  { year: -44, value: 10, trigger: 'Roma İç Savaşları / Roman Civil Wars', magnitude: 'minor' },

  // ===== MİLADİ DÖNEM =====
  { year: 30, value: 8, trigger: 'Hz. İsa dönemi / Age of Jesus', magnitude: 'minor' },
  { year: 70, value: 14, trigger: 'İkinci Tapınağın yıkılışı / Destruction of Second Temple', magnitude: 'moderate' },
  { year: 200, value: 10, trigger: '', magnitude: 'minimal' },
  { year: 380, value: 11, trigger: 'Roma\'nın bölünmesi / Division of Rome', magnitude: 'minor' },
  { year: 476, value: 16, trigger: 'Batı Roma\'nın çöküşü / Fall of Western Rome', magnitude: 'moderate' },
  { year: 570, value: 12, trigger: 'Hz. Muhammed\'in doğumu / Birth of Prophet Muhammad', magnitude: 'minor' },
  { year: 632, value: 13, trigger: 'Hz. Muhammed\'in vefatı / Death of Prophet Muhammad', magnitude: 'minor' },
  { year: 680, value: 15, trigger: 'Kerbela Olayı / Battle of Karbala', magnitude: 'moderate' },
  { year: 750, value: 12, trigger: 'Abbasi Devrimi / Abbasid Revolution', magnitude: 'minor' },
  { year: 1000, value: 14, trigger: 'Milenyum korkuları / Millennium fears', magnitude: 'minor' },
  { year: 1096, value: 18, trigger: 'Haçlı Seferleri başlangıcı / First Crusade', magnitude: 'moderate' },
  { year: 1187, value: 16, trigger: 'Selahaddin Kudüs\'ü fethetti / Saladin takes Jerusalem', magnitude: 'minor' },
  { year: 1200, value: 15, trigger: '', magnitude: 'minimal' },
  { year: 1258, value: 22, trigger: 'Moğol istilası - Bağdat\'ın düşüşü / Mongol sack of Baghdad', magnitude: 'major' },
  { year: 1300, value: 18, trigger: '', magnitude: 'minimal' },
  { year: 1347, value: 30, trigger: 'Kara Veba - 75 milyon ölü / Black Death - 75M dead', magnitude: 'major' },
  { year: 1400, value: 22, trigger: 'Timur fetihleri / Timurid Conquests', magnitude: 'moderate' },
  { year: 1453, value: 20, trigger: 'İstanbul\'un fethi / Fall of Constantinople', magnitude: 'moderate' },
  { year: 1492, value: 18, trigger: 'Amerika\'nın keşfi / Discovery of Americas', magnitude: 'minor' },
  { year: 1500, value: 19, trigger: 'Yerli soykırımları başlangıcı / Native genocide begins', magnitude: 'moderate' },
  { year: 1600, value: 17, trigger: '', magnitude: 'minimal' },
  { year: 1618, value: 23, trigger: '30 Yıl Savaşları - 8M ölü / Thirty Years War - 8M dead', magnitude: 'major' },
  { year: 1665, value: 21, trigger: 'Büyük Londra Vebası / Great Plague of London', magnitude: 'moderate' },
  { year: 1700, value: 17, trigger: '', magnitude: 'minimal' },
  { year: 1755, value: 20, trigger: 'Lizbon Depremi / Lisbon Earthquake', magnitude: 'moderate' },
  { year: 1789, value: 22, trigger: 'Fransız Devrimi / French Revolution', magnitude: 'moderate' },
  { year: 1800, value: 19, trigger: '', magnitude: 'minimal' },
  { year: 1815, value: 21, trigger: 'Napolyon Savaşları sonu / End of Napoleonic Wars', magnitude: 'minor' },
  { year: 1850, value: 20, trigger: '', magnitude: 'minimal' },
  { year: 1861, value: 23, trigger: 'Amerikan İç Savaşı / American Civil War', magnitude: 'moderate' },
  { year: 1880, value: 20, trigger: '', magnitude: 'minimal' },
  { year: 1900, value: 22, trigger: '', magnitude: 'minimal' },

  // ===== MODERN ÇAĞ - HIZLI ARTIŞ =====
  { year: 1914, value: 38, trigger: 'I. Dünya Savaşı - 20M ölü / World War I - 20M dead', magnitude: 'major' },
  { year: 1918, value: 45, trigger: 'İspanyol Gribi - 50M ölü / Spanish Flu - 50M dead', magnitude: 'major' },
  { year: 1920, value: 35, trigger: 'Savaş sonu toparlanma / Post-war recovery', magnitude: 'minor' },
  { year: 1929, value: 38, trigger: 'Büyük Buhran / Great Depression', magnitude: 'moderate' },
  { year: 1933, value: 40, trigger: 'Hitler\'in yükselişi / Rise of Hitler', magnitude: 'moderate' },
  { year: 1939, value: 55, trigger: 'II. Dünya Savaşı başlangıcı / World War II begins', magnitude: 'major' },
  { year: 1941, value: 60, trigger: 'Holokost ve küresel savaş / Holocaust & global war', magnitude: 'major' },
  { year: 1943, value: 65, trigger: 'Stalingrad, toplam savaş / Stalingrad, total war', magnitude: 'major' },
  { year: 1945, value: 72, trigger: 'Hiroşima & Nagazaki atom bombası / Atomic bombs dropped', magnitude: 'major' },
  { year: 1947, value: 55, trigger: 'Savaş sonu, BM kuruldu / Post-war, UN founded', magnitude: 'moderate' },
  { year: 1950, value: 52, trigger: 'Kore Savaşı / Korean War', magnitude: 'moderate' },
  { year: 1955, value: 48, trigger: '', magnitude: 'minimal' },
  { year: 1962, value: 68, trigger: 'Küba Füze Krizi - nükleer eşik / Cuban Missile Crisis', magnitude: 'major' },
  { year: 1965, value: 55, trigger: 'Vietnam Savaşı yoğunlaşıyor / Vietnam War escalates', magnitude: 'moderate' },
  { year: 1970, value: 50, trigger: '', magnitude: 'minimal' },
  { year: 1975, value: 48, trigger: 'Kamboçya soykırımı / Cambodian genocide', magnitude: 'major' },
  { year: 1979, value: 50, trigger: 'İran Devrimi / Iranian Revolution', magnitude: 'moderate' },
  { year: 1983, value: 58, trigger: 'Able Archer - nükleer savaş eşiği / Nuclear war threshold', magnitude: 'major' },
  { year: 1986, value: 56, trigger: 'Çernobil felaketi / Chernobyl disaster', magnitude: 'major' },
  { year: 1989, value: 42, trigger: 'Berlin Duvarı yıkılışı / Fall of Berlin Wall', magnitude: 'moderate' },
  { year: 1991, value: 38, trigger: 'Soğuk Savaş bitti / Cold War ended', magnitude: 'moderate' },
  { year: 1994, value: 45, trigger: 'Ruanda Soykırımı - 800K ölü / Rwanda Genocide - 800K dead', magnitude: 'major' },
  { year: 1999, value: 42, trigger: 'Y2K korkuları / Y2K fears', magnitude: 'minor' },
  { year: 2001, value: 55, trigger: '11 Eylül Saldırıları / September 11 Attacks', magnitude: 'major' },
  { year: 2003, value: 52, trigger: 'Irak Savaşı / Iraq War', magnitude: 'moderate' },
  { year: 2005, value: 50, trigger: 'Hint Okyanusu Tsunamisi - 230K ölü / Indian Ocean Tsunami', magnitude: 'major' },
  { year: 2008, value: 48, trigger: 'Küresel Ekonomik Kriz / Global Financial Crisis', magnitude: 'moderate' },
  { year: 2010, value: 47, trigger: 'Arap Baharı / Arab Spring', magnitude: 'moderate' },
  { year: 2011, value: 50, trigger: 'Suriye İç Savaşı başlangıcı / Syrian Civil War begins', magnitude: 'moderate' },
  { year: 2014, value: 52, trigger: 'IŞİD yükselişi / Rise of ISIS', magnitude: 'moderate' },
  { year: 2016, value: 50, trigger: '', magnitude: 'minimal' },
  { year: 2019, value: 48, trigger: '', magnitude: 'minimal' },
  { year: 2020, value: 60, trigger: 'COVID-19 Pandemisi - 7M+ ölü / COVID-19 Pandemic', magnitude: 'major' },

  // ===== SON YILLAR - DETAYLI =====
  { year: 2021, value: 57, trigger: 'Pandemi devam, Afganistan çöküşü / Pandemic, Afghanistan collapse', magnitude: 'moderate' },
  { year: 2022, month: 2, value: 65, trigger: 'Rusya-Ukrayna Savaşı / Russia-Ukraine War', magnitude: 'major' },
  { year: 2022, month: 6, value: 62, trigger: 'Nükleer tehditler / Nuclear threats', magnitude: 'moderate' },
  { year: 2022, month: 10, value: 60, trigger: '', magnitude: 'minimal' },
  { year: 2023, month: 2, value: 58, trigger: 'Türkiye depremler - 50K+ ölü / Turkey earthquakes - 50K+ dead', magnitude: 'major' },
  { year: 2023, month: 5, value: 56, trigger: '', magnitude: 'minimal' },
  { year: 2023, month: 10, value: 64, trigger: 'İsrail-Hamas Savaşı / Israel-Hamas War', magnitude: 'major' },
  { year: 2024, month: 1, value: 63, trigger: 'Ortadoğu gerginliği / Middle East tensions', magnitude: 'moderate' },
  { year: 2024, month: 4, value: 62, trigger: 'İran-İsrail gerilimi / Iran-Israel tension', magnitude: 'moderate' },
  { year: 2024, month: 7, value: 60, trigger: '', magnitude: 'minimal' },
  { year: 2024, month: 10, value: 61, trigger: 'Lübnan savaşı / Lebanon war', magnitude: 'moderate' },
  { year: 2025, month: 1, value: 63, trigger: '', magnitude: 'minimal' },
  { year: 2025, month: 3, value: 65, trigger: 'Küresel gerilim artışı / Global tension rise', magnitude: 'moderate' },
  { year: 2025, month: 6, value: 64, trigger: '', magnitude: 'minimal' },
  { year: 2025, month: 9, value: 66, trigger: 'İklim krizi derinleşiyor / Climate crisis deepens', magnitude: 'moderate' },
  { year: 2025, month: 12, value: 68, trigger: '', magnitude: 'minimal' },

  // ===== 2026 - AY BAZINDA =====
  { year: 2026, month: 1, value: 70, trigger: 'Ortadoğu\'da savaş tırmanışı / Middle East war escalation', magnitude: 'moderate' },
  { year: 2026, month: 2, value: 73, trigger: 'İran bombardımanı / Iran bombardment', magnitude: 'major' },
];

// Generate points between major events with smooth interpolation
function interpolate(events) {
  const points = [];

  for (let i = 0; i < events.length - 1; i++) {
    const curr = events[i];
    const next = events[i + 1];

    const currDate = new Date(curr.year, (curr.month || 1) - 1, 15);
    const nextDate = new Date(next.year, (next.month || 1) - 1, 15);

    // Add the event point itself
    points.push({
      value: curr.value,
      change: i > 0 ? curr.value - events[i - 1].value : 0,
      trigger: curr.trigger,
      magnitude: curr.magnitude,
      timestamp: currDate
    });

    // Add interpolated points between events
    const timeDiff = nextDate.getTime() - currDate.getTime();
    const valueDiff = next.value - curr.value;

    // Determine how many intermediate points to add
    const yearSpan = (next.year + (next.month || 0) / 12) - (curr.year + (curr.month || 0) / 12);
    let numPoints;
    if (yearSpan > 500) numPoints = 3;
    else if (yearSpan > 100) numPoints = 4;
    else if (yearSpan > 20) numPoints = 5;
    else if (yearSpan > 5) numPoints = 4;
    else if (yearSpan > 1) numPoints = 6;
    else numPoints = 2;

    for (let j = 1; j <= numPoints; j++) {
      const ratio = j / (numPoints + 1);
      const t = currDate.getTime() + timeDiff * ratio;
      // Add subtle noise to make it look organic
      const noise = (Math.random() - 0.5) * Math.max(1, Math.abs(valueDiff) * 0.15);
      const v = curr.value + valueDiff * ratio + noise;
      points.push({
        value: Math.round(Math.max(0, Math.min(100, v)) * 100) / 100,
        change: Math.round((valueDiff * (1 / (numPoints + 1))) * 100) / 100,
        trigger: '',
        magnitude: 'minimal',
        timestamp: new Date(t)
      });
    }
  }

  // Add last event
  const last = events[events.length - 1];
  points.push({
    value: last.value,
    change: last.value - events[events.length - 2].value,
    trigger: last.trigger,
    magnitude: last.magnitude,
    timestamp: new Date(last.year, (last.month || 1) - 1, 15)
  });

  return points;
}

async function seedHistory() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('MongoDB bağlantısı başarılı');

    // Clear existing index data
    await IndexPoint.deleteMany({});
    console.log('Eski index verileri temizlendi');

    const points = interpolate(HISTORICAL_EVENTS);
    console.log(`${points.length} tarihsel veri noktası oluşturuldu`);

    // Insert in batches
    const batchSize = 100;
    for (let i = 0; i < points.length; i += batchSize) {
      const batch = points.slice(i, i + batchSize);
      await IndexPoint.insertMany(batch);
    }

    console.log('Tarihsel veriler eklendi!');
    console.log(`İlk nokta: ${points[0].timestamp.getFullYear()} BCE - değer: ${points[0].value}`);
    console.log(`Son nokta: ${points[points.length - 1].timestamp.toISOString()} - değer: ${points[points.length - 1].value}`);

    await mongoose.disconnect();
    console.log('Seed tamamlandı!');
  } catch (err) {
    console.error('Seed hatası:', err.message);
    process.exit(1);
  }
}

seedHistory();
