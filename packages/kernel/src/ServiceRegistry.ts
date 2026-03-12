// ─── Service Registry ───────────────────────────────────────────────────────
// A typed dependency injection container for DevOS kernel services.
// Other packages can augment the KernelServices interface via declaration
// merging to get full type safety when calling registry.get<T>().

/**
 * Augmentable interface for kernel services.
 * Other packages extend this via declaration merging:
 *
 * ```ts
 * declare module '@devos/kernel' {
 *   interface KernelServices {
 *     vfs: VirtualFileSystem;
 *   }
 * }
 * ```
 */
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface KernelServices {}

export class ServiceRegistry {
  private services = new Map<string, unknown>();

  /**
   * Register a service instance by name.
   * Overwrites if a service with the same name already exists.
   */
  register<K extends keyof KernelServices>(
    name: K,
    service: KernelServices[K]
  ): void;
  register(name: string, service: unknown): void;
  register(name: string, service: unknown): void {
    if (this.services.has(name)) {
      console.warn(`[ServiceRegistry] Overwriting existing service: "${name}"`);
    }
    this.services.set(name, service);
  }

  /**
   * Retrieve a registered service by name.
   * Throws if the service has not been registered.
   */
  get<K extends keyof KernelServices>(name: K): KernelServices[K];
  get<T = unknown>(name: string): T;
  get<T = unknown>(name: string): T {
    if (!this.services.has(name)) {
      throw new Error(
        `[ServiceRegistry] Service "${name}" is not registered. ` +
        `Available: [${[...this.services.keys()].join(', ')}]`
      );
    }
    return this.services.get(name) as T;
  }

  /**
   * Check whether a service is registered.
   */
  has(name: string): boolean {
    return this.services.has(name);
  }

  /**
   * Remove a service from the registry.
   */
  unregister(name: string): boolean {
    return this.services.delete(name);
  }

  /**
   * List all registered service names.
   */
  list(): string[] {
    return [...this.services.keys()];
  }

  /**
   * Remove all services. Useful for testing or shutdown.
   */
  clear(): void {
    this.services.clear();
  }
}

// ── Singleton ──────────────────────────────────────────────────────────────
export const registry = new ServiceRegistry();
