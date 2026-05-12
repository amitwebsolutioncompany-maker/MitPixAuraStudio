import React, {useEffect} from 'react';
import {StatusBar} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import {PaperProvider} from 'react-native-paper';
import RootNavigator from './navigation/RootNavigator';
import {getAppTheme} from './theme/theme';
import {useAuthStore} from './store/authStore';

export default function App() {
  const bootstrap = useAuthStore((state) => state.bootstrap);
  const themeMode = useAuthStore((state) => state.themeMode);
  const appTheme = getAppTheme(themeMode);

  useEffect(() => {
    bootstrap();
  }, [bootstrap]);

  return (
    <PaperProvider theme={appTheme}>
      <NavigationContainer>
        <StatusBar barStyle={themeMode === 'light' ? 'dark-content' : 'light-content'} backgroundColor={appTheme.colors.background} />
        <RootNavigator />
      </NavigationContainer>
    </PaperProvider>
  );
}
