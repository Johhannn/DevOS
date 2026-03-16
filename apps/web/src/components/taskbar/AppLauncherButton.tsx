"use client";

import { Command } from 'lucide-react';
import { useProcessStore } from '../../stores/processStore';

export function AppLauncherButton() {
  const processes = useProcessStore((state) => state.processes);
  const noneOpen = Object.keys(processes).length === 0;

  return (
    <button
      className={`
        relative flex items-center justify-center w-10 h-10 rounded-lg
        hover:bg-accent/20 transition-colors group shrink-0
      `}
      onClick={() => {
        window.dispatchEvent(new CustomEvent('devos:open-launcher'));
      }}
    >
      <Command className="w-5 h-5 text-foreground group-hover:text-accent transition-colors" />
      {noneOpen && (
        <span className="absolute inset-0 rounded-lg shadow-[0_0_15px_rgba(var(--accent),0.5)] animate-pulse pointer-events-none" />
      )}
    </button>
  );
}
