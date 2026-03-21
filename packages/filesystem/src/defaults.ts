import type { FileNode, DirectoryNode } from './types';

export const DEFAULTS: { 
  path: string; 
  node: 
    | Omit<FileNode, 'id' | 'parentId' | 'createdAt' | 'modifiedAt'> 
    | Omit<DirectoryNode, 'id' | 'parentId' | 'createdAt' | 'modifiedAt'> 
}[] = [
  {
    path: '/home/user/welcome.md',
    node: {
      name: 'welcome.md',
      type: 'file',
      content: '# Getting Started with DevOS\nWelcome to your new developer environment. Use the terminal, code editor, and file explorer to get things done.',
      size: 133
    }
  },
  {
    path: '/home/user/projects',
    node: {
      name: 'projects',
      type: 'directory'
    }
  },
  {
    path: '/home/user/.devosrc',
    node: {
      name: '.devosrc',
      type: 'file',
      content: '{\n  "theme": "dark",\n  "font": "jetbrains"\n}',
      size: 44
    }
  },
  {
    path: '/system/config.json',
    node: {
      name: 'config.json',
      type: 'file',
      content: '{\n  "version": "1.0.0",\n  "system": true\n}',
      size: 44
    }
  },
  {
    path: '/temp',
    node: {
      name: 'temp',
      type: 'directory'
    }
  }
];
