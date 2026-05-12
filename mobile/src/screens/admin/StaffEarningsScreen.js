import React, {useCallback, useEffect, useState} from 'react';
import {StyleSheet, View} from 'react-native';
import {Button, Text} from 'react-native-paper';
import AppScreen from '../../components/AppScreen';
import EmptyState from '../../components/EmptyState';
import {analyticsApi} from '../../api/endpoints';
import {styles} from '../../theme/styles';
import {colors} from '../../theme/theme';

export default function StaffEarningsScreen() {
  const [staff, setStaff] = useState([]);
  const [selected, setSelected] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    setRefreshing(true);
    try {
      const {data} = await analyticsApi.staffEarnings();
      setStaff(data.staff || []);
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function closeStatus(employeeId) {
    await analyticsApi.closeStaffEarnings(employeeId);
    setSelected(null);
    await load();
  }

  return (
    <AppScreen refreshing={refreshing} onRefresh={load}>
      <Text variant="headlineSmall" style={styles.title}>Staff service & earning</Text>
      {!staff.length ? <EmptyState title="No open staff earnings" /> : staff.map((item) => {
        const employeeId = item.employee?._id;
        const open = selected === employeeId;
        return (
          <View key={employeeId} style={earningStyles.card}>
            <Text style={earningStyles.name}>{item.employee?.user?.name || 'Staff'}</Text>
            <Text style={earningStyles.copy}>{item.salon?.name || 'Salon'} | Services: {item.services}</Text>
            <Text style={earningStyles.amount}>Rs {item.totalPaid || 0}</Text>
            <Button mode="contained-tonal" onPress={() => setSelected(open ? null : employeeId)}>
              {open ? 'Hide details' : 'View details'}
            </Button>
            {open ? (
              <View style={earningStyles.details}>
                {item.bookings.map((booking) => (
                  <View key={booking._id} style={earningStyles.detailRow}>
                    <Text style={earningStyles.detailTitle}>{booking.completedServiceName || 'Service'}</Text>
                    <Text style={earningStyles.copy}>{booking.customerName || 'Customer'} | Rs {booking.paymentAmount || 0} | {booking.paymentMode || 'cash'}</Text>
                  </View>
                ))}
                <Button mode="contained" buttonColor={colors.danger} onPress={() => closeStatus(employeeId)}>
                  Complete status
                </Button>
              </View>
            ) : null}
          </View>
        );
      })}
    </AppScreen>
  );
}

const earningStyles = StyleSheet.create({
  card: {
    marginBottom: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.line,
    padding: 14,
    backgroundColor: colors.panel,
  },
  name: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '900',
  },
  copy: {
    marginTop: 5,
    color: colors.muted,
  },
  amount: {
    marginTop: 8,
    marginBottom: 10,
    color: colors.successSoft,
    fontSize: 18,
    fontWeight: '900',
  },
  details: {
    marginTop: 12,
    gap: 10,
  },
  detailRow: {
    borderRadius: 8,
    padding: 10,
    backgroundColor: colors.charcoal,
  },
  detailTitle: {
    color: colors.text,
    fontWeight: '900',
  },
});
