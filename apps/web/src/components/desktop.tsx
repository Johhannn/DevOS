"use client";

import { Taskbar } from './taskbar';
import { WindowManager } from './window-manager';

export function Desktop() {
  return (
    <div className="relative w-full h-full flex flex-col overflow-hidden">
      {/* Background Wallpaper */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0B0F19] via-[#111827] to-[#0B0F19] z-0">
        <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(circle_at_center,_white_1px,_transparent_1px)] bg-[length:24px_24px]"></div>
      </div>
      
      {/* Desktop Icon Area / Window Area */}
      <WindowManager />

      {/* Fixed Taskbar at bottom */}
      <Taskbar />
    </div>
  );
}
