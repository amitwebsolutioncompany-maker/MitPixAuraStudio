import React from 'react';
import {Button, Text} from 'react-native-paper';
import AppScreen from '../../components/AppScreen';
import ScreenHero from '../../components/ScreenHero';
import {styles} from '../../theme/styles';
import {heroImages} from '../../theme/visuals';
import {colors} from '../../theme/theme';

export default function HomeScreen({navigation}) {
  return (
    <AppScreen>
      <ScreenHero
        image={heroImages.booking}
        icon="book"
        title="Book your aura session"
        subtitle="Salon, expert and slot selection in one premium flow."
      />
      <Text variant="titleMedium" style={styles.title}>Where should we pamper you today?</Text>
      <Text style={styles.subtitle}>Search by city, choose a salon, then pick your expert and slot.</Text>
      <Button
        mode="contained"
        buttonColor={colors.success}
        textColor={colors.ink}
        onPress={() => navigation.navigate('SalonSearch')}>
        Find salon
      </Button>
    </AppScreen>
  );
}
