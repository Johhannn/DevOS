"use client";

import { useEffect, useState } from 'react';
import { registry } from '@devos/kernel';
import type { VirtualFileSystem } from '@devos/filesystem';
import { Trash2 } from 'lucide-react';
import type { Method } from 'axios';

export interface HistoryItem {
  id: string; // timestamp based
  method: Method;
  url: string;
  timestamp: number;
  headers: Record<string, string>;
  data: any;
}

const HISTORY_FILE = '/home/user/.devos/api-history.json';

interface RequestHistoryProps {
  onSelect: (item: HistoryItem) => void;
  refreshTrigger: number;
}

export function RequestHistory({ onSelect, refreshTrigger }: RequestHistoryProps) {
  const [history, setHistory] = useState<HistoryItem[]>([]);

  useEffect(() => {
    const loadHistory = async () => {
      try {
        const vfs = registry.get<VirtualFileSystem>('filesystem');
        
        // Ensure .devos dir exists
        try { await vfs.getNode('/home/user/.devos'); }
        catch { await vfs.createDirectory('/home/user/.devos'); }

        if (await vfs.exists(HISTORY_FILE)) {
          const content = await vfs.readFile(HISTORY_FILE);
          if (content) {
            setHistory(JSON.parse(content));
          }
        } else {
          await vfs.createFile(HISTORY_FILE);
          await vfs.writeFile(HISTORY_FILE, '[]');
        }
      } catch (err) {
        console.error('Failed to load API history', err);
      }
    };
    loadHistory();
  }, [refreshTrigger]);

  const clearHistory = async () => {
    try {
      const vfs = registry.get<VirtualFileSystem>('filesystem');
      await vfs.writeFile(HISTORY_FILE, '[]');
      setHistory([]);
    } catch (err) {
      console.error('Failed to clear history', err);
    }
  };

  const getMethodColor = (m: Method | string) => {
    const method = String(m).toUpperCase();
    if (method === 'GET') return 'text-cyan-400';
    if (method === 'POST') return 'text-green-400';
    if (method === 'PUT') return 'text-amber-400';
    if (method === 'PATCH') return 'text-purple-400';
    if (method === 'DELETE') return 'text-red-400';
    return 'text-slate-400';
  };

  return (
    <div className="w-[200px] shrink-0 h-full bg-[#111827] border-r border-[#1F2937] flex flex-col">
      <div className="flex items-center justify-between px-3 py-2 border-b border-[#1F2937]">
        <span className="text-xs font-semibold text-white/40 tracking-wider">HISTORY</span>
        <button 
          onClick={clearHistory}
          className="p-1 hover:bg-white/10 rounded text-muted hover:text-red-400 transition-colors"
          title="Clear History"
        >
          <Trash2 size={12} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar py-2 flex flex-col gap-0.5">
        {history.length === 0 ? (
          <div className="px-4 text-xs text-muted text-center pt-4">No history yet</div>
        ) : (
          history.map(item => (
            <button
              key={item.id}
              onClick={() => onSelect(item)}
              className="flex flex-col text-left px-3 py-2 hover:bg-white/5 transition-colors focus:outline-none focus:bg-white/10"
            >
              <div className="flex items-center justify-between w-full">
                <span className={`text-[10px] font-bold ${getMethodColor(item.method)}`}>
                  {item.method}
                </span>
                <span className="text-[9px] text-muted">
                  {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <span className="text-xs text-foreground truncate w-full opacity-90 mt-0.5">
                {item.url}
              </span>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
