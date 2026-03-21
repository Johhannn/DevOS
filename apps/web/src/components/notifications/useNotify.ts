"use client";

import { useNotificationStore } from '../../stores/notificationStore';

export function useNotify() {
  const add = useNotificationStore(state => state.add);

  const notify = (message: string, title?: string, persistent?: boolean) => {
    add({ message, title, type: 'info', persistent });
  };

  const success = (message: string, title?: string, persistent?: boolean) => {
    add({ message, title, type: 'success', persistent });
  };

  const warning = (message: string, title?: string, persistent?: boolean) => {
    add({ message, title, type: 'warning', persistent });
  };

  const error = (message: string, title?: string, persistent?: boolean) => {
    add({ message, title, type: 'error', persistent });
  };

  return { notify, success, warning, error };
}
