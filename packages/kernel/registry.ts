export interface IService {
  name: string;
  init?(): Promise<void>;
  shutdown?(): Promise<void>;
}

export class ServiceRegistry {
  private services: Map<string, any> = new Map();

  /**
   * Register a service instance with the kernel.
   */
  public async register<T extends IService>(service: T): Promise<void> {
    if (this.services.has(service.name)) {
      throw new Error(`[ServiceRegistry] Service ${service.name} is already registered.`);
    }
    
    if (service.init) {
      await service.init();
    }
    
    this.services.set(service.name, service);
    console.log(`[ServiceRegistry] Registered service: ${service.name}`);
  }

  /**
   * Retrieve a service instance by name.
   */
  public get<T = any>(name: string): T {
    if (!this.services.has(name)) {
      throw new Error(`[ServiceRegistry] Service ${name} not found.`);
    }
    return this.services.get(name) as T;
  }

  /**
   * Retrieve all registered services.
   */
  public async shutdownAll(): Promise<void> {
    for (const [name, service] of this.services.entries()) {
      if (service.shutdown) {
        try {
          await service.shutdown();
          console.log(`[ServiceRegistry] Shutdown service: ${name}`);
        } catch (error) {
          console.error(`[ServiceRegistry] Error shutting down service ${name}:`, error);
        }
      }
    }
    this.services.clear();
  }
}
