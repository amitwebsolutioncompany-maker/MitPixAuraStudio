import React, {useEffect, useState} from 'react';
import {Button, Text} from 'react-native-paper';
import AppScreen from '../../components/AppScreen';
import FormDialog from '../../components/FormDialog';
import ResourceCard from '../../components/ResourceCard';
import {salonApi} from '../../api/endpoints';
import {styles} from '../../theme/styles';

const fields = [
  {name: 'name', label: 'Name'},
  {name: 'address', label: 'Address'},
  {name: 'city', label: 'City'},
  {name: 'openingTime', label: 'Opening time HH:mm'},
  {name: 'closingTime', label: 'Closing time HH:mm'},
  {name: 'totalChairs', label: 'Total chairs', keyboardType: 'number-pad'}
];

export default function SalonCrudScreen() {
  const [items, setItems] = useState([]);
  const [visible, setVisible] = useState(false);
  const [form, setForm] = useState({openingTime: '10:00', closingTime: '22:00'});
  const [editing, setEditing] = useState(null);

  async function load() {
    const {data} = await salonApi.list();
    setItems(data.salons);
  }

  useEffect(() => {
    load();
  }, []);

  async function save() {
    const payload = {...form, totalChairs: Number(form.totalChairs || 1)};
    if (editing) await salonApi.update(editing, payload);
    else await salonApi.create(payload);
    setVisible(false);
    setEditing(null);
    setForm({openingTime: '10:00', closingTime: '22:00'});
    load();
  }

  return (
    <AppScreen>
      <Text variant="titleLarge" style={styles.title}>Salons</Text>
      <Text style={styles.subtitle}>Salon ID is generated automatically after save.</Text>
      <Button mode="contained" onPress={() => setVisible(true)}>Add salon</Button>
      {items.map((salon) => (
        <ResourceCard
          key={salon._id}
          title={salon.name}
          subtitle={`${salon.address}\nID: ${salon._id}`}
          meta={`${salon.city} | ${salon.openingTime}-${salon.closingTime} | Chairs ${salon.totalChairs}`}
          actionLabel="Edit"
          onPress={() => { setEditing(salon._id); setForm(salon); setVisible(true); }}
        />
      ))}
      <FormDialog visible={visible} title="Salon" fields={fields} values={form} onChange={(name, value) => setForm({...form, [name]: value})} onDismiss={() => setVisible(false)} onSubmit={save} />
    </AppScreen>
  );
}
