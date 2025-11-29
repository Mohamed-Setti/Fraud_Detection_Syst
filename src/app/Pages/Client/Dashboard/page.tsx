'use client';

import React, { useEffect, useState } from "react";
import StatCard from "../../../component/StatCard";
import LineChart from "@/app/component/linechart";

type SummaryItem = { title: string; value: string; color?: string };
type Txn = any;
type ChartPoint = { label: string; value: number };

export default function ClientDashboard() {
  const [summary, setSummary] = useState<SummaryItem[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<Txn[]>([]);
  const [sample, setSample] = useState<ChartPoint[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Load all dashboard data in parallel
  async function loadDashboard() {
    setLoading(true);
    setError(null);

    try {
      // read user / token from localStorage (same pattern as your TransactionsPageClient)
      const rawUser = localStorage.getItem("user");
      const parsedUser = rawUser ? JSON.parse(rawUser) : null;
      const userId = parsedUser?.id || parsedUser?._id;
      const token = localStorage.getItem("token");

      if (!userId) {
        setError("Utilisateur non authentifié");
        setSummary([]);
        setRecentTransactions([]);
        setSample([]);
        return;
      }

      // Fetch endpoints in parallel.
      // Adjust these endpoints to match your backend routes if needed.
      const summaryReq = fetch(`/api/Client/Summary`, {
        headers: { Authorization: token ? `Bearer ${token}` : "" },
      });

      // request recent transactions (limit 5)
      const txReq = fetch(`/api/Client/Transaction?page=1&limit=5`, {
        headers: { Authorization: token ? `Bearer ${token}` : "" },
      });

      // request analytics for chart (e.g., last 6 months)
      const analyticsReq = fetch(`/api/Client/Analytics?limit=6`, {
        headers: { Authorization: token ? `Bearer ${token}` : "" },
      });

      const [summaryRes, txRes, analyticsRes] = await Promise.all([summaryReq, txReq, analyticsReq]);

      // Summary
      if (summaryRes.ok) {
        const body = await summaryRes.json();
        // Expecting { data: [ { title, value, color } ] } or similar
        const data: SummaryItem[] = body.data ?? body ?? [];
        setSummary(
          Array.isArray(data) && data.length > 0
            ? data.map((s: any) => ({
                title: String(s.title ?? s.name ?? "Metric"),
                value: String(s.value ?? s.amount ?? s.total ?? ""),
                color: String(s.color ?? "blue"),
              }))
            : []
        );
      } else {
        console.warn("Failed to load summary:", await summaryRes.text());
      }

      // Transactions
      if (txRes.ok) {
        const body = await txRes.json();
        // Expecting { data: [...] } shape like your TransactionsPageClient
        const txs = body.data ?? body ?? [];
        setRecentTransactions(Array.isArray(txs) ? txs : []);
      } else {
        console.warn("Failed to load transactions:", await txRes.text());
        setRecentTransactions([]);
      }

      // Analytics / Chart
      if (analyticsRes.ok) {
        const body = await analyticsRes.json();
        // Expecting { data: [ { label, value } ] } or [ { label, value } ]
        const points = body.data ?? body ?? [];
        setSample(
          Array.isArray(points) && points.length > 0
            ? points.map((p: any) => ({
                label: String(p.label ?? p.month ?? p.name ?? ""),
                value: Number(p.value ?? p.count ?? p.amount ?? 0),
              }))
            : []
        );
      } else {
        console.warn("Failed to load analytics:", await analyticsRes.text());
        setSample([]);
      }
    } catch (err) {
      console.error("loadDashboard error:", err);
      setError("Erreur lors du chargement du tableau de bord");
      setSummary([]);
      setRecentTransactions([]);
      setSample([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDashboard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen flex bg-gray-50 p-6">
      <main className="flex-1 space-y-6">
        {/* ---- SUMMARY CARDS ---- */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {loading && summary.length === 0 ? (
            // simple placeholders while loading
            <>
              <div className="p-6 bg-white rounded-xl shadow h-28 animate-pulse" />
              <div className="p-6 bg-white rounded-xl shadow h-28 animate-pulse" />
              <div className="p-6 bg-white rounded-xl shadow h-28 animate-pulse" />
              <div className="p-6 bg-white rounded-xl shadow h-28 animate-pulse" />
            </>
          ) : summary.length === 0 ? (
            // fallback if no summary returned
            <>
              <StatCard title="Total Transactions" value="—" color="blue" />
              <StatCard title="Suspicious Transactions" value="—" color="red" />
              <StatCard title="Alerts Triggered" value="—" color="yellow" />
              <StatCard title="Account Balance" value="—" color="green" />
            </>
          ) : (
            summary.map((card) => (
              <StatCard key={card.title} title={card.title} value={card.value} color={card.color} />
            ))
          )}
        </div>

        {/* ---- Analytics Charts ---- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="p-6 bg-white text-gray-500 rounded-xl shadow h-64">
            {loading && sample.length === 0 ? (
              <div className="h-full flex items-center justify-center text-gray-400">Loading chart...</div>
            ) : sample.length === 0 ? (
              <div className="h-full flex items-center justify-center text-gray-400">No analytics data</div>
            ) : (
              <LineChart data={sample} height={180} strokeWidth={6} showArea showPoints={false} />
            )}
          </div>

          <div className="p-6 bg-white text-gray-500 rounded-xl shadow h-64 flex items-center justify-center">
            Bar Chart Placeholder
          </div>

          <div className="p-6 bg-white text-gray-500 rounded-xl shadow h-64 flex items-center justify-center">
            Pie Chart Placeholder
          </div>
        </div>

        {/* ---- Recent Transactions ---- */}
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <h2 className="text-xl text-gray-900 font-bold p-6 border-b">Recent Transactions</h2>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-100 text-gray-500">
                <tr>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Transaction ID</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={5} className="p-6 text-center">Loading...</td></tr>
                ) : recentTransactions.length === 0 ? (
                  <tr><td colSpan={5} className="p-6 text-center">Aucune transaction trouvée</td></tr>
                ) : (
                  recentTransactions.map((txn: any) => {
                    const id = txn._id ?? txn.id ?? txn.transactionId ?? "—";
                    const date = txn.date ?? txn.createdAt ?? txn.timestamp ?? null;
                    const amount = Number(txn.amount ?? txn.montant ?? 0);
                    const type = txn.type ?? txn.transactionType ?? txn.kind ?? "—";
                    const statusRaw = String(txn.status ?? txn.statut ?? txn.flag ?? "unknown");
                    const statusIsSuspicious = statusRaw.toLowerCase() === "suspicious" || statusRaw.toLowerCase() === "flagged" || statusRaw.toLowerCase() === "fraud";

                    return (
                      <tr key={id} className="border-b hover:bg-gray-50">
                        <td className="py-2 px-4 text-gray-900">{date ? new Date(date).toLocaleString() : "—"}</td>
                        <td className="py-2 px-4 text-gray-900">{String(id)}</td>
                        <td className="py-2 px-4 font-semibold text-gray-900">${amount.toFixed(2)}</td>
                        <td className="py-2 px-4 text-gray-900">{type}</td>
                        <td className="py-2 px-4">
                          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                            statusIsSuspicious ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"
                          }`}>
                            {statusRaw}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {error && (
          <div className="text-red-600 text-sm mt-2">
            {error}
          </div>
        )}
      </main>
    </div>
  );
}