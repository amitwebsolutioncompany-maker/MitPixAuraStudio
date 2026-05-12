import {MD3LightTheme} from 'react-native-paper';

export const colors = {
  ink: '#070707',
  charcoal: '#111111',
  panel: '#1A1A1A',
  deepGold: '#8B6508',
  royalGold: '#B8891B',
  gold: '#D8AA4C',
  softGold: '#F2D18B',
  line: '#3B321F',
  text: '#F8F1DF',
  muted: '#B8A77D',
  danger: '#E06B5F'
};

export const theme = {
  ...MD3LightTheme,
  roundness: 8,
  colors: {
    ...MD3LightTheme.colors,
    primary: colors.gold,
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
