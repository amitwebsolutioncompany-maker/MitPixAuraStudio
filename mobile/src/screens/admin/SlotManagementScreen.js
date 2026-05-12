import React, {useEffect, useMemo, useState} from 'react';
import {Button, Chip, Text, TextInput} from 'react-native-paper';
import AppScreen from '../../components/AppScreen';
import EmptyState from '../../components/EmptyState';
import ResourceCard from '../../components/ResourceCard';
import {salonApi, slotApi} from '../../api/endpoints';
import {styles} from '../../theme/styles';
import {todayIso} from '../../utils/date';

const statuses = ['available', 'booked', 'occupied', 'break', 'completed'];

export default function SlotManagementScreen() {
  const [salons, setSalons] = useState([]);
  const [salon, setSalon] = useState('');
  const [date, setDate] = useState(todayIso());
  const [slots, setSlots] = useState([]);
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  const selectedSalon = useMemo(() => salons.find((item) => item._id === salon), [salons, salon]);

  async function loadSalons() {
    const {data} = await salonApi.list();
    setSalons(data.salons || []);
    if (!salon && data.salons?.[0]) setSalon(data.salons[0]._id);
  }

  async function loadSlots(targetSalon = salon) {
    if (!targetSalon) return;
    setBusy(true);
    setMessage('');
    try {
      const {data} = await slotApi.list({salon: targetSalon, date});
      setSlots(data.slots || []);
      setMessage(`Loaded ${data.slots?.length || 0} slots for ${selectedSalon?.name || 'salon'}`);
    } catch (err) {
      setMessage(err.response?.data?.message || err.message || 'Slot load failed');
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    loadSalons();
  }, []);

  const byEmployee = slots.reduce((acc, slot) => {
    const name = slot.employee?.user?.name || 'Employee';
    acc[name] = acc[name] || [];
    acc[name].push(slot);
    return acc;
  }, {});

  const counts = statuses.map((status) => `${status}: ${slots.filter((slot) => slot.status === status).length}`).join(' | ');

  return (
    <AppScreen refreshing={busy} onRefresh={() => loadSlots()}>
      <Text variant="titleLarge" style={styles.title}>Slot management</Text>
      <Text style={styles.subtitle}>Slots are generated automatically per employee for the selected salon and date.</Text>

      {salons.map((item) => (
        <Chip key={item._id} selected={salon === item._id} onPress={() => { setSalon(item._id); setSlots([]); }} style={{marginBottom: 8}}>
          {item.name} | {item.city}
        </Chip>
      ))}

      <TextInput label="Date YYYY-MM-DD" value={date} onChangeText={setDate} style={styles.input} />
      <Button mode="contained" loading={busy} disabled={!salon || busy} onPress={() => loadSlots()}>Generate / load slots</Button>
      {message ? <Text style={{marginVertical: 12}}>{message}</Text> : null}
      {slots.length ? <Text style={styles.subtitle}>{counts}</Text> : null}
      {!slots.length ? <EmptyState title="No slots loaded" message="Select a salon and tap generate / load slots." /> : null}

      {Object.entries(byEmployee).map(([employeeName, employeeSlots]) => (
        <ResourceCard
          key={employeeName}
          title={`${employeeName} (${employeeSlots.length} slots)`}
          subtitle={employeeSlots.map((slot) => `${slot.startTime}-${slot.endTime} | ${slot.status}`).join('\n')}
          meta={selectedSalon ? `${selectedSalon.name} | ${date}` : date}
        />
      ))}
    </AppScreen>
  );
}
