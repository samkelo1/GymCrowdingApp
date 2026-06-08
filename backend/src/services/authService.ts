import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { MockUserRepository } from './userRepository';

const JWT_SECRET = process.env.JWT_SECRET ?? 'dev-secret';

function hashPassword(password: string) {
  return crypto.createHmac('sha256', 'salt').update(password).digest('hex');
}

export class AuthService {
  constructor(private users = new MockUserRepository()) {}

  async register(username: string, password: string) {
    const existing = await this.users.findByUsername(username);
    if (existing) throw new Error('Username taken');
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    const user = { id, username, passwordHash: hashPassword(password) };
    await this.users.create(user);
    const token = jwt.sign({ sub: id, username }, JWT_SECRET, { algorithm: 'HS256', expiresIn: '7d' });
    return { token, user: { id, username } };
  }

  async login(username: string, password: string) {
    const user = await this.users.findByUsername(username);
    if (!user) throw new Error('Invalid credentials');
    if (user.passwordHash !== hashPassword(password)) throw new Error('Invalid credentials');
    const token = jwt.sign({ sub: user.id, username }, JWT_SECRET, { algorithm: 'HS256', expiresIn: '7d' });
    return { token, user: { id: user.id, username: user.username } };
  }

  verifyToken(token: string) {
    try {
      return jwt.verify(token, JWT_SECRET) as any;
    } catch (err) {
      return null;
    }
  }
}
