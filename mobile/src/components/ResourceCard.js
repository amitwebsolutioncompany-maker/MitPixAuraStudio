import React from 'react';
import {Card, Text, Button} from 'react-native-paper';
import {styles} from '../theme/styles';

export default function ResourceCard({title, subtitle, meta, actionLabel, onPress}) {
  return (
    <Card style={styles.card} mode="elevated" onPress={onPress}>
      <Card.Content>
        <Text variant="titleMedium">{title}</Text>
        {subtitle ? <Text style={{marginTop: 4}}>{subtitle}</Text> : null}
        {meta ? <Text style={{marginTop: 6, color: '#B8A77D'}}>{meta}</Text> : null}
      </Card.Content>
      {actionLabel ? <Card.Actions><Button onPress={onPress}>{actionLabel}</Button></Card.Actions> : null}
    </Card>
  );
}
