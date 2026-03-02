const mongoose = require('mongoose');

const alametSchema = new mongoose.Schema({
  titleTR: { type: String, required: true },
  titleEN: { type: String, required: true },
  source: { type: String, required: true },
  status: {
    type: String,
    enum: ['Oldu', 'Olmak Üzere', 'Olmadı', 'Olamayacak'],
    default: 'Olmadı'
  },
  descriptionTR: { type: String, default: '' },
  descriptionEN: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('Alamet', alametSchema);
