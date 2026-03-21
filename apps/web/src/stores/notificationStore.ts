import { create } from 'zustand';

export type NotificationType = 'info' | 'success' | 'warning' | 'error';

export interface ToastNotification {
  id: string;
  title?: string;
  message: string;
  type: NotificationType;
  timestamp: number;
  persistent?: boolean;
}

interface NotificationState {
  notifications: ToastNotification[];
  add: (toast: Omit<ToastNotification, 'id' | 'timestamp'>) => void;
  remove: (id: string) => void;
  clearAll: () => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: [],
  add: (toast) => {
    const newToast: ToastNotification = {
      ...toast,
      id: crypto.randomUUID(),
      timestamp: Date.now()
    };
    
    set((state) => ({ notifications: [...state.notifications, newToast] }));
    
    if (!toast.persistent) {
      setTimeout(() => {
        set((state) => ({ notifications: state.notifications.filter(n => n.id !== newToast.id) }));
      }, 4000);
    }
  },
  remove: (id) => set((state) => ({ notifications: state.notifications.filter(n => n.id !== id) })),
  clearAll: () => set({ notifications: [] })
}));
