"use client";
import { useEffect, useState } from "react";
import UserTable from "../../component/UserTable";

export default function AdminDashboard() {
  const [users, setUsers] = useState<any[]>([]);

  const fetchUsers = async () => {
    const res = await fetch("/api/admin/users");
    const data = await res.json();
    setUsers(data);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div className="p-10">
      <h1 className="text-3xl font-bold mb-6">Admin - User Management</h1>
      <UserTable users={users} refresh={fetchUsers} />
    </div>
  );
}
