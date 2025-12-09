import type { NextRequest } from "next/server";

export const runtime = "nodejs";

const BACKEND_URL = process.env.FRAUD_API_URL_SERVER || "http://127.0.0.1:8000";

function sanitizeRequestHeaders(headers: Headers) {
  const out: Record<string, string> = {};
  headers.forEach((value, key) => {
    const k = key.toLowerCase();
    // Remove hop-by-hop headers
    if (
      [
        "host",
        "connection",
        "keep-alive",
        "proxy-authenticate",
        "proxy-authorization",
        "te",
        "trailer",
        "transfer-encoding",
        "upgrade",
      ].includes(k)
    )
      return;
    out[k] = value;
  });
  return out;
}

export async function POST(req: NextRequest) {
  const url = `${BACKEND_URL}/predict`;

  try {
    // Read raw request to preserve multipart boundaries and any custom formatting
    const buf = await req.arrayBuffer();
    const forwardHeaders = sanitizeRequestHeaders(req.headers);

    // Preserve incoming content-type (needed for multipart/form-data boundaries)
    const ct = req.headers.get("content-type");
    if (ct) forwardHeaders["content-type"] = ct;

    // Optional: simple timeout controller
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 60_000); // 60s

    const backendResp = await fetch(url, {
      method: "POST",
      headers: forwardHeaders,
      body: buf ? new Uint8Array(buf) : undefined,
      signal: controller.signal,
    }).finally(() => clearTimeout(timeout));

    // Pass through headers except hop-by-hop
    const resHeaders = new Headers();
    backendResp.headers.forEach((value, name) => {
      const n = name.toLowerCase();
      if (
        [
          "transfer-encoding",
          "connection",
          "keep-alive",
          "proxy-authenticate",
          "proxy-authorization",
          "te",
          "trailer",
          "upgrade",
        ].includes(n)
      )
        return;
      resHeaders.set(name, value);
    });

    const body = await backendResp.arrayBuffer();
    return new Response(body, { status: backendResp.status, headers: resHeaders });
  } catch (err: any) {
    console.error("proxyPredict error:", err);
    const message = err?.name === "AbortError" ? "Upstream timeout" : String(err?.message ?? err);
    return new Response(JSON.stringify({ error: message }), {
      status: 502, // Bad Gateway for upstream issues
      headers: { "content-type": "application/json" },
    });
  }
}

// Optional: expose health via your API domain
export async function GET() {
  const url = `${BACKEND_URL}/health`;
  try {
    const r = await fetch(url, { method: "GET" });
    const json = await r.json();
    return new Response(JSON.stringify(json), {
      status: r.status,
      headers: { "content-type": "application/json" },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ status: "down", error: String(err?.message ?? err) }), {
      status: 503,
      headers: { "content-type": "application/json" },
    });
  }
}