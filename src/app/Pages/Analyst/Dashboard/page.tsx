"use client";
import { useEffect, useState } from "react";
import StatCard from "../../../component/StatCard";

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalTransactions: 0,
    totalAnomalies: 0,
    totalRevenue: 0,
  });

  useEffect(() => {
    // Exemple : récupérer des stats depuis le backend analyst
    fetch("/api/analyst/stats")
      .then((res) => res.json())
      .then((data) => setStats(data));
  }, []);

  return (
    <div className="p-10">
      <h1 className="text-3xl font-bold mb-6">Analyst Dashboard</h1>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <StatCard title="Total Transactions" value={stats.totalTransactions} />
        <StatCard title="Total Anomalies" value={stats.totalAnomalies} />
        <StatCard title="Total Revenue" value={stats.totalRevenue} />
      </div>
    </div>
  );
}
