import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {ImageBackground, StyleSheet, View} from 'react-native';
import {Button, Text, TextInput} from 'react-native-paper';
import AppScreen from '../../components/AppScreen';
import EmptyState from '../../components/EmptyState';
import {salonApi} from '../../api/endpoints';
import {useBookingStore} from '../../store/bookingStore';
import {styles} from '../../theme/styles';
import {colors} from '../../theme/theme';
import {heroImages} from '../../theme/visuals';

export default function SalonSearchScreen({navigation}) {
  const [city, setCity] = useState('');
  const [salons, setSalons] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const setSalon = useBookingStore((state) => state.setSalon);
  const setBookingCity = useBookingStore((state) => state.setCity);

  const load = useCallback(async () => {
    setRefreshing(true);
    try {
      const {data} = await salonApi.list();
      setSalons(data.salons || []);
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filteredSalons = useMemo(() => {
    const query = city.trim().toLowerCase();
    if (!query) return salons;
    return salons.filter((salon) => (
      salon.city?.toLowerCase().includes(query) ||
      salon.name?.toLowerCase().includes(query) ||
      salon.address?.toLowerCase().includes(query)
    ));
  }, [city, salons]);

  function selectSalon(salon) {
    setBookingCity(city);
    setSalon(salon);
    navigation.navigate('SalonDetails', {salonId: salon._id});
  }

  return (
    <AppScreen refreshing={refreshing} onRefresh={load}>
      <ImageBackground source={{uri: heroImages.booking}} imageStyle={salonStyles.heroImage} style={salonStyles.hero}>
        <View style={salonStyles.heroOverlay}>
          <Text variant="headlineSmall" style={salonStyles.heroTitle}>Find your salon</Text>
          <Text style={salonStyles.heroSubtitle}>Type city, salon name or any letter to filter instantly.</Text>
        </View>
      </ImageBackground>
      <TextInput
        label="Search city or salon"
        value={city}
        onChangeText={setCity}
        mode="outlined"
        style={styles.input}
      />
      {!filteredSalons.length ? <EmptyState title="No salons found" message="Try another city or salon name." /> : filteredSalons.map((salon) => (
        <View key={salon._id} style={salonStyles.card}>
          <View style={salonStyles.topRow}>
            <View style={salonStyles.badge}>
              <Text style={salonStyles.badgeText}>Aura</Text>
            </View>
            <View style={salonStyles.info}>
              <Text variant="titleMedium" style={salonStyles.name}>{salon.name}</Text>
              <Text style={salonStyles.address}>{salon.address}</Text>
            </View>
          </View>
          <View style={salonStyles.metaRow}>
            <Text style={salonStyles.meta}>{salon.city}</Text>
            <Text style={salonStyles.meta}>{salon.openingTime}-{salon.closingTime}</Text>
            <Text style={salonStyles.meta}>{salon.totalChairs || 0} chairs</Text>
          </View>
          <Button
            mode="contained"
            buttonColor={colors.success}
            textColor={colors.ink}
            onPress={() => selectSalon(salon)}>
            Select salon
          </Button>
        </View>
      ))}
    </AppScreen>
  );
}

const salonStyles = StyleSheet.create({
  hero: {
    minHeight: 170,
    overflow: 'hidden',
    borderRadius: 8,
    marginBottom: 14,
    backgroundColor: colors.charcoal,
  },
  heroImage: {
    borderRadius: 8,
  },
  heroOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: 16,
    backgroundColor: 'rgba(2,18,12,0.62)',
  },
  heroTitle: {
    color: colors.text,
    fontWeight: '900',
  },
  heroSubtitle: {
    marginTop: 6,
    color: colors.successSoft,
    fontWeight: '700',
  },
  card: {
    marginBottom: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.panel,
    padding: 14,
  },
  topRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  badge: {
    width: 52,
    height: 52,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.successSoft,
  },
  badgeText: {
    color: colors.ink,
    fontWeight: '900',
  },
  info: {
    flex: 1,
  },
  name: {
    color: colors.text,
    fontWeight: '900',
  },
  address: {
    marginTop: 4,
    color: colors.muted,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  meta: {
    borderRadius: 8,
    overflow: 'hidden',
    paddingHorizontal: 10,
    paddingVertical: 5,
    color: colors.successSoft,
    backgroundColor: colors.charcoal,
  },
});
