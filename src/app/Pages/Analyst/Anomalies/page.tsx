"use client";
import { useEffect, useState } from "react";
import TransactionTable from "../../../component/TransactionTable";

interface Transaction {
  _id: string;
  amount: number;
  date: string;
  status: string;
}

export default function Anomalie() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    fetch("/api/analyst/transactions")
      .then((res) => res.json())
      .then((data: Transaction[]) => setTransactions(data));
  }, []);

  return (
    <div className="p-10">
      <h1 className="text-3xl font-bold mb-6">Anomalies</h1>
      <TransactionTable transactions={transactions} />
    </div>
  );
}
