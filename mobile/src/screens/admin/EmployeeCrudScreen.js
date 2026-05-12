import React, {useEffect, useMemo, useState} from 'react';
import {Button, Chip, Text, TextInput} from 'react-native-paper';
import AppScreen from '../../components/AppScreen';
import EmptyState from '../../components/EmptyState';
import ResourceCard from '../../components/ResourceCard';
import {employeeApi, salonApi} from '../../api/endpoints';
import {styles} from '../../theme/styles';

const emptyForm = {name: '', email: '', password: '', title: 'Stylist', specialties: ''};

export default function EmployeeCrudScreen() {
  const [employees, setEmployees] = useState([]);
  const [salons, setSalons] = useState([]);
  const [selectedSalon, setSelectedSalon] = useState('');
  const [form, setForm] = useState(emptyForm);
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  const selectedSalonName = useMemo(
    () => salons.find((salon) => salon._id === selectedSalon)?.name,
    [salons, selectedSalon]
  );

  async function load() {
    const [employeesRes, salonsRes] = await Promise.all([employeeApi.list(), salonApi.list()]);
    setEmployees(employeesRes.data.employees || []);
    setSalons(salonsRes.data.salons || []);
    if (!selectedSalon && salonsRes.data.salons?.[0]) setSelectedSalon(salonsRes.data.salons[0]._id);
  }

  useEffect(() => {
    load();
  }, []);

  async function save() {
    setBusy(true);
    setMessage('');
    try {
      await employeeApi.create({
        ...form,
        salon: selectedSalon,
        specialties: form.specialties ? form.specialties.split(',').map((item) => item.trim()).filter(Boolean) : []
      });
      setForm(emptyForm);
      setMessage(`Employee added to ${selectedSalonName}`);
      await load();
    } catch (err) {
      setMessage(err.response?.data?.message || err.message || 'Employee create failed');
    } finally {
      setBusy(false);
    }
  }

  const grouped = salons.map((salon) => ({
    salon,
    employees: employees.filter((employee) => employee.salon?._id === salon._id || employee.salon === salon._id)
  }));

  return (
    <AppScreen onRefresh={load} refreshing={busy}>
      <Text variant="titleLarge" style={styles.title}>Employees</Text>
      <Text style={styles.subtitle}>Select salon first, then create employee for that salon.</Text>

      <Text variant="titleMedium">Salon</Text>
      <Text style={styles.subtitle}>{selectedSalonName ? `Selected: ${selectedSalonName}` : 'Create a salon first.'}</Text>
      <React.Fragment>
        {salons.map((salon) => (
          <Chip
            key={salon._id}
            selected={selectedSalon === salon._id}
            onPress={() => setSelectedSalon(salon._id)}
            style={{marginBottom: 8}}>
            {salon.name} | {salon.city}
          </Chip>
        ))}
      </React.Fragment>

      <TextInput label="Employee name" value={form.name} onChangeText={(value) => setForm({...form, name: value})} style={styles.input} />
      <TextInput label="Email" autoCapitalize="none" value={form.email} onChangeText={(value) => setForm({...form, email: value})} style={styles.input} />
      <TextInput label="Password" secureTextEntry value={form.password} onChangeText={(value) => setForm({...form, password: value})} style={styles.input} />
      <TextInput label="Title" value={form.title} onChangeText={(value) => setForm({...form, title: value})} style={styles.input} />
      <TextInput label="Specialties comma separated" value={form.specialties} onChangeText={(value) => setForm({...form, specialties: value})} style={styles.input} />

      {message ? <Text style={{marginBottom: 12}}>{message}</Text> : null}
      <Button mode="contained" loading={busy} disabled={!selectedSalon || !form.name || !form.email || !form.password || busy} onPress={save}>
        Add employee
      </Button>

      <Text variant="titleMedium" style={{marginTop: 24, marginBottom: 8}}>Salon teams</Text>
      {!employees.length ? <EmptyState title="No employees yet" message="Add employees after selecting a salon." /> : null}
      {grouped.map(({salon, employees: salonEmployees}) => (
        <ResourceCard
          key={salon._id}
          title={`${salon.name} (${salonEmployees.length})`}
          subtitle={salonEmployees.map((employee) => `${employee.user?.name} - ${employee.title || 'Stylist'}`).join('\n') || 'No employees assigned'}
          meta={`Salon ID: ${salon._id}`}
        />
      ))}
    </AppScreen>
  );
}
