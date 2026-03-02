const mongoose = require('mongoose');

const indexPointSchema = new mongoose.Schema({
  value: { type: Number, required: true },
  change: { type: Number, default: 0 },
  magnitude: { type: String, enum: ['minimal', 'minor', 'moderate', 'major'], default: 'minimal' },
  trigger: { type: String, default: '' },
  timestamp: { type: Date, default: Date.now }
});

indexPointSchema.index({ timestamp: 1 });

module.exports = mongoose.model('IndexPoint', indexPointSchema);
