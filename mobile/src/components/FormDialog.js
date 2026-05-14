import React from 'react';
import {Portal, Dialog, TextInput, Button} from 'react-native-paper';
import PasswordInput from './PasswordInput';

export default function FormDialog({visible, title, fields, values, onChange, onDismiss, onSubmit, busy}) {
  return (
    <Portal>
      <Dialog visible={visible} onDismiss={onDismiss}>
        <Dialog.Title>{title}</Dialog.Title>
        <Dialog.Content>
          {fields.map((field) => {
            const Input = field.secure ? PasswordInput : TextInput;
            return (
              <Input
                key={field.name}
                label={field.label}
                value={String(values[field.name] || '')}
                keyboardType={field.keyboardType}
                onChangeText={(value) => onChange(field.name, value)}
                style={{marginBottom: 10}}
              />
            );
          })}
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={onDismiss}>Cancel</Button>
          <Button loading={busy} onPress={onSubmit}>Save</Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
}
