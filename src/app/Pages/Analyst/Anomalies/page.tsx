"use client";
import { useEffect, useState } from "react";
import TransactionTable from "../../../component/TransactionTable";

export default function Anomalie() {
  const [transactions, setTransactions] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/analyst/transactions")
      .then((res) => res.json())
      .then((data) => setTransactions(data));
  }, []);

  return (
    <div className="p-10">
      <h1 className="text-3xl font-bold mb-6">Anomalies</h1>
      <TransactionTable transactions={transactions} />
    </div>
  );
}
