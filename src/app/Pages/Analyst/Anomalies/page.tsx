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
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  const ITEMS_PER_PAGE = 10;

  // Fetch transactions
  useEffect(() => {
    fetch("/api/analyst/transactions")
      .then((res) => res.json())
      .then((data: Transaction[]) => setTransactions(data));
  }, []);

  // Pagination logic
  const totalPages = Math.ceil(transactions.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const visibleTransactions = transactions.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  async function handleSend() {
    setLoading(true);
    setStatus(null);
    try {
      const payload = {
        to: 'medsetti11@gmail.com',
        subject: 'test UI',
        text: 'This email was sent as a test.',
        html: '<p>This email was sent as a test.</p>',
      };

      const res = await fetch('/api/EmailSend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || res.statusText);

      setStatus(`Sent! messageId: ${data.messageId}${data.previewURL ? ` — preview: ${data.previewURL}` : ''}`);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setStatus(`Error: ${message}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <div>
        <button
          className="mt-auto p-2 bg-red-600 rounded hover:bg-red-500"
          onClick={handleSend}
          disabled={loading}
        >
          {loading ? 'Sending…' : 'Send email'}
        </button>
        {status && <div style={{ marginTop: 8 }}>{status}</div>}
      </div>

      <div className="p-10">
        <h1 className="text-3xl font-bold mb-6">Anomalies</h1>

        {/* TABLE */}
        <TransactionTable transactions={visibleTransactions} />

        {/* PAGINATION CONTROLS */}
        <div className="flex justify-center items-center gap-4 mt-6">
          
          {/* Previous */}
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className={`px-4 py-2 rounded ${
              currentPage === 1 
              ? "bg-gray-300 text-gray-500 cursor-not-allowed" 
              : "bg-blue-900 text-white hover:bg-blue-700"
            }`}
          >
            Previous
          </button>

          {/* Page indicator */}
          <span className="text-lg font-semibold">
            Page {currentPage} / {totalPages}
          </span>

          {/* Next */}
          <button
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className={`px-4 py-2 rounded ${
              currentPage === totalPages
              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
              : "bg-blue-900 text-white hover:bg-blue-700"
            }`}
          >
            Next
          </button>

        </div>
      </div>
    </>
  );
}
