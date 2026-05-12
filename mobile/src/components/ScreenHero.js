import React from 'react';
import {ImageBackground, StyleSheet, View} from 'react-native';
import {Text} from 'react-native-paper';
import MenuIcon from './MenuIcon';
import {colors} from '../theme/theme';

export default function ScreenHero({image, icon, title, subtitle}) {
  return (
    <ImageBackground source={{uri: image}} imageStyle={screenHeroStyles.image} style={screenHeroStyles.hero}>
      <View style={screenHeroStyles.overlay}>
        <View style={screenHeroStyles.iconBadge}>
          <MenuIcon name={icon} size={18} color={colors.ink} />
        </View>
        <Text variant="headlineSmall" style={screenHeroStyles.title}>{title}</Text>
        {subtitle ? <Text style={screenHeroStyles.subtitle}>{subtitle}</Text> : null}
      </View>
    </ImageBackground>
  );
}

const screenHeroStyles = StyleSheet.create({
  hero: {
    minHeight: 164,
    overflow: 'hidden',
    borderRadius: 8,
    marginBottom: 16,
    backgroundColor: colors.charcoal
  },
  image: {
    borderRadius: 8
  },
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: 16,
    backgroundColor: 'rgba(2,18,12,0.68)'
  },
  iconBadge: {
    width: 34,
    height: 34,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    backgroundColor: colors.successSoft
  },
  title: {
    color: colors.text,
    fontWeight: '800'
  },
  subtitle: {
    marginTop: 6,
    color: colors.successSoft
  }
});
