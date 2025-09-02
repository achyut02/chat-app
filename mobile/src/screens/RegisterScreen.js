import React, { useState } from 'react';
import { View, TextInput, Button } from 'react-native';
import { register, setToken } from '../api/api';
import { initSocket } from '../socket/socket';

export default function RegisterScreen({ navigation }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const onRegister = async () => {
    try {
      const res = await register({ name, email, password });
      const { token, user } = res.data;
      setToken(token);
      initSocket(token);
      navigation.replace('Home', { token, user });
    } catch (err) {
      alert(err?.response?.data?.error || 'Register failed');
    }
  };

  return (
    <View style={{ padding: 16 }}>
      <TextInput placeholder="Name" value={name} onChangeText={setName} style={{borderWidth:1, marginBottom:10, padding:8}}/>
      <TextInput placeholder="Email" value={email} onChangeText={setEmail} style={{borderWidth:1, marginBottom:10, padding:8}}/>
      <TextInput placeholder="Password" secureTextEntry value={password} onChangeText={setPassword} style={{borderWidth:1, marginBottom:10, padding:8}}/>
      <Button title="Register" onPress={onRegister} />
    </View>
  );
}
