"use client";
import { useEffect, useState } from "react";
import StatCard from "../../../component/StatCard";
import Link from "next/link";

type Transaction = {
  amount?: number;
  anomaly?: boolean;
};

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalTransactions: 0,
    totalAnomalies: 0,
    totalRevenue: 0,
  });

  useEffect(() => {
    fetch("/api/Client/Transaction")
      .then((res) => res.json())
      .then((transactions: Transaction[]) => {
        console.log("Transactions reçues :", transactions);

        const totalRevenue = transactions.reduce(
          (sum: number, t: Transaction) => sum + (t.amount || 0),
          0
        );

        const totalAnomalies = transactions.filter(
          (t) => t.anomaly === true
        ).length;

        setStats({
          totalTransactions: transactions.length,
          totalAnomalies,
          totalRevenue,
        });
      })
      .catch((err) => console.error("Dashboard error:", err));
  }, []);

  return (
    <div className="p-10">
      <h1 className="text-3xl font-bold mb-6">Analyst Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
        <StatCard title="Total Transactions" value={stats.totalTransactions} color="RED" />
        <StatCard title="Total Anomalies" value={stats.totalAnomalies} color="BLUE"/>
        <StatCard title="Total Revenue" value={stats.totalRevenue} color="GREEN" />
      </div>

      <Link
        href="/Pages/Analyst/transactions"
        className="px-5 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700"
      >
        📊 Voir toutes les transactions
      </Link>
    </div>
  );
}
