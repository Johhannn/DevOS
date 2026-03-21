"use client";

import { useNotificationStore } from '../../stores/notificationStore';
import { Cpu, Bell, Settings2 } from 'lucide-react';

export function SystemTray() {
  const notifications = useNotificationStore((state) => state.notifications);
  const unreadCount = notifications.length;

  return (
    <div className="flex items-center gap-1.5 px-2">
      <button className="h-8 w-8 rounded-md flex items-center justify-center text-muted hover:text-foreground hover:bg-surface transition-colors">
        <Cpu size={18} />
      </button>
      
      <button className="relative h-8 w-8 rounded-md flex items-center justify-center text-muted hover:text-foreground hover:bg-surface transition-colors">
        <Bell size={18} />
        {unreadCount > 0 && (
          <div className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-destructive border border-panel shrink-0"></div>
        )}
      </button>

      <button className="h-8 w-8 rounded-md flex items-center justify-center text-muted hover:text-foreground hover:bg-surface transition-colors">
        <Settings2 size={18} />
      </button>
    </div>
  );
}
