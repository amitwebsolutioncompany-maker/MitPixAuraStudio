import React from 'react';
import {Card, Text, Button} from 'react-native-paper';
import {styles} from '../theme/styles';
import {colors} from '../theme/theme';

export default function ResourceCard({title, subtitle, meta, actionLabel, onPress}) {
  return (
    <Card style={styles.card} mode="elevated" onPress={onPress}>
      <Card.Content>
        <Text variant="titleMedium" style={{color: colors.text, fontWeight: '800'}}>{title}</Text>
        {subtitle ? <Text style={{marginTop: 4}}>{subtitle}</Text> : null}
        {meta ? <Text style={{marginTop: 6, color: colors.success}}>{meta}</Text> : null}
      </Card.Content>
      {actionLabel ? <Card.Actions><Button onPress={onPress}>{actionLabel}</Button></Card.Actions> : null}
    </Card>
  );
}
