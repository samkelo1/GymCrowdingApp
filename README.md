# GymCrowdingApp

Monorepo with a Fastify TypeScript backend, Expo React Native mobile app, and AWS CDK snippet.

Folders:

- `backend/` - Fastify API + booking logic (mock DB) and tests.
- `mobile/` - Expo React Native single-screen app.
- `infra/` - AWS CDK TypeScript snippet for Lambda + API Gateway.

Quick run (development):

1. Start the backend API:

```powershell
cd backend
npm install
npm run dev
```

2. Start the Expo mobile app (in another terminal):

```powershell
cd mobile
npm install
npm start
```

Design & Architecture Decisions (concise):

- Concurrency: booking uses a per-gym async mutex (`AsyncMutex`) to serialize critical booking sections. This prevents race conditions and overbooking under high concurrent requests.
- Separation: `IGymRepository` abstracts persistence; `MockGymRepository` is an in-memory implementation. This follows clean-code architecture and enables swapping a real DB later.
- API: lightweight endpoints `/gyms/:id/capacity` and `/gyms/:id/book` keep surface area small and cacheable.

Testing:

- A Vitest unit test (`backend/test/gymService.test.ts`) simulates concurrent booking attempts to validate booking logic.

Trade-offs & Next Steps:

- Current mutex is in-process; to scale across multiple nodes, replace with distributed locking (e.g., Redis Redlock) and use optimistic counters.
- Persist bookings to a durable store (RDS/DynamoDB) with conditional writes to prevent races.

Bonus — ElastiCache usage:

- For GET `/capacity` we would cache per-gym-slot counts in ElastiCache (Redis). On each booking, update Redis counters atomically (INCR/DECR or Lua script) and set a TTL. This provides near-instant reads globally and reduces DB load. For global scale, use read replicas and geo-replicated caches with consistency windows.

