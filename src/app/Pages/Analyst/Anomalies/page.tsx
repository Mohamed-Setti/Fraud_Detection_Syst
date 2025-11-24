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
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  async function handleSend() {
    setLoading(true);
    setStatus(null);
    try {
      const payload = {
        // replace recipient / subject / body as needed or gather from inputs
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
        <button className="mt-auto p-2 bg-red-600 rounded hover:bg-red-500" onClick={handleSend} disabled={loading}>
          {loading ? 'Sending…' : 'Send email'}
        </button>
        {status && <div style={{ marginTop: 8 }}>{status}</div>}
      </div>
      <div className="p-10">
        <h1 className="text-3xl font-bold mb-6">Anomalies</h1>
        <TransactionTable transactions={transactions} />
      </div>
    </>
  );
}



