"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok && data.token) {
        localStorage.setItem("token", data.token);
        router.push("/Pages/Client/Dashboard");
      } else {
        setMessage(data.error || "Invalid credentials");
      }
    } catch (error) {
      console.error("Login error:", error);
      setMessage("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4 py-12">
      {/* Card Container */}
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <Image
            src="/Logo.png"
            alt="Logo"
            width={150}
            height={150}
          />
        </div>

        <h2 className="text-center text-2xl font-bold tracking-tight text-gray-900 mb-6">
          Sign in to your account
        </h2>

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              placeholder="Email address"
              className="mt-2 block w-full rounded-md bg-gray-100 px-3 py-2 text-gray-900 placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-indigo-500 sm:text-sm"
            />
          </div>

          <div>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              placeholder="Password"
              className="mt-2 block w-full rounded-md bg-gray-100 px-3 py-2 text-gray-900 placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-indigo-500 sm:text-sm"
            />
            <div className="flex justify-end mt-1">
              <Link
                href="#"
                className="text-sm font-semibold text-indigo-600 hover:text-indigo-500"
              >
                Forgot password?
              </Link>
            </div>
          </div>

          {message && (
            <p className="text-sm text-red-500 text-center">{message}</p>
          )}

          <button
            type="submit"
            className="w-full flex justify-center rounded-md bg-indigo-600 px-4 py-2 text-white font-semibold shadow hover:bg-indigo-500 transition"
          >
            Sign in
          </button>

          <div className="flex justify-between mt-4 text-sm text-gray-900">
            <span>You don&apos;t have an account?</span>
            <Link
              href="./Registre"
              className="font-semibold text-indigo-600 hover:text-indigo-500"
            >
              Register
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
