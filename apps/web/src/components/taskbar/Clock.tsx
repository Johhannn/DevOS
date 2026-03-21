"use client";

import { useSystemStore } from '../../stores/systemStore';
import { useMemo, useEffect, useState } from 'react';

// Attempt to use Tooltip from @devos/ui if available, fallback to title otherwise.
import { Tooltip } from '@devos/ui';

export function Clock() {
  const currentTime = useSystemStore((state) => state.currentTime);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const timeString = useMemo(() => {
    return currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }, [currentTime]);

  const dateString = useMemo(() => {
    return currentTime.toLocaleDateString(undefined, { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  }, [currentTime]);

  if (!mounted) {
    return (
      <div className="flex items-center justify-center font-mono text-sm text-muted w-12 h-8">
      </div>
    );
  }

  // If Tooltip is provided by @devos/ui
  return (
    <Tooltip content={<div className="text-xs">{dateString}</div>}>
      <div 
        className="flex items-center justify-center font-mono text-sm text-muted hover:text-foreground hover:bg-surface px-2 h-8 rounded-md transition-colors cursor-default"
      >
        {timeString}
      </div>
    </Tooltip>
  );
}
