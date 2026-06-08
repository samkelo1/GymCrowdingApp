import { FastifyInstance } from 'fastify';
import { AuthService } from '../services/authService';

export default async function authRoutes(fastify: FastifyInstance) {
  const auth = new AuthService();

  fastify.post('/auth/register', async (request, reply) => {
    const body = request.body as any;
    try {
      const result = await auth.register(body.username, body.password);
      return result;
    } catch (err: any) {
      reply.status(400);
      return { error: err.message };
    }
  });

  fastify.post('/auth/login', async (request, reply) => {
    const body = request.body as any;
    try {
      const result = await auth.login(body.username, body.password);
      return result;
    } catch (err: any) {
      reply.status(401);
      return { error: err.message };
    }
  });
}
