import { db } from './db';
import type { FSNode, FileNode, DirectoryNode, WatchCallback, WatchEvent } from './types';
import { FileNotFoundError, PathConflictError, PermissionDeniedError } from './types';
import { resolvePath, pathParts, dirname, basename } from './pathResolver';
import { DEFAULTS } from './defaults';

export class VirtualFileSystem {
  private cache: Map<string, FSNode> = new Map();
  private watchers: Map<string, Set<WatchCallback>> = new Map();

  constructor() {}

  /** Bootstraps the VFS */
  public async init(): Promise<void> {
    const root = await db.nodes.get('root');
    if (!root) {
      await this.initDefaults();
    }
  }

  // ─── File Operations ──────────────────────────────────────────────────────

  public async readFile(path: string): Promise<string> {
    const node = await this.getNode(path);
    if (!node) throw new FileNotFoundError(path);
    if (node.type !== 'file') throw new PermissionDeniedError(path); // Is a directory
    return node.content;
  }

  public async writeFile(path: string, content: string): Promise<void> {
    let node = await this.getNode(path);
    const now = Date.now();

    if (node) {
      if (node.type !== 'file') throw new PermissionDeniedError(path);
      (node as FileNode).content = content;
      node.modifiedAt = now;
      (node as FileNode).size = content.length;
      await db.nodes.put(node);
      this.cache.set(resolvePath('/', path), node);
      this.notify(path, 'modify');
    } else {
      const file = await this.createFile(path);
      file.content = content;
      file.size = content.length;
      file.modifiedAt = now;
      await db.nodes.put(file);
      this.cache.set(resolvePath('/', path), file);
      this.notify(path, 'modify');
    }
  }

  public async createFile(path: string): Promise<FileNode> {
    const safePath = resolvePath('/', path);
    if (await this.exists(safePath)) throw new PathConflictError(safePath);

    const parentPath = dirname(safePath);
    const parentNode = await this.getNode(parentPath);
    if (!parentNode || parentNode.type !== 'directory') throw new FileNotFoundError(parentPath);

    const name = basename(safePath);
    const now = Date.now();
    const file: FileNode = {
      id: crypto.randomUUID(),
      name,
      type: 'file',
      parentId: parentNode.id,
      content: '',
      createdAt: now,
      modifiedAt: now,
      size: 0
    };

    await db.nodes.add(file);
    this.cache.set(safePath, file);
    this.notify(safePath, 'create');
    this.notify(parentPath, 'modify');
    return file;
  }

  public async createDirectory(path: string): Promise<DirectoryNode> {
    const safePath = resolvePath('/', path);
    if (await this.exists(safePath)) throw new PathConflictError(safePath);

    const parentPath = dirname(safePath);
    const parentNode = await this.getNode(parentPath);
    if (!parentNode || parentNode.type !== 'directory') throw new FileNotFoundError(parentPath);

    const name = basename(safePath);
    const now = Date.now();
    const dir: DirectoryNode = {
      id: crypto.randomUUID(),
      name,
      type: 'directory',
      parentId: parentNode.id,
      createdAt: now,
      modifiedAt: now
    };

    await db.nodes.add(dir);
    this.cache.set(safePath, dir);
    this.notify(safePath, 'create');
    this.notify(parentPath, 'modify');
    return dir;
  }

  public async delete(path: string, recursive: boolean = false): Promise<void> {
    const safePath = resolvePath('/', path);
    if (safePath === '/') throw new PermissionDeniedError('Cannot delete root directory');

    const node = await this.getNode(safePath);
    if (!node) throw new FileNotFoundError(safePath);

    if (node.type === 'directory') {
      const children = await this.list(safePath);
      if (children.length > 0) {
        if (!recursive) throw new Error(`ENOTEMPTY: Directory not empty, '${safePath}'`);
        for (const child of children) {
          await this.delete(`${safePath}/${child.name}`, true);
        }
      }
    }

    await db.nodes.delete(node.id);
    this.cache.delete(safePath);
    this.notify(safePath, 'delete');
    
    // Notify parent
    const parentPath = dirname(safePath);
    this.notify(parentPath, 'modify');
  }

  public async rename(path: string, newName: string): Promise<void> {
    const safePath = resolvePath('/', path);
    const node = await this.getNode(safePath);
    if (!node) throw new FileNotFoundError(safePath);

    const parentPath = dirname(safePath);
    const newSafePath = resolvePath(parentPath, newName);
    if (await this.exists(newSafePath)) throw new PathConflictError(newSafePath);

    node.name = newName;
    node.modifiedAt = Date.now();
    await db.nodes.put(node);
    
    this.cache.delete(safePath);
    this.cache.set(newSafePath, node);

    this.notify(safePath, 'delete'); // Visually disappears from old name
    this.notify(newSafePath, 'create'); // Appears under new name
    this.notify(parentPath, 'modify');
  }

  public async list(path: string): Promise<FSNode[]> {
    const node = await this.getNode(path);
    if (!node) throw new FileNotFoundError(path);
    if (node.type !== 'directory') throw new PermissionDeniedError(path); // Cannot list a file

    return await db.nodes.where('parentId').equals(node.id).toArray();
  }

  public async exists(path: string): Promise<boolean> {
    const node = await this.getNode(path);
    return node !== null;
  }

  public async getNode(path: string): Promise<FSNode | null> {
    const safePath = resolvePath('/', path);
    if (this.cache.has(safePath)) return this.cache.get(safePath)!;

    const node = await this.pathToNode(safePath);
    if (node) this.cache.set(safePath, node);
    return node;
  }

  // ─── Watchers ─────────────────────────────────────────────────────────────

  public watch(path: string, cb: WatchCallback): () => void {
    const safePath = resolvePath('/', path);
    let watchers = this.watchers.get(safePath);
    if (!watchers) {
      watchers = new Set();
      this.watchers.set(safePath, watchers);
    }
    watchers.add(cb);
    return () => {
      watchers!.delete(cb);
      if (watchers!.size === 0) this.watchers.delete(safePath);
    };
  }

  private notify(path: string, event: WatchEvent): void {
    const watchers = this.watchers.get(path);
    if (watchers) {
      this.getNode(path).then(node => {
        for (const cb of watchers) {
          try { cb(event, path, node || undefined); } catch (e) { console.error('Watcher error:', e); }
        }
      });
    }
  }

  // ─── Internals ────────────────────────────────────────────────────────────

  private async pathToNode(path: string): Promise<FSNode | null> {
    const parts = pathParts(path);
    
    // Fetch root
    let current: FSNode | undefined = await db.nodes.get('root');
    if (!current) return null;

    if (parts.length === 0) return current;

    for (const part of parts) {
      // Query index by parentId and name
      const children = (await db.nodes
        .where('parentId').equals(current.id)
        .toArray()) as FSNode[];
      
      const match = children.find(c => c.name === part);
      if (!match) return null;
      current = match;
    }

    return current || null;
  }

  private async initDefaults(): Promise<void> {
    const now = Date.now();
    
    // Create Root
    const root: DirectoryNode = {
      id: 'root',
      name: '/',
      type: 'directory',
      parentId: null,
      createdAt: now,
      modifiedAt: now
    };
    await db.nodes.add(root);
    this.cache.set('/', root);

    // Iteratively build parents to satisfy DEFAULTS
    const ensureDir = async (path: string): Promise<FSNode> => {
      let node = await this.getNode(path);
      if (node) return node;
      
      const parentDir = dirname(path);
      const parent = await ensureDir(parentDir);
      
      const newDir: DirectoryNode = {
        id: crypto.randomUUID(),
        name: basename(path),
        type: 'directory',
        parentId: parent.id,
        createdAt: now,
        modifiedAt: now
      };
      await db.nodes.add(newDir);
      this.cache.set(path, newDir);
      return newDir;
    };

    // Insert DEFAULTS
    for (const def of DEFAULTS) {
      const parentPath = dirname(def.path);
      const parent = await ensureDir(parentPath);

      const newNode: FSNode = {
        ...def.node,
        id: crypto.randomUUID(),
        parentId: parent.id,
        createdAt: now,
        modifiedAt: now
      } as FSNode;

      await db.nodes.add(newNode);
      this.cache.set(def.path, newNode);
    }
  }
}

export const vfs = new VirtualFileSystem();
