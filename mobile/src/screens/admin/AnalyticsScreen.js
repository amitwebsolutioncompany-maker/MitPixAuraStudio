import React, {useCallback, useEffect, useState} from 'react';
import {Text} from 'react-native-paper';
import AppScreen from '../../components/AppScreen';
import ResourceCard from '../../components/ResourceCard';
import {analyticsApi} from '../../api/endpoints';
import {styles} from '../../theme/styles';

function formatBreakdown(items = []) {
  if (!items.length) return 'No data yet';
  return items.map((item) => `${item._id || 'unknown'}: ${item.count}`).join('\n');
}

export default function AnalyticsScreen() {
  const [stats, setStats] = useState({});
  const [refreshing, setRefreshing] = useState(false);

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
      <Text variant="titleLarge" style={styles.title}>Analytics</Text>
      <ResourceCard title="Booking status" subtitle={formatBreakdown(stats.bookingStatus)} />
      <ResourceCard title="Slot status" subtitle={formatBreakdown(stats.slotStatus)} />
      {(stats.perSalon || []).map((salon) => (
        <ResourceCard
          key={salon._id}
          title={`${salon.name} performance`}
          subtitle={`${salon.city}\nEmployees: ${salon.employees}\nBookings: ${salon.bookings}`}
        />
      ))}
    </AppScreen>
  );
}
