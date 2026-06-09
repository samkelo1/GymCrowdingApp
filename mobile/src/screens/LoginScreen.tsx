import React, { useState } from 'react';
import { SafeAreaView, ScrollView, KeyboardAvoidingView, Platform, View, Text, TextInput, Button, StyleSheet } from 'react-native';
import { ActivityIndicator } from 'react-native';

type Props = {
  onLoggedIn: (token: string) => void;
  switchToRegister: () => void;
};

export default function LoginScreen({ onLoggedIn, switchToRegister }: Props) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

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
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <Text style={styles.title}>Login</Text>
          <TextInput placeholder="Username" value={username} onChangeText={setUsername} style={styles.input} />
          <TextInput placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry style={styles.input} />
          <View style={styles.row}><Button title={loading ? 'Logging in...' : 'Login'} onPress={login} disabled={loading} /></View>
          {loading && <ActivityIndicator style={{ marginTop: 8 }} />}
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <View style={styles.row}><Button title="No account? Register" onPress={switchToRegister} /></View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  flex: { flex: 1 },
  container: { flexGrow: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  title: { fontSize: 20, marginBottom: 12 },
  input: { width: '100%', maxWidth: 420, borderWidth: 1, padding: 10, marginBottom: 12, borderRadius: 6 },
  row: { width: '100%', maxWidth: 420, marginBottom: 8 },
  error: { color: 'red', marginTop: 8 }
});
