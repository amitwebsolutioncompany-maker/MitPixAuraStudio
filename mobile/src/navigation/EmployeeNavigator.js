import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import TodaySlotsScreen from '../screens/employee/TodaySlotsScreen';
import MyBookingsScreen from '../screens/shared/MyBookingsScreen';
import MarkOccupiedScreen from '../screens/employee/MarkOccupiedScreen';
import BreakModeScreen from '../screens/employee/BreakModeScreen';
import CompleteServiceScreen from '../screens/employee/CompleteServiceScreen';
import PerformanceScreen from '../screens/employee/PerformanceScreen';
import ProfileScreen from '../screens/shared/ProfileScreen';
import {tabScreenOptions} from './tabOptions';

const Tab = createBottomTabNavigator();

export default function EmployeeNavigator() {
  return (
    <Tab.Navigator screenOptions={tabScreenOptions}>
      <Tab.Screen name="TodaySlots" component={TodaySlotsScreen} options={{title: 'Slots'}} />
      <Tab.Screen name="MyBookings" component={MyBookingsScreen} options={{title: 'Books'}} />
      <Tab.Screen name="Occupied" component={MarkOccupiedScreen} options={{title: 'Walk-in'}} />
      <Tab.Screen name="Break" component={BreakModeScreen} options={{title: 'Break'}} />
      <Tab.Screen name="Complete" component={CompleteServiceScreen} options={{title: 'Done'}} />
      <Tab.Screen name="Performance" component={PerformanceScreen} options={{title: 'Stats'}} />
      <Tab.Screen name="Settings" component={ProfileScreen} options={{title: 'Settings'}} />
    </Tab.Navigator>
  );
}
