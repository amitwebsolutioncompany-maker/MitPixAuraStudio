import React, {useEffect, useState} from 'react';
import {StyleSheet, View} from 'react-native';
import {Text} from 'react-native-paper';
import AppScreen from '../../components/AppScreen';
import EmptyState from '../../components/EmptyState';
import {analyticsApi} from '../../api/endpoints';
import {styles} from '../../theme/styles';
import {colors} from '../../theme/theme';

function isExpired(date) {
  return date ? new Date(date).getTime() <= Date.now() : false;
}

export default function AdminSubscriptionScreen() {
  const [data, setData] = useState({subscriptions: []});
  const [busy, setBusy] = useState(false);

  async function load() {
    setBusy(true);
    try {
      const res = await analyticsApi.subscription();
      setData(res.data || {subscriptions: []});
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const admin = data.admin || {};
  const expired = isExpired(admin.codeExpiresAt);

  return (
    <AppScreen refreshing={busy} onRefresh={load}>
      <Text variant="headlineSmall" style={styles.title}>Subscription</Text>
      <View style={subscriptionStyles.card}>
        <Text style={subscriptionStyles.name}>{admin.name || 'Admin'}</Text>
        <Text style={subscriptionStyles.meta}>Plan: {admin.subscriptionPlan || 'Not set'}</Text>
        <Text style={subscriptionStyles.meta}>Code: {admin.subscriptionCode || 'Not set'}</Text>
        <Text style={subscriptionStyles.meta}>Salon limit: {admin.salonLimit ?? 0}</Text>
        <Text style={[subscriptionStyles.status, expired && subscriptionStyles.expired]}>
          {expired ? 'Expired' : 'Active'} until {admin.codeExpiresAt ? new Date(admin.codeExpiresAt).toLocaleString() : 'Not set'}
        </Text>
        <Text style={subscriptionStyles.contact}>Renewal contact: {data.renewalContact || '+918574700615'}</Text>
      </View>

      <Text variant="titleMedium" style={subscriptionStyles.sectionTitle}>Current charges</Text>
      {!data.subscriptions?.length ? <EmptyState title="No subscription charges set" /> : data.subscriptions.map((item) => (
        <View key={item.plan} style={subscriptionStyles.charge}>
          <Text style={subscriptionStyles.chargeLabel}>{item.label}</Text>
          <Text style={subscriptionStyles.amount}>Rs {item.amount || 0}</Text>
        </View>
      ))}
    </AppScreen>
  );
}

const subscriptionStyles = StyleSheet.create({
  card: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.gold,
    padding: 14,
    backgroundColor: colors.panel,
  },
  name: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '900',
  },
  meta: {
    marginTop: 8,
    color: colors.muted,
    fontWeight: '800',
  },
  status: {
    marginTop: 12,
    color: colors.successSoft,
    fontWeight: '900',
  },
  expired: {
    color: colors.danger,
  },
  contact: {
    marginTop: 8,
    color: colors.softGold,
    fontWeight: '900',
  },
  sectionTitle: {
    marginTop: 20,
    marginBottom: 10,
    color: colors.text,
    fontWeight: '900',
  },
  charge: {
    marginBottom: 10,
    borderRadius: 8,
    padding: 12,
    backgroundColor: colors.charcoal,
    borderWidth: 1,
    borderColor: colors.line,
  },
  chargeLabel: {
    color: colors.text,
    fontWeight: '900',
  },
  amount: {
    marginTop: 5,
    color: colors.successSoft,
    fontWeight: '900',
  },
});
