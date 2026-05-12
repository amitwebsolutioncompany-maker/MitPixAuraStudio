import React, {useCallback, useEffect, useState} from 'react';
import {StyleSheet, View} from 'react-native';
import {Text} from 'react-native-paper';
import AppScreen from '../../components/AppScreen';
import EmptyState from '../../components/EmptyState';
import {analyticsApi} from '../../api/endpoints';
import {styles} from '../../theme/styles';
import {colors} from '../../theme/theme';

export default function PerformanceScreen() {
  const [stats, setStats] = useState({
    services: 0,
    totalPaid: 0,
    todayServices: 0,
    todayPaid: 0,
    periodServices: 0,
    periodPaid: 0,
    bookings: [],
  });
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    setRefreshing(true);
    try {
      const {data} = await analyticsApi.staffStatus();
      setStats(data);
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <AppScreen refreshing={refreshing} onRefresh={load}>
      <Text variant="headlineSmall" style={styles.title}>Service status</Text>
      <View style={statusStyles.summaryRow}>
        <View style={statusStyles.summaryCard}>
          <Text style={statusStyles.value}>{stats.todayServices || 0}</Text>
          <Text style={statusStyles.label}>Today services</Text>
          <Text style={statusStyles.amount}>Rs {stats.todayPaid || 0}</Text>
        </View>
        <View style={statusStyles.summaryCard}>
          <Text style={statusStyles.value}>{stats.periodServices || stats.services || 0}</Text>
          <Text style={statusStyles.label}>Till admin close</Text>
          <Text style={statusStyles.amount}>Rs {stats.periodPaid || stats.totalPaid || 0}</Text>
        </View>
      </View>
      {!stats.bookings?.length ? <EmptyState title="No open completed services" message="Completed services appear here until admin closes the status." /> : stats.bookings.map((booking) => (
        <View key={booking._id} style={statusStyles.card}>
          <Text style={statusStyles.title}>{booking.completedServiceName || 'Service'}</Text>
          <Text style={statusStyles.copy}>{booking.customerName || booking.customer?.name || 'Customer'} | {booking.customerPhone || booking.customer?.phone || ''}</Text>
          <Text style={statusStyles.amount}>Rs {booking.paymentAmount || 0} | {booking.paymentMode || 'cash'}</Text>
        </View>
      ))}
    </AppScreen>
  );
}

const statusStyles = StyleSheet.create({
  summaryRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 14,
  },
  summaryCard: {
    flex: 1,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.line,
    padding: 14,
    backgroundColor: colors.panel,
  },
  value: {
    color: colors.successSoft,
    fontSize: 20,
    fontWeight: '900',
  },
  label: {
    marginTop: 4,
    color: colors.muted,
    fontWeight: '800',
  },
  card: {
    marginBottom: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.line,
    padding: 14,
    backgroundColor: colors.panel,
  },
  title: {
    color: colors.text,
    fontWeight: '900',
  },
  copy: {
    marginTop: 5,
    color: colors.muted,
  },
  amount: {
    marginTop: 8,
    color: colors.successSoft,
    fontWeight: '900',
  },
});
