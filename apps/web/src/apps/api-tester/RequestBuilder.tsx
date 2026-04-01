"use client";

import { useState } from 'react';
import { Zap } from 'lucide-react';
import type { Method } from 'axios';
import dynamic from 'next/dynamic';

const MonacoEditor = dynamic(() => import('@monaco-editor/react'), { ssr: false });

export interface KeyValuePair {
  key: string;
  value: string;
  active: boolean;
}

export interface RequestState {
  method: Method;
  url: string;
  headers: KeyValuePair[];
  body: string;
  auth: { type: 'none' | 'bearer'; token: string };
}

interface RequestBuilderProps {
  state: RequestState;
  onChange: (newState: RequestState) => void;
  onSend: () => void;
  isLoading: boolean;
}

export function RequestBuilder({ state, onChange, onSend, isLoading }: RequestBuilderProps) {
  const [activeTab, setActiveTab] = useState<'Headers' | 'Body' | 'Auth'>('Headers');
  const [bodyMode, setBodyMode] = useState<'None' | 'JSON' | 'Raw'>('JSON');

  const updateState = (update: Partial<RequestState>) => {
    onChange({ ...state, ...update });
  };

  const getMethodColor = (m: Method) => {
    const method = String(m).toUpperCase();
    if (method === 'GET') return 'text-cyan-400 bg-cyan-400/10 border-cyan-400/30';
    if (method === 'POST') return 'text-green-400 bg-green-400/10 border-green-400/30';
    if (method === 'PUT') return 'text-amber-400 bg-amber-400/10 border-amber-400/30';
    if (method === 'PATCH') return 'text-purple-400 bg-purple-400/10 border-purple-400/30';
    if (method === 'DELETE') return 'text-red-400 bg-red-400/10 border-red-400/30';
    return 'text-slate-400 bg-slate-400/10 border-slate-400/30';
  };

  const updateHeader = (index: number, field: keyof KeyValuePair, val: any) => {
    const newHeaders = [...state.headers];
    newHeaders[index] = { ...newHeaders[index], [field]: val };
    
    // Auto-add row
    if (index === state.headers.length - 1 && field === 'key' && val !== '') {
      newHeaders.push({ key: '', value: '', active: true });
    }
    updateState({ headers: newHeaders });
  };

  return (
    <div className="flex flex-col bg-[#0B0F19] border-b border-[#1F2937]">
      {/* Row 1: URL Bar */}
      <div className="flex items-center gap-2 p-3 bg-panel/50">
        <select 
          value={state.method} 
          onChange={(e) => updateState({ method: e.target.value as Method })}
          className={`font-bold px-3 py-2 rounded border outline-none cursor-pointer transition-colors text-xs ${getMethodColor(state.method)}`}
        >
          <option value="GET" className="text-black">GET</option>
          <option value="POST" className="text-black">POST</option>
          <option value="PUT" className="text-black">PUT</option>
          <option value="PATCH" className="text-black">PATCH</option>
          <option value="DELETE" className="text-black">DELETE</option>
        </select>
        
        <input 
          type="text" 
          value={state.url}
          onChange={(e) => updateState({ url: e.target.value })}
          placeholder="https://api.example.com/..."
          className="flex-1 bg-black/40 border border-[#374151] rounded px-4 py-2 outline-none focus:border-accent text-sm font-mono text-white transition-colors"
          onKeyDown={(e) => e.key === 'Enter' && onSend()}
        />
        
        <button 
          onClick={onSend}
          disabled={isLoading || !state.url}
          className="flex items-center gap-2 bg-accent hover:bg-accent/90 text-white px-5 py-2 rounded font-medium transition-colors disabled:opacity-50"
        >
          <Zap size={14} className={isLoading ? 'animate-pulse' : ''} />
          <span className="text-sm">Send</span>
        </button>
      </div>

      {/* Row 2: Tabs */}
      <div className="flex items-center px-4 border-b border-[#1F2937]">
        {(['Headers', 'Body', 'Auth'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === tab ? 'border-accent text-white' : 'border-transparent text-white/50 hover:text-white/80'
            }`}
          >
            {tab}
            {tab === 'Headers' && state.headers.filter(h => h.key).length > 0 && 
              <span className="ml-1 opacity-60">({state.headers.filter(h => h.key).length})</span>
            }
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="p-3 h-[180px] overflow-auto">
        {activeTab === 'Headers' && (
          <div className="flex flex-col gap-1.5 max-w-2xl">
            {state.headers.map((h, i) => (
              <div key={i} className="flex items-center gap-2">
                <input 
                  type="checkbox" 
                  checked={h.active} 
                  onChange={(e) => updateHeader(i, 'active', e.target.checked)}
                  className="accent-accent cursor-pointer"
                />
                <input 
                  type="text" 
                  placeholder="Key" 
                  value={h.key}
                  onChange={(e) => updateHeader(i, 'key', e.target.value)}
                  className="flex-1 bg-black/20 border border-[#1F2937] rounded px-3 py-1.5 text-xs font-mono outline-none focus:border-accent/50"
                />
                <input 
                  type="text" 
                  placeholder="Value" 
                  value={h.value}
                  onChange={(e) => updateHeader(i, 'value', e.target.value)}
                  className="flex-[2] bg-black/20 border border-[#1F2937] rounded px-3 py-1.5 text-xs font-mono outline-none focus:border-accent/50"
                />
              </div>
            ))}
          </div>
        )}

        {activeTab === 'Body' && (
          <div className="flex flex-col h-full border border-[#1F2937] rounded overflow-hidden">
            <div className="flex items-center gap-2 p-1 border-b border-[#1F2937] bg-black/30">
              <span className="text-[10px] text-muted mx-2">TYPE:</span>
              {(['None', 'JSON', 'Raw'] as const).map(mode => (
                <button
                  key={mode}
                  onClick={() => setBodyMode(mode)}
                  className={`px-2 py-0.5 text-[10px] rounded transition-colors ${bodyMode === mode ? 'bg-white/10 text-white' : 'text-muted hover:bg-white/5'}`}
                >
                  {mode}
                </button>
              ))}
            </div>
            <div className="flex-1 relative">
              {bodyMode === 'None' ? (
                <div className="flex items-center justify-center h-full text-xs text-muted">This request does not have a body</div>
              ) : bodyMode === 'JSON' ? (
                <MonacoEditor
                  value={state.body}
                  language="json"
                  theme="vs-dark"
                  onChange={(val) => updateState({ body: val || '' })}
                  options={{ minimap: { enabled: false }, fontSize: 12, scrollBeyondLastLine: false }}
                />
              ) : (
                <textarea 
                  value={state.body}
                  onChange={(e) => updateState({ body: e.target.value })}
                  className="w-full h-full bg-transparent text-white font-mono text-xs p-2 outline-none resize-none"
                  spellCheck={false}
                />
              )}
            </div>
          </div>
        )}

        {activeTab === 'Auth' && (
          <div className="flex flex-col gap-3 max-w-sm p-2">
            <div>
              <label className="text-xs text-muted mb-1 block">Type</label>
              <select 
                value={state.auth.type}
                onChange={(e) => updateState({ auth: { ...state.auth, type: e.target.value as 'none' | 'bearer' } })}
                className="bg-black/40 border border-[#374151] rounded px-3 py-1.5 outline-none focus:border-accent text-xs w-full"
              >
                <option value="none">No Auth</option>
                <option value="bearer">Bearer Token</option>
              </select>
            </div>
            {state.auth.type === 'bearer' && (
              <div>
                <label className="text-xs text-muted mb-1 block">Token</label>
                <input 
                  type="text" 
                  value={state.auth.token}
                  onChange={(e) => updateState({ auth: { ...state.auth, token: e.target.value } })}
                  placeholder="Token"
                  className="bg-black/40 border border-[#374151] rounded px-3 py-1.5 outline-none focus:border-accent text-xs font-mono w-full text-white"
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
