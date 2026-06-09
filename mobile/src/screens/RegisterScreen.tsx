import React, { useState } from 'react';
import { SafeAreaView, ScrollView, KeyboardAvoidingView, Platform, View, Text, TextInput, StyleSheet, ActivityIndicator } from 'react-native';
import FullWidthButton from '../components/FullWidthButton';

type Props = {
  onRegistered: (token: string) => void;
  switchToLogin: () => void;
};

export default function RegisterScreen({ onRegistered, switchToLogin }: Props) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const register = async () => {
    setError(null);
    setLoading(true);
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
    finally { setLoading(false); }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <Text style={styles.title}>Register</Text>
          <TextInput placeholder="Username" value={username} onChangeText={setUsername} style={styles.input} autoCapitalize="none" returnKeyType="next" />
          <TextInput placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry style={styles.input} returnKeyType="done" />
          <View style={styles.row}><FullWidthButton title={loading ? 'Registering...' : 'Register'} onPress={register} disabled={loading} /></View>
          {loading && <ActivityIndicator style={{ marginTop: 8 }} />}
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <View style={styles.row}><FullWidthButton title="Have an account? Login" onPress={switchToLogin} /></View>
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
  input: { width: '100%', maxWidth: 420, borderWidth: 1, padding: 12, marginBottom: 12, borderRadius: 8 },
  row: { width: '100%', maxWidth: 420, marginBottom: 8 },
  error: { color: 'red', marginTop: 8 }
});
