import { useState, useEffect, useRef } from 'react';

export const useTelemetrySocket = (isPaused: boolean = false) => {
    const [history, setHistory] = useState<any[]>([]);
    const [allCarsTelemetry, setAllCarsTelemetry] = useState<any[]>([]);
    const wsRef = useRef<WebSocket | null>(null);

    useEffect(() => {
        // Only connect on client side
        if (typeof window === 'undefined') return;

        // Use environment variable for WebSocket URL if available (e.g., for NestJS backend)
        // Otherwise, fallback to the current window location (for local dev/mock server)
        const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 
            `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}`;
        
        const ws = new WebSocket(wsUrl);
        wsRef.current = ws;

        ws.onopen = () => {
            console.log('Connected to Telemetry WebSocket');
        };

        ws.onmessage = (event) => {
            if (isPaused) return;

            try {
                const message = JSON.parse(event.data);
                
                if (message.type === 'TELEMETRY_UPDATE') {
                    setHistory(prev => {
                        // Keep last 600 points (same as original logic)
                        const newHistory = [...prev, message.mainCar].slice(-600);
                        return newHistory;
                    });
                    setAllCarsTelemetry(message.allCars);
                } else if (message.type === 'HISTORY_INIT') {
                    setHistory(message.data);
                }
            } catch (e) {
                console.error('Error parsing WebSocket message:', e);
            }
        };

        ws.onclose = () => {
            console.log('Disconnected from Telemetry WebSocket');
        };

        return () => {
            ws.close();
        };
    }, [isPaused]);

    return { history, allCarsTelemetry };
};
