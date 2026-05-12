import React, {useEffect, useState} from 'react';
import AppScreen from '../../components/AppScreen';
import EmptyState from '../../components/EmptyState';
import ResourceCard from '../../components/ResourceCard';
import {employeeApi} from '../../api/endpoints';
import {useBookingStore} from '../../store/bookingStore';

export default function EmployeeListScreen({navigation}) {
  const salon = useBookingStore((state) => state.salon);
  const setEmployee = useBookingStore((state) => state.setEmployee);
  const [employees, setEmployees] = useState([]);

  useEffect(() => {
    employeeApi.list({salon: salon?._id}).then(({data}) => setEmployees(data.employees));
  }, [salon]);

  return (
    <AppScreen>
      {!employees.length ? <EmptyState title="No employees available" /> : employees.map((employee) => (
        <ResourceCard
          key={employee._id}
          title={employee.user?.name || 'Expert'}
          subtitle={employee.title}
          meta={(employee.specialties || []).join(', ')}
          actionLabel="View slots"
          onPress={() => { setEmployee(employee); navigation.navigate('AvailableSlots'); }}
        />
      ))}
    </AppScreen>
  );
}
