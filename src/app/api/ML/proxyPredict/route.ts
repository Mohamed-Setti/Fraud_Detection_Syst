import type { NextRequest } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL || "http://127.0.0.1:8000";

function sanitizeRequestHeaders(headers: Headers) {
  const out: Record<string, string> = {};
  headers.forEach((value, key) => {
    const k = key.toLowerCase();
    if ([
      "host","connection","keep-alive","proxy-authenticate","proxy-authorization",
      "te","trailer","transfer-encoding","upgrade",
    ].includes(k)) return;
    out[k] = value;
  });
  return out;
}

export async function POST(req: NextRequest) {
  const url = `${BACKEND_URL}/predict`;

  try {
    const buf = await req.arrayBuffer();
    const forwardHeaders = sanitizeRequestHeaders(req.headers);

    // Preserve incoming content-type (needed for multipart/form-data boundaries)
    const ct = req.headers.get("content-type");
    if (ct) forwardHeaders["content-type"] = ct;

    const backendResp = await fetch(url, {
      method: "POST",
      headers: forwardHeaders,
      body: buf ? new Uint8Array(buf) : undefined,
    });

    const resHeaders = new Headers();
    backendResp.headers.forEach((value, name) => {
      const n = name.toLowerCase();
      if ([
        "transfer-encoding","connection","keep-alive","proxy-authenticate",
        "proxy-authorization","te","trailer","upgrade",
      ].includes(n)) return;
      resHeaders.set(name, value);
    });

    const body = await backendResp.arrayBuffer();
    return new Response(body, { status: backendResp.status, headers: resHeaders });
  } catch (err: any) {
    console.error("proxyPredict error:", err);
    return new Response(JSON.stringify({ error: String(err?.message ?? err) }), {
      status: 500,
      headers: { "content-type": "application/json" },
    });
  }
}

// Optional: guard unsupported methods to avoid 405 confusion
export async function GET() {
  return new Response(JSON.stringify({ error: "Method Not Allowed" }), {
    status: 405,
    headers: { "content-type": "application/json" },
  });
}