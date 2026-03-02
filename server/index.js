require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const alametRoutes = require('./routes/alamet');
const adminRoutes = require('./routes/admin');
const indexRoutes = require('./routes/indexRoute');
const { startEngine } = require('./services/indexEngine');

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/kiyamapp';

// CORS - production ready
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',')
  : ['http://localhost:5173'];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.some(o => origin === o || origin.endsWith('.onrender.com'))) {
      return callback(null, true);
    }
    return callback(new Error('CORS izni yok'), false);
  },
  credentials: true
}));

app.use(express.json());

app.use('/api/alamet', alametRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/index', indexRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// One-time seed endpoint (remove after first use)
app.get('/api/seed', async (req, res) => {
  try {
    const bcrypt = require('bcryptjs');
    const Admin = require('./models/Admin');
    const Alamet = require('./models/Alamet');

    const adminCount = await Admin.countDocuments();
    if (adminCount > 0) return res.json({ message: 'Zaten seed yapılmış' });

    const passwordHash = await bcrypt.hash('ananisikeyimisrail3131', 10);
    await Admin.create({ username: 'admin', passwordHash, role: 'admin' });

    const alametler = [
      { titleTR: 'İlmin kaldırılması ve cehaletin artması', titleEN: 'Disappearance of knowledge and spread of ignorance', source: 'İslam', status: 'Oldu', descriptionTR: 'İlim azalacak, cehalet artacak.', descriptionEN: 'Knowledge will diminish and ignorance will spread.' },
      { titleTR: 'Depremlerin artması', titleEN: 'Increase in earthquakes', source: 'İslam', status: 'Olmak Üzere', descriptionTR: 'Büyük depremler sıklaşacak.', descriptionEN: 'Major earthquakes will become more frequent.' },
      { titleTR: 'Deccal\'in çıkışı', titleEN: 'Emergence of the Antichrist (Dajjal)', source: 'İslam', status: 'Olmadı', descriptionTR: 'Büyük fitne kaynağı olacak bir varlık.', descriptionEN: 'A being who will be a great source of tribulation.' },
      { titleTR: 'Hz. İsa\'nın dönüşü', titleEN: 'Return of Jesus', source: 'İslam', status: 'Olmadı', descriptionTR: 'Hz. İsa gökten inecek ve adaleti tesis edecek.', descriptionEN: 'Jesus will descend from heaven and establish justice.' },
      { titleTR: 'Ye\'cüc ve Me\'cüc\'ün çıkışı', titleEN: 'Release of Gog and Magog', source: 'İslam', status: 'Olmadı', descriptionTR: 'Büyük bir topluluk yeryüzüne yayılacak.', descriptionEN: 'A great horde will spread across the earth.' },
      { titleTR: 'Güneşin batıdan doğması', titleEN: 'Sun rising from the west', source: 'İslam', status: 'Olamayacak', descriptionTR: 'Metaforik olarak yorumlanır.', descriptionEN: 'Interpreted metaphorically.' },
      { titleTR: 'İkinci Geliş (Second Coming)', titleEN: 'Second Coming of Christ', source: 'Hristiyanlık', status: 'Olmadı', descriptionTR: 'Hz. İsa\'nın ikinci gelişi ve son yargı.', descriptionEN: 'The second coming of Christ and the final judgment.' },
      { titleTR: 'Büyük Sıkıntı Dönemi (Tribulation)', titleEN: 'The Great Tribulation', source: 'Hristiyanlık', status: 'Olmadı', descriptionTR: 'Yedi yıllık büyük sıkıntı dönemi.', descriptionEN: 'A seven-year period of great tribulation.' },
      { titleTR: 'Üçüncü Tapınak\'ın inşası', titleEN: 'Building of the Third Temple', source: 'Yahudilik', status: 'Olmadı', descriptionTR: 'Kudüs\'te Üçüncü Tapınak\'ın yeniden inşa edilmesi.', descriptionEN: 'Rebuilding of the Third Temple in Jerusalem.' },
      { titleTR: 'Mesih\'in gelişi (Maşiah)', titleEN: 'Coming of the Messiah (Mashiach)', source: 'Yahudilik', status: 'Olmadı', descriptionTR: 'Yahudi inancına göre Mesih henüz gelmedi.', descriptionEN: 'According to Jewish belief, the Messiah has not yet come.' },
      { titleTR: 'Kalki Avatar\'ın gelişi', titleEN: 'Coming of Kalki Avatar', source: 'Hinduizm', status: 'Olmadı', descriptionTR: 'Vishnu\'nun son avatarı Kalki gelecek.', descriptionEN: 'Kalki, the final avatar of Vishnu, will come.' },
      { titleTR: 'Kali Yuga\'nın sonu', titleEN: 'End of Kali Yuga', source: 'Hinduizm', status: 'Olmak Üzere', descriptionTR: 'Karanlık çağ sona erecek.', descriptionEN: 'The dark age will end.' },
      { titleTR: 'Maitreya Buda\'nın gelişi', titleEN: 'Coming of Maitreya Buddha', source: 'Budizm', status: 'Olmadı', descriptionTR: 'Gelecek Buda olarak Maitreya\'nın dünyaya gelmesi.', descriptionEN: 'The coming of Maitreya as the future Buddha.' },
      { titleTR: 'Ahlaki çöküş ve fitne', titleEN: 'Moral decay and widespread corruption', source: 'İslam', status: 'Oldu', descriptionTR: 'Toplumda ahlaki değerlerin çöküşü.', descriptionEN: 'The collapse of moral values in society.' },
      { titleTR: 'Fırat Nehri\'nin altın dağı açığa çıkarması', titleEN: 'Euphrates River revealing a mountain of gold', source: 'İslam', status: 'Olmak Üzere', descriptionTR: 'Fırat Nehri kuruyacak ve altından bir dağ ortaya çıkacak.', descriptionEN: 'The Euphrates will dry up revealing a mountain of gold.' }
    ];

    await Alamet.insertMany(alametler);
    res.json({ message: `Admin + ${alametler.length} alamet eklendi.` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// One-time history seed endpoint
app.get('/api/seed-history', async (req, res) => {
  try {
    const IndexPoint = require('./models/IndexPoint');
    const count = await IndexPoint.countDocuments();
    if (count > 500) return res.json({ message: `Zaten ${count} veri noktası var` });

    const HISTORICAL_EVENTS = [
      { year: -4000, value: 2, trigger: 'Dünyanın yaratılışı', magnitude: 'minimal' },
      { year: -3000, value: 3.5, trigger: 'İlk medeniyetler', magnitude: 'minimal' },
      { year: -2000, value: 5, trigger: 'Hz. İbrahim dönemi', magnitude: 'minor' },
      { year: -1500, value: 5.5, trigger: 'Hz. Musa ve Çıkış', magnitude: 'minor' },
      { year: -1200, value: 7, trigger: 'Tunç Çağı Çöküşü', magnitude: 'moderate' },
      { year: -586, value: 10, trigger: 'Kudüs\'ün yıkılışı', magnitude: 'moderate' },
      { year: -334, value: 9, trigger: 'İskender\'in fetihleri', magnitude: 'minor' },
      { year: 30, value: 8, trigger: 'Hz. İsa dönemi', magnitude: 'minor' },
      { year: 70, value: 14, trigger: 'İkinci Tapınağın yıkılışı', magnitude: 'moderate' },
      { year: 476, value: 16, trigger: 'Batı Roma\'nın çöküşü', magnitude: 'moderate' },
      { year: 632, value: 13, trigger: 'Hz. Muhammed\'in vefatı', magnitude: 'minor' },
      { year: 680, value: 15, trigger: 'Kerbela Olayı', magnitude: 'moderate' },
      { year: 1096, value: 18, trigger: 'Haçlı Seferleri', magnitude: 'moderate' },
      { year: 1258, value: 22, trigger: 'Moğol istilası - Bağdat düştü', magnitude: 'major' },
      { year: 1347, value: 30, trigger: 'Kara Veba - 75M ölü', magnitude: 'major' },
      { year: 1453, value: 20, trigger: 'İstanbul\'un fethi', magnitude: 'moderate' },
      { year: 1618, value: 23, trigger: '30 Yıl Savaşları - 8M ölü', magnitude: 'major' },
      { year: 1789, value: 22, trigger: 'Fransız Devrimi', magnitude: 'moderate' },
      { year: 1914, value: 38, trigger: 'I. Dünya Savaşı - 20M ölü', magnitude: 'major' },
      { year: 1918, value: 45, trigger: 'İspanyol Gribi - 50M ölü', magnitude: 'major' },
      { year: 1939, value: 55, trigger: 'II. Dünya Savaşı başladı', magnitude: 'major' },
      { year: 1945, value: 72, trigger: 'Hiroşima atom bombası', magnitude: 'major' },
      { year: 1962, value: 68, trigger: 'Küba Füze Krizi', magnitude: 'major' },
      { year: 1975, value: 48, trigger: 'Kamboçya soykırımı', magnitude: 'major' },
      { year: 1986, value: 56, trigger: 'Çernobil felaketi', magnitude: 'major' },
      { year: 1991, value: 38, trigger: 'Soğuk Savaş bitti', magnitude: 'moderate' },
      { year: 1994, value: 45, trigger: 'Ruanda Soykırımı - 800K ölü', magnitude: 'major' },
      { year: 2001, value: 55, trigger: '11 Eylül Saldırıları', magnitude: 'major' },
      { year: 2020, value: 60, trigger: 'COVID-19 Pandemisi', magnitude: 'major' },
      { year: 2022, month: 2, value: 65, trigger: 'Rusya-Ukrayna Savaşı', magnitude: 'major' },
      { year: 2023, month: 2, value: 58, trigger: 'Türkiye depremler - 50K+ ölü', magnitude: 'major' },
      { year: 2023, month: 10, value: 64, trigger: 'İsrail-Hamas Savaşı', magnitude: 'major' },
      { year: 2024, month: 4, value: 62, trigger: 'İran-İsrail gerilimi', magnitude: 'moderate' },
      { year: 2025, month: 3, value: 65, trigger: 'Küresel gerilim artışı', magnitude: 'moderate' },
      { year: 2026, month: 2, value: 73, trigger: 'İran bombardımanı', magnitude: 'major' },
    ];

    const points = [];
    for (let i = 0; i < HISTORICAL_EVENTS.length; i++) {
      const e = HISTORICAL_EVENTS[i];
      const d = new Date(e.year, (e.month || 1) - 1, 15);
      points.push({
        value: e.value,
        change: i > 0 ? e.value - HISTORICAL_EVENTS[i-1].value : 0,
        trigger: e.trigger,
        magnitude: e.magnitude,
        timestamp: d
      });
      // Interpolate between events
      if (i < HISTORICAL_EVENTS.length - 1) {
        const next = HISTORICAL_EVENTS[i+1];
        const nextD = new Date(next.year, (next.month || 1) - 1, 15);
        const steps = 3;
        for (let j = 1; j <= steps; j++) {
          const ratio = j / (steps + 1);
          const t = d.getTime() + (nextD.getTime() - d.getTime()) * ratio;
          const v = e.value + (next.value - e.value) * ratio + (Math.random() - 0.5) * 2;
          points.push({
            value: Math.round(Math.max(0, Math.min(100, v)) * 100) / 100,
            change: 0, trigger: '', magnitude: 'minimal',
            timestamp: new Date(t)
          });
        }
      }
    }

    await IndexPoint.insertMany(points);
    res.json({ message: `${points.length} tarihsel veri noktası eklendi.` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('MongoDB bağlantısı başarılı');
    startEngine(10000); // Generate index tick every 10 seconds
    app.listen(PORT, () => {
      console.log(`Sunucu http://localhost:${PORT} adresinde çalışıyor`);
    });
  })
  .catch(err => {
    console.error('MongoDB bağlantı hatası:', err.message);
    process.exit(1);
  });
