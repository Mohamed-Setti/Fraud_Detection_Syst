"use client";

interface Transaction {
  _id: string;
  amount: number;
  date: string;
  status: string;
}

interface Props {
  transactions: Transaction[];
}

export default function TransactionTable({ transactions }: Props) {
  return (
    <table className="w-full bg-white shadow rounded mt-4">
      <thead className="bg-gray-200">
        <tr>
          <th className="p-2 text-left">ID</th>
          <th className="p-2 text-left">Amount</th>
          <th className="p-2 text-left">Date</th>
          <th className="p-2 text-left">Status</th>
        </tr>
      </thead>
      <tbody>
        {transactions.map((t) => (
          <tr key={t._id} className="border-t">
            <td className="p-2">{t._id}</td>
            <td className="p-2">{t.amount}</td>
            <td className="p-2">{new Date(t.date).toLocaleString()}</td>
            <td className="p-2">{t.status}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
