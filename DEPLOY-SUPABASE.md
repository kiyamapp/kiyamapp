# KıyamApp - Supabase ile Deploy Rehberi

Bu rehber, KıyamApp projesini **Supabase** ekosistemini kullanarak internete açmanızı adım adım anlatır.

---

## Mimari Özet

| Katman | Servis | Açıklama |
|--------|--------|----------|
| **Frontend** | Vercel | React (Vite) statik build |
| **Backend** | Railway veya Render | Express API + Index Engine |
| **Veritabanı** | MongoDB Atlas (ücretsiz) | Mongoose şemaları korunur |
| **Auth & Storage** | Supabase | Opsiyonel: Auth, dosya depolama |

> **Not:** Supabase PostgreSQL kullanır, KıyamApp ise MongoDB/Mongoose üzerine kurulu. Tüm veritabanı kodunu PostgreSQL'e çevirmek büyük bir iş. Bu rehberde **MongoDB Atlas ücretsiz tier'i veritabanı olarak korunur**, Supabase ise **auth ve/veya storage** katmanı olarak opsiyonel kullanılır.

---

## Ön Gereksinimler

- [Node.js](https://nodejs.org/) v18+
- Git ve GitHub hesabı
- [Supabase](https://supabase.com/) hesabı (ücretsiz)
- [MongoDB Atlas](https://www.mongodb.com/atlas) hesabı (ücretsiz)
- [Vercel](https://vercel.com/) hesabı (ücretsiz)
- [Railway](https://railway.app/) veya [Render](https://render.com/) hesabı

---

## Adım 1: MongoDB Atlas Kurulumu

1. [MongoDB Atlas](https://www.mongodb.com/atlas) → **Create a Free Cluster**
2. **M0 Sandbox** (ücretsiz, 512MB) seçin
3. Bölge: `eu-central-1` (Avrupa) veya size en yakın
4. **Database Access** → Kullanıcı oluşturun (username/password)
5. **Network Access** → `0.0.0.0/0` ekleyin (tüm IP'lere izin ver)
6. **Connect** → **Connect your application** → Connection string'i kopyalayın:

```
mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/kiyamapp?retryWrites=true&w=majority
```

> Bu string'i `MONGO_URI` environment variable olarak kullanacaksınız.

---

## Adım 2: Supabase Projesi Oluşturma

1. [Supabase Dashboard](https://app.supabase.com/) → **New Project**
2. Proje adı: `kiyamapp`
3. Veritabanı şifresi belirleyin (MongoDB'den bağımsız, Supabase'in kendi PostgreSQL'i için)
4. Bölge: En yakın sunucuyu seçin
5. **Settings** → **API** → Şu bilgileri not edin:
   - `Project URL` → `https://xxxxx.supabase.co`
   - `anon public key`
   - `service_role key` (gizli tutun!)

### Supabase Auth Kullanmak İsterseniz (Opsiyonel)

Mevcut JWT auth yerine Supabase Auth kullanabilirsiniz. Bu durumda:

**a) Supabase istemcisini backend'e ekleyin:**

```bash
cd server
npm install @supabase/supabase-js
```

**b) `server/lib/supabase.js` oluşturun:**

```javascript
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

module.exports = supabase;
```

**c) Auth middleware'i güncelleyin (`server/middleware/auth.js`):**

```javascript
const supabase = require('../lib/supabase');

async function auth(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token gerekli' });
  }

  try {
    const token = header.split(' ')[1];
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ error: 'Geçersiz token' });
    }

    req.admin = { id: user.id, email: user.email };
    next();
  } catch {
    return res.status(401).json({ error: 'Geçersiz token' });
  }
}

module.exports = { auth };
```

> **Tavsiye:** Auth geçişi karmaşık olabilir. İlk deploy'da mevcut JWT auth'u koruyun, sonra geçiş yapın.

---

## Adım 3: Kod Değişiklikleri (Production Hazırlığı)

### 3a. Frontend: API URL'yi Environment Variable Yapın

`client/src/api.js` dosyası oluşturun:

```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '',
});

export default api;
```

Frontend'deki tüm `axios` import'larını bu dosyayla değiştirin:

```javascript
// ÖNCE (her dosyada):
import axios from 'axios';
axios.get('/api/alamet');

// SONRA:
import api from '../api';
api.get('/api/alamet');
```

Değiştirilecek dosyalar:
- `client/src/pages/Home.jsx`
- `client/src/pages/AdminLogin.jsx`
- `client/src/pages/AdminPanel.jsx`
- `client/src/pages/ApocalypseIndex.jsx`

> `AdminPanel.jsx`'deki `axios.create()` çağrısını da güncelleyin:

```javascript
// ÖNCE:
const authApi = axios.create({
  headers: { Authorization: `Bearer ${token}` }
});

// SONRA:
import api from '../api';
const authApi = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '',
  headers: { Authorization: `Bearer ${token}` }
});
```

### 3b. Frontend: Vite Config - Production Build

`client/vite.config.js` dosyasını güncelleyin:

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

### 3c. Backend: CORS Production Ayarı

`server/index.js`'de CORS'u güncelleyin:

```javascript
// ÖNCE:
app.use(cors());

// SONRA:
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',')
  : ['http://localhost:5173'];

app.use(cors({
  origin: function (origin, callback) {
    // Server-to-server isteklerde origin olmaz
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error('CORS izni yok'), false);
  },
  credentials: true
}));
```

---

## Adım 4: Backend'i Deploy Edin (Railway)

### Railway ile:

1. [Railway](https://railway.app/) → GitHub ile giriş
2. **New Project** → **Deploy from GitHub repo**
3. Repo'nuzu seçin, **root directory** olarak `server` belirtin
4. **Variables** sekmesinde şunları ekleyin:

```env
MONGO_URI=mongodb+srv://<user>:<pass>@cluster0.xxxxx.mongodb.net/kiyamapp?retryWrites=true&w=majority
JWT_SECRET=cok-guclu-rastgele-bir-deger-buraya-yazin-64-karakter
PORT=5000
ALLOWED_ORIGINS=https://kiyamapp.vercel.app
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_KEY=eyJhbGciOi...
```

5. **Settings** → **Start Command**: `npm start`
6. Deploy tamamlanınca Railway size bir URL verir: `https://kiyamapp-production.up.railway.app`

### Render ile (Alternatif):

1. [Render](https://render.com/) → **New Web Service**
2. GitHub repo bağlayın
3. **Root Directory**: `server`
4. **Build Command**: `npm install`
5. **Start Command**: `node index.js`
6. Environment variables'ları yukarıdaki gibi ekleyin
7. **Free** plan seçin

> **Uyarı (Render Free Tier):** 15 dakika inaktiften sonra servis uyur. Index engine durur ve tekrar istek gelince ~30sn cold start yaşanır. Production için Railway veya Render paid plan ($7/ay) önerilir.

---

## Adım 5: Frontend'i Deploy Edin (Vercel)

1. [Vercel](https://vercel.com/) → **Import Project** → GitHub repo seçin
2. **Framework Preset**: Vite
3. **Root Directory**: `client`
4. **Build Command**: `npm run build`
5. **Output Directory**: `dist`
6. **Environment Variables**:

```env
VITE_API_URL=https://kiyamapp-production.up.railway.app
```

> `VITE_` prefix'i zorunlu! Vite sadece `VITE_` ile başlayan env var'ları client bundle'a dahil eder.

7. **Deploy** → URL'niz hazır: `https://kiyamapp.vercel.app`

---

## Adım 6: CORS ve Env Ayarlarını Senkronize Edin

Backend'deki `ALLOWED_ORIGINS` değerini Vercel URL'niz ile güncelleyin:

```env
ALLOWED_ORIGINS=https://kiyamapp.vercel.app,https://kiyamapp-git-main-username.vercel.app
```

---

## Adım 7: Veritabanını Seed Edin

İlk deploy sonrası admin kullanıcısı ve alamet verilerini yükleyin:

```bash
# Lokal makineden, production MongoDB'ye bağlanarak:
MONGO_URI="mongodb+srv://..." node server/seed.js
```

---

## Adım 8: Test Edin

1. `https://kiyamapp.vercel.app` açın → Anasayfa yüklenmeli
2. `/admin` sayfasına gidin → Login olun
3. `/index` sayfası → Kıyamet indeksi canlı güncellenmeyi
4. Backend health check: `https://your-backend-url/api/health`

---

## Environment Variables Özeti

### Backend (Railway/Render)

| Değişken | Değer | Açıklama |
|----------|-------|----------|
| `MONGO_URI` | `mongodb+srv://...` | MongoDB Atlas connection string |
| `JWT_SECRET` | Rastgele 64+ karakter | JWT imzalama anahtarı |
| `PORT` | Platform sağlar | Otomatik atanır |
| `ALLOWED_ORIGINS` | `https://kiyamapp.vercel.app` | CORS izinli domainler |
| `SUPABASE_URL` | `https://xxx.supabase.co` | Opsiyonel: Supabase Auth kullanılıyorsa |
| `SUPABASE_SERVICE_KEY` | `eyJ...` | Opsiyonel: Supabase Auth kullanılıyorsa |

### Frontend (Vercel)

| Değişken | Değer | Açıklama |
|----------|-------|----------|
| `VITE_API_URL` | `https://backend-url.com` | Backend API adresi |
| `VITE_SUPABASE_URL` | `https://xxx.supabase.co` | Opsiyonel: Client-side Supabase |
| `VITE_SUPABASE_ANON_KEY` | `eyJ...` | Opsiyonel: Client-side Supabase |

---

## Güçlü JWT_SECRET Oluşturma

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

---

## Dikkat Edilecekler

1. **Index Engine & Free Tier Sleep:** Render free tier'da servis 15dk sonra uyur. Index engine durur, veriler o süre içinde güncellenmez. Çözüm:
   - Railway starter plan (uyumaz)
   - Cron-job.org ile her 10dk health check ping'i
   - Render paid plan ($7/ay)

2. **MongoDB Atlas Free Tier Limitleri:**
   - 512MB depolama
   - Paylaşımlı RAM
   - 100 bağlantı limiti
   - Index engine 10sn'de bir yazıyor → günde ~8,640 IndexPoint kaydı → düzenli temizlik gerekebilir

3. **Google News RSS:** Backend sunucudan çekiliyor (CORS sorunu yok). Bazı hosting platformlarında Google RSS engellenmiş olabilir → test edin.

4. **Supabase Free Tier Limitleri:**
   - 500MB veritabanı
   - 1GB dosya depolama
   - 50,000 aktif kullanıcı/ay (auth)
   - 2 milyon Edge Function çağrısı/ay
   - KıyamApp için fazlasıyla yeterli

---

## Supabase'i Tam Veritabanı Olarak Kullanmak (İleri Seviye)

MongoDB yerine Supabase PostgreSQL kullanmak isterseniz, tüm Mongoose modellerini Supabase tablolarına çevirmeniz gerekir:

### Tablo Oluşturma (Supabase SQL Editor):

```sql
-- Alamet tablosu
CREATE TABLE alamet (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title_tr TEXT NOT NULL,
  title_en TEXT NOT NULL,
  source TEXT NOT NULL,
  status TEXT CHECK (status IN ('Oldu', 'Olmak Üzere', 'Olmadı', 'Olamayacak')) DEFAULT 'Olmadı',
  description_tr TEXT DEFAULT '',
  description_en TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- IndexPoint tablosu
CREATE TABLE index_point (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  value NUMERIC(6,2) NOT NULL,
  change NUMERIC(8,4) DEFAULT 0,
  magnitude TEXT CHECK (magnitude IN ('minimal', 'minor', 'moderate', 'major')) DEFAULT 'minimal',
  trigger TEXT DEFAULT '',
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_index_point_timestamp ON index_point(timestamp);

-- Admin tablosu
CREATE TABLE admin (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT DEFAULT 'admin',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

> **Bu yol büyük bir refactor gerektirir.** Tüm Mongoose çağrılarını (`find`, `create`, `findOne`, vb.) Supabase JS Client çağrılarına (`select`, `insert`, `eq`, vb.) çevirmeniz gerekir. İlk deploy için MongoDB Atlas + Supabase Auth yaklaşımı çok daha pratiktir.
