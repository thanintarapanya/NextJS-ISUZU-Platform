# Telemetry Dashboard - Backend Handover Guide

This application is designed to work with a real backend (e.g., NestJS + Postgres) with minimal changes.

## Environment Setup

1.  Copy `.env.example` to `.env.local` (for local development) or set these variables in your deployment environment.
2.  Set `NEXT_PUBLIC_WS_URL` to the WebSocket URL of your backend.

## Current Architecture

- **Frontend**: Next.js (React)
- **Mock Backend**: Custom Express server (`server.js`) serving the Next.js app and handling WebSockets.
- **Data Source**: `server/telemetryService.js` generates mock telemetry data.

## Switching to Real Backend

To connect the frontend to your real NestJS backend:

1.  **Environment Variables**:
    Update your `.env` (or deployment environment) with the URL of your NestJS WebSocket gateway.
    ```env
    NEXT_PUBLIC_WS_URL=wss://api.your-backend.com/telemetry
    ```
    If this variable is set, the frontend will connect to this URL instead of the local mock server.

2.  **Data Contract**:
    Ensure your NestJS WebSocket gateway emits messages in the following format:

    **Telemetry Update:**
    ```json
    {
      "type": "TELEMETRY_UPDATE",
      "timestamp": 1678900000000,
      "mainCar": {
        "speed": 200,
        "rpm": 12000,
        "throttle": 100,
        "brake": 0,
        "gear": 4,
        "lapProgress": 45.5,
        // ... other telemetry fields
      },
      "allCars": [
        { "id": 1, "number": "44", "speed": 200, "lap": 16, "distance": 1200 },
        // ... other cars
      ]
    }
    ```

    **History Initialization (Optional):**
    When a client connects, you can send the recent history:
    ```json
    {
      "type": "HISTORY_INIT",
      "data": [ ...array of past mainCar objects... ]
    }
    ```

## Replacing Mock Data Logic

If you want to keep the current Node.js server but replace the *source* of the data (e.g., fetch from Postgres instead of random generation):

1.  Open `server/telemetryService.js`.
2.  Replace `generateTelemetryUpdate` with your database query logic.
3.  Use a library like `pg` or `typeorm` to connect to your Postgres database.

Example concept:
```javascript
// server/telemetryService.js
import { Client } from 'pg';
const client = new Client({ ... });
await client.connect();

export const getTelemetryUpdate = async () => {
    const res = await client.query('SELECT * FROM telemetry_live ORDER BY time DESC LIMIT 1');
    return res.rows[0];
};
```

## NestJS Implementation Tip

In your NestJS application, you would typically use a `WebSocketGateway` to broadcast these updates.

```typescript
@WebSocketGateway()
export class TelemetryGateway {
  @WebSocketServer()
  server: Server;

  // Poll database or receive events from a message queue
  @Interval(100)
  async handleInterval() {
    const data = await this.telemetryService.getLatestData();
    this.server.emit('message', { type: 'TELEMETRY_UPDATE', ...data });
  }
}
```
