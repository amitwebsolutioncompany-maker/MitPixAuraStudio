import React, {useEffect, useState} from 'react';
import {StyleSheet, View} from 'react-native';
import {Text} from 'react-native-paper';
import AppScreen from '../../components/AppScreen';
import EmptyState from '../../components/EmptyState';
import {analyticsApi} from '../../api/endpoints';
import {styles} from '../../theme/styles';
import {colors} from '../../theme/theme';

export default function LoyalCustomersScreen() {
  const [customers, setCustomers] = useState([]);
  const [meta, setMeta] = useState({year: new Date().getFullYear(), startDate: '', endDate: ''});
  const [refreshing, setRefreshing] = useState(false);

  async function load() {
    setRefreshing(true);
    try {
      const {data} = await analyticsApi.loyalCustomers();
      setCustomers(data.customers || []);
      setMeta({
        year: data.year || new Date().getFullYear(),
        startDate: data.startDate || '',
        endDate: data.endDate || '',
      });
    } finally {
      setRefreshing(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const totalServices = customers.reduce((sum, customer) => sum + Number(customer.services || 0), 0);
  const totalPaid = customers.reduce((sum, customer) => sum + Number(customer.totalPaid || 0), 0);

  return (
    <AppScreen refreshing={refreshing} onRefresh={load}>
      <Text variant="headlineSmall" style={styles.title}>20+ yearly loyal customers</Text>
      <Text style={styles.subtitle}>
        {meta.startDate && meta.endDate ? `${meta.startDate} to ${meta.endDate}` : `Annual report ${meta.year}`}
      </Text>

      <View style={loyalStyles.summaryRow}>
        <View style={loyalStyles.summaryCard}>
          <Text style={loyalStyles.summaryValue}>{customers.length}</Text>
          <Text style={loyalStyles.summaryLabel}>VIP customers</Text>
        </View>
        <View style={loyalStyles.summaryCard}>
          <Text style={loyalStyles.summaryValue}>{totalServices}</Text>
          <Text style={loyalStyles.summaryLabel}>Total services</Text>
        </View>
      </View>

      <View style={loyalStyles.summaryWide}>
        <Text style={loyalStyles.summaryWideValue}>Rs {totalPaid}</Text>
        <Text style={loyalStyles.summaryLabel}>Total paid in report</Text>
      </View>

      {!customers.length ? <EmptyState title="No customers crossed 20 services this year" /> : customers.map((customer, index) => (
        <View key={`${customer.phone}-${index}`} style={loyalStyles.card}>
          <View style={loyalStyles.header}>
            <View style={loyalStyles.headerCopy}>
              <Text style={loyalStyles.name}>{customer.name || 'Customer'}</Text>
              <Text style={loyalStyles.phone}>{customer.phone || 'No number'}</Text>
            </View>
            <Text style={loyalStyles.badge}>{customer.services} visits</Text>
          </View>
          <View style={loyalStyles.metrics}>
            <View style={loyalStyles.metricBox}>
              <Text style={loyalStyles.metricLabel}>Service count</Text>
              <Text style={loyalStyles.metricValue}>{customer.services || 0}</Text>
            </View>
            <View style={loyalStyles.metricBox}>
              <Text style={loyalStyles.metricLabel}>Paid amount</Text>
              <Text style={loyalStyles.metricValue}>Rs {customer.totalPaid || 0}</Text>
            </View>
          </View>
          <Text style={loyalStyles.meta}>Last visit: {customer.lastVisit || 'Not available'}</Text>
        </View>
      ))}
    </AppScreen>
  );
}

const loyalStyles = StyleSheet.create({
  summaryRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },
  summaryCard: {
    flex: 1,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.line,
    padding: 12,
    backgroundColor: colors.panel,
  },
  summaryWide: {
    marginBottom: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.gold,
    padding: 12,
    backgroundColor: colors.charcoal,
  },
  summaryValue: {
    color: colors.softGold,
    fontSize: 20,
    fontWeight: '900',
  },
  summaryWideValue: {
    color: colors.successSoft,
    fontSize: 22,
    fontWeight: '900',
  },
  summaryLabel: {
    marginTop: 4,
    color: colors.muted,
    fontWeight: '800',
  },
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
  headerCopy: {
    flex: 1,
  },
  name: {
    color: colors.text,
    fontSize: 17,
    fontWeight: '900',
  },
  phone: {
    marginTop: 4,
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
  metrics: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
  },
  metricBox: {
    flex: 1,
    borderRadius: 8,
    padding: 10,
    backgroundColor: colors.charcoal,
  },
  metricLabel: {
    color: colors.muted,
    fontWeight: '800',
  },
  metricValue: {
    marginTop: 8,
    color: colors.softGold,
    fontSize: 18,
    fontWeight: '900',
  },
  meta: {
    marginTop: 12,
    color: colors.successSoft,
    fontWeight: '800',
  },
});
