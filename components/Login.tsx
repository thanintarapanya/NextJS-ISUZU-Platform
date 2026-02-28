import React, { useState } from 'react';
import { ChevronRight, Lock } from 'lucide-react';

interface LoginProps {
  onLogin: () => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate auth delay for effect
    setTimeout(() => {
        onLogin();
    }, 1500);
  };

  return (
    <div className="w-full h-screen bg-black flex items-center justify-center relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 z-0">
            {/* Repositioned horizon line to top-[35%] to sit below logo but above inputs */}
            <div className="absolute top-[35%] left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-isuzu-red to-transparent opacity-20"></div>
            <div className="absolute top-[40%] left-[-20%] w-[50%] h-[300px] bg-isuzu-red opacity-[0.03] blur-[100px] rounded-full"></div>
            <div className="absolute bottom-[20%] right-[-10%] w-[40%] h-[200px] bg-white opacity-[0.02] blur-[80px] rounded-full"></div>
        </div>

        <div className="z-10 w-full max-w-md p-8">
            <div className="mb-12 text-center relative group flex flex-col items-center">
                {/* ADJUSTED LOGO VISIBILITY: Toned down backlights */}
                {/* 1. Broad soft glow - reduced opacity and blur */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-48 bg-white/10 blur-[60px] rounded-full pointer-events-none -z-10"></div>
                {/* 2. Focused intense center glow - reduced opacity */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-24 bg-white/10 blur-[30px] rounded-full pointer-events-none -z-10"></div>
                {/* 3. Red tint to match brand - reduced opacity */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-20 bg-isuzu-red/5 blur-[20px] rounded-full pointer-events-none -z-10"></div>
                
                <img 
                    src="https://lh3.googleusercontent.com/d/1sHycT8QTEakJWJqbOt-TCucWCAa_t5eJ" 
                    alt="ISUZU CUP Logo" 
                    className="h-28 w-auto object-contain mb-6 drop-shadow-[0_0_20px_rgba(255,255,255,0.2)] brightness-110 transition-transform duration-500 group-hover:scale-105"
                />
                <p className="text-zinc-500 text-xs font-mono uppercase tracking-[0.2em]">Engineering Division</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-4">
                    <div className="relative group">
                        <input 
                            type="email" 
                            placeholder="Race ID / Email"
                            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3.5 text-sm text-white placeholder-zinc-700 focus:outline-none focus:border-isuzu-red/50 focus:bg-white/10 transition-all"
                        />
                    </div>
                    <div className="relative">
                        <input 
                            type="password" 
                            placeholder="Access Token"
                            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3.5 text-sm text-white placeholder-zinc-700 focus:outline-none focus:border-isuzu-red/50 focus:bg-white/10 transition-all"
                        />
                        <Lock className="absolute right-4 top-3.5 w-4 h-4 text-zinc-700" />
                    </div>
                </div>

                <button 
                    type="submit"
                    className="w-full bg-white text-black font-medium py-3.5 rounded-lg mt-6 hover:bg-zinc-200 transition-all flex items-center justify-center gap-2 group relative overflow-hidden"
                    disabled={loading}
                >
                    {loading ? (
                        <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin"></div>
                    ) : (
                        <>
                            <span>Initialize Dashboard</span>
                            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </>
                    )}
                </button>
            </form>

            <div className="mt-8 text-center space-y-3">
                <p className="text-[10px] text-zinc-700 font-mono font-bold tracking-widest uppercase">
                    Power by Embedded Linux Group
                </p>
                <p className="text-[10px] text-zinc-800 font-mono">
                    SECURE CONNECTION REQUIRED • V2.4.0
                </p>
            </div>
        </div>
    </div>
  );
};

export default Login;