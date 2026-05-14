import React, {useState} from 'react';
import {TextInput} from 'react-native-paper';

export default function PasswordInput(props) {
  const [visible, setVisible] = useState(false);

  return (
    <TextInput
      {...props}
      secureTextEntry={!visible}
      right={
        <TextInput.Icon
          icon={visible ? 'eye-off' : 'eye'}
          onPress={() => setVisible((current) => !current)}
          forceTextInputFocus={false}
        />
      }
    />
  );
}
