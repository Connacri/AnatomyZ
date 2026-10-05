import React, { useState } from 'react';
import {
  X,
  Palette,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Search,
  Sliders,
  Sparkles,
  Sun,
  Moon,
  Clock3,
  MousePointerClick,
  Eye,
  Focus,
  Smartphone,
  ExternalLink,
  BookOpen,
  ArrowRight,
  ShieldCheck,
  Check,
} from 'lucide-react';
import { useAppPreferences, ThemePreference } from '../i18n';

interface UxColorPsychologyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectSystem?: (systemId: string) => void;
}

export function UxColorPsychologyModal({
  isOpen,
  onClose,
  onSelectSystem,
}: UxColorPsychologyModalProps) {
  const { themePreference, setThemePreference, resolvedTheme } =
    useAppPreferences();
  const [activeTab, setActiveTab] = useState<
    'jakob' | 'proximity' | 'figureGround' | 'closure' | 'fitts' | 'palette'
  >('jakob');

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Psychologie des Couleurs & Lois UX"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full max-w-4xl max-h-[90vh] bg-[#161C24] border border-[#323B46] rounded-2xl shadow-2xl overflow-hidden flex flex-col text-[#FAF6F0] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-[#323B46] bg-[#1E242C] flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#DACBA9]/20 text-[#DACBA9] flex items-center justify-center">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-[#FAF6F0] flex items-center gap-2">
                Psychologie des Couleurs & Lois UX
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30">
                  Jakob · PaletteVault · Fitts
                </span>
              </h2>
              <p className="text-xs text-[#8F9CAE]">
                Architecture cognitive et charte chromatique appliquée à AnatomyZ
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="min-h-[40px] min-w-[40px] rounded-xl text-[#8F9CAE] hover:text-[#FAF6F0] hover:bg-[#2A323D] flex items-center justify-center transition cursor-pointer"
            title="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs (Jakob's Law: clear horizontal categories with thumb reach) */}
        <div className="flex items-center gap-1.5 px-4 py-2.5 bg-[#15191E] border-b border-[#323B46] overflow-x-auto scrollbar-none shrink-0">
          {[
            { id: 'jakob', label: '1. Loi de Jakob', icon: Search },
            { id: 'proximity', label: '2. Proximité (Gestalt)', icon: Layers },
            { id: 'figureGround', label: '3. Figure-Fond', icon: Focus },
            { id: 'closure', label: '4. Clôture (Closure)', icon: Eye },
            { id: 'fitts', label: '5. Loi de Fitts', icon: Smartphone },
            { id: 'palette', label: '6. PaletteVault & 60-30-10', icon: Palette },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`min-h-[38px] px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap flex items-center gap-1.5 transition cursor-pointer ${
                  active
                    ? 'bg-[#DACBA9] text-[#15191E] shadow-sm'
                    : 'text-[#BAC3CE] hover:text-[#FAF6F0] hover:bg-[#1E242C]'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Modal Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {/* TAB 1: JAKOB'S LAW */}
          {activeTab === 'jakob' && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div className="p-4 rounded-2xl bg-[#1E242C] border border-[#323B46] space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#DACBA9]">
                  Loi de Jakob (Jakob Nielsen)
                </span>
                <h3 className="text-lg font-bold text-[#FAF6F0]">
                  « Les utilisateurs passent la majeure partie de leur temps sur d’autres sites. »
                </h3>
                <p className="text-xs sm:text-sm text-[#BAC3CE] leading-relaxed">
                  Ils s’attendent donc à ce qu'AnatomyZ fonctionne de la même manière que les applications et plateformes médicales qu’ils connaissent déjà (Google, Wikipedia, UpToDate, Notion). Les bonnes interfaces privilégient la <strong className="text-[#ECE3D9]">familiarité avant l’innovation inutile</strong>.
                </p>
              </div>

              {/* Real App Implementations */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-[#15191E] border border-emerald-500/30 space-y-2">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Barre de Recherche en Haut (Centre / Cmd+K)</span>
                  </div>
                  <p className="text-xs text-[#BAC3CE] leading-relaxed">
                    Tout comme sur Google, YouTube ou Amazon, la recherche globale se situe en tête d'écran avec déclencheur universel <kbd className="px-1.5 py-0.5 rounded bg-[#1E242C] font-mono text-[10px]">⌘K</kbd>. Elle permet d'accéder directement à un organe (Cœur, Fémur, Poumon) ou un examen.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-[#15191E] border border-emerald-500/30 space-y-2">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Profil Utilisateur en Haut à Droite</span>
                  </div>
                  <p className="text-xs text-[#BAC3CE] leading-relaxed">
                    L'avatar, le badge de rôle universitaire (Étudiant / Enseignant) et le bouton de connexion Google se trouvent systématiquement en haut à droite, respectant le schéma mental global.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-[#15191E] border border-emerald-500/30 space-y-2">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Barre de Navigation Mobile Inférieure</span>
                  </div>
                  <p className="text-xs text-[#BAC3CE] leading-relaxed">
                    Sur smartphone, la navigation principale est ancrée en bas de l'écran (Accueil, Atlas 3D, Systèmes, Examens, Profil) afin de respecter la zone du pouce (Fitts + Jakob).
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-[#15191E] border border-emerald-500/30 space-y-2">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Icônes Normalisées & Clarté Sémantique</span>
                  </div>
                  <p className="text-xs text-[#BAC3CE] leading-relaxed">
                    Utilisation d'icônes conventionnelles (Maison pour Accueil, Cloche pour Notifications, Boîte 3D pour l'Atlas, Mortier académique pour les examens) évitant toute ambiguïté cognitive.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: LAW OF PROXIMITY */}
          {activeTab === 'proximity' && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div className="p-4 rounded-2xl bg-[#1E242C] border border-[#323B46] space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-sky-400">
                  Loi de Proximité (Gestalt)
                </span>
                <h3 className="text-lg font-bold text-[#FAF6F0]">
                  « Les éléments proches dans l'espace sont perçus comme faisant partie du même groupe. »
                </h3>
                <p className="text-xs sm:text-sm text-[#BAC3CE] leading-relaxed">
                  La distance spatiale communique immédiatement les relations logiques sans avoir besoin de texte explicatif : <strong className="text-sky-300">Proche = Lié, Éloigné = Distinct</strong>.
                </p>
              </div>

              {/* Good vs Bad Visual Demo from uploaded image */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-[#15191E] border border-emerald-500/40 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" /> Bon usage (Proximité respectée)
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-950/60 text-emerald-300">
                      AnatomyZ
                    </span>
                  </div>
                  <div className="p-3 rounded-lg bg-[#1E242C] border border-[#323B46] space-y-2">
                    <div className="text-[11px] font-bold text-[#DACBA9]">Informations de l'étudiant</div>
                    <div className="space-y-1">
                      <label className="text-[10px] text-[#8F9CAE]">Matricule universitaire</label>
                      <div className="h-8 rounded bg-[#15191E] border border-[#323B46] px-2 flex items-center text-xs text-[#FAF6F0]">
                        MED-2026-8841
                      </div>
                    </div>
                  </div>
                  <p className="text-[11px] text-[#BAC3CE]">
                    Le titre, le libellé et le champ de saisie sont étroitement regroupés.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-[#15191E] border border-rose-500/40 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-rose-400 flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4" /> Mauvais usage (Disposition dispersée)
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-950/60 text-rose-300">
                      À éviter
                    </span>
                  </div>
                  <div className="p-3 rounded-lg bg-[#1E242C] border border-[#323B46] space-y-4">
                    <div className="text-[11px] font-bold text-[#8F9CAE]">Action isolée</div>
                    <div className="flex items-center gap-1">
                      <div className="h-7 px-2 rounded bg-rose-600 text-white text-[10px] flex items-center">
                        Supprimer
                      </div>
                      <div className="h-7 px-2 rounded bg-emerald-600 text-white text-[10px] flex items-center">
                        Enregistrer
                      </div>
                      <div className="h-7 px-2 rounded bg-neutral-600 text-white text-[10px] flex items-center">
                        Annuler
                      </div>
                    </div>
                  </div>
                  <p className="text-[11px] text-[#BAC3CE]">
                    Actions destructives collées aux actions affirmatives : risque d'erreur de clic critique.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: FIGURE-GROUND */}
          {activeTab === 'figureGround' && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div className="p-4 rounded-2xl bg-[#1E242C] border border-[#323B46] space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
                  Principe Figure-Fond (Figure-Ground)
                </span>
                <h3 className="text-lg font-bold text-[#FAF6F0]">
                  « Si tout exige de l'attention, rien ne retient l'attention. »
                </h3>
                <p className="text-xs sm:text-sm text-[#BAC3CE] leading-relaxed">
                  Le cerveau humain sépare naturellement l’élément central sur lequel il se concentre (<strong className="text-amber-300">la Figure</strong>) de l’environnement environnant (<strong className="text-neutral-400">le Fond</strong>).
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-4 rounded-xl bg-[#15191E] border border-[#323B46] space-y-2">
                  <div className="text-xs font-bold text-amber-300">Modales & Popups</div>
                  <p className="text-xs text-[#BAC3CE] leading-relaxed">
                    Arrière-plan assombri à 85% avec flou gaussien (<code className="text-[11px] text-[#ECE3D9]">backdrop-blur-md</code>) pour isoler la fenêtre de profil ou de recherche.
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-[#15191E] border border-[#323B46] space-y-2">
                  <div className="text-xs font-bold text-amber-300">Bouton CTA Principal</div>
                  <p className="text-xs text-[#BAC3CE] leading-relaxed">
                    Contraste élevé pour l'action principale (<span className="bg-[#DACBA9] text-[#15191E] px-1.5 py-0.5 rounded text-[10px] font-bold">Lancer l'examen</span>), tandis que les actions secondaires restent en fond discret.
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-[#15191E] border border-[#323B46] space-y-2">
                  <div className="text-xs font-bold text-amber-300">Atlas 3D Anatomique</div>
                  <p className="text-xs text-[#BAC3CE] leading-relaxed">
                    Le fond sombre neutre laisse ressortir les couleurs d'organes (cœur rouge, système nerveux jaune, poumons bleutés) avec un focus maximal.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: CLOSURE */}
          {activeTab === 'closure' && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div className="p-4 rounded-2xl bg-[#1E242C] border border-[#323B46] space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400">
                  Principe de Clôture (Closure - Gestalt)
                </span>
                <h3 className="text-lg font-bold text-[#FAF6F0]">
                  « Le cerveau comble naturellement les parties manquantes pour percevoir un tout cohérent. »
                </h3>
                <p className="text-xs sm:text-sm text-[#BAC3CE] leading-relaxed">
                  L'interface n'a pas besoin de surcharger chaque pixel : des indices visuels subtils guident l'utilisateur sans encombrer la vue.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#15191E] border border-[#323B46] space-y-3">
                <div className="text-xs font-bold text-purple-300 flex items-center gap-2">
                  <Eye className="w-4 h-4" />
                  <span>Indicateur de Progression Connecté (Examens & Quiz)</span>
                </div>
                {/* Visual Step Indicator demonstration */}
                <div className="flex items-center justify-between max-w-md mx-auto pt-2">
                  <div className="flex flex-col items-center gap-1">
                    <div className="w-7 h-7 rounded-full bg-emerald-500 text-[#15191E] font-bold text-xs flex items-center justify-center shadow-md">
                      ✓
                    </div>
                    <span className="text-[10px] text-emerald-300">Q1 Réussie</span>
                  </div>
                  <div className="flex-1 h-0.5 bg-emerald-500 mx-2" />
                  <div className="flex flex-col items-center gap-1">
                    <div className="w-7 h-7 rounded-full bg-[#DACBA9] text-[#15191E] font-bold text-xs flex items-center justify-center shadow-md">
                      2
                    </div>
                    <span className="text-[10px] text-[#DACBA9]">En cours</span>
                  </div>
                  <div className="flex-1 h-0.5 bg-[#323B46] mx-2" />
                  <div className="flex flex-col items-center gap-1">
                    <div className="w-7 h-7 rounded-full bg-[#232C3A] border border-[#323B46] text-[#8F9CAE] font-bold text-xs flex items-center justify-center">
                      3
                    </div>
                    <span className="text-[10px] text-[#8F9CAE]">À venir</span>
                  </div>
                </div>
                <p className="text-xs text-[#BAC3CE] text-center pt-2">
                  Les lignes et cercles connectés forment une trajectoire continue que l'étudiant perçoit instantanément.
                </p>
              </div>
            </div>
          )}

          {/* TAB 5: FITTS'S LAW */}
          {activeTab === 'fitts' && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div className="p-4 rounded-2xl bg-[#1E242C] border border-[#323B46] space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-rose-400">
                  Loi de Fitts (Paul Fitts)
                </span>
                <h3 className="text-lg font-bold text-[#FAF6F0]">
                  « Plus une cible est grande et proche, plus elle est facile et rapide à atteindre. »
                </h3>
                <p className="text-xs sm:text-sm text-[#BAC3CE] leading-relaxed font-mono">
                  T = a + b × log₂(D / W + 1)
                </p>
                <p className="text-xs text-[#8F9CAE]">
                  Où D = distance vers la cible, W = largeur / taille de la cible.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-4 rounded-xl bg-[#15191E] border border-[#323B46] space-y-2">
                  <div className="text-xs font-bold text-rose-300">Zone du Pouce (Mobile)</div>
                  <p className="text-xs text-[#BAC3CE] leading-relaxed">
                    Sur mobile, les actions prioritaires (validation d'examen, navigation principale) sont placées en bas de l'écran afin d'éviter d'avoir à tendre la main vers les coins supérieurs.
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-[#15191E] border border-[#323B46] space-y-2">
                  <div className="text-xs font-bold text-rose-300">Cibles de 44px Minimum</div>
                  <p className="text-xs text-[#BAC3CE] leading-relaxed">
                    Tous les boutons, champs de saisie et cartes tactiles respectent le seuil ergonomique de <strong className="text-[#ECE3D9]">44×44 pixels</strong> pour supprimer les erreurs de frappe.
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-[#15191E] border border-[#323B46] space-y-2">
                  <div className="text-xs font-bold text-rose-300">Espacement Protecteur</div>
                  <p className="text-xs text-[#BAC3CE] leading-relaxed">
                    Un dégagement suffisant est maintenu entre les commandes pour empêcher les clics accidentels sur les options voisines.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: PALETTEVAULT & 60-30-10 */}
          {activeTab === 'palette' && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div className="p-4 rounded-2xl bg-[#1E242C] border border-[#323B46] space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#DACBA9]">
                  PaletteVault · Psychologie des Couleurs en UI & Règle 60-30-10
                </span>
                <h3 className="text-lg font-bold text-[#FAF6F0]">
                  Harmonie perceptuelle, confiance médicale et clarté clinique
                </h3>
                <p className="text-xs sm:text-sm text-[#BAC3CE] leading-relaxed">
                  Basé sur les enseignements de <strong className="text-[#DACBA9]">PaletteVault</strong> (Color Psychology in UI Design) : 90% de la première impression découle de la couleur. AnatomyZ applique la règle <strong className="text-[#ECE3D9]">60-30-10</strong> et des contrastes conformes aux critères WCAG 2.1.
                </p>
              </div>

              {/* 60 - 30 - 10 Visual Breakdown */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-4 rounded-xl bg-[#15191E] border border-[#323B46] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#ECE3D9]">60% · Fond Dominant</span>
                    <span className="w-4 h-4 rounded-full bg-[#15191E] border border-[#455160]" />
                  </div>
                  <p className="text-xs text-[#BAC3CE] leading-relaxed">
                    <strong className="text-[#FAF6F0]">Ardoise Profonde (#15191E)</strong> en mode sombre / <strong className="text-[#FAF6F0]">Calcaire Albâtre (#F5EFE6)</strong> en mode clair. Fond reposant, éliminant la fatigue oculaire lors des longues sessions d'anatomie.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-[#1E242C] border border-[#323B46] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#DACBA9]">30% · Structure & Cartes</span>
                    <span className="w-4 h-4 rounded-full bg-[#1E242C] border border-[#323B46]" />
                  </div>
                  <p className="text-xs text-[#BAC3CE] leading-relaxed">
                    Surfaces de cartes, barres de navigation et conteneurs surélevés (<strong className="text-[#FAF6F0]">#1E242C</strong> et <strong className="text-[#FAF6F0]">#232C3A</strong>) créant une hiérarchie sans saturation visuelle.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-[#232C3A] border border-[#DACBA9]/40 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#DACBA9]">10% · Accents & Actions</span>
                    <span className="w-4 h-4 rounded-full bg-[#DACBA9]" />
                  </div>
                  <p className="text-xs text-[#BAC3CE] leading-relaxed">
                    <strong className="text-[#DACBA9]">Ocre Osseux (#DACBA9)</strong> pour la noblesse anatomique, <strong className="text-sky-400">Bleu Médical (#38BDF8)</strong> pour la confiance et <strong className="text-emerald-400">Vert Vitalité (#10B981)</strong> pour la validation.
                  </p>
                </div>
              </div>

              {/* Live Theme Switcher */}
              <div className="p-4 rounded-2xl bg-[#15191E] border border-[#323B46] flex flex-wrap items-center justify-between gap-4">
                <div>
                  <div className="text-xs sm:text-sm font-bold text-[#FAF6F0]">
                    Tester le Thème Actif
                  </div>
                  <div className="text-xs text-[#8F9CAE]">
                    Actuellement :{' '}
                    <strong className="text-[#DACBA9]">
                      {themePreference === 'auto'
                        ? `Automatique horaire (${resolvedTheme === 'light' ? 'Mode Clair' : 'Mode Sombre'})`
                        : themePreference === 'light'
                        ? 'Mode Clair (Calcaire & Albâtre)'
                        : 'Mode Sombre (Ardoise Médicale)'}
                    </strong>
                  </div>
                </div>

                <div className="inline-flex rounded-xl border border-[#455160] bg-[#1E242C] p-1">
                  {(
                    [
                      ['auto', 'Auto (Horaire)', Clock3],
                      ['dark', 'Sombre', Moon],
                      ['light', 'Clair', Sun],
                    ] as const
                  ).map(([val, label, Icon]) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setThemePreference(val as ThemePreference)}
                      className={`min-h-[36px] px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
                        themePreference === val
                          ? 'bg-[#DACBA9] text-[#15191E] shadow-sm'
                          : 'text-[#BAC3CE] hover:text-[#FAF6F0]'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 border-t border-[#323B46] bg-[#1E242C] flex items-center justify-between text-xs text-[#8F9CAE]">
          <span>AnatomyZ · Design System Médical Fondé sur la Psychologie Cognitive</span>
          <button
            type="button"
            onClick={onClose}
            className="min-h-[38px] px-4 py-1.5 rounded-xl bg-[#DACBA9] hover:bg-[#ECE3D9] text-[#15191E] font-bold transition cursor-pointer"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}
