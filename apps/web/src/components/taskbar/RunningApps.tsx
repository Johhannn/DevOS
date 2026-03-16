"use client";

import { useProcessStore } from '../../stores/processStore';
import { useWindowStore } from '../../stores/windowStore';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from '@devos/ui';
import { AppWindow, Folder, FileText, Terminal, Settings } from 'lucide-react';

// Temporary helper until we have a proper app registry
function getAppIcon(appId: string) {
  switch (appId) {
    case 'explorer': return <Folder className="w-4 h-4 shrink-0" />;
    case 'editor': return <FileText className="w-4 h-4 shrink-0" />;
    case 'terminal': return <Terminal className="w-4 h-4 shrink-0" />;
    case 'settings': return <Settings className="w-4 h-4 shrink-0" />;
    default: return <AppWindow className="w-4 h-4 shrink-0" />;
  }
}

export function RunningApps() {
  const processes = useProcessStore((state) => state.processes);
  const runningApps = Object.values(processes).filter((p) => p.status === 'running');
  
  const windows = useWindowStore((state) => state.windows);
  const focusWindow = useWindowStore((state) => state.focusWindow);
  const restoreWindow = useWindowStore((state) => state.restoreWindow);
  const minimiseWindow = useWindowStore((state) => state.minimiseWindow);
  const closeWindow = useWindowStore((state) => state.closeWindow);
  const killProcess = useProcessStore((state) => state.killProcess);

  return (
    <div className="flex items-center gap-1 mx-1 overflow-x-auto no-scrollbar">
      {runningApps.map((proc) => {
        const win = windows[proc.windowId];
        if (!win) return null;

        const isFocused = win.focused && !win.minimised;
        const icon = getAppIcon(proc.appId);

        return (
          <ContextMenu key={proc.pid}>
            <ContextMenuTrigger asChild>
              <button
                onClick={() => {
                  if (win.minimised) {
                    restoreWindow(proc.windowId);
                  } else {
                    focusWindow(proc.windowId);
                  }
                }}
                className={`
                  flex items-center gap-2 px-3 h-9 rounded-md transition-all border shrink-0
                  ${
                    isFocused
                      ? 'bg-accent/20 border-accent/50 text-foreground'
                      : 'bg-surface/40 border-border text-muted hover:bg-surface hover:text-foreground'
                  }
                `}
              >
                {icon}
                <span className="text-sm font-medium truncate max-w-[120px]">
                  {win.title}
                </span>
              </button>
            </ContextMenuTrigger>
            <ContextMenuContent>
              <ContextMenuItem
                onClick={() => {
                  if (win.minimised) restoreWindow(proc.windowId);
                  focusWindow(proc.windowId);
                }}
              >
                Bring to Front
              </ContextMenuItem>
              <ContextMenuItem onClick={() => minimiseWindow(proc.windowId)}>
                Minimise
              </ContextMenuItem>
              <ContextMenuSeparator />
              <ContextMenuItem
                variant="destructive"
                onClick={() => {
                  closeWindow(proc.windowId);
                  killProcess(proc.pid);
                }}
              >
                Close
              </ContextMenuItem>
            </ContextMenuContent>
          </ContextMenu>
        );
      })}
    </div>
  );
}
