"use client";

import { useWindowStore } from '../stores/windowStore';
import { Rnd } from 'react-rnd';
import { motion } from 'framer-motion';
import { X, Minus, Square } from 'lucide-react';
import TerminalApp from '../apps/terminal/TerminalApp';
import EditorApp from '../apps/editor/EditorApp';

export function Window({ id }: { id: string }) {
  const windowState = useWindowStore(state => state.windows[id]);
  const focusWindow = useWindowStore(state => state.focusWindow);
  const closeWindow = useWindowStore(state => state.closeWindow);
  const minimiseWindow = useWindowStore(state => state.minimiseWindow);
  const maximiseWindow = useWindowStore(state => state.maximiseWindow);
  const updateWindowPosition = useWindowStore(state => state.updateWindowPosition);
  const updateWindowSize = useWindowStore(state => state.updateWindowSize);

  if (!windowState) return null;
  if (windowState.minimised) return null;

  const handleDragStop = (_e: unknown, d: { x: number; y: number }) => {
    updateWindowPosition(id, d.x, d.y);
  };

  const handleResizeStop = (_e: unknown, _dir: unknown, ref: HTMLElement, _delta: unknown, position: { x: number; y: number }) => {
    updateWindowSize(id, parseInt(ref.style.width), parseInt(ref.style.height));
    updateWindowPosition(id, position.x, position.y);
  };

  const windowContent = (
    <div 
      className={`flex flex-col w-full h-full bg-panel border border-white/10 rounded-lg shadow-2xl overflow-hidden ${windowState.focused ? 'ring-1 ring-accent/50' : ''}`}
      onMouseDown={() => focusWindow(id)}
    >
      {/* Title Bar */}
      <div 
        className="h-9 min-h-[36px] bg-window border-b border-white/5 flex items-center justify-between px-3 select-none drag-handle cursor-move"
        onDoubleClick={() => maximiseWindow(id)}
      >
        <div className="flex items-center gap-2">
           <div className="text-xs font-semibold text-white/80">{windowState.title}</div>
        </div>

        <div className="flex items-center gap-1.5 opacity-60 hover:opacity-100 transition-opacity">
          <button onClick={(e) => { e.stopPropagation(); minimiseWindow(id); }} className="w-5 h-5 flex items-center justify-center hover:bg-white/10 rounded">
            <Minus size={14} />
          </button>
          <button onClick={(e) => { e.stopPropagation(); maximiseWindow(id); }} className="w-5 h-5 flex items-center justify-center hover:bg-white/10 rounded">
            <Square size={12} />
          </button>
          <button onClick={(e) => { e.stopPropagation(); closeWindow(id); }} className="w-5 h-5 flex items-center justify-center hover:bg-danger hover:text-white rounded">
            <X size={14} />
          </button>
        </div>
      </div>

      {/* App Content */}
      <div className="flex-grow relative overflow-hidden bg-desktop">
        {windowState.appId === 'terminal' ? (
          <TerminalApp />
        ) : windowState.appId === 'editor' ? (
          <EditorApp />
        ) : (
          <div className="p-4 font-mono text-sm text-white/50">
            Mounting {windowState.appId}...
          </div>
        )}
      </div>
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.15, ease: "easeOut" }}
      style={{
        position: 'absolute',
        zIndex: windowState.zIndex,
        ...(windowState.maximised ? { top: 0, left: 0, right: 0, bottom: 48, width: '100%', height: 'calc(100% - 48px)' } : {})
      }}
    >
      {windowState.maximised ? (
         <div className="w-full h-full">{windowContent}</div>
      ) : (
        <Rnd
          default={{
            x: windowState.x,
            y: windowState.y,
            width: windowState.width,
            height: windowState.height,
          }}
          position={{ x: windowState.x, y: windowState.y }}
          size={{ width: windowState.width, height: windowState.height }}
          minWidth={windowState.minWidth}
          minHeight={windowState.minHeight}
          bounds="parent"
          dragHandleClassName="drag-handle"
          onDragStop={handleDragStop}
          onResizeStop={handleResizeStop}
          onMouseDown={() => focusWindow(id)}
          style={{ zIndex: windowState.zIndex }}
        >
          {windowContent}
        </Rnd>
      )}
    </motion.div>
  );
}
