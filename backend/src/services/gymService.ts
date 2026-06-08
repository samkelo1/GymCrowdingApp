import { IGymRepository } from './IGymRepository';
import { AsyncMutex } from '../utils/asyncMutex';

export class GymService {
  constructor(private repo: IGymRepository, private mutex = new AsyncMutex()) {}

  // slot is an opaque string (e.g., ISO hour)
  async getCapacityPercent(gymId: string, slot: string): Promise<number> {
    const gym = await this.repo.getGym(gymId);
    if (!gym) throw new Error('Gym not found');
    const bookings = await this.repo.getSlotBookings(gymId, slot);
    return Math.min(100, Math.round((bookings.size / gym.maxCapacity) * 100));
  }

  // Ensures no overbooking with a per-gym mutex
  async bookSlot(gymId: string, slot: string, userId: string): Promise<{ success: boolean; reason?: string }> {
    const gym = await this.repo.getGym(gymId);
    if (!gym) return { success: false, reason: 'Gym not found' };

    return this.mutex.runExclusive(gymId, async () => {
      const bookings = await this.repo.getSlotBookings(gymId, slot);
      if (bookings.has(userId)) return { success: false, reason: 'User already booked' };
      if (bookings.size >= gym.maxCapacity) return { success: false, reason: 'Full' };
      const ok = await this.repo.addBooking(gymId, slot, userId);
      return ok ? { success: true } : { success: false, reason: 'Conflict' };
    });
  }
}
