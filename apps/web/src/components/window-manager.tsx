"use client";

import { useSystemStore } from '@devos/kernel';
import { Window } from './window';
import { AnimatePresence } from 'framer-motion';

export function WindowManager() {
  const windows = useSystemStore(state => Object.values(state.windows));

  return (
    <div className="absolute inset-0 pointer-events-none z-10">
      <div className="relative w-full h-full pointer-events-auto overflow-hidden">
        <AnimatePresence>
          {windows.map(win => (
            <Window key={win.id} id={win.id} />
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
