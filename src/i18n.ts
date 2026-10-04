import React, { createContext, useContext, useEffect, useState } from 'react';

export type AppLanguage = 'fr' | 'en';
export type ThemePreference = 'auto' | 'light' | 'dark';

export function getTimeBasedTheme(): 'light' | 'dark' {
  const hour = new Date().getHours();
  // Daytime 07:00 to 18:59 -> Light (claire), Nighttime 19:00 to 06:59 -> Dark (sombre)
  return hour >= 7 && hour < 19 ? 'light' : 'dark';
}

export const TRANSLATIONS: Record<AppLanguage, Record<string, string>> = {
  fr: {
    appBadge: 'AnatomyZ · Atlas Anatomique Humain 3D',
    appSubtitle:
      'Atlas anatomique 3D haute fidélité pour étudiants et professeurs de médecine, articulé autour d’un Knowledge Graph certifié, des ontologies FMA/UBERON et d’évaluations cliniques.',
    academicPlatform: 'Plateforme Académique',
    signInGoogle: 'Connexion Google',
    signInToAccessRoles: 'Se connecter avec Google pour accéder aux rôles',
    exploreAtlasDemo: 'Explorer l’Atlas 3D en mode démonstration',
    exploreAtlasDirect: 'Explorer directement l’atlas anatomique 3D',
    authRequiredTitle: 'Authentification Universitaire Requise',
    authRequiredDesc:
      'L’accès aux espaces de travail Étudiant et Professeur, la passation des examens et la consultation des relevés de notes nécessitent une connexion préalable.',
    authRequiredSub:
      'Les profils Étudiants sont validés immédiatement. Les profils Enseignants sont soumis à l’approbation administrative.',
    activeSession: 'Session Active',
    currentRole: 'Rôle actuel',
    manageProfile: 'Gérer mon profil',
    authorizedWorkspaces: 'Votre espace autorisé',
    authorizedWorkspacesAdmin: 'Tous les espaces (Supervision Admin)',
    selectToAccess: 'Sélectionnez pour accéder',
    studentWorkspaceTitle: 'Espace Étudiant en Médecine',
    studentWorkspaceDesc:
      'Évaluations cliniques, flashcards d’anatomie et carnet de notes.',
    professorWorkspaceTitle: 'Espace Enseignant / Professeur',
    professorWorkspaceDesc:
      'Gérer les étudiants (CRUD), créer des examens et projeter l’Atlas 3D.',
    professorPendingDesc:
      'Accès limité aux démonstrations 3D jusqu’à validation par l’administrateur.',
    adminWorkspaceTitle: 'Panneau d’Administration Institutionnelle',
    adminWorkspaceDesc:
      'Validation des professeurs avec détail profil, attribution des rôles et supervision Firestore.',
    pendingProfBannerTitle:
      'Compte Professeur en attente de validation par l’Administrateur',
    pendingProfBannerDesc:
      'Votre compte Professeur doit être validé par l’administrateur. En attendant son acceptation, vous avez uniquement accès aux démonstrations 3D et ne pouvez ni interagir avec les étudiants ni accéder aux autres fonctionnalités.',
    checkRequestStatus: 'Vérifier l’état de la demande',
    openDemoSpace: 'Accéder aux démonstrations 3D (Mode restreint)',
    themeAuto: 'Horaire Auto',
    themeLight: 'Clair',
    themeDark: 'Sombre',
    home: 'Accueil',
    atlas3d: 'Atlas 3D',
    admin: 'Admin',
    myAccount: 'Mon Compte',
    roleStudent: 'Étudiant',
    roleProfessor: 'Professeur',
    roleAdmin: 'Admin',
    downloadApk: '→ Télécharger APK (Release)',
    downloadAab: '→ Télécharger AAB (Release)',
    anatomyCatalog: '→ Catalogue anatomique',
    githubRepo: '→ Dépôt GitHub',
  },
  en: {
    appBadge: 'AnatomyZ · 3D Human Anatomical Atlas',
    appSubtitle:
      'High-fidelity 3D anatomical atlas for medical students and professors, built around a certified Knowledge Graph, FMA/UBERON ontologies, and clinical assessments.',
    academicPlatform: 'Academic Platform',
    signInGoogle: 'Google Sign-In',
    signInToAccessRoles: 'Sign in with Google to access workspaces',
    exploreAtlasDemo: 'Explore 3D Atlas in demo mode',
    exploreAtlasDirect: 'Explore the 3D anatomical atlas directly',
    authRequiredTitle: 'University Authentication Required',
    authRequiredDesc:
      'Access to the Student and Professor workspaces, taking exams, and viewing grade transcripts require prior authentication.',
    authRequiredSub:
      'Student profiles are validated immediately. Professor profiles require administrator approval.',
    activeSession: 'Active Session',
    currentRole: 'Current role',
    manageProfile: 'Manage profile',
    authorizedWorkspaces: 'Your Authorized Workspace',
    authorizedWorkspacesAdmin: 'All Workspaces (Admin Supervision)',
    selectToAccess: 'Select to enter',
    studentWorkspaceTitle: 'Medical Student Workspace',
    studentWorkspaceDesc:
      'Clinical assessments, anatomy flashcards, and gradebook.',
    professorWorkspaceTitle: 'Professor / Faculty Workspace',
    professorWorkspaceDesc:
      'Manage students (CRUD), create exams, and project the 3D Atlas.',
    professorPendingDesc:
      'Restricted to 3D demonstrations only until validated by the administrator.',
    adminWorkspaceTitle: 'Institutional Administration Panel',
    adminWorkspaceDesc:
      'Validate professors with detailed profiles, assign roles, and supervise Firestore.',
    pendingProfBannerTitle:
      'Professor Account Pending Administrator Validation',
    pendingProfBannerDesc:
      'Your Professor account must be validated by the administrator. Until accepted, you only have access to 3D demonstrations and cannot interact with students or access other app features.',
    checkRequestStatus: 'Check request status',
    openDemoSpace: 'Open 3D Demonstrations (Restricted Mode)',
    themeAuto: 'Auto Schedule',
    themeLight: 'Light',
    themeDark: 'Dark',
    home: 'Home',
    atlas3d: '3D Atlas',
    admin: 'Admin',
    myAccount: 'My Account',
    roleStudent: 'Student',
    roleProfessor: 'Professor',
    roleAdmin: 'Admin',
    downloadApk: '→ Download APK (Release)',
    downloadAab: '→ Download AAB (Release)',
    anatomyCatalog: '→ Anatomical Catalog',
    githubRepo: '→ GitHub Repository',
  },
};

/**
 * Full-coverage phrase & UI dictionary for automatic translation of all
 * screens, top/bottom bars, tabs, buttons, modals, and dialogs in FR / EN.
 */
const UI_PHRASE_MAP: Array<{ fr: string; en: string }> = [
  // Modals & Auth
  {
    fr: 'Bienvenue sur AnatomyZ',
    en: 'Welcome to AnatomyZ',
  },
  {
    fr: 'Étudiant en médecine',
    en: 'Medical Student',
  },
  {
    fr: 'Étudiant en Médecine',
    en: 'Medical Student',
  },
  {
    fr: 'Immédiat',
    en: 'Instant',
  },
  {
    fr: 'Enseignant / Professeur',
    en: 'Professor / Faculty',
  },
  {
    fr: 'Sur validation',
    en: 'Requires approval',
  },
  {
    fr: 'Confirmer et accéder',
    en: 'Confirm and continue',
  },
  {
    fr: 'Mode Admin',
    en: 'Admin Mode',
  },
  {
    fr: 'Démos 3D uniquement (Attente Admin)',
    en: '3D Demos Only (Pending Admin)',
  },
  // Mobile & Navigation Bars
  {
    fr: 'Espace Professeur',
    en: 'Professor Space',
  },
  {
    fr: 'Espace Étudiant',
    en: 'Student Space',
  },
  {
    fr: 'Créer un examen',
    en: 'Create Exam',
  },
  {
    fr: 'Catalogue',
    en: 'Catalog',
  },
  {
    fr: 'Homme',
    en: 'Male',
  },
  {
    fr: 'Femme',
    en: 'Female',
  },
  {
    fr: 'Réinitialiser',
    en: 'Reset View',
  },
  {
    fr: 'Afficher',
    en: 'Show',
  },
  {
    fr: 'Masquer',
    en: 'Hide',
  },
  {
    fr: 'Transparence',
    en: 'Transparency',
  },
  {
    fr: 'Fermer',
    en: 'Close',
  },
  {
    fr: 'Annuler',
    en: 'Cancel',
  },
  {
    fr: 'Enregistrer',
    en: 'Save',
  },
  // Professor Workspace & Student CRUD
  {
    fr: 'Compte Professeur en attente d’acceptation par l’Administrateur',
    en: 'Professor Account Pending Administrator Acceptance',
  },
  {
    fr: 'Entrer mon détail profil pour l’Admin',
    en: 'Enter My Profile Details for Admin',
  },
  {
    fr: 'Compléter mon profil Professeur',
    en: 'Complete Professor Profile',
  },
  {
    fr: 'Nouvel Étudiant',
    en: 'New Student',
  },
  {
    fr: 'Création Rapide',
    en: 'Quick Create',
  },
  {
    fr: 'Éditeur 3D Complet',
    en: 'Full 3D Editor',
  },
  {
    fr: 'Étudiants Inscrit(s)',
    en: 'Enrolled Students',
  },
  {
    fr: 'Épreuves Publiées',
    en: 'Published Exams',
  },
  {
    fr: 'Copies Corrigées',
    en: 'Graded Submissions',
  },
  {
    fr: 'Moyenne Promotion',
    en: 'Cohort Average',
  },
  {
    fr: 'Gestion des Étudiants (CRUD Complet)',
    en: 'Student Management (Full CRUD)',
  },
  {
    fr: '+ Ajouter un Étudiant',
    en: '+ Add Student',
  },
  {
    fr: 'Détail',
    en: 'Details',
  },
  {
    fr: 'Modifier',
    en: 'Edit',
  },
  {
    fr: 'Supprimer',
    en: 'Delete',
  },
  {
    fr: 'Ajouter un nouvel étudiant',
    en: 'Add New Student',
  },
  {
    fr: 'Modifier le profil étudiant',
    en: 'Edit Student Profile',
  },
  {
    fr: 'Ajouter l’étudiant',
    en: 'Add Student',
  },
  {
    fr: 'Enregistrer les modifications',
    en: 'Save Changes',
  },
  {
    fr: 'Démonstrations 3D d’Amphithéâtre',
    en: '3D Lecture Hall Demonstrations',
  },
  {
    fr: 'Lancer la Démo 3D en Amphithéâtre',
    en: 'Launch 3D Lecture Demo',
  },
  // Admin Dashboard
  {
    fr: 'Supervision Institutionnelle & Accréditations',
    en: 'Institutional Supervision & Accreditations',
  },
  {
    fr: '+ Ajouter un Professeur',
    en: '+ Add Professor',
  },
  {
    fr: 'Actualiser',
    en: 'Refresh',
  },
  {
    fr: 'Liste des Utilisateurs Professeurs à Accepter',
    en: 'List of Professor Users to Accept',
  },
  {
    fr: 'Entrer détail profil & Accepter',
    en: 'Enter Profile Details & Accept',
  },
  {
    fr: 'Accepter Professeur',
    en: 'Accept Professor',
  },
  {
    fr: 'Refuser',
    en: 'Reject',
  },
  {
    fr: 'Enregistrer détail & Accepter Professeur',
    en: 'Save Details & Accept Professor',
  },
  // Student Workspace
  {
    fr: 'Mon Profil',
    en: 'My Profile',
  },
  {
    fr: 'Explorer l’Atlas 3D',
    en: 'Explore 3D Atlas',
  },
  {
    fr: 'Épreuves Disponibles',
    en: 'Available Exams',
  },
  {
    fr: 'Examens Complétés',
    en: 'Completed Exams',
  },
  {
    fr: 'Moyenne Générale',
    en: 'Overall Average',
  },
  {
    fr: 'Flashcards Maîtrisées',
    en: 'Mastered Flashcards',
  },
  {
    fr: 'Examens & QCM',
    en: 'Exams & Quizzes',
  },
  {
    fr: 'Systèmes 3D',
    en: '3D Systems',
  },
  {
    fr: 'Flashcards',
    en: 'Flashcards',
  },
  {
    fr: 'Relevé de Notes',
    en: 'Grade Transcript',
  },
  {
    fr: 'Démarrer l’examen',
    en: 'Start Exam',
  },
  {
    fr: 'Repasser',
    en: 'Retake',
  },
  {
    fr: 'Question suivante',
    en: 'Next Question',
  },
  {
    fr: 'Terminer l’examen',
    en: 'Submit Exam',
  },
  {
    fr: 'Examen terminé',
    en: 'Exam Completed',
  },
  {
    fr: 'Retour à mon espace',
    en: 'Return to Workspace',
  },
  // Profile & FCM Modals
  {
    fr: 'Notifications Firebase (FCM)',
    en: 'Firebase Push Notifications (FCM)',
  },
  {
    fr: 'État des notifications Push',
    en: 'Push Notification Status',
  },
  {
    fr: 'Activer les notifications push Web',
    en: 'Enable Web Push Notifications',
  },
  {
    fr: 'Actualiser la synchronisation FCM',
    en: 'Refresh FCM Sync',
  },
  {
    fr: 'Tester un push',
    en: 'Send Test Push',
  },
  {
    fr: 'Se déconnecter',
    en: 'Sign Out',
  },
  {
    fr: 'Enregistrer mon profil académique',
    en: 'Save Academic Profile',
  },
];

const originalTextByNode = new WeakMap<Text, string>();
const originalAttrByElement = new WeakMap<Element, Record<string, string>>();

function translateString(raw: string, targetLang: AppLanguage): string {
  const trimmed = raw.trim();
  if (!trimmed) return raw;

  for (const entry of UI_PHRASE_MAP) {
    if (trimmed === entry.fr || trimmed === entry.en) {
      const replacement = entry[targetLang];
      return raw.replace(trimmed, replacement);
    }
  }
  return raw;
}

function applyDomTranslations(targetLang: AppLanguage) {
  if (typeof document === 'undefined') return;
  const root = document.getElementById('root');
  if (!root) return;

  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  let node = walker.nextNode() as Text | null;
  while (node) {
    if (!originalTextByNode.has(node)) {
      originalTextByNode.set(node, node.nodeValue || '');
    }
    const base = originalTextByNode.get(node) || node.nodeValue || '';
    const nextVal =
      targetLang === 'fr' ? base : translateString(base, targetLang);
    if (node.nodeValue !== nextVal) {
      node.nodeValue = nextVal;
    }
    node = walker.nextNode() as Text | null;
  }

  const elements = root.querySelectorAll('[placeholder],[title],[aria-label]');
  elements.forEach((el) => {
    let saved = originalAttrByElement.get(el);
    if (!saved) {
      saved = {
        placeholder: el.getAttribute('placeholder') || '',
        title: el.getAttribute('title') || '',
        'aria-label': el.getAttribute('aria-label') || '',
      };
      originalAttrByElement.set(el, saved);
    }
    (['placeholder', 'title', 'aria-label'] as const).forEach((attr) => {
      const base = saved![attr];
      if (!base) return;
      const nextAttr =
        targetLang === 'fr' ? base : translateString(base, targetLang);
      if (el.getAttribute(attr) !== nextAttr) {
        el.setAttribute(attr, nextAttr);
      }
    });
  });
}

interface AppPreferencesContextValue {
  lang: AppLanguage;
  setLang: (lang: AppLanguage) => void;
  t: (key: string) => string;
  themePreference: ThemePreference;
  setThemePreference: (pref: ThemePreference) => void;
  resolvedTheme: 'light' | 'dark';
}

const AppPreferencesContext = createContext<AppPreferencesContextValue>({
  lang: 'fr',
  setLang: () => {},
  t: (key: string) => TRANSLATIONS.fr[key] || key,
  themePreference: 'auto',
  setThemePreference: () => {},
  resolvedTheme: getTimeBasedTheme(),
});

export const AppPreferencesProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [lang, setLangState] = useState<AppLanguage>(() => {
    if (typeof window !== 'undefined') {
      const saved = window.localStorage.getItem('anatomyz_lang');
      if (saved === 'fr' || saved === 'en') return saved;
    }
    return 'fr';
  });

  const [themePreference, setThemePrefState] = useState<ThemePreference>(() => {
    if (typeof window !== 'undefined') {
      const saved = window.localStorage.getItem('anatomyz_theme_pref');
      if (saved === 'auto' || saved === 'light' || saved === 'dark') return saved;
    }
    return 'auto';
  });

  const [timeTheme, setTimeTheme] = useState<'light' | 'dark'>(() =>
    getTimeBasedTheme()
  );

  useEffect(() => {
    const interval = window.setInterval(() => {
      setTimeTheme(getTimeBasedTheme());
    }, 60_000);
    return () => window.clearInterval(interval);
  }, []);

  const resolvedTheme: 'light' | 'dark' =
    themePreference === 'auto' ? timeTheme : themePreference;

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', resolvedTheme);
      document.documentElement.setAttribute('lang', lang);
      applyDomTranslations(lang);

      const root = document.getElementById('root');
      if (!root) return;
      let rafId = 0;
      const observer = new MutationObserver(() => {
        if (rafId) cancelAnimationFrame(rafId);
        rafId = requestAnimationFrame(() => applyDomTranslations(lang));
      });
      observer.observe(root, { childList: true, subtree: true });
      return () => {
        if (rafId) cancelAnimationFrame(rafId);
        observer.disconnect();
      };
    }
  }, [resolvedTheme, lang]);

  const setLang = (next: AppLanguage) => {
    setLangState(next);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('anatomyz_lang', next);
    }
  };

  const setThemePreference = (next: ThemePreference) => {
    setThemePrefState(next);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('anatomyz_theme_pref', next);
    }
  };

  const t = (key: string): string => {
    return TRANSLATIONS[lang]?.[key] ?? TRANSLATIONS.fr[key] ?? key;
  };

  return React.createElement(
    AppPreferencesContext.Provider,
    {
      value: {
        lang,
        setLang,
        t,
        themePreference,
        setThemePreference,
        resolvedTheme,
      },
    },
    children
  );
};

export function useAppPreferences() {
  return useContext(AppPreferencesContext);
}
