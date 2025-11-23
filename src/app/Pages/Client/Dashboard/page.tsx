'use client';

export default function ClientDashboard() {

  
  // Dummy data
  const summary = [
    { title: "Total Transactions", value: "$12,450", color: "border-blue-700" },
    { title: "Suspicious Transactions", value: "24", color: "border-red-600" },
    { title: "Alerts Triggered", value: "7", color: "border-yellow-500" },
    { title: "Account Balance", value: "$48,200", color: "border-green-600" },
  ];

  const recentTransactions = [
    { date: "2025-11-15", id: "TXN123456", amount: "$1,200", type: "Deposit", status: "Normal" },
    { date: "2025-11-14", id: "TXN123457", amount: "$500", type: "Withdrawal", status: "Suspicious" },
    { date: "2025-11-13", id: "TXN123458", amount: "$2,300", type: "Deposit", status: "Normal" },
  ];

  return (
    <div className="min-h-screen flex bg-gray-50 p-6">

      <main className="flex-1 space-y-6">

        {/* ---- SUMMARY CARDS ---- */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {summary.map((card) => (
            <div key={card.title} className={`p-6 bg-white shadow rounded-xl border-l-4 ${card.color}`}>
              <p className="text-sm text-gray-500">{card.title}</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{card.value}</p>
            </div>
          ))}
        </div>

        {/* ---- Analytics Charts ---- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="p-6 bg-white text-gray-500 rounded-xl shadow h-64 flex items-center justify-center">
            Line Chart Placeholder
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
                {recentTransactions.map((txn) => (
                  <tr key={txn.id} className="border-b hover:bg-gray-50">
                    <td className="py-2 px-4 text-gray-900">{txn.date}</td>
                    <td className="py-2 px-4 text-gray-900">{txn.id}</td>
                    <td className="py-2 px-4 font-semibold text-gray-900">{txn.amount}</td>
                    <td className="py-2 px-4 text-gray-900">{txn.type}</td>
                    <td className="py-2 px-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                        txn.status === "Suspicious" ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"
                      }`}>
                        {txn.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </main>
    </div>
  );
}
