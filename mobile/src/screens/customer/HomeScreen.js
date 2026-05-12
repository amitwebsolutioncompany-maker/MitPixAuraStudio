import React from 'react';
import {Button, Text} from 'react-native-paper';
import AppScreen from '../../components/AppScreen';
import {styles} from '../../theme/styles';

export default function HomeScreen({navigation}) {
  return (
    <AppScreen>
      <Text variant="headlineSmall" style={styles.title}>Where should we pamper you today?</Text>
      <Text style={styles.subtitle}>Search by city, choose a salon, then pick your expert and slot.</Text>
      <Button mode="contained" onPress={() => navigation.navigate('SalonSearch')}>Find salon</Button>
    </AppScreen>
  );
}
