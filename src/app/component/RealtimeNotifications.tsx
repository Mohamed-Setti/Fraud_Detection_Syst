import React, { useEffect } from "react";
import { io, Socket } from "socket.io-client";
import { useNotifications } from "./useNotifications";

type Payload = { title: string; message: string; timestamp: number; id?: string; meta?: any };

type ServerToClientEvents = {
  notification: (data: Payload) => void;
};

type ClientToServerEvents = {
  join: (room: string) => void;
};

export const RealtimeNotifications: React.FC = () => {
  const { addNotification } = useNotifications();

  useEffect(() => {
    if (typeof window === "undefined") return;

    let socket: Socket<ServerToClientEvents, ClientToServerEvents> | null = null;

    async function init() {
      try {
        await fetch("/api/socketio");
      } catch {
        // ignore
      }

      socket = io(window.location.origin, { path: "/api/socketio" }) as Socket<
        ServerToClientEvents,
        ClientToServerEvents
      >;

      socket.on("connect", () => {
        // Récupère user depuis localStorage — utile pour joindre la room
        try {
          const saved = localStorage.getItem("user");
          const user = saved ? JSON.parse(saved) : null;
          const userId = user?._id || user?.id || null;
          if (userId) {
            socket!.emit("join", `user:${userId}`);
          }
        } catch (e) {
          // si parsing échoue, on ne join pas la room
          console.warn("Impossible de lire localStorage user:", e);
        }
      });

      socket.on("notification", (data: Payload) => {
        addNotification({ title: data.title, message: data.message, timestamp: data.timestamp });
        if (typeof Notification !== "undefined" && Notification.permission === "granted") {
          try {
            // eslint-disable-next-line no-new
            new Notification(data.title, { body: data.message });
          } catch {
            // ignore
          }
        }
      });
    }

    init();

    return () => {
      if (socket) socket.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
};
export default RealtimeNotifications;