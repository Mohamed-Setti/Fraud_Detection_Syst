"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";

type LayoutProps = {
  children: ReactNode;
};

type User = {
  name?: string;
  email?: string;
};

export default function Layout({ children }: LayoutProps) {
  const [user, setUser] = useState<User>({});
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  // ✅ Accéder à localStorage SEULEMENT côté client après montage
  useEffect(() => {
    setMounted(true);
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error("Failed to parse user from localStorage:", e);
        setUser({});
      }
    }
  }, []);

  const lastSegment =
    pathname.split("/").filter(Boolean).pop() || "Dashboard";

  const pageName = lastSegment
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());

  // ✅ Ne rien afficher jusqu'à montage côté client
  if (!mounted) {
    return (
      <div className="min-h-screen flex bg-gray-50">
        <div className="w-64 bg-blue-900"></div>
        <main className="flex-1 flex items-center justify-center">
          <p className="text-gray-600">Chargement...</p>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-blue-900 text-white p-6 flex flex-col">
        <div className="flex justify-center w-full p-6">
          <Image 
            src="/Logo2.png" 
            alt="Logo" 
            width={185} 
            height={185} 
            loading="eager"
          />
        </div>

        <nav className="flex-1 space-y-4">
          <a href="./Dashboard" className="block p-2 rounded hover:bg-blue-800">Dashboard</a>
          <a href="./RegistreAnalyste" className="block p-2 rounded hover:bg-blue-800">Add Analyst</a>
          <a href="./DeleteAnalyste" className="block p-2 rounded hover:bg-blue-800">Delete Analyste</a>
          <a href="#" className="block p-2 rounded hover:bg-blue-800">Alerts</a>
          <a href="#" className="block p-2 rounded hover:bg-blue-800">Reports</a>
          <a href="./Settings" className="block p-2 rounded hover:bg-blue-800">Settings</a>
        </nav>
      </aside>

      {/* Main */}
      <main className="flex-1">
        {/* Header */}
        <div className="flex justify-between items-center mb-6 bg-white m-0 p-4">
          <h1 className="text-3xl font-bold text-blue-900">{pageName}</h1>

          <div className="flex items-center gap-4">
            <button className="relative">
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              🔔
            </button>
            <div className="flex items-center gap-5">
              <span className="font-medium text-gray-900">{user.name || "User"}</span>
            </div>
            <Link href="/">
              <button 
                className="mt-auto p-2 bg-red-600 rounded hover:bg-red-500 text-white" 
                onClick={() => {
                  localStorage.clear();
                }}
              >
                Logout
              </button>
            </Link>
          </div>
        </div>
        {children}
      </main>
    </div>
  );
}