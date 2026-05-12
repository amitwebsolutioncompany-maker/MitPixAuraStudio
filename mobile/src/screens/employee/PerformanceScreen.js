import React, {useEffect, useState} from 'react';
import {Text} from 'react-native-paper';
import AppScreen from '../../components/AppScreen';
import {bookingApi} from '../../api/endpoints';
import {styles} from '../../theme/styles';

export default function PerformanceScreen() {
  const [stats, setStats] = useState({total: 0, completed: 0, active: 0});

  useEffect(() => {
    bookingApi.mine().then(({data}) => {
      const bookings = data.bookings || [];
      setStats({
        total: bookings.length,
        completed: bookings.filter((booking) => booking.status === 'completed').length,
        active: bookings.filter((booking) => ['booked', 'occupied'].includes(booking.status)).length
      });
    });
  }, []);

  return (
    <AppScreen>
      <Text variant="headlineSmall" style={styles.title}>My performance</Text>
      <Text>Total bookings: {stats.total}</Text>
      <Text>Completed services: {stats.completed}</Text>
      <Text>Active services: {stats.active}</Text>
    </AppScreen>
  );
}
