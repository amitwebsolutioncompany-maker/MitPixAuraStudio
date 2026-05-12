import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import DashboardScreen from '../screens/admin/DashboardScreen';
import SalonCrudScreen from '../screens/admin/SalonCrudScreen';
import EmployeeCrudScreen from '../screens/admin/EmployeeCrudScreen';
import SlotManagementScreen from '../screens/admin/SlotManagementScreen';
import BookingManagementScreen from '../screens/admin/BookingManagementScreen';
import OffersManagementScreen from '../screens/admin/OffersManagementScreen';
import AnalyticsScreen from '../screens/admin/AnalyticsScreen';
import ProfileScreen from '../screens/shared/ProfileScreen';
import {tabScreenOptions} from './tabOptions';

const Tab = createBottomTabNavigator();

export default function AdminNavigator() {
  return (
    <Tab.Navigator screenOptions={tabScreenOptions}>
      <Tab.Screen name="Dashboard" component={DashboardScreen} options={{title: 'Dash'}} />
      <Tab.Screen name="Salons" component={SalonCrudScreen} options={{title: 'Salons'}} />
      <Tab.Screen name="Employees" component={EmployeeCrudScreen} options={{title: 'Staff'}} />
      <Tab.Screen name="Slots" component={SlotManagementScreen} options={{title: 'Slots'}} />
      <Tab.Screen name="Bookings" component={BookingManagementScreen} options={{title: 'Books'}} />
      <Tab.Screen name="Offers" component={OffersManagementScreen} options={{title: 'Offers'}} />
      <Tab.Screen name="Analytics" component={AnalyticsScreen} options={{title: 'Data'}} />
      <Tab.Screen name="Settings" component={ProfileScreen} options={{title: 'Settings'}} />
    </Tab.Navigator>
  );
}
