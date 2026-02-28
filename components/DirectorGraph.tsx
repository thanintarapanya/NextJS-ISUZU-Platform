import React, { useState, useEffect, useRef } from 'react';
import { Car, CarTelemetry } from '../types';
import Graph from './Graph';
import { useTelemetrySocket } from '../hooks/useTelemetrySocket';

interface DirectorDashboardProps {
    cars: Car[];
}

const DirectorGraph: React.FC<DirectorDashboardProps> = ({ cars }) => {
    const [selectedCarIds, setSelectedCarIds] = useState<number[]>([]);
    const [filterSelectedOnly, setFilterSelectedOnly] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    
    // Use WebSocket data
    const { allCarsTelemetry } = useTelemetrySocket(isPaused);

    return (
        <div className="flex-1 h-full min-h-0 relative flex flex-col">
             <div className="flex justify-between items-end mb-6 flex-shrink-0 px-6 pt-6">
                <div>
                    <h2 className="text-2xl font-light text-white tracking-tight">Director Dashboard</h2>
                    <div className="flex items-center gap-3 text-zinc-500 text-xs mt-1 font-mono uppercase">
                        <span>RACE CONTROL</span>
                        <span className="text-zinc-700">•</span>
                        <span>SESSION 4</span>
                    </div>
                </div>
            </div>
            
            <div className="flex-1 min-h-0 relative">
                <Graph 
                    cars={cars}
                    telemetryData={allCarsTelemetry}
                    selectedCarIds={selectedCarIds}
                    setSelectedCarIds={setSelectedCarIds}
                    filterSelectedOnly={filterSelectedOnly}
                    setFilterSelectedOnly={setFilterSelectedOnly}
                />
            </div>
        </div>
    );
};

export default DirectorGraph;
