import React, {useCallback, useEffect, useState} from 'react';
import {StyleSheet, View} from 'react-native';
import {Button, Text} from 'react-native-paper';
import AppScreen from '../../components/AppScreen';
import EmptyState from '../../components/EmptyState';
import {superAdminApi} from '../../api/endpoints';
import {styles} from '../../theme/styles';
import {colors} from '../../theme/theme';

export default function SuperAdminDataScreen() {
  const [admins, setAdmins] = useState([]);
  const [selected, setSelected] = useState(null);
  const [data, setData] = useState(null);
  const [busy, setBusy] = useState(false);

  const loadData = useCallback(async (admin) => {
    if (!admin) return;
    setBusy(true);
    try {
      const res = await superAdminApi.adminData(admin._id);
      setData(res.data);
    } finally {
      setBusy(false);
    }
  }, []);

  const load = useCallback(async () => {
    setBusy(true);
    try {
      const res = await superAdminApi.admins();
      const loadedAdmins = res.data.admins || [];
      setAdmins(loadedAdmins);
      if (!selected && loadedAdmins[0]) {
        setSelected(loadedAdmins[0]);
      }
    } finally {
      setBusy(false);
    }
  }, [selected]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    loadData(selected);
  }, [loadData, selected]);

  return (
    <AppScreen refreshing={busy} onRefresh={load}>
      <Text variant="headlineSmall" style={styles.title}>Admin data</Text>
      <View style={dataStyles.selectorRow}>
        {admins.map((admin) => (
          <Button
            key={admin._id}
            mode={selected?._id === admin._id ? 'contained' : 'outlined'}
            buttonColor={selected?._id === admin._id ? colors.gold : undefined}
            textColor={selected?._id === admin._id ? colors.ink : colors.text}
            onPress={() => setSelected(admin)}>
            {admin.name}
          </Button>
        ))}
      </View>

      {!data ? <EmptyState title="Select an admin" /> : (
        <>
          <View style={dataStyles.card}>
            <Text style={dataStyles.name}>{data.admin?.name}</Text>
            <Text style={dataStyles.meta}>{data.admin?.email} | {data.admin?.phone || 'No phone'}</Text>
            <Text style={dataStyles.meta}>{data.admin?.city || 'No city'} | Aadhaar {data.admin?.aadhaarNumber || 'Not set'}</Text>
            <Text style={dataStyles.meta}>Code expires: {data.admin?.codeExpiresAt ? new Date(data.admin.codeExpiresAt).toLocaleString() : 'Not set'}</Text>
          </View>
          <View style={dataStyles.countRow}>
            {Object.entries(data.counts || {}).map(([key, value]) => (
              <View key={key} style={dataStyles.count}>
                <Text style={dataStyles.countValue}>{value}</Text>
                <Text style={dataStyles.countLabel}>{key}</Text>
              </View>
            ))}
          </View>
          <Text variant="titleMedium" style={dataStyles.sectionTitle}>Salons / branches</Text>
          {!data.salons?.length ? <EmptyState title="No salons for this admin" /> : data.salons.map((salon) => (
            <View key={salon._id} style={dataStyles.salon}>
              <Text style={dataStyles.name}>{salon.name}</Text>
              <Text style={dataStyles.meta}>{salon.city} | {salon.address}</Text>
            </View>
          ))}
        </>
      )}
    </AppScreen>
  );
}

const dataStyles = StyleSheet.create({
  selectorRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  card: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.gold,
    padding: 14,
    backgroundColor: colors.panel,
  },
  name: {
    color: colors.text,
    fontWeight: '900',
  },
  meta: {
    marginTop: 6,
    color: colors.muted,
  },
  countRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  count: {
    width: '48%',
    borderRadius: 8,
    padding: 12,
    backgroundColor: colors.charcoal,
  },
  countValue: {
    color: colors.softGold,
    fontSize: 20,
    fontWeight: '900',
  },
  countLabel: {
    marginTop: 4,
    color: colors.muted,
    fontWeight: '800',
    textTransform: 'capitalize',
  },
  sectionTitle: {
    marginTop: 20,
    marginBottom: 10,
    color: colors.text,
    fontWeight: '900',
  },
  salon: {
    marginBottom: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.line,
    padding: 12,
    backgroundColor: colors.charcoal,
  },
});
