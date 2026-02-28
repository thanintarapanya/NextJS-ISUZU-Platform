
// Mock Telemetry Service
// This service mimics a real data source (e.g., Postgres, Redis, or IoT Hub).
// In a real NestJS application, this would be a @Injectable() service.

const MAX_HISTORY = 600;
const historyBuffer = [];

// Simulation State
let tick = 0;
let carState = {
    distance: 0,
    speed: 0, // km/h
    rpm: 1000,
    gear: 1,
    fuel: 98,
    lap: 1,
    lapTime: 0,
    lastLapTime: 0,
    sector1: 0,
    sector2: 0,
    sector3: 0,
};

// Track Definition (Simple Circuit)
// Type: 'straight' | 'corner'
// Length: meters
// TargetSpeed: km/h (for corners)
const TRACK_MAP = [
    { type: 'straight', length: 800 },
    { type: 'corner', length: 200, targetSpeed: 120, radius: 50 },
    { type: 'straight', length: 400 },
    { type: 'corner', length: 150, targetSpeed: 90, radius: 30 },
    { type: 'straight', length: 600 },
    { type: 'corner', length: 300, targetSpeed: 160, radius: 100 },
    { type: 'straight', length: 1000 }, // Main straight
    { type: 'corner', length: 100, targetSpeed: 60, radius: 20 }, // Hairpin
];

const TOTAL_TRACK_LENGTH = TRACK_MAP.reduce((acc, seg) => acc + seg.length, 0);

// Helper to format time
const getTimestamp = () => {
    const d = new Date();
    return d.toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }) + '.' + d.getMilliseconds().toString().padStart(3, '0');
};

const formatLapTime = (ms) => {
    const min = Math.floor(ms / 60000);
    const sec = Math.floor((ms % 60000) / 1000);
    const mil = Math.floor((ms % 1000) / 10);
    return `${min}:${sec.toString().padStart(2, '0')}.${mil.toString().padStart(2, '0')}`;
};

const generateTelemetryUpdate = () => {
    const dt = 0.01; // 10ms delta time
    tick += dt;
    const now = Date.now();
    const timeString = getTimestamp();

    // --- Physics Simulation ---
    
    // 1. Determine Track Position
    let currentDist = carState.distance;
    let currentSegment = TRACK_MAP[0];
    let distInSegment = currentDist;
    let accumulatedDist = 0;

    for (const seg of TRACK_MAP) {
        if (currentDist < accumulatedDist + seg.length) {
            currentSegment = seg;
            distInSegment = currentDist - accumulatedDist;
            break;
        }
        accumulatedDist += seg.length;
    }

    // 2. Driver Inputs (AI Driver)
    let throttle = 0;
    let brake = 0;
    let steering = 0;
    
    const currentSpeed = carState.speed;
    const maxSpeed = 320;
    
    if (currentSegment.type === 'straight') {
        // Accelerate on straights
        // Check distance to next corner to brake
        const distToCorner = currentSegment.length - distInSegment;
        const nextSegmentIndex = (TRACK_MAP.indexOf(currentSegment) + 1) % TRACK_MAP.length;
        const nextSegment = TRACK_MAP[nextSegmentIndex];
        
        // Simple braking distance calculation: v^2 = u^2 + 2as -> s = (v^2 - u^2) / 2a
        // Deceleration approx 25 m/s^2 (F1 car braking)
        // Convert km/h to m/s: / 3.6
        const vCurrent = currentSpeed / 3.6;
        const vTarget = (nextSegment.targetSpeed || 0) / 3.6;
        const brakingDist = (vCurrent * vCurrent - vTarget * vTarget) / (2 * 25);

        if (distToCorner < brakingDist + 50 && currentSpeed > nextSegment.targetSpeed) {
             // Brake zone
             throttle = 0;
             brake = Math.min(100, (distToCorner < brakingDist ? 100 : 50));
        } else {
             // Full throttle
             throttle = 100;
             brake = 0;
        }
        steering = (Math.random() - 0.5) * 2; // Micro corrections
    } else {
        // Cornering
        // Maintain target speed
        if (currentSpeed > currentSegment.targetSpeed + 5) {
            brake = 50;
            throttle = 0;
        } else if (currentSpeed < currentSegment.targetSpeed - 5) {
            throttle = 80;
            brake = 0;
        } else {
            throttle = 40; // Maintenance throttle
            brake = 0;
        }
        
        // Steering angle based on radius and speed
        // a = v^2 / r
        // steering angle approx proportional to 1/r
        const direction = (TRACK_MAP.indexOf(currentSegment) % 2 === 0) ? 1 : -1; // Alternate turns
        steering = (500 / currentSegment.radius) * direction;
    }

    // 3. Vehicle Dynamics
    // Acceleration: approx 10 m/s^2 at low speed, dropping with drag
    // Drag: proportional to v^2
    
    let accel = 0;
    if (throttle > 0) {
        const torque = 1 - (currentSpeed / maxSpeed); // Torque drops with speed
        accel = (throttle / 100) * 15 * torque;
    }
    if (brake > 0) {
        accel -= (brake / 100) * 30; // Strong braking
    }
    
    // Drag
    accel -= (currentSpeed / 320) * 2; // Aero drag
    
    // Update Speed
    carState.speed += accel * dt * 3.6; // Convert m/s^2 to km/h/s
    if (carState.speed < 0) carState.speed = 0;
    
    // Update Distance
    const distTravelled = (carState.speed / 3.6) * dt;
    carState.distance += distTravelled;
    carState.lapTime += dt * 1000;

    // Lap Logic
    if (carState.distance >= TOTAL_TRACK_LENGTH) {
        carState.distance = 0;
        carState.lap++;
        carState.lastLapTime = carState.lapTime;
        carState.lapTime = 0;
    }

    // Gear Logic (Simple automatic)
    // Shift points based on speed
    const gearRatios = [0, 60, 100, 140, 190, 240, 280, 330];
    if (carState.speed > gearRatios[carState.gear] && carState.gear < 8) {
        carState.gear++;
    } else if (carState.gear > 1 && carState.speed < gearRatios[carState.gear - 1]) {
        carState.gear--;
    }

    // RPM Logic
    // Map speed within gear range to RPM (4000 - 12000)
    const gearMin = gearRatios[carState.gear - 1] || 0;
    const gearMax = gearRatios[carState.gear] || 350;
    const gearRange = gearMax - gearMin;
    const speedInGear = carState.speed - gearMin;
    const rpmPct = Math.max(0, Math.min(1, speedInGear / gearRange));
    carState.rpm = 4000 + (rpmPct * 8000) + (Math.random() * 100);
    
    // DRS
    const drsStatus = (currentSegment.type === 'straight' && currentSegment.length > 500 && distInSegment > 100 && distInSegment < currentSegment.length - 100) ? 'OPEN' : 'CLOSED';
    if (drsStatus === 'OPEN') carState.speed += 0.1; // Slight boost

    // G-Forces
    const gLong = accel / 9.81;
    const gLat = (currentSegment.type === 'corner') ? ((carState.speed/3.6)**2 / currentSegment.radius) / 9.81 * (steering > 0 ? 1 : -1) : 0;

    // --- Data Construction ---

    const mainCarUpdate = {
        timestamp: timeString,
        originalTime: now,
        
        // Driver
        heartRate: 120 + (gLong * 10) + Math.abs(gLat * 20) + (Math.random() * 5),
        breath: 18 + (gLong * 2),
        stress: 50 + (carState.speed / 320) * 50,
        
        // Car Status
        lapProgress: (carState.distance / TOTAL_TRACK_LENGTH) * 100,
        lap: carState.lap,
        lastLapTime: formatLapTime(carState.lastLapTime),
        currentLapTime: formatLapTime(carState.lapTime),
        
        // Controls
        steering,
        throttle,
        brake,
        gear: carState.gear,
        drsStatus,
        
        // Physics
        speed: carState.speed,
        rpm: carState.rpm,
        gLat,
        gLong,
        heading: (carState.distance / TOTAL_TRACK_LENGTH) * 360, // Simplified heading
        
        // Engine/Powertrain
        oilTemp: 105 + (carState.rpm / 12000) * 10 + Math.sin(tick * 0.1) * 2,
        oilPressure: 3.5 + (carState.rpm / 12000) * 2.5,
        waterTemp: 90 + (carState.rpm / 12000) * 15,
        gearboxTemp: 110 + (Math.abs(gLong) * 5),
        fuelFlow: 10 + (throttle / 100) * 90,
        fuel: carState.fuel - (throttle / 100) * 0.001,
        turboBoost: 1.0 + (throttle / 100) * 2.5,
        exhaustTemp: 600 + (throttle / 100) * 350,
        batteryVoltage: 13.5 + Math.sin(tick) * 0.2,
        
        // Tires & Brakes
        flTemp: 90 + Math.abs(gLat * 10) + (brake * 0.5),
        frTemp: 90 + Math.abs(gLat * 10) + (brake * 0.5),
        rlTemp: 95 + (throttle * 0.2),
        rrTemp: 95 + (throttle * 0.2),
        flPress: 1.2 + (carState.speed / 10000),
        frPress: 1.2 + (carState.speed / 10000),
        rlPress: 1.2 + (carState.speed / 10000),
        rrPress: 1.2 + (carState.speed / 10000),
        brakePressure: brake * 1.5,
        
        // Aero & Suspension
        frontWingLoad: (carState.speed * carState.speed) * 0.03,
        rearWingLoad: (carState.speed * carState.speed) * 0.05,
        suspensionFL: 120 + (gLat * 10) - (gLong * 5) + (Math.random() * 2),
        suspensionFR: 120 - (gLat * 10) - (gLong * 5) + (Math.random() * 2),
        suspensionRL: 120 + (gLat * 10) + (gLong * 5) + (Math.random() * 2),
        suspensionRR: 120 - (gLat * 10) + (gLong * 5) + (Math.random() * 2),
        
        // Environment
        airTemp: 28,
        trackTemp: 42,
        humidity: 65,
        windSpeed: 12,
        windDir: 'NE',
        gpsSats: 14,
    };

    // --- All Cars Telemetry (Director View) ---
    const allCarsTelemetry = Array.from({ length: 20 }, (_, i) => {
        const carId = i + 1;
        // Simple offset simulation for other cars
        const offset = carId * 200;
        const otherDist = (carState.distance + offset) % TOTAL_TRACK_LENGTH;
        const otherSpeed = Math.max(0, carState.speed + Math.sin(tick + carId) * 20);
        
        return {
            id: carId,
            number: `${carId + 3}`,
            lap: carState.lap,
            speed: otherSpeed,
            rpm: carState.rpm * 0.9 + Math.random() * 1000,
            fuelFlow: 90 + Math.random() * 10,
            lambda: 0.98,
            airflow: 400,
            distance: otherDist,
            lapProgress: (otherDist / TOTAL_TRACK_LENGTH) * 100,
            gapToLeader: `+${(offset / 320 * 3.6).toFixed(1)}`,
            lastLapTime: formatLapTime(90000 + Math.random() * 2000),
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
