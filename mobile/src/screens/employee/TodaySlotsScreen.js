import React, {useCallback, useEffect, useState} from 'react';
import {Pressable, StyleSheet, View} from 'react-native';
import {Button, Dialog, Portal, RadioButton, Text, TextInput} from 'react-native-paper';
import AppScreen from '../../components/AppScreen';
import EmptyState from '../../components/EmptyState';
import {slotApi} from '../../api/endpoints';
import {useAuthStore} from '../../store/authStore';
import {styles} from '../../theme/styles';
import {colors} from '../../theme/theme';
import {todayIso} from '../../utils/date';

export default function TodaySlotsScreen() {
  const employeeId = useAuthStore((state) => state.user?.employeeId);
  const [slots, setSlots] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [mode, setMode] = useState('walkin');
  const [form, setForm] = useState({customerName: '', customerPhone: '', reason: ''});
  const [message, setMessage] = useState('');
  const [dayBreakBusy, setDayBreakBusy] = useState(false);

  const load = useCallback(async () => {
    if (!employeeId) {
      return;
    }
    setRefreshing(true);
    try {
      const {data} = await slotApi.list({employee: employeeId, date: todayIso()});
      setSlots(data.slots || []);
    } finally {
      setRefreshing(false);
    }
  }, [employeeId]);

  useEffect(() => {
    load();
  }, [load]);

  function isPast(slot) {
    return new Date(`${slot.date || todayIso()}T${slot.startTime}:00`) <= new Date();
  }

  function customerText(slot) {
    const booking = slot.booking;
    if (!booking) {
      return 'Available';
    }
    return `${booking.customerName || booking.customer?.name || 'Customer'} | ${booking.customerPhone || booking.customer?.phone || ''}`;
  }

  async function saveAction() {
    if (!selectedSlot) {
      return;
    }
    setMessage('');
    try {
      if (mode === 'walkin') {
        await slotApi.occupied(selectedSlot._id, {
          customerName: form.customerName,
          customerPhone: form.customerPhone,
        });
      } else {
        await slotApi.break(selectedSlot._id, {reason: form.reason});
      }
      setSelectedSlot(null);
      setForm({customerName: '', customerPhone: '', reason: ''});
      await load();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Unable to update slot');
    }
  }

  async function markDayBreak() {
    setDayBreakBusy(true);
    setMessage('');
    try {
      const {data} = await slotApi.dayBreak({employee: employeeId, date: todayIso(), reason: 'Staff leave'});
      setMessage(`${data.updated || 0} slots marked as break for today`);
      await load();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Unable to mark day break');
    } finally {
      setDayBreakBusy(false);
    }
  }

  return (
    <AppScreen refreshing={refreshing} onRefresh={load}>
      <Text variant="titleLarge" style={styles.title}>Today's slots</Text>
      <Button
        mode="contained-tonal"
        loading={dayBreakBusy}
        disabled={dayBreakBusy || !employeeId}
        buttonColor={colors.gold}
        textColor={colors.ink}
        style={slotStyles.dayBreakButton}
        onPress={markDayBreak}>
        Mark today as leave
      </Button>
      {message ? <Text style={slotStyles.message}>{message}</Text> : null}
      {!slots.length ? <EmptyState title="No slots generated" /> : (
        <View style={slotStyles.grid}>
          {slots.map((slot) => {
            const disabled = isPast(slot);
            const booked = ['booked', 'occupied'].includes(slot.status);
            const isBreak = slot.status === 'break';
            return (
              <Pressable
                key={slot._id}
                disabled={disabled || slot.status !== 'available'}
                onPress={() => setSelectedSlot(slot)}
                style={[
                  slotStyles.card,
                  booked && slotStyles.bookedCard,
                  isBreak && slotStyles.breakCard,
                  disabled && slotStyles.disabledCard,
                ]}>
                <Text style={slotStyles.time}>{slot.startTime}-{slot.endTime}</Text>
                <Text style={slotStyles.status}>{disabled ? 'Closed' : slot.status}</Text>
                <Text numberOfLines={2} style={slotStyles.customer}>
                  {booked ? customerText(slot) : isBreak ? slot.breakReason || 'Break' : 'Tap for walk-in or break'}
                </Text>
              </Pressable>
            );
          })}
        </View>
      )}

      <Portal>
        <Dialog visible={Boolean(selectedSlot)} onDismiss={() => setSelectedSlot(null)} style={slotStyles.dialog}>
          <Dialog.Title style={slotStyles.dialogTitle}>Manage slot</Dialog.Title>
          <Dialog.Content>
            <RadioButton.Group onValueChange={setMode} value={mode}>
              <RadioButton.Item label="Book walk-in" value="walkin" labelStyle={slotStyles.dialogLabel} />
              <RadioButton.Item label="Mark break" value="break" labelStyle={slotStyles.dialogLabel} />
            </RadioButton.Group>
            {mode === 'walkin' ? (
              <>
                <TextInput label="Customer name" value={form.customerName} onChangeText={(value) => setForm({...form, customerName: value})} style={[styles.input, slotStyles.dialogInput]} />
                <TextInput label="Mobile number" keyboardType="phone-pad" value={form.customerPhone} onChangeText={(value) => setForm({...form, customerPhone: value})} style={[styles.input, slotStyles.dialogInput]} />
              </>
            ) : (
              <TextInput label="Break reason" value={form.reason} onChangeText={(value) => setForm({...form, reason: value})} style={[styles.input, slotStyles.dialogInput]} />
            )}
          </Dialog.Content>
          <Dialog.Actions>
            <Button textColor={colors.ink} onPress={() => setSelectedSlot(null)}>Cancel</Button>
            <Button mode="contained" buttonColor={colors.ink} textColor={colors.softGold} onPress={saveAction}>Save</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </AppScreen>
  );
}

const slotStyles = StyleSheet.create({
  dayBreakButton: {
    marginBottom: 12,
    borderRadius: 8,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  card: {
    width: '48%',
    minHeight: 116,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.line,
    padding: 10,
    backgroundColor: colors.panel,
  },
  bookedCard: {
    borderColor: '#F3C04E',
    backgroundColor: '#2D2307',
  },
  breakCard: {
    borderColor: colors.danger,
    backgroundColor: '#341817',
  },
  disabledCard: {
    opacity: 0.45,
    backgroundColor: colors.charcoal,
  },
  time: {
    color: colors.text,
    fontWeight: '900',
  },
  status: {
    marginTop: 5,
    color: colors.successSoft,
    fontWeight: '900',
    textTransform: 'capitalize',
  },
  customer: {
    marginTop: 8,
    color: colors.muted,
  },
  message: {
    marginBottom: 12,
    color: colors.danger,
  },
  dialog: {
    backgroundColor: colors.gold,
  },
  dialogTitle: {
    color: colors.ink,
    fontWeight: '900',
  },
  dialogLabel: {
    color: colors.ink,
    fontWeight: '800',
  },
  dialogInput: {
    backgroundColor: colors.softGold,
  },
});
