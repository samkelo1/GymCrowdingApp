import { describe, it, expect } from 'vitest';
import { MockGymRepository } from '../src/services/mockGymRepository';
import { GymService } from '../src/services/gymService';

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
