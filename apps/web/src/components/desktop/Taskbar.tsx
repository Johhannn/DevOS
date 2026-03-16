"use client";

import { useEffect, useState } from 'react';
import {
  Terminal,
  Database,
  Code,
  GitBranch,
  Settings,
  Cpu,
  Globe,
  FolderOpen,
} from 'lucide-react';
import { useWindowStore } from '../../stores/windowStore';
import { useProcessStore } from '../../stores/processStore';

interface TaskbarAppButton {
  id: string;
  appId: string;
  label: string;
  icon: React.ReactNode;
}

const TASKBAR_APPS: TaskbarAppButton[] = [
  { id: 'terminal', appId: 'devos.terminal', label: 'Terminal', icon: <Terminal size={18} /> },
  { id: 'editor', appId: 'devos.editor', label: 'Editor', icon: <Code size={18} /> },
  { id: 'explorer', appId: 'devos.explorer', label: 'Explorer', icon: <FolderOpen size={18} /> },
  { id: 'api-tester', appId: 'devos.api-tester', label: 'API Tester', icon: <Globe size={18} /> },
  { id: 'git', appId: 'devos.git-client', label: 'Git', icon: <GitBranch size={18} /> },
  { id: 'db', appId: 'devos.db', label: 'Database', icon: <Database size={18} /> },
];

export function Taskbar() {
  const [time, setTime] = useState<string>('');
  const openWindow = useWindowStore((s) => s.openWindow);
  const windows = useWindowStore((s) => s.windows);
  const focusWindow = useWindowStore((s) => s.focusWindow);
  const restoreWindow = useWindowStore((s) => s.restoreWindow);
  const processes = useProcessStore((s) => s.processes);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleAppClick = (appId: string, label: string) => {
    // Check if there's an existing window for this app
    const existingWindow = Object.values(windows).find(
      (w) => w.appId === appId
    );

    if (existingWindow) {
      // If minimised, restore it; otherwise just focus
      if (existingWindow.minimised) {
        restoreWindow(existingWindow.id);
      } else {
        focusWindow(existingWindow.id);
      }
    } else {
      openWindow({
        appId,
        title: label,
        width: 700,
        height: 480,
      });
    }
  };

  const runningCount = Object.keys(processes).length;

  return (
    <div className="z-50 w-full h-12 bg-panel/80 backdrop-blur-md border-t border-border flex items-center justify-between px-4 text-sm select-none">
      {/* Left: App Launcher & Pinned Apps */}
      <div className="flex items-center gap-2">
        {/* System Menu */}
        <button className="h-8 w-8 rounded bg-accent flex items-center justify-center text-white hover:bg-accent/80 transition-colors shadow-[0_0_10px_rgba(99,102,241,0.4)]">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="w-4 h-4"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4 6h16M4 12h16m-7 6h7"
            />
          </svg>
        </button>

        <div className="w-px h-6 bg-border mx-1" />

        {/* Pinned App Buttons */}
        <div className="flex items-center gap-0.5">
          {TASKBAR_APPS.map((app) => {
            const isRunning = Object.values(windows).some(
              (w) => w.appId === app.appId
            );
            return (
              <button
                key={app.id}
                onClick={() => handleAppClick(app.appId, app.label)}
                title={app.label}
                className={`
                  h-9 w-9 rounded-lg flex items-center justify-center
                  text-muted hover:text-text hover:bg-surface/50
                  transition-all duration-150 relative
                `}
              >
                {app.icon}
                {isRunning && (
                  <div className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-accent" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Center: System Telemetry */}
      <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-4 text-xs text-muted font-mono">
        <div className="flex items-center gap-1.5 cursor-help hover:text-text transition-colors">
          <Cpu size={13} />
          <span>CPU: 4%</span>
        </div>
        <div className="flex items-center gap-1.5 cursor-help hover:text-text transition-colors">
          <div className="w-3 h-3 rounded-sm border border-current flex items-end overflow-hidden">
            <div className="w-full bg-current" style={{ height: '45%' }} />
          </div>
          <span>MEM: {runningCount * 12 + 45}%</span>
        </div>
      </div>

      {/* Right: Tray & Clock */}
      <div className="flex items-center gap-3 text-muted">
        <div className="flex items-center gap-2 px-2">
          <Settings
            size={16}
            className="hover:text-text cursor-pointer transition-colors"
            onClick={() =>
              handleAppClick('devos.settings', 'Settings')
            }
          />
        </div>

        <div className="w-px h-6 bg-border" />

        <div className="font-mono text-[13px] font-medium tracking-wide text-text/70">
          {time}
        </div>
      </div>
    </div>
  );
}
