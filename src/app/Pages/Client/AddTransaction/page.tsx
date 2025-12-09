"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useNotifications } from "@/app/component/useNotifications";

type TxType = "CASH_IN" | "CASH_OUT" | "PAYMENT" | "TRANSFER" | "DEBIT" | "OTHER";
type Channel = "ONLINE" | "BRANCH" | "ATM" | "POS" | "MOBILE";

function ClientDate({ isoDate }: { isoDate: string }) {
  if (!isoDate) return <span>-</span>;
  return <span>{new Date(isoDate).toLocaleString()}</span>;
}

// Helpers
async function fetchDestinationByName(
  name: string,
  token?: string | null
): Promise<{ _id: string; soldeActuel: number } | null> {
  try {
    if (!name.trim()) return null;
    const res = await fetch(`/api/Compte?name=${encodeURIComponent(name)}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
    if (!res.ok) return null;
    const compte = await res.json(); // { _id, soldeActuel, ... }
    const solde = Number(compte?.soldeActuel);
    if (Number.isNaN(solde)) return null;
    return { _id: compte._id, soldeActuel: solde };
  } catch {
    return null;
  }
}

export async function fetchDestinationOwnerName(id: string): Promise<{ name: string } | null> {
  try {
    if (!id || !id.trim()) return null;

    const res = await fetch(`/api/users?id=${encodeURIComponent(id)}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    if (!res.ok) return null;

    const data = await res.json().catch(() => null);
    if (!data) return null;

    if (typeof data.name === "string") {
      return { name: data.name };
    }
    return null;
  } catch {
    return null;
  }
}

// Parse ML prediction into a uniform shape (robust to multiple backend shapes)
function parsePrediction(pred: any): { isFraud: boolean; score: number | null; raw: any } {
  try {
    // predicted class index
    let predIdx: number | null = null;
    if (typeof pred?.prediction === "number") {
      predIdx = pred.prediction;
    } else if (Array.isArray(pred?.predictions)) {
      const v = pred.predictions[0];
      const n = typeof v === "number" ? v : Number(v);
      predIdx = Number.isNaN(n) ? null : n;
    }

    // score: probability for the predicted class
    let score: number | null = null;
    if (Array.isArray(pred?.proba)) {
      const first = pred.proba[0];
      if (Array.isArray(first) && predIdx != null && first[predIdx] != null) {
        score = Number(first[predIdx]);
      } else if (typeof first === "number") {
        score = first;
      }
    } else if (typeof pred?.probability === "number") {
      score = pred.probability;
    } else if (typeof pred?.score === "number") {
      score = pred.score;
    }

    // label resolution
    let label: any = predIdx;
    if (Array.isArray(pred?.class_labels) && predIdx != null) {
      label = pred.class_labels[predIdx];
    } else if (typeof pred?.label === "string") {
      label = pred.label;
    }

    // isFraud determined ONLY by predicted class/label
    const labelStr = String(label).toLowerCase();
    const isFraud =
      predIdx === 1 ||
      labelStr === "1" ||
      labelStr.includes("fraud");

    return { isFraud, score, raw: pred };
  } catch {
    return { isFraud: false, score: null, raw: pred };
  }
}

export default function AddTransactionPage() {
  const router = useRouter();
  const { addNotification } = useNotifications();

  // Form state
  const [amount, setAmount] = useState<number | "">("");
  const [type, setType] = useState<TxType>("OTHER");
  const [channel, setChannel] = useState<Channel>("ONLINE");
  const [date, setDate] = useState<string>(new Date().toISOString().slice(0, 16));
  const [description, setDescription] = useState("");

  // Balances (source)
  const [sourceSolde, setSourceSolde] = useState<number | null>(null); // show at top
  const [sourceError, setSourceError] = useState<string | null>(null);
  const [oldBalanceSource, setOldBalanceSource] = useState<number | null>(null);
  const [newBalanceSource, setNewBalanceSource] = useState<number | null>(null);

  // Destination
  const [compteDestinationName, setCompteDestinationName] = useState("");
  const [compteDestinationId, setCompteDestinationId] = useState<string | undefined>(undefined);
  const [oldBalanceDest, setOldBalanceDest] = useState<number | null>(null);
  const [newBalanceDest, setNewBalanceDest] = useState<number | null>(null);

  // Loading states
  const [loading, setLoading] = useState(false);
  const [resolvingDest, setResolvingDest] = useState(false);
  const [mlReviewing, setMlReviewing] = useState(false);

  // ML decision state
  const [mlDecision, setMlDecision] = useState<"safe" | "fraud" | null>(null);
  const [mlScore, setMlScore] = useState<number | null>(null);
  const [mlRaw, setMlRaw] = useState<any>(null); // store full ML response

  // Load source account solde from localStorage on mount
  useEffect(() => {
    setSourceError(null);
    const account = JSON.parse(localStorage.getItem("account") || "{}");
    const solde = Number(account?.soldeActuel);
    if (!Number.isNaN(solde)) {
      setSourceSolde(solde);
      setOldBalanceSource(solde);
      if (amount !== "") {
        setNewBalanceSource(solde - Number(amount));
      }
    } else {
      setSourceError("Solde du compte source introuvable.");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Recompute balances when amount changes
  useEffect(() => {
    const amt = amount === "" ? 0 : Number(amount);
    if (oldBalanceSource !== null) {
      setNewBalanceSource(oldBalanceSource - amt);
    }
    if (oldBalanceDest !== null) {
      setNewBalanceDest(oldBalanceDest + amt);
    }
  }, [amount, oldBalanceSource, oldBalanceDest]);

  function validate() {
    if (amount === "" || Number.isNaN(Number(amount))) {
      alert("Please enter a valid amount");
      return false;
    }
    if (!date) {
      alert("Please select a date");
      return false;
    }
    if (!compteDestinationName.trim()) {
      alert("Please enter a destination account name");
      return false;
    }
    return true;
  }

  // Resolve destination by name and compute balances
  // Keep this module-level ref to guard against stale responses
let lastDestQuery = "";

async function resolveDestinationByName(name: string) {
  const q = (name || "").trim();
  lastDestQuery = q;

  setResolvingDest(true);
  setCompteDestinationId(undefined);
  setOldBalanceDest(null);
  setNewBalanceDest(null);
  // Do not immediately clear the displayed name; keep user input visible
  // Only update the resolved owner name after successful lookup
  // setCompteDestinationName("");

  try {
    if (!q) {
      // Empty query: nothing to resolve
      return;
    }

    const token = localStorage.getItem("token");
    const dest = await fetchDestinationByName(q, token);

    // If user typed a different name while we were awaiting, ignore this result
    if (q !== lastDestQuery) {
      return;
    }

    if (!dest) {
      // No account found; show the raw input name (user’s entry)
      setCompteDestinationName(q);
      setCompteDestinationId(undefined);
      setOldBalanceDest(null);
      setNewBalanceDest(null);
      return;
    }

    // Update destination info
    setCompteDestinationId(dest._id);
    setOldBalanceDest(dest.soldeActuel);

    const amt = amount === "" ? 0 : Number(amount);
    setNewBalanceDest(dest.soldeActuel + amt);

    // Resolve owner name; if it fails, fallback to the raw query
    try {
      const owner = await fetchDestinationOwnerName(dest._id);
      // Still the same query?
      if (q === lastDestQuery) {
        setCompteDestinationName(owner?.name || q);
      }
    } catch {
      if (q === lastDestQuery) {
        setCompteDestinationName(q);
      }
    }
  } finally {
    // Only end resolving for the latest query
    if (q === lastDestQuery) {
      setResolvingDest(false);
    }
  }
}

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setMlDecision(null);
    setMlScore(null);
    setMlRaw(null);

    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const account = JSON.parse(localStorage.getItem("account") || "{}");
      const token = localStorage.getItem("token");
      const amt = Number(amount);

      // Source from localStorage
      const srcId = account?.id;
      const srcSolde = Number(account?.soldeActuel);
      if (!srcId || Number.isNaN(srcSolde)) {
        throw new Error("Source account not available in localStorage");
      }
      const computedNewSource = srcSolde - amt;
      setOldBalanceSource(srcSolde);
      setNewBalanceSource(computedNewSource);

      // Destination by name (must exist)
      const dest = await fetchDestinationByName(compteDestinationName, token);
      if (!dest) throw new Error("Destination account not found");
      setCompteDestinationId(dest._id);
      setOldBalanceDest(dest.soldeActuel);
      const computedNewDest = dest.soldeActuel + amt;
      setNewBalanceDest(computedNewDest);

      // Build payload for saving
      const payload = {
        date: new Date(date).toISOString(),
        montant: amt,
        userId: user.id,
        type: type.toUpperCase(),
        channel: channel.toUpperCase(),
        description: description || undefined,

        // Backend identifiers
        compteSourceId: srcId,
        compteDestinationId: dest._id,

        // Requested computed fields
        oldBalanceSource: srcSolde,
        newBalanceSource: computedNewSource,
        oldBalanceDest: dest.soldeActuel,
        newBalanceDest: computedNewDest,
      };

      // ML Review: build model features row
      const mlRow = {
        type: payload.type,                // categorical
        step: 1,                           // or derive from time; using 1 for now
        amount: payload.montant,           // numeric
        oldbalanceOrg: payload.oldBalanceSource,
        newbalanceOrig: payload.newBalanceSource,
        oldbalanceDest: payload.oldBalanceDest,
        newbalanceDest: payload.newBalanceDest,
      };

      // Call ML prediction
      setMlReviewing(true);
      try {
        const form = new FormData();
        form.append("json_rows", JSON.stringify([mlRow]));
        const resp = await fetch("/api/ML/proxyPredict", { method: "POST", body: form });
        if (!resp.ok) {
          const text = await resp.text().catch(() => "");
          throw new Error(text || `ML review failed (HTTP ${resp.status})`);
        }
        const prediction = await resp.json();

        // keep full raw ML response
        setMlRaw(prediction);

        const { isFraud, score } = parsePrediction(prediction);
        setMlDecision(isFraud ? "fraud" : "safe");
        setMlScore(score ?? null);

        // Decision policy
        const s = score ?? 0;
        const payloadWithMl = {
          ...payload,
          mlReview: { decision: isFraud ? "fraud" : "safe", score: score ?? null, raw: prediction },
        };

        // Who to email/notify
        const userEmail = "medsetti@live.fr"; //user?.email || user?.mail || ""; // adapt to your user schema
        const analystEmail = "analyst@example.com";        // replace with your analyst address or env

        if (isFraud) {
          if (s >= 0.650) {
            // High-confidence fraud: block and notify user (and analyst)
            await sendFraudAlertToUser(userEmail, payloadWithMl, s, prediction);
            await notifyAnalyst(analystEmail, payloadWithMl, s, prediction);
            alert("Transaction blocked: high-confidence fraud detected.");
            return;
          } else if (s > 0.50) {
            // Suspicious fraud: notify analyst and caution user; require manual confirmation path
            await notifyAnalyst(analystEmail, payloadWithMl, s, prediction);
            await sendSuspiciousToUser(userEmail, payloadWithMl, s, prediction);
            alert("Suspicious transaction flagged. Analyst notified. User cautioned.");
            return;
          } else {
            // Low-confidence fraud: request user confirmation and notify analyst
            await sendUserConfirmationEmail(userEmail, payloadWithMl, s, prediction);
            await notifyAnalyst(analystEmail, payloadWithMl, s, prediction);
            alert("User confirmation required; analyst notified.");
            return;
          }
        } else {
          // Not fraud
          if (s >= 0.80) {
            // Auto-validate and save
            const res = await fetch("/api/Client/Transaction", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
              },
              body: JSON.stringify(payloadWithMl),
            });
            if (!res.ok) {
              const err = await res.json().catch(() => null);
              throw new Error(err?.error || `HTTP ${res.status}`);
            }
            addNotification({
              title: "Nouvelle transaction",
              message: `${payload.type} • ${amt.toFixed(2)}${payload.compteDestinationId ? " → " + payload.compteDestinationId : ""}`,
              timestamp: Date.now(),
            });
            alert("Transaction added successfully");
            //router.push("./Transaction");
            return;
          } else if (s > 0.50) {
            // User confirmation required; also notify analyst
            await sendUserConfirmationEmail(userEmail, payloadWithMl, s, prediction);
            await notifyAnalyst(analystEmail, payloadWithMl, s, prediction);
            alert("Awaiting user confirmation; analyst notified.");
            return;
          } else {
            // User confirmation required; optional analyst notification
            await sendUserConfirmationEmail(userEmail, payloadWithMl, s, prediction);
            alert("Awaiting user confirmation.");
            return;
          }
        }
      } finally {
        setMlReviewing(false);
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Unknown error";
      alert("Error creating transaction: " + message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <main className="flex-1 p-8">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold text-blue-900">Add Transaction</h2>
            <Link href="./Transaction">
              <button className="px-4 py-2 bg-blue-700 text-white rounded hover:bg-blue-600 flex items-center">
                <ArrowLeft className="mr-2 h-5 w-5" /> Back to list
              </button>
            </Link>
          </div>

          {/* Top bar: current source soldeActuel */}
          <div className="mb-4 p-4 rounded-lg bg-white shadow">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Solde actuel (source)</span>
              <span className="text-lg font-semibold text-blue-900">
                {sourceSolde === null
                  ? "—"
                  : `${sourceSolde.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} EUR`}
              </span>
            </div>
            {sourceError ? (
              <p className="mt-2 text-xs text-red-600">{sourceError}</p>
            ) : null}
          </div>

          <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="flex flex-col">
                <span className="text-sm text-gray-600">Amount</span>
                <input
                  type="number"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value === "" ? "" : Number(e.target.value))}
                  className="mt-1 p-2 border rounded text-gray-900"
                  placeholder="e.g. 1250.00"
                  required
                />
              </label>

              <label className="flex flex-col">
                <span className="text-sm text-gray-600">Date & time</span>
                <input
                  type="datetime-local"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="mt-1 p-2 border rounded text-gray-900"
                  required
                />
              </label>

              {/* Destination account by name */}
              <label className="flex flex-col md:col-span-2">
                <span className="text-sm text-gray-600">Nom du compte Destination</span>
                <input
                  value={compteDestinationName}
                  onChange={async (e) => {
                    const name = e.target.value;
                    setCompteDestinationName(name);
                    await resolveDestinationByName(name);
                  }}
                  className="mt-1 p-2 border rounded text-gray-900"
                  placeholder="e.g. ACC...."
                />
                <span className="text-xs text-gray-500 mt-1">
                  {resolvingDest
                    ? "Resolving..."
                    : compteDestinationId
                    ? `ID: ${compteDestinationId} • Solde: ${
                        oldBalanceDest !== null
                          ? `${oldBalanceDest.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} EUR`
                          : "—"
                      }`
                    : compteDestinationName
                    ? "No account found"
                    : ""}
                </span>
              </label>

              <label className="flex flex-col">
                <span className="text-sm text-gray-600">Type</span>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as TxType)}
                  className="mt-1 p-2 border rounded text-gray-900"
                >
                  <option value="CASH_IN">Deposit</option>
                  <option value="CASH_OUT">Withdrawal</option>
                  <option value="TRANSFER">Transfer</option>
                  <option value="PAYMENT">Payment</option>
                  <option value="DEBIT">Debit</option>
                  <option value="OTHER">Other</option>
                </select>
              </label>

              <label className="flex flex-col">
                <span className="text-sm text-gray-600">Channel</span>
                <select
                  value={channel}
                  onChange={(e) => setChannel(e.target.value.toUpperCase() as Channel)}
                  className="mt-1 p-2 border rounded text-gray-900"
                >
                  <option value="ONLINE">Online</option>
                  <option value="BRANCH">Branch</option>
                  <option value="ATM">ATM</option>
                  <option value="POS">POS</option>
                  <option value="MOBILE">Mobile</option>
                </select>
              </label>
            </div>

            {/* Description */}
            <label className="flex flex-col">
              <span className="text-sm text-gray-600">Description</span>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="mt-1 p-2 border rounded text-gray-900"
                rows={3}
                placeholder="Optional note about the transaction"
              />
            </label>

            {/* Computed balances preview + ML review */}
            {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3 rounded bg-gray-50 border">
                <p className="text-sm text-gray-600">Source balance</p>
                <p className="text-gray-800">
                  Old:{" "}
                  {oldBalanceSource === null
                    ? "—"
                    : `${oldBalanceSource.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} EUR`}
                </p>
                <p className="text-gray-800">
                  New:{" "}
                  {newBalanceSource === null
                    ? "—"
                    : `${newBalanceSource.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} EUR`}
                </p>
              </div>
              <div className="p-3 rounded bg-gray-50 border">
                <p className="text-sm text-gray-600">Destination balance</p>
                <p className="text-gray-800">
                  Old:{" "}
                  {oldBalanceDest === null
                    ? "—"
                    : `${oldBalanceDest.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} EUR`}
                </p>
                <p className="text-gray-800">
                  New:{" "}
                  {newBalanceDest === null
                    ? "—"
                    : `${newBalanceDest.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} EUR`}
                </p>
              </div>
            </div> */}

            {/* ML Review status */}
            <div className="p-3 rounded bg-white border">
              <p className="text-sm text-gray-600">ML Review</p>
              <p className={`text-sm ${mlDecision === "fraud" ? "text-red-600" : "text-gray-800"}`}>
                {mlReviewing
                  ? "Reviewing..."
                  : mlDecision
                  ? `${mlDecision}${mlScore != null ? ` (score: ${mlScore.toFixed(2)})` : ""}`
                  : "-"}
              </p>
            </div>
              {/* Show full raw ML response */}
              {/* {mlRaw && (
                <div className="mt-3">
                  <p className="text-xs text-gray-500">Raw ML response</p>
                  <pre className="mt-1 text-xs text-black bg-gray-50 border rounded p-2 overflow-auto max-h-64">
                    {JSON.stringify(mlRaw, null, 2)}
                  </pre>
                </div>
              )}
            </div> */}

            {/* Save + Cancel */}
            <div className="flex items-center gap-3 mt-4">
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-blue-700 text-white rounded hover:bg-blue-600 disabled:opacity-60"
              >
                {loading ? "Saving..." : "Save Transaction"}
              </button>

              <button
                type="button"
                onClick={() => router.push("./Transaction")}
                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>

            {/* PREVIEW */}
            {/* <div className="mt-6 p-4 bg-gray-50 rounded border">
              <h4 className="font-semibold text-gray-800 mb-2">Preview</h4>
              <div className="text-gray-700">
                <p>
                  <span className="font-medium">Amount:</span>{" "}
                  {amount === ""
                    ? "-"
                    : `${Number(amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} EUR`}
                </p>
                <p><span className="font-medium">Type:</span> {type}</p>
                <p><span className="font-medium">Channel:</span> {channel}</p>
                <p><span className="font-medium">Date:</span> <ClientDate isoDate={date} /></p>
                <p><span className="font-medium">Description:</span> {description || "-"}</p>
                <p>
                  <span className="font-medium">Source Old → New:</span>{" "}
                  {oldBalanceSource === null || newBalanceSource === null
                    ? "-"
                    : `${oldBalanceSource.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} EUR → ${newBalanceSource.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} EUR`}
                </p>
                <p>
                  <span className="font-medium">Dest Old → New:</span>{" "}
                  {oldBalanceDest === null || newBalanceDest === null
                    ? "-"
                    : `${oldBalanceDest.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} EUR → ${newBalanceDest.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} EUR`}
                </p>
                <p>
                  <span className="font-medium">ML Review:</span>{" "}
                  {mlReviewing
                    ? "Reviewing..."
                    : mlDecision
                    ? `${mlDecision}${mlScore != null ? ` (score: ${mlScore.toFixed(2)})` : ""}`
                    : "-"}
                </p>
              </div> 
            </div>*/}
          </form>
        </div>
      </main>
    </div>
  );
}

/**
 * Email/notification helpers.
 * These call your /api/emailsend endpoint with text and html bodies.
 */
async function sendUserConfirmationEmail(userEmail: string, payloadWithMl: any, score: number, raw: any) {
  if (!userEmail) return;

  const confirmToken = cryptoRandomToken(); // Replace with backend-issued token for production
  const origin =
    typeof window !== "undefined" && window.location?.origin
      ? window.location.origin
      : process.env.NEXT_PUBLIC_APP_ORIGIN || "http://localhost:3000";

  const confirmLink = `${origin}/api/Client/Transaction/confirm?user=${encodeURIComponent(
    payloadWithMl.userId
  )}&dest=${encodeURIComponent(payloadWithMl.compteDestinationId)}&amount=${encodeURIComponent(
    payloadWithMl.montant
  )}&token=${encodeURIComponent(confirmToken)}`;

  const subject = "Confirm your transaction";
  const text = [
    `A transaction requires your confirmation.`,
    `Amount: ${payloadWithMl.montant}`,
    `Type: ${payloadWithMl.type}`,
    `Destination: ${payloadWithMl.compteDestinationId}`,
    `ML score: ${score}`,
    `Confirm: ${confirmLink}`,
  ].join("\n");

  const html = `
    <div>
      <p>A transaction requires your confirmation.</p>
      <ul>
        <li><strong>Amount:</strong> ${payloadWithMl.montant}</li>
        <li><strong>Type:</strong> ${payloadWithMl.type}</li>
        <li><strong>Destination:</strong> ${payloadWithMl.compteDestinationId}</li>
        <li><strong>Fraud score:</strong> ${Number(score).toFixed(2)}</li>
      </ul>
      <p><a href="${confirmLink}">Confirm this transaction</a></p>
    </div>
  `;

  await fetch("/api/EmailSend", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ to: userEmail, subject, text, html }),
  }).catch(() => {});
}

async function sendFraudAlertToUser(userEmail: string, payloadWithMl: any, score: number, raw: any) {
  if (!userEmail) return;

  const subject = "Fraud alert: transaction blocked";
  const text = [
    `A transaction was blocked due to high-confidence fraud detection.`,
    `Amount: ${payloadWithMl.montant}`,
    `Type: ${payloadWithMl.type}`,
    `Destination: ${payloadWithMl.compteDestinationId}`,
    `ML score: ${score}`,
  ].join("\n");

  const html = `
    <div>
      <p>A transaction was <strong>blocked</strong> due to high-confidence fraud detection.</p>
      <ul>
        <li><strong>Amount:</strong> ${payloadWithMl.montant}</li>
        <li><strong>Type:</strong> ${payloadWithMl.type}</li>
        <li><strong>Destination:</strong> ${payloadWithMl.compteDestinationId}</li>
        <li><strong>Fraud score:</strong> ${Number(score).toFixed(2)}</li>
      </ul>
    </div>
  `;

  await fetch("/api/EmailSend", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ to: userEmail, subject, text, html }),
  }).catch(() => {});
}

async function sendSuspiciousToUser(userEmail: string, payloadWithMl: any, score: number, raw: any) {
  if (!userEmail) return;

  const subject = "Suspicious transaction detected";
  const text = [
    `A transaction was flagged as suspicious.`,
    `Amount: ${payloadWithMl.montant}`,
    `Type: ${payloadWithMl.type}`,
    `Destination: ${payloadWithMl.compteDestinationId}`,
    `ML score: ${score}`,
    `We have notified our analyst for review.`,
  ].join("\n");

  const html = `
    <div>
      <p>A transaction was flagged as <strong>suspicious</strong>.</p>
      <ul>
        <li><strong>Amount:</strong> ${payloadWithMl.montant}</li>
        <li><strong>Type:</strong> ${payloadWithMl.type}</li>
        <li><strong>Destination:</strong> ${payloadWithMl.compteDestinationId}</li>
        <li><strong>ML score:</strong> ${Number(score).toFixed(2)}</li>
      </ul>
      <p>We have notified our analyst for review.</p>
      <details style="margin-top:8px;">
        <summary>Raw ML response</summary>
        <pre>${escapeHtml(JSON.stringify(raw, null, 2))}</pre>
      </details>
    </div>
  `;

  await fetch("/api/EmailSend", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ to: userEmail, subject, text, html }),
  }).catch(() => {});
}

async function notifyAnalyst(analystEmail: string, payloadWithMl: any, score: number, raw: any) {
  if (!analystEmail) return;

  const subject = "Transaction requires analyst review";
  const text = [
    `A transaction requires review.`,
    `User: ${payloadWithMl.userId}`,
    `Amount: ${payloadWithMl.montant}`,
    `Type: ${payloadWithMl.type}`,
    `Destination: ${payloadWithMl.compteDestinationId}`,
    `ML score: ${score}`,
  ].join("\n");

  const html = `
    <div>
      <p>A transaction requires analyst review.</p>
      <ul>
        <li><strong>User:</strong> ${payloadWithMl.userId}</li>
        <li><strong>Amount:</strong> ${payloadWithMl.montant}</li>
        <li><strong>Type:</strong> ${payloadWithMl.type}</li>
        <li><strong>Destination:</strong> ${payloadWithMl.compteDestinationId}</li>
        <li><strong>ML score:</strong> ${Number(score).toFixed(2)}</li>
      </ul>
      <details style="margin-top:8px;">
        <summary>Raw ML response</summary>
        <pre>${escapeHtml(JSON.stringify(raw, null, 2))}</pre>
      </details>
    </div>
  `;

  await fetch("/api/EmailSend", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ to: analystEmail, subject, text, html }),
  }).catch(() => {});
}

/**
 * Utilities (local)
 */
function cryptoRandomToken(len = 32) {
  // Basic token generator; replace with a proper backend-issued token for production
  const bytes = new Uint8Array(len);
  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    crypto.getRandomValues(bytes);
  } else {
    for (let i = 0; i < len; i++) bytes[i] = Math.floor(Math.random() * 256);
  }
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}