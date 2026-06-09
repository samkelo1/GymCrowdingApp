import Fastify from 'fastify';
import gymsRoutes from './routes/gyms';
import authRoutes from './routes/auth';
import { MockGymRepository } from './services/mockGymRepository';
import RedisGymRepository from './services/redisGymRepository';

const server = Fastify({ logger: true });

server.register(authRoutes);
server.register(gymsRoutes);

// Choose repository: use Redis if REDIS_URL provided, otherwise mock
const redisUrl = process.env.REDIS_URL;
let repo: any;
if (redisUrl) {
  server.log.info('Using RedisGymRepository');
  repo = new RedisGymRepository(redisUrl);
  // seed sample gym if not present
  (async () => {
    const gym = await repo.getGym('gym-1');
    if (!gym) {
      await repo.seedGym({ id: 'gym-1', maxCapacity: 5 });
    }
  })();
} else {
  server.log.info('Using MockGymRepository');
  repo = new MockGymRepository();
}

// decorate server with repo so routes can access
server.decorate('repo', repo);

const start = async () => {
  try {
    await server.listen({ port: 3000, host: '0.0.0.0' });
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

start();
