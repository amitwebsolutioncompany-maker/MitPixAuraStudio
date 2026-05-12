import React, {useEffect, useMemo, useState} from 'react';
import {Button, Chip, Text, TextInput} from 'react-native-paper';
import AppScreen from '../../components/AppScreen';
import EmptyState from '../../components/EmptyState';
import ResourceCard from '../../components/ResourceCard';
import {offerApi, salonApi} from '../../api/endpoints';
import {styles} from '../../theme/styles';

const emptyForm = {title: '', description: '', discountPercent: ''};

export default function OffersManagementScreen() {
  const [offers, setOffers] = useState([]);
  const [salons, setSalons] = useState([]);
  const [selectedSalon, setSelectedSalon] = useState('all');
  const [form, setForm] = useState(emptyForm);
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  const selectedSalonName = useMemo(
    () => selectedSalon === 'all' ? 'All salons' : salons.find((salon) => salon._id === selectedSalon)?.name,
    [salons, selectedSalon]
  );

  async function load() {
    const [offersRes, salonsRes] = await Promise.all([offerApi.list(), salonApi.list()]);
    setOffers(offersRes.data.offers || []);
    setSalons(salonsRes.data.salons || []);
  }

  useEffect(() => {
    load();
  }, []);

  async function save() {
    setBusy(true);
    setMessage('');
    try {
      await offerApi.create({
        ...form,
        discountPercent: Number(form.discountPercent || 0),
        salon: selectedSalon === 'all' ? undefined : selectedSalon
      });
      setForm(emptyForm);
      setMessage(`Offer created for ${selectedSalonName}`);
      await load();
    } catch (err) {
      setMessage(err.response?.data?.message || err.message || 'Offer create failed');
    } finally {
      setBusy(false);
    }
  }

  return (
    <AppScreen refreshing={busy} onRefresh={load}>
      <Text variant="titleLarge" style={styles.title}>Offers</Text>
      <Text style={styles.subtitle}>Create global offers or salon-specific offers.</Text>

      <Chip selected={selectedSalon === 'all'} onPress={() => setSelectedSalon('all')} style={{marginBottom: 8}}>All salons</Chip>
      {salons.map((salon) => (
        <Chip key={salon._id} selected={selectedSalon === salon._id} onPress={() => setSelectedSalon(salon._id)} style={{marginBottom: 8}}>
          {salon.name} | {salon.city}
        </Chip>
      ))}

      <TextInput label="Offer title" value={form.title} onChangeText={(value) => setForm({...form, title: value})} style={styles.input} />
      <TextInput label="Description" value={form.description} onChangeText={(value) => setForm({...form, description: value})} style={styles.input} />
      <TextInput label="Discount percent" keyboardType="number-pad" value={form.discountPercent} onChangeText={(value) => setForm({...form, discountPercent: value})} style={styles.input} />
      {message ? <Text style={{marginBottom: 12}}>{message}</Text> : null}
      <Button mode="contained" loading={busy} disabled={!form.title || !form.description || busy} onPress={save}>Create offer</Button>

      <Text variant="titleMedium" style={{marginTop: 24, marginBottom: 8}}>Active offers</Text>
      {!offers.length ? <EmptyState title="No active offers" /> : offers.map((offer) => (
        <ResourceCard
          key={offer._id}
          title={offer.title}
          subtitle={offer.description}
          meta={`${offer.discountPercent || 0}% off | ${offer.salon?.name || 'All salons'}`}
        />
      ))}
    </AppScreen>
  );
}
