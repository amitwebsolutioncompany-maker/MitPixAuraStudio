import React, {useState} from 'react';
import {Button, SegmentedButtons, Text, TextInput} from 'react-native-paper';
import AppScreen from '../../components/AppScreen';
import {useAuthStore} from '../../store/authStore';
import {styles} from '../../theme/styles';

export default function ProfileScreen() {
  const {user, logout, updateProfile, themeMode, setThemeMode} = useAuthStore();
  const [name, setName] = useState(user?.name || '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || '');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  async function saveProfile() {
    setBusy(true);
    setMessage('');
    try {
      await updateProfile({name, avatarUrl});
      setMessage('Settings saved');
    } catch (err) {
      setMessage(err.response?.data?.message || err.message || 'Settings update failed');
    } finally {
      setBusy(false);
    }
  }

  return (
    <AppScreen>
      <Text variant="headlineSmall" style={styles.title}>Settings</Text>
      <Text style={styles.subtitle}>{user?.email || user?.phone} | {user?.role}</Text>

      <TextInput label="Display name" value={name} onChangeText={setName} style={styles.input} />
      <TextInput label="Avatar image URL" value={avatarUrl} onChangeText={setAvatarUrl} style={styles.input} />

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
