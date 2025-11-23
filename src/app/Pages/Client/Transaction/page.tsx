"use client";

import Link from "next/dist/client/link";
import {Plus} from "lucide-react" ;

export default function TransactionsPage() {
  return (
    <div className="min-h-screen flex bg-gray-50">
     
      <main className="flex-1 p-8">
            <div className="flex justify-end mb-4">
                <Link href="./AddTransaction">
                    <button className="flex items-center justify-center px-4 py-2 bg-blue-700 text-white rounded-lg hover:bg-blue-600">
                        <Plus className="mr-2"/> 
                        add Transaction
                    </button>
                </Link>
            </div>
            <div className="space-y-6">
            {/* ---- KPI BOXES ---- */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="p-6 bg-white shadow rounded-xl border-l-4 border-blue-700">
                <h3 className="text-sm text-gray-500">Total Transactions</h3>
                <p className="text-2xl font-bold text-blue-900">2,482</p>
                </div>

                <div className="p-6 bg-white shadow rounded-xl border-l-4 border-green-600">
                <h3 className="text-sm text-gray-500">Successful</h3>
                <p className="text-2xl font-bold text-green-700">2,300</p>
                </div>

                <div className="p-6 bg-white shadow rounded-xl border-l-4 border-red-600">
                <h3 className="text-sm text-gray-500">Flagged</h3>
                <p className="text-2xl font-bold text-red-700">112</p>
                </div>

                <div className="p-6 bg-white shadow rounded-xl border-l-4 border-yellow-500">
                <h3 className="text-sm text-gray-500">Pending Review</h3>
                <p className="text-2xl font-bold text-yellow-600">70</p>
                </div>
            </div>

            {/* ---- FILTERS ---- */}
            <div className="p-4 bg-white rounded-xl shadow flex flex-wrap gap-4 items-center">

                <input
                type="text"
                placeholder="Search transaction..."
                className="flex-1 px-4 py-2 border rounded-lg focus:outline-none text-gray-900 placeholder:gray-400"
                />

                <select className="px-4 py-2 border rounded-lg text-gray-900">
                <option>Status</option>
                <option>Successful</option>
                <option>Flagged</option>
                <option>Pending</option>
                </select>

                <input type="date" className="px-4 py-2 border rounded-lg text-gray-900" />
                <input type="date" className="px-4 py-2 border rounded-lg text-gray-900" />

                <button className="px-4 py-2 bg-blue-700 text-white rounded-lg hover:bg-blue-600">
                    Apply Filters
                </button>
            </div>

            {/* ---- TRANSACTIONS TABLE ---- */}
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
                    {[1, 2, 3, 4, 5].map((i) => (
                    <tr key={i} className="border-b hover:bg-gray-50">
                        <td className="p-3 text-gray-900">TXN00{i}</td>
                        <td className="p-3 text-gray-900">John Doe</td>
                        <td className="p-3 font-semibold text-gray-900">$1,250.00</td>
                        <td className="p-3 text-gray-900">2025-11-15</td>

                        <td className="p-3">
                        <span
                            className={
                            i % 2 === 0
                                ? "px-3 py-1 rounded-full text-sm bg-green-100 text-green-700"
                                : "px-3 py-1 rounded-full text-sm bg-red-100 text-red-700"
                            }
                        >
                            {i % 2 === 0 ? "Successful" : "Flagged"}
                        </span>
                        </td>

                        <td className="p-3 text-blue-700 hover:underline cursor-pointer">
                        View →
                        </td>
                    </tr>
                    ))}
                </tbody>
                </table>
            </div>

            {/* ---- PAGINATION ---- */}
            <div className="flex justify-between items-center mt-4">
                <p className="text-gray-600">Showing 1–10 of 2482</p>

                <div className="flex gap-2">
                <button className="px-3 py-1 bg-gray-200 rounded-lg hover:bg-gray-300">Prev</button>
                <button className="px-3 py-1 bg-blue-700 text-white rounded-lg">1</button>
                <button className="px-3 py-1 bg-gray-200 rounded-lg hover:bg-gray-300">2</button>
                <button className="px-3 py-1 bg-gray-200 rounded-lg hover:bg-gray-300">3</button>
                <button className="px-3 py-1 bg-gray-200 rounded-lg hover:bg-gray-300">Next</button>
                </div>
            </div>
            </div>
        </main>
    </div>
  );
}