export interface User {
  id: string;
  username: string;
  passwordHash: string;
}

export class MockUserRepository {
  private users = new Map<string, User>();

  async findByUsername(username: string): Promise<User | null> {
    for (const u of this.users.values()) if (u.username === username) return u;
    return null;
  }

  async create(user: User): Promise<void> {
    this.users.set(user.id, user);
  }

  async getById(id: string): Promise<User | null> {
    return this.users.get(id) ?? null;
  }
}
