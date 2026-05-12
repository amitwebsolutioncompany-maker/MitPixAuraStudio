import React from 'react';
import {StyleSheet, View} from 'react-native';
import {Text} from 'react-native-paper';
import {colors} from '../theme/theme';

function ScissorX({dark = false, size = 18}) {
  const bladeColor = dark ? '#5C3205' : colors.softGold;
  const accentColor = dark ? '#0E7A4B' : colors.successSoft;
  return (
    <View style={[brandStyles.scissor, {width: size + 10, height: size + 8}]}>
      <View style={[brandStyles.blade, brandStyles.longBlade, {backgroundColor: bladeColor}]} />
      <View style={[brandStyles.blade, brandStyles.shortBlade, {backgroundColor: accentColor}]} />
      <View style={[brandStyles.handle, brandStyles.handleLeft, {borderColor: bladeColor}]} />
      <View style={[brandStyles.handle, brandStyles.handleRight, {borderColor: accentColor}]} />
    </View>
  );
}

export default function BrandWordmark({style, dark = false, compact = false}) {
  const textStyle = [brandStyles.text, compact && brandStyles.compactText];
  return (
    <View style={[brandStyles.row, style]}>
      <Text style={[textStyle, dark ? brandStyles.mitDark : brandStyles.mitLight]}>Mit</Text>
      <Text style={[textStyle, dark ? brandStyles.pixDark : brandStyles.pixLight]}>Pi</Text>
      <ScissorX dark={dark} size={compact ? 16 : 18} />
      <Text style={[textStyle, dark ? brandStyles.auraDark : brandStyles.auraLight]}> Aura</Text>
      <Text style={[textStyle, dark ? brandStyles.studioDark : brandStyles.studioLight]}> Studio</Text>
    </View>
  );
}

const brandStyles = StyleSheet.create({
  row: {
    minHeight: 28,
    flexDirection: 'row',
    alignItems: 'center',
  },
  text: {
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 0,
  },
  compactText: {
    fontSize: 16,
  },
  mitDark: {
    color: '#07110D',
  },
  pixDark: {
    color: '#5C3205',
  },
  auraDark: {
    color: '#0E4F34',
  },
  studioDark: {
    color: '#2D2307',
  },
  mitLight: {
    color: colors.text,
  },
  pixLight: {
    color: colors.softGold,
  },
  auraLight: {
    color: colors.successSoft,
  },
  studioLight: {
    color: '#F3C04E',
  },
  scissor: {
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: -2,
  },
  blade: {
    position: 'absolute',
    width: 4,
    borderRadius: 3,
  },
  longBlade: {
    height: 28,
    top: -2,
    transform: [{rotate: '42deg'}],
  },
  shortBlade: {
    height: 19,
    bottom: 4,
    transform: [{rotate: '-42deg'}],
  },
  handle: {
    position: 'absolute',
    bottom: 1,
    width: 7,
    height: 7,
    borderRadius: 4,
    borderWidth: 2,
  },
  handleLeft: {
    left: 2,
  },
  handleRight: {
    right: 2,
  },
});
