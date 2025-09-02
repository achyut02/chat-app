import React, { useState } from 'react';
import { View, TextInput, Button, Text } from 'react-native';
import { login, setToken } from '../api/api';
import { initSocket } from '../socket/socket';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const onLogin = async () => {
    try {
      const res = await login({ email, password });
      const { token, user } = res.data;
      setToken(token);
      initSocket(token);
      navigation.replace('Home', { token, user });
    } catch (err) {
      alert(err?.response?.data?.error || 'Login failed');
    }
  };

  return (
    <View style={{ padding: 16 }}>
      <TextInput placeholder="Email" value={email} onChangeText={setEmail} style={{borderWidth:1, marginBottom:10, padding:8}}/>
      <TextInput placeholder="Password" secureTextEntry value={password} onChangeText={setPassword} style={{borderWidth:1, marginBottom:10, padding:8}}/>
      <Button title="Login" onPress={onLogin} />
      <Text style={{color:'blue', marginTop:10}} onPress={()=>navigation.navigate('Register')}>Register</Text>
    </View>
  );
}
