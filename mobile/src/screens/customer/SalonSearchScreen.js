import React, {useEffect, useState} from 'react';
import {Button, TextInput} from 'react-native-paper';
import AppScreen from '../../components/AppScreen';
import EmptyState from '../../components/EmptyState';
import ResourceCard from '../../components/ResourceCard';
import {salonApi} from '../../api/endpoints';
import {useBookingStore} from '../../store/bookingStore';
import {styles} from '../../theme/styles';

export default function SalonSearchScreen({navigation}) {
  const [city, setCity] = useState('');
  const [salons, setSalons] = useState([]);
  const setSalon = useBookingStore((state) => state.setSalon);
  const setBookingCity = useBookingStore((state) => state.setCity);

  async function load() {
    const {data} = await salonApi.list(city ? {city} : undefined);
    setSalons(data.salons);
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <AppScreen>
      <TextInput label="City" value={city} onChangeText={setCity} style={styles.input} />
      <Button mode="contained-tonal" onPress={() => { setBookingCity(city); load(); }}>Search</Button>
      {!salons.length ? <EmptyState title="No salons found" message="Try another city name." /> : salons.map((salon) => (
        <ResourceCard
          key={salon._id}
          title={salon.name}
          subtitle={salon.address}
          meta={`${salon.city} | ${salon.openingTime}-${salon.closingTime}`}
          actionLabel="Choose"
          onPress={() => { setSalon(salon); navigation.navigate('SalonDetails', {salonId: salon._id}); }}
        />
      ))}
    </AppScreen>
  );
}
