const express = require('express');
const router = express.Router();
const IndexPoint = require('../models/IndexPoint');
const { calculateNewsDelta, getCelestialBoost } = require('../services/indexEngine');

// GET /api/index/current - latest value + daily stats
router.get('/current', async (req, res) => {
  try {
    const latest = await IndexPoint.findOne().sort({ timestamp: -1 }).lean();
    if (!latest) return res.json({ value: 0, change: 0, timestamp: new Date() });

    // Get today's opening value
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const dayOpen = await IndexPoint.findOne({ timestamp: { $gte: todayStart } })
      .sort({ timestamp: 1 }).lean();

    // Get today's high/low
    const todayPoints = await IndexPoint.find({ timestamp: { $gte: todayStart } })
      .select('value').lean();
    const values = todayPoints.map(p => p.value);

    const openValue = dayOpen ? dayOpen.value : latest.value;
    const dailyChange = latest.value - openValue;
    const dailyChangePercent = openValue ? ((dailyChange / openValue) * 100) : 0;

    res.json({
      value: latest.value,
      change: Math.round(dailyChange * 100) / 100,
      changePercent: Math.round(dailyChangePercent * 100) / 100,
      tickChange: latest.change,
      magnitude: latest.magnitude,
      trigger: latest.trigger,
      timestamp: latest.timestamp,
      open: openValue,
      high: values.length ? Math.max(...values) : latest.value,
      low: values.length ? Math.min(...values) : latest.value
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/index/history?period=5m|15m|1H|1D|1W|1M|3M|ALL
router.get('/history', async (req, res) => {
  try {
    const period = req.query.period || '1D';
    const since = new Date();
    let maxPoints = 300;

    switch (period) {
      case '5m':  since.setMinutes(since.getMinutes() - 5); maxPoints = 60; break;
      case '15m': since.setMinutes(since.getMinutes() - 15); maxPoints = 90; break;
      case '1H':  since.setHours(since.getHours() - 1); maxPoints = 120; break;
      case '1D':  since.setDate(since.getDate() - 1); maxPoints = 200; break;
      case '1W':  since.setDate(since.getDate() - 7); maxPoints = 300; break;
      case '1M':  since.setMonth(since.getMonth() - 1); maxPoints = 400; break;
      case '3M':  since.setMonth(since.getMonth() - 3); maxPoints = 400; break;
      case '1Y':  since.setFullYear(since.getFullYear() - 1); maxPoints = 400; break;
      case '10Y': since.setFullYear(since.getFullYear() - 10); maxPoints = 400; break;
      case '100Y': since.setFullYear(since.getFullYear() - 100); maxPoints = 500; break;
      case 'ALL': since.setFullYear(-4100); maxPoints = 600; break;
      default:    since.setDate(since.getDate() - 1);
    }

    const points = await IndexPoint.find({ timestamp: { $gte: since } })
      .sort({ timestamp: 1 })
      .lean();

    // Downsample if too many
    let data = points;
    if (points.length > maxPoints) {
      const step = Math.ceil(points.length / maxPoints);
      data = points.filter((_, i) => i % step === 0);
      if (data[data.length - 1]?._id?.toString() !== points[points.length - 1]?._id?.toString()) {
        data.push(points[points.length - 1]);
      }
    }

    res.json(data.map(p => ({
      value: p.value,
      change: p.change,
      magnitude: p.magnitude,
      trigger: p.trigger,
      timestamp: p.timestamp
    })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/index/news - detailed news impact breakdown
router.get('/news', async (req, res) => {
  try {
    const newsData = await calculateNewsDelta();
    const celestial = getCelestialBoost();
    res.json({ ...newsData, celestial });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/index/events - major events (magnitude >= moderate)
router.get('/events', async (req, res) => {
  try {
    const events = await IndexPoint.find({
      magnitude: { $in: ['moderate', 'major'] },
      trigger: { $ne: '' }
    })
      .sort({ timestamp: -1 })
      .limit(20)
      .lean();

    res.json(events);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
