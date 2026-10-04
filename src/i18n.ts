import React, { createContext, useContext, useEffect, useState } from 'react';

export type AppLanguage = 'fr' | 'en' | 'de';
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
    pendingProfBannerTitle: 'Compte Professeur en attente de validation par l’Administrateur',
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
    footerAcademic: 'Projet académique — Professeur Zenasni Kamel',
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
    pendingProfBannerTitle: 'Professor Account Pending Administrator Validation',
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
    footerAcademic: 'Academic Project — Professor Zenasni Kamel',
  },
  de: {
    appBadge: 'AnatomyZ · 3D-Atlas der menschlichen Anatomie',
    appSubtitle:
      'Hochpräziser 3D-Anatomieatlas für Medizinstudierende und Professoren, basierend auf einem zertifizierten Knowledge Graph, FMA/UBERON-Ontologien und klinischen Prüfungen.',
    academicPlatform: 'Akademische Plattform',
    signInGoogle: 'Google-Anmeldung',
    signInToAccessRoles: 'Mit Google anmelden, um auf Bereiche zuzugreifen',
    exploreAtlasDemo: '3D-Atlas im Demo-Modus erkunden',
    exploreAtlasDirect: '3D-Anatomieatlas direkt öffnen',
    authRequiredTitle: 'Universitäre Authentifizierung erforderlich',
    authRequiredDesc:
      'Der Zugriff auf die Arbeitsbereiche für Studierende und Professoren, Prüfungen und Notenübersichten erfordert eine vorherige Anmeldung.',
    authRequiredSub:
      'Studierendenprofile werden sofort freigeschaltet. Professorenprofile erfordern die Bestätigung durch den Administrator.',
    activeSession: 'Aktive Sitzung',
    currentRole: 'Aktuelle Rolle',
    manageProfile: 'Profil verwalten',
    authorizedWorkspaces: 'Ihr autorisierter Arbeitsbereich',
    authorizedWorkspacesAdmin: 'Alle Arbeitsbereiche (Admin-Aufsicht)',
    selectToAccess: 'Auswählen zum Öffnen',
    studentWorkspaceTitle: 'Arbeitsbereich Medizinstudierende',
    studentWorkspaceDesc:
      'Klinische Prüfungen, Anatomie-Lernkarten und Notenbuch.',
    professorWorkspaceTitle: 'Arbeitsbereich Professoren / Dozenten',
    professorWorkspaceDesc:
      'Studierende verwalten (CRUD), Prüfungen erstellen und 3D-Atlas projizieren.',
    professorPendingDesc:
      'Bis zur Bestätigung durch den Administrator nur Zugriff auf 3D-Demonstrationen.',
    adminWorkspaceTitle: 'Institutionelles Administrationspanel',
    adminWorkspaceDesc:
      'Professoren mit Profil-Details bestätigen, Rollen zuweisen und Firestore überwachen.',
    pendingProfBannerTitle: 'Professorenkonto wartet auf Administrator-Freigabe',
    pendingProfBannerDesc:
      'Ihr Professorenkonto muss vom Administrator freigegeben werden. Bis zur Bestätigung haben Sie nur Zugriff auf die 3D-Demos und können weder mit Studierenden interagieren noch andere Funktionen nutzen.',
    checkRequestStatus: 'Status überprüfen',
    openDemoSpace: '3D-Demonstrationen öffnen (Eingeschränkter Modus)',
    themeAuto: 'Auto-Zeitplan',
    themeLight: 'Hell',
    themeDark: 'Dunkel',
    home: 'Startseite',
    atlas3d: '3D-Atlas',
    admin: 'Admin',
    myAccount: 'Mein Konto',
    roleStudent: 'Student',
    roleProfessor: 'Professor',
    roleAdmin: 'Admin',
    downloadApk: '→ APK herunterladen (Release)',
    downloadAab: '→ AAB herunterladen (Release)',
    anatomyCatalog: '→ Anatomischer Katalog',
    githubRepo: '→ GitHub-Repository',
    footerAcademic: 'Akademisches Projekt — Professor Zenasni Kamel',
  },
};

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
      if (saved === 'fr' || saved === 'en' || saved === 'de') return saved;
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
