import { create } from 'zustand';

// ─── Types ──────────────────────────────────────────────────────────────────

export type ProcessStatus = 'running' | 'suspended' | 'terminated';

export interface ProcessState {
  /** System-assigned process ID. */
  pid: number;
  /** Application that owns this process. */
  appId: string;
  /** The window ID this process is rendered in. */
  windowId: string;
  /** Current lifecycle status. */
  status: ProcessStatus;
  /** ISO timestamp of when the process started. */
  startedAt: string;
  /** Estimated memory usage in MB. */
  memoryMB: number;
}

export interface ProcessStoreState {
  processes: Record<number, ProcessState>;
  nextPid: number;
}

export interface ProcessStoreActions {
  /** Start a new process for the given app. Returns the assigned PID. */
  startProcess: (appId: string, windowId: string) => number;
  /** Kill a process by PID and mark it as terminated. */
  killProcess: (pid: number) => void;
  /** Get an array of all currently running processes. */
  getRunningApps: () => ProcessState[];
}

// ─── Store ──────────────────────────────────────────────────────────────────

export const useProcessStore = create<ProcessStoreState & ProcessStoreActions>((set, get) => ({
  // State
  processes: {},
  nextPid: 1,

  /** Start a new process for the given app. Returns the assigned PID. */
  startProcess: (appId, windowId) => {
    const pid = get().nextPid;

    const process: ProcessState = {
      pid,
      appId,
      windowId,
      status: 'running',
      startedAt: new Date().toISOString(),
      memoryMB: Math.round(Math.random() * 50 + 10), // Simulated baseline
    };

    set((state) => ({
      nextPid: state.nextPid + 1,
      processes: { ...state.processes, [pid]: process },
    }));

    return pid;
  },

  /** Kill a process by PID and mark it as terminated. */
  killProcess: (pid) =>
    set((state) => {
      const proc = state.processes[pid];
      if (!proc) return state;

      const remaining = { ...state.processes };
      delete remaining[pid];
      return { processes: remaining };
    }),

  /** Get an array of all currently running processes. */
  getRunningApps: () => {
    return Object.values(get().processes).filter((p) => p.status === 'running');
  },
}));
