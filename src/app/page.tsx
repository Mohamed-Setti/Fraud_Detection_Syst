'use client';

import { useRouter } from "next/navigation";
import Image from "next/image";
import { ArrowRight } from "lucide-react";

export default function Home() {
  const router = useRouter();

  return (
    <div className="relative flex min-h-screen bg-gradient-to-br from-blue-900 to-blue-700 overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-white/20 rounded-full mix-blend-multiply filter blur-xl opacity-50 animate-pulse"></div>
        <div className="absolute -bottom-40 -right-40 w-80 h-80 bg-purple-100/20 rounded-full mix-blend-multiply filter blur-xl opacity-50 animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Hero content centered */}
      <div className="flex flex-col justify-center items-center w-full z-10 px-6 py-20 text-center text-white">
        {/* Logo */}
        <div className="w-80 h-80 mb-8 bg-white/20 rounded-full flex items-center justify-center shadow-lg backdrop-blur-sm">
          <Image src="/Logo FDS.svg" alt="FinGuard AI" width={250} height={250} />
        </div>

        {/* Main Text */}
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          Plateforme intelligente de détection d’anomalies bancaires
        </h1>
        <p className="text-lg md:text-xl mb-8 max-w-2xl">
          Analyse des transactions en temps réel avec IA et alertes automatisées
        </p>

        {/* CTA Button */}
        <button
          onClick={() => router.push("/Pages/Auth")}
          className="flex items-center gap-2 px-8 py-5 bg-white text-blue-900 font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
        >
          Commencer maintenant
          <ArrowRight className="h-5 w-5" />
        </button>
      </div>

      {/* Decorative circles */}
      <div className="absolute top-10 right-10 w-20 h-20 border-4 border-white/30 rounded-full"></div>
      <div className="absolute bottom-10 left-10 w-32 h-32 border-4 border-white/20 rounded-full"></div>
    </div>
  );
}
