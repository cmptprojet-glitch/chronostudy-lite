import React, { useState } from 'react';
import { X, User, Lock, Mail, ShieldCheck, CheckCircle2, LogOut, ArrowRight, Sparkles, RefreshCw } from 'lucide-react';
import { UserSettings } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  userSettings: UserSettings;
  onUpdateUserSettings: (updated: UserSettings) => void;
  onLogout?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  userSettings,
  onUpdateUserSettings,
  onLogout,
}) => {
  const [mode, setMode] = useState<'signin' | 'signup' | 'profile'>('signin');
  const [emailInput, setEmailInput] = useState(userSettings.profile.email);
  const [passwordInput, setPasswordInput] = useState('');
  const [nameInput, setNameInput] = useState(userSettings.profile.name);
  const [roleInput, setRoleInput] = useState(userSettings.profile.role);
  const [isLoading, setIsLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const handleEmailAuth = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      const nameParts = (mode === 'signup' ? nameInput : userSettings.profile.name).trim().split(' ');
      let derivedInitials = 'JD';
      if (nameParts.length >= 2) {
        derivedInitials = (nameParts[0][0] + nameParts[nameParts.length - 1][0]).toUpperCase();
      } else if (nameParts.length === 1 && nameParts[0].length > 0) {
        derivedInitials = nameParts[0].substring(0, 2).toUpperCase();
      }

      const updated: UserSettings = {
        ...userSettings,
        profile: {
          name: mode === 'signup' ? nameInput : userSettings.profile.name || 'Julien Dupont',
          email: emailInput,
          role: roleInput || userSettings.profile.role,
          avatarInitials: derivedInitials,
        },
      };

      onUpdateUserSettings(updated);
      setSuccessMsg(mode === 'signin' ? 'Connexion réussie !' : 'Compte créé avec succès !');
      setTimeout(() => {
        setSuccessMsg('');
        onClose();
      }, 1200);
    }, 800);
  };

  const handleGoogleAuth = () => {
    setGoogleLoading(true);
    setTimeout(() => {
      setGoogleLoading(false);
      const googleUser = {
        name: 'Julien Dupont (Google)',
        email: emailInput || 'julien.dupont@gmail.com',
        role: 'Étudiant Master Google Workspace Sync',
        avatarInitials: 'JD',
      };

      const updated: UserSettings = {
        ...userSettings,
        profile: googleUser,
        integrations: {
          ...userSettings.integrations,
          gcalConnected: true,
        },
      };

      onUpdateUserSettings(updated);
      setSuccessMsg('Connecté avec Google Workspace !');
      setTimeout(() => {
        setSuccessMsg('');
        onClose();
      }, 1200);
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in select-none">
      <div className="bg-white dark:bg-zinc-900 text-[#161922] dark:text-slate-100 rounded-3xl w-full max-w-md border border-slate-100 dark:border-zinc-800 shadow-2xl overflow-hidden flex flex-col">
        
        {/* HEADER */}
        <div className="p-5 bg-[#161922] text-white flex items-center justify-between border-b border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#EFFDE2] text-[#161922] rounded-2xl flex items-center justify-center font-black">
              <ShieldCheck className="w-5 h-5 text-[#161922]" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-white">Espace Authentification</h3>
              <p className="text-xs text-slate-300">Compte ChronoStudy • Synchronisation et Profil</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* BODY */}
        <div className="p-6 space-y-5">
          {successMsg && (
            <div className="p-3 bg-[#EFFDE2] text-[#161922] border border-[#D4F94E] rounded-2xl text-xs font-bold text-center flex items-center justify-center gap-2 animate-fade-in">
              <CheckCircle2 className="w-4 h-4 text-[#65A30D]" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* CURRENT ACCOUNT STATUS BADGE */}
          <div className="p-4 bg-[#F5F6FA] dark:bg-zinc-800/80 rounded-2xl border border-slate-200 dark:border-zinc-700 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 bg-[#D4F94E] text-[#161922] rounded-2xl flex items-center justify-center font-black text-sm shadow-xs">
                {userSettings.profile.avatarInitials}
              </div>
              <div className="min-w-0">
                <p className="font-extrabold text-sm text-[#161922] dark:text-white truncate">
                  {userSettings.profile.name}
                </p>
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 truncate">
                  {userSettings.profile.email}
                </p>
              </div>
            </div>
            <span className="text-[10px] font-black bg-[#EFFDE2] text-[#65A30D] dark:bg-zinc-700 dark:text-[#D4F94E] px-2.5 py-1 rounded-full border border-[#D4F94E]/50 shrink-0">
              Actif
            </span>
          </div>

          {/* GOOGLE SIGN-IN BUTTON */}
          <button
            type="button"
            onClick={handleGoogleAuth}
            disabled={googleLoading}
            className="w-full py-3 px-4 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 hover:border-[#D4F94E] text-[#161922] dark:text-white rounded-2xl font-extrabold text-xs transition-all shadow-xs flex items-center justify-center gap-3 cursor-pointer"
          >
            {googleLoading ? (
              <RefreshCw className="w-4 h-4 animate-spin text-slate-600" />
            ) : (
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
            )}
            <span>Continuer avec Google Workspace</span>
          </button>

          <div className="relative flex items-center justify-center my-2">
            <span className="w-full border-t border-slate-200 dark:border-zinc-800" />
            <span className="absolute bg-white dark:bg-zinc-900 px-3 text-[10px] font-black text-slate-400 uppercase tracking-wider">
              ou par email
            </span>
          </div>

          {/* TABS SELECTOR */}
          <div className="flex bg-slate-100 dark:bg-zinc-800 p-1 rounded-xl">
            <button
              onClick={() => setMode('signin')}
              className={`flex-1 py-1.5 text-xs font-extrabold rounded-lg transition-all cursor-pointer ${
                mode === 'signin'
                  ? 'bg-[#D4F94E] text-[#161922] shadow-xs'
                  : 'text-slate-500 hover:text-black dark:hover:text-white'
              }`}
            >
              Se Connecter
            </button>
            <button
              onClick={() => setMode('signup')}
              className={`flex-1 py-1.5 text-xs font-extrabold rounded-lg transition-all cursor-pointer ${
                mode === 'signup'
                  ? 'bg-[#D4F94E] text-[#161922] shadow-xs'
                  : 'text-slate-500 hover:text-black dark:hover:text-white'
              }`}
            >
              Créer un Compte
            </button>
          </div>

          <form onSubmit={handleEmailAuth} className="space-y-3.5">
            {mode === 'signup' && (
              <>
                <div>
                  <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300 block mb-1">
                    Nom Complet
                  </label>
                  <input
                    type="text"
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    required
                    placeholder="ex: Alex Martin"
                    className="w-full bg-[#F5F6FA] dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl px-3.5 py-2 text-xs font-bold text-[#161922] dark:text-white outline-none focus:ring-2 focus:ring-[#D4F94E]"
                  />
                </div>

                <div>
                  <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300 block mb-1">
                    Statut / Université / Spécialité
                  </label>
                  <input
                    type="text"
                    value={roleInput}
                    onChange={(e) => setRoleInput(e.target.value)}
                    placeholder="ex: Master Informatique"
                    className="w-full bg-[#F5F6FA] dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl px-3.5 py-2 text-xs font-bold text-[#161922] dark:text-white outline-none focus:ring-2 focus:ring-[#D4F94E]"
                  />
                </div>
              </>
            )}

            <div>
              <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300 block mb-1">
                Adresse Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  required
                  placeholder="nom@domaine.com"
                  className="w-full bg-[#F5F6FA] dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl pl-9 pr-3.5 py-2 text-xs font-bold text-[#161922] dark:text-white outline-none focus:ring-2 focus:ring-[#D4F94E]"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300 block mb-1">
                Mot de Passe
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full bg-[#F5F6FA] dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl pl-9 pr-3.5 py-2 text-xs font-bold text-[#161922] dark:text-white outline-none focus:ring-2 focus:ring-[#D4F94E]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 bg-[#D4F94E] hover:bg-[#CBF33B] text-[#161922] rounded-xl font-black text-xs shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {isLoading ? (
                <RefreshCw className="w-4 h-4 animate-spin text-[#161922]" />
              ) : (
                <>
                  <span>{mode === 'signin' ? 'Se Connecter' : 'S\'inscrire & Démarrer'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* LOGOUT BUTTON */}
          {onLogout && (
            <div className="pt-3 border-t border-slate-200 dark:border-zinc-800">
              <button
                type="button"
                onClick={() => {
                  if (onLogout) onLogout();
                  onClose();
                }}
                className="w-full py-2 bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <LogOut className="w-4 h-4 text-rose-600" />
                <span>Déconnexion / Changer de session</span>
              </button>
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div className="p-4 bg-[#F5F6FA] dark:bg-zinc-800/50 border-t border-slate-200 dark:border-zinc-800 text-center text-[11px] font-bold text-slate-500">
          ChronoStudy Security • Conforme GDPR & Cryptage Sécurisé
        </div>

      </div>
    </div>
  );
};
