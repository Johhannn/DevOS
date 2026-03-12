export type EventHandler<T = any> = (payload: T) => void | Promise<void>;
export type Middleware = (eventName: string, payload: any) => boolean | Promise<boolean>;

export class EventBus {
  private handlers: Map<string, EventHandler[]> = new Map();
  private middlewares: Middleware[] = [];

  /**
   * Register a middleware that runs before any event handler.
   * If the middleware returns false, the event is blocked.
   */
  public use(middleware: Middleware) {
    this.middlewares.push(middleware);
  }

  /**
   * Subscribe to an event.
   */
  public on<T = any>(eventName: string, handler: EventHandler<T>) {
    if (!this.handlers.has(eventName)) {
      this.handlers.set(eventName, []);
    }
    this.handlers.get(eventName)!.push(handler);
  }

  /**
   * Unsubscribe from an event.
   */
  public off<T = any>(eventName: string, handler: EventHandler<T>) {
    const constHandlers = this.handlers.get(eventName);
    if (!constHandlers) return;
    
    this.handlers.set(
      eventName,
      constHandlers.filter(h => h !== handler)
    );
  }

  /**
   * Emit an event to all subscribers.
   * Executes middlewares first. If any middleware returns false, the event is aborted.
   */
  public async emit<T = any>(eventName: string, payload: T): Promise<boolean> {
    // Run middlewares
    for (const middleware of this.middlewares) {
      const allowed = await middleware(eventName, payload);
      if (!allowed) {
        console.warn(`[EventBus] Event blocked by middleware: ${eventName}`);
        return false;
      }
    }

    const constHandlers = this.handlers.get(eventName);
    if (!constHandlers || constHandlers.length === 0) {
      return true; // No handlers, but event was allowed
    }

    // Execute handlers concurrently
    await Promise.all(
      constHandlers.map(async (handler) => {
        try {
          await handler(payload);
        } catch (error) {
          console.error(`[EventBus] Error in handler for event ${eventName}:`, error);
        }
      })
    );

    return true;
  }
}
