import React, {useCallback, useEffect, useRef, useState} from 'react';
import {Linking, StyleSheet} from 'react-native';
import {Button, Dialog, Portal, Text} from 'react-native-paper';
import {bookingApi, slotApi} from '../api/endpoints';
import {useAuthStore} from '../store/authStore';
import {colors} from '../theme/theme';
import {todayIso} from '../utils/date';
import {bookingCustomerName, bookingCustomerPhone, bookingServiceName, slotStart} from '../utils/slotDetails';

function minutesUntilSlot(slot) {
  return Math.floor((slotStart(slot).getTime() - Date.now()) / 60000);
}

function reminderWindow(slot) {
  const minutes = minutesUntilSlot(slot);
  return minutes >= 0 && minutes <= 10;
}

function bookingAlertFromSlot(slot, type) {
  const name = bookingCustomerName(slot);
  const phone = bookingCustomerPhone(slot);
  return {
    key: `${type}-${slot.booking?._id || slot._id}`,
    type,
    title: type === 'staff-new' ? 'New customer booking' : 'Slot reminder',
    message: type === 'customer-reminder'
      ? `Your slot starts at ${slot.startTime}. Please reach 10 minutes early.`
      : `${name} | ${phone}\n${slot.startTime}-${slot.endTime}\n${bookingServiceName(slot)}`,
    phone: type === 'customer-reminder' ? null : phone,
  };
}

export default function AppointmentNotifier() {
  const user = useAuthStore((state) => state.user);
  const [alert, setAlert] = useState(null);
  const staffKnownBookings = useRef(null);
  const shownAlerts = useRef(new Set());

  const showOnce = useCallback((nextAlert) => {
    if (!nextAlert || shownAlerts.current.has(nextAlert.key)) {
      return;
    }
    shownAlerts.current.add(nextAlert.key);
    setAlert((current) => current || nextAlert);
  }, []);

  const checkCustomerBookings = useCallback(async () => {
    const {data} = await bookingApi.mine({scope: 'today'});
    const dueBooking = (data.bookings || []).find((booking) => (
      ['booked', 'occupied'].includes(booking.status) &&
      booking.slot &&
      reminderWindow(booking.slot)
    ));
    if (dueBooking) {
      showOnce(bookingAlertFromSlot({...dueBooking.slot, booking: dueBooking}, 'customer-reminder'));
    }
  }, [showOnce]);

  const checkStaffSlots = useCallback(async () => {
    if (!user?.employeeId) {
      return;
    }
    const {data} = await slotApi.list({employee: user.employeeId, date: todayIso()});
    const bookedSlots = (data.slots || []).filter((slot) => slot.booking && ['booked', 'occupied'].includes(slot.status));
    const currentIds = new Set(bookedSlots.map((slot) => String(slot.booking?._id || slot._id)));

    if (staffKnownBookings.current) {
      const newOnlineSlot = bookedSlots.find((slot) => (
        slot.booking?.source !== 'offline' &&
        !staffKnownBookings.current.has(String(slot.booking?._id || slot._id))
      ));
      if (newOnlineSlot) {
        showOnce(bookingAlertFromSlot(newOnlineSlot, 'staff-new'));
      }
    }
    staffKnownBookings.current = currentIds;

    const reminderSlot = bookedSlots.find((slot) => reminderWindow(slot));
    if (reminderSlot) {
      showOnce(bookingAlertFromSlot(reminderSlot, 'staff-reminder'));
    }
  }, [showOnce, user?.employeeId]);

  useEffect(() => {
    staffKnownBookings.current = null;
    shownAlerts.current = new Set();
    setAlert(null);
  }, [user?._id, user?.role]);

  useEffect(() => {
    if (!user || !['customer', 'employee'].includes(user.role)) {
      return undefined;
    }

    let cancelled = false;
    const tick = async () => {
      try {
        if (cancelled) {
          return;
        }
        if (user.role === 'customer') {
          await checkCustomerBookings();
        }
        if (user.role === 'employee') {
          await checkStaffSlots();
        }
      } catch (_err) {
        // Notification checks should not interrupt the main app flow.
      }
    };

    tick();
    const timer = setInterval(tick, user.role === 'employee' ? 10000 : 30000);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [checkCustomerBookings, checkStaffSlots, user]);

  return (
    <Portal>
      <Dialog visible={Boolean(alert)} onDismiss={() => setAlert(null)} style={notifyStyles.dialog}>
        <Dialog.Title style={notifyStyles.title}>{alert?.title}</Dialog.Title>
        <Dialog.Content>
          <Text style={notifyStyles.message}>{alert?.message}</Text>
        </Dialog.Content>
        <Dialog.Actions>
          {alert?.phone ? (
            <Button textColor={colors.ink} onPress={() => Linking.openURL(`tel:${alert.phone}`)}>
              Call
            </Button>
          ) : null}
          <Button mode="contained" buttonColor={colors.ink} textColor={colors.softGold} onPress={() => setAlert(null)}>
            OK
          </Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
}

const notifyStyles = StyleSheet.create({
  dialog: {
    backgroundColor: colors.gold,
  },
  title: {
    color: colors.ink,
    fontWeight: '900',
  },
  message: {
    color: colors.ink,
    fontWeight: '800',
    lineHeight: 22,
  },
});
