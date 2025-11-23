'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function AuthPage() {
  const [isRegisterActive, setIsRegisterActive] = useState(false);
  const router = useRouter();

  // Login state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginMessage, setLoginMessage] = useState("");

  // Register state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [role, setRole] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [registerMessage, setRegisterMessage] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });
      const data = await res.json();
      if (res.ok && data.token) {
        localStorage.setItem("user", JSON.stringify(data.user));
        localStorage.setItem("token", data.token);
        router.push("/Pages/Client/Dashboard");
      } else {
        setLoginMessage(data.error || "Invalid credentials");
      }
    } catch (error) {
      console.error(error);
      setLoginMessage("Something went wrong. Please try again.");
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setRegisterMessage("Passwords do not match");
      return;
    }
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, mobile, role, password }),
      });
      const data = await res.json();
      if (res.ok) {
        setIsRegisterActive(true);
      } else {
        setRegisterMessage(data.error || "Registration failed");
      }
    } catch (error) {
      console.error(error);
      setRegisterMessage("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="relative flex min-h-screen bg-gray-100">
      {/* Left: Login Form */}
      <div className="w-1/2 flex flex-col justify-center items-center p-10 z-10">
        <div className="flex justify-center mb-6">
          <Image src="/Logo.png" alt="Logo" width={185} height={185} />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Log In</h2>
        <form onSubmit={handleLogin} className="space-y-4 w-full max-w-sm">
          <input
            type="email"
            placeholder="Email"
            value={loginEmail}
            onChange={(e) => setLoginEmail(e.target.value)}
            className="w-full px-3 py-2 rounded-md bg-gray-200 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <input
            type="password"
            placeholder="Password"
            value={loginPassword}
            onChange={(e) => setLoginPassword(e.target.value)}
            className="w-full px-3 py-2 rounded-md bg-gray-200 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          {loginMessage && (
            <p className="text-sm text-red-500 text-center">{loginMessage}</p>
          )}
          <button className="w-full py-2 bg-blue-900 text-white rounded-md hover:bg-blue-800 transition">
            Log In
          </button>
        </form>
      </div>

      {/* Right: Register Form */}
      <div className="w-1/2 flex flex-col justify-center items-center p-10 z-10">
        <div className="flex justify-center mb-6">
          <Image src="/Logo.png" alt="Logo" width={185} height={185} />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Register</h2>
        <form onSubmit={handleRegister} className="space-y-4 w-full max-w-sm">
          <input
            type="text"
            placeholder="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 rounded-md bg-gray-200 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 rounded-md bg-gray-200 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <input
            type="tel"
            placeholder="Mobile"
            value={mobile}
            onChange={(e) => setMobile(e.target.value)}
            className="w-full px-3 py-2 rounded-md bg-gray-200 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full px-3 py-2 rounded-md bg-gray-200 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="" >Select Role</option>
            <option value="CLIENT">Client</option>
            <option value="TECHNICIEN">Technicien</option>
            <option value="ANALYSTE">Analyste</option>
          </select>
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 rounded-md bg-gray-200 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <input
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full px-3 py-2 rounded-md bg-gray-200 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          {registerMessage && (
            <p className="text-sm text-red-500 text-center">{registerMessage}</p>
          )}
          <button className="w-full py-2 bg-blue-900 text-white rounded-md hover:bg-blue-800 transition">
            Register
        
          </button>
        </form>
      </div>

      {/* Sliding Cover */}
      <div
        onClick={() => setIsRegisterActive(!isRegisterActive)}
        className="absolute top-0 left-0 h-full w-1/2 z-20 flex flex-col items-center justify-center cursor-pointer transition-transform duration-700"
        style={{
          backgroundColor: "#22427c",
          transform: isRegisterActive ? "translateX(100%)" : "translateX(0)"
        }}
      >
        <h2 className="text-5xl font-bold text-white m-4 pb-2">
                {isRegisterActive ? "Log In" : "Register"}
        </h2>
        <p className="mt-2 text-center text-white max-w-xs px-4">
                {isRegisterActive
                ? "Click to go back to create a new account"
                : "Click to login if you already have an account"}
        </p>
      </div>
    </div>
  );
}
