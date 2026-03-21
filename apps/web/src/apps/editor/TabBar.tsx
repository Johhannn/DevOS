import { X } from 'lucide-react';
import { detectLanguage } from './languageDetector';

export interface EditorTab {
  id: string; // usually filePath
  filePath: string;
  isDirty: boolean;
  language: string;
}

interface TabBarProps {
  openFiles: EditorTab[];
  activeTabId: string | null;
  onTabClick: (id: string) => void;
  onTabClose: (id: string) => void;
}

const getFileIconColors = (language: string) => {
  switch (language) {
    case 'typescript': return 'text-blue-400';
    case 'javascript': return 'text-yellow-400';
    case 'python': return 'text-green-400';
    case 'json': return 'text-emerald-400';
    case 'markdown': return 'text-purple-400';
    case 'css': return 'text-blue-300';
    case 'html': return 'text-orange-400';
    default: return 'text-slate-400';
  }
};

export function TabBar({ openFiles, activeTabId, onTabClick, onTabClose }: TabBarProps) {
  if (openFiles.length === 0) return null;

  return (
    <div className="flex w-full h-[35px] min-h-[35px] bg-[#111827] border-b border-[#1F2937] overflow-x-auto no-scrollbar select-none text-sm">
      {openFiles.map(tab => {
        const isActive = tab.id === activeTabId;
        const filename = tab.filePath.split('/').pop() || tab.filePath;
        
        return (
          <div
            key={tab.id}
            onClick={() => onTabClick(tab.id)}
            className={`group flex items-center h-full min-w-[120px] max-w-[200px] border-r border-[#1F2937] transition-colors cursor-pointer ${
              isActive 
                ? 'bg-[#1F2937] border-t-2 border-t-accent text-white' 
                : 'bg-[#111827] border-t-2 border-t-transparent text-white/60 hover:bg-[#1F2937]/50'
            }`}
          >
            <div className="flex items-center w-full px-3 gap-2">
              {/* File Icon logic could go here, fallback to circle */}
              <div className={`w-3 h-3 rounded-sm ${getFileIconColors(tab.language)} flex items-center justify-center text-[10px]`}>
                 {}
              </div>
              <span className="flex-1 truncate">{filename}</span>
              
              <div 
                className="w-5 h-5 flex items-center justify-center shrink-0 rounded transition-colors hover:bg-white/10"
                onClick={(e) => {
                  e.stopPropagation();
                  onTabClose(tab.id);
                }}
              >
                {tab.isDirty ? (
                  <div className="w-2 h-2 rounded-full bg-white opacity-80 group-hover:hidden" />
                ) : null}
                <X size={14} className={`opacity-0 group-hover:opacity-100 ${tab.isDirty ? 'hidden group-hover:block' : ''}`} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
