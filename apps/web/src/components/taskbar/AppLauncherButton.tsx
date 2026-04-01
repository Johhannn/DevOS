"use client";

import { useProcessStore } from '../../stores/processStore';
import { Hexagon } from 'lucide-react';

export function AppLauncherButton() {
  // Subscribe to processes to know if there are any running apps
  const processes = useProcessStore((state) => state.processes);
  const runningAppsCount = Object.values(processes).filter((p) => p.status === 'running').length;
  
  const hasNoApps = runningAppsCount === 0;

  const handleClick = () => {
    window.dispatchEvent(new CustomEvent('devos:open-launcher'));
  };

  return (
    <button
      onClick={handleClick}
      className={`
        relative h-8 w-8 rounded-lg flex items-center justify-center
        text-white bg-accent hover:bg-accent/80 transition-colors shadow-sm
        ${hasNoApps ? 'animate-pulse' : ''}
      `}
      title="Open App Launcher (Cmd+K)"
    >
      <Hexagon size={18} fill="currentColor" />
      {hasNoApps && (
        <div className="absolute inset-0 rounded-lg shadow-[0_0_15px_rgba(99,102,241,0.6)] animate-pulse pointer-events-none"></div>
      )}
    </button>
  );
}
