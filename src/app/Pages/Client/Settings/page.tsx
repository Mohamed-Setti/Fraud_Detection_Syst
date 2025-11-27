"use client";
import React, { useEffect, useState } from "react";
import { User, Mail, Phone, Lock, Eye, EyeOff, Shield, Bell, Save, CheckCircle, XCircle, AlertCircle } from "lucide-react";

type UserType = {
  name: string;
  email: string;
  mobile: string;
};

export default function Settings() {
  const [user, setUser] = useState<UserType | null>(null);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [showPasswordFields, setShowPasswordFields] = useState(false);
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    mobile: "",
    oldPassword: "",
    password: "",
  });

  const [errors, setErrors] = useState({
    name: "",
    email: "",
    mobile: "",
    oldPassword: "",
    password: "",
  });

  useEffect(() => {
    // Simulation de chargement des données utilisateur
    const mockUser = {
      name: "Jean Dupont",
      email: "jean.dupont@example.com",
      mobile: "+216 98 765 432"
    };

    setTimeout(() => {
      setUser(mockUser);
      setForm({
        name: mockUser.name,
        email: mockUser.email,
        mobile: mockUser.mobile,
        oldPassword: "",
        password: "",
      });
    }, 500);
  }, []);

  const validateForm = () => {
    const newErrors = {
      name: "",
      email: "",
      mobile: "",
      oldPassword: "",
      password: "",
    };

    if (!form.name.trim()) {
      newErrors.name = "Le nom est requis";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      newErrors.email = "Email invalide";
    }

    const mobileRegex = /^[+]?[\d\s-]{8,}$/;
    if (!mobileRegex.test(form.mobile)) {
      newErrors.mobile = "Numéro de téléphone invalide";
    }

    if (showPasswordFields) {
      if (!form.oldPassword) {
        newErrors.oldPassword = "Ancien mot de passe requis";
      }
      if (!form.password) {
        newErrors.password = "Nouveau mot de passe requis";
      } else if (form.password.length < 6) {
        newErrors.password = "Le mot de passe doit contenir au moins 6 caractères";
      }
    }

    setErrors(newErrors);
    return !Object.values(newErrors).some(error => error !== "");
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    setErrors({ ...errors, [name]: "" });
  };

  const handleUpdate = async () => {
    if (!validateForm()) {
      setMessage({ text: "Veuillez corriger les erreurs", type: "error" });
      return;
    }

    setLoading(true);
    
    // Simulation d'appel API
    setTimeout(() => {
      try {
        const updateBody: {
          name: string;
          email: string;
          mobile: string;
          oldPassword?: string;
          password?: string;
        } = {
          name: form.name,
          email: form.email,
          mobile: form.mobile,
        };

        if (showPasswordFields && form.password) {
          updateBody.oldPassword = form.oldPassword;
          updateBody.password = form.password;
        }

        // Mise à jour de l'utilisateur
        const updatedUser = {
          name: form.name,
          email: form.email,
          mobile: form.mobile,
        };
        
        setUser(updatedUser);
        
        // Réinitialiser les champs de mot de passe
        setForm({
          ...form,
          oldPassword: "",
          password: "",
        });
        setShowPasswordFields(false);
        
        setMessage({ text: "Modifications enregistrées avec succès!", type: "success" });
        setLoading(false);
      } catch (error) {
        console.error("Update error:", error);
        setMessage({ text: "Erreur lors de la mise à jour", type: "error" });
        setLoading(false);
      }
    }, 1000);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8">
      <div className="max-w-4xl mx-auto px-6">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex items-center gap-4">
            <div className="bg-blue-600 p-4 rounded-xl">
              <User className="text-white" size={32} />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Paramètres du compte</h1>
              <p className="text-gray-600 mt-1">Gérez vos informations personnelles et votre sécurité</p>
            </div>
          </div>
        </div>

        {/* Message de statut */}
        {message.text && (
          <div className={`rounded-xl p-4 mb-6 flex items-center gap-3 ${
            message.type === "success" ? "bg-green-50 text-green-800 border border-green-200" :
            message.type === "error" ? "bg-red-50 text-red-800 border border-red-200" :
            "bg-blue-50 text-blue-800 border border-blue-200"
          }`}>
            {message.type === "success" && <CheckCircle size={24} />}
            {message.type === "error" && <XCircle size={24} />}
            {message.type === "info" && <AlertCircle size={24} />}
            <span className="font-medium">{message.text}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Formulaire principal */}
          <div className="lg:col-span-2 space-y-6">
            {/* Informations personnelles */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <User size={24} className="text-blue-600" />
                Informations personnelles
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nom complet
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      name="name"
                      type="text"
                      value={form.name}
                      onChange={handleChange}
                      className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                        errors.name ? "border-red-500" : "border-gray-300"
                      }`}
                      placeholder="Votre nom complet"
                    />
                  </div>
                  {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      name="email"
                      type="email"
                      value={form.email}
                      onChange={handleChange}
                      className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                        errors.email ? "border-red-500" : "border-gray-300"
                      }`}
                      placeholder="votre.email@example.com"
                    />
                  </div>
                  {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Téléphone
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      name="mobile"
                      type="text"
                      value={form.mobile}
                      onChange={handleChange}
                      className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                        errors.mobile ? "border-red-500" : "border-gray-300"
                      }`}
                      placeholder="+216 XX XXX XXX"
                    />
                  </div>
                  {errors.mobile && <p className="text-red-500 text-sm mt-1">{errors.mobile}</p>}
                </div>
              </div>
            </div>

            {/* Sécurité */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Shield size={24} className="text-blue-600" />
                Sécurité
              </h2>

              <div className="mb-4">
                <button
                  onClick={() => setShowPasswordFields(!showPasswordFields)}
                  className={`w-full py-3 px-4 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
                    showPasswordFields 
                      ? "bg-gray-200 text-gray-700 hover:bg-gray-300" 
                      : "bg-blue-600 text-white hover:bg-blue-700"
                  }`}
                >
                  <Lock size={20} />
                  {showPasswordFields ? "Annuler le changement de mot de passe" : "Changer le mot de passe"}
                </button>
              </div>

              {showPasswordFields && (
                <div className="space-y-4 animate-in fade-in duration-300">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ancien mot de passe
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                      <input
                        name="oldPassword"
                        type={showOldPassword ? "text" : "password"}
                        value={form.oldPassword}
                        onChange={handleChange}
                        className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                          errors.oldPassword ? "border-red-500" : "border-gray-300"
                        }`}
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowOldPassword(!showOldPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showOldPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                    {errors.oldPassword && <p className="text-red-500 text-sm mt-1">{errors.oldPassword}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nouveau mot de passe
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                      <input
                        name="password"
                        type={showNewPassword ? "text" : "password"}
                        value={form.password}
                        onChange={handleChange}
                        className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                          errors.password ? "border-red-500" : "border-gray-300"
                        }`}
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                    {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
                    <p className="text-gray-500 text-xs mt-1">Minimum 6 caractères</p>
                  </div>
                </div>
              )}
            </div>

            {/* Bouton de sauvegarde */}
            <button
              onClick={handleUpdate}
              disabled={loading}
              className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-blue-700 transition-all flex items-center justify-center gap-3 shadow-lg hover:shadow-xl disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Enregistrement...
                </>
              ) : (
                <>
                  <Save size={24} />
                  Enregistrer les modifications
                </>
              )}
            </button>
          </div>

          {/* Panneau latéral */}
          <div className="space-y-6">
            {/* Carte de profil */}
            <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl shadow-lg p-6 text-white">
              <div className="text-center">
                <div className="bg-white bg-opacity-20 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <User size={40} />
                </div>
                <h3 className="text-xl font-bold mb-1">{user.name}</h3>
                <p className="text-blue-100 text-sm">{user.email}</p>
                <div className="mt-4 pt-4 border-t border-blue-500">
                  <p className="text-blue-100 text-xs">Membre depuis</p>
                  <p className="font-semibold">Janvier 2025</p>
                </div>
              </div>
            </div>

            {/* Conseils de sécurité */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Shield size={20} className="text-blue-600" />
                Conseils de sécurité
              </h3>
              <ul className="space-y-3 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <CheckCircle size={16} className="text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Utilisez un mot de passe fort et unique</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle size={16} className="text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Changez votre mot de passe régulièrement</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle size={16} className="text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Vérifiez vos informations de contact</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle size={16} className="text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Ne partagez jamais vos identifiants</span>
                </li>
              </ul>
            </div>

            {/* Notifications */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Bell size={20} className="text-blue-600" />
                Préférences
              </h3>
              <div className="space-y-3">
                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-sm text-gray-700">Notifications email</span>
                  <input type="checkbox" defaultChecked className="toggle" />
                </label>
                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-sm text-gray-700">Alertes de sécurité</span>
                  <input type="checkbox" defaultChecked className="toggle" />
                </label>
                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-sm text-gray-700">Newsletter</span>
                  <input type="checkbox" className="toggle" />
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}