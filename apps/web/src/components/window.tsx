"use client";

import { useSystemStore } from '@devos/kernel';
import { Rnd } from 'react-rnd';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Minus, Square } from 'lucide-react';

export function Window({ id }: { id: string }) {
  const windowState = useSystemStore(state => state.windows[id]);
  const focusWindow = useSystemStore(state => state.focusWindow);
  const closeWindow = useSystemStore(state => state.closeWindow);
  const updateWindow = useSystemStore(state => state.updateWindow);
  const toggleMinimize = useSystemStore(state => state.toggleMinimize);
  const toggleMaximize = useSystemStore(state => state.toggleMaximize);

  if (!windowState) return null;

  // Don't render the rnd component if maximized (we'll just use a full div)
  // or minimized (we keep it hidden but alive in the DOM for state preservation)
  if (windowState.minimized) return null;

  const handleDragStop = (e: any, d: any) => {
    updateWindow(id, { position: { x: d.x, y: d.y } });
  };

  const handleResizeStop = (e: any, direction: any, ref: any, delta: any, position: any) => {
    updateWindow(id, {
      size: { width: parseInt(ref.style.width), height: parseInt(ref.style.height) },
      position
    });
  };

  const windowContent = (
    <div 
      className={`flex flex-col w-full h-full bg-[#111827] border border-white/10 rounded-lg shadow-2xl overflow-hidden ${windowState.focused ? 'ring-1 ring-[#6366F1]/50' : ''}`}
      onMouseDown={() => focusWindow(id)}
    >
      {/* Title Bar */}
      <div 
        className="h-9 min-h-[36px] bg-[#1F2937] border-b border-white/5 flex items-center justify-between px-3 select-none drag-handle cursor-move"
        onDoubleClick={() => toggleMaximize(id)}
      >
        <div className="flex items-center gap-2">
           <div className="text-xs font-semibold text-white/80">{windowState.title}</div>
        </div>

        <div className="flex items-center gap-1.5 opacity-60 hover:opacity-100 transition-opacity">
          <button onClick={(e) => { e.stopPropagation(); toggleMinimize(id); }} className="w-5 h-5 flex items-center justify-center hover:bg-white/10 rounded">
            <Minus size={14} />
          </button>
          <button onClick={(e) => { e.stopPropagation(); toggleMaximize(id); }} className="w-5 h-5 flex items-center justify-center hover:bg-white/10 rounded">
            <Square size={12} />
          </button>
          <button onClick={(e) => { e.stopPropagation(); closeWindow(id); }} className="w-5 h-5 flex items-center justify-center hover:bg-red-500 hover:text-white rounded">
            <X size={14} />
          </button>
        </div>
      </div>

      {/* App Content */}
      <div className="flex-grow relative overflow-hidden bg-[#0B0F19]">
        {/* Render child app here based on appId */}
        <div className="p-4 font-mono text-sm text-white/50">
          Mounting {windowState.appId}...
        </div>
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
        ...(windowState.maximized ? { top: 0, left: 0, right: 0, bottom: 48, width: '100%', height: 'calc(100% - 48px)' } : {})
      }}
    >
      {windowState.maximized ? (
         <div className="w-full h-full">{windowContent}</div>
      ) : (
        <Rnd
          default={{
            x: windowState.position.x,
            y: windowState.position.y,
            width: windowState.size.width,
            height: windowState.size.height,
          }}
          position={windowState.position}
          size={windowState.size}
          minWidth={300}
          minHeight={200}
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
