import React, {useEffect, useState} from 'react';
import {StyleSheet, View} from 'react-native';
import {Text} from 'react-native-paper';
import AppScreen from '../../components/AppScreen';
import EmptyState from '../../components/EmptyState';
import {superAdminApi} from '../../api/endpoints';
import {styles} from '../../theme/styles';
import {colors} from '../../theme/theme';

export default function SuperAdminLoyalCustomersScreen() {
  const [customers, setCustomers] = useState([]);
  const [meta, setMeta] = useState({});
  const [busy, setBusy] = useState(false);

  async function load() {
    setBusy(true);
    try {
      const res = await superAdminApi.loyalCustomers();
      setCustomers(res.data.customers || []);
      setMeta(res.data);
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <AppScreen refreshing={busy} onRefresh={load}>
      <Text variant="headlineSmall" style={styles.title}>Global 20+ VIP customers</Text>
      <Text style={styles.subtitle}>{meta.startDate && meta.endDate ? `${meta.startDate} to ${meta.endDate}` : 'Platform-wide annual report'}</Text>
      {!customers.length ? <EmptyState title="No global 20+ VIP customers" /> : customers.map((customer, index) => (
        <View key={`${customer.phone}-${index}`} style={loyalStyles.card}>
          <View style={loyalStyles.header}>
            <View style={loyalStyles.copy}>
              <Text style={loyalStyles.name}>{customer.name || 'Customer'}</Text>
              <Text style={loyalStyles.meta}>{customer.phone || 'No number'}</Text>
            </View>
            <Text style={loyalStyles.badge}>{customer.services || 0} visits</Text>
          </View>
          <Text style={loyalStyles.meta}>Paid amount: Rs {customer.totalPaid || 0}</Text>
          <Text style={loyalStyles.meta}>Last visit: {customer.lastVisit || 'Not available'}</Text>
        </View>
      ))}
    </AppScreen>
  );
}

const loyalStyles = StyleSheet.create({
  card: {
    marginBottom: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.gold,
    padding: 14,
    backgroundColor: colors.panel,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  copy: {
    flex: 1,
  },
  name: {
    color: colors.text,
    fontSize: 17,
    fontWeight: '900',
  },
  meta: {
    marginTop: 7,
    color: colors.muted,
    fontWeight: '700',
  },
  badge: {
    alignSelf: 'flex-start',
    borderRadius: 8,
    overflow: 'hidden',
    paddingHorizontal: 10,
    paddingVertical: 5,
    color: colors.ink,
    backgroundColor: colors.successSoft,
    fontWeight: '900',
  },
});
