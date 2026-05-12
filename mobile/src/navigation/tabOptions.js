import {colors} from '../theme/theme';

export const tabScreenOptions = {
  headerStyle: {backgroundColor: colors.ink},
  headerTintColor: colors.softGold,
  headerTitleStyle: {fontSize: 16},
  tabBarActiveTintColor: colors.text,
  tabBarInactiveTintColor: '#2D2107',
  tabBarShowIcon: false,
  tabBarStyle: {
    backgroundColor: colors.deepGold,
    borderTopColor: colors.softGold,
    borderTopWidth: 1,
    minHeight: 66,
    paddingBottom: 10,
    paddingTop: 10,
    elevation: 18,
    shadowColor: colors.gold,
    shadowOpacity: 0.22,
    shadowRadius: 12
  },
  tabBarLabelStyle: {
    fontSize: 10,
    fontWeight: '800'
  },
  tabBarItemStyle: {
    borderRadius: 8,
    marginHorizontal: 2
  }
};
