"use client";

import { motion } from 'framer-motion';
import { Info, CheckCircle2, AlertTriangle, XCircle, X } from 'lucide-react';
import type { ToastNotification } from '../../stores/notificationStore';
import { useNotificationStore } from '../../stores/notificationStore';
import { useEffect, useState } from 'react';

export function NotificationToast({ id, title, message, type, persistent }: ToastNotification) {
  const remove = useNotificationStore(state => state.remove);
  
  let borderColor = 'border-l-accent';
  let Icon = Info;
  let iconColor = 'text-accent';

  switch (type) {
    case 'success':
      borderColor = 'border-l-green-500';
      Icon = CheckCircle2;
      iconColor = 'text-green-500';
      break;
    case 'warning':
      borderColor = 'border-l-amber-500';
      Icon = AlertTriangle;
      iconColor = 'text-amber-500';
      break;
    case 'error':
      borderColor = 'border-l-red-500';
      Icon = XCircle;
      iconColor = 'text-red-500';
      break;
    case 'info':
    default:
      borderColor = 'border-l-accent';
      Icon = Info;
      iconColor = 'text-accent';
      break;
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 60, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 60, scale: 0.95, transition: { duration: 0.2 } }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      className={`relative bg-panel border-y border-r border-[#374151] border-l-4 ${borderColor} rounded-lg p-4 w-80 shadow-elevated overflow-hidden pointer-events-auto group`}
    >
      <div className="flex items-start gap-3 relative z-10">
        <Icon className={`shrink-0 mt-0.5 ${iconColor}`} size={18} />
        <div className="flex-1 min-w-0 pr-6">
          {title && <h4 className="text-sm font-semibold text-foreground mb-1">{title}</h4>}
          <p className="text-xs text-muted/90 break-words leading-relaxed">{message}</p>
        </div>
      </div>

      <button
        onClick={() => remove(id)}
        className="absolute top-2 right-2 p-1 text-muted hover:text-white hover:bg-white/10 rounded-md transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100 z-20 outline-none"
      >
        <X size={14} />
      </button>

      {!persistent && (
        <motion.div
          initial={{ width: '100%' }}
          animate={{ width: '0%' }}
          transition={{ duration: 4, ease: 'linear' }}
          className={`absolute bottom-0 left-0 h-[2px] opacity-30 ${iconColor.replace('text-', 'bg-')}`}
        />
      )}
    </motion.div>
  );
}
