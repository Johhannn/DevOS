import Dexie from 'dexie';
import type { FSNode } from './types';

export class DevOSDatabase extends Dexie {
  nodes!: Dexie.Table<FSNode, string>;

  constructor() {
    super('devos-vfs');
    
    this.version(1).stores({
      nodes: 'id, name, parentId, type, modifiedAt'
    });
  }
}

export const db = new DevOSDatabase();
