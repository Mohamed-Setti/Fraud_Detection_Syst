'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from "next/image";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [role, setRole] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const router = useRouter();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      setMessage("Passwords do not match");
      return;
    }

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, mobile, role, password }),
    });

    const data = await res.json();

    if (res.ok) {
      router.push("./Login");
    } else {
      setMessage(data.error || "Registration failed");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4 py-12">
      {/* Card Container */}
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <Image src="/Logo.png" alt="Logo" width={150} height={150} />
        </div>

        <h2 className="text-center text-2xl font-bold tracking-tight text-gray-900 mb-6">
          Create a new account
        </h2>

        {/* Form */}
        <form onSubmit={handleSignUp} className="space-y-6">
          <input
            type="text"
            placeholder="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-2 block w-full rounded-md bg-gray-100 px-3 py-2 text-gray-900 placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-indigo-500 sm:text-sm"
          />

          <input
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-2 block w-full rounded-md bg-gray-100 px-3 py-2 text-gray-900 placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-indigo-500 sm:text-sm"
          />

          <input
            type="tel"
            placeholder="Mobile Number"
            value={mobile}
            onChange={(e) => setMobile(e.target.value)}
            className="mt-2 block w-full rounded-md bg-gray-100 px-3 py-2 text-gray-900 placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-indigo-500 sm:text-sm"
          />

          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="mt-2 block w-full rounded-md bg-gray-100 px-3 py-2 text-gray-900 outline-none focus:ring-2 focus:ring-indigo-500 sm:text-sm"
          >
            <option value="">Select a role</option>
            <option value="CLIENT">Client</option>
            <option value="TECHNICIEN">Technicien</option>
            <option value="ANALYSTE">Analyste</option>
          </select>

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-2 block w-full rounded-md bg-gray-100 px-3 py-2 text-gray-900 placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-indigo-500 sm:text-sm"
          />

          <input
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="mt-2 block w-full rounded-md bg-gray-100 px-3 py-2 text-gray-900 placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-indigo-500 sm:text-sm"
          />

          {message && (
            <p className="text-sm text-red-500 text-center">{message}</p>
          )}

          <button
            type="submit"
            className="w-full flex justify-center rounded-md bg-indigo-600 px-4 py-2 text-white font-semibold shadow hover:bg-indigo-500 transition"
          >
            Sign Up
          </button>

          <div className="flex justify-between mt-4 text-sm text-gray-900">
            <span>Already have an account?</span>
            <a
              href="./Login"
              className="font-semibold text-indigo-600 hover:text-indigo-500"
            >
              Log In
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}
