import React, {useEffect, useState} from 'react';
import {StyleSheet, View} from 'react-native';
import {Button, Text, TextInput, SegmentedButtons} from 'react-native-paper';
import AppScreen from '../../components/AppScreen';
import EmptyState from '../../components/EmptyState';
import {superAdminApi} from '../../api/endpoints';
import {styles} from '../../theme/styles';
import {colors} from '../../theme/theme';

const emptyForm = {
  name: '',
  email: '',
  password: '',
  phone: '',
  city: '',
  aadhaarNumber: '',
  subscriptionCode: '',
  subscriptionPlan: 'demo5day',
  salonLimit: '1',
};

const planButtons = [
  {value: 'demo10min', label: '10 min'},
  {value: 'demo5day', label: '5 day'},
  {value: 'month1', label: '1 mo'},
  {value: 'month6', label: '6 mo'},
  {value: 'year1', label: '1 yr'},
];

export default function SuperAdminAdminsScreen() {
  const [admins, setAdmins] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');

  async function load() {
    setBusy(true);
    try {
      const res = await superAdminApi.admins();
      setAdmins(res.data.admins || []);
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function save() {
    setBusy(true);
    setMessage('');
    try {
      const payload = {...form, salonLimit: Number(form.salonLimit || 0)};
      if (!payload.password) delete payload.password;
      if (editingId) await superAdminApi.updateAdmin(editingId, payload);
      else await superAdminApi.createAdmin(payload);
      setForm(emptyForm);
      setEditingId('');
      setMessage(editingId ? 'Admin updated' : 'Admin created');
      await load();
    } catch (err) {
      setMessage(err.response?.data?.message || err.message || 'Admin save failed');
    } finally {
      setBusy(false);
    }
  }

  function edit(admin) {
    setEditingId(admin._id);
    setForm({
      name: admin.name || '',
      email: admin.email || '',
      password: '',
      phone: admin.phone || '',
      city: admin.city || '',
      aadhaarNumber: admin.aadhaarNumber || '',
      subscriptionCode: admin.subscriptionCode || '',
      subscriptionPlan: admin.subscriptionPlan || 'demo5day',
      salonLimit: String(admin.salonLimit ?? 1),
    });
  }

  async function deactivate(admin) {
    setBusy(true);
    try {
      await superAdminApi.removeAdmin(admin._id);
      await load();
    } finally {
      setBusy(false);
    }
  }

  return (
    <AppScreen refreshing={busy} onRefresh={load}>
      <Text variant="headlineSmall" style={styles.title}>Admins</Text>
      <View style={adminStyles.formCard}>
        <Text style={adminStyles.heading}>{editingId ? 'Edit admin' : 'Create admin'}</Text>
        <TextInput label="Admin name" value={form.name} onChangeText={(value) => setForm({...form, name: value})} style={styles.input} />
        <TextInput label="Email" autoCapitalize="none" value={form.email} onChangeText={(value) => setForm({...form, email: value})} style={styles.input} />
        <TextInput label={editingId ? 'New password optional' : 'Password'} secureTextEntry value={form.password} onChangeText={(value) => setForm({...form, password: value})} style={styles.input} />
        <TextInput label="Phone / number" value={form.phone} onChangeText={(value) => setForm({...form, phone: value})} style={styles.input} />
        <TextInput label="City" value={form.city} onChangeText={(value) => setForm({...form, city: value})} style={styles.input} />
        <TextInput label="Aadhaar number" value={form.aadhaarNumber} onChangeText={(value) => setForm({...form, aadhaarNumber: value})} style={styles.input} />
        <TextInput label="Subscription code" value={form.subscriptionCode} onChangeText={(value) => setForm({...form, subscriptionCode: value})} style={styles.input} />
        <SegmentedButtons value={form.subscriptionPlan} onValueChange={(subscriptionPlan) => setForm({...form, subscriptionPlan})} buttons={planButtons} />
        <TextInput label="Salon creation limit" keyboardType="number-pad" value={form.salonLimit} onChangeText={(value) => setForm({...form, salonLimit: value})} style={styles.input} />
        {message ? <Text style={adminStyles.message}>{message}</Text> : null}
        <Button mode="contained" loading={busy} disabled={!form.name || !form.email || (!editingId && !form.password)} onPress={save}>
          {editingId ? 'Update admin' : 'Create admin'}
        </Button>
        {editingId ? <Button mode="text" onPress={() => { setEditingId(''); setForm(emptyForm); }}>Cancel edit</Button> : null}
      </View>

      <Text variant="titleMedium" style={adminStyles.listTitle}>Saved admins</Text>
      {!admins.length ? <EmptyState title="No admins yet" /> : admins.map((admin) => (
        <View key={admin._id} style={adminStyles.card}>
          <Text style={adminStyles.name}>{admin.name}</Text>
          <Text style={adminStyles.meta}>{admin.email} | {admin.phone || 'No phone'}</Text>
          <Text style={adminStyles.meta}>{admin.city || 'No city'} | Aadhaar {admin.aadhaarNumber || 'Not set'}</Text>
          <Text style={adminStyles.meta}>{admin.subscriptionPlan} | Limit {admin.salonLimit ?? 0} | Expires {admin.codeExpiresAt ? new Date(admin.codeExpiresAt).toLocaleString() : 'Not set'}</Text>
          <View style={adminStyles.actions}>
            <Button mode="contained-tonal" onPress={() => edit(admin)}>Edit</Button>
            <Button mode="text" textColor={colors.danger} onPress={() => deactivate(admin)}>Deactivate</Button>
          </View>
        </View>
      ))}
    </AppScreen>
  );
}

const adminStyles = StyleSheet.create({
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
    marginVertical: 12,
    color: colors.successSoft,
  },
  listTitle: {
    marginTop: 22,
    marginBottom: 10,
    color: colors.text,
    fontWeight: '900',
  },
  card: {
    marginBottom: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.line,
    padding: 12,
    backgroundColor: colors.charcoal,
  },
  name: {
    color: colors.text,
    fontWeight: '900',
  },
  meta: {
    marginTop: 6,
    color: colors.muted,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
  },
});
