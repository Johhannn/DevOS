"use client";

import { useWindowStore } from '../stores/windowStore';
import { Window } from './window';
import { AnimatePresence } from 'framer-motion';
import { useMemo } from 'react';

export function WindowManager() {
  // Select the stable record reference — don't call Object.values() inside the selector
  const windows = useWindowStore(state => state.windows);
  const windowList = useMemo(() => Object.values(windows), [windows]);

  return (
    <div className="absolute inset-0 pointer-events-none z-10">
      <div className="relative w-full h-full pointer-events-auto overflow-hidden">
        <AnimatePresence>
          {windowList.map(win => (
            <Window key={win.id} id={win.id} />
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

