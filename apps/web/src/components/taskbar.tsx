"use client";

import { useEffect, useState } from 'react';
import { Terminal, Database, GitBranch, Settings, Cpu } from 'lucide-react';
import { useSystemStore } from '@devos/kernel';

export function Taskbar() {
  const [time, setTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const openWindow = useSystemStore(state => state.openWindow);

  const handleOpenTerminal = () => {
    openWindow({
      appId: 'devos.terminal',
      title: 'Terminal - bash',
      position: { x: window.innerWidth / 2 - 300, y: window.innerHeight / 2 - 200 },
      size: { width: 600, height: 400 },
      minimized: false,
      maximized: false
    });
  };

  return (
    <div className="z-50 w-full h-12 bg-[#111827]/80 backdrop-blur-md border-t border-white/10 flex items-center justify-between px-4 text-sm select-none">
      
      {/* Left: App Launcher & Running Apps */}
      <div className="flex items-center gap-2">
        <button className="h-8 w-8 rounded bg-[#6366F1] flex items-center justify-center text-white hover:bg-[#4F46E5] transition-colors shadow-[0_0_10px_rgba(99,102,241,0.4)]">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16m-7 6h7" />
          </svg>
        </button>
        
        <div className="w-px h-6 bg-white/10 mx-2"></div>
        
        {/* Placeholder App Icons */}
        <div className="flex items-center gap-1">
          <button onClick={handleOpenTerminal} className="h-8 w-8 rounded hover:bg-white/10 flex items-center justify-center text-[#D1D5DB] transition-colors relative">
            <Terminal size={18} />
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#6366F1]"></div>
          </button>
          <button className="h-8 w-8 rounded hover:bg-white/10 flex items-center justify-center text-[#D1D5DB] transition-colors">
            <Database size={18} />
          </button>
        </div>
      </div>

      {/* Center: System Status */}
      <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-4 text-xs text-white/50 font-mono">
        <div className="flex items-center gap-1.5 cursor-help hover:text-white/80 transition-colors">
          <Cpu size={14} />
          <span>CPU: 4%</span>
        </div>
        <div className="flex items-center gap-1.5 cursor-help hover:text-white/80 transition-colors">
          <div className="w-3 h-3 rounded-sm border border-current flex items-end overflow-hidden">
            <div className="w-full bg-current" style={{ height: '45%' }}></div>
          </div>
          <span>MEM: 45%</span>
        </div>
      </div>

      {/* Right: Tray & Clock */}
      <div className="flex items-center gap-3 text-white/70">
        <div className="flex items-center gap-2 px-2">
          <GitBranch size={16} className="hover:text-white cursor-pointer" />
          <Settings size={16} className="hover:text-white cursor-pointer" />
        </div>
        
        <div className="w-px h-6 bg-white/10"></div>
        
        <div className="font-mono text-[13px] font-medium tracking-wide">
          {time}
        </div>
      </div>

    </div>
  );
}
