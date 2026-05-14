import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {StyleSheet, View} from 'react-native';
import {Text} from 'react-native-paper';
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
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    setRefreshing(true);
    try {
      const [salonsRes, servicesRes] = await Promise.all([
        salonApi.list(),
        serviceApi.list(),
      ]);
      setSalons((salonsRes.data.salons || []).filter((salon) => salon.isActive !== false));
      setServices(servicesRes.data.services || []);
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const groupedServices = useMemo(() => salons.map((salon) => ({
    salon,
    services: services.filter((service) => String(service.salon) === String(salon._id)),
  })).filter((group) => group.services.length), [salons, services]);

  return (
    <AppScreen refreshing={refreshing} onRefresh={load}>
      <ScreenHero
        image={heroImages.offers}
        icon="services"
        title="Salon services"
        subtitle="Unisex beauty and grooming services with current branch pricing."
      />
      <Text variant="titleMedium" style={styles.title}>Service catalog</Text>
      {!groupedServices.length ? <EmptyState title="No services added yet" /> : groupedServices.map((group) => (
        <View key={group.salon._id} style={serviceStyles.section}>
          <Text style={serviceStyles.sectionTitle}>{group.salon.name}</Text>
          <Text style={serviceStyles.sectionMeta}>{group.salon.city} | {group.salon.address}</Text>
          <View style={serviceStyles.grid}>
            {group.services.map((service) => (
              <View key={service._id} style={serviceStyles.card}>
                <Text numberOfLines={2} style={serviceStyles.name}>{shortName(service.name)}</Text>
                <Text style={serviceStyles.price}>Rs {service.price || 0}</Text>
              </View>
            ))}
          </View>
        </View>
      ))}
    </AppScreen>
  );
}

const serviceStyles = StyleSheet.create({
  section: {
    marginBottom: 16,
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
