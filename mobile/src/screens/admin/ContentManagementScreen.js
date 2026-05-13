import React, {useEffect, useState} from 'react';
import {Button, Card, Text, TextInput} from 'react-native-paper';
import AppScreen from '../../components/AppScreen';
import {contentApi} from '../../api/endpoints';
import {styles} from '../../theme/styles';
import {heroImages} from '../../theme/visuals';

const defaultForm = {
  title: 'Why Choose Us',
  subtitle: 'Luxury salon privileges crafted for clients who value time, comfort and premium care.',
  heroImage: heroImages.whyChoose,
  benefits: [
    {title: 'Daily Signature Offers', description: 'Exclusive daily beauty privileges with premium value.', icon: 'offers'},
    {title: 'Luxury Feel', description: 'An elegant salon atmosphere for a polished experience.', icon: 'salon'},
    {title: 'Premium Service', description: 'Expert care, refined products and detail-first grooming.', icon: 'staff'},
    {title: 'Fast Appointments', description: 'Book ahead, arrive on time and skip the waiting queue.', icon: 'slots'},
  ],
  party: {
    title: 'Annual Elite Client Party',
    address: 'MitPix Aura Studio, Main Luxury Lounge',
    date: '31 December 2026',
    image: heroImages.party,
    inviteRule: 'Clients with 20+ salon visits in a year receive an exclusive party invitation.',
    luckyDrawNote: 'Lucky draw winners from invited guests receive premium gifts.',
    prizes: [
      {rank: '1st Prize', title: 'Luxury Beauty Hamper', description: 'Premium care products and salon vouchers.'},
      {rank: '2nd Prize', title: 'Signature Makeover', description: 'A complete premium grooming session.'},
      {rank: '3rd Prize', title: 'Gold Service Voucher', description: 'Special voucher for your next salon visit.'},
    ],
  },
};

export default function ContentManagementScreen() {
  const [form, setForm] = useState(defaultForm);
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  async function load() {
    setBusy(true);
    try {
      const {data} = await contentApi.get('why-choose-us');
      setForm(data.content || defaultForm);
    } catch (err) {
      setMessage(err.response?.data?.message || err.message || 'Content load failed');
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  function updateBenefit(index, field, value) {
    setForm((current) => ({
      ...current,
      benefits: current.benefits.map((benefit, benefitIndex) => (
        benefitIndex === index ? {...benefit, [field]: value} : benefit
      )),
    }));
  }

  function updateParty(field, value) {
    setForm((current) => ({
      ...current,
      party: {...current.party, [field]: value},
    }));
  }

  function updatePrize(index, field, value) {
    setForm((current) => ({
      ...current,
      party: {
        ...current.party,
        prizes: current.party.prizes.map((prize, prizeIndex) => (
          prizeIndex === index ? {...prize, [field]: value} : prize
        )),
      },
    }));
  }

  async function save() {
    setBusy(true);
    setMessage('');
    try {
      await contentApi.update('why-choose-us', form);
      setMessage('Content updated');
    } catch (err) {
      setMessage(err.response?.data?.message || err.message || 'Content update failed');
    } finally {
      setBusy(false);
    }
  }

  return (
    <AppScreen refreshing={busy} onRefresh={load}>
      <Text variant="headlineSmall" style={styles.title}>App content</Text>
      <Text style={styles.subtitle}>Edit customer Why Choose Us text, images, annual party and gift details.</Text>

      <TextInput label="Page title" value={form.title} onChangeText={(value) => setForm({...form, title: value})} style={styles.input} />
      <TextInput label="Subtitle" value={form.subtitle} onChangeText={(value) => setForm({...form, subtitle: value})} style={styles.input} />
      <TextInput label="Hero image URL" value={form.heroImage} onChangeText={(value) => setForm({...form, heroImage: value})} style={styles.input} />

      <Text variant="titleMedium" style={styles.title}>Benefits</Text>
      {form.benefits.map((benefit, index) => (
        <Card key={index} style={styles.card} mode="elevated">
          <Card.Content>
            <Text variant="titleMedium">Benefit {index + 1}</Text>
            <TextInput label="Title" value={benefit.title} onChangeText={(value) => updateBenefit(index, 'title', value)} style={styles.input} />
            <TextInput label="Short description" value={benefit.description} onChangeText={(value) => updateBenefit(index, 'description', value)} style={styles.input} />
            <TextInput label="Icon key" value={benefit.icon} onChangeText={(value) => updateBenefit(index, 'icon', value)} style={styles.input} />
          </Card.Content>
        </Card>
      ))}

      <Text variant="titleMedium" style={styles.title}>Annual party</Text>
      <TextInput label="Party title" value={form.party.title} onChangeText={(value) => updateParty('title', value)} style={styles.input} />
      <TextInput label="Party date" value={form.party.date} onChangeText={(value) => updateParty('date', value)} style={styles.input} />
      <TextInput label="Party address" value={form.party.address} onChangeText={(value) => updateParty('address', value)} style={styles.input} />
      <TextInput label="Party image URL" value={form.party.image} onChangeText={(value) => updateParty('image', value)} style={styles.input} />
      <TextInput label="Invite rule" value={form.party.inviteRule} onChangeText={(value) => updateParty('inviteRule', value)} style={styles.input} />
      <TextInput label="Lucky draw note" value={form.party.luckyDrawNote} onChangeText={(value) => updateParty('luckyDrawNote', value)} style={styles.input} />

      <Text variant="titleMedium" style={styles.title}>Lucky draw gifts</Text>
      {form.party.prizes.map((prize, index) => (
        <Card key={index} style={styles.card} mode="elevated">
          <Card.Content>
            <Text variant="titleMedium">Gift {index + 1}</Text>
            <TextInput label="Rank" value={prize.rank} onChangeText={(value) => updatePrize(index, 'rank', value)} style={styles.input} />
            <TextInput label="Gift title" value={prize.title} onChangeText={(value) => updatePrize(index, 'title', value)} style={styles.input} />
            <TextInput label="Gift description" value={prize.description} onChangeText={(value) => updatePrize(index, 'description', value)} style={styles.input} />
          </Card.Content>
        </Card>
      ))}

      {message ? <Text style={{marginBottom: 12}}>{message}</Text> : null}
      <Button mode="contained" loading={busy} disabled={busy} onPress={save}>Save content</Button>
    </AppScreen>
  );
}
