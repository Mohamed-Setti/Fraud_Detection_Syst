'use client';

import React, { useState } from "react";
import {
  FileText,
  Download,
  Calendar,
  Filter,
  TrendingUp,
  AlertTriangle,
  DollarSign,
  Activity,
} from "lucide-react";

export default function ReportGenerator() {
  // États principaux
  const [startDate, setStartDate] = useState("2024-11-01");
  const [endDate, setEndDate] = useState("2024-11-27");
  const [reportType, setReportType] = useState("summary");
  const [status, setStatus] = useState("all");
  const [format, setFormat] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [generated, setGenerated] = useState(false);

  // Statistiques mock
  const stats = {
    totalTransactions: 1247,
    suspiciousTransactions: 89,
    confirmedFraud: 23,
    totalAmount: 2847650.0,
    fraudAmount: 456890.0,
    detectionRate: 94.2,
  };

  // Génération de rapport
  const handleGenerate = (selectedFormat: string) => {
    setLoading(true);
    setFormat(selectedFormat);

    setTimeout(() => {
      setLoading(false);
      setGenerated(true);

      setTimeout(() => {
        setGenerated(false);
        alert(
          `Rapport ${selectedFormat.toUpperCase()} généré avec succès!\nPériode: ${startDate} → ${endDate}`
        );
      }, 1000);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <FileText className="w-8 h-8 text-blue-600" />
            Générateur de Rapport
          </h1>
          <p className="text-gray-600 mt-2">
            Générez des rapports détaillés avec statistiques et analyses.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Panel de configuration */}
          <div className="lg:col-span-2 space-y-6">
            {/* Sélection de la période */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-600" />
                Période du Rapport
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date de début
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date de fin
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Raccourcis de période */}
              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  onClick={() => {
                    const today = new Date();
                    const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
                    setStartDate(lastWeek.toISOString().split("T")[0]);
                    setEndDate(today.toISOString().split("T")[0]);
                  }}
                  className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
                >
                  7 derniers jours
                </button>
                <button
                  onClick={() => {
                    const today = new Date();
                    const lastMonth = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
                    setStartDate(lastMonth.toISOString().split("T")[0]);
                    setEndDate(today.toISOString().split("T")[0]);
                  }}
                  className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
                >
                  30 derniers jours
                </button>
                <button
                  onClick={() => {
                    const today = new Date();
                    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
                    setStartDate(firstDayOfMonth.toISOString().split("T")[0]);
                    setEndDate(today.toISOString().split("T")[0]);
                  }}
                  className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
                >
                  Ce mois
                </button>
              </div>
            </div>

            {/* Configuration du rapport */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Filter className="w-5 h-5 text-blue-600" />
                Configuration du Rapport
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Type de rapport
                  </label>
                  <select
                    value={reportType}
                    onChange={(e) => setReportType(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="summary">Résumé Exécutif</option>
                    <option value="detailed">Rapport Détaillé</option>
                    <option value="transactions">Liste des Transactions</option>
                    <option value="analytics">Analyse Statistique</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Statut des transactions
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">Toutes les transactions</option>
                    <option value="suspicious">Suspectes uniquement</option>
                    <option value="confirmed">Fraudes confirmées</option>
                    <option value="flagged">Signalées</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Export */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Download className="w-5 h-5 text-blue-600" />
                Générer le Rapport
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  onClick={() => handleGenerate("pdf")}
                  disabled={loading}
                  className="flex items-center justify-center gap-3 px-6 py-4 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white rounded-lg transition-colors font-medium"
                >
                  {loading && format === "pdf" ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Génération...
                    </>
                  ) : (
                    <>
                      <FileText className="w-5 h-5" />
                      Télécharger PDF
                    </>
                  )}
                </button>

                <button
                  onClick={() => handleGenerate("excel")}
                  disabled={loading}
                  className="flex items-center justify-center gap-3 px-6 py-4 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-lg transition-colors font-medium"
                >
                  {loading && format === "excel" ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Génération...
                    </>
                  ) : (
                    <>
                      <Download className="w-5 h-5" />
                      Télécharger Excel
                    </>
                  )}
                </button>
              </div>

              {generated && (
                <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-green-800 text-sm font-medium">
                    ✓ Rapport généré avec succès! Le téléchargement va commencer...
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Aperçu des statistiques */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Aperçu des Statistiques
              </h2>
              <div className="space-y-4">
                <StatCard
                  title="Total Transactions"
                  value={stats.totalTransactions}
                  icon={<Activity className="w-4 h-4 text-blue-600" />}
                  bg="bg-blue-50"
                />
                <StatCard
                  title="Suspectes"
                  value={stats.suspiciousTransactions}
                  percent={(stats.suspiciousTransactions / stats.totalTransactions) * 100}
                  icon={<AlertTriangle className="w-4 h-4 text-yellow-600" />}
                  bg="bg-yellow-50"
                />
                <StatCard
                  title="Fraudes Confirmées"
                  value={stats.confirmedFraud}
                  icon={<AlertTriangle className="w-4 h-4 text-red-600" />}
                  bg="bg-red-50"
                />
                <StatCard
                  title="Montant Total"
                  value={`$${stats.totalAmount.toLocaleString()}`}
                  icon={<DollarSign className="w-4 h-4 text-purple-600" />}
                  bg="bg-purple-50"
                />
                <StatCard
                  title="Montant Frauduleux"
                  value={`$${stats.fraudAmount.toLocaleString()}`}
                  icon={<DollarSign className="w-4 h-4 text-orange-600" />}
                  bg="bg-orange-50"
                />
                <StatCard
                  title="Taux de Détection"
                  value={`${stats.detectionRate}%`}
                  icon={<TrendingUp className="w-4 h-4 text-green-600" />}
                  bg="bg-green-50"
                />
              </div>
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-2">ℹ️ Information</h3>
              <p className="text-sm text-blue-800">
                Les rapports incluent toutes les transactions de la période sélectionnée avec des analyses détaillées et des graphiques.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Composant réutilisable pour les cartes statistiques
interface StatCardProps {
  title: string;
  value: number | string;
  percent?: number;
  icon: React.ReactNode;
  bg: string;
}

function StatCard({ title, value, percent, icon, bg }: StatCardProps) {
  return (
    <div className={`${bg} p-4 rounded-lg`}>
      <div className="flex items-center justify-between mb-2">{icon && icon}<span className="text-sm text-gray-600">{title}</span></div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      {percent && <p className="text-xs text-gray-500 mt-1">{percent.toFixed(1)}% du total</p>}
    </div>
  );
}
