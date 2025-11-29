import type { NextApiRequest } from "next";
import type { NextApiResponse } from "next";
import type { Server as IOServer } from "socket.io";
import type { Server as NetServer } from "http";

type NotifyBody = {
  title?: string;
  message?: string;
  room?: string;
};

type ServerToClientEvents = {
  notification: (data: { title: string; message: string; timestamp: number }) => void;
};

type NextApiResponseWithIO = NextApiResponse & {
  socket: {
    server: NetServer & {
      io?: IOServer;
    };
  };
};

export default async function handler(req: NextApiRequest, res: NextApiResponseWithIO) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const io = res.socket.server.io;
  if (!io) {
    return res.status(500).json({ error: "Socket.io not initialized. Call /api/socketio first." });
  }

  const { title = "Notification", message = "Nouveau message", room } = req.body as NotifyBody;
  const payload = { title, message, timestamp: Date.now() };

  if (room) {
    io.to(room).emit("notification", payload);
  } else {
    io.emit("notification", payload);
  }

  return res.status(200).json({ ok: true, sent: payload });
}