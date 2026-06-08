import React, { useEffect, useState } from 'react';
import { View, Text, Button, ActivityIndicator } from 'react-native';

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
    <View style={{ padding: 16 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <Text style={{ fontSize: 18 }}>Booking</Text>
        <Button title="Logout" onPress={onLogout} />
      </View>

      {loading ? <ActivityIndicator /> : (
        <View style={{ padding: 16, borderWidth: 1, marginTop: 12 }}>
          <Text style={{ fontSize: 28 }}>{data ? `${data.percent}%` : '--'}</Text>
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
