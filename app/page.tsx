'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import Sidebar from '@/components/Sidebar';
import Login from '@/components/Login';
import { View, Car, Driver, FileItem, CarTelemetry, Thresholds } from '@/types';
import { INITIAL_FILES } from '@/constants';

const AllSensors = dynamic(() => import('@/components/AllSensors'), { ssr: false });
const Task = dynamic(() => import('@/components/Task'), { ssr: false });
const TeamComms = dynamic(() => import('@/components/TeamComms'), { ssr: false });
const Engineering = dynamic(() => import('@/components/Engineering'), { ssr: false });
const DirectorGraph = dynamic(() => import('@/components/DirectorGraph'), { ssr: false });
const Settings = dynamic(() => import('@/components/Settings'), { ssr: false });
const FileAndVideo = dynamic(() => import('@/components/FileAndVideo'), { ssr: false });
const LiveStream = dynamic(() => import('@/components/LiveStream'), { ssr: false });
const Administration = dynamic(() => import('@/components/Administration'), { ssr: false });
const OverviewDirector = dynamic(() => import('@/components/OverviewDirector'), { ssr: false });

// Define initial layout here to persist across tab changes
const DEFAULT_TELEMETRY_LAYOUT = [
    // Column 0
    { i: 'alerts', x: 0, y: 0, w: 1, h: 2 },
    { i: 'heart', x: 0, y: 2, w: 1, h: 1 },
    { i: 'breath', x: 0, y: 3, w: 1, h: 1 },
    { i: 'stress', x: 0, y: 4, w: 1, h: 1 },

    // Column 1
    { i: 'race', x: 1, y: 0, w: 1, h: 1 },
    { i: 'map', x: 1, y: 1, w: 1, h: 2 },
    { i: 'gap_time', x: 1, y: 3, w: 1, h: 2 },

    // Column 2 & 3 (Top)
    { i: 'car', x: 2, y: 0, w: 2, h: 3 },

    // Column 2 (Bottom)
    { i: 'cameras', x: 2, y: 3, w: 1, h: 2 },

    // Column 3 (Bottom)
    { i: 'correlation', x: 3, y: 3, w: 1, h: 1 },
    { i: 'conditions', x: 3, y: 4, w: 1, h: 1 },
];

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [currentView, setCurrentView] = useState<View>(View.DASHBOARD);

  // Shared State for Fleet/Team
  const [cars, setCars] = useState<Car[]>(
    Array.from({ length: 30 }, (_, i) => ({
      id: i + 1,
      model: i % 2 === 0 ? 'Isuzu D-Max Raider' : 'Isuzu D-Max Proto',
      number: (i + 1).toString().padStart(2, '0'),
      status: i % 5 === 0 ? 'Maintenance' : 'Active'
    }))
  );
  const [drivers, setDrivers] = useState<Driver[]>(
    Array.from({ length: 30 }, (_, i) => ({
      id: i + 1,
      name: `Driver ${i + 1}`,
      carId: i + 1,
      license: i % 3 === 0 ? 'FIA-A' : 'FIA-B'
    }))
  );

  // Shared State for Files (Files Tab + Telemetry Recording)
  const [files, setFiles] = useState<FileItem[]>(INITIAL_FILES);

  // Persisted Layout State
  const [telemetryLayout, setTelemetryLayout] = useState(DEFAULT_TELEMETRY_LAYOUT);

  // Shared Telemetry State
  const [allCarsTelemetry, setAllCarsTelemetry] = React.useState<CarTelemetry[]>([]);
  const tickRef = React.useRef(0);
  const [isPaused, setIsPaused] = React.useState(false);

  // Director Selection State
  const [selectedCarIds, setSelectedCarIds] = useState<number[]>([1]);
  const [filterSelectedOnly, setFilterSelectedOnly] = useState(false);

  // Shared Thresholds State
  const [thresholds, setThresholds] = React.useState<Thresholds>({
      speed: 240,
      rpm: 11500,
      fuelFlow: 98,
      fuelPressure: 4.5,
      throttle: 95,
      ignitionTiming: 40,
      airflow: 440,
      lambda: 1.02,
      sensitivity: 8
  });

  // Team Filter Logic
  const teamCarIds = [1, 2];
  const teamCars = cars.filter(c => teamCarIds.includes(c.id));
  const teamDrivers = drivers.filter(d => teamCarIds.includes(d.carId));

  // Telemetry Generation Logic (Lifted from DirectorGraph)
  React.useEffect(() => {
      const generateAllCarsTelemetry = (cars: Car[], tick: number): CarTelemetry[] => {
          return cars.map(car => {
              const t = tick + (car.id * 100);
              return {
                  id: car.id,
                  number: car.number,
                  lap: 16,
                  speed: Math.max(0, 200 + Math.sin(t * 0.1) * 50 + (Math.random() * 5)),
                  rpm: Math.max(0, 10000 + Math.sin(t * 0.2) * 2000),
                  fuelFlow: Math.max(0, 90 + Math.random() * 10),
                  fuelPressure: Math.max(0, 4.0 + Math.sin(t * 0.05) * 0.5 + (Math.random() * 0.1)),
                  throttle: Math.max(0, 50 + Math.sin(t * 0.3) * 50),
                  ignitionTiming: 20 + Math.sin(t * 0.1) * 10 + (Math.random() * 2),
                  lambda: 0.98 + Math.random() * 0.04,
                  airflow: Math.max(0, 400 + Math.random() * 50),
                  distance: (tick * 50) % 5000,
                  lapProgress: (tick * 5) % 100,
              };
          });
      };

      const interval = setInterval(() => {
          if (!isPaused) {
              tickRef.current += 0.1;
              const t = tickRef.current;
              setAllCarsTelemetry(generateAllCarsTelemetry(cars, t));
          }
      }, 100);
      return () => clearInterval(interval);
  }, [cars, isPaused]);

  if (!isAuthenticated) {
    return <Login onLogin={() => setIsAuthenticated(true)} />;
  }

  const renderContent = () => {
    switch (currentView) {
      case View.DASHBOARD:
        return <AllSensors cars={teamCars} drivers={teamDrivers} />;
      case View.TELEMETRY:
        return <Engineering 
                  cars={teamCars} 
                  drivers={teamDrivers} 
                  setFiles={setFiles} 
                  layout={telemetryLayout}
                  onLayoutChange={setTelemetryLayout}
               />;
      case View.DIRECTOR:
        return <DirectorGraph 
                  cars={cars} 
                  telemetryData={allCarsTelemetry} 
                  selectedCarIds={selectedCarIds}
                  setSelectedCarIds={setSelectedCarIds}
                  filterSelectedOnly={filterSelectedOnly}
                  setFilterSelectedOnly={setFilterSelectedOnly}
               />;
      case View.OVERVIEW_DIRECTOR:
        return <OverviewDirector 
                  cars={cars} 
                  drivers={drivers} 
                  telemetryData={allCarsTelemetry}
                  onCarSelect={(id) => {
                      setSelectedCarIds([id]);
                      setCurrentView(View.DIRECTOR);
                  }}
                  thresholds={thresholds}
                  layout={telemetryLayout}
                  onLayoutChange={setTelemetryLayout}
               />;
      case View.KANBAN:
        return <Task />;
      case View.CHAT:
        return <TeamComms />;
      case View.FILES:
        return <FileAndVideo files={files} setFiles={setFiles} />;
      case View.LIVE:
        return <LiveStream cars={teamCars} drivers={teamDrivers} />;
      case View.ADMINISTRATION:
        return <Administration cars={teamCars} setCars={setCars} drivers={teamDrivers} setDrivers={setDrivers} />;
      case View.SETTINGS:
        return <Settings cars={teamCars} setCars={setCars} drivers={teamDrivers} setDrivers={setDrivers} />;
      default:
        return <AllSensors cars={teamCars} drivers={teamDrivers} />;
    }
  };

  return (
    <div className="flex h-screen text-white overflow-hidden selection:bg-isuzu-red selection:text-white relative bg-[#050505]">
        {/* Isuzu Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-zinc-900 via-black to-[#2a0505] z-0"></div>
        
        {/* Ambient Aesthetic Glows - Silver (Top Left) & Red (Bottom Right) */}
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-zinc-600/10 blur-[150px] rounded-full z-0 pointer-events-none"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-isuzu-red/10 blur-[150px] rounded-full z-0 pointer-events-none"></div>
        
        {/* Grid Texture */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.03] z-0" style={{ backgroundImage: 'radial-gradient(#999 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>
        
        <Sidebar 
            currentView={currentView} 
            onChangeView={setCurrentView} 
            onLogout={() => setIsAuthenticated(false)} 
            isAdmin={true}
        />
        
        <main className="flex-1 relative z-10 flex flex-col overflow-hidden">
            {renderContent()}
        </main>
    </div>
  );
};

export default App;
