import React from 'react';
import {ActivityIndicator} from 'react-native-paper';
import {View} from 'react-native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import AuthNavigator from './AuthNavigator';
import CustomerNavigator from './CustomerNavigator';
import EmployeeNavigator from './EmployeeNavigator';
import AdminNavigator from './AdminNavigator';
import {useAuthStore} from '../store/authStore';
import {styles} from '../theme/styles';

const Stack = createNativeStackNavigator();

export default function RootNavigator() {
  const {user, loading} = useAuthStore();

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      {!user && <Stack.Screen name="Auth" component={AuthNavigator} />}
      {user?.role === 'customer' && <Stack.Screen name="Customer" component={CustomerNavigator} />}
      {user?.role === 'employee' && <Stack.Screen name="Employee" component={EmployeeNavigator} />}
      {user?.role === 'admin' && <Stack.Screen name="Admin" component={AdminNavigator} />}
    </Stack.Navigator>
  );
}
