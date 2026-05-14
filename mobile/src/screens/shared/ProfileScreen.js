import React, {useState} from 'react';
import {StyleSheet, View} from 'react-native';
import {Button, Card, SegmentedButtons, Text, TextInput} from 'react-native-paper';
import AppScreen from '../../components/AppScreen';
import ScreenHero from '../../components/ScreenHero';
import {useAuthStore} from '../../store/authStore';
import {styles} from '../../theme/styles';
import {colors} from '../../theme/theme';
import {heroImages} from '../../theme/visuals';

const supportContacts = [
  {name: 'Rajjak Ali', phone: '+918423086808'},
  {name: 'Shailesh Sharma', phone: '+918543806094'},
  {name: 'Amit Maddheshiye', phone: '+918574700615'},
];

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

      <Card style={screenStyles.helpCard} mode="elevated">
        <Card.Content>
          <Text variant="titleMedium" style={screenStyles.helpTitle}>Help</Text>
          <Text style={screenStyles.helpSubtitle}>For booking or salon support, call any of these numbers.</Text>
          <View style={screenStyles.contactList}>
            {supportContacts.map((contact) => (
              <View key={contact.phone} style={screenStyles.contactRow}>
                <Text style={screenStyles.contactName}>{contact.name}</Text>
                <Text style={screenStyles.contactPhone}>{contact.phone}</Text>
              </View>
            ))}
          </View>
        </Card.Content>
      </Card>

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

const screenStyles = StyleSheet.create({
  helpCard: {
    marginBottom: 16,
    borderRadius: 8,
    backgroundColor: colors.panel,
  },
  helpTitle: {
    color: colors.softGold,
    fontWeight: '900',
  },
  helpSubtitle: {
    marginTop: 4,
    color: colors.muted,
  },
  contactList: {
    marginTop: 12,
    gap: 10,
  },
  contactRow: {
    gap: 3,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.charcoal,
  },
  contactName: {
    color: colors.text,
    fontWeight: '800',
  },
  contactPhone: {
    color: colors.success,
    fontWeight: '900',
  },
});
