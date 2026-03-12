import Dexie, { type EntityTable } from 'dexie';

export interface NodeMetadata {
  createdAt: number;
  modifiedAt: number;
  size: number;
  mimeType?: string;
}

export interface FileNode {
  path: string;
  type: 'file';
  parentId: string;
  name: string;
  content: string; // Storing string content for MVP
  metadata: NodeMetadata;
}

export interface DirectoryNode {
  path: string;
  type: 'directory';
  parentId: string;
  name: string;
  metadata: NodeMetadata;
}

export type VFSNode = FileNode | DirectoryNode;

const devOSDb = new Dexie('DevOS_VFS') as Dexie & {
  nodes: EntityTable<
    VFSNode,
    'path'
  >;
};

// Schema version 1
devOSDb.version(1).stores({
  nodes: 'path, parentId, type, name'
});

export const db = devOSDb;
