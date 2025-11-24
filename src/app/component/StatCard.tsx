"use client";

interface Props {
  title: string;
  value: number | string;
  color : string;
}

export default function StatCard({ title, value, color }: Props) {
  return (
    // <div className="bg-white p-4 rounded shadow">
    //   <h3 className="text-gray-500">{title}</h3>
    //   <p className="text-2xl font-bold">{value}</p>
    // </div>
    <div className="bg-white p-6 rounded-xl shadow border-l-4" style={{ borderColor: color }}>
      <p className="text-sm text-gray-500">{title}</p>
      <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
    </div>
  );
}
