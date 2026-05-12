import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import HomeScreen from '../screens/customer/HomeScreen';
import SalonSearchScreen from '../screens/customer/SalonSearchScreen';
import SalonDetailsScreen from '../screens/customer/SalonDetailsScreen';
import EmployeeListScreen from '../screens/customer/EmployeeListScreen';
import AvailableSlotsScreen from '../screens/customer/AvailableSlotsScreen';
import BookNowScreen from '../screens/customer/BookNowScreen';
import MyBookingsScreen from '../screens/shared/MyBookingsScreen';
import OffersScreen from '../screens/customer/OffersScreen';
import VisitHistoryScreen from '../screens/customer/VisitHistoryScreen';
import ProfileScreen from '../screens/shared/ProfileScreen';
import FunctionBookingScreen from '../screens/customer/FunctionBookingScreen';
import ProductStoreScreen from '../screens/customer/ProductStoreScreen';
import AcademyScreen from '../screens/customer/AcademyScreen';
import {tabScreenOptions} from './tabOptions';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function BookingStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="SalonSearch" component={SalonSearchScreen} options={{title: 'Find Salon'}} />
      <Stack.Screen name="SalonDetails" component={SalonDetailsScreen} options={{title: 'Salon Details'}} />
      <Stack.Screen name="EmployeeList" component={EmployeeListScreen} options={{title: 'Choose Expert'}} />
      <Stack.Screen name="AvailableSlots" component={AvailableSlotsScreen} options={{title: 'Available Slots'}} />
      <Stack.Screen name="BookNow" component={BookNowScreen} options={{title: 'Book Now'}} />
    </Stack.Navigator>
  );
}

export default function CustomerNavigator() {
  return (
    <Tab.Navigator screenOptions={{...tabScreenOptions, headerShown: false}}>
      <Tab.Screen name="Book" component={BookingStack} options={{title: 'Book'}} />
      <Tab.Screen name="MyBookings" component={MyBookingsScreen} options={{title: 'Bookings'}} />
      <Tab.Screen name="Function" component={FunctionBookingScreen} options={{title: 'Function'}} />
      <Tab.Screen name="Products" component={ProductStoreScreen} options={{title: 'Shop'}} />
      <Tab.Screen name="Academy" component={AcademyScreen} options={{title: 'Academy'}} />
      <Tab.Screen name="Offers" component={OffersScreen} options={{title: 'Offers'}} />
      <Tab.Screen name="History" component={VisitHistoryScreen} options={{title: 'History'}} />
      <Tab.Screen name="Settings" component={ProfileScreen} options={{title: 'Settings'}} />
    </Tab.Navigator>
  );
}
