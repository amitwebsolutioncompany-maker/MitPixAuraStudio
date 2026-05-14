import React, {useState} from 'react';
import {Button, Text, TextInput} from 'react-native-paper';
import AppScreen from '../../components/AppScreen';
import BrandWordmark from '../../components/BrandWordmark';
import PasswordInput from '../../components/PasswordInput';
import {useAuthStore} from '../../store/authStore';
import {styles} from '../../theme/styles';
import {colors} from '../../theme/theme';
import {getLoginErrorMessage} from '../../utils/errors';

export default function AdminLoginScreen({navigation}) {
  const [email, setEmail] = useState('');
  const [aadhaarNumber, setAadhaarNumber] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const adminLogin = useAuthStore((state) => state.adminLogin);

  async function submit() {
    if (busy) return;
    setBusy(true);
    setError('');
    try {
      await adminLogin({email, aadhaarNumber, password});
    } catch (err) {
      setError(getLoginErrorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <AppScreen>
      <BrandWordmark />
      <Text variant="titleMedium" style={styles.title}>Admin Login</Text>
      <Text style={styles.subtitle}>Use the email/password created by Super Admin. Aadhaar can help identify expired accounts.</Text>
      <TextInput label="Email" autoCapitalize="none" keyboardType="email-address" value={email} onChangeText={setEmail} style={styles.input} />
      <TextInput label="Aadhaar number optional" keyboardType="number-pad" value={aadhaarNumber} onChangeText={setAadhaarNumber} style={styles.input} />
      <PasswordInput label="Password" value={password} onChangeText={setPassword} style={styles.input} />
      {error ? <Text style={{color: 'red', marginBottom: 12}}>{error}</Text> : null}
      <Button mode="contained" loading={busy} disabled={(!email && !aadhaarNumber) || !password} buttonColor={colors.gold} textColor={colors.ink} onPress={submit}>
        Login
      </Button>
      <Button mode="text" onPress={() => navigation.navigate('AuthHome')}>Back</Button>
    </AppScreen>
  );
}
