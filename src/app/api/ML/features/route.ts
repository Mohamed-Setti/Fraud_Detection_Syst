import type { NextRequest } from "next/server";

const BACKEND_URL = process.env.FRAUD_API_URL_SERVER || "http://127.0.0.1:8000";

export async function GET(_req: NextRequest) {
  const url = `${BACKEND_URL}/features`;
  try {
    const r = await fetch(url, { method: "GET" });
    const headers = new Headers({ "content-type": "application/json" });
    const body = await r.text();
    return new Response(body, { status: r.status, headers });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: String(e?.message ?? e) }), {
      status: 500,
      headers: { "content-type": "application/json" },
    });
  }
}