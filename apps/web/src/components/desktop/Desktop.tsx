"use client";

import { useCallback, useEffect } from 'react';
import { WindowManager } from './WindowManager';
import { Taskbar } from './Taskbar';
import { useWindowStore } from '../../stores/windowStore';
import { usePreferencesStore } from '../../stores/preferencesStore';
import { kernel } from '@devos/kernel';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from '@devos/ui';

export function Desktop() {
  const wallpaper = usePreferencesStore((s) => s.wallpaper);
  const openWindow = useWindowStore((s) => s.openWindow);

  // ── Listen for kernel window.open events ────────────────────────────
  useEffect(() => {
    const unsub = kernel.on('window.open', (event) => {
      const { appId, title } = event.payload as { windowId: string; appId: string; title: string };
      openWindow({ appId, title });
    });
    return unsub;
  }, [openWindow]);

  // ── Context Menu Handlers ───────────────────────────────────────────
  const handleNewFile = useCallback(() => {
    kernel.emit('filesystem.write', { path: '/home/untitled.txt', content: '' });
  }, []);

  const handleNewFolder = useCallback(() => {
    kernel.emit('filesystem.mkdir', { path: '/home/new-folder' });
  }, []);

  const handleOpenTerminal = useCallback(() => {
    openWindow({
      appId: 'devos.terminal',
      title: 'Terminal',
      width: 700,
      height: 450,
    });
  }, [openWindow]);

  const handleOpenSettings = useCallback(() => {
    openWindow({
      appId: 'devos.settings',
      title: 'Settings',
      width: 600,
      height: 500,
    });
  }, [openWindow]);

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <div
          className="relative w-screen h-screen overflow-hidden flex flex-col"
          style={{ background: wallpaper }}
        >
          {/* Wallpaper Overlay (subtle noise texture) */}
          <div className="absolute inset-0 bg-desktop/50 pointer-events-none" />

          {/* Desktop Icon Area / Window Area */}
          <div className="relative flex-1">
            <WindowManager />
          </div>

          {/* Fixed Taskbar at bottom */}
          <Taskbar />
        </div>
      </ContextMenuTrigger>

      <ContextMenuContent className="w-48">
        <ContextMenuItem onClick={handleNewFile}>
          📄&ensp;New File
        </ContextMenuItem>
        <ContextMenuItem onClick={handleNewFolder}>
          📁&ensp;New Folder
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem onClick={handleOpenTerminal}>
          ⌨️&ensp;Open Terminal
        </ContextMenuItem>
        <ContextMenuItem onClick={handleOpenSettings}>
          ⚙️&ensp;Settings
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}
