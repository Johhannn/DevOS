"use client";

import { TabBar, EditorTab } from './TabBar';
import { MonacoCanvas } from './MonacoCanvas';

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
