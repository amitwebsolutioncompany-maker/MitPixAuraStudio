import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {StyleSheet, View} from 'react-native';
import {Button, Checkbox, Text, TextInput} from 'react-native-paper';
import AppScreen from '../../components/AppScreen';
import EmptyState from '../../components/EmptyState';
import {employeeApi, salonApi} from '../../api/endpoints';
import {styles} from '../../theme/styles';
import {colors} from '../../theme/theme';

const emptyForm = {name: '', email: '', phone: '', password: '', title: 'Stylist', specialties: '', isManager: false};

export default function EmployeeCrudScreen() {
  const [employees, setEmployees] = useState([]);
  const [salons, setSalons] = useState([]);
  const [selectedSalon, setSelectedSalon] = useState('');
  const [salonSearch, setSalonSearch] = useState('');
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  const selectedSalonData = useMemo(
    () => salons.find((salon) => salon._id === selectedSalon),
    [salons, selectedSalon],
  );

  const filteredSalons = useMemo(() => {
    const query = salonSearch.trim().toLowerCase();
    if (!query) {
      return salons;
    }
    return salons.filter((salon) => `${salon.name} ${salon.address} ${salon.city}`.toLowerCase().includes(query));
  }, [salonSearch, salons]);

  const selectedEmployees = useMemo(
    () => employees.filter((employee) => String(employee.salon?._id || employee.salon) === String(selectedSalon)),
    [employees, selectedSalon],
  );

  const load = useCallback(async () => {
    const [employeesRes, salonsRes] = await Promise.all([
      employeeApi.list(),
      salonApi.list(),
    ]);
    const loadedSalons = salonsRes.data.salons || [];
    setEmployees(employeesRes.data.employees || []);
    setSalons(loadedSalons);
    if (!selectedSalon && loadedSalons[0]) {
      setSelectedSalon(loadedSalons[0]._id);
    }
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
        specialties: form.specialties ? form.specialties.split(',').map((item) => item.trim()).filter(Boolean) : [],
      };
      if (editingId) {
        if (!payload.password) {
          delete payload.password;
        }
        await employeeApi.update(editingId, payload);
      } else {
        await employeeApi.create(payload);
      }
      setForm(emptyForm);
      setEditingId('');
      setMessage(editingId ? 'Staff updated' : `Staff added to ${selectedSalonData?.name || 'salon'}`);
      await load();
    } catch (err) {
      setMessage(err.response?.data?.message || err.message || 'Staff save failed');
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
      setMessage('Staff deleted');
      await load();
    } catch (err) {
      setMessage(err.response?.data?.message || err.message || 'Staff delete failed');
    } finally {
      setBusy(false);
    }
  }

  function selectSalon(salon) {
    setSelectedSalon(salon._id);
    setSalonSearch(`${salon.name} ${salon.city}`);
    setEditingId('');
    setForm(emptyForm);
  }

  return (
    <AppScreen onRefresh={load} refreshing={busy}>
      <Text variant="titleLarge" style={styles.title}>Staff</Text>
      <View style={staffStyles.panel}>
        <Text style={staffStyles.panelTitle}>Select salon branch</Text>
        <TextInput
          label="Search salon by name, address or city"
          value={salonSearch}
          onChangeText={setSalonSearch}
          style={styles.input}
        />
        <View style={staffStyles.dropdown}>
          {filteredSalons.map((salon) => (
            <Button
              key={salon._id}
              mode={selectedSalon === salon._id ? 'contained' : 'outlined'}
              buttonColor={selectedSalon === salon._id ? colors.gold : undefined}
              textColor={selectedSalon === salon._id ? colors.ink : colors.text}
              style={staffStyles.salonOption}
              onPress={() => selectSalon(salon)}>
              {salon.name} | {salon.address}
            </Button>
          ))}
        </View>
      </View>

      <View style={staffStyles.panel}>
        <Text style={staffStyles.panelTitle}>{editingId ? 'Edit staff' : 'Create staff'}</Text>
        <Text style={staffStyles.selected}>{selectedSalonData ? `${selectedSalonData.name} | ${selectedSalonData.address}` : 'Create/select a salon first'}</Text>
        <TextInput label="Staff name" value={form.name} onChangeText={(value) => setForm({...form, name: value})} style={styles.input} />
        <TextInput label="Email" autoCapitalize="none" value={form.email} onChangeText={(value) => setForm({...form, email: value})} style={styles.input} />
        <TextInput label="Phone" keyboardType="phone-pad" value={form.phone} onChangeText={(value) => setForm({...form, phone: value})} style={styles.input} />
        <TextInput label={editingId ? 'New password optional' : 'Password'} secureTextEntry value={form.password} onChangeText={(value) => setForm({...form, password: value})} style={styles.input} />
        <TextInput label="Title" value={form.title} onChangeText={(value) => setForm({...form, title: value})} style={styles.input} />
        <TextInput label="Specialties comma separated" value={form.specialties} onChangeText={(value) => setForm({...form, specialties: value})} style={styles.input} />
        <Checkbox.Item
          label="Make this staff the salon manager"
          labelStyle={staffStyles.checkboxLabel}
          status={form.isManager ? 'checked' : 'unchecked'}
          onPress={() => setForm({...form, isManager: !form.isManager})}
          style={staffStyles.checkbox}
        />
        {message ? <Text style={staffStyles.message}>{message}</Text> : null}
        <Button mode="contained" loading={busy} disabled={!selectedSalon || !form.name || !form.email || (!editingId && !form.password) || busy} onPress={save}>
          {editingId ? 'Update staff' : 'Add staff'}
        </Button>
        {editingId ? <Button mode="text" onPress={() => { setEditingId(''); setForm(emptyForm); }}>Cancel edit</Button> : null}
      </View>

      <Text variant="titleMedium" style={staffStyles.listTitle}>Selected branch staff</Text>
      {!selectedEmployees.length ? <EmptyState title="No staff in this branch" message="Select a salon and add staff for it." /> : selectedEmployees.map((employee) => (
        <View key={employee._id} style={staffStyles.card}>
          <Text style={staffStyles.name}>{employee.user?.name || 'Staff'}</Text>
          <Text style={staffStyles.copy}>{employee.isManager ? 'Manager' : employee.title || 'Stylist'} | {employee.user?.phone || employee.user?.email || 'No contact'}</Text>
          <Text style={staffStyles.copy}>{(employee.specialties || []).join(', ') || 'No specialties saved'}</Text>
          <View style={staffStyles.actions}>
            <Button mode="contained-tonal" onPress={() => edit(employee)}>Edit</Button>
            <Button mode="text" textColor={colors.danger} onPress={() => remove(employee)}>Delete</Button>
          </View>
        </View>
      ))}
    </AppScreen>
  );
}

const staffStyles = StyleSheet.create({
  panel: {
    marginBottom: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.line,
    padding: 14,
    backgroundColor: colors.panel,
  },
  panelTitle: {
    marginBottom: 10,
    color: colors.softGold,
    fontSize: 16,
    fontWeight: '900',
  },
  dropdown: {
    gap: 8,
    maxHeight: 260,
  },
  salonOption: {
    borderRadius: 8,
  },
  selected: {
    marginBottom: 12,
    color: colors.successSoft,
    fontWeight: '800',
  },
  checkbox: {
    marginBottom: 10,
    borderRadius: 8,
    backgroundColor: colors.charcoal,
  },
  checkboxLabel: {
    color: colors.text,
  },
  message: {
    marginBottom: 12,
    color: colors.successSoft,
  },
  listTitle: {
    marginTop: 8,
    marginBottom: 10,
    color: colors.text,
    fontWeight: '900',
  },
  card: {
    marginBottom: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.gold,
    padding: 14,
    backgroundColor: colors.charcoal,
  },
  name: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '900',
  },
  copy: {
    marginTop: 6,
    color: colors.muted,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
});
