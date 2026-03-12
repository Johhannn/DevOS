import { create } from 'zustand';

// ─── Types ──────────────────────────────────────────────────────────────────

export type BootStatus = 'booting' | 'ready';
export type ThemeMode = 'dark' | 'light' | 'system';

export interface SystemState {
  bootStatus: BootStatus;
  theme: ThemeMode;
  activeUserId: string | null;
  currentTime: Date;
}

export interface SystemActions {
  /** Boot the system and transition to ready state. */
  boot: () => void;
  /** Change the active theme mode. */
  setTheme: (theme: ThemeMode) => void;
  /** Advance the internal clock. Called every second by a setInterval. */
  tick: () => void;
}

// ─── Store ──────────────────────────────────────────────────────────────────

export const useSystemStore = create<SystemState & SystemActions>((set) => ({
  // State
  bootStatus: 'booting',
  theme: 'dark',
  activeUserId: null,
  currentTime: new Date(),

  // Actions

  /** Boot the system and transition to ready state. */
  boot: () => set({ bootStatus: 'ready' }),

  /** Change the active theme mode. */
  setTheme: (theme) => set({ theme }),

  /** Advance the internal clock. Called every second by a setInterval. */
  tick: () => set({ currentTime: new Date() }),
}));
