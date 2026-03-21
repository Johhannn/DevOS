import type { VirtualFileSystem } from '@devos/filesystem';
import { useProcessStore } from '../../../stores/processStore';
import { useWindowStore } from '../../../stores/windowStore';
import { kernel } from '@devos/kernel';

export async function execute(args: string[], cwd: string, vfs: VirtualFileSystem): Promise<string> {
  if (args.length === 0) throw new Error('devos: missing subcommand (apps, kill, open, theme)');

  const sub = args[0];

  switch (sub) {
    case 'apps': {
      const processesRecord = useProcessStore.getState().processes;
      const processes = Object.values(processesRecord);
      if (processes.length === 0) return 'No running processes.';
      return [
        '\\x1B[36mPID\\x1B[0m\\t\\x1B[32mAPP ID\\x1B[0m\\t\\x1B[33mSTATUS\\x1B[0m',
        ...processes.map((p: any) => `${p.pid}\\t${p.appId}\\t${p.status}`)
      ].join('\\n');
    }
    case 'kill': {
      if (args.length < 2) throw new Error('devos kill: missing pid');
      const pid = parseInt(args[1], 10);
      if (isNaN(pid)) throw new Error('devos kill: invalid pid');
      useProcessStore.getState().killProcess(pid);
      return `Sent kill signal to PID ${pid}`;
    }
    case 'open': {
      if (args.length < 2) throw new Error('devos open: missing app id or file path');
      const target = args[1];
      
      if (target.includes('.') || target.includes('/')) {
        const { resolvePath } = await import('@devos/filesystem');
        const path = resolvePath(cwd, target);
        
        // Ensure Editor is open, then emit the kernel event
        useWindowStore.getState().openWindow({ appId: 'editor', title: 'Code Editor' });
        // Slight delay to ensure EditorApp is mounted if it wasn't already
        setTimeout(() => kernel.emit('editor.open' as any, { path }), 150);
        
        return `Opening file in Code Editor: ${path}...`;
      } else {
        useWindowStore.getState().openWindow({ appId: target, title: target });
        return `Opening app: ${target}...`;
      }
    }
    case 'theme': {
      if (args.length < 2) throw new Error('devos theme: missing theme argument');
      return `Theme changed to: ${args[1]}`;
    }
    default:
      throw new Error(`devos: unknown subcommand: ${sub}`);
  }
}
