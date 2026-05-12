import React, {useEffect, useCallback, useState} from 'react';
import {Button, Text} from 'react-native-paper';
import AppScreen from '../../components/AppScreen';
import ResourceCard from '../../components/ResourceCard';
import {analyticsApi} from '../../api/endpoints';
import {useAuthStore} from '../../store/authStore';
import {styles} from '../../theme/styles';

export default function DashboardScreen() {
  const [stats, setStats] = useState({});
  const [refreshing, setRefreshing] = useState(false);
  const logout = useAuthStore((state) => state.logout);

  const load = useCallback(async () => {
    setRefreshing(true);
    try {
      const {data} = await analyticsApi.dashboard();
      setStats(data);
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <AppScreen refreshing={refreshing} onRefresh={load}>
      <Text variant="headlineSmall" style={styles.title}>Admin dashboard</Text>
      <ResourceCard title="Salons" meta={String(stats.salons || 0)} subtitle="Active salon branches" />
      <ResourceCard title="Employees" meta={String(stats.employees || 0)} subtitle="Active employees across salons" />
      <ResourceCard title="Bookings" meta={String(stats.bookings || 0)} subtitle={`Completed: ${stats.completed || 0} | Active slots: ${stats.occupiedSlots || 0}`} />
      <ResourceCard title="Offers" meta={String(stats.offers || 0)} subtitle="Active customer offers" />
      {(stats.perSalon || []).map((salon) => (
        <ResourceCard
          key={salon._id}
          title={salon.name}
          subtitle={`${salon.city} | Employees: ${salon.employees}`}
          meta={`Bookings: ${salon.bookings}`}
        />
      ))}
      <Button mode="contained-tonal" onPress={logout}>Logout</Button>
    </AppScreen>
  );
}
