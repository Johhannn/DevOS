"use client";

import { useState } from 'react';
import { useProcessStore } from '../../stores/processStore';
import { useWindowStore } from '../../stores/windowStore';
import { Terminal, Code2, FolderOpen, Zap, GitBranch, Settings2, Box } from 'lucide-react';

const APP_ICONS: Record<string, React.ElementType> = {
  'terminal': Terminal,
  'editor': Code2,
  'explorer': FolderOpen,
  'api-tester': Zap,
  'git-client': GitBranch,
  'settings': Settings2,
};

export function RunningApps() {
  const processes = useProcessStore((state) => state.processes);
  const windows = useWindowStore((state) => state.windows);
  const focusWindow = useWindowStore((state) => state.focusWindow);
  const restoreWindow = useWindowStore((state) => state.restoreWindow);
  const closeWindow = useWindowStore((state) => state.closeWindow);
  const minimiseWindow = useWindowStore((state) => state.minimiseWindow);
  const killProcess = useProcessStore((state) => state.killProcess);

  // We derive the list in render so it updates reactively.
  const runningApps = Object.values(processes).filter((p) => p.status === 'running');

  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; procId: number; winId: string } | null>(null);

  const handleAppClick = (winId: string) => {
    const win = windows[winId];
    if (win) {
      if (win.minimised) {
        restoreWindow(winId);
      } else {
        focusWindow(winId);
      }
    }
  };

  const handleContextMenu = (e: React.MouseEvent, procId: number, winId: string) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY - 120, procId, winId });
  };

  const closeContextMenu = () => setContextMenu(null);

  // Click outside to close context menu
  if (contextMenu) {
    const handleGlobalClick = () => closeContextMenu();
    window.addEventListener('click', handleGlobalClick, { once: true });
  }

  return (
    <>
      <div className="flex items-center gap-1.5 h-full">
        {runningApps.map((proc) => {
          const win = windows[proc.windowId];
          if (!win) return null; // Resiliency check

          // Some generic icon mapping
          const Icon = APP_ICONS[proc.appId] || Box;

          const isActive = win.focused && !win.minimised;

          return (
            <button
              key={proc.pid}
              onClick={() => handleAppClick(proc.windowId)}
              onContextMenu={(e) => handleContextMenu(e, proc.pid, proc.windowId)}
              className={`
                h-8 px-2 min-w-[32px] rounded-md border flex items-center justify-center gap-2 transition-all duration-200
                ${isActive 
                  ? 'bg-accent/20 border-accent/50 text-foreground' 
                  : 'bg-surface/40 border-border text-foreground hover:bg-surface'
                }
              `}
              title={win.title}
            >
              <Icon size={16} />
              {/* Optional: Show title text if space permits in an OS taskbar, we'll keep it icon-only or show small text */}
              <span className="text-xs font-medium max-w-[100px] truncate hidden sm:block">
                {win.title}
              </span>
            </button>
          );
        })}
      </div>

      {/* Context Menu Overlay */}
      {contextMenu && (
        <div 
          className="fixed z-[100] w-48 bg-panel border border-border rounded-lg shadow-xl py-1 text-sm text-foreground overflow-hidden"
          style={{ left: contextMenu.x, top: contextMenu.y }}
        >
          <button 
            className="w-full text-left px-4 py-2 hover:bg-accent/20 hover:text-accent transition-colors"
            onClick={() => {
              restoreWindow(contextMenu.winId);
              focusWindow(contextMenu.winId);
              closeContextMenu();
            }}
          >
            Bring to Front
          </button>
          <button 
            className="w-full text-left px-4 py-2 hover:bg-accent/20 hover:text-accent transition-colors"
            onClick={() => {
              minimiseWindow(contextMenu.winId);
              closeContextMenu();
            }}
          >
            Minimise
          </button>
          <div className="h-px w-full bg-border my-1"></div>
          <button 
            className="w-full text-left px-4 py-2 hover:bg-destructive/20 text-destructive transition-colors"
            onClick={() => {
              closeWindow(contextMenu.winId);
              killProcess(contextMenu.procId);
              closeContextMenu();
            }}
          >
            Close App
          </button>
        </div>
      )}
    </>
  );
}
