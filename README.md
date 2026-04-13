# Smart Home Automation System

Production-ready baseline for a smart home control platform built with Next.js App Router, TypeScript, Prisma/PostgreSQL, NextAuth, MQTT, and Tailwind CSS.

## Architecture

- **Frontend**: Next.js App Router + Tailwind responsive dashboard
- **Backend**: Next.js Route Handlers (`app/api/**`)
- **Auth**: NextAuth (OAuth + Credentials) with RBAC (Owner/Member/Guest)
- **Database**: PostgreSQL via Prisma ORM
- **IoT Messaging**: MQTT publish/subscribe with retry reconnect
- **Realtime UI**: Server-Sent Events stream from backend to dashboard
- **Services**:
  - `mqtt.service.ts`: broker connection + topic parsing + publish/subscribe
  - `device-manager.service.ts`: domain logic for toggle, turn-off-all, automation

## MQTT Topic Convention

```txt
home/{homeId}/room/{roomId}/device/{deviceId}/switch/{switchId}
```

Payload:

```json
{ "state": "ON" }
```

## Data Models

- User
- Home
- Room
- Device
- Switch
- DeviceLog (bonus logging)
- NextAuth tables (Account, Session, VerificationToken)

See: `prisma/schema.prisma`.

## API Endpoints

- `POST /api/homes` – create home
- `POST /api/rooms` – add room
- `POST /api/devices` – register device
- `POST /api/switches/:switchId/toggle` – toggle switch
- `GET /api/switches/:switchId/state` – get switch state
- `POST /api/switches/off-all` – turn all switches off
- `GET /api/realtime` – live switch updates stream

## Quick Start

1. Copy env and configure:
   ```bash
   cp .env.example .env
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run migrations and generate client:
   ```bash
   npx prisma migrate dev --name init
   npm run prisma:generate
   ```
4. Optional seed:
   ```bash
   npm run db:seed
   ```
5. Start app:
   ```bash
   npm run dev
   ```

## Automation Rule (Bonus)

`runNightAutomation(homeId)` in `device-manager.service.ts` demonstrates a scheduled rule strategy to auto shut down switches at night.

## Production Notes

- Add TLS and auth at MQTT broker level.
- Move automation schedules to a worker/queue process.
- Add topic ACL per home to isolate tenants.
- Add API rate limiting and structured logging.
- Add background retries for failed device actions.
