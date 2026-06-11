export interface User {
  id: string;
  username: string;
  passwordHash: string;
}

import crypto from 'crypto';

function hashPassword(password: string) {
  return crypto.createHmac('sha256', 'salt').update(password).digest('hex');
}

export class MockUserRepository {
  private users = new Map<string, User>();

  constructor() {
    // create a default test user for convenience (username: test, password: testpass)
    const id = 'user-test-1';
    const user: User = { id, username: 'test', passwordHash: hashPassword('testpass') };
    this.users.set(id, user);
  }

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
