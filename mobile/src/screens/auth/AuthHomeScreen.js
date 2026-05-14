import React from 'react';
import {StyleSheet, View} from 'react-native';
import {Button, Text} from 'react-native-paper';
import AppScreen from '../../components/AppScreen';
import BrandWordmark from '../../components/BrandWordmark';
import {styles} from '../../theme/styles';
import {colors} from '../../theme/theme';

export default function AuthHomeScreen({navigation}) {
  return (
    <AppScreen>
      <BrandWordmark />
      <Text style={styles.subtitle}>Choose your workspace and continue securely.</Text>

      <View style={authHomeStyles.card}>
        <Text style={authHomeStyles.cardTitle}>Customer and Staff</Text>
        <Text style={authHomeStyles.cardCopy}>Book salon services or manage today’s staff work.</Text>
        <View style={authHomeStyles.actions}>
          <Button mode="contained" buttonColor={colors.success} textColor={colors.ink} onPress={() => navigation.navigate('CustomerLogin')}>
            Customer
          </Button>
          <Button mode="contained-tonal" onPress={() => navigation.navigate('StaffLogin')}>
            Staff
          </Button>
        </View>
      </View>

      <View style={authHomeStyles.card}>
        <Text style={authHomeStyles.cardTitle}>Admin and Super Admin</Text>
        <Text style={authHomeStyles.cardCopy}>Manage salon operations or platform subscriptions.</Text>
        <View style={authHomeStyles.actions}>
          <Button mode="contained" buttonColor={colors.gold} textColor={colors.ink} onPress={() => navigation.navigate('AdminLogin')}>
            Admin
          </Button>
          <Button mode="contained-tonal" onPress={() => navigation.navigate('SuperAdminLogin')}>
            Super Admin
          </Button>
        </View>
      </View>
    </AppScreen>
  );
}

const authHomeStyles = StyleSheet.create({
  card: {
    marginTop: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.gold,
    padding: 14,
    backgroundColor: colors.panel,
  },
  cardTitle: {
    color: colors.text,
    fontSize: 17,
    fontWeight: '900',
  },
  cardCopy: {
    marginTop: 6,
    color: colors.muted,
    lineHeight: 20,
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 14,
  },
});
