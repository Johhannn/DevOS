"use client";

import { useEffect, useState, createContext, useContext } from 'react';
import { kernel, registry } from '@devos/kernel';
import type { EventBus, ServiceRegistry } from '@devos/kernel';
import { vfs } from '@devos/filesystem';

// ─── Kernel Context ─────────────────────────────────────────────────────────
interface KernelContextValue {
  events: EventBus;
  services: ServiceRegistry;
}

export const KernelContext = createContext<KernelContextValue | null>(null);

export function useKernel(): KernelContextValue {
  const context = useContext(KernelContext);
  if (!context) throw new Error("useKernel must be used within <DevOSProvider>");
  return context;
}

// ─── Provider ───────────────────────────────────────────────────────────────
export function DevOSProvider({ children }: { children: React.ReactNode }) {
  const [booted, setBooted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function bootSystem() {
      try {
        console.log("Booting DevOS...");

        // Initialise Virtual File System
        await vfs.init();
        registry.register('filesystem', vfs);

        // Emit system boot event
        await kernel.emit('system.boot', {});
        setBooted(true);
        console.log("DevOS ready.");
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Unknown error during boot";
        console.error("Kernel Panic:", err);
        setError(message);
      }
    }
    
    bootSystem();

    return () => {
      kernel.emit('system.shutdown', {});
    };
  }, []);

  if (error) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-black text-red-500 font-mono flex-col gap-4">
        <h1 className="text-4xl font-bold">KERNEL PANIC</h1>
        <p>{error}</p>
        <button onClick={() => window.location.reload()} className="px-4 py-2 border border-red-500 hover:bg-red-900/50">
          Reboot System
        </button>
      </div>
    );
  }

  if (!booted) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-desktop text-white/70 font-mono">
        Loading DevOS Kernel...
      </div>
    );
  }

  return (
    <KernelContext.Provider value={{ events: kernel, services: registry }}>
      <div className="devos-root h-screen w-screen overflow-hidden bg-desktop text-text font-sans selection:bg-accent/30">
        {children}
      </div>
    </KernelContext.Provider>
  );
}
