"use client";

import { Bot, Bell, Settings } from 'lucide-react';
import { useNotificationStore } from '../../stores/notificationStore';

export function SystemTray() {
  const notifications = useNotificationStore((state) => state.notifications);
  const hasUnread = notifications.length > 0;

  return (
    <div className="flex items-center gap-1">
      <button className="relative w-8 h-8 flex items-center justify-center rounded-md hover:bg-surface/60 text-muted hover:text-foreground transition-colors">
        <Bot className="w-4 h-4" />
      </button>
      
      <button className="relative w-8 h-8 flex items-center justify-center rounded-md hover:bg-surface/60 text-muted hover:text-foreground transition-colors">
        <Bell className="w-4 h-4" />
        {hasUnread && (
          <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-red-500 ring-2 ring-panel" />
        )}
      </button>

      <button className="relative w-8 h-8 flex items-center justify-center rounded-md hover:bg-surface/60 text-muted hover:text-foreground transition-colors">
        <Settings className="w-4 h-4" />
      </button>
    </div>
  );
}
