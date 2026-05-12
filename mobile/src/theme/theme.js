import {MD3LightTheme} from 'react-native-paper';

export const colors = {
  ink: '#07110D',
  charcoal: '#0F1D17',
  panel: '#14251D',
  deepGold: '#8B6508',
  royalGold: '#B8891B',
  gold: '#D8AA4C',
  softGold: '#F2D18B',
  success: '#20C878',
  successDeep: '#0E7A4B',
  successSoft: '#BFF3D8',
  line: '#294436',
  text: '#F4FFF8',
  muted: '#A8C7B6',
  danger: '#E06B5F'
};

export const theme = {
  ...MD3LightTheme,
  roundness: 8,
  colors: {
    ...MD3LightTheme.colors,
    primary: colors.success,
    secondary: colors.gold,
    tertiary: colors.softGold,
    background: colors.ink,
    surface: colors.panel,
    surfaceVariant: colors.charcoal,
    onSurface: colors.text,
    onSurfaceVariant: colors.muted,
    outline: colors.line,
    error: colors.danger
  }
};

export const lightTheme = {
  ...theme,
  colors: {
    ...theme.colors,
    background: '#FFF9EC',
    surface: '#FFFFFF',
    surfaceVariant: '#F4E6C7',
    onSurface: '#211A0B',
    onSurfaceVariant: '#6B5728',
    outline: '#D6BD72'
  }
};

export const getAppTheme = (mode = 'luxury') => {
  if (mode === 'light') return lightTheme;
  return theme;
};
