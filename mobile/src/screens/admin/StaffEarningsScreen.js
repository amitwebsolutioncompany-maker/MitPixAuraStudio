import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {StyleSheet, View} from 'react-native';
import {Button, Text} from 'react-native-paper';
import AppScreen from '../../components/AppScreen';
import EmptyState from '../../components/EmptyState';
import {analyticsApi} from '../../api/endpoints';
import {styles} from '../../theme/styles';
import {colors} from '../../theme/theme';

export default function StaffEarningsScreen() {
  const [salons, setSalons] = useState([]);
  const [selectedSalon, setSelectedSalon] = useState('');
  const [selectedStaff, setSelectedStaff] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const selectedSalonGroup = useMemo(
    () => salons.find((item) => String(item.salon?._id) === String(selectedSalon)),
    [salons, selectedSalon],
  );

  const selectedStaffItem = useMemo(
    () => (selectedSalonGroup?.staff || []).find((item) => String(item.employee?._id) === String(selectedStaff)),
    [selectedSalonGroup, selectedStaff],
  );

  const load = useCallback(async () => {
    setRefreshing(true);
    try {
      const {data} = await analyticsApi.staffEarnings();
      const salonGroups = data.salons || [];
      setSalons(salonGroups);
      if (!selectedSalon && salonGroups[0]) {
        setSelectedSalon(salonGroups[0].salon?._id);
      }
    } finally {
      setRefreshing(false);
    }
  }, [selectedSalon]);

  useEffect(() => {
    load();
  }, [load]);

  async function closeStatus(employeeId) {
    await analyticsApi.closeStaffEarnings(employeeId);
    setSelectedStaff('');
    await load();
  }

  return (
    <AppScreen refreshing={refreshing} onRefresh={load}>
      <Text variant="headlineSmall" style={styles.title}>Staff service & earning</Text>
      <Text variant="titleMedium" style={earningStyles.sectionTitle}>Salon branches</Text>
      <View style={earningStyles.grid}>
        {salons.map((item) => (
          <Button
            key={item.salon?._id}
            mode={selectedSalon === item.salon?._id ? 'contained' : 'outlined'}
            buttonColor={selectedSalon === item.salon?._id ? colors.gold : undefined}
            textColor={selectedSalon === item.salon?._id ? colors.ink : colors.text}
            style={earningStyles.selector}
            onPress={() => { setSelectedSalon(item.salon?._id); setSelectedStaff(''); }}>
            {item.salon?.name || 'Salon'}
          </Button>
        ))}
      </View>

      <Text variant="titleMedium" style={earningStyles.sectionTitle}>Staff</Text>
      {!selectedSalonGroup?.staff?.length ? <EmptyState title="No staff in this salon" /> : (
        <View style={earningStyles.grid}>
          {selectedSalonGroup.staff.map((item) => (
            <Button
              key={item.employee?._id}
              mode={selectedStaff === item.employee?._id ? 'contained' : 'outlined'}
              buttonColor={selectedStaff === item.employee?._id ? colors.success : undefined}
              textColor={selectedStaff === item.employee?._id ? colors.ink : colors.text}
              style={earningStyles.selector}
              onPress={() => setSelectedStaff(item.employee?._id)}>
              {item.employee?.user?.name || 'Staff'}
            </Button>
          ))}
        </View>
      )}

      {!selectedStaffItem ? <EmptyState title="Select staff for earning details" /> : (
        <View style={earningStyles.card}>
          <Text style={earningStyles.name}>{selectedStaffItem.employee?.user?.name || 'Staff'}</Text>
          <Text style={earningStyles.copy}>{selectedSalonGroup?.salon?.name || 'Salon'} | {selectedStaffItem.employee?.user?.phone || selectedStaffItem.employee?.user?.email || 'No contact'}</Text>
          <View style={earningStyles.metricRow}>
            <View style={earningStyles.metricBox}>
              <Text style={earningStyles.label}>Current day services</Text>
              <Text style={earningStyles.value}>{selectedStaffItem.todayServices || 0}</Text>
              <Text style={earningStyles.amount}>Rs {selectedStaffItem.todayPaid || 0}</Text>
            </View>
            <View style={earningStyles.metricBox}>
              <Text style={earningStyles.label}>Till admin close</Text>
              <Text style={earningStyles.value}>{selectedStaffItem.periodServices || selectedStaffItem.services || 0}</Text>
              <Text style={earningStyles.amount}>Rs {selectedStaffItem.periodPaid || selectedStaffItem.totalPaid || 0}</Text>
            </View>
          </View>
          {!selectedStaffItem.bookings?.length ? <EmptyState title="No open completed services" /> : selectedStaffItem.bookings.map((booking) => (
            <View key={booking._id} style={earningStyles.detailRow}>
              <Text style={earningStyles.detailTitle}>{booking.completedServiceName || 'Service'}</Text>
              <Text style={earningStyles.copy}>{booking.customerName || booking.customer?.name || 'Customer'} | Rs {booking.paymentAmount || 0} | {booking.paymentMode || 'cash'}</Text>
            </View>
          ))}
          <Button
            mode="contained"
            buttonColor={colors.danger}
            disabled={!selectedStaffItem.bookings?.length}
            style={earningStyles.completeButton}
            onPress={() => closeStatus(selectedStaffItem.employee?._id)}>
            Complete status
          </Button>
        </View>
      )}
    </AppScreen>
  );
}

const earningStyles = StyleSheet.create({
  sectionTitle: {
    marginTop: 12,
    marginBottom: 10,
    color: colors.text,
    fontWeight: '900',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  selector: {
    marginBottom: 4,
    borderRadius: 8,
  },
  card: {
    marginTop: 16,
    marginBottom: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.gold,
    padding: 14,
    backgroundColor: colors.panel,
  },
  name: {
    color: colors.text,
    fontSize: 17,
    fontWeight: '900',
  },
  copy: {
    marginTop: 6,
    color: colors.muted,
  },
  metricRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
    marginBottom: 12,
  },
  metricBox: {
    flex: 1,
    borderRadius: 8,
    padding: 10,
    backgroundColor: colors.charcoal,
  },
  label: {
    color: colors.muted,
    fontWeight: '800',
  },
  value: {
    marginTop: 8,
    color: colors.softGold,
    fontSize: 20,
    fontWeight: '900',
  },
  amount: {
    marginTop: 6,
    color: colors.successSoft,
    fontWeight: '900',
  },
  detailRow: {
    marginTop: 10,
    borderRadius: 8,
    padding: 10,
    backgroundColor: colors.charcoal,
  },
  detailTitle: {
    color: colors.text,
    fontWeight: '900',
  },
  completeButton: {
    marginTop: 14,
  },
});
