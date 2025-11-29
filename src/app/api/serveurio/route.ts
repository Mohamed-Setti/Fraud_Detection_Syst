import type { NextApiRequest, NextApiResponse } from "next";
import { Server as IOServer, Socket as IOSocket } from "socket.io";
import { Server as NetServer } from "http";

/**
 * Types d'événements (server <-> client)
 * - ServerToClientEvents: événements envoyés par le serveur au client
 * - ClientToServerEvents: événements envoyés par le client au serveur
 */
type ServerToClientEvents = {
  notification: (data: { title: string; message: string; timestamp: number }) => void;
};

type ClientToServerEvents = {
  join: (room: string) => void;
  // ajoute d'autres événements éventuels ici
};

// Typage pour res afin d'accéder à res.socket.server.io sans "any"
type NextApiResponseWithIO = NextApiResponse & {
  socket: {
    server: NetServer & {
      io?: IOServer<ClientToServerEvents, ServerToClientEvents>;
    };
  };
};

export default function handler(req: NextApiRequest, res: NextApiResponseWithIO) {
  if (!res.socket.server.io) {
    console.log("-> Initializing Socket.IO");

    // Attacher le server HTTP de Next à Socket.IO avec les types d'événements
    const io = new IOServer<ClientToServerEvents, ServerToClientEvents>(
      (res.socket.server as unknown) as NetServer,
      {
        path: "/api/socketio",
        cors: {
          origin: "*",
          methods: ["GET", "POST"],
        },
      }
    );

    // Stocker l'instance typée
    res.socket.server.io = io;

    io.on("connection", (socket: IOSocket<ClientToServerEvents, ServerToClientEvents>) => {
      console.log("Socket connected:", socket.id);

      socket.on("join", (room: string) => {
        if (room) socket.join(room);
      });

      socket.on("disconnect", () => {
        console.log("Socket disconnected:", socket.id);
      });
    });
  } else {
    // Socket.IO already initialized
  }

  res.end();
}