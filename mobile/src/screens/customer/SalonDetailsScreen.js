import React, {useEffect, useState} from 'react';
import {StyleSheet, View} from 'react-native';
import {Button, Text} from 'react-native-paper';
import AppScreen from '../../components/AppScreen';
import EmptyState from '../../components/EmptyState';
import {employeeApi} from '../../api/endpoints';
import {useBookingStore} from '../../store/bookingStore';
import {styles} from '../../theme/styles';
import {colors} from '../../theme/theme';

export default function SalonDetailsScreen({navigation}) {
  const salon = useBookingStore((state) => state.salon);
  const setEmployee = useBookingStore((state) => state.setEmployee);
  const [employees, setEmployees] = useState([]);

  useEffect(() => {
    if (!salon?._id) return;
    employeeApi.list({salon: salon._id}).then(({data}) => setEmployees(data.employees || []));
  }, [salon]);

  return (
    <AppScreen>
      <Button
        mode="contained-tonal"
        buttonColor={colors.successSoft}
        textColor={colors.ink}
        onPress={() => navigation.navigate('SalonSearch')}
        style={detailStyles.backButton}>
        Back to salons
      </Button>
      <View style={detailStyles.salonCard}>
        <Text variant="headlineSmall" style={detailStyles.salonName}>{salon?.name}</Text>
        <Text style={detailStyles.address}>{salon?.address}</Text>
        <View style={detailStyles.metaRow}>
          <Text style={detailStyles.meta}>{salon?.city}</Text>
          <Text style={detailStyles.meta}>{salon?.openingTime} to {salon?.closingTime}</Text>
          <Text style={detailStyles.meta}>{salon?.totalChairs || 0} chairs</Text>
        </View>
      </View>

      <Text variant="titleMedium" style={styles.title}>Select your expert</Text>
      <Text style={styles.subtitle}>Pick a staff member and view today's slots.</Text>
      {!employees.length ? <EmptyState title="No employees available" /> : employees.map((employee) => (
        <View key={employee._id} style={detailStyles.employeeCard}>
          <View style={detailStyles.avatar}>
            <Text style={detailStyles.avatarText}>{(employee.user?.name || 'E').slice(0, 1)}</Text>
          </View>
          <View style={detailStyles.employeeInfo}>
            <Text variant="titleMedium" style={detailStyles.employeeName}>{employee.user?.name || 'Expert'}</Text>
            <Text style={detailStyles.employeeTitle}>{employee.title || 'Stylist'}</Text>
            <Text style={detailStyles.specialties}>{(employee.specialties || []).join(', ') || 'Premium salon service'}</Text>
          </View>
          <Button
            mode="contained-tonal"
            compact
            onPress={() => {
              setEmployee(employee);
              navigation.navigate('AvailableSlots');
            }}>
            View slots
          </Button>
        </View>
      ))}
    </AppScreen>
  );
}

const detailStyles = StyleSheet.create({
  salonCard: {
    marginBottom: 18,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.line,
    padding: 16,
    backgroundColor: colors.panel,
  },
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  salonName: {
    color: colors.text,
    fontWeight: '900',
  },
  address: {
    marginTop: 6,
    color: colors.muted,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  meta: {
    borderRadius: 8,
    overflow: 'hidden',
    paddingHorizontal: 10,
    paddingVertical: 5,
    color: colors.successSoft,
    backgroundColor: colors.charcoal,
  },
  employeeCard: {
    minHeight: 96,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.line,
    padding: 12,
    backgroundColor: colors.panel,
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.successSoft,
  },
  avatarText: {
    color: colors.ink,
    fontSize: 18,
    fontWeight: '900',
  },
  employeeInfo: {
    flex: 1,
  },
  employeeName: {
    color: colors.text,
    fontWeight: '900',
  },
  employeeTitle: {
    color: colors.success,
    fontWeight: '700',
  },
  specialties: {
    marginTop: 3,
    color: colors.muted,
  },
});
