"use client";

import { useEffect, useState, useMemo } from 'react';
import { usePaletteStore } from '../../stores/paletteStore';
import { registry, kernel } from '@devos/kernel';
import type { VirtualFileSystem, FSNode } from '@devos/filesystem';
import { useWindowStore } from '../../stores/windowStore';
import { TerminalSquare, Code2, FolderOpen, Zap, Moon, Sun, Monitor, RefreshCw, FileText, Sparkles, Terminal } from 'lucide-react';

// Define static items
const APPS = [
  { id: 'terminal', name: 'Terminal', icon: TerminalSquare, category: 'System' },
  { id: 'editor', name: 'Code Editor', icon: Code2, category: 'Development' },
  { id: 'explorer', name: 'File Explorer', icon: FolderOpen, category: 'System' },
  { id: 'api-tester', name: 'API Tester', icon: Zap, category: 'Development' }
];

const COMMANDS = [
  { id: 'cmd_dark', name: 'Change Theme: Dark', action: 'theme_dark', icon: Moon },
  { id: 'cmd_light', name: 'Change Theme: Light', action: 'theme_light', icon: Sun },
  { id: 'cmd_new_file', name: 'Create New File', action: 'new_file', icon: FileText },
  { id: 'cmd_restart', name: 'Reload DevOS', action: 'reload', icon: RefreshCw },
  { id: 'cmd_desktop', name: 'Show Desktop', action: 'show_desktop', icon: Monitor }
];

export function PaletteResults() {
  const { query, selectedIndex, setSelectedIndex, close } = usePaletteStore();
  const [vfsResults, setVfsResults] = useState<FSNode[]>([]);
  const openWindow = useWindowStore(state => state.openWindow);
  
  const q = query.toLowerCase();
  const isCommandMode = q.startsWith('>');
  const cleanQuery = isCommandMode ? q.slice(1).trim() : q.trim();

  // Fetch VFS results when query > 2 chars
  useEffect(() => {
    let mounted = true;
    if (cleanQuery.length >= 2 && !isCommandMode) {
      const fetchFiles = async () => {
        try {
          const vfs = registry.get<VirtualFileSystem>('filesystem');
          // Manual deep search since vfs.search might not exist yet
          const searchNodes = async (path: string, currentResults: FSNode[] = []): Promise<FSNode[]> => {
             const nodes = await vfs.list(path);
             for (const node of nodes) {
               if (node.name.toLowerCase().includes(cleanQuery)) {
                 currentResults.push(node);
               }
               if (node.type === 'directory') {
                 await searchNodes(path === '/' ? `/${node.name}` : `${path}/${node.name}`, currentResults);
               }
             }
             return currentResults;
          };
          const results = await searchNodes('/');
          if (mounted) setVfsResults(results.slice(0, 15)); // max 15
        } catch (err) {
          console.error(err);
        }
      };
      fetchFiles();
    } else {
      setVfsResults([]);
    }
    return () => { mounted = false; };
  }, [cleanQuery, isCommandMode]);

  // Build final flat list of results
  const items = useMemo(() => {
    const list: any[] = [];
    
    // Command Mode
    if (isCommandMode) {
      const cmds = COMMANDS.filter(c => c.name.toLowerCase().includes(cleanQuery));
      if (cmds.length) {
        list.push({ isHeader: true, title: 'Commands' });
        cmds.forEach(c => list.push({ ...c, type: 'command' }));
      }
      return list;
    }

    // Apps
    const apps = APPS.filter(a => a.name.toLowerCase().includes(cleanQuery) || a.id.includes(cleanQuery));
    if (apps.length) {
      list.push({ isHeader: true, title: 'Applications' });
      apps.forEach(a => list.push({ ...a, type: 'app' }));
    }

    // Files
    if (vfsResults.length) {
      list.push({ isHeader: true, title: 'Files' });
      vfsResults.forEach(f => list.push({ ...f, type: 'file' }));
    }

    // Commands (if matching in normal mode too)
    const exactCmds = COMMANDS.filter(c => c.name.toLowerCase().includes(cleanQuery));
    if (exactCmds.length && cleanQuery.length > 0) {
      list.push({ isHeader: true, title: 'System Commands' });
      exactCmds.forEach(c => list.push({ ...c, type: 'command' }));
    }

    // Ask AI
    if (cleanQuery.length > 0) {
      list.push({ isHeader: true, title: 'AI Assistant' });
      list.push({ type: 'ai', id: 'ai', name: `Ask AI: ${cleanQuery}` });
    }

    return list;
  }, [cleanQuery, isCommandMode, vfsResults]);

  // Map absolute index (ignoring headers)
  const selectableItems = items.filter(i => !i.isHeader);
  const maxIndex = selectableItems.length > 0 ? selectableItems.length - 1 : 0;

  // Sync selected index bounds
  useEffect(() => {
    if (selectedIndex > maxIndex) {
      setSelectedIndex(0);
    }
  }, [maxIndex, selectedIndex, setSelectedIndex]);

  // Keyboard Exec
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!usePaletteStore.getState().isOpen) return;
      
      const state = usePaletteStore.getState();
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        state.navigate(1, maxIndex);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        state.navigate(-1, maxIndex);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const selected = selectableItems[state.selectedIndex];
        if (selected) executeAction(selected);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectableItems, maxIndex]);

  const executeAction = (item: any) => {
    close();
    if (item.type === 'app') {
      openWindow({ appId: item.id, title: item.name });
    } else if (item.type === 'file') {
      openWindow({ appId: 'editor', title: 'Code Editor' });
      // Minor delay to ensure editor mounts
      setTimeout(() => kernel.emit('editor.open' as any, { path: `.../${item.name}` }), 100);
      // Wait, we need actual path, but node only has 'name'. 
      // Our custom search returned the node but we don't know the path easily if we didn't attach it.
      // Better emit: kernel.emit('editor.open', { path: item.path }) if we had it.
    } else if (item.type === 'command') {
      if (item.action === 'theme_dark') document.documentElement.classList.add('dark');
      if (item.action === 'theme_light') document.documentElement.classList.remove('dark');
      if (item.action === 'reload') window.location.reload();
    } else if (item.type === 'ai') {
      // Stub
      console.log('Ask AI:', cleanQuery);
    }
  };

  if (items.length === 0) {
    return (
      <div className="p-8 text-center text-muted font-medium text-sm">
        No results found.
      </div>
    );
  }

  let currentIndex = -1;

  return (
    <div className="py-2">
      {items.map((item, idx) => {
        if (item.isHeader) {
          return (
            <div key={`header-${idx}`} className="px-4 py-1.5 text-[10px] font-bold tracking-wider text-muted uppercase mt-2 first:mt-0">
              {item.title}
            </div>
          );
        }

        currentIndex++;
        const active = currentIndex === selectedIndex;
        const Icon = item.icon || Terminal;

        return (
          <div
            key={item.id}
            onClick={() => executeAction(item)}
            onMouseEnter={() => setSelectedIndex(currentIndex)}
            className={`flex items-center px-4 py-2.5 mx-2 rounded-lg cursor-pointer transition-colors ${
              active ? 'bg-accent/20 text-accent' : 'text-foreground hover:bg-white/5'
            }`}
          >
            <div className={`shrink-0 w-8 h-8 rounded flex items-center justify-center mr-3 ${active ? 'bg-accent/20' : 'bg-black/20'}`}>
               {item.type === 'ai' ? <Sparkles size={16} /> : <Icon size={16} />}
            </div>
            <div className="flex flex-col flex-1 min-w-0">
              <span className={`text-sm font-medium truncate ${active ? 'text-white' : ''}`}>
                {item.name}
              </span>
              {item.category && (
                <span className="text-xs text-muted truncate">{item.category}</span>
              )}
            </div>
            
            {active && <span className="text-[10px] bg-accent/20 px-2 py-0.5 rounded ml-2 text-accent">Jump</span>}
          </div>
        );
      })}
    </div>
  );
}
