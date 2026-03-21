"use client";

import { useEffect, useState } from 'react';
import { AppLauncherButton } from './AppLauncherButton';
import { RunningApps } from './RunningApps';
import { SystemTray } from './SystemTray';
import { Clock } from './Clock';

export function Taskbar() {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 h-12 bg-panel/90 backdrop-blur-md border-t border-border flex items-center justify-between px-3 select-none">
      
      {/* Left Section: Launcher & Running Apps */}
      <div className="flex items-center gap-2 h-full">
        <AppLauncherButton />
        <div className="w-px h-6 bg-border mx-1"></div>
        <RunningApps />
      </div>

      {/* Right Section: System Tray & Clock */}
      <div className="flex items-center gap-2 h-full">
        <SystemTray />
        <div className="w-px h-6 bg-border mx-1"></div>
        <Clock />
      </div>

    </div>
  );
}
