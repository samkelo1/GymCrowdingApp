import Fastify from 'fastify';
import gymsRoutes from './routes/gyms';
import authRoutes from './routes/auth';

const server = Fastify({ logger: true });

server.register(authRoutes);
server.register(gymsRoutes);

const start = async () => {
  try {
    await server.listen({ port: 3000, host: '0.0.0.0' });
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

start();
