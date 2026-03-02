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
