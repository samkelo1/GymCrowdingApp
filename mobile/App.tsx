import React, { useState, useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import RegisterScreen from './src/screens/RegisterScreen';
import LoginScreen from './src/screens/LoginScreen';
import BookingScreen from './src/screens/BookingScreen';

export default function App() {
  const [token, setToken] = useState<string | null>(null);
  const [page, setPage] = useState<'login' | 'register' | 'booking'>('login');

  const handleRegistered = (t: string) => { setToken(t); setPage('booking'); };
  const handleLoggedIn = (t: string) => { setToken(t); setPage('booking'); };
  const handleLogout = async () => { await AsyncStorage.removeItem('token'); setToken(null); setPage('login'); };

  useEffect(() => {
    (async () => {
      try {
        const t = await AsyncStorage.getItem('token');
        if (t) {
          setToken(t);
          setPage('booking');
        }
      } catch (err) {
        // ignore
      }
    })();
  }, []);

  // persist token when it changes
  useEffect(() => {
    (async () => {
      if (token) await AsyncStorage.setItem('token', token);
    })();
  }, [token]);

  return (
    <View style={styles.container}>
      {token ? (
        <BookingScreen token={token} onLogout={handleLogout} />
      ) : page === 'login' ? (
        <LoginScreen onLoggedIn={handleLoggedIn} switchToRegister={() => setPage('register')} />
      ) : (
        <RegisterScreen onRegistered={handleRegistered} switchToLogin={() => setPage('login')} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 16 },
  title: { fontSize: 20, marginBottom: 20 },
  capacityBox: { alignItems: 'center', padding: 20, borderRadius: 8, borderWidth: 1, width: 200 },
  capacityText: { fontSize: 36, fontWeight: 'bold' }
});
