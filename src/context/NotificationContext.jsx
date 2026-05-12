import { createContext, useContext, useMemo, useState } from "react";

const NotificationContext = createContext(null);
const STORAGE_KEY = "campustracker:notifications";

function readNotifications() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState(readNotifications);

  const persist = (next) => {
    setNotifications(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  };

  const addNotification = ({ userId = null, role = null, title, message, type }) => {
    const item = {
      id: Date.now() + Math.random(),
      userId,
      role,
      title,
      message,
      type,
      isRead: false,
      createdAt: new Date().toISOString(),
    };
    setNotifications((current) => {
      const next = [item, ...current];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
    return item;
  };

  const markAsRead = (id) => persist(notifications.map((item) => item.id === id ? { ...item, isRead: true } : item));
  const markAllAsRead = (scope) => persist(notifications.map((item) => scope(item) ? { ...item, isRead: true } : item));
  const deleteNotification = (id) => persist(notifications.filter((item) => item.id !== id));

  const value = useMemo(() => ({
    notifications,
    addNotification,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  }), [notifications]);

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
}

export function useNotifications() {
  return useContext(NotificationContext);
}
