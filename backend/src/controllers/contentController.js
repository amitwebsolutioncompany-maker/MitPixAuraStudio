const AppContent = require('../models/AppContent');
const asyncHandler = require('../utils/asyncHandler');

const defaultWhyChooseContent = {
  key: 'why-choose-us',
  title: 'Why Choose Us',
  subtitle: 'Luxury salon privileges crafted for clients who value time, comfort and premium care.',
  heroImage: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=1200&q=80',
  benefits: [
    {
      title: 'Daily Signature Offers',
      description: 'Exclusive daily beauty privileges with premium value.',
      icon: 'offers',
    },
    {
      title: 'Luxury Feel',
      description: 'An elegant salon atmosphere for a polished experience.',
      icon: 'salon',
    },
    {
      title: 'Premium Service',
      description: 'Expert care, refined products and detail-first grooming.',
      icon: 'staff',
    },
    {
      title: 'Fast Appointments',
      description: 'Book ahead, arrive on time and skip the waiting queue.',
      icon: 'slots',
    },
  ],
  party: {
    title: 'Annual Elite Client Party',
    address: 'MitPix Aura Studio, Main Luxury Lounge',
    date: '31 December 2026',
    image: 'https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?auto=format&fit=crop&w=1200&q=80',
    inviteRule: 'Clients with 20+ salon visits in a year receive an exclusive party invitation.',
    luckyDrawNote: 'Lucky draw winners from invited guests receive premium gifts.',
    prizes: [
      { rank: '1st Prize', title: 'Luxury Beauty Hamper', description: 'Premium care products and salon vouchers.' },
      { rank: '2nd Prize', title: 'Signature Makeover', description: 'A complete premium grooming session.' },
      { rank: '3rd Prize', title: 'Gold Service Voucher', description: 'Special voucher for your next salon visit.' },
    ],
  },
};

async function getOrCreateContent(key) {
  const content = await AppContent.findOne({ key });
  if (content) return content;
  return AppContent.create(defaultWhyChooseContent);
}

exports.getContent = asyncHandler(async (req, res) => {
  const key = req.params.key || 'why-choose-us';
  const content = await getOrCreateContent(key);
  res.json({ content });
});

exports.updateContent = asyncHandler(async (req, res) => {
  const key = req.params.key || 'why-choose-us';
  const { _id, __v, createdAt, updatedAt, ...payload } = req.body;
  const content = await AppContent.findOneAndUpdate(
    { key },
    { ...payload, key },
    { new: true, upsert: true, runValidators: true }
  );
  res.json({ content });
});
