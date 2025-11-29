"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";

type Transaction = any;

export default function TransactionsPageClient() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [page, setPage] = useState<number>(1);
  const limit = 10;
  const [total, setTotal] = useState<number>(0);

  async function loadData(p = 1) {
    setLoading(true);
    try {
      // read user from localStorage (your code uses localStorage)
      const rawUser = localStorage.getItem("user");
      const parsedUser = rawUser ? JSON.parse(rawUser) : null;
      const userId = parsedUser?.id || parsedUser?._id;

      if (!userId) {
        // nothing to fetch
        setTransactions([]);
        setTotal(0);
        return;
      }

      // Option A: pass userId as query (quick & simple)
      //const res = await fetch(`/api/Client/Transaction?userId=${encodeURIComponent(userId)}&page=${p}&limit=${limit}`);

      // Option B (recommended even here): pass Authorization header with token
      const token = localStorage.getItem("token");
       const res = await fetch(`/api/Client/Transaction?page=${p}&limit=${limit}`, {
         headers: { Authorization: `Bearer ${token}` }
      });

      if (!res.ok) {
        console.error("Failed to load transactions", await res.text());
        setTransactions([]);
        setTotal(0);
        return;
      }

      const body = await res.json();
      // adapt according to your API shape: here we expect { data, total, page }
      setTransactions(body.data || body || []);
      setTotal(body.total ?? (body.data ? body.data.length : (body.length ?? 0)));
      setPage(body.page ?? p);
    } catch (err) {
      console.error("loadData error:", err);
      setTransactions([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen flex bg-gray-50">
      <main className="flex-1 p-8">
        <div className="flex justify-end mb-4">
          <Link href="./AddTransaction">
            <button className="flex items-center justify-center px-4 py-2 bg-blue-700 text-white rounded-lg hover:bg-blue-600">
              <Plus className="mr-2" />
              add Transaction
            </button>
          </Link>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-blue-900 text-white">
              <tr>
                <th className="p-3 text-left">ID</th>
                <th className="p-3 text-left">Client</th>
                <th className="p-3 text-left">Amount</th>
                <th className="p-3 text-left">Date</th>
                <th className="p-3 text-left">Status</th>
                <th className="p-3 text-left"></th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="p-6 text-center">Loading...</td></tr>
              ) : transactions.length === 0 ? (
                <tr><td colSpan={6} className="p-6 text-center">No transactions found</td></tr>
              ) : (
                transactions.map((tx) => (
                  <tr key={tx._id || tx.id} className="border-b hover:bg-gray-50">
                    <td className="p-3 text-gray-900">{String(tx._id ?? tx.id)}</td>
                    <td className="p-3 text-gray-900">
                      {tx.compteDestination?.nameAccount ?? tx.compteDestination?.owner ?? "Client"}
                    </td>
                    <td className="p-3 font-semibold text-gray-900">${Number(tx.amount ?? tx.montant ?? 0).toFixed(2)}</td>
                    <td className="p-3 text-gray-900">{new Date(tx.date ?? tx.createdAt).toLocaleString()}</td>
                    <td className="p-3">
                      <span className={`px-3 py-1 rounded-full text-sm ${String(tx.status ?? tx.statut ?? "unknown").toLowerCase() === "flagged" ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}>
                        {String(tx.status ?? tx.statut ?? "unknown")}
                      </span>
                    </td>
                    <td className="p-3 text-blue-700 hover:underline cursor-pointer">View →</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Simple pagination */}
        <div className="flex justify-between items-center mt-4">
          <p className="text-gray-600">Showing {(page - 1) * limit + 1}–{Math.min(page * limit, total)} of {total}</p>
          <div className="flex gap-2">
            <button disabled={page <= 1} onClick={() => loadData(page - 1)} className="px-3 py-1 bg-gray-200 rounded-lg">Prev</button>
            <button className="px-3 py-1 bg-blue-700 text-white rounded-lg">{page}</button>
            <button disabled={page * limit >= total} onClick={() => loadData(page + 1)} className="px-3 py-1 bg-gray-200 rounded-lg">Next</button>
          </div>
        </div>
      </main>
    </div>
  );
}