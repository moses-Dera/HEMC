'use client';

import { useState, useEffect, useRef } from 'react';
import { Bell, Check, ExternalLink } from 'lucide-react';
import { getNotificationsAction, getUnreadNotificationCountAction, markNotificationReadAction, markAllNotificationsReadAction } from '@/app/actions/notifications';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface NotificationItem {
  id: number;
  title: string;
  message: string;
  link?: string;
  is_read: boolean;
  created_at: string;
}

export default function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const fetchNotifs = async () => {
    try {
      const [notifs, count] = await Promise.all([
        getNotificationsAction(),
        getUnreadNotificationCountAction()
      ]);
      setNotifications(notifs);
      
      setUnreadCount((prevCount) => {
        if (count > prevCount && prevCount !== 0) {
          toast.info('New notification received');
        }
        return count;
      });
    } catch (err) {
      console.error('Failed to fetch notifications', err);
    }
  };

  useEffect(() => {
    fetchNotifs();
    // Simple polling every 30 seconds
    const interval = setInterval(fetchNotifs, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleNotificationClick = async (notif: NotificationItem) => {
    if (!notif.is_read) {
      await markNotificationReadAction(notif.id);
      setUnreadCount(prev => Math.max(0, prev - 1));
      setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, is_read: true } : n));
    }
    setIsOpen(false);
    if (notif.link) {
      router.push(notif.link);
    }
  };

  const handleMarkAllRead = async () => {
    await markAllNotificationsReadAction();
    setUnreadCount(0);
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-full hover:bg-slate-100 dark:hover:bg-white/5 transition-colors text-slate-600 dark:text-slate-300"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white dark:border-slate-900" />
        )}
      </button>

      {isOpen && (
        <div className="absolute top-12 right-0 md:right-auto md:-left-4 w-80 max-h-[28rem] overflow-hidden bg-white dark:bg-bg-card-dark rounded-2xl shadow-xl border border-slate-200/80 dark:border-white/10 flex flex-col z-50 animate-in fade-in slide-in-from-top-4 duration-200">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-white/5 shrink-0 bg-slate-50/50 dark:bg-transparent">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">Notifications</h3>
            {unreadCount > 0 && (
              <button 
                onClick={handleMarkAllRead}
                className="text-[10px] font-semibold text-primary hover:text-primary-hover flex items-center gap-1"
              >
                <Check className="w-3 h-3" /> Mark all read
              </button>
            )}
          </div>
          
          <div className="flex-1 overflow-y-auto scrollbar-thin flex flex-col">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-slate-400">
                <Bell className="w-8 h-8 mx-auto mb-2 opacity-20" />
                <p className="text-xs font-medium">No notifications yet</p>
              </div>
            ) : (
              notifications.map((notif) => (
                <button
                  key={notif.id}
                  onClick={() => handleNotificationClick(notif)}
                  className={`text-left px-4 py-3 border-b border-slate-100/50 dark:border-white/[0.02] hover:bg-slate-50 dark:hover:bg-white/5 transition-colors group ${
                    !notif.is_read ? 'bg-primary/5 dark:bg-primary/10' : ''
                  }`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <p className={`text-xs font-bold line-clamp-1 ${!notif.is_read ? 'text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-300'}`}>
                      {notif.title}
                    </p>
                    {notif.link && (
                      <ExternalLink className="w-3 h-3 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                    {notif.message}
                  </p>
                  <p className="text-[9px] text-slate-400 mt-2 font-medium">
                    {new Date(notif.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </p>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
