import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import DashboardScreen from '../screens/admin/DashboardScreen';
import SalonCrudScreen from '../screens/admin/SalonCrudScreen';
import EmployeeCrudScreen from '../screens/admin/EmployeeCrudScreen';
import SlotManagementScreen from '../screens/admin/SlotManagementScreen';
import BookingManagementScreen from '../screens/admin/BookingManagementScreen';
import OffersManagementScreen from '../screens/admin/OffersManagementScreen';
import AnalyticsScreen from '../screens/admin/AnalyticsScreen';
import ContentManagementScreen from '../screens/admin/ContentManagementScreen';
import StaffEarningsScreen from '../screens/admin/StaffEarningsScreen';
import ProfileScreen from '../screens/shared/ProfileScreen';
import {tabScreenOptions} from './tabOptions';
import CustomerTopMenu, {adminMenuItems} from '../components/CustomerTopMenu';

const Tab = createBottomTabNavigator();

export default function AdminNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({route, navigation}) => ({
        ...tabScreenOptions,
        tabBarStyle: {display: 'none'},
        header: () => (
          <CustomerTopMenu
            navigation={navigation}
            activeRoute={route.name}
            menuItems={adminMenuItems}
            caption="Admin console"
          />
        ),
        tabBarButton: () => null
      })}>
      <Tab.Screen name="Dashboard" component={DashboardScreen} options={{title: 'Dash'}} />
      <Tab.Screen name="Salons" component={SalonCrudScreen} options={{title: 'Salons'}} />
      <Tab.Screen name="Employees" component={EmployeeCrudScreen} options={{title: 'Staff'}} />
      <Tab.Screen name="Slots" component={SlotManagementScreen} options={{title: 'Slots'}} />
      <Tab.Screen name="Bookings" component={BookingManagementScreen} options={{title: 'Books'}} />
      <Tab.Screen name="Offers" component={OffersManagementScreen} options={{title: 'Offers'}} />
      <Tab.Screen name="Content" component={ContentManagementScreen} options={{title: 'Content'}} />
      <Tab.Screen name="Analytics" component={AnalyticsScreen} options={{title: 'Data'}} />
      <Tab.Screen name="StaffEarnings" component={StaffEarningsScreen} options={{title: 'Earnings'}} />
      <Tab.Screen name="Settings" component={ProfileScreen} options={{title: 'Settings'}} />
    </Tab.Navigator>
  );
}
