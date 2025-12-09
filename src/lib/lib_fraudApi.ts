const BASE_URL_CLIENT =
  process.env.NEXT_PUBLIC_FRAUD_API_URL || "http://localhost:8000";
const BASE_URL_SERVER =
  process.env.FRAUD_API_URL_SERVER || BASE_URL_CLIENT;

/**
 * Simple health check
 * Use in client: await healthCheck()
 * Use in server: await healthCheck(true)
 */
export async function healthCheck(isServer = false) {
  const base = isServer ? BASE_URL_SERVER : BASE_URL_CLIENT;
  const res = await fetch(`${base}/health`, { method: "GET" });
  if (!res.ok) {
    throw new Error(await res.text());
  }
  return res.json();
}

/**
 * Predict with CSV file upload
 * file can be a browser File (client) or a Blob/Buffer (server)
 */
export async function predictWithCsv(
  file: File | Blob,
  isServer = false
) {
  const base = isServer ? BASE_URL_SERVER : BASE_URL_CLIENT;
  const form = new FormData();
  form.append("file", file);
  const res = await fetch(`${base}/predict`, {
    method: "POST",
    body: form,
  });
  if (!res.ok) {
    throw new Error(await res.text());
  }
  return res.json();
}

/**
 * Predict with JSON rows
 * rows: array of objects whose keys match your model's expected features
 */
export async function predictWithRows(
  rows: Array<Record<string, any>>,
  isServer = false
) {
  const base = isServer ? BASE_URL_SERVER : BASE_URL_CLIENT;
  const form = new FormData();
  form.append("json_rows", JSON.stringify(rows));
  const res = await fetch(`${base}/predict`, {
    method: "POST",
    body: form,
  });
  if (!res.ok) {
    throw new Error(await res.text());
  }
  return res.json();
}