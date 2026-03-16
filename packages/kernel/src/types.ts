// ─── Kernel Types ───────────────────────────────────────────────────────────

/**
 * Base interface that all kernel services must implement.
 */
export interface IService {
  /** Unique name used to register this service in the ServiceRegistry */
  readonly name: string;
  /** Called by the kernel during boot to initialise the service */
  init(): Promise<void>;
}

/**
 * Permission types that apps can request from the kernel.
 */
export type Permission =
  | 'filesystem.read'
  | 'filesystem.write'
  | 'process.spawn'
  | 'process.kill'
  | 'network.fetch'
  | 'network.socket'
  | 'clipboard.read'
  | 'clipboard.write'
  | 'notification.send'
  | 'ai.query'
  | 'system.settings';

/**
 * App category for launcher grouping.
 */
export type AppCategory =
  | 'development'
  | 'productivity'
  | 'system'
  | 'utility'
  | 'communication';

/**
 * Manifest that every DevOS application must declare.
 */
export interface AppManifest {
  /** Unique reverse-domain identifier, e.g. 'devos.terminal' */
  id: string;
  /** Human-readable name */
  name: string;
  /** Semver version string */
  version: string;
  /** Icon identifier (lucide icon name or URL) */
  icon: string;
  /** Permissions this app requires */
  permissions: Permission[];
  /** Module entry point path */
  entryPoint: string;
  /** Default window dimensions */
  defaultWindowSize: { width: number; height: number };
  /** Minimum window dimensions */
  minWindowSize: { width: number; height: number };
  /** App category for launcher */
  category: AppCategory;
}

/**
 * Generic kernel event wrapper.
 */
export interface KernelEvent<T = unknown> {
  /** The event name, e.g. 'filesystem.read' */
  type: string;
  /** Event payload */
  payload: T;
  /** ISO timestamp of when the event was emitted */
  timestamp: string;
  /** Optional source identifier (app ID or 'kernel') */
  source?: string;
}

/**
 * An event handler function.
 */
export type EventHandler<T = unknown> = (event: KernelEvent<T>) => void | Promise<void>;

/**
 * Middleware intercepts events before they reach handlers.
 * Return `false` to block the event from propagating.
 */
export type Middleware = (event: KernelEvent) => boolean | Promise<boolean>;
