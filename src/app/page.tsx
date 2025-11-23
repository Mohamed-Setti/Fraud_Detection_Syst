"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import { ArrowRight } from "lucide-react";

export default function Home() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-linear-to-b from-white via-gray-100 to-blue-700 min-h-screen flex items-center">
        {/* Optional subtle overlay */}
        <div className="absolute inset-0 bg-linear-to-br from-white via-gray-50 to-blue-700 opacity-90" />

        <div className="container relative mx-auto px-4 py-20 flex flex-col items-center text-center">
          {/* Logo */}
          <div className="inline-flex items-center justify-center p-4 bg-white/30 rounded-full backdrop-blur-sm mb-6 shadow-lg">
            <Image src="/Logo.png" alt="FinGuard AI" width={200} height={200} />
          </div>

          {/* text */}
          <p className="text-xl md:text-2xl text-blue-700 dark:text-blue-700 max-w-2xl mb-8">
            Plateforme intelligente de détection d’anomalies bancaires et d’analyse de transactions en temps réel
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-row sm:flex-col gap-4">
            <button
              onClick={() => router.push("/Pages/Auth")}
              className="m-2 text-lg px-8 py-5 bg-blue-600 text-white font-semibold rounded-lg shadow-lg flex items-center gap-2 hover:bg-blue-700 transition"
            >
              Commencer maintenant
              <ArrowRight className="h-5 w-5" />
            </button>
            {/* <button
              onClick={() => router.push("/Pages/Auth/Registre")}
              className="m-2 text-lg px-8 py-5 bg-white text-blue-700 font-semibold rounded-lg shadow-lg flex items-center gap-2 hover:bg-blue-50 transition"
            >
              Créer un compte
              <ArrowRight className="h-5 w-5" />
            </button> */}
          </div>
        </div>
      </section>
    </div>
  );
}
