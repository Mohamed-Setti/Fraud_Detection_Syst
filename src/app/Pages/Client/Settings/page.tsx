"use client";
import React, { useEffect, useState } from "react";

type User = {
  name: string;
  email: string;
  mobile: string;
};

export default function Settings() {
  const [user, setUser] = useState<User | null>(null);
  const [message, setMessage] = useState("");
  const [showPasswordFields, setShowPasswordFields] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    mobile: "",
    oldPassword: "",
    password: "",
  });

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (!stored) return;

    const u: User = JSON.parse(stored);

    React.startTransition(() => {
      setUser(u);
      setForm({
        name: u.name,
        email: u.email,
        mobile: u.mobile,
        oldPassword: "",
        password: "",
      });
    });
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleUpdate = async () => {
    try {
      const token = localStorage.getItem("token");

      // Prepare request body
      const updateBody: {
        name: string;
        email: string;
        mobile: string;
        oldPassword?: string;
        password?: string;
      } = {
        name: form.name,
        email: form.email,
        mobile: form.mobile,
      };

      // Only include password fields if they're filled
      if (showPasswordFields && form.password) {
        updateBody.oldPassword = form.oldPassword;
        updateBody.password = form.password;
      }

      const res = await fetch("/api/auth/update", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updateBody),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.error || "Failed to update");
        return;
      }

      // Update local user
      localStorage.setItem("user", JSON.stringify(data.user));
      setUser(data.user);

      // Clear password fields and hide them
      setForm({
        ...form,
        oldPassword: "",
        password: "",
      });
      setShowPasswordFields(false);

      setMessage("Updated successfully!");
    } catch (error: unknown) {
      console.error("Update error:", error);
      const message = error instanceof Error ? error.message : String(error);
      setMessage("Error updating user: " + message);
    }
  };

  if (!user) return <p className="p-4">Loading...</p>;

  return (
    <div className="max-w-xl mx-auto p-6 text-gray-900">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>

      <div className="space-y-4">
        <input
          name="name"
          type="text"
          value={form.name}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          placeholder="Name"
        />

        <input
          name="email"
          type="email"
          value={form.email}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          placeholder="Email"
        />

        <input
          name="mobile"
          type="text"
          value={form.mobile}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          placeholder="Mobile"
        />

            <input
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              placeholder="New password"
            />
        <input
              name="old Password"
              type="password"
              value={form.password}
              // onChange={handleChange}
              className="w-full p-2 border rounded"
              placeholder="New password"
            />

        <button
          onClick={handleUpdate}
          className="bg-blue-600 text-white px-4 py-2 rounded w-full"
        >
          Save Changes
        </button>

        {message && (
          <p className="text-center text-sm mt-4 text-green-600">{message}</p>
        )}
      </div>
    </div>
  );
}
