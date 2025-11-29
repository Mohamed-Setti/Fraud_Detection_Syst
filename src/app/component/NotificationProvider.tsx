import React, { createContext, useCallback, useContext, useMemo, useState } from "react";

export type NotificationItem = {
  id: string;
  title: string;
  message: string;
  timestamp: number;
  read?: boolean;
};

type NotificationsContextValue = {
  notifications: NotificationItem[];
  unreadCount: number;
  visible: boolean;
  show: () => void;
  hide: () => void;
  toggle: () => void;
  addNotification: (n: Omit<NotificationItem, "id" | "read">) => void;
  markAllRead: () => void;
  removeAll: () => void;
};

const NotificationsContext = createContext<NotificationsContextValue | null>(null);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [visible, setVisible] = useState<boolean>(false);

  const addNotification = useCallback((n: Omit<NotificationItem, "id" | "read">) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    const item: NotificationItem = { id, ...n, read: false };
    setNotifications((prev) => [item, ...prev].slice(0, 200)); // garder max 200
  }, []);

  const markAllRead = useCallback(() => {
    setNotifications((prev) => prev.map((p) => ({ ...p, read: true })));
  }, []);

  const removeAll = useCallback(() => {
    setNotifications([]);
  }, []);

  const show = useCallback(() => setVisible(true), []);
  const hide = useCallback(() => setVisible(false), []);
  const toggle = useCallback(() => setVisible((v) => !v), []);

  const unreadCount = useMemo(() => notifications.filter((n) => !n.read).length, [notifications]);

  const value = useMemo(
    () => ({ notifications, unreadCount, visible, show, hide, toggle, addNotification, markAllRead, removeAll }),
    [notifications, unreadCount, visible, show, hide, toggle, addNotification, markAllRead, removeAll]
  );

  return <NotificationsContext.Provider value={value}>{children}</NotificationsContext.Provider>;
};

export function useNotificationsContext(): NotificationsContextValue {
  const ctx = useContext(NotificationsContext);
  if (!ctx) throw new Error("useNotificationsContext must be used within NotificationProvider");
  return ctx;
}