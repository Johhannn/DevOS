"use client";

import { useEffect, useState } from 'react';
import { Tree, NodeApi } from 'react-arborist';
import { registry } from '@devos/kernel';
import type { VirtualFileSystem } from '@devos/filesystem';
import { File, Folder, FolderOpen, ChevronRight, ChevronDown } from 'lucide-react';

interface SidebarProps {
  onFileSelect: (path: string, preview: boolean) => void;
}

type TreeNode = {
  id: string; // Absolute path
  name: string;
  isFolder: boolean;
  children?: TreeNode[];
};

export function EditorSidebar({ onFileSelect }: SidebarProps) {
  const [data, setData] = useState<TreeNode[]>([]);

  useEffect(() => {
    let mounted = true;
    
    // Naive fetch for /home/user
    const fetchTree = async () => {
      try {
        const vfs = registry.get<VirtualFileSystem>('filesystem');
        
        // Recursive fetch
        const buildTree = async (path: string): Promise<TreeNode[]> => {
          const nodes = await vfs.list(path);
          const result: TreeNode[] = [];
          for (const node of nodes) {
            const nodePath = path === '/' ? `/${node.name}` : `${path}/${node.name}`;
            if (node.type === 'directory') {
              result.push({
                id: nodePath,
                name: node.name,
                isFolder: true,
                children: await buildTree(nodePath)
              });
            } else {
              result.push({
                id: nodePath,
                name: node.name,
                isFolder: false
              });
            }
          }
          return result;
        };

        const rootTree = await buildTree('/home/user');
        if (mounted) setData(rootTree);
      } catch (err) {
        console.error('Failed to load VFS tree', err);
      }
    };

    fetchTree();
    return () => { mounted = false; };
  }, []);

  const handleSelect = (node: NodeApi<TreeNode>) => {
    if (node.isLeaf) {
      onFileSelect(node.id, true); // Single click = preview
    } else {
      node.toggle();
    }
  };

  const handleDoubleClick = (node: NodeApi<TreeNode>) => {
    if (node.isLeaf) {
      onFileSelect(node.id, false); // Double click = permanent
    }
  };

  return (
    <div className="w-[220px] shrink-0 h-full bg-[#111827] border-r border-[#1F2937] flex flex-col select-none">
      <div className="px-4 py-2 text-xs font-semibold text-white/40 tracking-wider">
        EXPLORER
      </div>
      
      <div className="flex-1 overflow-y-auto no-scrollbar outline-none">
        <Tree
          data={data}
          width={220}
          height={800} // Overrided by flex
          indent={12}
          rowHeight={26}
          paddingTop={4}
        >
          {({ node, style }) => {
            const Icon = node.isInternal 
              ? (node.isOpen ? FolderOpen : Folder) 
              : File;
              
            return (
              <div 
                style={style} 
                className={`flex items-center px-4 gap-1.5 text-sm cursor-pointer hover:bg-white/5 transition-colors ${node.isSelected ? 'bg-accent/10 text-accent' : 'text-white/70'}`}
                onClick={() => handleSelect(node)}
                onDoubleClick={() => handleDoubleClick(node)}
              >
                {node.isInternal && (
                  <span className="shrink-0 w-3 flex items-center justify-center opacity-50">
                    {node.isOpen ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                  </span>
                )}
                {!node.isInternal && <span className="w-3 shrink-0" />}
                <Icon size={14} className={`shrink-0 ${node.isInternal ? 'text-blue-400' : 'text-slate-400 opacity-80'}`} />
                <span className="truncate">{node.data.name}</span>
              </div>
            );
          }}
        </Tree>
      </div>
    </div>
  );
}
