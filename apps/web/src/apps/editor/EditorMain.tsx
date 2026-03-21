"use client";

import { TabBar, EditorTab } from './TabBar';
import { MonacoCanvas } from './MonacoCanvas';
import { kernel, registry } from '@devos/kernel';
import type { VirtualFileSystem } from '@devos/filesystem';

interface EditorMainProps {
  openFiles: EditorTab[];
  activeTabId: string | null;
  onTabContentChange: (id: string, newContent: string) => void;
  onTabClose: (id: string) => void;
  onTabClick: (id: string) => void;
  onTabSaved: (id: string) => void;
}

export function EditorMain({ 
  openFiles, 
  activeTabId, 
  onTabContentChange, 
  onTabClose, 
  onTabClick,
  onTabSaved
}: EditorMainProps) {
  
  const activeTab = openFiles.find(t => t.id === activeTabId);

  const handleSave = async () => {
    if (!activeTab || !activeTab.isDirty) return;
    try {
      const vfs = registry.get<VirtualFileSystem>('filesystem');
      // Wait, where is the current content? It's in the tab state!
      // But activeTab.content implies the Tab state tracks the actual string.
      // We didn't add `content` to EditorTab in TabBar.ts, so let's assert it exists or pass it.
      // Let's assume the parent EditorApp manages the content and we just trigger the VFS write here.
      // Wait, we can let EditorApp handle the saving logic instead of passing it down from EditorMain.
    } catch (err) {
      console.error('Failed to save', err);
    }
  };

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-[#0B0F19] overflow-hidden">
      <TabBar 
        openFiles={openFiles} 
        activeTabId={activeTabId} 
        onTabClick={onTabClick}
        onTabClose={onTabClose}
      />
      
      <div className="flex-1 relative">
        {activeTab ? (
          <MonacoCanvas
            key={activeTab.id} // Re-mount or re-use? Re-using is better, but path/language changes handle it
            filePath={activeTab.filePath}
            language={activeTab.language}
            content={(activeTab as any).content}
            onContentChange={(val) => onTabContentChange(activeTab.id, val)}
            // We pass a generic save event back up to EditorApp where VFS is manipulated
            onSave={() => onTabSaved(activeTab.id)}
          />
        ) : (
          <div className="flex items-center justify-center h-full text-white/20 select-none">
            <div className="flex flex-col items-center gap-4">
               <span className="text-4xl text-white/5">DevOS</span>
               <span className="text-sm">Cmd+P to quick open • Cmd+S to save</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
