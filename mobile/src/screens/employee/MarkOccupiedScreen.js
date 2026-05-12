import React, {useCallback, useEffect, useState} from 'react';
import {Button, Chip, Text, TextInput} from 'react-native-paper';
import AppScreen from '../../components/AppScreen';
import EmptyState from '../../components/EmptyState';
import {slotApi} from '../../api/endpoints';
import {useAuthStore} from '../../store/authStore';
import {styles} from '../../theme/styles';
import {todayIso} from '../../utils/date';

export default function MarkOccupiedScreen() {
  const employeeId = useAuthStore((state) => state.user?.employeeId);
  const [slots, setSlots] = useState([]);
  const [slotId, setSlotId] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [message, setMessage] = useState('');

  const load = useCallback(async () => {
    const {data} = await slotApi.list({employee: employeeId, date: todayIso(), status: 'available'});
    setSlots(data.slots);
  }, [employeeId]);

  useEffect(() => {
    if (employeeId) load();
  }, [employeeId, load]);

  async function submit() {
    try {
      await slotApi.occupied(slotId, {customerName, customerPhone});
      setMessage('Slot marked occupied');
      setCustomerName('');
      setCustomerPhone('');
      setSlotId('');
      load();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Unable to mark occupied');
    }
  }

  return (
    <AppScreen>
      <Text variant="titleLarge" style={styles.title}>Offline customer</Text>
      <TextInput label="Customer name" value={customerName} onChangeText={setCustomerName} style={styles.input} />
      <TextInput label="Customer phone" keyboardType="phone-pad" value={customerPhone} onChangeText={setCustomerPhone} style={styles.input} />
      {!slots.length ? <EmptyState title="No available slots" /> : slots.map((slot) => (
        <Chip key={slot._id} selected={slotId === slot._id} onPress={() => setSlotId(slot._id)} style={{marginBottom: 8}}>
          {slot.startTime} - {slot.endTime}
        </Chip>
      ))}
      {message ? <Text style={{marginVertical: 12}}>{message}</Text> : null}
      <Button mode="contained" disabled={!slotId || !customerName || !customerPhone} onPress={submit}>Mark occupied</Button>
    </AppScreen>
  );
}
