import React, {useState} from 'react';
import {Button, SegmentedButtons, Text, TextInput} from 'react-native-paper';
import AppScreen from '../../components/AppScreen';
import ScreenHero from '../../components/ScreenHero';
import {useAuthStore} from '../../store/authStore';
import {styles} from '../../theme/styles';
import {heroImages} from '../../theme/visuals';

export default function ProfileScreen() {
  const {user, logout, updateProfile, themeMode, setThemeMode} = useAuthStore();
  const [name, setName] = useState(user?.name || '');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  async function saveProfile() {
    setBusy(true);
    setMessage('');
    try {
      await updateProfile({name});
      setMessage('Settings saved');
    } catch (err) {
      setMessage(err.response?.data?.message || err.message || 'Settings update failed');
    } finally {
      setBusy(false);
    }
  }

  return (
    <AppScreen>
      <ScreenHero
        image={heroImages.settings}
        icon="settings"
        title="Settings"
        subtitle="Profile, theme and logout controls."
      />
      <Text variant="titleMedium" style={styles.title}>Account settings</Text>
      <Text style={styles.subtitle}>{user?.email || user?.phone} | {user?.role}</Text>

      <TextInput label="Display name" value={name} onChangeText={setName} style={styles.input} />

      <Text variant="titleMedium" style={{marginBottom: 8}}>Theme</Text>
      <SegmentedButtons
        value={themeMode}
        onValueChange={setThemeMode}
        buttons={[
          {value: 'luxury', label: 'Luxury'},
          {value: 'light', label: 'Light'}
        ]}
        style={{marginBottom: 16}}
      />

      {message ? <Text style={{marginBottom: 12}}>{message}</Text> : null}
      <Button mode="contained" loading={busy} disabled={busy} onPress={saveProfile}>Save settings</Button>
      <Button mode="contained-tonal" onPress={logout} style={{marginTop: 12}}>Logout</Button>
    </AppScreen>
  );
}
