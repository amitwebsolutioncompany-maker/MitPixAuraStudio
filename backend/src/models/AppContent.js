const mongoose = require('mongoose');

const benefitSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    icon: { type: String, trim: true },
  },
  { _id: false }
);

const prizeSchema = new mongoose.Schema(
  {
    rank: { type: String, required: true, trim: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
  },
  { _id: false }
);

const appContentSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true, trim: true },
    title: { type: String, required: true, trim: true },
    subtitle: { type: String, required: true, trim: true },
    heroImage: { type: String, required: true, trim: true },
    benefits: { type: [benefitSchema], default: [] },
    party: {
      title: { type: String, required: true, trim: true },
      address: { type: String, required: true, trim: true },
      date: { type: String, required: true, trim: true },
      image: { type: String, required: true, trim: true },
      inviteRule: { type: String, required: true, trim: true },
      luckyDrawNote: { type: String, required: true, trim: true },
      prizes: { type: [prizeSchema], default: [] },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('AppContent', appContentSchema);
