'use client';

// login route to Dashboard selon le role et register route to Dashboard Client apres inscription

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Mail, Lock, User, Phone, CheckCircle, XCircle } from "lucide-react";

export default function AuthPage() {
  const router = useRouter();
  const [isRegisterActive, setIsRegisterActive] = useState(false);

  // Login state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginMessage, setLoginMessage] = useState("");
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Register state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [registerMessage, setRegisterMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Password strength
  const [passwordStrength, setPasswordStrength] = useState(0);

  const calculatePasswordStrength = (pass: string) => {
    let strength = 0;
    if (pass.length >= 8) strength++;
    if (/[a-z]/.test(pass) && /[A-Z]/.test(pass)) strength++;
    if (/\d/.test(pass)) strength++;
    if (/[^a-zA-Z\d]/.test(pass)) strength++;
    return strength;
  };

  const handlePasswordChange = (pass: string) => {
    setPassword(pass);
    setPasswordStrength(calculatePasswordStrength(pass));
  };
const handleLogin = async () => {
  setLoginMessage("");

  // Normaliser email
  const emailToSend = loginEmail.trim().toLowerCase();

  try {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: emailToSend, password: loginPassword }), // <-- ici
    });

    const data = await res.json();

    if (res.ok && data.token) {
      localStorage.setItem("user", JSON.stringify(data.user));
      localStorage.setItem("token", data.token);
      localStorage.setItem("account", JSON.stringify(data.compte));
      setLoginMessage("success");

      setTimeout(() => {
        router.push("/Pages/Client/Dashboard");
      }, 1000);
    } else {
      setLoginMessage(data.error || "Email ou mot de passe incorrect");
    }
  } catch (error) {
    console.error(error);
    setLoginMessage("Something went wrong. Please try again.");
  }
};



  const handleRegister = async () => {
    setRegisterMessage("");

    if (password !== confirmPassword) {
      setRegisterMessage("Passwords do not match");
      return;
    }

    // Plus de validation de force de mot de passe - tous les mots de passe sont acceptés

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, mobile, password }),
      });

      const data = await res.json();

      if (res.ok && data) {
        // Stocker userId et compteId créés
        // if (data.userId) localStorage.setItem("userId", data.userId);
        // if (data.compteId) localStorage.setItem("compteId", data.compteId);
        // if (data.user) localStorage.setItem("user", JSON.stringify(data.user));
        // if (data.token) localStorage.setItem("token", data.token);
        
        setRegisterMessage("success");
        localStorage.setItem("user", JSON.stringify(data.user));
        localStorage.setItem("accountID", data.compteId);
        localStorage.setItem("token", data.token);
        
        // Redirection après 1 seconde
        setTimeout(() => {
          router.push("/Pages/Client/Dashboard");
        }, 1000);
      } else {
        setRegisterMessage(data.error || "Registration failed");
      }
    } catch (error) {
      console.error(error);
      setRegisterMessage("Something went wrong. Please try again.");
    }
  };

  const getPasswordStrengthColor = () => {
    if (passwordStrength === 0) return "bg-gray-300";
    if (passwordStrength === 1) return "bg-red-500";
    if (passwordStrength === 2) return "bg-yellow-500";
    if (passwordStrength === 3) return "bg-blue-500";
    return "bg-green-500";
  };

  const getPasswordStrengthText = () => {
    if (passwordStrength === 0) return "";
    if (passwordStrength === 1) return "Faible";
    if (passwordStrength === 2) return "Moyen";
    if (passwordStrength === 3) return "Bon";
    return "Excellent";
  };

  return (
    <div className="relative flex min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>
        <div className="absolute -bottom-40 -right-40 w-80 h-80 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse" style={{animationDelay: '2s'}}></div>
      </div>

      {/* Left: Login Form */}
      <div className={`w-1/2 flex flex-col justify-center items-center p-10 z-10 transition-all duration-700 ${isRegisterActive ? 'opacity-50' : 'opacity-100'}`}>
        <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md transform transition-all duration-500 hover:scale-[1.02]">
          <div className="flex justify-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-900 to-blue-700 rounded-full flex items-center justify-center shadow-lg">
              <span className="text-white text-3xl font-bold">L</span>
            </div>
          </div>
          
          <h2 className="text-3xl font-bold text-gray-800 mb-2 text-center">Bienvenue</h2>
          <p className="text-gray-500 text-center mb-8">Connectez-vous à votre compte</p>
          
          <div className="space-y-5">
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="email"
                placeholder="Adresse email"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                className="w-full pl-12 pr-4 py-3 rounded-lg bg-gray-50 border border-gray-200 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>
            
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type={showLoginPassword ? "text" : "password"}
                placeholder="Mot de passe"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                className="w-full pl-12 pr-12 py-3 rounded-lg bg-gray-50 border border-gray-200 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
              <button
                type="button"
                onClick={() => setShowLoginPassword(!showLoginPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showLoginPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center text-gray-600 cursor-pointer">
                <input type="checkbox" className="mr-2 rounded" />
                Se souvenir de moi
              </label>
              <a href="#" className="text-blue-600 hover:text-blue-800 transition">Mot de passe oublié?</a>
            </div>

            {loginMessage && (
              <div className={`flex items-center gap-2 p-3 rounded-lg ${loginMessage === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                {loginMessage === 'success' ? <CheckCircle className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                <span className="text-sm">
                  {loginMessage === 'success' ? 'Connexion réussie!' : 'Email ou mot de passe incorrect'}
                </span>
              </div>
            )}

            <button 
              onClick={handleLogin}
              className="w-full py-3 bg-gradient-to-r from-blue-900 to-blue-700 text-white rounded-lg font-semibold hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200"
            >
              Se connecter
            </button>
          </div>
        </div>
      </div>

      {/* Right: Register Form */}
      <div className={`w-1/2 flex flex-col justify-center items-center p-10 z-10 transition-all duration-700 ${!isRegisterActive ? 'opacity-50' : 'opacity-100'}`}>
        <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md transform transition-all duration-500 hover:scale-[1.02]">
          <div className="flex justify-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-900 to-blue-700 rounded-full flex items-center justify-center shadow-lg">
              <span className="text-white text-3xl font-bold">R</span>
            </div>
          </div>
          
          <h2 className="text-3xl font-bold text-gray-800 mb-2 text-center">Créer un compte</h2>
          <p className="text-gray-500 text-center mb-8">Rejoignez-nous dès aujourd&apos;hui</p>
          
          <div className="space-y-4">
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Nom complet"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-lg bg-gray-50 border border-gray-200 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>
            
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="email"
                placeholder="Adresse email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-lg bg-gray-50 border border-gray-200 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>
            
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="tel"
                placeholder="Numéro de téléphone"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-lg bg-gray-50 border border-gray-200 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>
            
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Mot de passe"
                value={password}
                onChange={(e) => handlePasswordChange(e.target.value)}
                className="w-full pl-12 pr-12 py-3 rounded-lg bg-gray-50 border border-gray-200 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            {password && (
              <div className="space-y-2">
                <div className="flex gap-1">
                  {[1, 2, 3, 4].map((level) => (
                    <div
                      key={level}
                      className={`h-1 flex-1 rounded-full transition-all ${
                        level <= passwordStrength ? getPasswordStrengthColor() : 'bg-gray-200'
                      }`}
                    />
                  ))}
                </div>
                {passwordStrength > 0 && (
                  <p className="text-xs text-gray-600">
                    Force du mot de passe: <span className="font-semibold">{getPasswordStrengthText()}</span>
                  </p>
                )}
              </div>
            )}
            
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirmer le mot de passe"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleRegister()}
                className="w-full pl-12 pr-12 py-3 rounded-lg bg-gray-50 border border-gray-200 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            {registerMessage && (
              <div className={`flex items-center gap-2 p-3 rounded-lg ${registerMessage === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                {registerMessage === 'success' ? <CheckCircle className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                <span className="text-sm">
                  {registerMessage === 'success' ? 'Inscription réussie!' : registerMessage}
                </span>
              </div>
            )}

            <button 
              onClick={handleRegister}
              className="w-full py-3 bg-gradient-to-r from-blue-900 to-blue-700 text-white rounded-lg font-semibold hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200"
            >
              S&apos;inscrire
            </button>

            <p className="text-xs text-gray-500 text-center">
              En vous inscrivant, vous acceptez nos{' '}
              <a href="#" className="text-blue-600 hover:underline">conditions d&apos;utilisation</a>
            </p>
          </div>
        </div>
      </div>

      {/* Sliding Cover */}
      <div
        onClick={() => setIsRegisterActive(!isRegisterActive)}
        className="absolute top-0 left-0 h-full w-1/2 z-20 flex flex-col items-center justify-center cursor-pointer transition-all duration-700 hover:shadow-2xl"
        style={{
          background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
          transform: isRegisterActive ? 'translateX(100%)' : 'translateX(0)',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)'
        }}
      >
        <div className="text-center px-8 transform transition-all duration-500 hover:scale-105">
          <h2 className="text-5xl font-bold text-white mb-6 drop-shadow-lg">
            {isRegisterActive ? "Déjà membre?" : "Nouveau ici?"}
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-sm">
            {isRegisterActive
              ? "Connectez-vous pour accéder à votre espace personnel"
              : "Créez un compte pour profiter de tous nos services"}
          </p>
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-white/20 backdrop-blur-sm rounded-full text-white border-2 border-white/30 hover:bg-white/30 transition-all">
            <span className="font-semibold">
              {isRegisterActive ? "Se connecter" : "S'inscrire"}
            </span>
            <span className="text-2xl">→</span>
          </div>
        </div>
        
        {/* Decorative circles */}
        <div className="absolute top-10 right-10 w-20 h-20 border-4 border-white/30 rounded-full"></div>
        <div className="absolute bottom-10 left-10 w-32 h-32 border-4 border-white/20 rounded-full"></div>
      </div>
    </div>
  );
}