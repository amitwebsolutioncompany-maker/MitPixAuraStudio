import React, {useEffect, useState} from 'react';
import {StyleSheet, View} from 'react-native';
import {Button, Text, TextInput} from 'react-native-paper';
import AppScreen from '../../components/AppScreen';
import EmptyState from '../../components/EmptyState';
import {offerApi} from '../../api/endpoints';
import {styles} from '../../theme/styles';
import {colors} from '../../theme/theme';

const emptyForm = {title: '', description: '', discountPercent: ''};

export default function OffersManagementScreen() {
  const [offers, setOffers] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  async function load() {
    const {data} = await offerApi.list();
    setOffers(data.offers || []);
  }

  useEffect(() => {
    load();
  }, []);

  async function save() {
    setBusy(true);
    setMessage('');
    try {
      const payload = {
        ...form,
        salon: undefined,
        discountPercent: Number(form.discountPercent || 0),
      };
      if (editingId) {
        await offerApi.update(editingId, payload);
      } else {
        await offerApi.create(payload);
      }
      setForm(emptyForm);
      setEditingId('');
      setMessage(editingId ? 'Global offer updated' : 'Global offer created');
      await load();
    } catch (err) {
      setMessage(err.response?.data?.message || err.message || 'Offer save failed');
    } finally {
      setBusy(false);
    }
  }

  function edit(offer) {
    setEditingId(offer._id);
    setForm({
      title: offer.title || '',
      description: offer.description || '',
      discountPercent: String(offer.discountPercent || ''),
    });
  }

  async function remove(offer) {
    setBusy(true);
    setMessage('');
    try {
      await offerApi.remove(offer._id);
      if (editingId === offer._id) {
        setEditingId('');
        setForm(emptyForm);
      }
      setMessage('Offer deleted');
      await load();
    } catch (err) {
      setMessage(err.response?.data?.message || err.message || 'Offer delete failed');
    } finally {
      setBusy(false);
    }
  }

  return (
    <AppScreen refreshing={busy} onRefresh={load}>
      <Text variant="titleLarge" style={styles.title}>Global offers</Text>
      <View style={offerStyles.formCard}>
        <Text style={offerStyles.heading}>{editingId ? 'Edit offer' : 'Create offer for all salons'}</Text>
        <TextInput label="Offer title" value={form.title} onChangeText={(value) => setForm({...form, title: value})} style={styles.input} />
        <TextInput label="Description" value={form.description} onChangeText={(value) => setForm({...form, description: value})} style={styles.input} />
        <TextInput label="Discount percent" keyboardType="number-pad" value={form.discountPercent} onChangeText={(value) => setForm({...form, discountPercent: value})} style={styles.input} />
        {message ? <Text style={offerStyles.message}>{message}</Text> : null}
        <Button mode="contained" loading={busy} disabled={!form.title || !form.description || busy} buttonColor={colors.gold} textColor={colors.ink} onPress={save}>
          {editingId ? 'Update global offer' : 'Create global offer'}
        </Button>
        {editingId ? <Button mode="text" onPress={() => { setEditingId(''); setForm(emptyForm); }}>Cancel edit</Button> : null}
      </View>

      <Text variant="titleMedium" style={offerStyles.listTitle}>Active offers</Text>
      {!offers.length ? <EmptyState title="No active offers" /> : offers.map((offer) => (
        <View key={offer._id} style={offerStyles.card}>
          <View style={offerStyles.ribbon}>
            <Text style={offerStyles.ribbonText}>{offer.discountPercent || 0}%</Text>
          </View>
          <Text style={offerStyles.title}>{offer.title}</Text>
          <Text style={offerStyles.copy}>{offer.description}</Text>
          <Text style={offerStyles.scope}>Applies to all salons</Text>
          <View style={offerStyles.actions}>
            <Button mode="contained-tonal" onPress={() => edit(offer)}>Edit</Button>
            <Button mode="text" textColor={colors.danger} onPress={() => remove(offer)}>Delete</Button>
          </View>
        </View>
      ))}
    </AppScreen>
  );
}

const offerStyles = StyleSheet.create({
  formCard: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.gold,
    padding: 14,
    backgroundColor: colors.panel,
  },
  heading: {
    marginBottom: 12,
    color: colors.softGold,
    fontSize: 16,
    fontWeight: '900',
  },
  message: {
    marginBottom: 12,
    color: colors.successSoft,
  },
  listTitle: {
    marginTop: 22,
    marginBottom: 10,
    color: colors.text,
    fontWeight: '900',
  },
  card: {
    marginBottom: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.line,
    padding: 14,
    backgroundColor: colors.charcoal,
  },
  ribbon: {
    alignSelf: 'flex-start',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: colors.gold,
  },
  ribbonText: {
    color: colors.ink,
    fontWeight: '900',
  },
  title: {
    marginTop: 12,
    color: colors.text,
    fontSize: 17,
    fontWeight: '900',
  },
  copy: {
    marginTop: 8,
    color: colors.muted,
    lineHeight: 20,
  },
  scope: {
    marginTop: 10,
    color: colors.successSoft,
    fontWeight: '900',
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
});
