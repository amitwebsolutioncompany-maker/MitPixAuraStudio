import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import SuperAdminDashboardScreen from '../screens/superAdmin/SuperAdminDashboardScreen';
import SuperAdminAdminsScreen from '../screens/superAdmin/SuperAdminAdminsScreen';
import SuperAdminDataScreen from '../screens/superAdmin/SuperAdminDataScreen';
import SuperAdminSubscriptionsScreen from '../screens/superAdmin/SuperAdminSubscriptionsScreen';
import SuperAdminLoyalCustomersScreen from '../screens/superAdmin/SuperAdminLoyalCustomersScreen';
import OffersManagementScreen from '../screens/admin/OffersManagementScreen';
import ContentManagementScreen from '../screens/admin/ContentManagementScreen';
import ProfileScreen from '../screens/shared/ProfileScreen';
import {tabScreenOptions} from './tabOptions';
import CustomerTopMenu, {superAdminMenuItems} from '../components/CustomerTopMenu';

const Tab = createBottomTabNavigator();

function SuperHeader({navigation, route}) {
  return (
    <CustomerTopMenu
      navigation={navigation}
      activeRoute={route.name}
      menuItems={superAdminMenuItems}
      caption="Super admin console"
    />
  );
}

const screenOptions = {
  ...tabScreenOptions,
  tabBarStyle: {display: 'none'},
  header: SuperHeader,
  tabBarButton: () => null,
};

export default function SuperAdminNavigator() {
  return (
    <Tab.Navigator screenOptions={screenOptions}>
      <Tab.Screen name="SuperDashboard" component={SuperAdminDashboardScreen} options={{title: 'Dash'}} />
      <Tab.Screen name="SuperAdmins" component={SuperAdminAdminsScreen} options={{title: 'Admins'}} />
      <Tab.Screen name="AdminData" component={SuperAdminDataScreen} options={{title: 'Data'}} />
      <Tab.Screen name="Subscriptions" component={SuperAdminSubscriptionsScreen} options={{title: 'Plans'}} />
      <Tab.Screen name="GlobalLoyalCustomers" component={SuperAdminLoyalCustomersScreen} options={{title: '20+ VIP'}} />
      <Tab.Screen name="SuperOffers" component={OffersManagementScreen} options={{title: 'Offers'}} />
      <Tab.Screen name="SuperContent" component={ContentManagementScreen} options={{title: 'Content'}} />
      <Tab.Screen name="SuperSettings" component={ProfileScreen} options={{title: 'Settings'}} />
    </Tab.Navigator>
  );
}
