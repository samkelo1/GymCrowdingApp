import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, Button, ActivityIndicator } from 'react-native';

type CapacityResponse = { gymId: string; slot: string; percent: number };

function useGymCapacity(gymId: string, slot?: string) {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<CapacityResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchCapacity = async () => {
    setLoading(true);
    setError(null);
    try {
      const q = slot ? `?slot=${encodeURIComponent(slot)}` : '';
      const res = await fetch(`http://localhost:3000/gyms/${gymId}/capacity${q}`);
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

  return { loading, data, error, refresh: fetchCapacity };
}

export default function App() {
  const gymId = 'gym-1';
  const { loading, data, error, refresh } = useGymCapacity(gymId);
  const [bookingState, setBookingState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const book = async () => {
    setBookingState('loading');
    try {
      const res = await fetch(`http://localhost:3000/gyms/${gymId}/book`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: 'mobile-user-1' }),
      });
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt);
      }
      setBookingState('success');
      refresh();
    } catch (err) {
      setBookingState('error');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Gym Live Capacity</Text>
      {loading ? <ActivityIndicator /> : (
        <View style={styles.capacityBox}>
          <Text style={styles.capacityText}>{data ? `${data.percent}%` : '--'}</Text>
          <Text>Slot: {data?.slot ?? 'current'}</Text>
        </View>
      )}
      {error ? <Text style={{ color: 'red' }}>{error}</Text> : null}

      <View style={{ marginTop: 20 }}>
        <Button title={bookingState === 'loading' ? 'Booking...' : 'Book Slot'} onPress={book} disabled={bookingState === 'loading'} />
        {bookingState === 'success' && <Text style={{ color: 'green' }}>Booked</Text>}
        {bookingState === 'error' && <Text style={{ color: 'red' }}>Booking failed</Text>}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 16 },
  title: { fontSize: 20, marginBottom: 20 },
  capacityBox: { alignItems: 'center', padding: 20, borderRadius: 8, borderWidth: 1, width: 200 },
  capacityText: { fontSize: 36, fontWeight: 'bold' }
});
