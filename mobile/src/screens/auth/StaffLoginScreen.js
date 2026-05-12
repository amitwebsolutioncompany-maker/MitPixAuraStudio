import React, {useState} from 'react';
import {Button, Text, TextInput, SegmentedButtons} from 'react-native-paper';
import AppScreen from '../../components/AppScreen';
import {useAuthStore} from '../../store/authStore';
import {styles} from '../../theme/styles';

export default function StaffLoginScreen({navigation}) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const staffLogin = useAuthStore((state) => state.staffLogin);

  async function submit() {
    setBusy(true);
    setError('');
    try {
      await staffLogin({email, password});
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Login failed');
    } finally {
      setBusy(false);
    }
  }

  return (
    <AppScreen>
      <Text variant="headlineMedium" style={styles.title}>Staff / Admin Login</Text>
      <SegmentedButtons
        value="staff"
        onValueChange={(value) => {
          if (value === 'customer') navigation.navigate('CustomerLogin');
        }}
        buttons={[{value: 'customer', label: 'Customer'}, {value: 'staff', label: 'Staff / Admin'}]}
      />
      <TextInput label="Email" autoCapitalize="none" keyboardType="email-address" value={email} onChangeText={setEmail} style={styles.input} />
      <TextInput label="Password" secureTextEntry value={password} onChangeText={setPassword} style={styles.input} />
      {error ? <Text style={{color: 'red', marginBottom: 12}}>{error}</Text> : null}
      <Button mode="contained" loading={busy} disabled={!email || !password || busy} onPress={submit}>Login</Button>
    </AppScreen>
  );
}
