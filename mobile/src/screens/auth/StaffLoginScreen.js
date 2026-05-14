import React, {useState} from 'react';
import {Button, Text, TextInput} from 'react-native-paper';
import AppScreen from '../../components/AppScreen';
import PasswordInput from '../../components/PasswordInput';
import {useAuthStore} from '../../store/authStore';
import {styles} from '../../theme/styles';
import {colors} from '../../theme/theme';
import BrandWordmark from '../../components/BrandWordmark';
import {getLoginErrorMessage} from '../../utils/errors';

export default function StaffLoginScreen({navigation}) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const staffLogin = useAuthStore((state) => state.staffLogin);

  async function submit() {
    if (busy) return;
    setBusy(true);
    setError('');
    try {
      await staffLogin({email, password});
    } catch (err) {
      setError(getLoginErrorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <AppScreen>
      <BrandWordmark />
      <Text variant="titleMedium" style={styles.title}>Staff Login</Text>
      <TextInput label="Email" autoCapitalize="none" keyboardType="email-address" value={email} onChangeText={setEmail} style={styles.input} />
      <PasswordInput label="Password" value={password} onChangeText={setPassword} style={styles.input} />
      {error ? <Text style={{color: 'red', marginBottom: 12}}>{error}</Text> : null}
      <Button
        mode="contained"
        loading={busy}
        disabled={!email || !password}
        buttonColor={colors.success}
        textColor={colors.ink}
        onPress={submit}>
        Login
      </Button>
      <Button mode="text" onPress={() => navigation.navigate('AuthHome')}>Back</Button>
    </AppScreen>
  );
}
