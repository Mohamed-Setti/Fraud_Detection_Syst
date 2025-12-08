"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";

type User = {
  _id: string;
  name?: string;
  email?: string;
};

export default function DeleteAnalystePage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Récupère la liste des analystes côté client (sans localStorage)
  useEffect(() => {
    let mounted = true;
    setLoading(true);
    fetch("/api/admin/users")
      .then(async (res) => {
        if (!res.ok) {
          const txt = await res.text().catch(() => "Erreur serveur");
          throw new Error(txt || `Status ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        if (!mounted) return;
        setUsers(Array.isArray(data) ? data : []);
      })
      .catch((e: any) => {
        console.error("Fetch users error:", e);
        if (mounted) setError(e?.message || "Impossible de charger la liste");
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const handleDelete = async (id: string) => {
    const u = users.find((x) => x._id === id);
    const nameOrEmail = u?.name ?? u?.email ?? "cet utilisateur";
    if (!confirm(`Supprimer ${nameOrEmail} ? Cette action est irréversible.`)) return;

    setError(null);
    setLoadingId(id);
    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const txt = await res.text().catch(() => "Erreur serveur");
        throw new Error(txt || `Status ${res.status}`);
      }

      setUsers((prev) => prev.filter((x) => x._id !== id));
    } catch (e: any) {
      console.error("Delete error:", e);
      setError(e?.message || "Impossible de supprimer");
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="min-h-screen p-6 bg-gray-100">
      <div className="w-full max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Image src="/Logo.png" alt="Logo" width={64} height={64} />
          <h1 className="text-2xl font-semibold">Delete Analyste</h1>
        </div>

        <div className="bg-white rounded shadow p-4">
          {error && <div className="text-red-600 mb-4">{error}</div>}

          {loading ? (
            <div>Chargement...</div>
          ) : users.length === 0 ? (
            <div>Aucun analyste trouvé.</div>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr>
                  <th className="py-2">Nom</th>
                  <th className="py-2">Email</th>
                  <th className="py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => {
                  const isDeleting = loadingId === user._id;
                  return (
                    <tr key={user._id} className="border-t">
                      <td className="py-2">{user.name ?? "-"}</td>
                      <td className="py-2">{user.email ?? "-"}</td>
                      <td className="py-2">
                        <button
                          onClick={() => handleDelete(user._id)}
                          disabled={isDeleting}
                          className={`px-3 py-1 rounded ${
                            isDeleting
                              ? "bg-gray-300 text-gray-700"
                              : "bg-red-600 text-white hover:bg-red-500"
                          }`}
                        >
                          {isDeleting ? "Suppression..." : "Supprimer"}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}