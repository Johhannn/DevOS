"use client";

import { useEffect, useState, useRef } from 'react';
import { Tree, NodeApi } from 'react-arborist';
import { registry, kernel } from '@devos/kernel';
import type { VirtualFileSystem } from '@devos/filesystem';
import * as ContextMenu from '@radix-ui/react-context-menu';
import { 
  Folder, FolderOpen, File, ChevronRight, ChevronDown, 
  FilePlus, FolderPlus, RefreshCw, Edit2, Trash2, ExternalLink
} from 'lucide-react';

interface ExplorerPaneProps {
  onSelectFile: (path: string | null) => void;
  selectedFile: string | null;
}

type TreeNode = {
  id: string; // Absolute path
  name: string;
  isFolder: boolean;
  children?: TreeNode[];
};

export function ExplorerPane({ onSelectFile, selectedFile }: ExplorerPaneProps) {
  const [data, setData] = useState<TreeNode[]>([]);
  const treeRef = useRef<any>(null);

  const fetchTree = async () => {
    try {
      const vfs = registry.get<VirtualFileSystem>('filesystem');
      
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
        return result.sort((a, b) => {
          if (a.isFolder === b.isFolder) return a.name.localeCompare(b.name);
          return a.isFolder ? -1 : 1;
        });
      };

      const rootTree = await buildTree('/');
      setData(rootTree);
    } catch (err) {
      console.error('Explorer: Failed to load VFS tree', err);
    }
  };

  useEffect(() => {
    fetchTree();
    // Subscribe to VFS changes
    const fn = () => fetchTree();
    kernel.on('filesystem.changed', fn);
    return () => kernel.off('filesystem.changed', fn);
  }, []);

  const handleCreateFile = async () => {
    const vfs = registry.get<VirtualFileSystem>('filesystem');
    const path = `/New File ${Date.now()}.txt`;
    await vfs.createFile(path);
    fetchTree();
  };

  const handleCreateFolder = async () => {
    const vfs = registry.get<VirtualFileSystem>('filesystem');
    const path = `/New Folder ${Date.now()}`;
    await vfs.createDirectory(path);
    fetchTree();
  };

  const handleRename = async ({ id, name, node }: any) => {
    try {
      if (name === node.data.name) return;
      const vfs = registry.get<VirtualFileSystem>('filesystem');
      await vfs.rename(id, name);
      fetchTree();
    } catch (err) {
      console.error('Rename failed', err);
    }
  };

  const handleMove = async ({ dragIds, parentId, index }: any) => {
    // Advanced moving via drag/drop (omitted for brevity, MVP supports basic rename/delete)
    console.log('Moved', dragIds, 'to', parentId);
  };

  const handleNodeClick = (node: NodeApi<TreeNode>) => {
    if (node.isLeaf) {
      onSelectFile(node.id);
    } else {
      node.toggle();
    }
  };

  const handleNodeDoubleClick = (node: NodeApi<TreeNode>) => {
    if (node.isLeaf) {
      kernel.emit('editor.open' as any, { path: node.id });
    }
  };

  // ─── Node Renderer ────────────────────────────────────────────────────────
  
  const NodeRenderer = ({ node, style, dragHandle }: any) => {
    const Icon = node.isInternal ? (node.isOpen ? FolderOpen : Folder) : File;

    return (
      <ContextMenu.Root>
        <ContextMenu.Trigger asChild>
          <div 
            style={style} 
            ref={dragHandle}
            className={`flex items-center px-2 gap-1.5 text-[13px] cursor-pointer hover:bg-white/5 transition-colors focus:outline-none ${node.id === selectedFile || node.isSelected ? 'bg-accent/20 text-accent' : 'text-white/80'}`}
            onClick={() => handleNodeClick(node)}
            onDoubleClick={() => handleNodeDoubleClick(node)}
          >
            {node.isInternal && (
              <span className="shrink-0 w-4 flex items-center justify-center opacity-60">
                {node.isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
              </span>
            )}
            {!node.isInternal && <span className="w-4 shrink-0" />}
            <Icon size={14} className={`shrink-0 ${node.isInternal ? 'text-blue-400' : 'text-slate-400'}`} />
            
            {node.isEditing ? (
              <input
                type="text"
                defaultValue={node.data.name}
                autoFocus
                className="flex-1 bg-black/50 border border-accent/50 text-white outline-none px-1 h-5 text-xs"
                onBlur={(e) => node.submit(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') node.submit(e.currentTarget.value);
                  if (e.key === 'Escape') node.reset();
                }}
              />
            ) : (
              <span className="truncate">{node.data.name}</span>
            )}
          </div>
        </ContextMenu.Trigger>
        
        {/* Context Menu Content */}
        <ContextMenu.Portal>
          <ContextMenu.Content 
            className="min-w-[160px] bg-[#1F2937] border border-[#374151] rounded-lg shadow-xl py-1 text-sm text-foreground overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-100"
          >
            {node.isLeaf ? (
              <>
                <ContextMenu.Item 
                  className="flex items-center px-3 py-1.5 outline-none hover:bg-accent/20 hover:text-accent cursor-default data-[highlighted]:bg-accent/20 data-[highlighted]:text-accent"
                  onClick={() => kernel.emit('editor.open' as any, { path: node.id })}
                >
                  <ExternalLink size={14} className="mr-2 opacity-70" /> Open in Editor
                </ContextMenu.Item>
                <ContextMenu.Separator className="h-px bg-[#374151] my-1" />
                <ContextMenu.Item 
                  className="flex items-center px-3 py-1.5 outline-none hover:bg-accent/20 hover:text-accent cursor-default data-[highlighted]:bg-accent/20 data-[highlighted]:text-accent"
                  onClick={() => node.edit()}
                >
                  <Edit2 size={14} className="mr-2 opacity-70" /> Rename
                </ContextMenu.Item>
                <ContextMenu.Item 
                  className="flex items-center px-3 py-1.5 outline-none hover:bg-[#dc2626]/20 hover:text-[#dc2626] cursor-default data-[highlighted]:bg-[#dc2626]/20 data-[highlighted]:text-[#dc2626]"
                  onClick={async () => {
                    const vfs = registry.get<VirtualFileSystem>('filesystem');
                    await vfs.delete(node.id);
                    if (selectedFile === node.id) onSelectFile(null);
                    fetchTree();
                  }}
                >
                  <Trash2 size={14} className="mr-2 opacity-70" /> Delete
                </ContextMenu.Item>
              </>
            ) : (
              <>
                <ContextMenu.Item 
                  className="flex items-center px-3 py-1.5 outline-none hover:bg-accent/20 hover:text-accent cursor-default data-[highlighted]:bg-accent/20 data-[highlighted]:text-accent"
                  onClick={async () => {
                     const vfs = registry.get<VirtualFileSystem>('filesystem');
                     await vfs.createFile(`${node.id}/New File.txt`);
                     fetchTree();
                  }}
                >
                  <FilePlus size={14} className="mr-2 opacity-70" /> New File
                </ContextMenu.Item>
                <ContextMenu.Item 
                  className="flex items-center px-3 py-1.5 outline-none hover:bg-accent/20 hover:text-accent cursor-default data-[highlighted]:bg-accent/20 data-[highlighted]:text-accent"
                  onClick={async () => {
                     const vfs = registry.get<VirtualFileSystem>('filesystem');
                     await vfs.createDirectory(`${node.id}/New Folder`);
                     fetchTree();
                  }}
                >
                  <FolderPlus size={14} className="mr-2 opacity-70" /> New Folder
                </ContextMenu.Item>
                <ContextMenu.Separator className="h-px bg-[#374151] my-1" />
                <ContextMenu.Item 
                  className="flex items-center px-3 py-1.5 outline-none hover:bg-accent/20 hover:text-accent cursor-default data-[highlighted]:bg-accent/20 data-[highlighted]:text-accent"
                  onClick={() => node.edit()}
                >
                  <Edit2 size={14} className="mr-2 opacity-70" /> Rename
                </ContextMenu.Item>
                <ContextMenu.Item 
                  className="flex items-center px-3 py-1.5 outline-none hover:bg-[#dc2626]/20 hover:text-[#dc2626] cursor-default data-[highlighted]:bg-[#dc2626]/20 data-[highlighted]:text-[#dc2626]"
                  onClick={async () => {
                    const vfs = registry.get<VirtualFileSystem>('filesystem');
                    await vfs.delete(node.id, true);
                    fetchTree();
                  }}
                >
                  <Trash2 size={14} className="mr-2 opacity-70" /> Delete
                </ContextMenu.Item>
              </>
            )}
          </ContextMenu.Content>
        </ContextMenu.Portal>
      </ContextMenu.Root>
    );
  };

  return (
    <div className="w-[240px] shrink-0 h-full bg-[#111827] border-r border-[#1F2937] flex flex-col select-none">
      <div className="flex items-center justify-between px-3 py-2 border-b border-[#1F2937]">
        <span className="text-xs font-semibold text-white/40 tracking-wider">FILES</span>
        <div className="flex items-center gap-1">
          <button onClick={handleCreateFile} className="w-6 h-6 flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 rounded transition-colors" title="New File">
            <FilePlus size={14} />
          </button>
          <button onClick={handleCreateFolder} className="w-6 h-6 flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 rounded transition-colors" title="New Folder">
            <FolderPlus size={14} />
          </button>
          <button onClick={fetchTree} className="w-6 h-6 flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 rounded transition-colors" title="Refresh">
            <RefreshCw size={14} />
          </button>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto outline-none pt-2 no-scrollbar">
        <Tree
          ref={treeRef}
          data={data}
          width={240}
          height={800} // Overridden by flex internally
          indent={16}
          rowHeight={26}
          onRename={handleRename}
          onMove={handleMove}
        >
          {NodeRenderer}
        </Tree>
      </div>
    </div>
  );
}
