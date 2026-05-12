import React from 'react';
import {Button, Text} from 'react-native-paper';
import AppScreen from '../../components/AppScreen';
import {useBookingStore} from '../../store/bookingStore';
import {styles} from '../../theme/styles';

export default function SalonDetailsScreen({navigation}) {
  const salon = useBookingStore((state) => state.salon);

  return (
    <AppScreen>
      <Text variant="headlineSmall" style={styles.title}>{salon?.name}</Text>
      <Text style={styles.subtitle}>{salon?.address}</Text>
      <Text>Total chairs: {salon?.totalChairs}</Text>
      <Text>Timing: {salon?.openingTime} to {salon?.closingTime}</Text>
      <Button style={{marginTop: 16}} mode="contained" onPress={() => navigation.navigate('EmployeeList')}>Choose employee</Button>
    </AppScreen>
  );
}
