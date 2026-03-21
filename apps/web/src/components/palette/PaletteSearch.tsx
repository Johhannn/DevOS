"use client";

import { useEffect, useRef } from 'react';
import { Search } from 'lucide-react';

interface PaletteSearchProps {
  query: string;
  onQueryChange: (val: string) => void;
}

export function PaletteSearch({ query, onQueryChange }: PaletteSearchProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Auto focus on mount
    const timeout = setTimeout(() => {
      inputRef.current?.focus();
    }, 50);
    return () => clearTimeout(timeout);
  }, []);

  return (
    <div className="flex items-center px-4 h-14 border-b border-border bg-panel shrink-0">
      <Search size={20} className="text-muted mr-3" />
      <input
        ref={inputRef}
        type="text"
        value={query}
        onChange={(e) => onQueryChange(e.target.value)}
        placeholder="Search apps, files, commands... (type > for system)"
        className="flex-1 bg-transparent border-none outline-none text-foreground text-lg placeholder:text-muted/60"
      />
      <div className="flex items-center justify-center px-2 py-0.5 rounded border border-border bg-black/20 text-[10px] text-muted font-bold select-none ml-3">
        ESC
      </div>
    </div>
  );
}
