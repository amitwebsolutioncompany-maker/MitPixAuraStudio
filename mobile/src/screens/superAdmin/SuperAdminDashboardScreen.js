import React, {useEffect, useState} from 'react';
import {StyleSheet, View} from 'react-native';
import {Text} from 'react-native-paper';
import AppScreen from '../../components/AppScreen';
import EmptyState from '../../components/EmptyState';
import {superAdminApi} from '../../api/endpoints';
import {styles} from '../../theme/styles';
import {colors} from '../../theme/theme';

function Stat({label, value}) {
  return (
    <View style={dashboardStyles.stat}>
      <Text style={dashboardStyles.value}>{value}</Text>
      <Text style={dashboardStyles.label}>{label}</Text>
    </View>
  );
}

export default function SuperAdminDashboardScreen() {
  const [data, setData] = useState({});
  const [busy, setBusy] = useState(false);

  async function load() {
    setBusy(true);
    try {
      const res = await superAdminApi.dashboard();
      setData(res.data || {});
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <AppScreen refreshing={busy} onRefresh={load}>
      <Text variant="headlineSmall" style={styles.title}>Platform dashboard</Text>
      <View style={dashboardStyles.grid}>
        <Stat label="Admins" value={data.totalAdmins || 0} />
        <Stat label="Salons" value={data.totalSalons || 0} />
        <Stat label="20+ VIP customers" value={data.totalVipCustomers || 0} />
      </View>

      <Text variant="titleMedium" style={dashboardStyles.sectionTitle}>Expired-code admins</Text>
      {!data.expiredAdmins?.length ? <EmptyState title="No expired admin codes" /> : data.expiredAdmins.map((admin) => (
        <View key={admin._id} style={dashboardStyles.card}>
          <Text style={dashboardStyles.name}>{admin.name}</Text>
          <Text style={dashboardStyles.meta}>{admin.email} | {admin.phone || 'No phone'}</Text>
          <Text style={dashboardStyles.meta}>{admin.city || 'No city'} | Aadhaar {admin.aadhaarNumber || 'Not set'}</Text>
          <Text style={dashboardStyles.expired}>{admin.subscriptionPlan} expired {admin.codeExpiresAt ? new Date(admin.codeExpiresAt).toLocaleString() : 'Not set'}</Text>
        </View>
      ))}
    </AppScreen>
  );
}

const dashboardStyles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  stat: {
    width: '31%',
    minHeight: 104,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.gold,
    padding: 10,
    backgroundColor: colors.panel,
  },
  value: {
    color: colors.softGold,
    fontSize: 22,
    fontWeight: '900',
  },
  label: {
    marginTop: 8,
    color: colors.muted,
    fontWeight: '800',
  },
  sectionTitle: {
    marginTop: 22,
    marginBottom: 10,
    color: colors.text,
    fontWeight: '900',
  },
  card: {
    marginBottom: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.line,
    padding: 12,
    backgroundColor: colors.charcoal,
  },
  name: {
    color: colors.text,
    fontWeight: '900',
  },
  meta: {
    marginTop: 5,
    color: colors.muted,
  },
  expired: {
    marginTop: 8,
    color: colors.danger,
    fontWeight: '900',
  },
});
