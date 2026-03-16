"use client";

import { useWindowStore } from '../../stores/windowStore';
import { AppWindow } from './AppWindow';
import { AnimatePresence } from 'framer-motion';
import { useMemo } from 'react';

export function WindowManager() {
  // Select the stable record — derive array via useMemo to avoid infinite re-renders
  const windows = useWindowStore((state) => state.windows);
  const sortedWindows = useMemo(
    () => Object.values(windows).sort((a, b) => a.zIndex - b.zIndex),
    [windows]
  );

  return (
    <div className="absolute inset-0 inset-b-12 pointer-events-none z-10">
      <div className="relative w-full h-full pointer-events-auto overflow-hidden">
        <AnimatePresence>
          {sortedWindows.map((win) => (
            <AppWindow key={win.id} windowId={win.id} />
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
