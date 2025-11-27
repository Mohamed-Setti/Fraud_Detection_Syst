"use client";
import { useEffect, useState } from "react";
import UserTable from "../../component/UserTable";

type User = {
  _id: string;
  name: string;
  email: string;
  role: string;
  // Add other user properties as needed
};

export default function AdminDashboard() {
  const [users, setUsers] = useState<User[]>([]);

  const fetchUsers = async () => {
    const res = await fetch("/api/admin/users");
    const data = await res.json();
    setUsers(data);
  };

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const res = await fetch("/api/admin/users");
        if (!res.ok) return;
        const data = await res.json();
        if (isMounted) setUsers(data);
      } catch (e) {
        console.error("Failed to load users", e);
      }
    })();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="p-10">
      <h1 className="text-3xl font-bold mb-6">Admin - User Management</h1>
      <UserTable users={users} refresh={fetchUsers} />
    </div>
  );
}
