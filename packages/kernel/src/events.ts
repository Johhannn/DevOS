// ─── Kernel Event Map ───────────────────────────────────────────────────────
// Typed event name → payload map. Used to provide autocomplete and type safety
// when emitting or subscribing to kernel events.

export interface KernelEventMap {
  // Filesystem events
  'filesystem.read':    { path: string };
  'filesystem.write':   { path: string; content: string };
  'filesystem.changed': { path: string; changeType: 'created' | 'modified' | 'deleted' };
  'filesystem.delete':  { path: string };
  'filesystem.mkdir':   { path: string };

  // Process lifecycle
  'process.start': { pid: string; appId: string };
  'process.kill':  { pid: string; reason?: string };
  'process.list':  Record<string, never>;

  // Window management
  'window.open':     { windowId: string; appId: string; title: string };
  'window.close':    { windowId: string };
  'window.focus':    { windowId: string };
  'window.minimise': { windowId: string };
  'window.maximise': { windowId: string };
  'window.restore':  { windowId: string };

  // Notifications
  'notification.send':    { id: string; title: string; body: string; severity?: 'info' | 'success' | 'warning' | 'error' };
  'notification.dismiss': { id: string };

  // AI subsystem
  'ai.query':    { prompt: string; context?: string };
  'ai.response': { response: string; tokens?: number };

  // System lifecycle
  'system.boot':         Record<string, never>;
  'system.shutdown':     Record<string, never>;
  'system.theme.change': { theme: 'dark' | 'light' | 'system' };
}

/**
 * Union of all valid event names.
 */
export type KernelEventName = keyof KernelEventMap;
