import { describe, it, expect } from 'vitest';
import { MockGymRepository } from '../src/services/mockGymRepository';
import { GymService } from '../src/services/gymService';

describe('GymService (with MockGymRepository)', () => {
  it('returns 0% when no bookings', async () => {
    const repo = new MockGymRepository();
    const svc = new GymService(repo);
    const pct = await svc.getCapacityPercent('gym-1', 'slot-1');
    expect(pct).toBe(0);
  });

  it('books a slot and increases capacity percent', async () => {
    const repo = new MockGymRepository();
    const svc = new GymService(repo);
    const res = await svc.bookSlot('gym-1', 'slot-1', 'user-1');
    expect(res.success).toBe(true);
    const pct = await svc.getCapacityPercent('gym-1', 'slot-1');
    // MockGymRepository seeds gym-1 with maxCapacity 30
    expect(pct).toBe(Math.round((1 / 30) * 100));
  });

  it('prevents duplicate bookings by same user', async () => {
    const repo = new MockGymRepository();
    const svc = new GymService(repo);
    const r1 = await svc.bookSlot('gym-1', 'slot-dup', 'user-x');
    expect(r1.success).toBe(true);
    const r2 = await svc.bookSlot('gym-1', 'slot-dup', 'user-x');
    expect(r2.success).toBe(false);
    expect(r2.reason).toBeDefined();
  });
});

describe('GymService (with small-capacity fake repo)', () => {
  it('fails booking when gym is full', async () => {
    // create a tiny in-test repository to control capacity
    const bookings = new Map<string, Map<string, Set<string>>>();
    const repo = {
      async getGym(id: string) {
        return { id, maxCapacity: 2 };
      },
      async getSlotBookings(gymId: string, slot: string) {
        const m = bookings.get(gymId) || new Map<string, Set<string>>();
        bookings.set(gymId, m);
        return new Set(m.get(slot) ?? []);
      },
      async addBooking(gymId: string, slot: string, userId: string) {
        const m = bookings.get(gymId)!;
        let s = m.get(slot);
        if (!s) { s = new Set(); m.set(slot, s); }
        if (s.has(userId)) return false;
        s.add(userId);
        return true;
      }
    };

    const svc = new GymService(repo as any);
    const r1 = await svc.bookSlot('g', 's', 'u1');
    expect(r1.success).toBe(true);
    const r2 = await svc.bookSlot('g', 's', 'u2');
    expect(r2.success).toBe(true);
    const r3 = await svc.bookSlot('g', 's', 'u3');
    expect(r3.success).toBe(false);
    expect(r3.reason).toBe('Full');
  });
});

describe('GymService booking concurrency', () => {
  it('prevents overbooking under concurrent requests', async () => {
    const repo = new MockGymRepository();
    // create a small-capacity gym for testing
    (repo as any).gyms.set('test-gym', { id: 'test-gym', maxCapacity: 5 });
    const svc = new GymService(repo);
    const slot = '2026-06-08T18';

    const attempts = 50;
    const promises = [] as Promise<{ success: boolean; reason?: string }>[];
    for (let i = 0; i < attempts; i++) {
      const userId = 'user-' + i;
      promises.push(svc.bookSlot('test-gym', slot, userId));
    }

    const results = await Promise.all(promises);
    const successCount = results.filter((r) => r.success).length;
    expect(successCount).toBeLessThanOrEqual(5);
    expect(successCount).toBe(5);
  });
});
