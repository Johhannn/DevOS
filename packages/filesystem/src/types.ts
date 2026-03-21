export interface FileNode {
  /** UUID */
  id: string;
  /** filename, no path separators */
  name: string;
  type: 'file';
  parentId: string | null;
  content: string;
  /** timestamp */
  createdAt: number;
  modifiedAt: number;
  /** content.length */
  size: number;
}

export interface DirectoryNode {
  id: string;
  name: string;
  type: 'directory';
  parentId: string | null;
  createdAt: number;
  modifiedAt: number;
}

export type FSNode = FileNode | DirectoryNode;

// ─── Native Errors ──────────────────────────────────────────────────────────

export class FileNotFoundError extends Error {
  constructor(path: string) {
    super(`ENOENT: No such file or directory, '${path}'`);
    this.name = 'FileNotFoundError';
  }
}

export class PermissionDeniedError extends Error {
  constructor(path: string) {
    super(`EACCES: Permission denied, '${path}'`);
    this.name = 'PermissionDeniedError';
  }
}

export class PathConflictError extends Error {
  constructor(path: string) {
    super(`EEXIST: File or directory already exists, '${path}'`);
    this.name = 'PathConflictError';
  }
}

export class StorageQuotaExceededError extends Error {
  constructor() {
    super(`ENOSPC: Storage quota exceeded`);
    this.name = 'StorageQuotaExceededError';
  }
}

// Watcher types
export type WatchEvent = 'create' | 'modify' | 'delete';
export type WatchCallback = (event: WatchEvent, path: string, node?: FSNode) => void;
