import React from 'react';
import {StyleSheet, View} from 'react-native';
import {Text} from 'react-native-paper';
import {colors} from '../theme/theme';

export default function UpcomingCover({title, subtitle}) {
  return (
    <View style={coverStyles.cover}>
      <Text style={coverStyles.kicker}>Upcoming</Text>
      <Text variant="headlineMedium" style={coverStyles.title}>{title}</Text>
      <Text style={coverStyles.subtitle}>{subtitle}</Text>
    </View>
  );
}

const coverStyles = StyleSheet.create({
  cover: {
    minHeight: 420,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.success,
    padding: 22,
    marginBottom: 18,
    backgroundColor: '#10291D',
  },
  kicker: {
    borderRadius: 8,
    overflow: 'hidden',
    paddingHorizontal: 14,
    paddingVertical: 6,
    color: colors.ink,
    fontWeight: '900',
    backgroundColor: colors.successSoft,
    textTransform: 'uppercase',
  },
  title: {
    marginTop: 18,
    color: colors.text,
    textAlign: 'center',
    fontWeight: '900',
  },
  subtitle: {
    marginTop: 10,
    color: colors.muted,
    textAlign: 'center',
    lineHeight: 20,
  },
});
