// ─── Barrel Export ──────────────────────────────────────────────────────────
// Re-exports everything from the kernel package as a single entry point.

export { EventBus, kernel } from './EventBus';
export { ServiceRegistry, registry } from './ServiceRegistry';
export type { KernelServices } from './ServiceRegistry';
export type { KernelEventMap, KernelEventName } from './events';
export type {
  KernelEvent,
  EventHandler,
  Middleware,
  AppManifest,
  Permission,
  AppCategory,
} from './types';

// Window & process state management
export * from './store';
