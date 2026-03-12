import type { KernelEvent, EventHandler, Middleware } from './types';
import type { KernelEventMap, KernelEventName } from './events';

// ─── EventBus ───────────────────────────────────────────────────────────────
// The central nervous system of DevOS. Provides typed pub/sub with:
//   • Wildcard subscriptions (e.g. 'filesystem.*')
//   • Middleware pipeline (can block events)
//   • Error isolation (one handler crash won't stop others)
//   • Dev-mode logging with timestamps

type HandlerEntry = {
  pattern: string;
  handler: EventHandler<unknown>;
  once: boolean;
};

export class EventBus {
  private handlers: HandlerEntry[] = [];
  private middlewares: Middleware[] = [];
  private devMode: boolean;

  constructor(options?: { devMode?: boolean }) {
    this.devMode = options?.devMode ?? true;
  }

  // ── Subscribe ──────────────────────────────────────────────────────────

  /**
   * Subscribe to an event. Supports wildcards like 'filesystem.*'.
   */
  on<E extends KernelEventName>(event: E, handler: EventHandler<KernelEventMap[E]>): () => void;
  on(event: string, handler: EventHandler<unknown>): () => void;
  on(event: string, handler: EventHandler<unknown>): () => void {
    const entry: HandlerEntry = { pattern: event, handler, once: false };
    this.handlers.push(entry);
    // Return unsubscribe function
    return () => this.off(event, handler);
  }

  /**
   * Subscribe to an event, but only fire once.
   */
  once<E extends KernelEventName>(event: E, handler: EventHandler<KernelEventMap[E]>): () => void;
  once(event: string, handler: EventHandler<unknown>): () => void;
  once(event: string, handler: EventHandler<unknown>): () => void {
    const entry: HandlerEntry = { pattern: event, handler, once: true };
    this.handlers.push(entry);
    return () => this.off(event, handler);
  }

  /**
   * Unsubscribe a specific handler from an event.
   */
  off(event: string, handler: EventHandler<unknown>): void {
    this.handlers = this.handlers.filter(
      (entry) => !(entry.pattern === event && entry.handler === handler)
    );
  }

  // ── Middleware ──────────────────────────────────────────────────────────

  /**
   * Register a middleware function. Middlewares execute in order before
   * handlers. Return `false` from a middleware to block the event.
   */
  use(middleware: Middleware): void {
    this.middlewares.push(middleware);
  }

  // ── Emit ───────────────────────────────────────────────────────────────

  /**
   * Emit a typed event. Runs middleware pipeline first, then matching handlers.
   */
  async emit<E extends KernelEventName>(
    event: E,
    payload: KernelEventMap[E],
    source?: string
  ): Promise<void>;
  async emit(event: string, payload: unknown, source?: string): Promise<void>;
  async emit(event: string, payload: unknown, source?: string): Promise<void> {
    const kernelEvent: KernelEvent = {
      type: event,
      payload,
      timestamp: new Date().toISOString(),
      source: source ?? 'kernel',
    };

    // Dev-mode logging
    if (this.devMode) {
      console.log(
        `%c[EventBus] %c${event}`,
        'color: #6366F1; font-weight: bold',
        'color: #06B6D4',
        payload
      );
    }

    // Run middleware pipeline
    for (const mw of this.middlewares) {
      try {
        const allowed = await mw(kernelEvent);
        if (allowed === false) {
          if (this.devMode) {
            console.log(
              `%c[EventBus] %c${event} blocked by middleware`,
              'color: #6366F1; font-weight: bold',
              'color: #EF4444'
            );
          }
          return;
        }
      } catch (err) {
        console.error('[EventBus] Middleware error:', err);
      }
    }

    // Collect matching handlers
    const toRemove: HandlerEntry[] = [];

    for (const entry of this.handlers) {
      if (!this.matches(entry.pattern, event)) continue;

      // Error isolation — one handler crash doesn't stop others
      try {
        await entry.handler(kernelEvent);
      } catch (err) {
        console.error(`[EventBus] Handler error for "${event}":`, err);
      }

      if (entry.once) {
        toRemove.push(entry);
      }
    }

    // Clean up one-time handlers
    if (toRemove.length > 0) {
      this.handlers = this.handlers.filter((e) => !toRemove.includes(e));
    }
  }

  // ── Wildcard Matching ──────────────────────────────────────────────────

  /**
   * Check if a pattern matches an event name.
   *   'filesystem.*'  matches  'filesystem.read'
   *   '*'             matches  everything
   *   'process.start' matches  'process.start' only
   */
  private matches(pattern: string, event: string): boolean {
    if (pattern === '*') return true;
    if (pattern === event) return true;

    // Wildcard: 'filesystem.*' should match 'filesystem.read'
    if (pattern.endsWith('.*')) {
      const prefix = pattern.slice(0, -2);
      return event.startsWith(prefix + '.');
    }

    return false;
  }

  // ── Utilities ──────────────────────────────────────────────────────────

  /**
   * Remove all handlers and middlewares. Useful for testing.
   */
  clear(): void {
    this.handlers = [];
    this.middlewares = [];
  }

  /**
   * Get the count of active subscriptions.
   */
  get listenerCount(): number {
    return this.handlers.length;
  }
}

// ── Singleton ──────────────────────────────────────────────────────────────
export const kernel = new EventBus({ devMode: true });
