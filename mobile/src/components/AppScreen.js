import React from 'react';
import {ScrollView, RefreshControl} from 'react-native';
import {useTheme} from 'react-native-paper';
import {styles} from '../theme/styles';

export default function AppScreen({children, refreshing = false, onRefresh}) {
  const theme = useTheme();

  return (
    <ScrollView
      style={[styles.screen, {backgroundColor: theme.colors.background}]}
      contentContainerStyle={{paddingBottom: 32}}
      refreshControl={onRefresh ? <RefreshControl refreshing={refreshing} onRefresh={onRefresh} /> : undefined}>
      {children}
    </ScrollView>
  );
}
