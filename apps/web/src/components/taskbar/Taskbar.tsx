"use client";

import { AppLauncherButton } from './AppLauncherButton';
import { RunningApps } from './RunningApps';
import { SystemTray } from './SystemTray';
import { Clock } from './Clock';

export function Taskbar() {
  return (
    <div className="fixed bottom-0 left-0 right-0 h-12 bg-panel/90 backdrop-blur-md border-t border-border flex items-center justify-between px-3 z-50">
      <div className="flex items-center gap-2 h-full flex-1 overflow-hidden">
        <AppLauncherButton />
        <div className="w-px h-6 bg-border mx-1 shrink-0" />
        <RunningApps />
      </div>
      <div className="flex items-center gap-2 h-full shrink-0">
        <SystemTray />
        <Clock />
      </div>
    </div>
  );
}
