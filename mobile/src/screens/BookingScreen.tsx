import React, { useEffect, useState } from 'react';
import { SafeAreaView, ScrollView, View, Text, Button, ActivityIndicator, StyleSheet } from 'react-native';

type Props = { token: string; onLogout: () => void };

type CapacityResponse = { gymId: string; slot: string; percent: number };

export default function BookingScreen({ token, onLogout }: Props) {
  const gymId = 'gym-1';
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<CapacityResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [bookingState, setBookingState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const fetchCapacity = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`http://localhost:3000/gyms/${gymId}/capacity`);
      if (!res.ok) throw new Error(await res.text());
      const json = await res.json();
      setData(json);
    } catch (err: any) {
      setError(err.message ?? 'Unknown');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCapacity(); }, []);

  const book = async () => {
    setBookingState('loading');
    try {
      const res = await fetch(`http://localhost:3000/gyms/${gymId}/book`, {
        method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({})
      });
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt);
      }
      setBookingState('success');
      fetchCapacity();
    } catch (err) {
      setBookingState('error');
    }
  };

  return (
      <SafeAreaView style={styles.safe}>
        <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <Text style={styles.heading}>Booking</Text>
          <Button title="Logout" onPress={onLogout} />
        </View>

        {loading ? <ActivityIndicator /> : (
          <View style={styles.card}>
            <Text style={styles.percent}>{data ? `${data.percent}%` : '--'}</Text>
            <Text>Slot: {data?.slot ?? 'current'}</Text>
          </View>
        )}
        {error ? <Text style={styles.error}>{error}</Text> : null}

        <View style={styles.row}>
          <Button title={bookingState === 'loading' ? 'Booking...' : 'Book Slot'} onPress={book} disabled={bookingState === 'loading'} />
        </View>
        {bookingState === 'success' && <Text style={{ color: 'green' }}>Booked</Text>}
        {bookingState === 'error' && <Text style={{ color: 'red' }}>Booking failed</Text>}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  container: { flexGrow: 1, padding: 20, justifyContent: 'center' },
  header: { width: '100%', maxWidth: 600, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  heading: { fontSize: 18 },
  card: { width: '100%', padding: 16, borderWidth: 1, marginTop: 12, alignItems: 'center', borderRadius: 8 },
  percent: { fontSize: 36, fontWeight: '600' },
  row: { width: '100%', marginTop: 20 },
  error: { color: 'red', marginTop: 8 }
});
