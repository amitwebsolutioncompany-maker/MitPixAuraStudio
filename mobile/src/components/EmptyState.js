import React from 'react';
import {View} from 'react-native';
import {Text} from 'react-native-paper';

export default function EmptyState({title = 'Nothing here yet', message}) {
  return (
    <View style={{paddingVertical: 32, alignItems: 'center'}}>
      <Text variant="titleMedium">{title}</Text>
      {message ? <Text style={{marginTop: 6, textAlign: 'center', color: '#B8A77D'}}>{message}</Text> : null}
    </View>
  );
}
