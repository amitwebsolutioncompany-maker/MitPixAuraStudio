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
import {isBookedNoShowEditable, isSlotEnded, slotDetailLines, slotStatusLabel} from '../../utils/slotDetails';

export default function TodaySlotsScreen() {
  const employeeId = useAuthStore((state) => state.user?.employeeId);
  const [slots, setSlots] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [mode, setMode] = useState('walkin');
  const [form, setForm] = useState({customerName: '', customerPhone: '', reason: ''});
  const [message, setMessage] = useState('');
  const [dayBreakBusy, setDayBreakBusy] = useState(false);
  const [confirmLeave, setConfirmLeave] = useState(false);
  const [clock, setClock] = useState(Date.now());

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

  useEffect(() => {
    const timer = setInterval(() => setClock(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  async function saveAction() {
    if (!selectedSlot) {
      return;
    }
    if (mode === 'walkin' && !/^(?:\+?91)?[6-9]\d{9}$/.test(String(form.customerPhone || '').replace(/\s|-/g, ''))) {
      setMessage('Enter a valid 10 digit mobile number. +91 is optional.');
      return;
    }
    setMessage('');
    try {
      if (mode === 'available') {
        await slotApi.available(selectedSlot._id);
      } else if (mode === 'walkin') {
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
      setConfirmLeave(false);
    }
  }

  function openSlot(slot) {
    setSelectedSlot(slot);
    setMode(slot.status === 'break' ? 'available' : 'walkin');
  }

  function canManageSlot(slot, now) {
    if (isSlotEnded(slot, now)) {
      return false;
    }
    return ['available', 'break'].includes(slot.status) || isBookedNoShowEditable(slot, now);
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
        onPress={() => setConfirmLeave(true)}>
        Mark today as leave
      </Button>
      {message ? <Text style={slotStyles.message}>{message}</Text> : null}
      {!slots.length ? <EmptyState title="No slots generated" /> : (
        <View style={slotStyles.grid}>
          {slots.map((slot) => {
            const now = new Date(clock);
            const disabled = isSlotEnded(slot, now);
            const booked = ['booked', 'occupied'].includes(slot.status);
            const isBreak = slot.status === 'break';
            const noShowEditable = isBookedNoShowEditable(slot, now);
            const canManage = canManageSlot(slot, now);
            return (
              <Pressable
                key={slot._id}
                disabled={!canManage}
                onPress={() => openSlot(slot)}
                style={[
                  slotStyles.card,
                  booked && slotStyles.bookedCard,
                  noShowEditable && slotStyles.noShowCard,
                  isBreak && slotStyles.breakCard,
                  disabled && slotStyles.disabledCard,
                ]}>
                <Text style={slotStyles.time}>{slot.startTime}-{slot.endTime}</Text>
                <Text style={slotStyles.status}>{disabled ? 'Closed' : slotStatusLabel(slot, now)}</Text>
                {slotDetailLines(slot).map((line) => (
                  <Text key={line} numberOfLines={2} style={slotStyles.customer}>{line}</Text>
                ))}
                {noShowEditable ? <Text style={slotStyles.hint}>Tap to mark walk-in or break</Text> : null}
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
              {selectedSlot?.status === 'break' ? (
                <RadioButton.Item label="Make available" value="available" labelStyle={slotStyles.dialogLabel} />
              ) : null}
              <RadioButton.Item label="Book walk-in" value="walkin" labelStyle={slotStyles.dialogLabel} />
              <RadioButton.Item label="Mark break" value="break" labelStyle={slotStyles.dialogLabel} />
            </RadioButton.Group>
            {mode === 'available' ? (
              <Text style={slotStyles.dialogCopy}>This slot will be open again for customer booking.</Text>
            ) : mode === 'walkin' ? (
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

        <Dialog visible={confirmLeave} onDismiss={() => setConfirmLeave(false)} style={slotStyles.dialog}>
          <Dialog.Title style={slotStyles.dialogTitle}>Confirm leave</Dialog.Title>
          <Dialog.Content>
            <Text style={slotStyles.dialogCopy}>Are you sure you want to mark today as leave?</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button textColor={colors.ink} onPress={() => setConfirmLeave(false)}>Cancel</Button>
            <Button mode="contained" loading={dayBreakBusy} buttonColor={colors.ink} textColor={colors.softGold} onPress={markDayBreak}>
              OK
            </Button>
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
  noShowCard: {
    borderColor: colors.success,
    backgroundColor: '#173A2A',
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
  hint: {
    marginTop: 6,
    color: colors.successSoft,
    fontSize: 11,
    fontWeight: '900',
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
  dialogCopy: {
    color: colors.ink,
    fontWeight: '800',
  },
  dialogInput: {
    backgroundColor: colors.softGold,
  },
});
