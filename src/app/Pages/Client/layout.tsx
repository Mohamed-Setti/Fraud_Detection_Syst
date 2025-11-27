"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { 
  LayoutDashboard, 
  ArrowLeftRight, 
  Bell as BellIcon, 
  FileText, 
  Settings, 
  LogOut,
  ChevronRight,
  AlertCircle
} from "lucide-react";

type LayoutProps = {
  children: ReactNode;
};

export default function Layout({ children }: LayoutProps) {
  const pathname = usePathname();

  // State pour utilisateur (évite le crash SSR)
  const [user, setUser] = useState<{ name?: string }>(() => {
    if (typeof window !== "undefined") {
      try {
        const savedUser = localStorage.getItem("user");
        return savedUser ? JSON.parse(savedUser) : {};
      } catch {
        return {};
      }
    }
    return {};
  });
  const [notifications, setNotifications] = useState(2);

  const lastSegment = pathname.split("/").filter(Boolean).pop() || "Dashboard";
  const pageName = lastSegment
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());

  const menuItems = [
    { href: "./Dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "./Transaction", label: "Transactions", icon: ArrowLeftRight },
    { href: "./Alerts", label: "Alerts", icon: AlertCircle },
    { href: "./Reports", label: "Reports", icon: FileText },
    { href: "./Settings", label: "Settings", icon: Settings },
  ];

  const isActive = (href: string) => {
    const segment = href.replace("./", "");
    return pathname.includes(segment);
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Sidebar */}
      <aside className="w-72 bg-gradient-to-b from-blue-900 via-blue-800 to-blue-900 text-white shadow-2xl flex flex-col relative">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-40 h-40 bg-blue-700 rounded-full filter blur-3xl opacity-20"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-600 rounded-full filter blur-2xl opacity-20"></div>
        
        {/* Logo */}
        <div className="flex justify-center w-full p-8 relative z-10">
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 shadow-xl">
            <Image src="/Logo2.png" alt="Logo" width={150} height={150} />
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-2 px-4 relative z-10">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            
            return (
              <Link 
                key={item.href}
                href={item.href} 
                className={`group flex items-center gap-3 p-3 rounded-xl transition-all duration-300 ${
                  active 
                    ? "bg-white/20 backdrop-blur-sm shadow-lg" 
                    : "hover:bg-white/10 hover:translate-x-1"
                }`}
              >
                <div className={`p-2 rounded-lg ${active ? "bg-white/20" : "bg-white/5 group-hover:bg-white/10"} transition-all`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className="font-medium flex-1">{item.label}</span>
                {active && <ChevronRight className="w-4 h-4" />}
              </Link>
            );
          })}
        </nav>

        {/* User card at bottom */}
        <div className="p-4 relative z-10">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-bold shadow-lg">
                {user.name?.charAt(0) || "C"}
              </div>
              <div className="flex-1">
                <p className="font-semibold text-sm">{user.name || "Client"}</p>
                <p className="text-xs text-blue-200">Client</p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="flex justify-between items-center px-8 py-6">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-900 to-blue-700 bg-clip-text text-transparent">
                {pageName}
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Bienvenue, {user.name || "Client"}
              </p>
            </div>

            <div className="flex items-center gap-4">
              {/* Notifications */}
              <button className="relative p-3 hover:bg-gray-100 rounded-xl transition-all group">
                {notifications > 0 && (
                  <span className="absolute top-2 right-2 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-semibold animate-pulse">
                    {notifications}
                  </span>
                )}
                <BellIcon className="w-5 h-5 text-gray-600 group-hover:text-blue-900 transition-colors" />
              </button>

              {/* User profile */}
              <div className="flex items-center gap-3 px-4 py-2 bg-gray-50 rounded-xl border border-gray-200">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-900 to-blue-700 rounded-full flex items-center justify-center text-white font-bold shadow-lg">
                  {user.name?.charAt(0) || "C"}
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">
                    {user.name || "Client"}
                  </p>
                  <p className="text-xs text-gray-500">En ligne</p>
                </div>
              </div>

              {/* Logout */}
              <Link href="/">
                <button
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-600 to-red-500 text-white rounded-xl hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 font-medium"
                  onClick={() => {
                    // localStorage.removeItem("user");
                    // localStorage.removeItem("token");
                    localStorage.clear();
                  }}
                >
                  <LogOut className="w-4 h-4" />
                  Déconnexion
                </button>
              </Link>
            </div>
          </div>
        </header>

        {/* Content area */}
        <div className="flex-1 p-8 overflow-auto">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}