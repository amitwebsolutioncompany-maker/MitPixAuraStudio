import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {Button, Card, Checkbox, Chip, Text, TextInput} from 'react-native-paper';
import AppScreen from '../../components/AppScreen';
import EmptyState from '../../components/EmptyState';
import ResourceCard from '../../components/ResourceCard';
import {employeeApi, salonApi} from '../../api/endpoints';
import {styles} from '../../theme/styles';

const emptyForm = {name: '', email: '', phone: '', password: '', title: 'Stylist', specialties: '', isManager: false};

export default function EmployeeCrudScreen() {
  const [employees, setEmployees] = useState([]);
  const [salons, setSalons] = useState([]);
  const [selectedSalon, setSelectedSalon] = useState('');
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  const selectedSalonName = useMemo(
    () => salons.find((salon) => salon._id === selectedSalon)?.name,
    [salons, selectedSalon]
  );

  const load = useCallback(async () => {
    const [employeesRes, salonsRes] = await Promise.all([employeeApi.list(), salonApi.list()]);
    setEmployees(employeesRes.data.employees || []);
    setSalons(salonsRes.data.salons || []);
    if (!selectedSalon && salonsRes.data.salons?.[0]) setSelectedSalon(salonsRes.data.salons[0]._id);
  }, [selectedSalon]);

  useEffect(() => {
    load();
  }, [load]);

  async function save() {
    setBusy(true);
    setMessage('');
    try {
      const payload = {
        ...form,
        salon: selectedSalon,
        specialties: form.specialties ? form.specialties.split(',').map((item) => item.trim()).filter(Boolean) : []
      };
      if (editingId) {
        if (!payload.password) delete payload.password;
        await employeeApi.update(editingId, payload);
      } else {
        await employeeApi.create(payload);
      }
      setForm(emptyForm);
      setEditingId('');
      setMessage(editingId ? 'Employee updated' : `Employee added to ${selectedSalonName}`);
      await load();
    } catch (err) {
      setMessage(err.response?.data?.message || err.message || 'Employee create failed');
    } finally {
      setBusy(false);
    }
  }

  function edit(employee) {
    setEditingId(employee._id);
    setSelectedSalon(employee.salon?._id || employee.salon || selectedSalon);
    setForm({
      name: employee.user?.name || '',
      email: employee.user?.email || '',
      phone: employee.user?.phone || '',
      password: '',
      title: employee.title || 'Stylist',
      specialties: (employee.specialties || []).join(', '),
      isManager: Boolean(employee.isManager),
    });
  }

  async function remove(employee) {
    setBusy(true);
    setMessage('');
    try {
      await employeeApi.remove(employee._id);
      if (editingId === employee._id) {
        setEditingId('');
        setForm(emptyForm);
      }
      setMessage('Employee deleted');
      await load();
    } catch (err) {
      setMessage(err.response?.data?.message || err.message || 'Employee delete failed');
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
      <TextInput label="Phone" keyboardType="phone-pad" value={form.phone} onChangeText={(value) => setForm({...form, phone: value})} style={styles.input} />
      <TextInput label={editingId ? 'New password optional' : 'Password'} secureTextEntry value={form.password} onChangeText={(value) => setForm({...form, password: value})} style={styles.input} />
      <TextInput label="Title" value={form.title} onChangeText={(value) => setForm({...form, title: value})} style={styles.input} />
      <TextInput label="Specialties comma separated" value={form.specialties} onChangeText={(value) => setForm({...form, specialties: value})} style={styles.input} />
      <Checkbox.Item
        label="Make this staff the salon manager"
        status={form.isManager ? 'checked' : 'unchecked'}
        onPress={() => setForm({...form, isManager: !form.isManager})}
        style={styles.card}
      />

      {message ? <Text style={{marginBottom: 12}}>{message}</Text> : null}
      <Button mode="contained" loading={busy} disabled={!selectedSalon || !form.name || !form.email || (!editingId && !form.password) || busy} onPress={save}>
        {editingId ? 'Update employee' : 'Add employee'}
      </Button>
      {editingId ? <Button mode="text" onPress={() => { setEditingId(''); setForm(emptyForm); }}>Cancel edit</Button> : null}

      <Text variant="titleMedium" style={{marginTop: 24, marginBottom: 8}}>Salon teams</Text>
      {!employees.length ? <EmptyState title="No employees yet" message="Add employees after selecting a salon." /> : null}
      {grouped.map(({salon, employees: salonEmployees}) => (
        <ResourceCard
          key={salon._id}
          title={`${salon.name} (${salonEmployees.length})`}
          subtitle={salonEmployees.map((employee) => `${employee.user?.name} - ${employee.isManager ? 'Manager' : employee.title || 'Stylist'} - ${employee.user?.phone || employee.user?.email || 'No contact'}`).join('\n') || 'No employees assigned'}
          meta={`Salon ID: ${salon._id}`}
        />
      ))}
      <Text variant="titleMedium" style={{marginTop: 12, marginBottom: 8}}>Edit staff</Text>
      {employees.map((employee) => (
        <Card key={`manage-${employee._id}`} style={styles.card} mode="elevated">
          <Card.Content>
            <Text variant="titleMedium">{employee.user?.name || 'Employee'}</Text>
            <Text style={{marginTop: 4}}>{employee.salon?.name || 'Salon'} | {employee.isManager ? 'Manager' : employee.title || 'Stylist'}</Text>
            <Text style={{marginTop: 6, color: '#B8A77D'}}>{employee.user?.phone || employee.user?.email}</Text>
          </Card.Content>
          <Card.Actions>
            <Button onPress={() => edit(employee)}>Edit</Button>
            <Button textColor="#F28B82" onPress={() => remove(employee)}>Delete</Button>
          </Card.Actions>
        </Card>
      ))}
    </AppScreen>
  );
}
