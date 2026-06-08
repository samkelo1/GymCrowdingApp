import Fastify from 'fastify';
import gymsRoutes from './routes/gyms';

const server = Fastify({ logger: true });

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
