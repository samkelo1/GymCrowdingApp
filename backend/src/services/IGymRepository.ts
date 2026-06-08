export interface Gym {
  id: string;
  maxCapacity: number;
}

export interface IGymRepository {
  getGym(id: string): Promise<Gym | null>;
  getSlotBookings(gymId: string, slot: string): Promise<Set<string>>;
  addBooking(gymId: string, slot: string, userId: string): Promise<boolean>;
}
