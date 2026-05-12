import React, {useCallback, useEffect, useState} from 'react';
import {StyleSheet, View} from 'react-native';
import {Snackbar, Text} from 'react-native-paper';
import AppScreen from '../../components/AppScreen';
import EmptyState from '../../components/EmptyState';
import ScreenHero from '../../components/ScreenHero';
import {bookingApi} from '../../api/endpoints';
import {styles} from '../../theme/styles';
import {colors} from '../../theme/theme';
import {heroImages} from '../../theme/visuals';

const arrivalNotice = 'Please arrive 5-10 minutes before your appointment. Late arrival may make the booking invalid.';

export default function MyBookingsScreen({isHistory = false, route}) {
  const [bookings, setBookings] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [noticeVisible, setNoticeVisible] = useState(false);
  const [clock, setClock] = useState(Date.now());

  const load = useCallback(async () => {
    setRefreshing(true);
    try {
      const {data} = await bookingApi.mine({scope: isHistory ? 'history' : 'today'});
      setBookings(data.bookings);
    } finally {
      setRefreshing(false);
    }
  }, [isHistory]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (isHistory) return undefined;
    const timer = setInterval(() => setClock(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [isHistory]);

  useEffect(() => {
    if (!isHistory && route?.params?.arrivalNoticeAt) {
      setNoticeVisible(true);
    }
  }, [isHistory, route?.params?.arrivalNoticeAt]);

  const completedBookings = bookings.filter((booking) => booking.status === 'completed');
  const totalPaid = completedBookings.reduce((sum, booking) => sum + Number(booking.paymentAmount || 0), 0);
  const visibleBookings = isHistory ? completedBookings : bookings;
  const currentYear = new Date().getFullYear();

  function isExpired(booking) {
    if (isHistory || !booking.slot?.date || !booking.slot?.startTime) return false;
    const expiry = new Date(`${booking.slot.date}T${booking.slot.startTime}:10`).getTime();
    return clock > expiry;
  }

  return (
    <AppScreen refreshing={refreshing} onRefresh={load}>
      <ScreenHero
        image={isHistory ? heroImages.history : heroImages.booking}
        icon={isHistory ? 'history' : 'bookings'}
        title={isHistory ? 'Visit history' : 'My bookings'}
        subtitle={isHistory ? `Annual record from 1 January ${currentYear} to 30 December ${currentYear}.` : 'Today bookings only. Past days clear from this tab automatically.'}
      />
      <Text variant="titleMedium" style={styles.title}>{isHistory ? 'History' : 'Appointments'}</Text>
      {isHistory ? (
        <View style={bookingStyles.summaryRow}>
          <View style={bookingStyles.summaryCard}>
            <Text style={bookingStyles.summaryValue}>{completedBookings.length}</Text>
            <Text style={bookingStyles.summaryLabel}>Services</Text>
          </View>
          <View style={bookingStyles.summaryCard}>
            <Text style={bookingStyles.summaryValue}>Rs {totalPaid}</Text>
            <Text style={bookingStyles.summaryLabel}>Total paid</Text>
          </View>
        </View>
      ) : null}
      {!visibleBookings.length ? <EmptyState title={isHistory ? 'No completed visits yet' : 'No bookings yet'} /> : visibleBookings.map((booking) => (
        <View key={booking._id} style={[bookingStyles.card, isExpired(booking) && bookingStyles.expiredCard]}>
          <View style={bookingStyles.cardTop}>
            <View style={[bookingStyles.statusBadge, isExpired(booking) && bookingStyles.expiredBadge]}>
              <Text style={bookingStyles.statusText}>{isExpired(booking) ? 'Expired' : booking.status}</Text>
            </View>
            <Text style={bookingStyles.date}>{booking.slot?.date || 'Today'}</Text>
          </View>
          <Text variant="titleMedium" style={bookingStyles.salon}>{booking.salon?.name || 'Salon booking'}</Text>
          <Text style={bookingStyles.line}>{booking.employee?.user?.name || 'Expert'} | {booking.slot?.startTime || ''}-{booking.slot?.endTime || ''}</Text>
          <Text style={bookingStyles.line}>{booking.completedServiceName || booking.service?.name || 'Service will be updated by staff'}</Text>
          {!isHistory ? <Text style={bookingStyles.notice}>{arrivalNotice}</Text> : null}
          {booking.paymentAmount ? <Text style={bookingStyles.paid}>Paid Rs {booking.paymentAmount}</Text> : null}
        </View>
      ))}
      <Snackbar
        visible={noticeVisible}
        duration={5000}
        onDismiss={() => setNoticeVisible(false)}
        style={bookingStyles.snackbar}>
        {arrivalNotice}
      </Snackbar>
    </AppScreen>
  );
}

const bookingStyles = StyleSheet.create({
  summaryRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 14,
  },
  summaryCard: {
    flex: 1,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.line,
    padding: 14,
    backgroundColor: colors.panel,
  },
  summaryValue: {
    color: colors.successSoft,
    fontSize: 20,
    fontWeight: '900',
  },
  summaryLabel: {
    marginTop: 4,
    color: colors.muted,
    fontWeight: '700',
  },
  card: {
    marginBottom: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.line,
    padding: 14,
    backgroundColor: colors.panel,
  },
  expiredCard: {
    borderColor: colors.danger,
    backgroundColor: '#341817',
    opacity: 0.78,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  statusBadge: {
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: colors.successSoft,
  },
  expiredBadge: {
    backgroundColor: colors.danger,
  },
  statusText: {
    color: colors.ink,
    fontSize: 12,
    fontWeight: '900',
    textTransform: 'capitalize',
  },
  date: {
    color: colors.muted,
    fontWeight: '800',
  },
  salon: {
    color: colors.text,
    fontWeight: '900',
  },
  line: {
    marginTop: 5,
    color: colors.muted,
  },
  notice: {
    marginTop: 8,
    color: colors.successSoft,
    fontSize: 12,
    fontWeight: '800',
  },
  paid: {
    marginTop: 8,
    color: colors.successSoft,
    fontWeight: '900',
  },
  snackbar: {
    backgroundColor: '#2D2307',
  },
});
