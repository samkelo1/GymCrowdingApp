import React, { useState } from 'react';
import { View, Text, TextInput, Button } from 'react-native';

type Props = {
  onRegistered: (token: string) => void;
  switchToLogin: () => void;
};

export default function RegisterScreen({ onRegistered, switchToLogin }: Props) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const register = async () => {
    setError(null);
    try {
      const res = await fetch('http://localhost:3000/auth/register', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username, password })
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Register failed');
      onRegistered(json.token);
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <View style={{ padding: 16 }}>
      <Text style={{ fontSize: 18, marginBottom: 8 }}>Register</Text>
      <TextInput placeholder="Username" value={username} onChangeText={setUsername} style={{ borderWidth: 1, padding: 8, marginBottom: 8 }} />
      <TextInput placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry style={{ borderWidth: 1, padding: 8, marginBottom: 8 }} />
      <Button title="Register" onPress={register} />
      {error ? <Text style={{ color: 'red', marginTop: 8 }}>{error}</Text> : null}
      <Button title="Have an account? Login" onPress={switchToLogin} />
    </View>
  );
}
