import React, {useEffect, useState} from 'react';
import {StyleSheet, View} from 'react-native';
import {Button, Text, TextInput} from 'react-native-paper';
import AppScreen from '../../components/AppScreen';
import {superAdminApi} from '../../api/endpoints';
import {styles} from '../../theme/styles';
import {colors} from '../../theme/theme';

const labels = {
  demo10min: 'Demo 10 min',
  demo5day: 'Demo 5 day',
  month1: '1 month',
  month6: '6 month',
  year1: '1 year',
};

export default function SuperAdminSubscriptionsScreen() {
  const [items, setItems] = useState([]);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');

  async function load() {
    setBusy(true);
    try {
      const res = await superAdminApi.subscriptions();
      const byPlan = Object.fromEntries((res.data.subscriptions || []).map((item) => [item.plan, item]));
      setItems(Object.keys(labels).map((plan) => byPlan[plan] || {plan, label: labels[plan], amount: 0}));
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function save(item) {
    setBusy(true);
    setMessage('');
    try {
      await superAdminApi.updateSubscription(item.plan, {label: item.label, amount: Number(item.amount || 0)});
      setMessage('Subscription charge updated');
      await load();
    } catch (err) {
      setMessage(err.response?.data?.message || err.message || 'Charge update failed');
    } finally {
      setBusy(false);
    }
  }

  function update(index, field, value) {
    setItems((current) => current.map((item, itemIndex) => (
      itemIndex === index ? {...item, [field]: value} : item
    )));
  }

  return (
    <AppScreen refreshing={busy} onRefresh={load}>
      <Text variant="headlineSmall" style={styles.title}>Subscription charges</Text>
      {message ? <Text style={subscriptionStyles.message}>{message}</Text> : null}
      {items.map((item, index) => (
        <View key={item.plan} style={subscriptionStyles.card}>
          <Text style={subscriptionStyles.plan}>{labels[item.plan] || item.plan}</Text>
          <TextInput label="Label" value={item.label} onChangeText={(value) => update(index, 'label', value)} style={styles.input} />
          <TextInput label="Amount" keyboardType="numeric" value={String(item.amount || '')} onChangeText={(value) => update(index, 'amount', value)} style={styles.input} />
          <Button mode="contained-tonal" loading={busy} onPress={() => save(item)}>Save charge</Button>
        </View>
      ))}
    </AppScreen>
  );
}

const subscriptionStyles = StyleSheet.create({
  message: {
    marginBottom: 12,
    color: colors.successSoft,
    fontWeight: '800',
  },
  card: {
    marginBottom: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.line,
    padding: 12,
    backgroundColor: colors.panel,
  },
  plan: {
    marginBottom: 8,
    color: colors.softGold,
    fontWeight: '900',
  },
});
