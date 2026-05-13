import React, {useEffect, useState} from 'react';
import {Pressable, StyleSheet, View} from 'react-native';
import {Button, Text} from 'react-native-paper';
import AppScreen from '../../components/AppScreen';
import EmptyState from '../../components/EmptyState';
import {bookingApi, slotApi} from '../../api/endpoints';
import {useBookingStore} from '../../store/bookingStore';
import {styles} from '../../theme/styles';
import {colors} from '../../theme/theme';
import {todayIso} from '../../utils/date';
import {isSlotEnded} from '../../utils/slotDetails';

export default function AvailableSlotsScreen({navigation}) {
  const employee = useBookingStore((state) => state.employee);
  const resetBooking = useBookingStore((state) => state.resetBooking);
  const setSlot = useBookingStore((state) => state.setSlot);
  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    slotApi.list({employee: employee?._id, date: todayIso()}).then(({data}) => setSlots(data.slots || []));
  }, [employee]);

  function slotDisabled(slot) {
    return slot.status !== 'available' || isSlotEnded(slot);
  }

  async function book(slot) {
    setBusy(true);
    setMessage('');
    try {
      await bookingApi.create({slotId: slot._id});
      setSlot(slot);
      resetBooking();
      const parent = navigation.getParent();
      if (parent) {
        parent.navigate('MyBookings', {arrivalNoticeAt: Date.now()});
      } else {
        navigation.navigate('MyBookings', {arrivalNoticeAt: Date.now()});
      }
    } catch (err) {
      setMessage(err.response?.data?.message || 'Booking failed');
    } finally {
      setBusy(false);
    }
  }

  return (
    <AppScreen>
      <Button
        mode="contained-tonal"
        buttonColor={colors.successSoft}
        textColor={colors.ink}
        onPress={() => navigation.navigate('SalonDetails')}
        style={slotStyles.backButton}>
        Back to experts
      </Button>
      <Text variant="headlineSmall" style={styles.title}>One service, one slot</Text>
      <Text style={styles.subtitle}>Book one time slot for one service. Past time and booked slots stay locked.</Text>
      {message ? <Text style={slotStyles.message}>{message}</Text> : null}
      {!slots.length ? <EmptyState title="No slots available" /> : (
        <View style={slotStyles.grid}>
          {slots.map((slot) => {
            const disabled = slotDisabled(slot);
            const selected = selectedSlot?._id === slot._id;
            return (
              <View key={slot._id} style={slotStyles.cell}>
                <Pressable
                  disabled={disabled || busy}
                  onPress={() => {
                    setSelectedSlot(slot);
                    setSlot(slot);
                  }}
                  style={[
                    slotStyles.slotCard,
                    selected && slotStyles.selectedSlot,
                    disabled && slotStyles.disabledSlot,
                  ]}>
                  <Text style={[slotStyles.time, disabled && slotStyles.disabledText]}>{slot.startTime}</Text>
                  <Text style={[slotStyles.endTime, disabled && slotStyles.disabledText]}>to {slot.endTime}</Text>
                  <Text style={[slotStyles.status, disabled && slotStyles.disabledText]}>
                    {isSlotEnded(slot) ? 'Closed' : slot.status}
                  </Text>
                </Pressable>
                {selected && !disabled ? (
                  <Button
                    mode="contained"
                    loading={busy}
                    disabled={busy}
                    buttonColor={colors.success}
                    textColor={colors.ink}
                    style={slotStyles.bookButton}
                    onPress={() => book(slot)}>
                    Book now
                  </Button>
                ) : null}
              </View>
            );
          })}
        </View>
      )}
    </AppScreen>
  );
}

const slotStyles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  cell: {
    width: '48%',
    marginBottom: 4,
  },
  slotCard: {
    minHeight: 92,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.line,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    backgroundColor: colors.panel,
  },
  selectedSlot: {
    borderColor: colors.success,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    backgroundColor: '#173A2A',
  },
  disabledSlot: {
    opacity: 0.45,
    backgroundColor: colors.charcoal,
  },
  time: {
    color: colors.text,
    fontSize: 17,
    fontWeight: '900',
  },
  endTime: {
    marginTop: 2,
    color: colors.muted,
    fontSize: 12,
  },
  status: {
    marginTop: 6,
    color: colors.success,
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'capitalize',
  },
  disabledText: {
    color: colors.muted,
  },
  bookButton: {
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
  },
  message: {
    marginBottom: 12,
    color: colors.danger,
  },
});
