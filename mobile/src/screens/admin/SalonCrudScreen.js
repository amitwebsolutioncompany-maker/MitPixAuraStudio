import React, {useEffect, useState} from 'react';
import {Alert, StyleSheet, View} from 'react-native';
import {Button, Text} from 'react-native-paper';
import AppScreen from '../../components/AppScreen';
import FormDialog from '../../components/FormDialog';
import {salonApi} from '../../api/endpoints';
import {useAuthStore} from '../../store/authStore';
import {styles} from '../../theme/styles';
import {colors} from '../../theme/theme';

const fields = [
  {name: 'name', label: 'Name'},
  {name: 'address', label: 'Address'},
  {name: 'city', label: 'City'},
  {name: 'openingTime', label: 'Opening time HH:mm'},
  {name: 'closingTime', label: 'Closing time HH:mm'},
  {name: 'totalChairs', label: 'Total chairs', keyboardType: 'number-pad'},
];

export default function SalonCrudScreen() {
  const salonLimit = useAuthStore((state) => Number(state.user?.salonLimit || 0));
  const [items, setItems] = useState([]);
  const [visible, setVisible] = useState(false);
  const [form, setForm] = useState({openingTime: '10:00', closingTime: '22:00'});
  const [editing, setEditing] = useState(null);

  async function load() {
    const {data} = await salonApi.list();
    setItems(data.salons || []);
  }

  useEffect(() => {
    load();
  }, []);

  async function save() {
    const payload = {...form, totalChairs: Number(form.totalChairs || 1)};
    if (editing) {
      await salonApi.update(editing, payload);
    } else {
      await salonApi.create(payload);
    }
    setVisible(false);
    setEditing(null);
    setForm({openingTime: '10:00', closingTime: '22:00'});
    load();
  }

  function openEdit(salon) {
    setEditing(salon._id);
    setForm(salon);
    setVisible(true);
  }

  function openCreate() {
    if (salonLimit > 0 && items.length >= salonLimit) {
      Alert.alert(
        'Branch Limit Reached',
        'Your current luxury subscription has reached its salon branch limit. Please renew or upgrade your plan to add another branch.',
      );
      return;
    }
    setEditing(null);
    setForm({openingTime: '10:00', closingTime: '22:00'});
    setVisible(true);
  }

  return (
    <AppScreen onRefresh={load}>
      <Text variant="titleLarge" style={styles.title}>Salon branches</Text>
      <Button mode="contained" buttonColor={colors.gold} textColor={colors.ink} style={salonStyles.addButton} onPress={openCreate}>
        Add salon branch
      </Button>
      {items.map((salon) => (
        <View key={salon._id} style={salonStyles.card}>
          <View style={salonStyles.header}>
            <View style={salonStyles.monogram}>
              <Text style={salonStyles.monogramText}>{(salon.name || 'S').slice(0, 1).toUpperCase()}</Text>
            </View>
            <View style={salonStyles.titleBlock}>
              <Text style={salonStyles.name}>{salon.name}</Text>
              <Text style={salonStyles.city}>{salon.city}</Text>
            </View>
          </View>
          <Text style={salonStyles.address}>{salon.address}</Text>
          <View style={salonStyles.metaRow}>
            <Text style={salonStyles.meta}>{salon.openingTime}-{salon.closingTime}</Text>
            <Text style={salonStyles.meta}>Chairs {salon.totalChairs}</Text>
          </View>
          <Text style={salonStyles.id}>ID: {salon._id}</Text>
          <Button mode="contained-tonal" style={salonStyles.editButton} onPress={() => openEdit(salon)}>
            Edit branch
          </Button>
        </View>
      ))}
      <FormDialog
        visible={visible}
        title="Salon branch"
        fields={fields}
        values={form}
        onChange={(name, value) => setForm({...form, [name]: value})}
        onDismiss={() => setVisible(false)}
        onSubmit={save}
      />
    </AppScreen>
  );
}

const salonStyles = StyleSheet.create({
  addButton: {
    marginBottom: 14,
    borderRadius: 8,
  },
  card: {
    marginBottom: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.gold,
    padding: 14,
    backgroundColor: colors.panel,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  monogram: {
    width: 46,
    height: 46,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.gold,
  },
  monogramText: {
    color: colors.ink,
    fontSize: 20,
    fontWeight: '900',
  },
  titleBlock: {
    flex: 1,
  },
  name: {
    color: colors.text,
    fontSize: 17,
    fontWeight: '900',
  },
  city: {
    marginTop: 3,
    color: colors.successSoft,
    fontWeight: '800',
  },
  address: {
    marginTop: 12,
    color: colors.muted,
    lineHeight: 20,
  },
  metaRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
  },
  meta: {
    borderRadius: 8,
    overflow: 'hidden',
    paddingHorizontal: 10,
    paddingVertical: 6,
    color: colors.ink,
    backgroundColor: colors.softGold,
    fontWeight: '900',
  },
  id: {
    marginTop: 10,
    color: colors.muted,
    fontSize: 11,
  },
  editButton: {
    marginTop: 12,
  },
});
