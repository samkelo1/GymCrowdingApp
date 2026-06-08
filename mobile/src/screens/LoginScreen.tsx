import React, { useState } from 'react';
import { View, Text, TextInput, Button } from 'react-native';

type Props = {
  onLoggedIn: (token: string) => void;
  switchToRegister: () => void;
};

export default function LoginScreen({ onLoggedIn, switchToRegister }: Props) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const login = async () => {
    setError(null);
    try {
      const res = await fetch('http://localhost:3000/auth/login', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username, password })
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Login failed');
      onLoggedIn(json.token);
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <View style={{ padding: 16 }}>
      <Text style={{ fontSize: 18, marginBottom: 8 }}>Login</Text>
      <TextInput placeholder="Username" value={username} onChangeText={setUsername} style={{ borderWidth: 1, padding: 8, marginBottom: 8 }} />
      <TextInput placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry style={{ borderWidth: 1, padding: 8, marginBottom: 8 }} />
      <Button title="Login" onPress={login} />
      {error ? <Text style={{ color: 'red', marginTop: 8 }}>{error}</Text> : null}
      <Button title="No account? Register" onPress={switchToRegister} />
    </View>
  );
}
