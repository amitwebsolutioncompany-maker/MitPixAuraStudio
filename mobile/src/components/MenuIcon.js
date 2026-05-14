import React from 'react';
import {Text} from 'react-native';
import {colors} from '../theme/theme';

const icons = {
  book: '\u25A6',
  bookings: '\u25C7',
  function: '\u25C9',
  products: '\u25C8',
  academy: '\u25B3',
  offers: '%',
  history: '\u21BA',
  settings: '\u2699',
  dashboard: '\u25A3',
  salon: '\u2726',
  staff: '\u25CE',
  services: '\u25A4',
  slots: '\u25EB',
  analytics: '\u25F7',
  walkin: '\u25B7',
  break: '\u2016',
  complete: '\u2713',
  why: '\u2605',
  gift: '\u25C6',
  party: '\u2727',
};

export default function MenuIcon({name, color = colors.text, size = 20, style}) {
  return (
    <Text style={[{color, fontSize: size, fontWeight: '900', lineHeight: size + 4}, style]}>
      {icons[name] || '\u2022'}
    </Text>
  );
}
