import AsyncStorage from '@react-native-async-storage/async-storage';
import {create} from 'zustand';
import {authApi} from '../api/endpoints';

const TOKEN_KEY = 'mitpixAuraStudio.token';
const USER_KEY = 'mitpixAuraStudio.user';
const THEME_KEY = 'mitpixAuraStudio.themeMode';

export const useAuthStore = create((set) => ({
  token: null,
  user: null,
  loading: true,
  themeMode: 'luxury',
  loginMode: 'customer',
  setLoginMode: (loginMode) => set({loginMode}),
  bootstrap: async () => {
    const [token, rawUser, themeMode] = await Promise.all([
      AsyncStorage.getItem(TOKEN_KEY),
      AsyncStorage.getItem(USER_KEY),
      AsyncStorage.getItem(THEME_KEY)
    ]);
    set({token, user: rawUser ? JSON.parse(rawUser) : null, themeMode: themeMode || 'luxury'});
    if (token) {
      try {
        const {data} = await authApi.me();
        const syncedTheme = data.user?.preferences?.themeMode || themeMode || 'luxury';
        await persistAuth(token, data.user);
        await AsyncStorage.setItem(THEME_KEY, syncedTheme);
        set({user: data.user, themeMode: syncedTheme, loading: false});
        return;
      } catch (_err) {
        await AsyncStorage.multiRemove([TOKEN_KEY, USER_KEY]);
      }
    }
    set({token: null, user: null, loading: false});
  },
  customerLogin: async (payload) => {
    const {data} = await authApi.customerLogin(payload);
    await persistAuth(data.token, data.user);
    const themeMode = data.user?.preferences?.themeMode || 'luxury';
    await AsyncStorage.setItem(THEME_KEY, themeMode);
    set({token: data.token, user: data.user, themeMode});
  },
  staffLogin: async (payload) => {
    const {data} = await authApi.staffLogin(payload);
    await persistAuth(data.token, data.user);
    const themeMode = data.user?.preferences?.themeMode || 'luxury';
    await AsyncStorage.setItem(THEME_KEY, themeMode);
    set({token: data.token, user: data.user, themeMode});
  },
  adminLogin: async (payload) => {
    const {data} = await authApi.adminLogin(payload);
    await persistAuth(data.token, data.user);
    const themeMode = data.user?.preferences?.themeMode || 'luxury';
    await AsyncStorage.setItem(THEME_KEY, themeMode);
    set({token: data.token, user: data.user, themeMode});
  },
  superAdminLogin: async (payload) => {
    const {data} = await authApi.superAdminLogin(payload);
    await persistAuth(data.token, data.user);
    const themeMode = data.user?.preferences?.themeMode || 'luxury';
    await AsyncStorage.setItem(THEME_KEY, themeMode);
    set({token: data.token, user: data.user, themeMode});
  },
  updateProfile: async (payload) => {
    const {data} = await authApi.updateProfile(payload);
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(data.user));
    set({user: data.user});
  },
  setThemeMode: async (themeMode) => {
    await AsyncStorage.setItem(THEME_KEY, themeMode);
    set({themeMode});
    const {token, user} = useAuthStore.getState();
    if (token && user) {
      try {
        const {data} = await authApi.updateProfile({preferences: {themeMode}});
        await AsyncStorage.setItem(USER_KEY, JSON.stringify(data.user));
        set({user: data.user});
      } catch (_err) {
        // Local theme should still change even if the profile sync is offline.
      }
    }
  },
  logout: async () => {
    await AsyncStorage.multiRemove([TOKEN_KEY, USER_KEY]);
    set({token: null, user: null});
  }
}));

async function persistAuth(token, user) {
  await AsyncStorage.multiSet([
    [TOKEN_KEY, token],
    [USER_KEY, JSON.stringify(user)]
  ]);
}
