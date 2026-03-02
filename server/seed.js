require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Admin = require('./models/Admin');
const Alamet = require('./models/Alamet');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/kiyamapp';

const alametler = [
  {
    titleTR: 'İlmin kaldırılması ve cehaletin artması',
    titleEN: 'Disappearance of knowledge and spread of ignorance',
    source: 'İslam',
    status: 'Oldu',
    descriptionTR: 'İlim azalacak, cehalet artacak. Hadis kaynaklarında geçer.',
    descriptionEN: 'Knowledge will diminish and ignorance will spread. Mentioned in hadith sources.'
  },
  {
    titleTR: 'Depremlerin artması',
    titleEN: 'Increase in earthquakes',
    source: 'İslam',
    status: 'Olmak Üzere',
    descriptionTR: 'Büyük depremler sıklaşacak.',
    descriptionEN: 'Major earthquakes will become more frequent.'
  },
  {
    titleTR: 'Deccal\'in çıkışı',
    titleEN: 'Emergence of the Antichrist (Dajjal)',
    source: 'İslam',
    status: 'Olmadı',
    descriptionTR: 'Büyük fitne kaynağı olacak bir varlık.',
    descriptionEN: 'A being who will be a great source of tribulation.'
  },
  {
    titleTR: 'Hz. İsa\'nın dönüşü',
    titleEN: 'Return of Jesus',
    source: 'İslam',
    status: 'Olmadı',
    descriptionTR: 'Hz. İsa gökten inecek ve adaleti tesis edecek.',
    descriptionEN: 'Jesus will descend from heaven and establish justice.'
  },
  {
    titleTR: 'Ye\'cüc ve Me\'cüc\'ün çıkışı',
    titleEN: 'Release of Gog and Magog',
    source: 'İslam',
    status: 'Olmadı',
    descriptionTR: 'Büyük bir topluluk yeryüzüne yayılacak.',
    descriptionEN: 'A great horde will spread across the earth.'
  },
  {
    titleTR: 'Güneşin batıdan doğması',
    titleEN: 'Sun rising from the west',
    source: 'İslam',
    status: 'Olamayacak',
    descriptionTR: 'Metaforik olarak yorumlanır; tövbe kapısının kapanması.',
    descriptionEN: 'Interpreted metaphorically; the closing of the door of repentance.'
  },
  {
    titleTR: 'İkinci Geliş (Second Coming)',
    titleEN: 'Second Coming of Christ',
    source: 'Hristiyanlık',
    status: 'Olmadı',
    descriptionTR: 'Hz. İsa\'nın ikinci gelişi ve son yargı.',
    descriptionEN: 'The second coming of Christ and the final judgment.'
  },
  {
    titleTR: 'Büyük Sıkıntı Dönemi (Tribulation)',
    titleEN: 'The Great Tribulation',
    source: 'Hristiyanlık',
    status: 'Olmadı',
    descriptionTR: 'Yedi yıllık büyük sıkıntı dönemi.',
    descriptionEN: 'A seven-year period of great tribulation.'
  },
  {
    titleTR: 'Üçüncü Tapınak\'ın inşası',
    titleEN: 'Building of the Third Temple',
    source: 'Yahudilik',
    status: 'Olmadı',
    descriptionTR: 'Kudüs\'te Üçüncü Tapınak\'ın yeniden inşa edilmesi.',
    descriptionEN: 'Rebuilding of the Third Temple in Jerusalem.'
  },
  {
    titleTR: 'Mesih\'in gelişi (Maşiah)',
    titleEN: 'Coming of the Messiah (Mashiach)',
    source: 'Yahudilik',
    status: 'Olmadı',
    descriptionTR: 'Yahudi inancına göre Mesih henüz gelmedi.',
    descriptionEN: 'According to Jewish belief, the Messiah has not yet come.'
  },
  {
    titleTR: 'Kalki Avatar\'ın gelişi',
    titleEN: 'Coming of Kalki Avatar',
    source: 'Hinduizm',
    status: 'Olmadı',
    descriptionTR: 'Vishnu\'nun son avatarı Kalki gelecek ve kötülüğü yok edecek.',
    descriptionEN: 'Kalki, the final avatar of Vishnu, will come and destroy evil.'
  },
  {
    titleTR: 'Kali Yuga\'nın sonu',
    titleEN: 'End of Kali Yuga',
    source: 'Hinduizm',
    status: 'Olmak Üzere',
    descriptionTR: 'Karanlık çağ sona erecek, yeni bir altın çağ başlayacak.',
    descriptionEN: 'The dark age will end and a new golden age will begin.'
  },
  {
    titleTR: 'Maitreya Buda\'nın gelişi',
    titleEN: 'Coming of Maitreya Buddha',
    source: 'Budizm',
    status: 'Olmadı',
    descriptionTR: 'Gelecek Buda olarak Maitreya\'nın dünyaya gelmesi.',
    descriptionEN: 'The coming of Maitreya as the future Buddha.'
  },
  {
    titleTR: 'Ahlaki çöküş ve fitne',
    titleEN: 'Moral decay and widespread corruption',
    source: 'İslam',
    status: 'Oldu',
    descriptionTR: 'Toplumda ahlaki değerlerin çöküşü.',
    descriptionEN: 'The collapse of moral values in society.'
  },
  {
    titleTR: 'Fırat Nehri\'nin altın dağı açığa çıkarması',
    titleEN: 'Euphrates River revealing a mountain of gold',
    source: 'İslam',
    status: 'Olmak Üzere',
    descriptionTR: 'Fırat Nehri kuruyacak ve altından bir dağ ortaya çıkacak.',
    descriptionEN: 'The Euphrates will dry up revealing a mountain of gold.'
  }
];

async function seed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('MongoDB bağlantısı başarılı');

    // Clear existing data
    await Admin.deleteMany({});
    await Alamet.deleteMany({});

    // Create admin
    const passwordHash = await bcrypt.hash('admin123', 10);
    await Admin.create({ username: 'admin', passwordHash, role: 'admin' });
    console.log('Admin kullanıcı oluşturuldu (admin / admin123)');

    // Create alametler
    await Alamet.insertMany(alametler);
    console.log(`${alametler.length} alamet eklendi`);

    await mongoose.disconnect();
    console.log('Seed tamamlandı!');
  } catch (err) {
    console.error('Seed hatası:', err.message);
    process.exit(1);
  }
}

seed();
