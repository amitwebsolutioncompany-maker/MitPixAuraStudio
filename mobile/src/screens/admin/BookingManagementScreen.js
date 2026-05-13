import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {StyleSheet, View} from 'react-native';
import {Button, Text} from 'react-native-paper';
import AppScreen from '../../components/AppScreen';
import EmptyState from '../../components/EmptyState';
import {employeeApi, salonApi, slotApi} from '../../api/endpoints';
import {styles} from '../../theme/styles';
import {colors} from '../../theme/theme';
import {todayIso} from '../../utils/date';
import {isPastSlot, slotDetailLines, slotStatusLabel} from '../../utils/slotDetails';

export default function BookingManagementScreen() {
  const [salons, setSalons] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [slots, setSlots] = useState([]);
  const [selectedSalon, setSelectedSalon] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const salonStaff = useMemo(
    () => employees.filter((employee) => String(employee.salon?._id || employee.salon) === String(selectedSalon)),
    [employees, selectedSalon],
  );

  const load = useCallback(async () => {
    setRefreshing(true);
    try {
      const [salonsRes, employeesRes] = await Promise.all([
        salonApi.list(),
        employeeApi.list(),
      ]);
      const loadedSalons = salonsRes.data.salons || [];
      setSalons(loadedSalons);
      setEmployees(employeesRes.data.employees || []);
      if (!selectedSalon && loadedSalons[0]) {
        setSelectedSalon(loadedSalons[0]._id);
      }
    } finally {
      setRefreshing(false);
    }
  }, [selectedSalon]);

  const loadSlots = useCallback(async (employeeId) => {
    if (!employeeId) {
      setSlots([]);
      return;
    }
    setRefreshing(true);
    try {
      const {data} = await slotApi.list({employee: employeeId, date: todayIso()});
      setSlots(data.slots || []);
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    setSelectedEmployee('');
    setSlots([]);
  }, [selectedSalon]);

  function selectEmployee(employeeId) {
    setSelectedEmployee(employeeId);
    loadSlots(employeeId);
  }

  return (
    <AppScreen refreshing={refreshing} onRefresh={() => selectedEmployee ? loadSlots(selectedEmployee) : load()}>
      <Text variant="titleLarge" style={styles.title}>Books</Text>
      <Text variant="titleMedium" style={bookStyles.sectionTitle}>Salon branches</Text>
      <View style={bookStyles.grid}>
        {salons.map((salon) => (
          <Button
            key={salon._id}
            mode={selectedSalon === salon._id ? 'contained' : 'outlined'}
            buttonColor={selectedSalon === salon._id ? colors.gold : undefined}
            textColor={selectedSalon === salon._id ? colors.ink : colors.text}
            style={bookStyles.selector}
            onPress={() => setSelectedSalon(salon._id)}>
            {salon.name}
          </Button>
        ))}
      </View>

      <Text variant="titleMedium" style={bookStyles.sectionTitle}>Staff</Text>
      {!salonStaff.length ? <EmptyState title="No staff in this salon" /> : (
        <View style={bookStyles.grid}>
          {salonStaff.map((employee) => (
            <Button
              key={employee._id}
              mode={selectedEmployee === employee._id ? 'contained' : 'outlined'}
              buttonColor={selectedEmployee === employee._id ? colors.success : undefined}
              textColor={selectedEmployee === employee._id ? colors.ink : colors.text}
              style={bookStyles.selector}
              onPress={() => selectEmployee(employee._id)}>
              {employee.user?.name || 'Staff'}
            </Button>
          ))}
        </View>
      )}

      <Text variant="titleMedium" style={bookStyles.sectionTitle}>Today slot details</Text>
      {!selectedEmployee ? <EmptyState title="Select staff to view slots" /> : null}
      {selectedEmployee && !slots.length ? <EmptyState title="No slots generated today" /> : null}
      {slots.map((slot) => {
        const pastAvailable = slot.status === 'available' && isPastSlot(slot);
        const isBooked = ['booked', 'occupied'].includes(slot.status);
        const isCompleted = slot.status === 'completed';
        const isBreak = slot.status === 'break';
        const isWalkIn = slot.status === 'occupied';
        return (
          <View
            key={slot._id}
            style={[
              bookStyles.slotCard,
              pastAvailable && bookStyles.notBookedCard,
              isBooked && bookStyles.bookedCard,
              isWalkIn && bookStyles.walkInCard,
              isCompleted && bookStyles.completedCard,
              isBreak && bookStyles.breakCard,
            ]}>
            <View style={bookStyles.slotHeader}>
              <Text style={bookStyles.time}>{slot.startTime}-{slot.endTime}</Text>
              <Text style={bookStyles.status}>{slotStatusLabel(slot)}</Text>
            </View>
            {slotDetailLines(slot).map((line) => (
              <Text key={line} style={bookStyles.copy}>{line}</Text>
            ))}
          </View>
        );
      })}
    </AppScreen>
  );
}

const bookStyles = StyleSheet.create({
  sectionTitle: {
    marginTop: 12,
    marginBottom: 10,
    color: colors.text,
    fontWeight: '900',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  selector: {
    marginBottom: 4,
    borderRadius: 8,
  },
  slotCard: {
    marginBottom: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.line,
    padding: 12,
    backgroundColor: colors.panel,
  },
  bookedCard: {
    borderColor: colors.gold,
    backgroundColor: '#2D2307',
  },
  walkInCard: {
    borderColor: colors.success,
    backgroundColor: '#173A2A',
  },
  completedCard: {
    borderColor: colors.successSoft,
    backgroundColor: '#122D22',
  },
  notBookedCard: {
    borderColor: colors.muted,
    backgroundColor: colors.charcoal,
  },
  breakCard: {
    borderColor: colors.danger,
    backgroundColor: '#341817',
  },
  slotHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  time: {
    color: colors.text,
    fontWeight: '900',
  },
  status: {
    color: colors.successSoft,
    fontWeight: '900',
    textTransform: 'capitalize',
  },
  copy: {
    marginTop: 6,
    color: colors.muted,
  },
});
