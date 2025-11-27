'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { X, AlertCircle, CheckCircle, Info, AlertTriangle, Bell, Search, Filter, Trash2, CheckCheck, Clock } from 'lucide-react';

interface Alert {
  id: number;
  type: 'success' | 'critical' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}

export default function AlertesPage() {
  const [alerts, setAlerts] = useState<Alert[]>([
    { id: 1, type: 'critical', title: 'Erreur Système', message: 'Le serveur de base de données ne répond pas', timestamp: '2025-01-15 14:23', read: false },
    { id: 2, type: 'warning', title: 'Espace disque faible', message: 'Il reste moins de 10% d\'espace disponible', timestamp: '2025-01-15 13:45', read: false },
    { id: 3, type: 'success', title: 'Backup réussi', message: 'La sauvegarde quotidienne a été complétée avec succès', timestamp: '2025-01-15 12:00', read: true },
    { id: 4, type: 'info', title: 'Mise à jour disponible', message: 'Une nouvelle version du système est disponible', timestamp: '2025-01-15 10:30', read: false },
    { id: 5, type: 'critical', title: 'Tentative de connexion suspecte', message: 'Plusieurs tentatives échouées depuis une IP inconnue', timestamp: '2025-01-15 09:15', read: false },
    { id: 6, type: 'warning', title: 'Certificat SSL expire bientôt', message: 'Le certificat SSL expire dans 7 jours', timestamp: '2025-01-14 16:20', read: true },
  ]);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'success' | 'critical' | 'warning' | 'info'>('all');
  const [filterRead, setFilterRead] = useState<'all' | 'read' | 'unread'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'type' | 'status'>('date');
  const [showFilters, setShowFilters] = useState(false);

  const alertConfig = {
    success: { 
      icon: CheckCircle, 
      bgColor: 'bg-green-50', 
      borderColor: 'border-l-green-500', 
      textColor: 'text-green-800', 
      iconColor: 'text-green-500',
      badgeColor: 'bg-green-100 text-green-800'
    },
    critical: { 
      icon: AlertCircle, 
      bgColor: 'bg-red-50', 
      borderColor: 'border-l-red-500', 
      textColor: 'text-red-800', 
      iconColor: 'text-red-500',
      badgeColor: 'bg-red-100 text-red-800'
    },
    warning: { 
      icon: AlertTriangle, 
      bgColor: 'bg-yellow-50', 
      borderColor: 'border-l-yellow-500', 
      textColor: 'text-yellow-800', 
      iconColor: 'text-yellow-500',
      badgeColor: 'bg-yellow-100 text-yellow-800'
    },
    info: { 
      icon: Info, 
      bgColor: 'bg-blue-50', 
      borderColor: 'border-l-blue-500', 
      textColor: 'text-blue-800', 
      iconColor: 'text-blue-500',
      badgeColor: 'bg-blue-100 text-blue-800'
    },
  };

  const markAsRead = (id: number) => {
    setAlerts(alerts.map(a => a.id === id ? { ...a, read: true } : a));
  };

  const markAllAsRead = () => {
    setAlerts(alerts.map(a => ({ ...a, read: true })));
  };

  const removeAlert = (id: number) => {
    setAlerts(alerts.filter(a => a.id !== id));
  };

  const clearAllRead = () => {
    setAlerts(alerts.filter(a => !a.read));
  };

  const unreadCount = alerts.filter(a => !a.read).length;
  const criticalCount = alerts.filter(a => a.type === 'critical' && !a.read).length;

  const filteredAndSortedAlerts = useMemo(() => {
    let filtered = alerts.filter(a => {
      const matchesSearch = a.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           a.message.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = filterType === 'all' || a.type === filterType;
      const matchesRead = filterRead === 'all' || 
                         (filterRead === 'read' && a.read) || 
                         (filterRead === 'unread' && !a.read);
      return matchesSearch && matchesType && matchesRead;
    });

    // Tri
    filtered.sort((a, b) => {
      if (sortBy === 'date') {
        return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
      } else if (sortBy === 'type') {
        const typeOrder = { critical: 0, warning: 1, info: 2, success: 3 };
        return typeOrder[a.type] - typeOrder[b.type];
      } else { // status
        return a.read === b.read ? 0 : a.read ? 1 : -1;
      }
    });

    return filtered;
  }, [alerts, searchTerm, filterType, filterRead, sortBy]);

  // Statistiques
  const stats = {
    total: alerts.length,
    unread: unreadCount,
    critical: criticalCount,
    warning: alerts.filter(a => a.type === 'warning' && !a.read).length,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header avec statistiques */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex justify-between items-start mb-6">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="bg-blue-600 p-3 rounded-xl shadow-lg">
                  <Bell className="text-white" size={28} />
                </div>
                {unreadCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center shadow-lg animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Centre d'Alertes</h1>
                <p className="text-gray-600 mt-1">Gérez vos notifications et alertes système</p>
              </div>
            </div>
            
            <div className="flex gap-2">
              <button 
                onClick={markAllAsRead}
                disabled={unreadCount === 0}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center gap-2 font-medium"
              >
                <CheckCheck size={18} />
                Tout marquer comme lu
              </button>
              <button 
                onClick={clearAllRead}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors flex items-center gap-2 font-medium"
              >
                <Trash2 size={18} />
                Nettoyer les lues
              </button>
            </div>
          </div>

          {/* Statistiques */}
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-600 font-medium">Total</p>
                  <p className="text-2xl font-bold text-blue-900">{stats.total}</p>
                </div>
                <Bell className="text-blue-400" size={32} />
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-4 border border-orange-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-orange-600 font-medium">Non lues</p>
                  <p className="text-2xl font-bold text-orange-900">{stats.unread}</p>
                </div>
                <Clock className="text-orange-400" size={32} />
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-4 border border-red-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-red-600 font-medium">Critiques</p>
                  <p className="text-2xl font-bold text-red-900">{stats.critical}</p>
                </div>
                <AlertCircle className="text-red-400" size={32} />
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl p-4 border border-yellow-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-yellow-600 font-medium">Avertissements</p>
                  <p className="text-2xl font-bold text-yellow-900">{stats.warning}</p>
                </div>
                <AlertTriangle className="text-yellow-400" size={32} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filtres et recherche */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
          <div className="flex gap-4 items-center flex-wrap">
            <div className="flex-1 min-w-[300px] relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input 
                type="text" 
                placeholder="Rechercher dans les alertes..." 
                value={searchTerm} 
                onChange={e => setSearchTerm(e.target.value)} 
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" 
              />
            </div>
            
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-4 py-2.5 rounded-lg border transition-all flex items-center gap-2 font-medium ${showFilters ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}
            >
              <Filter size={18} />
              Filtres
            </button>
            
            <select 
              value={sortBy} 
              onChange={e => setSortBy(e.target.value as any)} 
              className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition-all font-medium"
            >
              <option value="date">Trier par date</option>
              <option value="type">Trier par type</option>
              <option value="status">Trier par statut</option>
            </select>
          </div>

          {showFilters && (
            <div className="mt-4 pt-4 border-t flex gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Type d'alerte</label>
                <select 
                  value={filterType} 
                  onChange={e => setFilterType(e.target.value as any)} 
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">Tous les types</option>
                  <option value="critical">Critique</option>
                  <option value="warning">Avertissement</option>
                  <option value="info">Info</option>
                  <option value="success">Succès</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Statut de lecture</label>
                <select 
                  value={filterRead} 
                  onChange={e => setFilterRead(e.target.value as any)} 
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">Toutes</option>
                  <option value="unread">Non lues</option>
                  <option value="read">Lues</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Liste des alertes */}
        <div className="space-y-3">
          {filteredAndSortedAlerts.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm p-12 text-center">
              <Info size={64} className="mx-auto mb-4 text-gray-300" />
              <p className="text-xl text-gray-500 font-medium">Aucune alerte trouvée</p>
              <p className="text-gray-400 mt-2">Essayez de modifier vos filtres de recherche</p>
            </div>
          ) : (
            filteredAndSortedAlerts.map(alert => {
              const config = alertConfig[alert.type];
              const Icon = config.icon;
              return (
                <div 
                  key={alert.id} 
                  className={`bg-white rounded-xl shadow-sm border-l-4 ${config.borderColor} overflow-hidden transition-all hover:shadow-md ${!alert.read ? 'ring-2 ring-blue-100' : 'opacity-75'}`}
                >
                  <div className="p-5">
                    <div className="flex items-start gap-4">
                      <div className={`${config.bgColor} p-3 rounded-lg`}>
                        <Icon className={config.iconColor} size={24} />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className={`font-bold text-lg ${config.textColor}`}>{alert.title}</h3>
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${config.badgeColor}`}>
                            {alert.type.toUpperCase()}
                          </span>
                          {!alert.read && (
                            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-500 text-white animate-pulse">
                              NOUVEAU
                            </span>
                          )}
                        </div>
                        <p className="text-gray-700 mb-3">{alert.message}</p>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Clock size={14} />
                          <span>{alert.timestamp}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {!alert.read && (
                          <button 
                            onClick={() => markAsRead(alert.id)} 
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium flex items-center gap-2"
                          >
                            <CheckCircle size={16} />
                            Marquer comme lu
                          </button>
                        )}
                        <button 
                          onClick={() => removeAlert(alert.id)} 
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <X size={20} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer avec résumé */}
        {filteredAndSortedAlerts.length > 0 && (
          <div className="mt-6 bg-white rounded-xl shadow-sm p-4 text-center text-gray-600">
            Affichage de <span className="font-bold text-gray-900">{filteredAndSortedAlerts.length}</span> alerte(s) sur <span className="font-bold text-gray-900">{alerts.length}</span>
          </div>
        )}
      </div>
    </div>
  );
}