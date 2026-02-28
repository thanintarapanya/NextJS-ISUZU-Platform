'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import Sidebar from '@/components/Sidebar';
import Login from '@/components/Login';
import { View, Car, Driver, FileItem } from '@/types';
import { INITIAL_FILES } from '@/constants';

const AllSensors = dynamic(() => import('@/components/AllSensors'), { ssr: false });
const Task = dynamic(() => import('@/components/Task'), { ssr: false });
const TeamComms = dynamic(() => import('@/components/TeamComms'), { ssr: false });
const Engineering = dynamic(() => import('@/components/Engineering'), { ssr: false });
const DirectorGraph = dynamic(() => import('@/components/DirectorGraph'), { ssr: false });
const Settings = dynamic(() => import('@/components/Settings'), { ssr: false });
const FileAndVideo = dynamic(() => import('@/components/FileAndVideo'), { ssr: false });
const LiveStream = dynamic(() => import('@/components/LiveStream'), { ssr: false });

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
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentView, setCurrentView] = useState<View>(View.DASHBOARD);

  // Shared State for Fleet/Team
  const [cars, setCars] = useState<Car[]>([
      { id: 1, model: 'Isuzu D-Max Raider', number: '04', status: 'Active' },
      { id: 2, model: 'Isuzu D-Max Proto', number: '12', status: 'Maintenance' },
  ]);
  const [drivers, setDrivers] = useState<Driver[]>([
      { id: 1, name: 'M. Sato', carId: 1, license: 'FIA-A' },
      { id: 2, name: 'J. Smith', carId: 2, license: 'FIA-B' },
  ]);

  // Shared State for Files (Files Tab + Telemetry Recording)
  const [files, setFiles] = useState<FileItem[]>(INITIAL_FILES);

  // Persisted Layout State
  const [telemetryLayout, setTelemetryLayout] = useState(DEFAULT_TELEMETRY_LAYOUT);

  if (!isAuthenticated) {
    return <Login onLogin={() => setIsAuthenticated(true)} />;
  }

  const renderContent = () => {
    switch (currentView) {
      case View.DASHBOARD:
        return <AllSensors cars={cars} drivers={drivers} />;
      case View.TELEMETRY:
        return <Engineering 
                  cars={cars} 
                  drivers={drivers} 
                  setFiles={setFiles} 
                  layout={telemetryLayout}
                  onLayoutChange={setTelemetryLayout}
               />;
      case View.DIRECTOR:
        return <DirectorGraph cars={cars} />;
      case View.KANBAN:
        return <Task />;
      case View.CHAT:
        return <TeamComms />;
      case View.FILES:
        return <FileAndVideo files={files} setFiles={setFiles} />;
      case View.LIVE:
        return <LiveStream cars={cars} drivers={drivers} />;
      case View.SETTINGS:
        return <Settings cars={cars} setCars={setCars} drivers={drivers} setDrivers={setDrivers} />;
      default:
        return <AllSensors cars={cars} drivers={drivers} />;
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
        />
        
        <main className="flex-1 relative z-10 flex flex-col overflow-hidden">
            {renderContent()}
        </main>
    </div>
  );
};

export default App;
