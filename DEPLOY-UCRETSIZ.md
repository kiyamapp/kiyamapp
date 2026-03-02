# KıyamApp - Ücretsiz Deploy Rehberi

Bu rehber, KıyamApp projesini **tamamen ücretsiz** olarak internete açmanızı adım adım anlatır.

---

## Ücretsiz Stack

| Katman | Servis | Ücretsiz Limit |
|--------|--------|----------------|
| **Frontend** | [Vercel](https://vercel.com/) | 100GB bant genişliği/ay, sınırsız deploy |
| **Backend** | [Render](https://render.com/) | 750 saat/ay, 15dk sonra uyku modu |
| **Veritabanı** | [MongoDB Atlas](https://mongodb.com/atlas) | 512MB depolama, M0 Sandbox |
| **Domain** | Ücretsiz subdomain | `kiyamapp.vercel.app` + `kiyamapp.onrender.com` |

**Toplam maliyet: 0₺/ay**

---

## Adım 1: GitHub'a Yükleyin

Projeniz zaten git repo'su. GitHub'a push edin:

```bash
cd "C:/Users/PC/Downloads/Kıyamapp"

# .gitignore oluşturun (yoksa)
cat > .gitignore << 'EOF'
node_modules/
dist/
.env
.DS_Store
EOF

git add .
git commit -m "Initial commit"
git remote add origin https://github.com/KULLANICIADI/kiyamapp.git
git push -u origin main
```

> **Önemli:** `.env` dosyasını kesinlikle commit etmeyin! İçinde `MONGO_URI` ve `JWT_SECRET` gibi gizli bilgiler var.

---

## Adım 2: MongoDB Atlas (Ücretsiz Veritabanı)

1. [mongodb.com/atlas](https://www.mongodb.com/atlas) → **Try Free** → Hesap oluşturun
2. **Create a Deployment** → **M0 FREE** seçin
3. Provider: AWS, Bölge: `eu-central-1` (Frankfurt) veya yakın bölge
4. Cluster adı: `kiyamapp-cluster`
5. **Create Deployment**

### Veritabanı Kullanıcısı Oluşturma:
1. Sol menü → **Database Access** → **Add New Database User**
2. Authentication: Password
3. Username: `kiyamapp`
4. Password: Güçlü bir şifre (Auto-generate önerilir, kopyalayın!)
5. **Built-in Role**: `Read and write to any database`
6. **Add User**

### Ağ Erişimi Açma:
1. Sol menü → **Network Access** → **Add IP Address**
2. **Allow Access from Anywhere** → `0.0.0.0/0`
3. **Confirm**

### Connection String Alma:
1. Sol menü → **Database** → **Connect** → **Drivers**
2. Connection string'i kopyalayın:

```
mongodb+srv://kiyamapp:<password>@kiyamapp-cluster.xxxxx.mongodb.net/kiyamapp?retryWrites=true&w=majority
```

> `<password>` kısmını az önce oluşturduğunuz şifre ile değiştirin.

---

## Adım 3: Kod Değişiklikleri (Production Hazırlığı)

### 3a. Frontend: API Base URL'i Environment Variable Yapın

Şu anda tüm API çağrıları `/api/...` şeklinde ve Vite proxy ile çalışıyor. Production'da frontend ve backend farklı domainlerde olacağı için bu proxy çalışmaz.

**`client/src/api.js` dosyası oluşturun:**

```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '',
});

export default api;
```

**Tüm sayfalarda `axios` import'unu değiştirin:**

**`client/src/pages/Home.jsx`:**
```javascript
// ÖNCE:
import axios from 'axios';

// SONRA:
import api from '../api';

// Tüm axios.get, axios.post çağrılarını api.get, api.post yapın
// Örnek:
// axios.get('/api/alamet')  →  api.get('/api/alamet')
```

**`client/src/pages/AdminLogin.jsx`:**
```javascript
// ÖNCE:
import axios from 'axios';
const res = await axios.post('/api/admin/login', { username, password });

// SONRA:
import api from '../api';
const res = await api.post('/api/admin/login', { username, password });
```

**`client/src/pages/AdminPanel.jsx`:**
```javascript
// ÖNCE:
import axios from 'axios';
const authApi = axios.create({
  headers: { Authorization: `Bearer ${token}` }
});

// SONRA:
import api from '../api';
const authApi = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '',
  headers: { Authorization: `Bearer ${token}` }
});

// Ayrıca dosyadaki diğer axios çağrılarını da api ile değiştirin
```

**`client/src/pages/ApocalypseIndex.jsx`:**
```javascript
// ÖNCE:
import axios from 'axios';
axios.get('/api/index/current')
axios.get(`/api/index/history?period=${period}`)
axios.get('/api/index/news')

// SONRA:
import api from '../api';
api.get('/api/index/current')
api.get(`/api/index/history?period=${period}`)
api.get('/api/index/news')
```

### 3b. Vite Config Güncelleme

`client/vite.config.js`:

```javascript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => ({
  plugins: [react()],
  server: {
    proxy: mode === 'development' ? {
      '/api': 'http://localhost:5000'
    } : undefined
  }
}));
```

> Bu sayede `npm run dev` çalışırken proxy aktif, `npm run build` production için proxy olmadan çalışır.

### 3c. Backend: CORS Ayarı

`server/index.js`'de CORS'u production için güncelleyin:

```javascript
// ÖNCE:
app.use(cors());

// SONRA:
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
```

### 3d. Değişiklikleri Commit Edin

```bash
git add client/src/api.js client/vite.config.js server/index.js
git add client/src/pages/Home.jsx client/src/pages/AdminLogin.jsx
git add client/src/pages/AdminPanel.jsx client/src/pages/ApocalypseIndex.jsx
git commit -m "Production deploy hazırlığı: API URL env var, CORS ayarı"
git push
```

---

## Adım 4: Backend'i Deploy Edin (Render)

1. [render.com](https://render.com/) → **Get Started for Free** → GitHub ile giriş
2. **New** → **Web Service**
3. **Connect a repository** → GitHub repo'nuzu seçin
4. Ayarlar:

| Alan | Değer |
|------|-------|
| **Name** | `kiyamapp-api` |
| **Region** | Frankfurt (EU Central) |
| **Root Directory** | `server` |
| **Runtime** | Node |
| **Build Command** | `npm install` |
| **Start Command** | `node index.js` |
| **Instance Type** | Free |

5. **Environment Variables** → Şunları ekleyin:

| Key | Value |
|-----|-------|
| `MONGO_URI` | `mongodb+srv://kiyamapp:<sifre>@kiyamapp-cluster.xxxxx.mongodb.net/kiyamapp?retryWrites=true&w=majority` |
| `JWT_SECRET` | (aşağıdaki komutla oluşturun) |
| `ALLOWED_ORIGINS` | `https://kiyamapp.vercel.app` |

```bash
# Güçlü JWT_SECRET oluşturma:
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

6. **Create Web Service** → Deploy başlar (2-3 dakika)
7. Deploy tamamlanınca URL'niz hazır: `https://kiyamapp-api.onrender.com`
8. Test edin: `https://kiyamapp-api.onrender.com/api/health` → `{"status":"ok"}`

---

## Adım 5: Frontend'i Deploy Edin (Vercel)

1. [vercel.com](https://vercel.com/) → **Sign Up** → GitHub ile giriş
2. **Add New Project** → GitHub repo'nuzu seçin
3. Ayarlar:

| Alan | Değer |
|------|-------|
| **Framework Preset** | Vite |
| **Root Directory** | `client` |
| **Build Command** | `npm run build` |
| **Output Directory** | `dist` |

4. **Environment Variables**:

| Key | Value |
|-----|-------|
| `VITE_API_URL` | `https://kiyamapp-api.onrender.com` |

> **Önemli:** `VITE_` prefix'i zorunlu. Vite sadece `VITE_` ile başlayan değişkenleri client-side bundle'a dahil eder.

5. **Deploy** → 1-2 dakika içinde hazır
6. URL'niz: `https://kiyamapp.vercel.app` (veya benzeri)

---

## Adım 6: CORS Güncelleme

Backend'deki (Render) `ALLOWED_ORIGINS` env var'ını Vercel'in verdiği gerçek URL ile güncelleyin:

```
ALLOWED_ORIGINS=https://kiyamapp.vercel.app
```

> Birden fazla domain eklemek için virgülle ayırın:
> `https://kiyamapp.vercel.app,https://kiyamapp-git-main-user.vercel.app`

Render Dashboard → servisiniz → **Environment** → değeri güncelleyin → **Save Changes** → otomatik redeploy.

---

## Adım 7: Veritabanını Seed Edin

İlk kez deploy ettikten sonra admin kullanıcısı ve başlangıç verileri yükleyin:

```bash
# Lokal makinenizden çalıştırın:
cd server
MONGO_URI="mongodb+srv://kiyamapp:<sifre>@cluster.xxxxx.mongodb.net/kiyamapp?retryWrites=true&w=majority" node seed.js
```

Windows PowerShell kullanıyorsanız:
```powershell
$env:MONGO_URI="mongodb+srv://kiyamapp:<sifre>@cluster.xxxxx.mongodb.net/kiyamapp?retryWrites=true&w=majority"
node seed.js
```

---

## Adım 8: Test Edin

| Test | URL | Beklenen |
|------|-----|----------|
| Backend Health | `https://kiyamapp-api.onrender.com/api/health` | `{"status":"ok"}` |
| Frontend | `https://kiyamapp.vercel.app` | Anasayfa yüklenmeli |
| Alamet Listesi | Anasayfa'da kıyamet alametleri görünmeli | Veriler listelenmeli |
| Admin Login | `/admin` → giriş yapın | Token alınmalı |
| Kıyamet İndeksi | `/index` sayfası | Canlı indeks + grafik |

---

## Ücretsiz Tier Limitleri ve Dikkat Edilecekler

### Render Free Tier (Backend)
| Limit | Detay |
|-------|-------|
| **Uyku modu** | 15 dakika istek gelmezse servis uyur |
| **Cold start** | Uyuduktan sonra ilk istek ~30-50 saniye sürer |
| **CPU/RAM** | 512MB RAM, paylaşımlı CPU |
| **Bant genişliği** | 100GB/ay |
| **Build süresi** | 750 saat/ay |

> **Index Engine Sorunu:** Servis uyuduğunda `setInterval(generateTick, 10000)` durur. Tekrar uyanınca index engine yeniden başlar ama aradaki veriler eksik kalır.

**Çözüm - Ücretsiz Ping Servisi:**
1. [cron-job.org](https://cron-job.org/) → Ücretsiz hesap
2. Yeni cron job: `GET https://kiyamapp-api.onrender.com/api/health`
3. Aralık: **Her 10 dakikada bir**
4. Bu sayede servis hiç uyumaz (ama Render TOS'a dikkat edin)

### MongoDB Atlas Free Tier (Veritabanı)
| Limit | Detay |
|-------|-------|
| **Depolama** | 512MB |
| **RAM** | Paylaşımlı |
| **Bağlantı** | Maks. 500 bağlantı |
| **Backup** | Yok (manual export yapın) |

> **Depolama Uyarısı:** Index engine her 10 saniyede bir `IndexPoint` kaydı oluşturur:
> - Günde: ~8,640 kayıt
> - Ayda: ~259,200 kayıt
> - Her kayıt ~200 byte → ayda ~50MB
>
> **Çözüm:** Eski IndexPoint kayıtlarını düzenli temizleyin. Basit bir cleanup script:

```javascript
// server/cleanup.js
require('dotenv').config();
const mongoose = require('mongoose');
const IndexPoint = require('./models/IndexPoint');

async function cleanup() {
  await mongoose.connect(process.env.MONGO_URI);

  // 30 günden eski kayıtları sil
  const cutoff = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const result = await IndexPoint.deleteMany({ timestamp: { $lt: cutoff } });

  console.log(`${result.deletedCount} eski kayıt silindi`);
  await mongoose.disconnect();
}

cleanup().catch(console.error);
```

### Vercel Free Tier (Frontend)
| Limit | Detay |
|-------|-------|
| **Bant genişliği** | 100GB/ay |
| **Build** | 6000 dakika/ay |
| **Serverless Functions** | 100GB-saat/ay |
| **Projeler** | Sınırsız |
| **Uyku modu** | Yok! Statik dosyalar her zaman erişilebilir |

> Frontend için Vercel ücretsiz tier fazlasıyla yeterlidir.

---

## Alternatif: Netlify (Frontend)

Vercel yerine Netlify de kullanabilirsiniz:

1. [netlify.com](https://www.netlify.com/) → GitHub ile giriş
2. **Add new site** → **Import an existing project** → Repo seçin
3. Ayarlar:

| Alan | Değer |
|------|-------|
| **Base directory** | `client` |
| **Build command** | `npm run build` |
| **Publish directory** | `client/dist` |

4. **Environment variables** → `VITE_API_URL` = backend URL
5. **Deploy site**

> Netlify'da SPA routing için `client/public/_redirects` dosyası oluşturun:
```
/*    /index.html   200
```

---

## Alternatif: Railway (Backend)

Render yerine Railway daha iyi performans sunar:

1. [railway.app](https://railway.app/) → GitHub ile giriş
2. **New Project** → **Deploy from GitHub repo**
3. Repo seçin → Root directory: `server`
4. Environment variables ekleyin (Render ile aynı)
5. Deploy

| Özellik | Render Free | Railway Starter |
|---------|-------------|-----------------|
| Uyku modu | 15dk sonra uyur | Uyumaz |
| Kredi | 750 saat/ay | $5/ay kredi (ücretsiz) |
| RAM | 512MB | 512MB |
| Cold start | 30-50sn | Yok |

> Railway'de her ay $5 ücretsiz kredi var. KıyamApp backend'i bunu aşmaz.

---

## Hızlı Başlangıç Özeti

```
1. MongoDB Atlas → Ücretsiz cluster oluştur → Connection string al
2. Kodu güncelle → api.js, CORS, vite.config.js
3. GitHub'a push et
4. Render/Railway → Backend deploy → Env vars ekle
5. Vercel → Frontend deploy → VITE_API_URL ekle
6. CORS origin'i güncelle
7. Seed script'ini çalıştır
8. Test et!
```

---

## Sorun Giderme

### "Network Error" veya CORS hatası
- Backend `ALLOWED_ORIGINS` env var'ında frontend URL'niz var mı?
- Frontend `VITE_API_URL` doğru mu? Sonunda `/` olmamalı.
- Backend çalışıyor mu? `/api/health` endpoint'ini kontrol edin.

### Frontend yükleniyor ama veri gelmiyor
- Tarayıcı Console'unu açın (F12) → Network sekmesi
- API isteklerinin doğru URL'ye gittiğini kontrol edin
- `VITE_API_URL` env var'ı Vercel'de ayarlandıktan sonra **redeploy** gerekir

### Backend uyandıktan sonra indeks verisi yok
- Bu normaldir. Render free tier uyuduktan sonra index engine yeniden başlar.
- Geçmiş verileri `seedHistory.js` ile doldurabilirsiniz.
- Cron-job ile ping atarak uyumasını engelleyin.

### MongoDB bağlantı hatası
- Atlas'ta **Network Access** → `0.0.0.0/0` eklendi mi?
- Connection string'deki şifrede özel karakter varsa URL encode edin (`@` → `%40`)
- Cluster'ın aktif olduğunu Atlas dashboard'dan kontrol edin.

### Vercel deploy başarısız
- Root directory `client` olarak ayarlandı mı?
- `package.json`'daki `build` script'i `vite build` mi?
- Node.js versiyonu uyumlu mu? Vercel Settings → General → Node.js Version → 18.x
