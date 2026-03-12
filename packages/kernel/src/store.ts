import { createStore } from 'zustand/vanilla';
import { useStore as useZustandStore } from 'zustand';

// Process Types
export type ProcessState = 'Installing' | 'Launching' | 'Running' | 'Suspended' | 'Terminating' | 'Terminated';

export interface Process {
  pid: string;
  appId: string;
  state: ProcessState;
  startTime: number;
  windowId?: string;
}

export interface WindowState {
  id: string;
  appId: string;
  title: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
  focused: boolean;
  minimized: boolean;
  maximized: boolean;
  zIndex: number;
}

export interface SystemState {
  processes: Record<string, Process>;
  windows: Record<string, WindowState>;
  highestZIndex: number;
  addProcess: (process: Process) => void;
  updateProcess: (pid: string, updates: Partial<Process>) => void;
  removeProcess: (pid: string) => void;
  openWindow: (windowConfig: Omit<WindowState, 'id' | 'zIndex' | 'focused'>) => string;
  closeWindow: (id: string) => void;
  focusWindow: (id: string) => void;
  updateWindow: (id: string, updates: Partial<WindowState>) => void;
  toggleMinimize: (id: string) => void;
  toggleMaximize: (id: string) => void;
}

// Global Vanilla Zustand Store (can be used outside React)
export const systemStore = createStore<SystemState>((set) => ({
  processes: {},
  windows: {},
  highestZIndex: 10,
  
  addProcess: (process) => set((state) => ({
    processes: { ...state.processes, [process.pid]: process }
  })),
  
  updateProcess: (pid, updates) => set((state) => {
    const proc = state.processes[pid];
    if (!proc) return state;
    return {
      processes: { ...state.processes, [pid]: { ...proc, ...updates } }
    };
  }),

  removeProcess: (pid) => set((state) => {
    const newProcesses = { ...state.processes };
    delete newProcesses[pid];
    return { processes: newProcesses };
  }),

  openWindow: (config) => {
    const id = `win_${Math.random().toString(36).substr(2, 9)}`;
    set((state) => {
      const newZ = state.highestZIndex + 1;
      return {
        highestZIndex: newZ,
        windows: {
          ...state.windows,
          [id]: {
            ...config,
            id,
            zIndex: newZ,
            focused: true
          }
        }
      };
    });
    return id;
  },

  closeWindow: (id) => set((state) => {
    const newWindows = { ...state.windows };
    delete newWindows[id];
    return { windows: newWindows };
  }),

  focusWindow: (id) => set((state) => {
    const win = state.windows[id];
    if (!win || win.focused) return state;
    
    const newZ = state.highestZIndex + 1;
    const updatedWindows = Object.entries(state.windows).reduce((acc, [winId, w]) => {
      acc[winId] = { ...w, focused: winId === id };
      if (winId === id) acc[winId].zIndex = newZ;
      return acc;
    }, {} as Record<string, WindowState>);

    return { highestZIndex: newZ, windows: updatedWindows };
  }),

  updateWindow: (id, updates) => set((state) => {
    const win = state.windows[id];
    if (!win) return state;
    return {
      windows: { ...state.windows, [id]: { ...win, ...updates } }
    };
  }),

  toggleMinimize: (id) => set((state) => {
    const win = state.windows[id];
    if (!win) return state;
    return {
      windows: { ...state.windows, [id]: { ...win, minimized: !win.minimized } }
    };
  }),

  toggleMaximize: (id) => set((state) => {
    const win = state.windows[id];
    if (!win) return state;
    return {
      windows: { ...state.windows, [id]: { ...win, maximized: !win.maximized } }
    };
  })
}));

/** Helper hook for React components to use the kernel state */
export function useSystemStore<T>(selector: (state: SystemState) => T): T {
  return useZustandStore(systemStore, selector);
}
