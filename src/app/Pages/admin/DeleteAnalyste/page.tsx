// ========================================
// FICHIER: app/admin/RegistreAnalyste/DeleteAnalyste/page.tsx
// ========================================

'use client'

import React, { useState, useEffect } from 'react'
import { Trash2, AlertTriangle, Search, X, Loader2, RefreshCw } from 'lucide-react'
import Image from 'next/image'

interface Analyst {
  id: number
  name: string
  email: string
  mobile: string
  role?: string
  createdAt?: string
}

export default function DeleteAnalystePage() {
  const [analysts, setAnalysts] = useState<Analyst[]>([])
  const [filteredAnalysts, setFilteredAnalysts] = useState<Analyst[]>([])
  const [selectedAnalyst, setSelectedAnalyst] = useState<Analyst | null>(null)
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [deleteSuccess, setDeleteSuccess] = useState(false)
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState('')

  // Récupérer les analystes au chargement
  useEffect(() => {
    fetchAnalysts()
  }, [])

  // Filtrer selon la recherche
  useEffect(() => {
    const filtered = analysts.filter(analyst =>
      analyst.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      analyst.email.toLowerCase().includes(searchTerm.toLowerCase())
    )
    setFilteredAnalysts(filtered)
  }, [searchTerm, analysts])

  const fetchAnalysts = async () => {
    try {
      setLoading(true)
      setError('')

      const token = localStorage.getItem('token')

      if (!token) {
        setError('Non authentifié. Veuillez vous connecter.')
        setLoading(false)
        return
      }

      const response = await fetch('/api/analysts', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      const data = await response.json()

      if (data.success) {
        setAnalysts(data.analysts || [])
      } else {
        setError(data.message || 'Erreur lors du chargement des analystes')
      }
    } catch (err) {
      setError('Erreur de connexion au serveur')
      console.error('Fetch error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteClick = (analyst: Analyst) => {
    setSelectedAnalyst(analyst)
    setShowConfirmation(true)
  }

  const handleConfirmDelete = async () => {
    if (!selectedAnalyst) return

    try {
      setDeleting(true)
      const token = localStorage.getItem('token')

      const response = await fetch(`/api/analysts/${selectedAnalyst.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      const data = await response.json()

      if (data.success || response.ok) {
        // Retirer l'analyste de la liste
        setAnalysts(prev => prev.filter(a => a.id !== selectedAnalyst.id))
        setDeleteSuccess(true)
        setShowConfirmation(false)

        setTimeout(() => {
          setDeleteSuccess(false)
          setSelectedAnalyst(null)
        }, 3000)
      } else {
        alert(data.error || data.message || 'Erreur lors de la suppression')
      }
    } catch (err) {
      console.error('Delete error:', err)
      alert('Erreur de connexion au serveur')
    } finally {
      setDeleting(false)
    }
  }

  const handleCancelDelete = () => {
    setShowConfirmation(false)
    setSelectedAnalyst(null)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="animate-spin text-indigo-600" size={48} />
          <span className="text-xl text-gray-600">Chargement des analystes...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-red-50 border border-red-200 text-red-700 p-8 rounded-2xl max-w-md w-full text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
              <AlertTriangle className="text-red-600" size={32} />
            </div>
          </div>
          <h3 className="font-bold text-xl mb-2">Erreur</h3>
          <p className="mb-4">{error}</p>
          <button
            onClick={fetchAnalysts}
            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition flex items-center gap-2 mx-auto"
          >
            <RefreshCw size={18} />
            Réessayer
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header avec Logo */}
        <div className="flex items-center gap-4 mb-8">
          <Image src="/Logo.png" alt="Logo" width={60} height={60} />
          <h1 className="text-4xl font-bold text-gray-900">Supprimer un Analyste</h1>
        </div>

        {/* Success Message */}
        {deleteSuccess && (
          <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-xl flex items-center gap-3 shadow-md animate-fade-in">
            <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white font-bold">
              ✓
            </div>
            <span className="font-semibold">Analyste supprimé avec succès!</span>
          </div>
        )}

        {/* Search Bar */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              placeholder="Rechercher par nom ou email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            )}
          </div>
        </div>

        {/* Liste des analystes */}
        <div className="bg-white rounded-2xl shadow-xl p-6">
          {filteredAnalysts.length === 0 ? (
            <p className="text-gray-500 text-center">Aucun analyste trouvé.</p>
          ) : (
            <ul className="divide-y divide-gray-200">
              {filteredAnalysts.map((analyst) => (
                <li key={analyst.id} className="flex justify-between items-center py-4">
                  <div>
                    <p className="font-semibold text-gray-900">{analyst.name}</p>
                    <p className="text-gray-600 text-sm">{analyst.email}</p>
                  </div>
                  <button
                    onClick={() => handleDeleteClick(analyst)}
                    className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                  >
                    <Trash2 size={18} />
                    Supprimer
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Confirmation Modal */}
        {showConfirmation && selectedAnalyst && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white p-6 rounded-xl shadow-lg max-w-sm w-full">
              <h2 className="text-lg font-bold mb-4">Confirmer la suppression</h2>
              <p>
                Voulez-vous vraiment supprimer <strong>{selectedAnalyst.name}</strong> ?
              </p>
              <div className="flex gap-4 mt-6">
                <button
                  onClick={handleConfirmDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg"
                  disabled={deleting}
                >
                  {deleting ? 'Suppression...' : 'Oui, supprimer'}
                </button>
                <button
                  onClick={handleCancelDelete}
                  className="px-4 py-2 bg-gray-300 rounded-lg"
                >
                  Annuler
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
