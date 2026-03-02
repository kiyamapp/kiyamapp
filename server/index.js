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
    if (allowedOrigins.includes(origin)) {
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
app.post('/api/seed', async (req, res) => {
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
