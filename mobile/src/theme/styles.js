import {StyleSheet} from 'react-native';

export const styles = StyleSheet.create({
  screen: {flex: 1, padding: 16, backgroundColor: '#070707'},
  center: {flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#070707'},
  row: {flexDirection: 'row', alignItems: 'center', gap: 12},
  gap: {gap: 12},
  card: {marginBottom: 12, borderRadius: 8, backgroundColor: '#1A1A1A'},
  input: {marginBottom: 12},
  title: {marginBottom: 8, fontWeight: '700', color: '#D8AA4C'},
  subtitle: {marginBottom: 16, color: '#B8A77D'},
  chipRow: {flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginVertical: 12}
});
