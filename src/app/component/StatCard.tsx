"use client";

interface Props {
  title: string;
  value: number | string;
}

export default function StatCard({ title, value }: Props) {
  return (
    <div className="bg-white p-4 rounded shadow">
      <h3 className="text-gray-500">{title}</h3>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
}
