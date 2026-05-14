import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import CustomerLoginScreen from '../screens/auth/CustomerLoginScreen';
import StaffLoginScreen from '../screens/auth/StaffLoginScreen';
import AdminLoginScreen from '../screens/auth/AdminLoginScreen';
import SuperAdminLoginScreen from '../screens/auth/SuperAdminLoginScreen';
import AuthHomeScreen from '../screens/auth/AuthHomeScreen';
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
      <Stack.Screen name="AuthHome" component={AuthHomeScreen} options={{title: 'Login'}} />
      <Stack.Screen name="CustomerLogin" component={CustomerLoginScreen} options={{title: 'Customer Login'}} />
      <Stack.Screen name="StaffLogin" component={StaffLoginScreen} options={{title: 'Staff Login'}} />
      <Stack.Screen name="AdminLogin" component={AdminLoginScreen} options={{title: 'Admin Login'}} />
      <Stack.Screen name="SuperAdminLogin" component={SuperAdminLoginScreen} options={{title: 'Super Admin Login'}} />
    </Stack.Navigator>
  );
}
