"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useNotifications } from "@/app/component/useNotifications";    


// Match backend enums
type TxType = "CASH_IN" | "CASH_OUT" | "PAYMENT" | "TRANSFER" | "DEBIT" | "OTHER";
type Channel = "ONLINE" | "BRANCH" | "ATM" | "POS" | "MOBILE";

// Client date display
function ClientDate({ isoDate }: { isoDate: string }) {
  if (!isoDate) return <span>-</span>;
  return <span>{new Date(isoDate).toLocaleString()}</span>;
}

export default function AddTransactionPage() {
  const router = useRouter();
  const { addNotification } = useNotifications();

  const [amount, setAmount] = useState<number | "">("");
  const [type, setType] = useState<TxType>("OTHER");
  const [channel, setChannel] = useState<Channel>("ONLINE");
  const [date, setDate] = useState<string>(new Date().toISOString().slice(0, 16));
  const [description, setDescription] = useState("");
  const [balanceAfter, setBalanceAfter] = useState<number | "">("");

  const [compteSource, setCompteSource] = useState("");
  const [compteDestination, setCompteDestination] = useState("");

  const [loading, setLoading] = useState(false);

  // Validate inputs
  function validate() {
    if (amount === "" || Number.isNaN(Number(amount))) {
      alert("Please enter a valid amount");
      return false;
    }
    if (!date) {
      alert("Please select a date");
      return false;
    }
    return true;
  }

  // Submit
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);

    // Get stored user
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const account = JSON.parse(localStorage.getItem("account") || "{}");

    const payload = {
      date: new Date(date).toISOString(),
      montant: Number(amount),
      userId: user.id,                       // ✔ backend required field
      type: type.toUpperCase(),              // ✔ ensure enum format
      channel: channel.toUpperCase(),        // ✔ ensure enum format
      description: description || undefined,

      compteSourceId: account?.id || undefined,           // ✔ backend expected
      compteDestinationId: compteDestination || undefined // (optional)
    };

    try {
      const token = localStorage.getItem("token");

      const res = await fetch("/api/Client/Transaction", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => null);
        throw new Error(err?.error || `HTTP ${res.status}`);
      }
      addNotification({
        title: "Nouvelle transaction",
        message: `${payload.type} • ${Number(payload.montant).toFixed(2)} ${payload.compteDestinationId ? "→ " + payload.compteDestinationId : ""}`,
        timestamp: Date.now(),
      });
      alert("Transaction added successfully");
      router.push("./Transaction");

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

          <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow space-y-4">

            {/* Amount / Date / Type / Channel */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              <label className="flex flex-col">
                <span className="text-sm text-gray-600">Amount</span>
                <input
                  type="number"
                  step="0.01"
                  value={amount}
                  onChange={(e) =>
                    setAmount(e.target.value === "" ? "" : Number(e.target.value))
                  }
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

            {/* Balance After */}
            <label className="flex flex-col md:w-1/2">
              <span className="text-sm text-gray-600">Balance After (optional)</span>
              <input
                type="number"
                step="0.01"
                value={balanceAfter}
                onChange={(e) =>
                  setBalanceAfter(e.target.value === "" ? "" : Number(e.target.value))
                }
                className="mt-1 p-2 border rounded text-gray-900"
                placeholder="e.g. 5000.00"
              />
            </label>

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
            <div className="mt-6 p-4 bg-gray-50 rounded border">
              <h4 className="font-semibold text-gray-800 mb-2">Preview</h4>
              <div className="text-gray-700">
                <p><span className="font-medium">Amount:</span> {amount === "" ? "-" : `$${Number(amount).toFixed(2)}`}</p>
                <p><span className="font-medium">Type:</span> {type}</p>
                <p><span className="font-medium">Channel:</span> {channel}</p>
                <p><span className="font-medium">Date:</span> <ClientDate isoDate={date} /></p>
                <p><span className="font-medium">Description:</span> {description || "-"}</p>
                <p><span className="font-medium">Balance After:</span> {balanceAfter === "" ? "-" : `$${Number(balanceAfter).toFixed(2)}`}</p>
              </div>
            </div>

          </form>
        </div>
      </main>
    </div>
  );
}
