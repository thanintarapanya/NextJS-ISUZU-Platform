import React, { useState } from 'react';
import { Shield, CreditCard, Users, Car, Check, Plus, Trash2, Crown, Zap, AlertTriangle, Pencil, X, Save, Calendar, MapPin, CloudRain, Flag, Gauge, Thermometer, Activity, Settings as SettingsIcon, Info, LineChart, Download } from 'lucide-react';
import { Car as CarType, Driver as DriverType } from '../types';

interface SettingsProps {
    cars: CarType[];
    setCars: (cars: CarType[]) => void;
    drivers: DriverType[];
    setDrivers: (drivers: DriverType[]) => void;
}

const Settings: React.FC<SettingsProps> = ({ cars, setCars, drivers, setDrivers }) => {
    const [activeTab, setActiveTab] = useState<'UNITS' | 'EVENT' | 'GARAGE' | 'THRESHOLDS' | 'PLAN & BILLING'>('UNITS');
    const [plan, setPlan] = useState<'BASIC' | 'PREMIUM'>('BASIC');
    
    // General State
    const [units, setUnits] = useState({ 
        speed: 'KPH', 
        temp: 'CELSIUS', 
        pressure: 'BAR',
        volume: 'LITERS',
        distance: 'METERS',
        force: 'NEWTON',
        angle: 'DEGREES',
        torque: 'NM'
    });
    const [theme, setTheme] = useState('DARK');

    // Event & Track State
    const [eventName, setEventName] = useState('Buriram GT3 Series');
    const [trackName, setTrackName] = useState('Buriram International Circuit');
    const [sessionType, setSessionType] = useState('PRACTICE');
    // Conditions state removed

    // Data & Telemetry State
    const [thresholds, setThresholds] = useState({
        engineTempHigh: 110,
        oilPressureLow: 2.5,
        tireTempHigh: 100,
        fuelLow: 5
    });
    // Director Graph State
    const [graphThresholds, setGraphThresholds] = useState({
        speedMax: 300,
        rpmMax: 9000,
        gForceMax: 5
    });
    const [refreshRate, setRefreshRate] = useState(10);

    // Mock Users
    const [users, setUsers] = useState([
        { id: 1, name: 'Hiroshi T.', role: 'Chief Engineer', access: 'Admin' },
        { id: 2, name: 'Sarah L.', role: 'Data Analyst', access: 'Read-Only' },
    ]);

    // Car Management State
    const [newCarModel, setNewCarModel] = useState('');
    const [newCarNumber, setNewCarNumber] = useState('');
    const [editingCarId, setEditingCarId] = useState<number | null>(null);
    const [editModel, setEditModel] = useState('');
    const [editNumber, setEditNumber] = useState('');

    const [newDriverName, setNewDriverName] = useState('');

    const handleAddCar = () => {
        if(newCarModel && newCarNumber) {
            setCars([...cars, { 
                id: Date.now(), 
                model: newCarModel, 
                number: newCarNumber, 
                status: 'Setup' 
            }]);
            setNewCarModel('');
            setNewCarNumber('');
        }
    };

    const startEditCar = (car: CarType) => {
        setEditingCarId(car.id);
        setEditModel(car.model);
        setEditNumber(car.number);
    };

    const saveEditCar = () => {
        if (editingCarId) {
            setCars(cars.map(c => c.id === editingCarId ? { ...c, model: editModel, number: editNumber } : c));
            setEditingCarId(null);
        }
    };

    return (
        <div className="flex-1 p-8 h-full overflow-y-auto flex flex-col">
            <div className="mb-8 flex-shrink-0">
                <h2 className="text-2xl font-light text-white tracking-tight">System Configuration</h2>
                <p className="text-zinc-500 text-xs mt-1 font-mono uppercase">VERSION 2.4.0 • ADMIN PRIVILEGES ACTIVE</p>
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-6 border-b border-white/10 mb-8 flex-shrink-0 overflow-x-auto">
                {['UNITS', 'EVENT', 'GARAGE', 'THRESHOLDS', 'PLAN & BILLING'].map((tab) => (
                    <button 
                        key={tab}
                        onClick={() => setActiveTab(tab as any)}
                        className={`pb-3 text-sm font-bold uppercase tracking-widest transition-all border-b-2 whitespace-nowrap ${activeTab === tab ? 'text-white border-isuzu-red' : 'text-zinc-500 border-transparent hover:text-zinc-300'}`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar pr-2">
                
                {/* UNITS TAB */}
                {activeTab === 'UNITS' && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div className="glass-panel p-6 rounded-xl space-y-6">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 bg-white/5 rounded-lg">
                                    <SettingsIcon className="w-6 h-6 text-zinc-400" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-white">Units & Display</h3>
                                    <p className="text-xs text-zinc-500">Global application preferences</p>
                                </div>
                            </div>
                            
                            <div className="space-y-4">
                                <div>
                                    <label className="text-[10px] uppercase font-bold text-zinc-500">Speed Unit</label>
                                    <div className="flex gap-2 mt-1">
                                        {['KPH', 'MPH'].map(u => (
                                            <button 
                                                key={u}
                                                onClick={() => setUnits({...units, speed: u})}
                                                className={`flex-1 py-2 rounded text-xs font-bold border ${units.speed === u ? 'bg-isuzu-red border-isuzu-red text-white' : 'bg-black/30 border-white/10 text-zinc-500 hover:bg-white/5'}`}
                                            >
                                                {u}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <label className="text-[10px] uppercase font-bold text-zinc-500">Temperature Unit</label>
                                    <div className="flex gap-2 mt-1">
                                        {['CELSIUS', 'FAHRENHEIT'].map(u => (
                                            <button 
                                                key={u}
                                                onClick={() => setUnits({...units, temp: u})}
                                                className={`flex-1 py-2 rounded text-xs font-bold border ${units.temp === u ? 'bg-isuzu-red border-isuzu-red text-white' : 'bg-black/30 border-white/10 text-zinc-500 hover:bg-white/5'}`}
                                            >
                                                {u}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <label className="text-[10px] uppercase font-bold text-zinc-500">Pressure Unit</label>
                                    <div className="flex gap-2 mt-1">
                                        {['BAR', 'PSI', 'KPA'].map(u => (
                                            <button 
                                                key={u}
                                                onClick={() => setUnits({...units, pressure: u})}
                                                className={`flex-1 py-2 rounded text-xs font-bold border ${units.pressure === u ? 'bg-isuzu-red border-isuzu-red text-white' : 'bg-black/30 border-white/10 text-zinc-500 hover:bg-white/5'}`}
                                            >
                                                {u}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <label className="text-[10px] uppercase font-bold text-zinc-500">Volume / Flow Unit</label>
                                    <div className="flex gap-2 mt-1">
                                        {['LITERS', 'GALLONS', 'KG/H'].map(u => (
                                            <button 
                                                key={u}
                                                onClick={() => setUnits({...units, volume: u})}
                                                className={`flex-1 py-2 rounded text-xs font-bold border ${units.volume === u ? 'bg-isuzu-red border-isuzu-red text-white' : 'bg-black/30 border-white/10 text-zinc-500 hover:bg-white/5'}`}
                                            >
                                                {u}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <label className="text-[10px] uppercase font-bold text-zinc-500">Distance / Length Unit</label>
                                    <div className="flex gap-2 mt-1">
                                        {['METERS', 'FEET', 'MM'].map(u => (
                                            <button 
                                                key={u}
                                                onClick={() => setUnits({...units, distance: u})}
                                                className={`flex-1 py-2 rounded text-xs font-bold border ${units.distance === u ? 'bg-isuzu-red border-isuzu-red text-white' : 'bg-black/30 border-white/10 text-zinc-500 hover:bg-white/5'}`}
                                            >
                                                {u}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="glass-panel p-6 rounded-xl space-y-6">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 bg-white/5 rounded-lg">
                                    <Gauge className="w-6 h-6 text-zinc-400" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-white">Advanced Units</h3>
                                    <p className="text-xs text-zinc-500">Engineering metrics configuration</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="text-[10px] uppercase font-bold text-zinc-500">Force / Weight Unit</label>
                                    <div className="flex gap-2 mt-1">
                                        {['NEWTON', 'KGF', 'LBF'].map(u => (
                                            <button 
                                                key={u}
                                                onClick={() => setUnits({...units, force: u})}
                                                className={`flex-1 py-2 rounded text-xs font-bold border ${units.force === u ? 'bg-isuzu-red border-isuzu-red text-white' : 'bg-black/30 border-white/10 text-zinc-500 hover:bg-white/5'}`}
                                            >
                                                {u}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <label className="text-[10px] uppercase font-bold text-zinc-500">Angle Unit</label>
                                    <div className="flex gap-2 mt-1">
                                        {['DEGREES', 'RADIANS'].map(u => (
                                            <button 
                                                key={u}
                                                onClick={() => setUnits({...units, angle: u})}
                                                className={`flex-1 py-2 rounded text-xs font-bold border ${units.angle === u ? 'bg-isuzu-red border-isuzu-red text-white' : 'bg-black/30 border-white/10 text-zinc-500 hover:bg-white/5'}`}
                                            >
                                                {u}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <label className="text-[10px] uppercase font-bold text-zinc-500">Torque Unit</label>
                                    <div className="flex gap-2 mt-1">
                                        {['NM', 'LB-FT'].map(u => (
                                            <button 
                                                key={u}
                                                onClick={() => setUnits({...units, torque: u})}
                                                className={`flex-1 py-2 rounded text-xs font-bold border ${units.torque === u ? 'bg-isuzu-red border-isuzu-red text-white' : 'bg-black/30 border-white/10 text-zinc-500 hover:bg-white/5'}`}
                                            >
                                                {u}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* EVENT TAB */}
                {activeTab === 'EVENT' && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div className="glass-panel p-6 rounded-xl space-y-6">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 bg-white/5 rounded-lg">
                                    <Calendar className="w-6 h-6 text-isuzu-red" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-white">Event Details</h3>
                                    <p className="text-xs text-zinc-500">Session configuration</p>
                                </div>
                            </div>
                            
                            <div className="space-y-4">
                                <div>
                                    <label className="text-[10px] uppercase font-bold text-zinc-500">Event Name</label>
                                    <input 
                                        type="text" 
                                        value={eventName}
                                        onChange={(e) => setEventName(e.target.value)}
                                        className="w-full bg-black/30 border border-white/10 rounded px-3 py-2 text-white outline-none focus:border-isuzu-red mt-1"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] uppercase font-bold text-zinc-500">Track Selection</label>
                                    <div className="relative mt-1">
                                        <select 
                                            value={trackName}
                                            onChange={(e) => setTrackName(e.target.value)}
                                            className="w-full bg-black/30 border border-white/10 rounded px-3 py-2 text-white outline-none focus:border-isuzu-red appearance-none"
                                        >
                                            <option>Buriram International Circuit</option>
                                            <option>Sepang International Circuit</option>
                                            <option>Suzuka Circuit</option>
                                            <option>Fuji Speedway</option>
                                        </select>
                                        <MapPin className="absolute right-3 top-2.5 w-4 h-4 text-zinc-500 pointer-events-none" />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-[10px] uppercase font-bold text-zinc-500">Session Type</label>
                                    <select 
                                        value={sessionType}
                                        onChange={(e) => setSessionType(e.target.value)}
                                        className="w-full bg-black/30 border border-white/10 rounded px-3 py-2 text-white outline-none focus:border-isuzu-red mt-1 appearance-none"
                                    >
                                        <option value="PRACTICE">Practice (FP1/FP2)</option>
                                        <option value="QUALIFYING">Qualifying (Q1/Q2/Q3)</option>
                                        <option value="RACE">Race</option>
                                        <option value="TEST">Private Testing</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* GARAGE TAB */}
                {activeTab === 'GARAGE' && (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        <div className="lg:col-span-8 space-y-6">
                            {/* Garage / Cars */}
                            <div className="glass-panel p-6 rounded-xl">
                                <div className="flex justify-between items-center mb-6">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-white/5 rounded-lg">
                                            <Car className="w-6 h-6 text-isuzu-red" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold text-white">Garage Management</h3>
                                            <p className="text-xs text-zinc-500">Manage vehicle telemetry endpoints</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Add Car Form */}
                                <div className="bg-white/5 p-4 rounded-lg mb-6 flex gap-2 items-center">
                                    <div className="flex-1">
                                        <label className="text-[10px] text-zinc-500 uppercase font-bold pl-1">Car Number</label>
                                        <input 
                                            type="text" 
                                            placeholder="e.g. 04"
                                            className="w-full bg-black/30 border border-white/10 rounded px-3 py-1.5 text-xs text-white outline-none focus:border-isuzu-red mt-1"
                                            value={newCarNumber}
                                            onChange={(e) => setNewCarNumber(e.target.value)}
                                        />
                                    </div>
                                    <div className="flex-[3]">
                                        <label className="text-[10px] text-zinc-500 uppercase font-bold pl-1">Car Model</label>
                                        <input 
                                            type="text" 
                                            placeholder="e.g. Isuzu D-Max 2024 Proto"
                                            className="w-full bg-black/30 border border-white/10 rounded px-3 py-1.5 text-xs text-white outline-none focus:border-isuzu-red mt-1"
                                            value={newCarModel}
                                            onChange={(e) => setNewCarModel(e.target.value)}
                                        />
                                    </div>
                                    <div className="self-end">
                                        <button 
                                            onClick={handleAddCar}
                                            disabled={!newCarModel || !newCarNumber}
                                            className="bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 text-white px-4 py-1.5 rounded text-xs flex items-center gap-1 h-[30px]"
                                        >
                                            <Plus className="w-3 h-3" /> Add Car
                                        </button>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {cars.map(car => (
                                        <div key={car.id} className="bg-black/20 border border-white/5 rounded-lg p-4 flex justify-between items-center group hover:border-white/20 transition-colors relative">
                                            {editingCarId === car.id ? (
                                                <div className="flex-1 flex gap-2 items-center">
                                                    <input 
                                                        value={editNumber} 
                                                        onChange={e => setEditNumber(e.target.value)}
                                                        className="w-12 bg-black border border-isuzu-red rounded px-1 py-1 text-center text-sm font-bold"
                                                    />
                                                    <input 
                                                        value={editModel} 
                                                        onChange={e => setEditModel(e.target.value)}
                                                        className="flex-1 bg-black border border-isuzu-red rounded px-2 py-1 text-sm"
                                                    />
                                                    <button onClick={saveEditCar} className="p-1 text-green-500 hover:bg-white/10 rounded"><Save className="w-4 h-4"/></button>
                                                    <button onClick={() => setEditingCarId(null)} className="p-1 text-zinc-500 hover:bg-white/10 rounded"><X className="w-4 h-4"/></button>
                                                </div>
                                            ) : (
                                                <>
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-12 h-12 rounded bg-zinc-900 flex items-center justify-center text-xl font-black italic text-zinc-700 group-hover:text-isuzu-red transition-colors">
                                                            {car.number}
                                                        </div>
                                                        <div>
                                                            <div className="text-sm font-medium text-white">{car.model}</div>
                                                            <div className="text-[10px] text-zinc-500 uppercase tracking-wider flex items-center gap-1.5">
                                                                <div className={`w-1.5 h-1.5 rounded-full ${car.status === 'Active' ? 'bg-green-500 animate-pulse' : 'bg-yellow-500'}`}></div>
                                                                {car.status}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button 
                                                            onClick={() => startEditCar(car)}
                                                            className="p-2 text-zinc-600 hover:text-white transition-colors"
                                                        >
                                                            <Pencil className="w-4 h-4" />
                                                        </button>
                                                        <button 
                                                            onClick={() => setCars(cars.filter(c => c.id !== car.id))}
                                                            className="p-2 text-zinc-600 hover:text-red-500 transition-colors"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Drivers & Mapping */}
                            <div className="glass-panel p-6 rounded-xl">
                                    <div className="flex justify-between items-center mb-6">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-white/5 rounded-lg">
                                            <Shield className="w-6 h-6 text-blue-500" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold text-white">Driver Mapping</h3>
                                            <p className="text-xs text-zinc-500">Assign drivers to vehicles</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <input 
                                            type="text" 
                                            placeholder="Driver Name"
                                            className="bg-black/30 border border-white/10 rounded px-3 py-1.5 text-xs text-white outline-none focus:border-isuzu-red"
                                            value={newDriverName}
                                            onChange={(e) => setNewDriverName(e.target.value)}
                                        />
                                        <button 
                                            onClick={() => {
                                                if(newDriverName) {
                                                    setDrivers([...drivers, { id: Date.now(), name: newDriverName, carId: cars[0]?.id, license: 'Pending' }]);
                                                    setNewDriverName('');
                                                }
                                            }}
                                            className="bg-zinc-800 hover:bg-zinc-700 text-white px-3 py-1.5 rounded text-xs flex items-center gap-1"
                                        >
                                            <Plus className="w-3 h-3" /> Add
                                        </button>
                                    </div>
                                </div>

                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="border-b border-white/10 text-[10px] text-zinc-500 uppercase tracking-wider">
                                                <th className="py-3 pl-2">Driver</th>
                                                <th className="py-3">License</th>
                                                <th className="py-3">Assigned Vehicle</th>
                                                <th className="py-3 text-right pr-2">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="text-sm">
                                            {drivers.map(driver => (
                                                <tr key={driver.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                                    <td className="py-3 pl-2 font-medium text-white">{driver.name}</td>
                                                    <td className="py-3 text-zinc-400 font-mono text-xs">{driver.license}</td>
                                                    <td className="py-3">
                                                        <select 
                                                            value={driver.carId}
                                                            onChange={(e) => {
                                                                const newCarId = Number(e.target.value);
                                                                setDrivers(drivers.map(d => d.id === driver.id ? { ...d, carId: newCarId } : d));
                                                            }}
                                                            className="bg-black/30 border border-white/10 rounded px-2 py-1 text-xs text-white outline-none focus:border-isuzu-red"
                                                        >
                                                            {cars.map(c => (
                                                                <option key={c.id} value={c.id}>{c.number} - {c.model}</option>
                                                            ))}
                                                        </select>
                                                    </td>
                                                    <td className="py-3 text-right pr-2">
                                                        <button 
                                                            onClick={() => setDrivers(drivers.filter(d => d.id !== driver.id))}
                                                            className="text-zinc-600 hover:text-red-500 transition-colors"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>

                        {/* Team Access - Moved to Garage Tab */}
                        <div className="lg:col-span-4">
                            <div className="glass-panel p-6 rounded-xl">
                                    <div className="flex justify-between items-center mb-4">
                                    <div className="flex items-center gap-2">
                                        <Users className="w-5 h-5 text-zinc-400" />
                                        <h3 className="text-sm font-bold text-white">Team Access</h3>
                                    </div>
                                    <button className="text-[10px] bg-white/10 hover:bg-white/20 px-2 py-1 rounded text-white transition-colors">
                                        + Invite
                                    </button>
                                </div>
                                <div className="space-y-3">
                                    {users.map(u => (
                                        <div key={u.id} className="flex justify-between items-center p-2 rounded hover:bg-white/5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-xs font-bold">{u.name.charAt(0)}</div>
                                                <div>
                                                    <div className="text-sm text-white">{u.name}</div>
                                                    <div className="text-[10px] text-zinc-500">{u.role}</div>
                                                </div>
                                            </div>
                                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-black/40 text-zinc-400 border border-white/5">{u.access}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* THRESHOLDS TAB */}
                {activeTab === 'THRESHOLDS' && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div className="space-y-8">
                            <div className="glass-panel p-6 rounded-xl space-y-6">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="p-2 bg-white/5 rounded-lg">
                                        <Activity className="w-6 h-6 text-orange-500" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-white">Alert Thresholds</h3>
                                        <p className="text-xs text-zinc-500">Warning triggers for telemetry</p>
                                    </div>
                                </div>
                                
                                <div className="space-y-4">
                                    <div>
                                        <div className="flex justify-between items-center mb-1">
                                            <label className="text-[10px] uppercase font-bold text-zinc-500">Engine Temp High Warning</label>
                                            <span className="text-xs font-mono text-isuzu-red">{thresholds.engineTempHigh}°C</span>
                                        </div>
                                        <input 
                                            type="range" 
                                            min="90" max="130" 
                                            value={thresholds.engineTempHigh}
                                            onChange={(e) => setThresholds({...thresholds, engineTempHigh: Number(e.target.value)})}
                                            className="w-full accent-isuzu-red h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer"
                                        />
                                    </div>
                                    <div>
                                        <div className="flex justify-between items-center mb-1">
                                            <label className="text-[10px] uppercase font-bold text-zinc-500">Oil Pressure Low Warning</label>
                                            <span className="text-xs font-mono text-isuzu-red">{thresholds.oilPressureLow} Bar</span>
                                        </div>
                                        <input 
                                            type="range" 
                                            min="0" max="5" step="0.1"
                                            value={thresholds.oilPressureLow}
                                            onChange={(e) => setThresholds({...thresholds, oilPressureLow: Number(e.target.value)})}
                                            className="w-full accent-isuzu-red h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer"
                                        />
                                    </div>
                                    <div>
                                        <div className="flex justify-between items-center mb-1">
                                            <label className="text-[10px] uppercase font-bold text-zinc-500">Tire Temp High Warning</label>
                                            <span className="text-xs font-mono text-isuzu-red">{thresholds.tireTempHigh}°C</span>
                                        </div>
                                        <input 
                                            type="range" 
                                            min="80" max="120" 
                                            value={thresholds.tireTempHigh}
                                            onChange={(e) => setThresholds({...thresholds, tireTempHigh: Number(e.target.value)})}
                                            className="w-full accent-isuzu-red h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer"
                                        />
                                    </div>
                                    <div>
                                        <div className="flex justify-between items-center mb-1">
                                            <label className="text-[10px] uppercase font-bold text-zinc-500">Fuel Low Warning</label>
                                            <span className="text-xs font-mono text-isuzu-red">{thresholds.fuelLow} L</span>
                                        </div>
                                        <input 
                                            type="range" 
                                            min="1" max="20" 
                                            value={thresholds.fuelLow}
                                            onChange={(e) => setThresholds({...thresholds, fuelLow: Number(e.target.value)})}
                                            className="w-full accent-isuzu-red h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-8">
                            <div className="glass-panel p-6 rounded-xl space-y-6">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="p-2 bg-white/5 rounded-lg">
                                        <LineChart className="w-6 h-6 text-blue-500" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-white">Director Graph Thresholds</h3>
                                        <p className="text-xs text-zinc-500">Graph scaling and update frequency</p>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <div>
                                        <label className="text-[10px] uppercase font-bold text-zinc-500">Data Refresh Rate</label>
                                        <div className="flex gap-2 mt-2">
                                            {[1, 5, 10, 15].map(rate => (
                                                <button 
                                                    key={rate}
                                                    onClick={() => setRefreshRate(rate)}
                                                    className={`flex-1 py-2 rounded text-xs font-bold border ${refreshRate === rate ? 'bg-isuzu-red border-isuzu-red text-white' : 'bg-black/30 border-white/10 text-zinc-500 hover:bg-white/5'}`}
                                                >
                                                    {rate} Hz
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div>
                                            <div className="flex justify-between items-center mb-1">
                                                <label className="text-[10px] uppercase font-bold text-zinc-500">Speed Graph Max</label>
                                                <span className="text-xs font-mono text-blue-400">{graphThresholds.speedMax} KPH</span>
                                            </div>
                                            <input 
                                                type="range" 
                                                min="200" max="400" step="10"
                                                value={graphThresholds.speedMax}
                                                onChange={(e) => setGraphThresholds({...graphThresholds, speedMax: Number(e.target.value)})}
                                                className="w-full accent-blue-500 h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer"
                                            />
                                        </div>
                                        <div>
                                            <div className="flex justify-between items-center mb-1">
                                                <label className="text-[10px] uppercase font-bold text-zinc-500">RPM Graph Max</label>
                                                <span className="text-xs font-mono text-blue-400">{graphThresholds.rpmMax} RPM</span>
                                            </div>
                                            <input 
                                                type="range" 
                                                min="5000" max="12000" step="500"
                                                value={graphThresholds.rpmMax}
                                                onChange={(e) => setGraphThresholds({...graphThresholds, rpmMax: Number(e.target.value)})}
                                                className="w-full accent-blue-500 h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer"
                                            />
                                        </div>
                                        <div>
                                            <div className="flex justify-between items-center mb-1">
                                                <label className="text-[10px] uppercase font-bold text-zinc-500">G-Force Graph Max</label>
                                                <span className="text-xs font-mono text-blue-400">{graphThresholds.gForceMax} G</span>
                                            </div>
                                            <input 
                                                type="range" 
                                                min="2" max="8" step="0.5"
                                                value={graphThresholds.gForceMax}
                                                onChange={(e) => setGraphThresholds({...graphThresholds, gForceMax: Number(e.target.value)})}
                                                className="w-full accent-blue-500 h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* PLAN & BILLING TAB */}
                {activeTab === 'PLAN & BILLING' && (
                    <div className="space-y-8">
                        {/* Subscription Plan */}
                        <div className="glass-panel p-8 rounded-xl">
                            <h3 className="text-xl font-bold text-white mb-6">Subscription Plan</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Basic Plan */}
                                <div 
                                    onClick={() => setPlan('BASIC')}
                                    className={`relative p-8 rounded-xl border-2 cursor-pointer transition-all ${
                                        plan === 'BASIC' 
                                        ? 'border-isuzu-red bg-white/5' 
                                        : 'border-white/10 bg-black/20 hover:border-white/20'
                                    }`}
                                >
                                    {plan === 'BASIC' && (
                                        <div className="absolute top-4 right-4 text-isuzu-red">
                                            <Check className="w-6 h-6" />
                                        </div>
                                    )}
                                    <h4 className="text-sm font-bold text-zinc-400 tracking-widest uppercase mb-4">Basic</h4>
                                    <div className="mb-2">
                                        <span className="text-5xl font-bold text-white">$0</span>
                                    </div>
                                    <p className="text-xs text-zinc-500 uppercase tracking-wider mb-8">Per Month</p>
                                    <div className="text-center">
                                        {plan === 'BASIC' ? (
                                            <span className="text-sm font-bold text-isuzu-red">CURRENT PLAN</span>
                                        ) : (
                                            <span className="text-sm font-bold text-zinc-500 group-hover:text-white">CLICK TO SELECT</span>
                                        )}
                                    </div>
                                </div>

                                {/* Premium Plan */}
                                <div 
                                    onClick={() => setPlan('PREMIUM')}
                                    className={`relative p-8 rounded-xl border-2 cursor-pointer transition-all ${
                                        plan === 'PREMIUM' 
                                        ? 'border-isuzu-red bg-white/5' 
                                        : 'border-white/10 bg-black/20 hover:border-white/20'
                                    }`}
                                >
                                    {plan === 'PREMIUM' && (
                                        <div className="absolute top-4 right-4 text-isuzu-red">
                                            <Check className="w-6 h-6" />
                                        </div>
                                    )}
                                    <h4 className="text-sm font-bold text-zinc-400 tracking-widest uppercase mb-4">Premium</h4>
                                    <div className="mb-2">
                                        <span className="text-5xl font-bold text-white">$299</span>
                                    </div>
                                    <p className="text-xs text-zinc-500 uppercase tracking-wider mb-8">Per Month</p>
                                    <div className="text-center">
                                        {plan === 'PREMIUM' ? (
                                            <span className="text-sm font-bold text-isuzu-red">CURRENT PLAN</span>
                                        ) : (
                                            <span className="text-sm font-bold text-zinc-500 group-hover:text-white">CLICK TO SELECT</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Payment Methods */}
                        <div className="glass-panel p-8 rounded-xl">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-bold text-white">Payment Methods</h3>
                                <button className="flex items-center gap-2 bg-white text-black px-4 py-2 rounded-lg text-sm font-bold hover:bg-zinc-200 transition-colors">
                                    <Plus className="w-4 h-4" /> Add Card
                                </button>
                            </div>
                            <div className="space-y-4">
                                <div className="p-4 rounded-lg bg-white/5 border border-white/10 flex justify-between items-center">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-8 bg-zinc-800 rounded flex items-center justify-center border border-white/10">
                                            <CreditCard className="w-5 h-5 text-zinc-400" />
                                        </div>
                                        <div>
                                            <div className="text-sm font-bold text-white">Visa ending in 4242</div>
                                            <div className="text-xs text-zinc-500">Expires 12/2025</div>
                                        </div>
                                    </div>
                                    <span className="px-2 py-1 rounded bg-green-500/20 text-green-500 text-[10px] font-bold uppercase border border-green-500/20">Default</span>
                                </div>
                                <div className="p-4 rounded-lg bg-white/5 border border-white/10 flex justify-between items-center">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-8 bg-zinc-800 rounded flex items-center justify-center border border-white/10">
                                            <CreditCard className="w-5 h-5 text-zinc-400" />
                                        </div>
                                        <div>
                                            <div className="text-sm font-bold text-white">Mastercard ending in 8899</div>
                                            <div className="text-xs text-zinc-500">Expires 09/2024</div>
                                        </div>
                                    </div>
                                    <button className="text-xs text-zinc-500 hover:text-white transition-colors">Remove</button>
                                </div>
                            </div>
                        </div>

                        {/* Billing History */}
                        <div className="glass-panel p-8 rounded-xl">
                            <h3 className="text-xl font-bold text-white mb-6">Billing History</h3>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="border-b border-white/10 text-[10px] text-zinc-500 uppercase tracking-wider">
                                            <th className="pb-4 pl-2">Date</th>
                                            <th className="pb-4">Invoice ID</th>
                                            <th className="pb-4">Amount</th>
                                            <th className="pb-4">Status</th>
                                            <th className="pb-4 text-right pr-2">Download</th>
                                        </tr>
                                    </thead>
                                    <tbody className="text-sm">
                                        {[
                                            { date: 'Oct 01, 2023', id: 'INV-2023-001', amount: '$299.00', status: 'Paid' },
                                            { date: 'Sep 01, 2023', id: 'INV-2023-002', amount: '$299.00', status: 'Paid' },
                                            { date: 'Aug 01, 2023', id: 'INV-2023-003', amount: '$299.00', status: 'Paid' },
                                        ].map((invoice, i) => (
                                            <tr key={i} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                                <td className="py-4 pl-2 text-white">{invoice.date}</td>
                                                <td className="py-4 text-zinc-400 font-mono">{invoice.id}</td>
                                                <td className="py-4 text-white font-bold">{invoice.amount}</td>
                                                <td className="py-4">
                                                    <span className="px-2 py-0.5 rounded bg-green-500/20 text-green-500 text-[10px] font-bold uppercase border border-green-500/20">
                                                        {invoice.status}
                                                    </span>
                                                </td>
                                                <td className="py-4 text-right pr-2">
                                                    <button className="text-zinc-500 hover:text-white transition-colors">
                                                        <Download className="w-4 h-4 ml-auto" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Settings;