import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {StyleSheet, View} from 'react-native';
import {Button, Text, TextInput} from 'react-native-paper';
import AppScreen from '../../components/AppScreen';
import EmptyState from '../../components/EmptyState';
import ScreenHero from '../../components/ScreenHero';
import {salonApi, serviceApi} from '../../api/endpoints';
import {styles} from '../../theme/styles';
import {colors} from '../../theme/theme';
import {heroImages} from '../../theme/visuals';

function shortName(name) {
  const words = String(name || '').trim().split(/\s+/).filter(Boolean);
  return words.slice(0, 3).join(' ') || 'Service';
}

export default function ServicesCatalogScreen() {
  const [salons, setSalons] = useState([]);
  const [services, setServices] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedSalon, setSelectedSalon] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    setRefreshing(true);
    try {
      const salonsRes = await salonApi.list();
      setSalons((salonsRes.data.salons || []).filter((salon) => salon.isActive !== false));
      if (selectedSalon) {
        const servicesRes = await serviceApi.list({salon: selectedSalon._id});
        setServices(servicesRes.data.services || []);
      }
    } finally {
      setRefreshing(false);
    }
  }, [selectedSalon]);

  useEffect(() => {
    load();
  }, [load]);

  const filteredSalons = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return salons;
    return salons.filter((salon) => `${salon.name} ${salon.city} ${salon.address}`.toLowerCase().includes(query));
  }, [salons, search]);

  const selectedServices = useMemo(() => {
    if (!selectedSalon) {
      return [];
    }
    return services;
  }, [selectedSalon, services]);

  async function chooseSalon(salon) {
    setServices([]);
    setSelectedSalon(salon);
  }

  return (
    <AppScreen refreshing={refreshing} onRefresh={load}>
      <ScreenHero
        image={heroImages.offers}
        icon="services"
        title="Salon services"
        subtitle="Unisex beauty and grooming services with current branch pricing."
      />
      <Text variant="titleMedium" style={styles.title}>Choose salon</Text>
      <TextInput
        label="Search salon by name, city, address or letter"
        value={search}
        onChangeText={setSearch}
        mode="outlined"
        style={styles.input}
      />
      {!filteredSalons.length ? <EmptyState title="No salons found" message="Try another city, branch name or address." /> : filteredSalons.map((salon) => (
        <View key={salon._id} style={[serviceStyles.section, selectedSalon?._id === salon._id && serviceStyles.selectedSection]}>
          <Text style={serviceStyles.sectionTitle}>{salon.name}</Text>
          <Text style={serviceStyles.sectionMeta}>{salon.city} | {salon.address}</Text>
          <Button
            mode="contained"
            buttonColor={colors.success}
            textColor={colors.ink}
            onPress={() => chooseSalon(salon)}>
            View services
          </Button>
        </View>
      ))}

      {selectedSalon ? (
        <View style={serviceStyles.section}>
          <Text style={serviceStyles.sectionTitle}>{selectedSalon.name} services</Text>
          {!selectedServices.length ? <EmptyState title="No services added for this salon" /> : (
          <View style={serviceStyles.grid}>
            {selectedServices.map((service) => (
              <View key={service._id} style={serviceStyles.card}>
                <Text numberOfLines={2} style={serviceStyles.name}>{shortName(service.name)}</Text>
                <Text style={serviceStyles.price}>Rs {service.price || 0}</Text>
              </View>
            ))}
          </View>
          )}
        </View>
      ) : null}
    </AppScreen>
  );
}

const serviceStyles = StyleSheet.create({
  section: {
    marginBottom: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.line,
    padding: 12,
    backgroundColor: colors.panel,
  },
  selectedSection: {
    borderColor: colors.success,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 17,
    fontWeight: '900',
  },
  sectionMeta: {
    marginTop: 4,
    marginBottom: 10,
    color: colors.muted,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  card: {
    width: '48%',
    minHeight: 106,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.gold,
    padding: 12,
    justifyContent: 'space-between',
    backgroundColor: colors.panel,
  },
  name: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '900',
  },
  price: {
    marginTop: 12,
    color: colors.softGold,
    fontSize: 18,
    fontWeight: '900',
  },
});
