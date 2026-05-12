import React, {useCallback, useEffect, useState} from 'react';
import {Button, Chip, Text} from 'react-native-paper';
import AppScreen from '../../components/AppScreen';
import EmptyState from '../../components/EmptyState';
import {slotApi} from '../../api/endpoints';
import {useAuthStore} from '../../store/authStore';
import {styles} from '../../theme/styles';
import {todayIso} from '../../utils/date';

export default function CompleteServiceScreen() {
  const employeeId = useAuthStore((state) => state.user?.employeeId);
  const [slots, setSlots] = useState([]);
  const [message, setMessage] = useState('');

  const load = useCallback(async () => {
    const {data} = await slotApi.list({employee: employeeId, date: todayIso()});
    setSlots(data.slots.filter((slot) => ['booked', 'occupied'].includes(slot.status)));
  }, [employeeId]);

  useEffect(() => {
    if (employeeId) load();
  }, [employeeId, load]);

  async function complete(id) {
    try {
      await slotApi.complete(id);
      setMessage('Service completed');
      load();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Unable to complete');
    }
  }

  return (
    <AppScreen>
      <Text variant="titleLarge" style={styles.title}>Complete service</Text>
      {message ? <Text style={{marginBottom: 12}}>{message}</Text> : null}
      {!slots.length ? <EmptyState title="No active services" /> : slots.map((slot) => (
        <Chip key={slot._id} style={{marginBottom: 8}} onPress={() => complete(slot._id)}>
          {slot.startTime}-{slot.endTime} | {slot.status}
        </Chip>
      ))}
      <Button mode="text" onPress={load}>Refresh</Button>
    </AppScreen>
  );
}
