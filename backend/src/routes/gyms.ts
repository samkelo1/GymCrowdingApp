import { FastifyInstance } from 'fastify';
import { GymService } from '../services/gymService';
import { MockGymRepository } from '../services/mockGymRepository';
import { AuthService } from '../services/authService';

export default async function gymsRoutes(fastify: FastifyInstance) {
  const repo = new MockGymRepository();
  const service = new GymService(repo);
  const auth = new AuthService();

  fastify.get('/gyms/:id/capacity', async (request, reply) => {
    const gymId = (request.params as any).id as string;
    const slot = (request.query as any).slot ?? new Date().toISOString().slice(0, 13); // hour bucket
    try {
      const pct = await service.getCapacityPercent(gymId, slot);
      return { gymId, slot, percent: pct };
    } catch (err: any) {
      reply.status(404);
      return { error: err.message };
    }
  });

  fastify.post('/gyms/:id/book', async (request, reply) => {
    const gymId = (request.params as any).id as string;
    const body = request.body as any;
    const slot = body?.slot ?? new Date().toISOString().slice(0, 13);

    const authHeader = (request.headers as any).authorization as string | undefined;
    if (!authHeader?.startsWith('Bearer ')) {
      reply.status(401);
      return { success: false, reason: 'Unauthorized' };
    }
    const token = authHeader.split(' ')[1];
    const payload = auth.verifyToken(token);
    if (!payload) {
      reply.status(401);
      return { success: false, reason: 'Invalid token' };
    }
    const userId = payload.sub as string;

    const result = await service.bookSlot(gymId, slot, userId);
    if (!result.success) {
      reply.status(409);
      return { success: false, reason: result.reason };
    }
    return { success: true };
  });
}
