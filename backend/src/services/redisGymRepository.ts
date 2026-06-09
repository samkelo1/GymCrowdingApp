import Redis from 'ioredis';
import { IGymRepository, Gym } from './IGymRepository';

const BOOKING_SET = (gymId: string, slot: string) => `gym:${gymId}:slot:${slot}:bookings`;
const GYM_HASH = (gymId: string) => `gym:${gymId}:meta`;

export class RedisGymRepository implements IGymRepository {
  private client: any;

  constructor(redisUrl?: string) {
    // ioredis constructor supports no args or a connection string
    this.client = redisUrl ? new Redis(redisUrl) : new Redis();
  }

  async getGym(gymId: string): Promise<Gym | null> {
    const data = await this.client.hgetall(GYM_HASH(gymId));
    if (!data || Object.keys(data).length === 0) return null;
    return { id: gymId, maxCapacity: Number(data.maxCapacity || '0') } as Gym;
  }

  async getSlotBookings(gymId: string, slot: string): Promise<Set<string>> {
    const key = BOOKING_SET(gymId, slot);
    const members = await this.client.smembers(key);
    return new Set(members);
  }

  // Atomically add booking using Lua script: check membership, check count, then add
  async addBooking(gymId: string, slot: string, userId: string): Promise<boolean> {
    const bookingsKey = BOOKING_SET(gymId, slot);
    const gymKey = GYM_HASH(gymId);
    // Load capacity
    const cap = await this.client.hget(gymKey, 'maxCapacity');
    const capacity = Number(cap || '0');

    const lua = `
      local bookingsKey = KEYS[1]
      local user = ARGV[1]
      local capacity = tonumber(ARGV[2])
      if redis.call('SISMEMBER', bookingsKey, user) == 1 then
        return {0, 'ALREADY'}
      end
      local count = redis.call('SCARD', bookingsKey)
      if count >= capacity then
        return {0, 'FULL'}
      end
      redis.call('SADD', bookingsKey, user)
      return {1, 'OK'}
    `;

    const res = await this.client.eval(lua, 1, bookingsKey, userId, capacity);
    // res is an array like [1,'OK'] or [0,'FULL']
    if (Array.isArray(res)) {
      return Number(res[0]) === 1;
    }
    return false;
  }

  // Utility to seed a gym metadata hash for local/dev
  async seedGym(gym: Gym): Promise<void> {
    await this.client.hset(GYM_HASH(gym.id), 'maxCapacity', String(gym.maxCapacity));
  }
}

export default RedisGymRepository;
