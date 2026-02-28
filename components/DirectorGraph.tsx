import React, { useState, useEffect, useRef } from 'react';
import { Car, CarTelemetry } from '../types';
import Graph from './Graph';

interface DirectorDashboardProps {
    cars: Car[];
}

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
            lambda: 0.98 + Math.random() * 0.04,
            airflow: Math.max(0, 400 + Math.random() * 50),
            distance: (tick * 50) % 5000,
        };
    });
};

const DirectorGraph: React.FC<DirectorDashboardProps> = ({ cars }) => {
    const [selectedCarIds, setSelectedCarIds] = useState<number[]>([]);
    const [filterSelectedOnly, setFilterSelectedOnly] = useState(false);
    const [allCarsTelemetry, setAllCarsTelemetry] = useState<CarTelemetry[]>([]);
    const tickRef = useRef(0);
    const [isPaused, setIsPaused] = useState(false);

    useEffect(() => {
        const interval = setInterval(() => {
            if (!isPaused) {
                tickRef.current += 0.01;
                const t = tickRef.current;
                setAllCarsTelemetry(generateAllCarsTelemetry(cars, t));
            }
        }, 10);
        return () => clearInterval(interval);
    }, [cars, isPaused]);

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
