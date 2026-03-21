"use client";

import { useNotificationStore } from '../../stores/notificationStore';
import { NotificationToast } from './NotificationToast';
import { AnimatePresence, motion } from 'framer-motion';

export function NotificationContainer() {
  const notifications = useNotificationStore(state => state.notifications);
  
  const visibleToasts = notifications.slice(-3); // Show max 3 recent
  const hiddenCount = Math.max(0, notifications.length - 3);

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 items-end pointer-events-none">
      <AnimatePresence mode="popLayout">
        {visibleToasts.map(toast => (
          <NotificationToast key={toast.id} {...toast} />
        ))}
      </AnimatePresence>

      {hiddenCount > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-accent/20 border border-accent/30 text-accent px-3 py-1 rounded-full text-xs font-semibold shadow-sm backdrop-blur-md"
        >
          +{hiddenCount} more
        </motion.div>
      )}
    </div>
  );
}
