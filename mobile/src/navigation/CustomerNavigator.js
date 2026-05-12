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
import WhyChooseUsScreen from '../screens/customer/WhyChooseUsScreen';
import {tabScreenOptions} from './tabOptions';
import CustomerTopMenu, {customerMenuItems} from '../components/CustomerTopMenu';
import MenuIcon from '../components/MenuIcon';
import BottomPromoTicker from '../components/BottomPromoTicker';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const iconByRoute = customerMenuItems.reduce((icons, item) => ({...icons, [item.route]: item.icon}), {});

function BookingStack() {
  return (
    <Stack.Navigator initialRouteName="SalonSearch" screenOptions={{headerShown: false}}>
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
    <Tab.Navigator
      tabBar={() => <BottomPromoTicker />}
      screenOptions={({route, navigation}) => ({
        ...tabScreenOptions,
        header: () => <CustomerTopMenu navigation={navigation} activeRoute={route.name} />,
        tabBarIcon: ({color, size}) => <MenuIcon name={iconByRoute[route.name]} color={color} size={size || 20} />,
        tabBarButton: () => null
      })}>
      <Tab.Screen name="Book" component={BookingStack} options={{title: 'Book Slot'}} />
      <Tab.Screen name="MyBookings" component={MyBookingsScreen} options={{title: 'Bookings'}} />
      <Tab.Screen name="Function" component={FunctionBookingScreen} options={{title: 'Function'}} />
      <Tab.Screen name="Products" component={ProductStoreScreen} options={{title: 'Products'}} />
      <Tab.Screen name="Academy" component={AcademyScreen} options={{title: 'Academy'}} />
      <Tab.Screen name="WhyUs" component={WhyChooseUsScreen} options={{title: 'Why Us'}} />
      <Tab.Screen name="Offers" component={OffersScreen} options={{title: 'Offers'}} />
      <Tab.Screen name="History" component={VisitHistoryScreen} options={{title: 'History'}} />
      <Tab.Screen name="Settings" component={ProfileScreen} options={{title: 'Settings'}} />
    </Tab.Navigator>
  );
}
