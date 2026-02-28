
// Mock Telemetry Service
// This service mimics a real data source (e.g., Postgres, Redis, or IoT Hub).
// In a real NestJS application, this would be a @Injectable() service.

const MAX_HISTORY = 600;
const historyBuffer = [];

// Simulation State
let tick = 0;
let lastPoint = {
    lapProgress: 0,
    fuel: 98,
};

// Helper to format time
const getTimestamp = () => {
    const d = new Date();
    return d.toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
};

const generateTelemetryUpdate = () => {
    tick += 0.01;
    const t = tick;
    const now = Date.now();
    const timeString = getTimestamp();

    // --- Main Car Physics (Engineering View) ---
    // Simulating physics for G-Force
    const steering = Math.sin(t * 0.8) * 90;
    const speed = 180 + Math.sin(t * 0.3) * 60 + (Math.random() * 2);
    const throttle = Math.max(0, Math.cos(t * 0.5) * 100);
    const brake = Math.max(0, -Math.cos(t * 0.5) * 80);

    const gLat = (steering / 90) * (speed / 100) * 1.5 + (Math.random() * 0.1 - 0.05);
    const gLong = (throttle / 100) * 0.8 - (brake / 100) * 1.2 + (Math.random() * 0.1 - 0.05);
    const heading = (Math.abs(Math.sin(t * 0.1)) * 360);

    const mainCarUpdate = {
        timestamp: timeString,
        originalTime: now,
        heartRate: 135 + Math.sin(t * 0.5) * 10 + (Math.random() * 2),
        breath: 16 + Math.sin(t * 0.8) * 2 + (Math.random() * 0.5),
        stress: 50 + Math.sin(t * 0.2) * 15 + (Math.random() * 2),
        lapProgress: (lastPoint.lapProgress + 0.05) % 100, 
        steering, 
        throttle,
        brake,
        gLat,
        gLong,
        heading,
        rpm: 4000 + Math.abs(Math.sin(t * 1.5)) * 3000 + (Math.random() * 100),
        speed,
        oilTemp: 110 + Math.sin(t * 0.1) * 5,
        lambda: 0.98 + Math.sin(t * 0.2) * 0.03 + (Math.random() * 0.01),
        airTemp: 38.5 + (Math.sin(t * 0.05) * 0.5),
        humidity: 75 + Math.sin(t * 0.1) * 2,
        windSpeed: 12 + Math.sin(t * 0.05) * 5,
        pressure: 1013 + Math.sin(t * 0.01) * 1,
        windDir: 'NE',
        fuel: Math.max(0, lastPoint.fuel ? lastPoint.fuel - 0.005 : 98),
        flTemp: 104 + Math.sin(t * 0.1) * 5,
        frTemp: 105 + Math.cos(t * 0.12) * 5,
        rlTemp: 113 + Math.sin(t * 0.15) * 4,
        rrTemp: 115 + Math.cos(t * 0.18) * 4,
        flPress: 1.2, frPress: 1.1, rlPress: 1.2, rrPress: 1.3,
        flBrake: Math.max(200, 650 + Math.sin(t*0.5)*300),
        frBrake: Math.max(200, 500 + Math.sin(t*0.55)*250),
        rlBrake: Math.max(200, 765 + Math.sin(t*0.45)*200),
        rrBrake: Math.max(200, 725 + Math.sin(t*0.48)*200),
    };

    lastPoint = mainCarUpdate;

    // --- All Cars Telemetry (Director View) ---
    // Generate for 2 cars (as per initial state in App.tsx) or more
    // The App.tsx has 2 cars initially, but DirectorGraph uses a generator for more.
    // Let's generate for a reasonable number of cars, say 20, to match DirectorGraph logic.
    const allCarsTelemetry = Array.from({ length: 20 }, (_, i) => {
        const carId = i + 1;
        const carT = t + (carId * 100);
        return {
            id: carId,
            number: `${carId + 3}`, // Mock number
            lap: 16,
            speed: Math.max(0, 200 + Math.sin(carT * 0.1) * 50 + (Math.random() * 5)),
            rpm: Math.max(0, 10000 + Math.sin(carT * 0.2) * 2000),
            fuelFlow: Math.max(0, 90 + Math.random() * 10),
            lambda: 0.98 + Math.random() * 0.04,
            airflow: Math.max(0, 400 + Math.random() * 50),
            distance: (tick * 50) % 5000,
        };
    });

    return {
        type: 'TELEMETRY_UPDATE',
        timestamp: now,
        mainCar: mainCarUpdate,
        allCars: allCarsTelemetry
    };
};

export const getTelemetryUpdate = () => {
    const update = generateTelemetryUpdate();
    
    // Maintain history buffer
    historyBuffer.push(update.mainCar);
    if (historyBuffer.length > MAX_HISTORY) {
        historyBuffer.shift();
    }

    return update;
};

export const getHistory = () => {
    return historyBuffer;
};
