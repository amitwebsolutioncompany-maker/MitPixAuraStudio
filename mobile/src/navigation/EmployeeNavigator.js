import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import TodaySlotsScreen from '../screens/employee/TodaySlotsScreen';
import CompleteServiceScreen from '../screens/employee/CompleteServiceScreen';
import PerformanceScreen from '../screens/employee/PerformanceScreen';
import ProfileScreen from '../screens/shared/ProfileScreen';
import {tabScreenOptions} from './tabOptions';
import CustomerTopMenu, {employeeMenuItems} from '../components/CustomerTopMenu';
import BottomPromoTicker from '../components/BottomPromoTicker';

const Tab = createBottomTabNavigator();

export default function EmployeeNavigator() {
  return (
    <Tab.Navigator
      tabBar={() => <BottomPromoTicker />}
      screenOptions={({route, navigation}) => ({
        ...tabScreenOptions,
        header: () => (
          <CustomerTopMenu
            navigation={navigation}
            activeRoute={route.name}
            menuItems={employeeMenuItems}
            caption="Staff workspace"
          />
        ),
        tabBarButton: () => null
      })}>
      <Tab.Screen name="TodaySlots" component={TodaySlotsScreen} options={{title: 'Slots'}} />
      <Tab.Screen name="Complete" component={CompleteServiceScreen} options={{title: 'Booked'}} />
      <Tab.Screen name="Performance" component={PerformanceScreen} options={{title: 'Status'}} />
      <Tab.Screen name="Settings" component={ProfileScreen} options={{title: 'Settings'}} />
    </Tab.Navigator>
  );
}
