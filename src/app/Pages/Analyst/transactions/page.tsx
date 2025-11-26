"use client";

import { useEffect, useState } from "react";
import Pagination from "../../../component/pagination";

type Transaction = {
  _id: string;
  amount: number;
  anomaly: boolean;
  date?: string;
};

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 10;

  useEffect(() => {
    fetch("/api/Client/Transaction")
      .then((res) => res.json())
      .then((data: Transaction[]) => {
        setTransactions(data);
      });
  }, []);

  const start = (currentPage - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  const currentData = transactions.slice(start, end);

  return (
    <div className="p-10">
      <h1 className="text-3xl font-bold mb-6">📋 Liste des transactions</h1>

      <table className="w-full border-collapse border text-left">
        <thead className="bg-gray-100">
          <tr>
            <th className="border p-3">ID</th>
            <th className="border p-3">Montant</th>
            <th className="border p-3">Anomalie</th>
            <th className="border p-3">Date</th>
          </tr>
        </thead>
        <tbody>
          {currentData.map((t) => (
            <tr key={t._id}>
              <td className="border p-3">{t._id}</td>
              <td className="border p-3">{t.amount} DT</td>
              <td className="border p-3">
                {t.anomaly ? (
                  <span className="text-red-600 font-bold">⚠️ Oui</span>
                ) : (
                  <span className="text-green-600 font-bold">✔️ Non</span>
                )}
              </td>
              <td className="border p-3">
                {t.date ? new Date(t.date).toLocaleString() : "-"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <Pagination
        totalItems={transactions.length}
        itemsPerPage={itemsPerPage}
        currentPage={currentPage}
        setPage={setCurrentPage}
      />
    </div>
  );
}
