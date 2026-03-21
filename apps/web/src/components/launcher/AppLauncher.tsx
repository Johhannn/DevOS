"use client";

import { useEffect, useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, TerminalSquare, Code2, FolderOpen, Zap, GitBranch, Settings2 } from 'lucide-react';
import { useWindowStore } from '../../stores/windowStore';
import { useProcessStore } from '../../stores/processStore';
import { kernel } from '@devos/kernel';

// ─── Data ───────────────────────────────────────────────────────────────────

interface AppItem {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
}

const INSTALLED_APPS: AppItem[] = [
  { id: 'terminal', title: 'Terminal', description: 'Command line interface', icon: TerminalSquare },
  { id: 'editor', title: 'Code Editor', description: 'Text and code editor', icon: Code2 },
  { id: 'explorer', title: 'File Explorer', description: 'Manage files and folders', icon: FolderOpen },
  { id: 'api-tester', title: 'API Tester', description: 'Test REST endpoints', icon: Zap },
  { id: 'git-client', title: 'Git Client', description: 'Version control GUI', icon: GitBranch },
  { id: 'settings', title: 'Settings', description: 'System preferences', icon: Settings2 },
];

export function AppLauncher() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  
  const openWindow = useWindowStore((state) => state.openWindow);
  const startProcess = useProcessStore((state) => state.startProcess);
  const inputRef = useRef<HTMLInputElement>(null);

  const filteredApps = INSTALLED_APPS.filter(app => 
    app.title.toLowerCase().includes(query.toLowerCase()) || 
    app.description.toLowerCase().includes(query.toLowerCase())
  );

  const launchApp = useCallback((app: AppItem) => {
    // 1. Emit kernel event
    void kernel.emit('process.start', { appId: app.id });
    
    // 2. Open window via store
    const windowId = openWindow({
      appId: app.id,
      title: app.title,
    });

    // 3. Register the process so the Taskbar shows it
    startProcess(app.id, windowId);
    
    // 4. Close launcher
    setIsOpen(false);
    setQuery('');
  }, [openWindow, startProcess]);

  // ─── Event Handling ─────────────────────────────────────────────────────────

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Toggle with Cmd/Ctrl + K
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
        return;
      }

      if (!isOpen) return;

      if (e.key === 'Escape') {
        setIsOpen(false);
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % filteredApps.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + filteredApps.length) % filteredApps.length);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredApps[selectedIndex]) {
          launchApp(filteredApps[selectedIndex]);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredApps, selectedIndex, launchApp]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query, isOpen]);

  useEffect(() => {
    if (isOpen) {
      // Focus input slightly after mount
      const t = setTimeout(() => inputRef.current?.focus(), 50);
      return () => clearTimeout(t);
    }
  }, [isOpen]);

  // Listen for custom event from Taskbar Launcher Button
  useEffect(() => {
    const handleOpenEvent = () => setIsOpen(true);
    window.addEventListener('devos:open-launcher', handleOpenEvent);
    return () => window.removeEventListener('devos:open-launcher', handleOpenEvent);
  }, []);

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh]">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="absolute inset-0 bg-dark/60 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative z-10 w-full max-w-lg bg-panel rounded-2xl shadow-elevated border border-border overflow-hidden"
          >
            {/* Search Input */}
            <div className="flex items-center px-4 py-4 border-b border-border gap-3">
              <Search className="w-5 h-5 text-muted shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search apps, files, commands..."
                className="flex-1 bg-transparent border-none outline-none text-foreground text-lg placeholder:text-muted/60"
                spellCheck={false}
              />
              <div className="flex items-center gap-1 shrink-0">
                <span className="text-[10px] text-muted font-mono bg-surface px-1.5 py-0.5 rounded border border-border uppercase">esc</span>
              </div>
            </div>

            {/* Results List */}
            <div className="max-h-[60vh] overflow-y-auto p-2">
              {filteredApps.length > 0 ? (
                <div className="mb-2">
                  <div className="px-3 py-2 text-xs font-semibold text-muted uppercase tracking-wider">
                    Applications
                  </div>
                  <div className="flex flex-col gap-1">
                    {filteredApps.map((app, index) => {
                      const isSelected = index === selectedIndex;
                      const Icon = app.icon;
                      
                      return (
                        <button
                          key={app.id}
                          className={`
                            flex items-center gap-4 px-3 py-3 rounded-xl transition-colors text-left w-full
                            ${isSelected ? 'bg-accent/20 border border-accent/20' : 'hover:bg-surface/50 border border-transparent'}
                          `}
                          onClick={() => launchApp(app)}
                          onMouseEnter={() => setSelectedIndex(index)}
                        >
                          <div className={`p-2 rounded-lg shrink-0 ${isSelected ? 'bg-accent/20 text-accent' : 'bg-surface text-foreground'}`}>
                            <Icon className="w-5 h-5" />
                          </div>
                          <div className="flex-1 flex flex-col min-w-0">
                            <span className="font-medium text-foreground truncate">{app.title}</span>
                            <span className="text-sm text-muted truncate">{app.description}</span>
                          </div>
                          {isSelected && (
                            <span className="text-[10px] text-muted font-mono bg-surface px-1.5 py-0.5 rounded border border-border shrink-0 ml-4 hidden sm:block">
                              ↵
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="py-12 flex flex-col items-center justify-center text-muted gap-3">
                  <Search className="w-8 h-8 opacity-20" />
                  <p>No results found for &quot;{query}&quot;</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
