import React, {useState} from 'react';
import {Button, Text, TextInput, SegmentedButtons} from 'react-native-paper';
import AppScreen from '../../components/AppScreen';
import {useAuthStore} from '../../store/authStore';
import {styles} from '../../theme/styles';
import BrandWordmark from '../../components/BrandWordmark';
import {colors} from '../../theme/theme';

export default function CustomerLoginScreen({navigation}) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const customerLogin = useAuthStore((state) => state.customerLogin);

  async function submit() {
    if (busy) return;
    setBusy(true);
    setError('');
    try {
      await customerLogin({name, phone});
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Login failed');
    } finally {
      setBusy(false);
    }
  }

  return (
    <AppScreen>
      <BrandWordmark />
      <Text style={styles.subtitle}>Book premium salon time by city, expert and slot.</Text>
      <SegmentedButtons
        value="customer"
        onValueChange={(value) => {
          if (value === 'staff') navigation.navigate('StaffLogin');
        }}
        buttons={[{value: 'customer', label: 'Customer'}, {value: 'staff', label: 'Staff / Admin'}]}
      />
      <TextInput label="Name" value={name} onChangeText={setName} style={styles.input} />
      <TextInput label="Mobile number" keyboardType="phone-pad" value={phone} onChangeText={setPhone} style={styles.input} />
      {error ? <Text style={{color: 'red', marginBottom: 12}}>{error}</Text> : null}
      <Button
        mode="contained"
        loading={busy}
        disabled={!phone}
        buttonColor={colors.success}
        textColor={colors.ink}
        onPress={submit}>
        Continue
      </Button>
    </AppScreen>
  );
}
