import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import Pusher from "pusher";

const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.PUSHER_KEY!,
  secret: process.env.PUSHER_SECRET!,
  cluster: process.env.PUSHER_CLUSTER!,
  useTLS: true,
});

type NotifyBody = {
  title?: string;
  message?: string;
  room?: string; // channel name
};

export async function POST(req: NextRequest) {
  const { title = "Notification", message = "Nouveau message", room } =
    (await req.json().catch(() => ({}))) as NotifyBody;

  const channel = room || "global";
  const payload = { title, message, timestamp: Date.now() };

  await pusher.trigger(channel, "notification", payload);

  return NextResponse.json({ ok: true, sent: { channel, ...payload } });
}

export async function GET() {
  return NextResponse.json({ status: "ok" });
}