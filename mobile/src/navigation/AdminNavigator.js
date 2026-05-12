import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import DashboardScreen from '../screens/admin/DashboardScreen';
import SalonCrudScreen from '../screens/admin/SalonCrudScreen';
import EmployeeCrudScreen from '../screens/admin/EmployeeCrudScreen';
import BookingManagementScreen from '../screens/admin/BookingManagementScreen';
import OffersManagementScreen from '../screens/admin/OffersManagementScreen';
import ContentManagementScreen from '../screens/admin/ContentManagementScreen';
import StaffEarningsScreen from '../screens/admin/StaffEarningsScreen';
import ProfileScreen from '../screens/shared/ProfileScreen';
import {tabScreenOptions} from './tabOptions';
import CustomerTopMenu, {adminMenuItems} from '../components/CustomerTopMenu';

const Tab = createBottomTabNavigator();

function AdminHeader({navigation, route}) {
  return (
    <CustomerTopMenu
      navigation={navigation}
      activeRoute={route.name}
      menuItems={adminMenuItems}
      caption="Admin console"
    />
  );
}

function hiddenTabButton() {
  return null;
}

const adminScreenOptions = {
  ...tabScreenOptions,
  tabBarStyle: {display: 'none'},
  header: AdminHeader,
  tabBarButton: hiddenTabButton,
};

export default function AdminNavigator() {
  return (
    <Tab.Navigator screenOptions={adminScreenOptions}>
      <Tab.Screen name="Dashboard" component={DashboardScreen} options={{title: 'Dash'}} />
      <Tab.Screen name="Salons" component={SalonCrudScreen} options={{title: 'Salons'}} />
      <Tab.Screen name="Employees" component={EmployeeCrudScreen} options={{title: 'Staff'}} />
      <Tab.Screen name="Bookings" component={BookingManagementScreen} options={{title: 'Books'}} />
      <Tab.Screen name="Offers" component={OffersManagementScreen} options={{title: 'Offers'}} />
      <Tab.Screen name="Content" component={ContentManagementScreen} options={{title: 'Content'}} />
      <Tab.Screen name="StaffEarnings" component={StaffEarningsScreen} options={{title: 'Earnings'}} />
      <Tab.Screen name="Settings" component={ProfileScreen} options={{title: 'Settings'}} />
    </Tab.Navigator>
  );
}
