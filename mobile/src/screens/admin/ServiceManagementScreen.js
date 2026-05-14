import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {StyleSheet, View} from 'react-native';
import {Button, Text, TextInput} from 'react-native-paper';
import AppScreen from '../../components/AppScreen';
import EmptyState from '../../components/EmptyState';
import {salonApi, serviceApi} from '../../api/endpoints';
import {styles} from '../../theme/styles';
import {colors} from '../../theme/theme';

const emptyForm = {name: '', price: '', durationMinutes: '30', description: ''};

export default function ServiceManagementScreen() {
  const [salons, setSalons] = useState([]);
  const [services, setServices] = useState([]);
  const [selectedSalon, setSelectedSalon] = useState('');
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');

  const selectedSalonData = useMemo(
    () => salons.find((salon) => String(salon._id) === String(selectedSalon)),
    [salons, selectedSalon],
  );

  const selectedServices = useMemo(
    () => services.filter((service) => String(service.salon) === String(selectedSalon)),
    [services, selectedSalon],
  );

  const load = useCallback(async () => {
    setBusy(true);
    try {
      const [salonsRes, servicesRes] = await Promise.all([
        salonApi.list(),
        serviceApi.list(),
      ]);
      const loadedSalons = salonsRes.data.salons || [];
      setSalons(loadedSalons);
      setServices(servicesRes.data.services || []);
      if (!selectedSalon && loadedSalons[0]) {
        setSelectedSalon(loadedSalons[0]._id);
      }
    } finally {
      setBusy(false);
    }
  }, [selectedSalon]);

  useEffect(() => {
    load();
  }, [load]);

  async function save() {
    setBusy(true);
    setMessage('');
    const payload = {
      salon: selectedSalon,
      name: form.name.trim(),
      price: Number(form.price || 0),
      durationMinutes: Number(form.durationMinutes || 30),
      description: form.description.trim(),
    };
    try {
      if (editingId) {
        await serviceApi.update(editingId, payload);
        setMessage('Service updated');
      } else {
        await serviceApi.create(payload);
        setMessage('Service added');
      }
      setEditingId('');
      setForm(emptyForm);
      await load();
    } catch (err) {
      setMessage(err.response?.data?.message || err.message || 'Service save failed');
    } finally {
      setBusy(false);
    }
  }

  function edit(service) {
    setEditingId(service._id);
    setForm({
      name: service.name || '',
      price: String(service.price || ''),
      durationMinutes: String(service.durationMinutes || 30),
      description: service.description || '',
    });
  }

  async function remove(serviceId) {
    setBusy(true);
    setMessage('');
    try {
      await serviceApi.remove(serviceId);
      if (editingId === serviceId) {
        setEditingId('');
        setForm(emptyForm);
      }
      setMessage('Service deleted');
      await load();
    } catch (err) {
      setMessage(err.response?.data?.message || err.message || 'Service delete failed');
    } finally {
      setBusy(false);
    }
  }

  function resetForm() {
    setEditingId('');
    setForm(emptyForm);
  }

  return (
    <AppScreen refreshing={busy} onRefresh={load}>
      <Text variant="headlineSmall" style={styles.title}>Service management</Text>
      <Text style={styles.subtitle}>Add, edit and delete branch-wise service names and price amounts.</Text>

      <Text variant="titleMedium" style={serviceAdminStyles.sectionTitle}>Salon branches</Text>
      <View style={serviceAdminStyles.grid}>
        {salons.map((salon) => (
          <Button
            key={salon._id}
            mode={selectedSalon === salon._id ? 'contained' : 'outlined'}
            buttonColor={selectedSalon === salon._id ? colors.gold : undefined}
            textColor={selectedSalon === salon._id ? colors.ink : colors.text}
            style={serviceAdminStyles.selector}
            onPress={() => {
              setSelectedSalon(salon._id);
              resetForm();
            }}>
            {salon.name}
          </Button>
        ))}
      </View>

      <View style={serviceAdminStyles.formCard}>
        <Text style={serviceAdminStyles.formTitle}>{editingId ? 'Edit service' : 'Create service'}</Text>
        <Text style={serviceAdminStyles.selectedSalon}>
          {selectedSalonData ? `${selectedSalonData.name} | ${selectedSalonData.city}` : 'Select salon branch first'}
        </Text>
        <TextInput label="Service name" value={form.name} onChangeText={(value) => setForm({...form, name: value})} style={styles.input} />
        <TextInput label="Price amount" keyboardType="numeric" value={form.price} onChangeText={(value) => setForm({...form, price: value})} style={styles.input} />
        <TextInput label="Duration minutes" keyboardType="numeric" value={form.durationMinutes} onChangeText={(value) => setForm({...form, durationMinutes: value})} style={styles.input} />
        <TextInput label="Short description" value={form.description} onChangeText={(value) => setForm({...form, description: value})} style={styles.input} />
        {message ? <Text style={serviceAdminStyles.message}>{message}</Text> : null}
        <Button mode="contained" disabled={!selectedSalon || !form.name || !form.price || busy} loading={busy} onPress={save}>
          {editingId ? 'Update service' : 'Add service'}
        </Button>
        {editingId ? <Button mode="text" onPress={resetForm}>Cancel edit</Button> : null}
      </View>

      <Text variant="titleMedium" style={serviceAdminStyles.sectionTitle}>Saved services</Text>
      {!selectedServices.length ? <EmptyState title="No services in this branch" /> : selectedServices.map((service) => (
        <View key={service._id} style={serviceAdminStyles.serviceCard}>
          <View style={serviceAdminStyles.serviceHeader}>
            <View style={serviceAdminStyles.serviceCopy}>
              <Text style={serviceAdminStyles.serviceName}>{service.name}</Text>
              <Text style={serviceAdminStyles.serviceMeta}>
                Rs {service.price || 0} | {service.durationMinutes || 30} min
              </Text>
            </View>
            <Text style={serviceAdminStyles.amountBadge}>Rs {service.price || 0}</Text>
          </View>
          {service.description ? <Text style={serviceAdminStyles.description}>{service.description}</Text> : null}
          <View style={serviceAdminStyles.actions}>
            <Button mode="contained-tonal" onPress={() => edit(service)}>Edit</Button>
            <Button mode="text" textColor={colors.danger} onPress={() => remove(service._id)}>Delete</Button>
          </View>
        </View>
      ))}
    </AppScreen>
  );
}

const serviceAdminStyles = StyleSheet.create({
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
  formCard: {
    marginTop: 12,
    marginBottom: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.line,
    padding: 14,
    backgroundColor: colors.panel,
  },
  formTitle: {
    color: colors.softGold,
    fontSize: 16,
    fontWeight: '900',
  },
  selectedSalon: {
    marginTop: 6,
    marginBottom: 12,
    color: colors.successSoft,
    fontWeight: '800',
  },
  message: {
    marginBottom: 12,
    color: colors.successSoft,
  },
  serviceCard: {
    marginBottom: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.gold,
    padding: 14,
    backgroundColor: colors.charcoal,
  },
  serviceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  serviceCopy: {
    flex: 1,
  },
  serviceName: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '900',
  },
  serviceMeta: {
    marginTop: 4,
    color: colors.muted,
  },
  amountBadge: {
    alignSelf: 'flex-start',
    borderRadius: 8,
    overflow: 'hidden',
    paddingHorizontal: 10,
    paddingVertical: 5,
    color: colors.ink,
    backgroundColor: colors.gold,
    fontWeight: '900',
  },
  description: {
    marginTop: 10,
    color: colors.text,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
});
