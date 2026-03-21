"use client";

import { useState } from 'react';
import { Loader2, AlertCircle, Clock, Database } from 'lucide-react';
import dynamic from 'next/dynamic';
import type { APIResponse } from './ApiService';

const MonacoEditor = dynamic(() => import('@monaco-editor/react'), { ssr: false });

interface ResponseViewerProps {
  response: APIResponse | null;
  isLoading: boolean;
}

export function ResponseViewer({ response, isLoading }: ResponseViewerProps) {
  const [activeTab, setActiveTab] = useState<'Body' | 'Headers'>('Body');

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-panel text-accent opacity-80 gap-3">
        <Loader2 className="animate-spin" size={32} />
        <span className="text-sm font-medium animate-pulse">Sending request...</span>
      </div>
    );
  }

  if (!response) {
    return (
      <div className="flex-1 flex items-center justify-center bg-panel text-muted/50 select-none">
        <span className="text-sm">Enter URL and hit Send to get a response</span>
      </div>
    );
  }

  if (response.error) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-panel text-red-500 gap-3 p-8">
        <AlertCircle size={40} className="opacity-80" />
        <span className="text-lg font-bold">Request Failed</span>
        <span className="text-sm text-red-400 max-w-xl text-center break-words bg-red-950/30 p-4 rounded border border-red-900/50">
          {response.error}
        </span>
      </div>
    );
  }

  const getStatusColor = (status: number) => {
    if (status < 300) return 'text-green-400 bg-green-400/10 border-green-400/20';
    if (status < 400) return 'text-amber-400 bg-amber-400/10 border-amber-400/20';
    return 'text-red-400 bg-red-400/10 border-red-400/20';
  };

  const statusColor = getStatusColor(response.status!);

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / 1048576).toFixed(2) + ' MB';
  };

  // Prettify JSON if it's an object
  const displayData = typeof response.data === 'object' 
    ? JSON.stringify(response.data, null, 2) 
    : String(response.data || '');

  const language = typeof response.data === 'object' ? 'json' : (displayData.trim().startsWith('<') ? 'html' : 'plaintext');

  return (
    <div className="flex-1 flex flex-col bg-panel">
      {/* Response Status Bar */}
      <div className="flex items-center justify-between border-b border-[#1F2937] p-2 bg-[#111827]">
        <div className="flex items-center gap-2">
          {(['Body', 'Headers'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1 text-xs font-semibold rounded transition-colors ${
                activeTab === tab ? 'bg-white/10 text-white' : 'text-white/50 hover:bg-white/5 hover:text-white/80'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
        
        <div className="flex items-center gap-3 pr-2 text-xs font-mono select-none">
          <div className={`px-2 py-0.5 rounded border flex items-center gap-1.5 ${statusColor}`}>
            <div className={`w-2 h-2 rounded-full ${statusColor.split(' ')[0].replace('text-', 'bg-')}`} />
            {response.status} {response.statusText}
          </div>
          <div className="flex items-center gap-1.5 text-muted">
            <Clock size={12} /> <span className="text-white/80">{response.duration} ms</span>
          </div>
          <div className="flex items-center gap-1.5 text-muted">
            <Database size={12} /> <span className="text-white/80">{formatSize(response.size || 0)}</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 relative bg-desktop">
        {activeTab === 'Body' && (
          <MonacoEditor
            value={displayData}
            language={language}
            theme="vs-dark"
            options={{
              readOnly: true,
              minimap: { enabled: false },
              fontSize: 12,
              wordWrap: 'on',
              scrollBeyondLastLine: false,
              formatOnType: true
            }}
          />
        )}
        
        {activeTab === 'Headers' && (
          <div className="p-4 h-full overflow-auto">
             <table className="w-full text-left border-collapse text-xs font-mono max-w-4xl">
               <thead>
                 <tr className="border-b border-border text-muted">
                   <th className="font-semibold py-2 w-1/3">Key</th>
                   <th className="font-semibold py-2">Value</th>
                 </tr>
               </thead>
               <tbody>
                 {Object.entries(response.headers || {}).map(([k, v]) => (
                   <tr key={k} className="border-b border-white/5 hover:bg-white/5">
                     <td className="py-2 text-white/80 pr-4 align-top">{k}</td>
                     <td className="py-2 text-accent break-all">{String(v)}</td>
                   </tr>
                 ))}
               </tbody>
             </table>
          </div>
        )}
      </div>
    </div>
  );
}
