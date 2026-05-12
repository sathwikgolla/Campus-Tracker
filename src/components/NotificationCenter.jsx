import { Bell, Trash2 } from "lucide-react";
import { useMemo } from "react";
import { useAuth } from "../context/AuthContext";
import { useNotifications } from "../context/NotificationContext";
import { Button } from "./ui/Button";
import { Card } from "./ui/Card";

export function NotificationCenter() {
  const { user, role } = useAuth();
  const { notifications, markAsRead, markAllAsRead, deleteNotification } = useNotifications();
  const scoped = useMemo(
    () => notifications.filter((item) => item.userId === user?.id || item.role === role || item.role === "all"),
    [notifications, role, user?.id]
  );
  const unreadCount = scoped.filter((item) => !item.isRead).length;

  return (
    <Card className="p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3"><Bell className="text-cyan" /><h3 className="text-xl font-black text-white">Notifications</h3><span className="rounded-full bg-cyan/10 px-3 py-1 text-sm text-cyan">{unreadCount} unread</span></div>
        <Button variant="secondary" onClick={() => markAllAsRead((item) => scoped.some((notice) => notice.id === item.id))}>Mark All as Read</Button>
      </div>
      {scoped.length === 0 ? (
        <div className="mt-5 rounded-3xl border border-white/10 bg-white/[0.035] p-8 text-center">
          <p className="text-lg font-bold text-white">No notifications yet.</p>
          <p className="mt-2 text-sm text-slateText">Notifications will appear when requests, status updates, or broadcasts happen.</p>
        </div>
      ) : (
        <div className="mt-5 grid gap-3">
          {scoped.map((item) => (
            <div key={item.id} className="rounded-2xl border border-white/10 bg-white/[0.035] p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-white">{item.title}</p>
                    <span className={`rounded-full border px-2 py-0.5 text-xs ${item.isRead ? "border-white/10 text-slateText" : "border-cyan/25 bg-cyan/10 text-cyan"}`}>{item.isRead ? "Read" : "Unread"}</span>
                  </div>
                  <p className="mt-1 text-sm text-slateText">{item.message}</p>
                  <p className="mt-2 text-xs text-muted">{new Date(item.createdAt).toLocaleString()}</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="secondary" onClick={() => markAsRead(item.id)} className="px-3 py-2">Mark as Read</Button>
                  <Button variant="danger" onClick={() => deleteNotification(item.id)} className="px-3 py-2"><Trash2 className="h-4 w-4" /></Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
