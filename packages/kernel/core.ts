import { EventBus } from './events';
import { ServiceRegistry } from './registry';

// App Permissions
export type Permission = 'filesystem' | 'network' | 'process' | 'clipboard' | 'notifications' | 'ai';

export interface AppManifest {
  id: string;
  name: string;
  version: string;
  icon: string;
  entryPoint: string;
  permissions: Permission[];
  defaultWindowSize: { width: number; height: number };
  minWindowSize: { width: number; height: number };
  category: string;
}

export class CoreKernel {
  public events = new EventBus();
  public services = new ServiceRegistry();
  public state: 'Initialising' | 'Ready' | 'Active' | 'Suspending' | 'Shutdown' = 'Initialising';

  public async boot(): Promise<void> {
    console.log('[Kernel] Boot sequence initiated...');
    this.state = 'Initialising';
    
    // Register base middlewares or system level events
    this.events.use(async (event, payload) => {
       // Future permission checking can go here
       return true; 
    });

    this.state = 'Ready';
    await this.events.emit('system.ready', null);
    
    this.state = 'Active';
    console.log('[Kernel] System active.');
  }

  public async shutdown(): Promise<void> {
    console.log('[Kernel] Shutdown sequence initiated...');
    this.state = 'Suspending';
    
    // Give apps 2 seconds to save state
    await this.events.emit('system.shutdown', null);
    await new Promise(resolve => setTimeout(resolve, 2000));

    await this.services.shutdownAll();
    
    this.state = 'Shutdown';
    console.log('[Kernel] System shutdown complete.');
  }
}

// Global kernel singleton for the browser
export const kernel = new CoreKernel();
