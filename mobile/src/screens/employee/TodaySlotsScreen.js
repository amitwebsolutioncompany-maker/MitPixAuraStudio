import React, {useCallback, useEffect, useState} from 'react';
import {Chip, Text} from 'react-native-paper';
import AppScreen from '../../components/AppScreen';
import EmptyState from '../../components/EmptyState';
import {slotApi} from '../../api/endpoints';
import {useAuthStore} from '../../store/authStore';
import {styles} from '../../theme/styles';
import {todayIso} from '../../utils/date';

export default function TodaySlotsScreen() {
  const employeeId = useAuthStore((state) => state.user?.employeeId);
  const [slots, setSlots] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    if (!employeeId) return;
    setRefreshing(true);
    try {
      const {data} = await slotApi.list({employee: employeeId, date: todayIso()});
      setSlots(data.slots);
    } finally {
      setRefreshing(false);
    }
  }, [employeeId]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <AppScreen refreshing={refreshing} onRefresh={load}>
      <Text variant="titleLarge" style={styles.title}>Today's slots</Text>
      {!slots.length ? <EmptyState title="No slots generated" /> : slots.map((slot) => (
        <Chip key={slot._id} style={{marginBottom: 8}} mode={slot.status === 'available' ? 'outlined' : 'flat'}>
          {slot.startTime}-{slot.endTime} | {slot.status}
        </Chip>
      ))}
    </AppScreen>
  );
}
