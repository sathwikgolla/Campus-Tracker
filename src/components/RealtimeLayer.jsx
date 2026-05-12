import { useEffect } from "react";
import { io } from "socket.io-client";
import { useAuth } from "../context/AuthContext";

export function RealtimeLayer() {
  const { user, role, isAuthenticated } = useAuth();
  useEffect(() => {
    if (!isAuthenticated) return undefined;
    const socket = io(import.meta.env.VITE_SOCKET_URL || "http://localhost:5000", { transports: ["websocket"] });
    socket.emit("joinUser", user?.id);
    socket.emit("joinRole", role);
    socket.on("facultyStatusUpdated", (payload) => {
      window.dispatchEvent(new CustomEvent("campus:toast", { detail: `Faculty status updated: ${payload.status}` }));
    });
    socket.on("newNotification", (payload) => {
      window.dispatchEvent(new CustomEvent("campus:toast", { detail: payload.title }));
    });
    socket.on("emergencyBroadcast", (payload) => {
      window.campusBroadcast?.(payload);
    });
    socket.on("requestStatusUpdated", () => {
      window.dispatchEvent(new CustomEvent("campus:toast", { detail: "Request status updated" }));
    });
    return () => socket.disconnect();
  }, [isAuthenticated, role, user?.id]);
  return null;
}
