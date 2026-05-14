import React, {useEffect, useMemo, useState} from 'react';
import {Linking, StyleSheet, View} from 'react-native';
import {Button, Text, TextInput} from 'react-native-paper';
import AppScreen from '../../components/AppScreen';
import EmptyState from '../../components/EmptyState';
import ScreenHero from '../../components/ScreenHero';
import {employeeApi, salonApi} from '../../api/endpoints';
import {styles} from '../../theme/styles';
import {colors} from '../../theme/theme';
import {heroImages} from '../../theme/visuals';

export default function FunctionBookingScreen() {
  const [salons, setSalons] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [selectedSalon, setSelectedSalon] = useState(null);
  const [search, setSearch] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    salonApi.list().then(({data}) => setSalons(data.salons || []));
  }, []);

  async function chooseSalon(salon) {
    setBusy(true);
    setSelectedSalon(salon);
    try {
      const {data} = await employeeApi.list({salon: salon._id});
      setEmployees(data.employees || []);
    } finally {
      setBusy(false);
    }
  }

  const manager = useMemo(() => employees.find((employee) => employee.isManager), [employees]);
  const managerPhone = manager?.user?.phone;
  const filteredSalons = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return salons;
    return salons.filter((salon) => `${salon.name} ${salon.city} ${salon.address}`.toLowerCase().includes(query));
  }, [salons, search]);

  return (
    <AppScreen refreshing={busy}>
      <ScreenHero
        image={heroImages.function}
        icon="function"
        title="Function booking help"
        subtitle="Choose your preferred salon and connect with the manager for event grooming."
      />

      <Text variant="titleMedium" style={styles.title}>Choose salon</Text>
      <Text style={styles.subtitle}>For bridal, party and event packages, the salon manager will guide timing, team size and pricing.</Text>
      <TextInput
        label="Search salon by name, city, address or letter"
        value={search}
        onChangeText={setSearch}
        mode="outlined"
        style={styles.input}
      />

      {!filteredSalons.length ? <EmptyState title="No salons found" message="Try another city, branch name or address." /> : filteredSalons.map((salon) => (
        <View key={salon._id} style={[functionStyles.card, selectedSalon?._id === salon._id && functionStyles.selectedCard]}>
          <Text variant="titleMedium" style={functionStyles.name}>{salon.name}</Text>
          <Text style={functionStyles.copy}>{salon.address}</Text>
          <Text style={functionStyles.meta}>{salon.city} | {salon.openingTime}-{salon.closingTime}</Text>
          <Button
            mode="contained"
            buttonColor={colors.success}
            textColor={colors.ink}
            onPress={() => chooseSalon(salon)}>
            Select salon
          </Button>
        </View>
      ))}

      {selectedSalon ? (
        <View style={functionStyles.managerCard}>
          <Text variant="titleMedium" style={functionStyles.name}>Manager contact</Text>
          {manager ? (
            <>
              <Text style={functionStyles.copy}>{manager.user?.name || 'Salon manager'}</Text>
              <Text style={functionStyles.phone}>{managerPhone || 'Number not added'}</Text>
              <Text style={functionStyles.copy}>Share your function date, location and guest count with the manager for the fastest package support.</Text>
              <Button
                mode="contained-tonal"
                disabled={!managerPhone}
                onPress={() => Linking.openURL(`tel:${managerPhone}`)}>
                Call manager
              </Button>
            </>
          ) : (
            <EmptyState title="Manager not assigned" message="Admin can mark one staff as manager for this salon." />
          )}
        </View>
      ) : null}
    </AppScreen>
  );
}

const functionStyles = StyleSheet.create({
  card: {
    marginBottom: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.line,
    padding: 14,
    backgroundColor: colors.panel,
  },
  selectedCard: {
    borderColor: colors.success,
  },
  managerCard: {
    marginTop: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.success,
    padding: 16,
    backgroundColor: '#173A2A',
  },
  name: {
    color: colors.text,
    fontWeight: '900',
  },
  copy: {
    marginTop: 6,
    color: colors.muted,
  },
  meta: {
    marginTop: 8,
    marginBottom: 12,
    color: colors.successSoft,
    fontWeight: '800',
  },
  phone: {
    marginTop: 8,
    marginBottom: 10,
    color: colors.successSoft,
    fontSize: 18,
    fontWeight: '900',
  },
});
