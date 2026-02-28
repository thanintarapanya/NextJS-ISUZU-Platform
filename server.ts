import { createServer } from 'http';
import { parse } from 'url';
import next from 'next';
import { Server } from 'socket.io';

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = createServer((req, res) => {
    const parsedUrl = parse(req.url!, true);
    handle(req, res, parsedUrl);
  });

  const io = new Server(server);

  io.on('connection', (socket) => {
    console.log('Client connected');

    // Simulate real-time telemetry data
    const interval = setInterval(() => {
      const timestamp = Date.now();
      const rpm = Math.floor(Math.random() * (8000 - 1000) + 1000); // 1000-8000 RPM
      const speed = Math.floor(Math.random() * (300 - 0) + 0); // 0-300 km/h
      const gear = Math.floor(Math.random() * (6 - 1) + 1); // 1-6 Gear
      const engineTemp = Math.floor(Math.random() * (120 - 80) + 80); // 80-120 C
      const tireTemp = Math.floor(Math.random() * (100 - 60) + 60); // 60-100 C
      const fuel = Math.floor(Math.random() * (100 - 0) + 0); // 0-100%
      const lapTime = Math.floor(Math.random() * (120000 - 60000) + 60000); // 60-120s

      socket.emit('telemetry', {
        timestamp,
        rpm,
        speed,
        gear,
        engineTemp,
        tireTemp,
        fuel,
        lapTime,
      });
    }, 50); // 50ms update rate (20Hz)

    socket.on('disconnect', () => {
      console.log('Client disconnected');
      clearInterval(interval);
    });
  });

  server.listen(3000, () => {
    console.log('> Ready on http://localhost:3000');
  });
});
