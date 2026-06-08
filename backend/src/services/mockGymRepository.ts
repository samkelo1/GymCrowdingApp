import { IGymRepository, Gym } from './IGymRepository';

export class MockGymRepository implements IGymRepository {
  private gyms = new Map<string, Gym>();
  // bookings: gymId -> slot -> Set<userId>
  private bookings = new Map<string, Map<string, Set<string>>>();

  constructor() {
    // seed a sample gym
    this.gyms.set('gym-1', { id: 'gym-1', maxCapacity: 30 });
  }

  async getGym(id: string): Promise<Gym | null> {
    return this.gyms.get(id) ?? null;
  }

  private ensureSlotMap(gymId: string): Map<string, Set<string>> {
    let m = this.bookings.get(gymId);
    if (!m) {
      m = new Map();
      this.bookings.set(gymId, m);
    }
    return m;
  }

  async getSlotBookings(gymId: string, slot: string): Promise<Set<string>> {
    const m = this.ensureSlotMap(gymId);
    return new Set(m.get(slot) ?? []);
  }

  async addBooking(gymId: string, slot: string, userId: string): Promise<boolean> {
    const m = this.ensureSlotMap(gymId);
    let s = m.get(slot);
    if (!s) {
      s = new Set();
      m.set(slot, s);
    }
    if (s.has(userId)) return false; // user already booked
    s.add(userId);
    return true;
  }
}
