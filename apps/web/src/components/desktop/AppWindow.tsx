"use client";

import { useWindowStore } from '../../stores/windowStore';
import type { WindowState } from '../../stores/windowStore';
import { Rnd } from 'react-rnd';
import { motion } from 'framer-motion';
import { Suspense } from 'react';
import { DynamicApp } from './DynamicApp';
import { Loader2 } from 'lucide-react';

// ─── Window Chrome (Title Bar) ──────────────────────────────────────────────

function WindowDot({
  color,
  hoverColor,
  onClick,
}: {
  color: string;
  hoverColor: string;
  onClick: (e: React.MouseEvent) => void;
}) {
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onClick(e);
      }}
      className="w-3 h-3 rounded-full transition-all duration-150 hover:scale-110 group-hover:opacity-100"
      style={{ backgroundColor: color }}
      onMouseEnter={(e) => {
        (e.target as HTMLElement).style.backgroundColor = hoverColor;
      }}
      onMouseLeave={(e) => {
        (e.target as HTMLElement).style.backgroundColor = color;
      }}
    />
  );
}

function WindowChrome({
  title,
  focused,
  onClose,
  onMinimise,
  onMaximise,
}: {
  title: string;
  focused: boolean;
  onClose: () => void;
  onMinimise: () => void;
  onMaximise: () => void;
}) {
  return (
    <div
      className={`
        drag-handle h-10 min-h-[40px] flex items-center px-3 gap-3
        bg-window/80 backdrop-blur-sm border-b border-border
        cursor-move select-none transition-opacity duration-150
        ${focused ? 'opacity-100' : 'opacity-80'}
      `}
      onDoubleClick={onMaximise}
    >
      {/* Traffic Light Dots */}
      <div className="flex items-center gap-1.5 group">
        <WindowDot color="#EF4444" hoverColor="#DC2626" onClick={onClose} />
        <WindowDot color="#F59E0B" hoverColor="#D97706" onClick={onMinimise} />
        <WindowDot color="#10B981" hoverColor="#059669" onClick={onMaximise} />
      </div>

      {/* Title */}
      <div className="flex-1 text-center">
        <span className="text-xs font-medium text-muted truncate">
          {title}
        </span>
      </div>

      {/* Spacer to balance the dots */}
      <div className="w-[52px]" />
    </div>
  );
}

// ─── Loading State ──────────────────────────────────────────────────────────

function AppLoadingState() {
  return (
    <div className="flex items-center justify-center w-full h-full bg-desktop">
      <Loader2 className="w-5 h-5 text-accent animate-spin" />
    </div>
  );
}

// ─── AppWindow ──────────────────────────────────────────────────────────────

interface AppWindowProps {
  windowId: string;
}

export function AppWindow({ windowId }: AppWindowProps) {
  const win: WindowState | undefined = useWindowStore(
    (state) => state.windows[windowId]
  );
  const focusWindow = useWindowStore((s) => s.focusWindow);
  const closeWindow = useWindowStore((s) => s.closeWindow);
  const minimiseWindow = useWindowStore((s) => s.minimiseWindow);
  const maximiseWindow = useWindowStore((s) => s.maximiseWindow);
  const restoreWindow = useWindowStore((s) => s.restoreWindow);
  const updateWindowPosition = useWindowStore((s) => s.updateWindowPosition);
  const updateWindowSize = useWindowStore((s) => s.updateWindowSize);

  if (!win) return null;

  const handleToggleMaximise = () => {
    if (win.maximised) {
      restoreWindow(windowId);
    } else {
      maximiseWindow(windowId);
    }
  };

  // ── Minimised State ────────────────────────────────────────────────────
  // Keep in DOM for state preservation but visually hidden
  if (win.minimised) {
    return (
      <motion.div
        key={windowId}
        initial={{ opacity: 1, scale: 1 }}
        animate={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.12, ease: 'easeIn' }}
        className="absolute pointer-events-none"
        style={{ zIndex: win.zIndex }}
      />
    );
  }

  // ── Maximised State ────────────────────────────────────────────────────
  if (win.maximised) {
    return (
      <motion.div
        key={windowId}
        layout
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        transition={{ duration: 0.15, ease: 'easeOut' }}
        className={`
          fixed inset-0 bottom-12 flex flex-col
          bg-window rounded-none border-0
          ${win.focused ? 'ring-0' : 'opacity-95'}
        `}
        style={{ zIndex: win.zIndex }}
        onMouseDown={() => focusWindow(windowId)}
      >
        <WindowChrome
          title={win.title}
          focused={win.focused}
          onClose={() => closeWindow(windowId)}
          onMinimise={() => minimiseWindow(windowId)}
          onMaximise={handleToggleMaximise}
        />
        <div className="flex-1 overflow-hidden bg-desktop">
          <Suspense fallback={<AppLoadingState />}>
            <DynamicApp appId={win.appId} />
          </Suspense>
        </div>
      </motion.div>
    );
  }

  // ── Normal (Floating) State ────────────────────────────────────────────
  return (
    <motion.div
      key={windowId}
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.15, ease: 'easeOut' }}
      style={{
        position: 'absolute',
        zIndex: win.zIndex,
      }}
    >
      <Rnd
        position={{ x: win.x, y: win.y }}
        size={{ width: win.width, height: win.height }}
        minWidth={win.minWidth}
        minHeight={win.minHeight}
        bounds="parent"
        dragHandleClassName="drag-handle"
        onDragStop={(_e, d) => updateWindowPosition(windowId, d.x, d.y)}
        onResizeStop={(_e, _dir, ref, _delta, pos) => {
          updateWindowSize(
            windowId,
            parseInt(ref.style.width),
            parseInt(ref.style.height)
          );
          updateWindowPosition(windowId, pos.x, pos.y);
        }}
        onMouseDown={() => focusWindow(windowId)}
        style={{ zIndex: win.zIndex }}
        className={`
          flex flex-col
          bg-window rounded-xl border border-border
          shadow-window backdrop-blur-sm overflow-hidden
          transition-shadow duration-150
          ${win.focused ? 'ring-1 ring-accent/30' : 'opacity-95'}
        `}
      >
        <WindowChrome
          title={win.title}
          focused={win.focused}
          onClose={() => closeWindow(windowId)}
          onMinimise={() => minimiseWindow(windowId)}
          onMaximise={handleToggleMaximise}
        />
        <div className="flex-1 overflow-hidden bg-desktop">
          <Suspense fallback={<AppLoadingState />}>
            <DynamicApp appId={win.appId} />
          </Suspense>
        </div>
      </Rnd>
    </motion.div>
  );
}
