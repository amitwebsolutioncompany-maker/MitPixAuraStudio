import React, {useCallback, useEffect, useState} from 'react';
import AppScreen from '../../components/AppScreen';
import EmptyState from '../../components/EmptyState';
import ResourceCard from '../../components/ResourceCard';
import {bookingApi} from '../../api/endpoints';

export default function MyBookingsScreen() {
  const [bookings, setBookings] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    setRefreshing(true);
    try {
      const {data} = await bookingApi.mine();
      setBookings(data.bookings);
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <AppScreen refreshing={refreshing} onRefresh={load}>
      {!bookings.length ? <EmptyState title="No bookings yet" /> : bookings.map((booking) => (
        <ResourceCard
          key={booking._id}
          title={booking.salon?.name || 'Salon booking'}
          subtitle={`${booking.slot?.date || ''} ${booking.slot?.startTime || ''}`}
          meta={booking.status}
        />
      ))}
    </AppScreen>
  );
}
