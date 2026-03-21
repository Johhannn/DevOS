"use client";

import { useState, useCallback, useEffect } from 'react';
import { EditorSidebar } from './EditorSidebar';
import { EditorMain } from './EditorMain';
import { EditorTab } from './TabBar';
import { detectLanguage } from './languageDetector';
import { registry, kernel } from '@devos/kernel';
import type { VirtualFileSystem } from '@devos/filesystem';

// Extend EditorTab to include content specifically for our App state
export interface AppEditorTab extends EditorTab {
  content: string;
  isPreview: boolean;
}

export default function EditorApp() {
  const [tabs, setTabs] = useState<AppEditorTab[]>([]);
  const [activeTabId, setActiveTabId] = useState<string | null>(null);

  const openFile = useCallback(async (path: string, preview: boolean) => {
    try {
      const vfs = registry.get<VirtualFileSystem>('filesystem');
      const content = await vfs.readFile(path);
      const language = detectLanguage(path);
      const id = path; // Use absolute path as ID

      setTabs(prev => {
        // Find existing tab
        const existingIndex = prev.findIndex(t => t.id === id);
        if (existingIndex >= 0) {
          const newTabs = [...prev];
          // If it was a preview and now we want permanent, upgrade it
          if (!preview && newTabs[existingIndex].isPreview) {
            newTabs[existingIndex] = { ...newTabs[existingIndex], isPreview: false };
          }
          return newTabs;
        }

        // If preview mode, replace existing preview tab if it exists
        if (preview) {
          const previewIndex = prev.findIndex(t => t.isPreview && !t.isDirty);
          if (previewIndex >= 0) {
            const newTabs = [...prev];
            newTabs[previewIndex] = { id, filePath: path, language, content, isDirty: false, isPreview: true };
            return newTabs;
          }
        }

        return [...prev, { id, filePath: path, language, content, isDirty: false, isPreview: preview }];
      });

      setActiveTabId(id);
    } catch (err) {
      console.error('Failed to open file in editor:', err);
    }
  }, []);

  const handleTabContentChange = useCallback((id: string, newContent: string) => {
    setTabs(prev => prev.map(t => 
      t.id === id ? { ...t, content: newContent, isDirty: true, isPreview: false } : t
    ));
  }, []);

  const handleTabClose = useCallback((id: string) => {
    setTabs(prev => {
      const index = prev.findIndex(t => t.id === id);
      if (index === -1) return prev;
      
      const newTabs = prev.filter(t => t.id !== id);
      
      // If closing active tab, focus another one
      if (activeTabId === id && newTabs.length > 0) {
        // Focus the one to the left, or the first one
        const newIndex = Math.max(0, index - 1);
        setActiveTabId(newTabs[newIndex].id);
      } else if (newTabs.length === 0) {
        setActiveTabId(null);
      }
      return newTabs;
    });
  }, [activeTabId]);

  const handleSave = useCallback(async (id: string) => {
    const tab = tabs.find(t => t.id === id);
    if (!tab || !tab.isDirty) return;

    try {
      const vfs = registry.get<VirtualFileSystem>('filesystem');
      await vfs.writeFile(tab.filePath, tab.content);
      kernel.emit('filesystem.changed', { path: tab.filePath });
      
      setTabs(prev => prev.map(t => t.id === id ? { ...t, isDirty: false } : t));
    } catch (err) {
      console.error('Failed to save file:', err);
    }
  }, [tabs]);

  // Command "devos open" listener
  useEffect(() => {
    const fn = (payload: any) => {
      if (payload && payload.path) {
        openFile(payload.path, false);
      }
    };
    
    kernel.on('editor.open' as any, fn);
    return () => kernel.off('editor.open' as any, fn);
  }, [openFile]);

  // Ctrl+W close active tab hotkey
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'w') {
        e.preventDefault();
        if (activeTabId) handleTabClose(activeTabId);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeTabId, handleTabClose]);

  return (
    <div className="flex w-full h-full text-foreground bg-[#0B0F19] overflow-hidden">
      <EditorSidebar onFileSelect={openFile} />
      <EditorMain 
        openFiles={tabs}
        activeTabId={activeTabId}
        onTabClick={setActiveTabId}
        onTabClose={handleTabClose}
        onTabContentChange={handleTabContentChange}
        onTabSaved={handleSave}
      />
    </div>
  );
}
