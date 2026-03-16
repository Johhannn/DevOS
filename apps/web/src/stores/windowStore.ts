import { create } from 'zustand';

// ─── Types ──────────────────────────────────────────────────────────────────

export interface WindowState {
  /** Unique window identifier. */
  id: string;
  /** Application ID that owns this window. */
  appId: string;
  /** Title bar text. */
  title: string;
  /** Horizontal position in pixels. */
  x: number;
  /** Vertical position in pixels. */
  y: number;
  /** Width in pixels. */
  width: number;
  /** Height in pixels. */
  height: number;
  /** Minimum allowed width. */
  minWidth: number;
  /** Minimum allowed height. */
  minHeight: number;
  /** Z-order layer. Higher = on top. */
  zIndex: number;
  /** Whether the window is minimised to taskbar. */
  minimised: boolean;
  /** Whether the window is maximised to fill screen. */
  maximised: boolean;
  /** Whether this window currently has focus. */
  focused: boolean;
}

export interface WindowStoreState {
  windows: Record<string, WindowState>;
  maxZIndex: number;
}

export interface WindowStoreActions {
  /** Open a new window. Returns the generated window ID. */
  openWindow: (config: Partial<WindowState> & Pick<WindowState, 'appId' | 'title'>) => string;
  /** Close and remove a window. */
  closeWindow: (id: string) => void;
  /** Bring a window to the front and mark it as focused. */
  focusWindow: (id: string) => void;
  /** Minimise a window to the taskbar. */
  minimiseWindow: (id: string) => void;
  /** Maximise a window to fill the screen. */
  maximiseWindow: (id: string) => void;
  /** Restore a window from minimised or maximised state. */
  restoreWindow: (id: string) => void;
  /** Update window position after a drag. */
  updateWindowPosition: (id: string, x: number, y: number) => void;
  /** Update window size after a resize. */
  updateWindowSize: (id: string, width: number, height: number) => void;
}

// ─── Defaults ───────────────────────────────────────────────────────────────

const DEFAULT_WINDOW: Omit<WindowState, 'id' | 'appId' | 'title' | 'zIndex'> = {
  x: 100,
  y: 80,
  width: 700,
  height: 480,
  minWidth: 300,
  minHeight: 200,
  minimised: false,
  maximised: false,
  focused: true,
};

// ─── Store ──────────────────────────────────────────────────────────────────

export const useWindowStore = create<WindowStoreState & WindowStoreActions>((set, get) => ({
  // State
  windows: {},
  maxZIndex: 10,

  /** Open a new window. Returns the generated window ID. */
  openWindow: (config) => {
    const id = config.id ?? `win_${crypto.randomUUID().slice(0, 8)}`;
    const newZ = get().maxZIndex + 1;

    // Stagger position slightly so windows don't stack directly on top
    const existingCount = Object.keys(get().windows).length;
    const offsetX = (existingCount % 8) * 30;
    const offsetY = (existingCount % 8) * 30;

    const windowState: WindowState = {
      ...DEFAULT_WINDOW,
      ...config,
      id,
      x: config.x ?? DEFAULT_WINDOW.x + offsetX,
      y: config.y ?? DEFAULT_WINDOW.y + offsetY,
      zIndex: newZ,
      focused: true,
    };

    set((state) => {
      // Unfocus all other windows
      const updatedWindows = Object.fromEntries(
        Object.entries(state.windows).map(([wId, w]) => [wId, { ...w, focused: false }])
      );
      return {
        maxZIndex: newZ,
        windows: { ...updatedWindows, [id]: windowState },
      };
    });

    return id;
  },

  /** Close and remove a window. */
  closeWindow: (id) =>
    set((state) => {
      const remaining = { ...state.windows };
      delete remaining[id];
      return { windows: remaining };
    }),

  /** Bring a window to the front and mark it as focused. */
  focusWindow: (id) =>
    set((state) => {
      const win = state.windows[id];
      if (!win) return state;

      const newZ = state.maxZIndex + 1;
      const updatedWindows = Object.fromEntries(
        Object.entries(state.windows).map(([wId, w]) => [
          wId,
          { ...w, focused: wId === id, zIndex: wId === id ? newZ : w.zIndex },
        ])
      );
      return { maxZIndex: newZ, windows: updatedWindows };
    }),

  /** Minimise a window to the taskbar. */
  minimiseWindow: (id) =>
    set((state) => {
      const win = state.windows[id];
      if (!win) return state;
      return {
        windows: { ...state.windows, [id]: { ...win, minimised: true, focused: false } },
      };
    }),

  /** Maximise a window to fill the screen. */
  maximiseWindow: (id) =>
    set((state) => {
      const win = state.windows[id];
      if (!win) return state;
      return {
        windows: { ...state.windows, [id]: { ...win, maximised: true, minimised: false } },
      };
    }),

  /** Restore a window from minimised or maximised state. */
  restoreWindow: (id) =>
    set((state) => {
      const win = state.windows[id];
      if (!win) return state;

      const newZ = state.maxZIndex + 1;
      return {
        maxZIndex: newZ,
        windows: {
          ...state.windows,
          [id]: { ...win, minimised: false, maximised: false, focused: true, zIndex: newZ },
        },
      };
    }),

  /** Update window position after a drag. */
  updateWindowPosition: (id, x, y) =>
    set((state) => {
      const win = state.windows[id];
      if (!win) return state;
      return { windows: { ...state.windows, [id]: { ...win, x, y } } };
    }),

  /** Update window size after a resize. */
  updateWindowSize: (id, width, height) =>
    set((state) => {
      const win = state.windows[id];
      if (!win) return state;
      return {
        windows: {
          ...state.windows,
          [id]: {
            ...win,
            width: Math.max(width, win.minWidth),
            height: Math.max(height, win.minHeight),
          },
        },
      };
    }),
}));
