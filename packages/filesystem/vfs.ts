import { IService, EventBus } from '@devos/kernel';
import { db, VFSNode, FileNode } from './db';

// Extract the name part from a path (e.g. /home/test -> test)
const basename = (path: string) => path.split('/').pop() || '';
const dirname = (path: string) => {
  const parts = path.split('/');
  parts.pop();
  return parts.length === 1 && parts[0] === '' ? '/' : parts.join('/');
}

export class VirtualFileSystem implements IService {
  public name = 'filesystem';
  
  constructor(private kernelEvents: EventBus) {}

  public async init() {
    console.log('[VFS] Initializing Virtual File System...');
    // Seed the database if empty
    const root = await db.nodes.get('/');
    if (!root) {
      console.log('[VFS] First boot detected. Seeding filesystem...');
      await this.seedDefaultFilesystem();
    }
  }

  private async seedDefaultFilesystem(): Promise<void> {
    const now = Date.now();
    const defaultNodes: VFSNode[] = [
      {
        path: '/',
        name: '/',
        type: 'directory',
        parentId: '',
        metadata: { createdAt: now, modifiedAt: now, size: 0 }
      },
      {
        path: '/home',
        name: 'home',
        type: 'directory',
        parentId: '/',
        metadata: { createdAt: now, modifiedAt: now, size: 0 }
      },
      {
        path: '/home/user',
        name: 'user',
        type: 'directory',
        parentId: '/home',
        metadata: { createdAt: now, modifiedAt: now, size: 0 }
      },
      {
        path: '/apps',
        name: 'apps',
        type: 'directory',
        parentId: '/',
        metadata: { createdAt: now, modifiedAt: now, size: 0 }
      },
      {
        path: '/system',
        name: 'system',
        type: 'directory',
        parentId: '/',
        metadata: { createdAt: now, modifiedAt: now, size: 0 }
      },
      {
        path: '/home/user/notes.md',
        name: 'notes.md',
        type: 'file',
        parentId: '/home/user',
        content: '# Welcome to DevOS\n\nThis is your personal workspace.',
        metadata: { createdAt: now, modifiedAt: now, size: 55, mimeType: 'text/markdown' }
      }
    ];

    await db.nodes.bulkAdd(defaultNodes);
  }

  public async readFile(path: string): Promise<string> {
    const node = await db.nodes.get(path);
    if (!node) throw new Error(`FileNotFound: ${path}`);
    if (node.type !== 'file') throw new Error(`IsADirectory: ${path}`);
    
    // We notify read events just in case systems want to track last access
    this.kernelEvents.emit('filesystem.read', { path });
    return (node as FileNode).content;
  }

  public async writeFile(path: string, content: string): Promise<void> {
    await db.transaction('rw', db.nodes, async () => {
      let node = await db.nodes.get(path);
      const now = Date.now();
      
      if (node) {
        if (node.type !== 'file') throw new Error(`IsADirectory: ${path}`);
        node = {
          ...node,
          content,
          metadata: { ...node.metadata, modifiedAt: now, size: content.length }
        } as FileNode;
        await db.nodes.put(node);
      } else {
        const parent = dirname(path);
        const parentNode = await db.nodes.get(parent);
        if (!parentNode) throw new Error(`FileNotFound (Parent): ${parent}`);
        
        node = {
          path,
          name: basename(path),
          type: 'file',
          parentId: parent,
          content,
          metadata: { createdAt: now, modifiedAt: now, size: content.length }
        } as FileNode;
        await db.nodes.put(node);
      }
    });

    this.kernelEvents.emit('filesystem.changed', { path });
  }

  public async list(path: string): Promise<VFSNode[]> {
    const node = await db.nodes.get(path);
    if (!node) throw new Error(`FileNotFound: ${path}`);
    if (node.type !== 'directory') throw new Error(`NotADirectory: ${path}`);
    
    return await db.nodes.where('parentId').equals(path).toArray();
  }
}
