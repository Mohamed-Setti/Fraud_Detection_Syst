"use client";
import { useState } from "react";

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
}

interface Props {
  users: User[];
  refresh: () => void;
}

export default function UserTable({ users, refresh }: Props) {
  const [loading, setLoading] = useState(false);

  const updateRole = async (id: string, newRole: string) => {
    setLoading(true);
    await fetch(`/api/admin/users/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: newRole }),
    });
    refresh();
    setLoading(false);
  };

  const deleteUser = async (id: string) => {
    if (!confirm("Delete this user?")) return;

    setLoading(true);
    await fetch(`/api/admin/users/${id}`, { method: "DELETE" });
    refresh();
    setLoading(false);
  };

  return (
    <table className="w-full bg-white shadow rounded">
      <thead className="bg-gray-200">
        <tr>
          <th className="p-3 text-left">Name</th>
          <th className="p-3 text-left">Email</th>
          <th className="p-3 text-left">Role</th>
          <th className="p-3 text-center">Actions</th>
        </tr>
      </thead>
      <tbody>
        {users.map((user) => (
          <tr key={user._id} className="border-t">
            <td className="p-3">{user.name}</td>
            <td className="p-3">{user.email}</td>
            <td className="p-3">
              <select
                defaultValue={user.role}
                onChange={(e) => updateRole(user._id, e.target.value)}
                className="rounded border px-2 py-1"
              >
                <option value="CLIENT">Client</option>
                <option value="TECHNICIEN">Technicien</option>
                <option value="ANALYSTE">Analyste</option>
                <option value="ADMIN">Admin</option>
              </select>
            </td>
            <td className="p-3 text-center">
              <button
                className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                onClick={() => deleteUser(user._id)}
              >
                Delete
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
