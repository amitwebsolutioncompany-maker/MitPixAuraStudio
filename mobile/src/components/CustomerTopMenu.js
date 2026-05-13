import React from 'react';
import {SafeAreaView, ScrollView, StyleSheet, TouchableOpacity, View} from 'react-native';
import {Text} from 'react-native-paper';
import MenuIcon from './MenuIcon';
import BrandWordmark from './BrandWordmark';
import {colors} from '../theme/theme';

export const customerMenuItems = [
  {route: 'Book', label: 'Book Slot', icon: 'book'},
  {route: 'MyBookings', label: 'My Bookings', icon: 'bookings'},
  {route: 'Function', label: 'Function', icon: 'function'},
  {route: 'Products', label: 'Products', icon: 'products'},
  {route: 'Academy', label: 'Academy', icon: 'academy'},
  {route: 'WhyUs', label: 'Why Us', icon: 'why'},
  {route: 'Offers', label: 'Offers', icon: 'offers'},
  {route: 'History', label: 'History', icon: 'history'},
  {route: 'Settings', label: 'Settings', icon: 'settings'},
];

export const adminMenuItems = [
  {route: 'Dashboard', label: 'Dash', icon: 'dashboard'},
  {route: 'Salons', label: 'Salons', icon: 'salon'},
  {route: 'Employees', label: 'Staff', icon: 'staff'},
  {route: 'Bookings', label: 'Books', icon: 'bookings'},
  {route: 'Offers', label: 'Offers', icon: 'offers'},
  {route: 'Content', label: 'Content', icon: 'why'},
  {route: 'LoyalCustomers', label: '20+ VIP', icon: 'gift'},
  {route: 'StaffEarnings', label: 'Earnings', icon: 'complete'},
  {route: 'Settings', label: 'Settings', icon: 'settings'},
];

export const employeeMenuItems = [
  {route: 'TodaySlots', label: 'Slots', icon: 'slots'},
  {route: 'Complete', label: 'Booked', icon: 'bookings'},
  {route: 'Performance', label: 'Status', icon: 'analytics'},
  {route: 'Settings', label: 'Settings', icon: 'settings'},
];

export default function CustomerTopMenu({
  navigation,
  activeRoute,
  menuItems = customerMenuItems,
  title = 'MitPix Aura Studio',
  caption = 'Luxury grooming',
}) {
  return (
    <SafeAreaView style={topMenuStyles.safe}>
      <View style={topMenuStyles.brandRow}>
        {title === 'MitPix Aura Studio' ? <BrandWordmark dark /> : <Text style={topMenuStyles.brand}>{title}</Text>}
        <Text style={topMenuStyles.caption}>{caption}</Text>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={topMenuStyles.menu}>
        {menuItems.map((item) => {
          const isActive = activeRoute === item.route;
          return (
            <TouchableOpacity
              key={item.route}
              accessibilityRole="button"
              onPress={() => {
                if (item.route === 'Book') {
                  navigation.navigate('Book', {screen: 'SalonSearch'});
                  return;
                }
                navigation.navigate(item.route);
              }}
              style={[topMenuStyles.item, isActive && topMenuStyles.activeItem]}>
              <MenuIcon name={item.icon} size={17} color={colors.ink} />
              <Text style={[topMenuStyles.label, isActive && topMenuStyles.activeLabel]}>{item.label}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

const topMenuStyles = StyleSheet.create({
  safe: {
    backgroundColor: colors.success,
    borderBottomColor: colors.successSoft,
    borderBottomWidth: 1,
  },
  brandRow: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 8,
  },
  brand: {
    color: colors.ink,
    fontSize: 18,
    fontWeight: '900',
  },
  caption: {
    marginTop: 2,
    color: '#06351F',
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  menu: {
    gap: 8,
    paddingHorizontal: 12,
    paddingBottom: 12,
  },
  item: {
    minHeight: 42,
    minWidth: 92,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(7,17,13,0.25)',
    backgroundColor: 'rgba(7,17,13,0.16)',
  },
  activeItem: {
    borderColor: colors.ink,
    backgroundColor: colors.successSoft,
  },
  label: {
    color: colors.ink,
    fontSize: 12,
    fontWeight: '800',
  },
  activeLabel: {
    color: colors.ink,
  },
});
