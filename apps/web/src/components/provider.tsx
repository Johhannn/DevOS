"use client";

import { useEffect, useState, createContext, useContext } from 'react';
import { kernel, CoreKernel } from '@devos/kernel';
import { VirtualFileSystem } from '@devos/filesystem';

// Create a context so UI components can consume the kernel
export const KernelContext = createContext<CoreKernel | null>(null);

export function useKernel() {
  const context = useContext(KernelContext);
  if (!context) throw new Error("KernelContext provider is missing");
  return context;
}

export function DevOSProvider({ children }: { children: React.ReactNode }) {
  const [booted, setBooted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function bootSystem() {
      try {
        console.log("Booting DevOS...");
        
        // Register Core Services
        const vfs = new VirtualFileSystem(kernel.events);
        await kernel.services.register(vfs);
        
        // Boot kernel
        await kernel.boot();
        setBooted(true);
      } catch (err: any) {
        console.error("Kernel Panic:", err);
        setError(err.message || "Unknown error during boot");
      }
    }
    
    bootSystem();

    return () => {
      kernel.shutdown();
    }
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
      <div className="flex h-screen w-screen items-center justify-center bg-[#0B0F19] text-white/70 font-mono">
        Loading DevOS Kernel...
      </div>
    );
  }

  return (
    <KernelContext.Provider value={kernel}>
      <div className="devos-root h-screen w-screen overflow-hidden bg-[#0B0F19] text-[#D1D5DB] font-sans selection:bg-[#6366F1]/30">
        {children}
      </div>
    </KernelContext.Provider>
  )
}
