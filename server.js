import express from 'express';
import { createServer } from 'http';
import { parse } from 'url';
import next from 'next';
import { WebSocketServer, WebSocket } from 'ws';
import { getTelemetryUpdate, getHistory } from './server/telemetryService.js';

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();
const port = 3000;

// --- Mock Data Generation Logic ---

app.prepare().then(() => {
    const server = express();
    const httpServer = createServer(server);
    const wss = new WebSocketServer({ server: httpServer });

    // Start Simulation Loop
    setInterval(() => {
        const update = getTelemetryUpdate();
        const message = JSON.stringify(update);
        wss.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(message);
            }
        });
    }, 10); // 100Hz update rate

    wss.on('connection', (ws) => {
        console.log('Client connected');
        
        // Send initial history
        ws.send(JSON.stringify({
            type: 'HISTORY_INIT',
            data: getHistory()
        }));

        ws.on('close', () => {
            console.log('Client disconnected');
        });
    });

    server.all(/.*/, (req, res) => {
        const parsedUrl = parse(req.url, true);
        handle(req, res, parsedUrl);
    });

    httpServer.listen(port, (err) => {
        if (err) throw err;
        console.log(`> Ready on http://localhost:${port}`);
    });
});
