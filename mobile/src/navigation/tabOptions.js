import {colors} from '../theme/theme';

export const tabScreenOptions = {
  headerStyle: {backgroundColor: colors.success},
  headerTintColor: colors.ink,
  headerTitleStyle: {fontSize: 16},
  tabBarActiveTintColor: colors.text,
  tabBarInactiveTintColor: '#06351F',
  tabBarShowIcon: true,
  tabBarStyle: {
    backgroundColor: colors.success,
    borderTopColor: colors.successSoft,
    borderTopWidth: 1,
    minHeight: 74,
    paddingBottom: 10,
    paddingTop: 8,
    elevation: 18,
    shadowColor: colors.gold,
    shadowOpacity: 0.22,
    shadowRadius: 12
  },
  tabBarLabelStyle: {
    fontSize: 11,
    fontWeight: '800'
  },
  tabBarItemStyle: {
    borderRadius: 8,
    marginHorizontal: 2
  }
};
