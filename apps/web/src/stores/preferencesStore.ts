import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// ─── Types ──────────────────────────────────────────────────────────────────

export type ThemePreference = 'dark' | 'light' | 'system';
export type FontFamily = 'Inter' | 'JetBrains Mono' | 'Fira Code' | 'system-ui';

export interface KeyBinding {
  action: string;
  keys: string;
}

export interface PreferencesState {
  /** Active theme preference. */
  theme: ThemePreference;
  /** Editor / UI font size in pixels. */
  fontSize: number;
  /** Primary font family. */
  fontFamily: FontFamily;
  /** Desktop wallpaper identifier or CSS gradient. */
  wallpaper: string;
  /** Custom keyboard shortcut bindings. */
  keyBindings: KeyBinding[];
}

export interface PreferencesActions {
  /** Set a single preference by key. */
  setPreference: <K extends keyof PreferencesState>(key: K, value: PreferencesState[K]) => void;
  /** Reset all preferences to their default values. */
  resetDefaults: () => void;
}

// ─── Defaults ───────────────────────────────────────────────────────────────

const DEFAULT_PREFERENCES: PreferencesState = {
  theme: 'dark',
  fontSize: 14,
  fontFamily: 'Inter',
  wallpaper: 'linear-gradient(135deg, #0B0F19 0%, #111827 50%, #0B0F19 100%)',
  keyBindings: [
    { action: 'terminal.open', keys: 'Ctrl+`' },
    { action: 'command.palette', keys: 'Ctrl+Shift+P' },
    { action: 'window.close', keys: 'Ctrl+W' },
    { action: 'window.minimise', keys: 'Ctrl+M' },
    { action: 'window.maximise', keys: 'Ctrl+Shift+M' },
  ],
};

// ─── Store (persisted to localStorage) ──────────────────────────────────────

export const usePreferencesStore = create<PreferencesState & PreferencesActions>()(
  persist(
    (set) => ({
      // State (defaults)
      ...DEFAULT_PREFERENCES,

      /** Set a single preference by key. */
      setPreference: (key, value) => set({ [key]: value }),

      /** Reset all preferences to their default values. */
      resetDefaults: () => set(DEFAULT_PREFERENCES),
    }),
    {
      name: 'devos-preferences',
    }
  )
);
