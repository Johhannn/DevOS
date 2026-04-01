"use client";

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePaletteStore } from '../../stores/paletteStore';
import { PaletteSearch } from './PaletteSearch';
import { PaletteResults } from './PaletteResults';

export function CommandPalette() {
  const { isOpen, close, open, query, setQuery } = usePaletteStore();

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        isOpen ? close() : open();
      }
      
      if (isOpen && e.key === 'Escape') {
        e.preventDefault();
        close();
      }
    };
    
    const handleLauncherClick = () => isOpen ? close() : open();
    
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('devos:open-launcher', handleLauncherClick);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('devos:open-launcher', handleLauncherClick);
    };
  }, [isOpen, open, close]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div 
        className="fixed inset-0 bg-desktop/70 backdrop-blur-sm z-50 flex items-start justify-center pt-[20vh]"
        onClick={close} // Click outside to close
      >
        <motion.div
          initial={{ scale: 0.98, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.98, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25, duration: 0.15 }}
          className="w-full max-w-xl bg-panel rounded-2xl border border-border shadow-elevated overflow-hidden flex flex-col max-h-[60vh]"
          onClick={e => e.stopPropagation()}
        >
          <PaletteSearch query={query} onQueryChange={setQuery} />
          
          <div className="flex-1 overflow-y-auto min-h-0 bg-black/20 no-scrollbar">
            <PaletteResults />
          </div>

          {/* Footer Hint */}
          <div className="h-8 border-t border-border bg-panel flex items-center justify-between px-4 select-none shrink-0 text-[10px] text-muted font-medium">
             <div className="flex items-center gap-4">
               <span className="flex items-center gap-1.5"><kbd className="px-1 border border-border rounded bg-white/5 opacity-80">↑</kbd><kbd className="px-1 border border-border rounded bg-white/5 opacity-80">↓</kbd> navigate</span>
               <span className="flex items-center gap-1.5"><kbd className="px-1 border border-border rounded bg-white/5 opacity-80">↵</kbd> select</span>
             </div>
             <span className="flex items-center gap-1.5"><kbd className="px-1 border border-border rounded bg-white/5 opacity-80">esc</kbd> close</span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
