import React, {useEffect, useState} from 'react';
import {Button, Text} from 'react-native-paper';
import AppScreen from '../../components/AppScreen';
import ResourceCard from '../../components/ResourceCard';
import {bookingApi} from '../../api/endpoints';
import {styles} from '../../theme/styles';

export default function BookingManagementScreen() {
  const [bookings, setBookings] = useState([]);

  async function load() {
    const {data} = await bookingApi.list();
    setBookings(data.bookings);
  }

  useEffect(() => {
    load();
  }, []);

  async function remove(id) {
    await bookingApi.remove(id);
    load();
  }

  return (
    <AppScreen>
      <Text variant="titleLarge" style={styles.title}>Booking management</Text>
      {bookings.map((booking) => (
        <ResourceCard
          key={booking._id}
          title={booking.salon?.name || 'Booking'}
          subtitle={`${booking.customerName || booking.customer?.name || 'Customer'} | ${booking.slot?.startTime || ''}`}
          meta={booking.status}
          actionLabel="Delete"
          onPress={() => remove(booking._id)}
        />
      ))}
      <Button onPress={load}>Refresh</Button>
    </AppScreen>
  );
}
