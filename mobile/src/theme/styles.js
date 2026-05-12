import {StyleSheet} from 'react-native';

export const styles = StyleSheet.create({
  screen: {flex: 1, padding: 16, backgroundColor: '#07110D'},
  center: {flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#07110D'},
  row: {flexDirection: 'row', alignItems: 'center', gap: 12},
  gap: {gap: 12},
  card: {marginBottom: 12, borderRadius: 8, backgroundColor: '#14251D'},
  input: {marginBottom: 12},
  title: {marginBottom: 8, fontWeight: '800', color: '#20C878'},
  subtitle: {marginBottom: 16, color: '#A8C7B6'},
  chipRow: {flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginVertical: 12}
});
