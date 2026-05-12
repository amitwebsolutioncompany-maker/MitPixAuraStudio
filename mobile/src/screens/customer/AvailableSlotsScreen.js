import React, {useEffect, useState} from 'react';
import {Chip, Text} from 'react-native-paper';
import AppScreen from '../../components/AppScreen';
import EmptyState from '../../components/EmptyState';
import {slotApi} from '../../api/endpoints';
import {useBookingStore} from '../../store/bookingStore';
import {styles} from '../../theme/styles';
import {todayIso} from '../../utils/date';

export default function AvailableSlotsScreen({navigation}) {
  const employee = useBookingStore((state) => state.employee);
  const setSlot = useBookingStore((state) => state.setSlot);
  const [slots, setSlots] = useState([]);

  useEffect(() => {
    slotApi.list({employee: employee?._id, date: todayIso(), status: 'available'}).then(({data}) => setSlots(data.slots));
  }, [employee]);

  return (
    <AppScreen>
      <Text variant="titleMedium">Available today</Text>
      <Text style={styles.subtitle}>Slots are generated automatically in 30 minute intervals.</Text>
      <React.Fragment>
        {!slots.length ? <EmptyState title="No slots available" /> : null}
        <React.Fragment>
          <Text style={{marginBottom: 8}}>Choose a time</Text>
          {slots.map((slot) => (
            <Chip key={slot._id} style={{marginBottom: 8}} onPress={() => { setSlot(slot); navigation.navigate('BookNow'); }}>
              {slot.startTime} - {slot.endTime}
            </Chip>
          ))}
        </React.Fragment>
      </React.Fragment>
    </AppScreen>
  );
}
