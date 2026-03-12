import { create } from 'zustand';

// ─── Types ──────────────────────────────────────────────────────────────────

export type NotificationType = 'info' | 'success' | 'warning' | 'error';

export interface NotificationItem {
  /** Unique notification identifier. */
  id: string;
  /** Title displayed in the notification toast. */
  title: string;
  /** Body message. */
  message: string;
  /** Visual severity type. */
  type: NotificationType;
  /** ISO timestamp of when the notification was created. */
  timestamp: string;
  /** If true, the notification won't auto-dismiss. */
  persistent: boolean;
}

export interface NotificationStoreState {
  notifications: NotificationItem[];
  history: NotificationItem[];
}

export interface NotificationStoreActions {
  /** Push a new notification. Non-persistent ones auto-dismiss after 4000ms. */
  push: (notification: Omit<NotificationItem, 'id' | 'timestamp'>) => void;
  /** Manually dismiss a notification by ID. */
  dismiss: (id: string) => void;
  /** Clear the notification history. */
  clearHistory: () => void;
}

// ─── Store ──────────────────────────────────────────────────────────────────

export const useNotificationStore = create<NotificationStoreState & NotificationStoreActions>(
  (set, get) => ({
    // State
    notifications: [],
    history: [],

    /** Push a new notification. Non-persistent ones auto-dismiss after 4000ms. */
    push: (notification) => {
      const item: NotificationItem = {
        ...notification,
        id: `notif_${crypto.randomUUID().slice(0, 8)}`,
        timestamp: new Date().toISOString(),
      };

      set((state) => ({
        notifications: [...state.notifications, item],
        history: [...state.history, item],
      }));

      // Auto-dismiss non-persistent notifications after 4000ms
      if (!notification.persistent) {
        setTimeout(() => {
          get().dismiss(item.id);
        }, 4000);
      }
    },

    /** Manually dismiss a notification by ID. */
    dismiss: (id) =>
      set((state) => ({
        notifications: state.notifications.filter((n) => n.id !== id),
      })),

    /** Clear the notification history. */
    clearHistory: () => set({ history: [] }),
  })
);
