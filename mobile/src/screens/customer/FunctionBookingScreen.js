import React, {useEffect, useState} from 'react';
import {Button, Text, TextInput} from 'react-native-paper';
import AppScreen from '../../components/AppScreen';
import EmptyState from '../../components/EmptyState';
import ResourceCard from '../../components/ResourceCard';
import {functionApi} from '../../api/endpoints';
import {styles} from '../../theme/styles';

const emptyForm = {eventType: '', eventDate: '', guests: '', location: '', notes: ''};

export default function FunctionBookingScreen() {
  const [requests, setRequests] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  async function load() {
    const {data} = await functionApi.list();
    setRequests(data.functionRequests || []);
  }

  useEffect(() => {
    load();
  }, []);

  async function submit() {
    setBusy(true);
    setMessage('');
    try {
      await functionApi.create({...form, guests: Number(form.guests || 0)});
      setForm(emptyForm);
      setMessage('Function request sent');
      await load();
    } catch (err) {
      setMessage(err.response?.data?.message || err.message || 'Request failed');
    } finally {
      setBusy(false);
    }
  }

  return (
    <AppScreen refreshing={busy} onRefresh={load}>
      <Text variant="headlineSmall" style={styles.title}>Book for function</Text>
      <Text style={styles.subtitle}>Bridal, party, corporate and event grooming requests.</Text>
      <TextInput label="Function type" value={form.eventType} onChangeText={(value) => setForm({...form, eventType: value})} style={styles.input} />
      <TextInput label="Date" value={form.eventDate} onChangeText={(value) => setForm({...form, eventDate: value})} style={styles.input} />
      <TextInput label="Guests" keyboardType="number-pad" value={form.guests} onChangeText={(value) => setForm({...form, guests: value})} style={styles.input} />
      <TextInput label="Location" value={form.location} onChangeText={(value) => setForm({...form, location: value})} style={styles.input} />
      <TextInput label="Notes" value={form.notes} onChangeText={(value) => setForm({...form, notes: value})} style={styles.input} />
      {message ? <Text style={{marginBottom: 12}}>{message}</Text> : null}
      <Button mode="contained" loading={busy} disabled={!form.eventType || !form.location || busy} onPress={submit}>Send request</Button>

      <Text variant="titleMedium" style={{marginTop: 24, marginBottom: 8}}>My function requests</Text>
      {!requests.length ? <EmptyState title="No function requests yet" /> : requests.map((item) => (
        <ResourceCard key={item._id} title={item.eventType} subtitle={item.location} meta={`${item.status} | Guests: ${item.guests || 0}`} />
      ))}
    </AppScreen>
  );
}

