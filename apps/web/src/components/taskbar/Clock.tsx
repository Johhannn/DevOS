"use client";

import { useEffect, useState } from 'react';
import { useSystemStore } from '../../stores/systemStore';
import { Tooltip } from '@devos/ui';

export function Clock() {
  const currentTime = useSystemStore((state) => state.currentTime);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(t);
  }, []);

  if (!mounted) {
    return <div className="px-2 text-sm font-mono text-muted">--:--</div>;
  }

  // Format time (HH:MM in 12h format)
  const timeString = currentTime.toLocaleTimeString([], {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });

  // Format date (e.g., Monday, January 1, 2024)
  const dateString = currentTime.toLocaleDateString(undefined, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <Tooltip content={<p className="text-sm">{dateString}</p>}>
      <div className="px-2 py-1 ml-1 rounded-md hover:bg-surface/60 cursor-default transition-colors flex items-center justify-center">
        <span className="text-sm font-mono text-muted">{timeString}</span>
      </div>
    </Tooltip>
  );
}
