import React, {useCallback, useEffect, useState} from 'react';
import {Button, Chip, Text, TextInput} from 'react-native-paper';
import AppScreen from '../../components/AppScreen';
import EmptyState from '../../components/EmptyState';
import {slotApi} from '../../api/endpoints';
import {useAuthStore} from '../../store/authStore';
import {styles} from '../../theme/styles';
import {todayIso} from '../../utils/date';

export default function BreakModeScreen() {
  const employeeId = useAuthStore((state) => state.user?.employeeId);
  const [slots, setSlots] = useState([]);
  const [slotId, setSlotId] = useState('');
  const [reason, setReason] = useState('');
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
      await slotApi.break(slotId, {reason});
      setMessage('Break set');
      setSlotId('');
      setReason('');
      load();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Unable to set break');
    }
  }

  return (
    <AppScreen>
      <Text variant="titleLarge" style={styles.title}>Break mode</Text>
      <TextInput label="Break reason" value={reason} onChangeText={setReason} style={styles.input} />
      {!slots.length ? <EmptyState title="No available slots" /> : slots.map((slot) => (
        <Chip key={slot._id} selected={slotId === slot._id} onPress={() => setSlotId(slot._id)} style={{marginBottom: 8}}>
          {slot.startTime} - {slot.endTime}
        </Chip>
      ))}
      {message ? <Text style={{marginVertical: 12}}>{message}</Text> : null}
      <Button mode="contained" disabled={!slotId || !reason} onPress={submit}>Set break</Button>
    </AppScreen>
  );
}
