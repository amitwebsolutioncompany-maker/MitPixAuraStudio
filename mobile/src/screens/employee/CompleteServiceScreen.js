import React, {useCallback, useEffect, useState} from 'react';
import {StyleSheet, View} from 'react-native';
import {Button, SegmentedButtons, Text, TextInput} from 'react-native-paper';
import AppScreen from '../../components/AppScreen';
import EmptyState from '../../components/EmptyState';
import {slotApi} from '../../api/endpoints';
import {useAuthStore} from '../../store/authStore';
import {styles} from '../../theme/styles';
import {colors} from '../../theme/theme';
import {todayIso} from '../../utils/date';

export default function CompleteServiceScreen() {
  const employeeId = useAuthStore((state) => state.user?.employeeId);
  const [slots, setSlots] = useState([]);
  const [forms, setForms] = useState({});
  const [message, setMessage] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    if (!employeeId) {
      return;
    }
    setRefreshing(true);
    try {
      const {data} = await slotApi.list({employee: employeeId, date: todayIso()});
      setSlots((data.slots || []).filter((slot) => ['booked', 'occupied'].includes(slot.status)));
    } finally {
      setRefreshing(false);
    }
  }, [employeeId]);

  useEffect(() => {
    load();
  }, [load]);

  function updateForm(slotId, field, value) {
    setForms((current) => ({
      ...current,
      [slotId]: {...current[slotId], paymentMode: current[slotId]?.paymentMode || 'cash', [field]: value},
    }));
  }

  async function complete(slot) {
    const booking = slot.booking || {};
    const form = forms[slot._id] || {paymentMode: 'cash'};
    try {
      await slotApi.complete(slot._id, {
        completedServiceName: form.completedServiceName || booking.service?.name || '',
        paymentAmount: form.paymentAmount || '0',
        paymentMode: form.paymentMode || 'cash',
        paymentNotes: form.paymentNotes,
      });
      setMessage('Service completed and earning saved');
      await load();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Unable to complete');
    }
  }

  return (
    <AppScreen refreshing={refreshing} onRefresh={load}>
      <Text variant="titleLarge" style={styles.title}>Booked slots</Text>
      {message ? <Text style={bookedStyles.message}>{message}</Text> : null}
      {!slots.length ? <EmptyState title="No booked slots today" /> : slots.map((slot) => {
        const form = forms[slot._id] || {paymentMode: 'cash'};
        return (
          <View key={slot._id} style={bookedStyles.card}>
            <View style={bookedStyles.header}>
              <Text style={bookedStyles.time}>{slot.startTime}-{slot.endTime}</Text>
              <Text style={bookedStyles.badge}>{slot.status}</Text>
            </View>
            <Text style={bookedStyles.customer}>{slot.booking?.customerName || slot.booking?.customer?.name || slot.offlineCustomerName || 'Customer'}</Text>
            <Text style={bookedStyles.copy}>{slot.booking?.customerPhone || slot.booking?.customer?.phone || slot.offlineCustomerPhone || 'No number'}</Text>
            <TextInput label="Service done" value={form.completedServiceName || slot.booking?.service?.name || ''} onChangeText={(value) => updateForm(slot._id, 'completedServiceName', value)} style={styles.input} />
            <TextInput label="Payment amount" keyboardType="numeric" value={form.paymentAmount || ''} onChangeText={(value) => updateForm(slot._id, 'paymentAmount', value)} style={styles.input} />
            <SegmentedButtons
              value={form.paymentMode || 'cash'}
              onValueChange={(value) => updateForm(slot._id, 'paymentMode', value)}
              buttons={[{value: 'cash', label: 'Cash'}, {value: 'online', label: 'Online'}]}
              style={bookedStyles.segment}
            />
            <Button mode="contained" buttonColor={colors.success} textColor={colors.ink} onPress={() => complete(slot)}>
              Complete service
            </Button>
          </View>
        );
      })}
    </AppScreen>
  );
}

const bookedStyles = StyleSheet.create({
  card: {
    marginBottom: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.success,
    padding: 14,
    backgroundColor: colors.panel,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  time: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '900',
  },
  badge: {
    borderRadius: 8,
    overflow: 'hidden',
    paddingHorizontal: 10,
    paddingVertical: 5,
    color: colors.ink,
    fontWeight: '900',
    backgroundColor: colors.successSoft,
    textTransform: 'capitalize',
  },
  customer: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '900',
  },
  copy: {
    marginTop: 4,
    marginBottom: 12,
    color: colors.muted,
  },
  segment: {
    marginBottom: 12,
  },
  message: {
    marginBottom: 12,
    color: colors.successSoft,
  },
});
