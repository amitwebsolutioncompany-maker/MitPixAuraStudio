import React, {useCallback, useEffect, useState} from 'react';
import {StyleSheet, View} from 'react-native';
import {Button, Text} from 'react-native-paper';
import AppScreen from '../../components/AppScreen';
import {analyticsApi, bookingApi} from '../../api/endpoints';
import {useAuthStore} from '../../store/authStore';
import {styles} from '../../theme/styles';
import {colors} from '../../theme/theme';

function Money({value}) {
  return <Text style={dashboardStyles.money}>Rs {value || 0}</Text>;
}

function StatCard({title, value, detail}) {
  return (
    <View style={dashboardStyles.statCard}>
      <Text style={dashboardStyles.statLabel}>{title}</Text>
      <Text style={dashboardStyles.statValue}>{value}</Text>
      {detail ? <Text style={dashboardStyles.statDetail}>{detail}</Text> : null}
    </View>
  );
}

export default function DashboardScreen() {
  const [stats, setStats] = useState({});
  const [reward, setReward] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const logout = useAuthStore((state) => state.logout);

  const load = useCallback(async () => {
    setRefreshing(true);
    try {
      const [dashboardRes, rewardRes] = await Promise.all([
        analyticsApi.dashboard(),
        bookingApi.monthlyRewards(),
      ]);
      setStats(dashboardRes.data);
      setReward(rewardRes.data);
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <AppScreen refreshing={refreshing} onRefresh={load}>
      <Text variant="headlineSmall" style={styles.title}>Admin dashboard</Text>
      <View style={dashboardStyles.grid}>
        <StatCard title="Total salons" value={stats.salons || 0} detail="Active branches" />
        <StatCard title="Total staff" value={stats.employees || 0} detail="Active employees" />
        <StatCard
          title="Monthly gift winner"
          value={reward?.paymentWinner?.name || 'No winner'}
          detail={reward?.paymentWinner ? `Rs ${reward.paymentWinner.paid || 0} | ${reward.month}` : 'Highest paid customer'}
        />
        <StatCard title="Active offers" value={stats.offers || 0} detail="Global customer offers" />
      </View>

      <Text variant="titleMedium" style={dashboardStyles.sectionTitle}>Salon service report</Text>
      {(stats.salonPerformance || []).map((item) => (
        <View key={item.salon?._id} style={dashboardStyles.salonCard}>
          <View style={dashboardStyles.salonHeader}>
            <View>
              <Text style={dashboardStyles.salonName}>{item.salon?.name || 'Salon'}</Text>
              <Text style={dashboardStyles.salonMeta}>{item.salon?.city || ''}</Text>
            </View>
            <Text style={dashboardStyles.badge}>Today</Text>
          </View>
          <View style={dashboardStyles.metricRow}>
            <View style={dashboardStyles.metricBox}>
              <Text style={dashboardStyles.statLabel}>Current day services</Text>
              <Text style={dashboardStyles.statValue}>{item.today?.services || 0}</Text>
              <Money value={item.today?.totalPaid} />
            </View>
            <View style={dashboardStyles.metricBox}>
              <Text style={dashboardStyles.statLabel}>Till admin close</Text>
              <Text style={dashboardStyles.statValue}>{item.period?.services || 0}</Text>
              <Money value={item.period?.totalPaid} />
            </View>
          </View>
        </View>
      ))}
      <Button mode="contained-tonal" style={dashboardStyles.logout} onPress={logout}>Logout</Button>
    </AppScreen>
  );
}

const dashboardStyles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  statCard: {
    width: '48%',
    minHeight: 132,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.gold,
    padding: 12,
    backgroundColor: colors.panel,
  },
  statLabel: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: '800',
  },
  statValue: {
    marginTop: 8,
    color: colors.softGold,
    fontSize: 20,
    fontWeight: '900',
  },
  statDetail: {
    marginTop: 8,
    color: colors.text,
    fontWeight: '700',
  },
  sectionTitle: {
    marginTop: 22,
    marginBottom: 10,
    color: colors.text,
    fontWeight: '900',
  },
  salonCard: {
    marginBottom: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.line,
    padding: 14,
    backgroundColor: colors.charcoal,
  },
  salonHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  salonName: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '900',
  },
  salonMeta: {
    marginTop: 3,
    color: colors.muted,
  },
  badge: {
    alignSelf: 'flex-start',
    borderRadius: 8,
    overflow: 'hidden',
    paddingHorizontal: 10,
    paddingVertical: 5,
    color: colors.ink,
    backgroundColor: colors.gold,
    fontWeight: '900',
  },
  metricRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
  },
  metricBox: {
    flex: 1,
    borderRadius: 8,
    padding: 10,
    backgroundColor: colors.panel,
  },
  money: {
    marginTop: 5,
    color: colors.successSoft,
    fontWeight: '900',
  },
  logout: {
    marginTop: 8,
  },
});
