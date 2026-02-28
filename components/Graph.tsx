import React, { useEffect, useState, useRef } from 'react';
import MapWidget from './MapWidget';
import { Area, Line, ComposedChart, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { AlertTriangle, Flag, Zap, Activity, Play, Pause, Siren, Eye, AlertOctagon, ChevronDown, ChevronUp, Filter, Clock, RotateCcw, Trash2, Settings, ArrowUpCircle, ArrowDownCircle, X, Map as MapIcon, ChevronLeft, ChevronRight, GitCompare, Users, ArrowUp, ArrowDown, Droplets, Wind, Gauge, CheckCircle2 } from 'lucide-react';
import { Car, CarTelemetry } from '../types';

interface DashboardProps {
    cars: Car[];
    telemetryData: CarTelemetry[];
    selectedCarIds: number[];
    setSelectedCarIds: React.Dispatch<React.SetStateAction<number[]>>;
    filterSelectedOnly: boolean;
    setFilterSelectedOnly: React.Dispatch<React.SetStateAction<boolean>>;
}

// --- CONSTANTS & TYPES ---
const MAX_CARS = 30;
const HISTORY_LENGTH = 300; // Keep last 300 ticks (30 seconds)
const VISIBLE_WINDOW = 60; // How many points to show in graph

// Initial definition, now used to seed state
const INITIAL_METRICS_CONFIG = [
    { key: 'speed', label: 'Speed', unit: 'km/h', min: 0, max: 350, defaultThreshold: 310, color: '#ec4899', icon: Zap },
    { key: 'fuelFlow', label: 'Fuel Flow', unit: 'kg/h', min: 0, max: 120, defaultThreshold: 100, color: '#ef4444', icon: Droplets },
    { key: 'lambda', label: 'Lambda', unit: 'λ', min: 0.7, max: 1.3, defaultThreshold: 0.95, color: '#eab308', icon: Activity },
    { key: 'airflow', label: 'Airflow', unit: 'g/s', min: 0, max: 500, defaultThreshold: 450, color: '#22c55e', icon: Wind },
    { key: 'rpm', label: 'RPM', unit: 'RPM', min: 0, max: 15000, defaultThreshold: 12500, color: '#3b82f6', icon: Gauge },
];

const COMPARE_COLORS = ['#06b6d4', '#d946ef', '#facc15'];

interface Alert {
    id: string;
    carNumber: string;
    metric: string;
    value: number;
    threshold: number;
    timestamp: string;
    tick: number;
    lap: number;
    curve: string;
}

interface MetricSetting {
    key: string;
    label: string;
    unit: string;
    min: number;
    max: number;
    color: string;
    icon: any;
    threshold: number;
    alertDelay: number; // Seconds
    refreshRate: number; // Hz
}

const Graph: React.FC<DashboardProps> = ({ 
    cars: initialCars, 
    telemetryData,
    selectedCarIds,
    setSelectedCarIds,
    filterSelectedOnly,
    setFilterSelectedOnly
}) => {
  // --- STATE ---
  const [history, setHistory] = useState<any[]>([]);
  const tickRef = useRef(0);
  
  // Metrics State (Allows reordering and settings updates)
  const [metrics, setMetrics] = useState<MetricSetting[]>(() => 
      INITIAL_METRICS_CONFIG.map(m => ({
          ...m,
          threshold: m.defaultThreshold,
          alertDelay: 0, // Default 0s delay
          refreshRate: 10 // Default 10Hz
      }))
  );
  
  const [isCompareMode, setIsCompareMode] = useState(false);

  const [alerts, setAlerts] = useState<Alert[]>([]);
  
  // Track breach start times for alert delay logic: { "carId-metricKey": timestamp }
  const breachTracker = useRef<Record<string, number>>({});

  const [raceStatus, setRaceStatus] = useState<'GREEN' | 'YELLOW' | 'SC' | 'RED'>('GREEN');
  const [isPaused, setIsPaused] = useState(false);
  const [expandedAlerts, setExpandedAlerts] = useState(false);
  
  // Right Panel Page State
  const [rightPanelPage, setRightPanelPage] = useState<'DIRECTOR' | 'MAP'>('MAP');

  // Settings UI State
  const [openSettingsKey, setOpenSettingsKey] = useState<string | null>(null);

  // Playback State
  const [isLive, setIsLive] = useState(true);
  const [playbackIndex, setPlaybackIndex] = useState(0);

  // --- DATA SYNC & PROCESSING ---
  useEffect(() => {
      if (isPaused || telemetryData.length === 0) return;

      tickRef.current += 1;
      const currentTick = tickRef.current;
      const now = new Date();
      const timeStr = now.toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });

      // Process Alerts based on new data
      telemetryData.forEach(car => {
          let status: 'OK' | 'WARN' | 'CRITICAL' = 'OK';
          const breaches: string[] = [];

          for (const m of metrics) {
              let val = 0;
              // @ts-ignore - dynamic key access
              if (typeof car[m.key] === 'number') val = car[m.key] as number;

              const breachKey = `${car.id}-${m.key}`;

              if (val > m.threshold) {
                  if (!breachTracker.current[breachKey]) {
                      breachTracker.current[breachKey] = Date.now();
                  }
                  
                  const elapsedSec = (Date.now() - breachTracker.current[breachKey]) / 1000;
                  
                  if (elapsedSec >= m.alertDelay) {
                      status = 'CRITICAL';
                      breaches.push(m.key);
                  } else {
                      if (status !== 'CRITICAL') status = 'WARN';
                  }
              } else {
                  if (breachTracker.current[breachKey]) {
                      delete breachTracker.current[breachKey];
                  }
              }
          }

          if (status === 'CRITICAL' && breaches.length > 0 && Math.random() > 0.98) {
              const primaryBreach = breaches[0];
              const mConfig = metrics.find(m => m.key === primaryBreach);
              if (mConfig) {
                  // @ts-ignore
                  const val = car[primaryBreach] as number;
                  const newAlert: Alert = {
                      id: Date.now().toString() + car.id,
                      carNumber: car.number,
                      metric: primaryBreach,
                      value: val,
                      threshold: mConfig.threshold,
                      timestamp: timeStr,
                      tick: currentTick,
                      lap: car.lap,
                      curve: `T${Math.floor(Math.random() * 12) + 1}`
                  };
                  setAlerts(prev => [newAlert, ...prev].slice(0, 50));
              }
          }
      });

      // Update History
      setHistory(prev => {
          const snapshot: any = { time: timeStr, tick: currentTick };
          telemetryData.forEach(c => {
              snapshot[`rpm_${c.id}`] = c.rpm;
              snapshot[`speed_${c.id}`] = c.speed;
              snapshot[`fuelFlow_${c.id}`] = c.fuelFlow;
              snapshot[`lambda_${c.id}`] = c.lambda;
              snapshot[`airflow_${c.id}`] = c.airflow;
              snapshot[`distance_${c.id}`] = c.distance;
              snapshot[`lapProgress_${c.id}`] = c.lapProgress || 0;
          });
          const newHistory = [...prev, snapshot].slice(-HISTORY_LENGTH);
          
          if (isLive) {
              setPlaybackIndex(newHistory.length - 1);
          }
          
          return newHistory;
      });

  }, [telemetryData, isPaused, isLive, metrics]);

  // --- HANDLERS ---
  const handleMetricUpdate = (key: string, field: keyof MetricSetting, value: any) => {
      setMetrics(prev => prev.map(m => m.key === key ? { ...m, [field]: value } : m));
  };

  const moveMetric = (index: number, direction: 'up' | 'down') => {
      setMetrics(prev => {
          const newMetrics = [...prev];
          if (direction === 'up' && index > 0) {
              [newMetrics[index], newMetrics[index - 1]] = [newMetrics[index - 1], newMetrics[index]];
          } else if (direction === 'down' && index < newMetrics.length - 1) {
              [newMetrics[index], newMetrics[index + 1]] = [newMetrics[index + 1], newMetrics[index]];
          }
          return newMetrics;
      });
  };

  const toggleCarSelection = (id: number) => {
      if (isCompareMode) {
          if (selectedCarIds.includes(id)) {
              if (selectedCarIds.length > 1) {
                   setSelectedCarIds(prev => prev.filter(cId => cId !== id));
              }
          } else {
              if (selectedCarIds.length < 3) {
                  setSelectedCarIds(prev => [...prev, id]);
              }
          }
      } else {
          setSelectedCarIds([id]);
      }
  };

  const toggleCompareMode = () => {
      if (isCompareMode) {
          setIsCompareMode(false);
          setSelectedCarIds([selectedCarIds[0]]);
      } else {
          setIsCompareMode(true);
      }
  };

  const handleScrub = (e: React.ChangeEvent<HTMLInputElement>) => {
      setIsLive(false);
      setPlaybackIndex(Number(e.target.value));
  };

  const resumeLive = () => {
      setIsLive(true);
      setIsPaused(false);
      setPlaybackIndex(history.length - 1);
  };

  const togglePause = () => {
      if (isPaused) {
          setIsPaused(false);
          setIsLive(true);
      } else {
          setIsPaused(true);
          setIsLive(false);
      }
  };

  const handleJumpToAlert = (targetTick: number) => {
      const index = history.findIndex(h => h.tick === targetTick);
      if (index !== -1) {
          setIsLive(false);
          setIsPaused(true); 
          setPlaybackIndex(index);
      } else {
          setIsLive(false);
      }
  };

  // --- DERIVED STATE FOR RENDERING ---
  const currentSnapshot = history[playbackIndex] || {};
  const graphData = history.slice(Math.max(0, playbackIndex - VISIBLE_WINDOW), playbackIndex + 1);

  const displayCars = telemetryData.map(car => {
      // Re-evaluate status based on CURRENT settings for display purposes
      const rpm = currentSnapshot[`rpm_${car.id}`] ?? car.rpm;
      const fuelFlow = currentSnapshot[`fuelFlow_${car.id}`] ?? car.fuelFlow;
      
      let status = 'OK';
      const rpmConfig = metrics.find(m => m.key === 'rpm');
      const fuelConfig = metrics.find(m => m.key === 'fuelFlow');

      if (rpmConfig && rpm > rpmConfig.threshold) status = 'CRITICAL';
      else if (fuelConfig && fuelFlow > fuelConfig.threshold) status = 'CRITICAL';
      else if (rpmConfig && rpm > rpmConfig.threshold * 0.95) status = 'WARN';

      return { ...car, status };
  });

  const filteredAlerts = filterSelectedOnly 
      ? alerts.filter(alert => selectedCarIds.some(id => telemetryData.find(c => c.id === id)?.number === alert.carNumber))
      : alerts;

  const getMinMax = (metricKey: string) => {
      let min = Infinity;
      let max = -Infinity;
      if (graphData.length === 0) return { min: 0, max: 0 };
      graphData.forEach(point => {
          selectedCarIds.forEach(id => {
              const val = point[`${metricKey}_${id}`];
              if (typeof val === 'number') {
                  if (val < min) min = val;
                  if (val > max) max = val;
              }
          });
      });
      if (min === Infinity) min = 0;
      if (max === -Infinity) max = 0;
      return { min, max };
  };

  const getStatusColor = (status: string, carId: number) => {
      const isSelected = selectedCarIds.includes(carId);
      const extraStyles = isSelected ? (isCompareMode ? 'ring-2 ring-offset-1 ring-offset-black z-10 scale-110' : 'ring-2 ring-white z-10 scale-110') : 'scale-100 opacity-60 hover:opacity-100';
      switch(status) {
          case 'CRITICAL': return `${extraStyles} bg-isuzu-red text-white border-isuzu-red shadow-[0_0_10px_#ff3333] animate-pulse`;
          case 'WARN': return `${extraStyles} bg-yellow-500 text-black border-yellow-500`;
          default: return `${extraStyles} bg-zinc-800 text-zinc-400 border-white/5 hover:bg-zinc-700`;
      }
  };

  return (
    <div className="flex flex-col h-full bg-[#050505] text-white relative overflow-hidden">
      
      {/* WRAPPER FOR SCROLLABLE CONTENT */}
      <div className="flex-1 flex flex-col p-4 gap-4 min-h-0 overflow-visible">

          {/* --- SECTION 1: CAR STATUS BAR --- */}
          <div className="h-14 flex-shrink-0 glass-panel border border-white/10 rounded-xl flex items-center px-4 gap-4 bg-zinc-900/50">
              {/* ... existing car status bar content ... */}
              <div className="flex flex-col justify-center border-r border-white/10 pr-4">
                  <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Grid Status</span>
                  <div className="flex items-center gap-2">
                      <span className="text-xl font-black text-white">{MAX_CARS}</span>
                      <span className="text-xs text-zinc-400">Cars Active</span>
                  </div>
              </div>
              
              <div className="flex-1 overflow-x-auto flex items-center gap-1.5 custom-scrollbar pb-1">
                  {displayCars.sort((a,b) => Number(a.number) - Number(b.number)).map(car => {
                      const isSelected = selectedCarIds.includes(car.id);
                      const compareIndex = selectedCarIds.indexOf(car.id);
                      const compareColor = isCompareMode && isSelected ? COMPARE_COLORS[compareIndex] : 'transparent';
                      
                      return (
                        <button
                            key={car.id}
                            onClick={() => toggleCarSelection(car.id)}
                            style={{ borderColor: compareColor }}
                            className={`
                                flex flex-col items-center justify-center w-9 h-9 rounded border transition-all relative group
                                ${getStatusColor(car.status as string, car.id)}
                            `}
                        >
                            <span className="text-xs font-black leading-none">{car.number}</span>
                            {car.status === 'CRITICAL' && (
                                <div className="absolute -top-1 -right-1 w-2 h-2 bg-white rounded-full animate-ping"></div>
                            )}
                        </button>
                      );
                  })}
              </div>
          </div>

          {/* --- SECTION 2: MAIN CONTENT AREA --- */}
          <div className="flex-1 flex gap-4 min-h-0">
              
              {/* MAIN GRAPHS (Flex Column, Fit to Screen) */}
              <div className="flex-1 flex flex-col gap-2 min-h-0 relative">
                  {metrics.map((metric, index) => {
                      const { min, max } = getMinMax(metric.key);
                      const Icon = metric.icon;
                      const isSettingsOpen = openSettingsKey === metric.key;

                      return (
                      <div key={metric.key} className={`glass-panel px-3 py-2 rounded-xl border border-white/5 bg-zinc-900/20 flex flex-col flex-1 min-h-0 relative group ${isSettingsOpen ? 'z-[60]' : 'z-auto'}`}>
                          
                          {/* Settings Popover */}
                          {isSettingsOpen && (
                              <div className="absolute top-8 right-2 z-50 bg-[#0a0a0a] border border-white/20 rounded-lg shadow-2xl p-4 w-64 animate-in fade-in slide-in-from-top-2">
                                  <div className="flex justify-between items-center mb-3 border-b border-white/10 pb-2">
                                      <h4 className="text-xs font-bold text-white uppercase tracking-wider">Graph Configuration</h4>
                                      <button onClick={() => setOpenSettingsKey(null)} className="text-zinc-500 hover:text-white"><X className="w-3 h-3" /></button>
                                  </div>
                                  
                                  <div className="space-y-3">
                                      <div>
                                          <label className="text-[10px] text-zinc-500 font-bold uppercase block mb-1">Limit Threshold</label>
                                          <div className="flex items-center gap-2">
                                              <input 
                                                  type="number" 
                                                  value={metric.threshold} 
                                                  onChange={(e) => handleMetricUpdate(metric.key, 'threshold', Number(e.target.value))}
                                                  className="w-full bg-zinc-900 border border-white/10 rounded px-2 py-1 text-xs text-white focus:border-isuzu-red outline-none"
                                              />
                                              <span className="text-[10px] text-zinc-500">{metric.unit}</span>
                                          </div>
                                      </div>

                                      <div className="grid grid-cols-2 gap-2">
                                          <div>
                                              <label className="text-[10px] text-zinc-500 font-bold uppercase block mb-1">Alert Delay</label>
                                              <div className="flex items-center gap-1">
                                                  <input 
                                                      type="number" 
                                                      value={metric.alertDelay} 
                                                      onChange={(e) => handleMetricUpdate(metric.key, 'alertDelay', Number(e.target.value))}
                                                      className="w-full bg-zinc-900 border border-white/10 rounded px-2 py-1 text-xs text-white focus:border-isuzu-red outline-none"
                                                  />
                                                  <span className="text-[10px] text-zinc-500">s</span>
                                              </div>
                                          </div>
                                          <div>
                                              <label className="text-[10px] text-zinc-500 font-bold uppercase block mb-1">Refresh Rate</label>
                                              <div className="flex items-center gap-1">
                                                  <input 
                                                      type="number" 
                                                      value={metric.refreshRate} 
                                                      onChange={(e) => handleMetricUpdate(metric.key, 'refreshRate', Number(e.target.value))}
                                                      className="w-full bg-zinc-900 border border-white/10 rounded px-2 py-1 text-xs text-white focus:border-isuzu-red outline-none"
                                                  />
                                                  <span className="text-[10px] text-zinc-500">Hz</span>
                                              </div>
                                          </div>
                                      </div>

                                      <div className="pt-2 border-t border-white/10 flex gap-2">
                                          <button 
                                              onClick={() => moveMetric(index, 'up')} 
                                              disabled={index === 0}
                                              className="flex-1 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-30 disabled:hover:bg-zinc-800 text-white py-1.5 rounded text-[10px] flex items-center justify-center gap-1"
                                          >
                                              <ArrowUpCircle className="w-3 h-3" /> Move Up
                                          </button>
                                          <button 
                                              onClick={() => moveMetric(index, 'down')} 
                                              disabled={index === metrics.length - 1}
                                              className="flex-1 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-30 disabled:hover:bg-zinc-800 text-white py-1.5 rounded text-[10px] flex items-center justify-center gap-1"
                                          >
                                              <ArrowDownCircle className="w-3 h-3" /> Move Down
                                          </button>
                                      </div>
                                  </div>
                              </div>
                          )}

                          {/* Header Line */}
                          <div className="flex justify-between items-center mb-1 px-1 flex-shrink-0">
                              <div className="flex items-center gap-3">
                                  <div className="flex items-center gap-2">
                                      <Icon className="w-3 h-3" style={{ color: metric.color }} />
                                      <h3 className="text-xs font-bold text-white uppercase tracking-wider">{metric.label}</h3>
                                  </div>
                                  <div className="flex items-center gap-2 text-[10px] text-zinc-500 border-l border-white/10 pl-2">
                                      <span>LIMIT: <span className="text-zinc-300 font-mono">{metric.threshold}</span> {metric.unit}</span>
                                  </div>
                              </div>

                              <div className="flex items-center gap-3">
                                  <div className="flex gap-3">
                                      <div className="flex items-center gap-1">
                                          <ArrowUp className="w-3 h-3 text-isuzu-red" />
                                          <span className="text-[10px] font-mono text-zinc-300">{Math.round(max)}</span>
                                      </div>
                                      <div className="flex items-center gap-1">
                                          <ArrowDown className="w-3 h-3 text-blue-500" />
                                          <span className="text-[10px] font-mono text-zinc-300">{Math.round(min)}</span>
                                      </div>
                                  </div>
                                  
                                  {/* Settings Toggle Button */}
                                  <button 
                                      onClick={() => setOpenSettingsKey(isSettingsOpen ? null : metric.key)}
                                      className={`p-1.5 rounded hover:bg-white/10 transition-colors ${isSettingsOpen ? 'bg-white/10 text-white' : 'text-zinc-600'}`}
                                  >
                                      <Settings className="w-3 h-3" />
                                  </button>
                              </div>
                          </div>

                          <div className="flex-1 w-full flex items-center gap-4 min-h-0">
                              {/* Chart Area */}
                              <div className="flex-1 h-full min-w-0">
                                  <ResponsiveContainer width="100%" height="100%">
                                      <ComposedChart data={graphData} margin={{ left: 0, right: 30, top: 5, bottom: 0 }}>
                                          <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} opacity={0.3} />
                                          
                                          {/* Highlights for exceeding values - Rendered BEFORE Axis so text is on top */}
                                          {selectedCarIds.map((id, index) => {
                                              const strokeColor = isCompareMode ? COMPARE_COLORS[index] : metric.color;
                                              const threshold = metric.threshold;
                                              return (
                                                  <Area
                                                      key={`area_${id}`}
                                                      type="monotone"
                                                      dataKey={(item) => {
                                                          const val = item[`${metric.key}_${id}`];
                                                          return typeof val === 'number' && val > threshold ? val : metric.min;
                                                      }}
                                                      baseValue={metric.min}
                                                      stroke="none"
                                                      fill={strokeColor}
                                                      fillOpacity={0.1} 
                                                      isAnimationActive={false}
                                                      activeDot={false}
                                                      tooltipType="none"
                                                      legendType="none"
                                                  />
                                              );
                                          })}

                                          <ReferenceLine y={metric.threshold} stroke="red" strokeDasharray="3 3" strokeOpacity={0.5} />
                                          
                                          {selectedCarIds.map((id, index) => {
                                              const carNum = displayCars.find(c => c.id === id)?.number;
                                              if (!carNum) return null;
                                              const strokeColor = isCompareMode ? COMPARE_COLORS[index] : metric.color;
                                              return (
                                                  <Line 
                                                      key={id}
                                                      type="monotone" 
                                                      dataKey={`${metric.key}_${id}`} 
                                                      stroke={strokeColor} 
                                                      strokeWidth={2} 
                                                      dot={false}
                                                      isAnimationActive={false}
                                                      name={`Car ${carNum}`}
                                                  />
                                              );
                                          })}
                                          
                                          {/* Axes rendered LAST to be on top */}
                                          <XAxis 
                                            dataKey={isCompareMode && selectedCarIds.length > 0 ? `distance_${selectedCarIds[0]}` : "time"} 
                                            type={isCompareMode ? "number" : "category"}
                                            domain={isCompareMode ? ['auto', 'auto'] : undefined}
                                            tickFormatter={isCompareMode ? (val) => `${(val/1000).toFixed(2)}km` : undefined}
                                            tick={{ fill: '#6b7280', fontSize: 9, fontFamily: 'monospace' }}
                                            tickLine={false}
                                            axisLine={false}
                                            minTickGap={30}
                                            interval="preserveEnd"
                                            height={20}
                                          />
                                          <YAxis 
                                            domain={[metric.min, metric.max]} 
                                            padding={{ top: 0, bottom: 0 }}
                                            tick={{ fill: '#6b7280', fontSize: 10, fontFamily: 'monospace', fontWeight: 500 }}
                                            tickLine={false}
                                            axisLine={false}
                                            width={35}
                                            tickCount={4}
                                            interval="preserveStartEnd"
                                            tickFormatter={(value) => value.toFixed(metric.key === 'lambda' ? 1 : 0)}
                                          />
                                          <Tooltip 
                                            contentStyle={{ backgroundColor: '#000', border: '1px solid #333' }}
                                            itemStyle={{ fontSize: '12px' }}
                                            labelStyle={{ display: 'none' }}
                                            filterNull={true}
                                          />

                                      </ComposedChart>
                                  </ResponsiveContainer>
                              </div>
                              
                              {/* Live Value Indicator */}
                              <div className="w-28 h-full flex flex-col justify-center items-end border-l border-white/5 pl-2 pr-2 bg-white/[0.02] rounded-r-lg flex-shrink-0">
                                  <span className="text-[9px] font-bold text-zinc-500 uppercase mb-0.5">CURRENT</span>
                                  <div className="flex items-baseline gap-1">
                                      <span className="text-3xl font-black text-white leading-none tracking-tighter">
                                          {metric.key === 'lambda' 
                                            ? (currentSnapshot[`${metric.key}_${selectedCarIds[0]}`] ?? 0).toFixed(2)
                                            : Math.round(currentSnapshot[`${metric.key}_${selectedCarIds[0]}`] ?? 0)
                                          }
                                      </span>
                                      <span className="text-[10px] font-bold text-zinc-500">{metric.unit}</span>
                                  </div>
                                  {isCompareMode && selectedCarIds.length > 1 && (
                                      <div className="mt-1 space-y-0.5 w-full">
                                          {selectedCarIds.slice(1).map((id, idx) => (
                                              <div key={id} className="flex justify-between items-center text-[10px]">
                                                  <span className="text-zinc-500 font-mono">#{displayCars.find(c => c.id === id)?.number}</span>
                                                  <span className="font-mono text-zinc-300">
                                                      {Math.round(currentSnapshot[`${metric.key}_${id}`] ?? 0)}
                                                  </span>
                                              </div>
                                          ))}
                                      </div>
                                  )}
                              </div>
                          </div>
                      </div>
                  )})}
              </div>

              {/* RIGHT PANEL (CONTROLS & ALERTS) */}
              <div className="w-80 flex flex-col gap-4 flex-shrink-0">
                  <div className="glass-panel p-4 rounded-xl border border-white/10 bg-zinc-900/80 min-h-[300px] relative flex flex-col">
                      
                      {/* Pagination Controls - Absolute Top Right */}
                      <div className="absolute top-4 right-4 flex gap-1 z-20">
                         <button
                            onClick={() => setRightPanelPage(prev => prev === 'DIRECTOR' ? 'MAP' : 'DIRECTOR')}
                            className="p-1.5 hover:bg-white/10 rounded text-zinc-500 hover:text-white transition-colors"
                         >
                            {rightPanelPage === 'DIRECTOR' ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
                         </button>
                      </div>

                      {rightPanelPage === 'DIRECTOR' ? (
                        <>
                            <div className="flex justify-between items-center mb-4">
                                <div className="flex items-center gap-2 text-zinc-400">
                                    <Eye className="w-4 h-4" />
                                    <span className="text-xs font-bold uppercase tracking-wider">Race Director</span>
                                </div>
                                {/* Flag Controls */}
                                <div className="flex items-center gap-1.5 bg-black/40 px-2 py-1 rounded-full border border-white/5 mr-8">
                                    <span title="Green Flag" className={`w-2 h-2 rounded-full cursor-pointer transition-colors ${raceStatus === 'GREEN' ? 'bg-green-500 shadow-[0_0_8px_#22c55e]' : 'bg-zinc-700'}`} onClick={() => setRaceStatus('GREEN')}></span>
                                    <span title="Yellow Flag" className={`w-2 h-2 rounded-full cursor-pointer transition-colors ${raceStatus === 'YELLOW' ? 'bg-yellow-500 animate-pulse' : 'bg-zinc-700'}`} onClick={() => setRaceStatus('YELLOW')}></span>
                                    <span title="Red Flag" className={`w-2 h-2 rounded-full cursor-pointer transition-colors ${raceStatus === 'RED' ? 'bg-red-600 animate-pulse' : 'bg-zinc-700'}`} onClick={() => setRaceStatus('RED')}></span>
                                    <span title="Safety Car" className={`w-2 h-2 rounded-full cursor-pointer transition-colors ${raceStatus === 'SC' ? 'bg-orange-500 animate-pulse' : 'bg-zinc-700'}`} onClick={() => setRaceStatus('SC')}></span>
                                </div>
                            </div>
                            
                            <button 
                                onClick={toggleCompareMode}
                                className={`w-full py-2.5 mb-3 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all border ${
                                    isCompareMode 
                                    ? 'bg-blue-500/20 text-blue-400 border-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.3)]' 
                                    : 'bg-zinc-800 text-zinc-400 border-transparent hover:bg-zinc-700 hover:text-white'
                                }`}
                            >
                                {isCompareMode ? <Users className="w-4 h-4" /> : <GitCompare className="w-4 h-4" />}
                                {isCompareMode ? 'EXIT COMPARE MODE' : 'COMPARE RACERS'}
                            </button>

                            <div className="grid grid-cols-2 gap-2 mb-4">
                                <button 
                                    onClick={() => setRaceStatus('SC')}
                                    className={`p-3 rounded border flex flex-col items-center justify-center gap-1 transition-all ${raceStatus === 'SC' ? 'bg-yellow-500/20 border-yellow-500 text-yellow-500' : 'bg-white/5 border-white/5 hover:bg-white/10 text-zinc-300'}`}
                                >
                                    <Siren className="w-5 h-5" />
                                    <span className="text-[10px] font-bold">SAFETY CAR</span>
                                </button>
                                <button 
                                    onClick={() => setRaceStatus('RED')}
                                    className={`p-3 rounded border flex flex-col items-center justify-center gap-1 transition-all ${raceStatus === 'RED' ? 'bg-red-600/20 border-red-600 text-red-500' : 'bg-white/5 border-white/5 hover:bg-white/10 text-zinc-300'}`}
                                >
                                    <AlertOctagon className="w-5 h-5" />
                                    <span className="text-[10px] font-bold">RED FLAG</span>
                                </button>
                            </div>

                            <div className="space-y-2">
                                <button className="w-full py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded text-xs font-bold border border-white/5 flex items-center justify-center gap-2">
                                    <Flag className="w-3 h-3 text-blue-400" /> INVESTIGATE INCIDENT
                                </button>
                            </div>
                        </>
                      ) : (
                        <div className="flex flex-col h-full animate-in fade-in slide-in-from-right-4 duration-300">
                             <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-2 text-zinc-400">
                                    <MapIcon className="w-4 h-4" />
                                    <span className="text-xs font-bold uppercase tracking-wider">Track Map</span>
                                </div>
                            </div>
                            
                            <div className="flex-1 w-full relative rounded-lg overflow-hidden border border-white/5 flex items-center justify-center mb-4">
                                <MapWidget 
                                    circuitName="Buriram International Circuit"
                                    activeFlag={raceStatus === 'GREEN' ? null : { turn: 'T3', type: raceStatus === 'SC' ? 'YELLOW' : raceStatus }}
                                    mainCarProgress={(currentSnapshot[`lapProgress_${selectedCarIds[0]}`] || 0) / 100}
                                    rivals={displayCars.filter(c => c.id !== selectedCarIds[0]).map(c => ({
                                        id: c.id,
                                        name: c.number,
                                        color: '#fff',
                                        progress: (currentSnapshot[`lapProgress_${c.id}`] || 0) / 100
                                    }))}
                                    className="h-full border-none bg-transparent"
                                />
                            </div>
                        </div>
                      )}
                  </div>

                  <div className={`glass-panel rounded-xl border border-white/10 flex flex-col flex-1 overflow-hidden transition-all duration-300 bg-zinc-900/30 ${expandedAlerts ? 'absolute top-0 right-0 w-80 h-full z-50 bg-black' : ''}`}>
                      <div className="p-3 border-b border-white/10 flex justify-between items-center bg-zinc-900">
                          <div className="flex items-center gap-2">
                              <AlertTriangle className="w-4 h-4 text-isuzu-red" />
                              <span className="text-xs font-bold text-white uppercase tracking-wider">Breach Log</span>
                              <span className="bg-isuzu-red text-white text-[9px] font-black px-1.5 py-0.5 rounded-full">{filteredAlerts.length}</span>
                          </div>
                          <div className="flex items-center gap-2">
                              <button 
                                onClick={() => setAlerts([])}
                                className="p-1.5 rounded bg-zinc-800 text-zinc-500 hover:text-white hover:bg-zinc-700 transition-colors"
                                title="Clear Alerts"
                              >
                                  <Trash2 className="w-3 h-3" />
                              </button>

                              <button 
                                onClick={() => setFilterSelectedOnly(!filterSelectedOnly)}
                                className={`p-1.5 rounded transition-colors ${filterSelectedOnly ? 'bg-blue-500 text-white' : 'bg-zinc-800 text-zinc-500 hover:text-white'}`}
                                title="Show Selected Car Only"
                              >
                                  <Filter className="w-3 h-3" />
                              </button>
                              <button onClick={() => setExpandedAlerts(!expandedAlerts)} className="text-zinc-500 hover:text-white">
                                  {expandedAlerts ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
                              </button>
                          </div>
                      </div>
                      
                      <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
                          {filteredAlerts.length === 0 ? (
                              <div className="h-full flex flex-col items-center justify-center text-zinc-600 opacity-50">
                                  <CheckCircle2 className="w-8 h-8 mb-2" />
                                  <span className="text-xs">No Active Alerts</span>
                              </div>
                          ) : (
                              filteredAlerts.map(alert => (
                                  <div key={alert.id} className="bg-black/40 border-l-2 border-isuzu-red p-2 rounded hover:bg-white/5 transition-colors cursor-pointer group relative pr-8">
                                      <div className="flex justify-between items-start mb-1">
                                          <span className="text-[10px] font-black text-white bg-zinc-800 px-1 rounded">CAR {alert.carNumber}</span>
                                          <span className="text-[9px] font-mono text-zinc-500">{alert.timestamp}</span>
                                      </div>
                                      <div className="text-xs text-zinc-300 font-medium leading-tight mb-1">
                                          {alert.metric.toUpperCase()} Breach: {Math.round(alert.value)} (Limit: {alert.threshold})
                                      </div>
                                      <div className="flex gap-2 text-[9px] text-zinc-500 font-mono mt-1 opacity-70 group-hover:opacity-100">
                                          <span>LAP {alert.lap}</span>
                                          <span>•</span>
                                          <span>{alert.curve}</span>
                                      </div>
                                      
                                      <button 
                                          onClick={(e) => {
                                              e.stopPropagation();
                                              handleJumpToAlert(alert.tick);
                                          }}
                                          className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-zinc-800 hover:bg-white hover:text-black text-zinc-400 transition-all opacity-0 group-hover:opacity-100"
                                          title="Review at this time"
                                      >
                                          <RotateCcw className="w-3 h-3" />
                                      </button>
                                  </div>
                              ))
                          )}
                      </div>
                  </div>

              </div>
          </div>
      </div>

      {/* --- SECTION 3: TIME PLAYBACK BAR (Fixed Bottom) --- */}
      <div className="h-16 flex-shrink-0 bg-[#080808] border-t border-white/10 flex items-center px-6 gap-6 z-50">
            {/* ... playback controls remain the same ... */}
            <button 
                onClick={togglePause} 
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors flex-shrink-0 ${!isPaused ? 'bg-zinc-800 hover:bg-zinc-700' : 'bg-isuzu-red hover:bg-red-600'}`}
            >
                {!isPaused ? <Pause className="w-4 h-4 text-white" /> : <Play className="w-4 h-4 text-white ml-1" />}
            </button>

            <div className="flex-1 flex flex-col gap-1.5">
                <div className="flex justify-between text-[10px] font-mono font-bold tracking-wider">
                    <span className="text-zinc-600">SESSION START</span>
                    <span className={`${!isPaused && isLive ? 'text-isuzu-red animate-pulse' : 'text-yellow-500'}`}>
                        {!isPaused && isLive ? "LIVE FEED" : (isPaused ? "DATA PAUSED" : "PLAYBACK PAUSED")}
                    </span>
                    <span className="text-zinc-400">NOW</span>
                </div>
                
                <div className="relative h-2 w-full bg-zinc-800 rounded-full group cursor-pointer">
                     <div 
                        className={`absolute top-0 left-0 h-full rounded-full transition-all duration-75 ${!isPaused && isLive ? 'bg-isuzu-red' : 'bg-yellow-500'}`} 
                        style={{ width: `${(playbackIndex / (history.length - 1 || 1)) * 100}%` }}
                     ></div>
                     
                     <input 
                        type="range" 
                        min="0" 
                        max={Math.max(0, history.length - 1)} 
                        value={playbackIndex} 
                        onChange={handleScrub} 
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                     
                     <div className="absolute top-1/2 right-0 -translate-y-1/2 w-2 h-2 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" style={{ left: `${(playbackIndex / (history.length - 1 || 1)) * 100}%` }}></div>
                </div>
            </div>

            <div className="flex flex-col items-end min-w-[100px]">
                <div className="flex items-center gap-2 text-white font-mono text-lg">
                    <Clock className="w-4 h-4 text-zinc-500" />
                    <span>{currentSnapshot.time || "--:--:--"}</span>
                </div>
                {(!isLive || isPaused) && (
                    <button onClick={resumeLive} className="text-[10px] text-isuzu-red hover:text-white flex items-center gap-1 font-bold mt-1">
                        <RotateCcw className="w-3 h-3" /> RETURN TO LIVE
                    </button>
                )}
            </div>
      </div>
    </div>
  );
};

export default Graph;