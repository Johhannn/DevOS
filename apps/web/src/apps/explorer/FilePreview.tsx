"use client";

import { useEffect, useState } from 'react';
import { kernel, registry } from '@devos/kernel';
import type { VirtualFileSystem } from '@devos/filesystem';
import ReactMarkdown from 'react-markdown';
import dynamic from 'next/dynamic';

const MonacoEditor = dynamic(() => import('@monaco-editor/react'), { ssr: false });

interface FilePreviewProps {
  filePath: string | null;
}

export function FilePreview({ filePath }: FilePreviewProps) {
  const [content, setContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [metadata, setMetadata] = useState<{ size: number; modifiedAt: number } | null>(null);

  useEffect(() => {
    if (!filePath) {
      setContent(null);
      setMetadata(null);
      return;
    }

    let mounted = true;
    setLoading(true);
    setError(null);

    const loadFile = async () => {
      try {
        const vfs = registry.get<VirtualFileSystem>('filesystem');
        const node = await vfs.getNode(filePath);
        
        if (!node || node.type !== 'file') {
          throw new Error('Not a valid file');
        }

        const text = await vfs.readFile(filePath);
        if (mounted) {
          setContent(text);
          setMetadata({ size: node.size, modifiedAt: node.modifiedAt });
        }
      } catch (err: any) {
        if (mounted) setError(err.message);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadFile();
    return () => { mounted = false; };
  }, [filePath]);

  if (!filePath) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-desktop text-muted select-none">
        <label className="text-sm">Select a file to preview</label>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-desktop text-muted">
        <span className="text-sm animate-pulse">Loading preview...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center bg-desktop text-danger">
        <span className="text-sm">{error}</span>
      </div>
    );
  }

  const isMarkdown = filePath.toLowerCase().endsWith('.md');
  const isText = filePath.match(/\\.(txt|json|js|ts|jsx|tsx|css|html|py|sh|sql|yml|yaml)$/i);
  const isUnknown = !isMarkdown && !isText;

  const handleOpenInEditor = () => {
    kernel.emit('editor.open' as any, { path: filePath });
  };

  const formattedDate = metadata 
    ? new Date(metadata.modifiedAt).toLocaleString()
    : 'Unknown';
    
  const formatSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(1) + ' MB';
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-desktop overflow-hidden border-l border-border">
      {/* Header */}
      <div className="h-12 min-h-[48px] bg-panel border-b border-border flex items-center justify-between px-4">
        <div className="flex flex-col min-w-0">
           <span className="text-sm font-semibold truncate text-foreground">{filePath.split('/').pop()}</span>
           <span className="text-[10px] text-muted truncate">
             {metadata ? `${formatSize(metadata.size)} • Modified ${formattedDate}` : ''}
           </span>
        </div>
        <button 
          onClick={handleOpenInEditor}
          className="shrink-0 ml-4 px-3 py-1.5 bg-accent text-white text-xs font-medium rounded hover:bg-accent/90 transition-colors"
        >
          Open in Editor
        </button>
      </div>

      {/* Content Area */}
      <div className="flex-1 relative overflow-auto">
        {isUnknown ? (
          <div className="flex items-center justify-center h-full text-muted">
             <div className="flex flex-col items-center gap-2">
               <span className="text-sm">Binary or unsupported file format</span>
               <button onClick={handleOpenInEditor} className="text-xs text-accent hover:underline">Open in editor anyway</button>
             </div>
          </div>
        ) : isMarkdown ? (
          <div className="p-6 prose prose-invert prose-sm max-w-3xl mx-auto">
            <ReactMarkdown>{content || ''}</ReactMarkdown>
          </div>
        ) : (
          <MonacoEditor
             value={content || ''}
             language={filePath.split('.').pop() || 'plaintext'}
             theme="vs-dark"
             options={{
               readOnly: true,
               minimap: { enabled: false },
               lineNumbers: 'on',
               fontFamily: 'JetBrains Mono, monospace',
               fontSize: 13,
               scrollBeyondLastLine: false,
               wordWrap: 'on'
             }}
          />
        )}
      </div>
    </div>
  );
}
