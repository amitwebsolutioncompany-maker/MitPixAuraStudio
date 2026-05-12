import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import CustomerLoginScreen from '../screens/auth/CustomerLoginScreen';
import StaffLoginScreen from '../screens/auth/StaffLoginScreen';
import BrandWordmark from '../components/BrandWordmark';
import {colors} from '../theme/theme';

const Stack = createNativeStackNavigator();

export default function AuthNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerTitle: () => <BrandWordmark dark compact />,
        headerStyle: {backgroundColor: colors.success},
      }}>
      <Stack.Screen name="CustomerLogin" component={CustomerLoginScreen} options={{title: 'Customer Login'}} />
      <Stack.Screen name="StaffLogin" component={StaffLoginScreen} options={{title: 'Staff Login'}} />
    </Stack.Navigator>
  );
}
