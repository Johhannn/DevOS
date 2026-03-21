import { create } from 'zustand';

interface PaletteState {
  isOpen: boolean;
  query: string;
  selectedIndex: number;
  open: () => void;
  close: () => void;
  setQuery: (q: string) => void;
  setSelectedIndex: (index: number) => void;
  navigate: (dir: 1 | -1, maxIndex: number) => void;
}

export const usePaletteStore = create<PaletteState>((set) => ({
  isOpen: false,
  query: '',
  selectedIndex: 0,
  open: () => set({ isOpen: true, query: '', selectedIndex: 0 }),
  close: () => set({ isOpen: false }),
  setQuery: (query) => set({ query, selectedIndex: 0 }), // reset index on new query
  setSelectedIndex: (index) => set({ selectedIndex: index }),
  navigate: (dir, maxIndex) => set((state) => {
    let newIndex = state.selectedIndex + dir;
    if (newIndex < 0) newIndex = maxIndex;
    if (newIndex > maxIndex) newIndex = 0;
    return { selectedIndex: newIndex };
  })
}));
