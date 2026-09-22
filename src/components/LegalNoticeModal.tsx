import React, { useState } from 'react';
import { X, Shield, Lock, FileText, Database, CheckCircle2, AlertTriangle, Sparkles, Scale } from 'lucide-react';

interface LegalNoticeModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'legal' | 'privacy' | 'ai' | 'cookies';
}

export const LegalNoticeModal: React.FC<LegalNoticeModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'privacy',
}) => {
  const [activeTab, setActiveTab] = useState<'legal' | 'privacy' | 'ai' | 'cookies'>(initialTab);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in select-none">
      <div className="bg-white dark:bg-zinc-900 text-[#161922] dark:text-slate-100 rounded-3xl w-full max-w-2xl border border-slate-200 dark:border-zinc-800 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        
        {/* HEADER */}
        <div className="p-5 bg-[#161922] text-white flex items-center justify-between border-b border-zinc-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#D4F94E] text-[#161922] rounded-2xl flex items-center justify-center font-black">
              <Scale className="w-5 h-5 text-[#161922]" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-white">Transparence, Sécurité & RGPD</h3>
              <p className="text-xs text-slate-300">Mentions Légales, Politique de Confidentialité & Gouvernance IA</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* TABS NAVIGATION */}
        <div className="flex border-b border-slate-200 dark:border-zinc-800 bg-[#F5F6FA] dark:bg-zinc-800/40 p-2 gap-1 shrink-0 overflow-x-auto">
          <button
            onClick={() => setActiveTab('privacy')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'privacy'
                ? 'bg-white dark:bg-zinc-900 text-[#161922] dark:text-white shadow-xs border border-slate-200 dark:border-zinc-700'
                : 'text-slate-600 dark:text-slate-400 hover:text-[#161922] dark:hover:text-white'
            }`}
          >
            <Shield className="w-4 h-4 text-[#65A30D]" />
            <span>Données & RGPD</span>
          </button>

          <button
            onClick={() => setActiveTab('ai')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'ai'
                ? 'bg-white dark:bg-zinc-900 text-[#161922] dark:text-white shadow-xs border border-slate-200 dark:border-zinc-700'
                : 'text-slate-600 dark:text-slate-400 hover:text-[#161922] dark:hover:text-white'
            }`}
          >
            <Sparkles className="w-4 h-4 text-purple-500" />
            <span>Transparence IA</span>
          </button>

          <button
            onClick={() => setActiveTab('cookies')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'cookies'
                ? 'bg-white dark:bg-zinc-900 text-[#161922] dark:text-white shadow-xs border border-slate-200 dark:border-zinc-700'
                : 'text-slate-600 dark:text-slate-400 hover:text-[#161922] dark:hover:text-white'
            }`}
          >
            <Database className="w-4 h-4 text-blue-500" />
            <span>Stockage & Cookies</span>
          </button>

          <button
            onClick={() => setActiveTab('legal')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'legal'
                ? 'bg-white dark:bg-zinc-900 text-[#161922] dark:text-white shadow-xs border border-slate-200 dark:border-zinc-700'
                : 'text-slate-600 dark:text-slate-400 hover:text-[#161922] dark:hover:text-white'
            }`}
          >
            <FileText className="w-4 h-4 text-slate-500" />
            <span>Mentions Légales (LCEN)</span>
          </button>
        </div>

        {/* CONTENT BODY */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs leading-relaxed text-slate-700 dark:text-slate-300">
          
          {/* TAB 1: PRIVACY & GDPR */}
          {activeTab === 'privacy' && (
            <div className="space-y-4">
              <div className="p-4 bg-[#EFFDE2] dark:bg-zinc-800 border border-[#D4F94E] rounded-2xl flex items-start gap-3 text-slate-800 dark:text-slate-200">
                <Shield className="w-5 h-5 text-[#65A30D] shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-extrabold text-sm text-[#161922] dark:text-white">Engagement de Respect de la Vie Privée</h4>
                  <p className="mt-1 text-xs">
                    ChronoStudy applique les principes de minimisation des données (Art. 5 RGPD). Aucune donnée scolaire n'est commercialisée, louée ou transmise à des régies publicitaires.
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <h5 className="font-extrabold text-xs uppercase tracking-wider text-[#161922] dark:text-white">
                  1. Données Traitées & Finalités
                </h5>
                <p>
                  Les données traitées comprennent votre profil d'étude (nom, email de compte, préférences), vos fiches de flashcards, vos tâches, vos synthèses de cours et vos journaux de session Pomodoro. La finalité unique est de fournir vos outils d'apprentissage actif et d'organisation universitaire.
                </p>
              </div>

              <div className="space-y-2">
                <h5 className="font-extrabold text-xs uppercase tracking-wider text-[#161922] dark:text-white">
                  2. Durée de Conservation & Droits (Articles 15 à 21 RGPD)
                </h5>
                <ul className="list-disc pl-5 space-y-1">
                  <li><strong>Droit d'accès & de portabilité (Art. 20) :</strong> Vous pouvez à tout moment exporter l'intégralité de vos données d'étude au format JSON standardisé via le menu Compte.</li>
                  <li><strong>Droit à l'effacement (Art. 17) :</strong> Vous pouvez demander la suppression immédiate et complète de vos données serveur et locales dans vos paramètres.</li>
                  <li><strong>Corbeille :</strong> Les éléments supprimés sont conservés 30 jours pour récupération avant effacement irréversible.</li>
                </ul>
              </div>

              <div className="space-y-2">
                <h5 className="font-extrabold text-xs uppercase tracking-wider text-[#161922] dark:text-white">
                  3. Sécurité des Échanges
                </h5>
                <p>
                  Les échanges transitent via chiffrement TLS/HTTPS. Les mots de passe de compte sont chiffrés avec sel aléatoire (PBKDF2/SHA-512). Les sessions sont protégées par jetons sécurisés côté serveur.
                </p>
              </div>
            </div>
          )}

          {/* TAB 2: AI TRANSPARENCY */}
          {activeTab === 'ai' && (
            <div className="space-y-4">
              <div className="p-4 bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 rounded-2xl flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-purple-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-extrabold text-sm text-purple-950 dark:text-purple-200">Charte de Transparence IA (AI Act)</h4>
                  <p className="mt-1 text-xs text-purple-900 dark:text-purple-300">
                    Nova AI est un outil d'assistance à l'apprentissage actif. L'IA ne prend aucune décision scolaire officielle et ne remplace pas l'enseignement universitaire.
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <h5 className="font-extrabold text-xs uppercase tracking-wider text-[#161922] dark:text-white">
                  1. Identification des Contenus Générés
                </h5>
                <p>
                  Chaque document, flashcard ou réponse généré par l'IA porte une mention claire de provenance (« Généré par IA » ou « Moteur Académique Local »). L'étudiant conserve le contrôle total pour modifier ou supprimer tout contenu.
                </p>
              </div>

              <div className="space-y-2">
                <h5 className="font-extrabold text-xs uppercase tracking-wider text-[#161922] dark:text-white">
                  2. Minimisation des Données Transmises
                </h5>
                <p>
                  Seuls les extraits de cours nécessaires à la synthèse ou au sujet demandé sont transmis au moteur d'inférence. Les données sensibles (données de santé, vie privée, identifiants) ne doivent pas être saisies dans les prompts IA.
                </p>
              </div>

              <div className="space-y-2">
                <h5 className="font-extrabold text-xs uppercase tracking-wider text-[#161922] dark:text-white">
                  3. Mode Déterministe Hors-Ligne
                </h5>
                <p>
                  En cas d'absence de réseau ou de déconnexion du service externe, ChronoStudy bascule automatiquement sur son moteur déterministe local pour vous permettre de réviser sans interruption.
                </p>
              </div>
            </div>
          )}

          {/* TAB 3: STORAGE & COOKIES */}
          {activeTab === 'cookies' && (
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-2xl flex items-start gap-3">
                <Database className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-extrabold text-sm text-blue-950 dark:text-blue-200">Gestion du Stockage Local</h4>
                  <p className="mt-1 text-xs text-blue-900 dark:text-blue-300">
                    ChronoStudy n'utilise aucun cookie publicitaire ou traceur tiers intrusif.
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <h5 className="font-extrabold text-xs uppercase tracking-wider text-[#161922] dark:text-white">
                  Traceurs Techniques Strictement Nécessaires (Exemptés de consentement CNIL)
                </h5>
                <p>
                  Pour garantir le fonctionnement hors-ligne et la réactivité de l'application, les données d'étude sont stockées dans le <code>localStorage</code> de votre navigateur (clé <code>chronostudy_*</code>) ainsi que sur votre session serveur dédiée.
                </p>
              </div>

              <div className="p-3 bg-[#F5F6FA] dark:bg-zinc-800 rounded-xl space-y-1">
                <div className="flex items-center justify-between font-bold text-[11px]">
                  <span>Cookies d'audience marketing :</span>
                  <span className="text-emerald-600 font-extrabold">Aucun (0)</span>
                </div>
                <div className="flex items-center justify-between font-bold text-[11px]">
                  <span>Traceurs publicitaires tiers :</span>
                  <span className="text-emerald-600 font-extrabold">Désactivés</span>
                </div>
                <div className="flex items-center justify-between font-bold text-[11px]">
                  <span>Stockage technique d'état :</span>
                  <span className="text-slate-600 dark:text-slate-400">Actif (LocalStorage & Session)</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: LEGAL (LCEN) */}
          {activeTab === 'legal' && (
            <div className="space-y-3">
              <h5 className="font-extrabold text-xs uppercase tracking-wider text-[#161922] dark:text-white">
                Éditeur & Développeur du Service
              </h5>
              <p>
                Application développée pour l'organisation et la productivité étudiante. Projet ChronoStudy Lite, sous licence Open Source / MIT.
              </p>

              <h5 className="font-extrabold text-xs uppercase tracking-wider text-[#161922] dark:text-white pt-2">
                Hébergement & Infrastructure
              </h5>
              <p>
                L'application s'exécute dans un conteneur sécurisé Node.js sous environnement cloud européen managé avec protocole HTTPS et isolation des processus.
              </p>

              <h5 className="font-extrabold text-xs uppercase tracking-wider text-[#161922] dark:text-white pt-2">
                Propriété Intellectuelle
              </h5>
              <p>
                Les documents et supports de cours importés par l'étudiant restent sa propriété exclusive ou celle des ayants droit respectifs (universités, auteurs). ChronoStudy ne revendique aucun droit d'auteur sur vos fiches de révision personnelles.
              </p>
            </div>
          )}

        </div>

        {/* FOOTER */}
        <div className="p-4 bg-[#F5F6FA] dark:bg-zinc-800/60 border-t border-slate-200 dark:border-zinc-800 flex items-center justify-between shrink-0">
          <span className="text-[11px] text-slate-500 font-bold">
            ChronoStudy • Transparence & Protection des Données Étudiantes
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#161922] dark:bg-white text-white dark:text-[#161922] font-bold text-xs rounded-xl hover:opacity-90 transition-opacity cursor-pointer"
          >
            Fermer
          </button>
        </div>

      </div>
    </div>
  );
};
