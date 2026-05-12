import React, {useState} from 'react';
import {Button, Text} from 'react-native-paper';
import AppScreen from '../../components/AppScreen';
import {bookingApi} from '../../api/endpoints';
import {useBookingStore} from '../../store/bookingStore';
import {styles} from '../../theme/styles';

export default function BookNowScreen({navigation}) {
  const {salon, employee, slot, resetBooking} = useBookingStore();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');

  async function book() {
    setBusy(true);
    setMessage('');
    try {
      await bookingApi.create({slotId: slot?._id});
      setMessage('Booking confirmed');
      resetBooking();
      navigation.navigate('MyBookings');
    } catch (err) {
      setMessage(err.response?.data?.message || 'Booking failed');
    } finally {
      setBusy(false);
    }
  }

  return (
    <AppScreen>
      <Text variant="headlineSmall" style={styles.title}>Confirm booking</Text>
      <Text>{salon?.name}</Text>
      <Text>{employee?.user?.name}</Text>
      <Text>{slot?.startTime} - {slot?.endTime}</Text>
      {message ? <Text style={{marginTop: 12}}>{message}</Text> : null}
      <Button style={{marginTop: 16}} mode="contained" loading={busy} disabled={!slot || busy} onPress={book}>Book now</Button>
    </AppScreen>
  );
}
