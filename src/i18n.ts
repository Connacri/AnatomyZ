import React, { createContext, useContext, useEffect, useRef, useState } from 'react';

export type AppLanguage = 'fr' | 'en';
export type ThemePreference = 'auto' | 'light' | 'dark';

export function getTimeBasedTheme(): 'light' | 'dark' {
  const hour = new Date().getHours();
  // Daytime 07:00 to 18:59 -> Light, Nighttime 19:00 to 06:59 -> Dark
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
    searchPlaceholder: 'Rechercher un organe, un système (⌘K)...',
    quickSearchTooltip: 'Recherche globale rapide (⌘K / Ctrl+K)',
    uxColorGuide: 'Psychologie des Couleurs & Lois UX',
    notificationsFcm: 'Notifications Push (FCM)',
    questionNext: 'Question suivante',
    questionPrev: 'Question précédente',
    finishExam: 'Terminer l’examen',
    examFinished: 'Examen terminé',
    timeRemaining: 'Temps restant',
    secureExamNotice: 'Mode examen sécurisé (atlas masqué)',
    selectedStructure: 'Structure sélectionnée',
    noStructureSelected: 'Aucune structure sélectionnée',
    targetStructure: 'Cible',
    returnToWorkspace: 'Retour à mon espace',
    scoreResult: 'Résultat',
    points: 'points',
    male: 'Homme',
    female: 'Femme',
    resetView: 'Réinitialiser',
    show: 'Afficher',
    hide: 'Masquer',
    transparency: 'Transparence',
    close: 'Fermer',
    cancel: 'Annuler',
    save: 'Enregistrer',
    delete: 'Supprimer',
    edit: 'Modifier',
    details: 'Détail',
    refresh: 'Actualiser',
    back: 'Retour',
    allSystems: 'Tous les systèmes',
    catalog: 'Catalogue',
    systems: 'Systèmes',
    exams: 'Examens',
    profile: 'Profil',
    newStudent: 'Nouvel Étudiant',
    quickCreate: 'Création Rapide',
    full3dEditor: 'Éditeur 3D Complet',
    enrolledStudents: 'Étudiants Inscrit(s)',
    publishedExams: 'Épreuves Publiées',
    gradedSubmissions: 'Copies Corrigées',
    cohortAverage: 'Moyenne Promotion',
    studentManagementCrud: 'Gestion des Étudiants (CRUD Complet)',
    addStudent: 'Ajouter un Étudiant',
    lectureDemo: 'Lancer la Démo 3D en Amphithéâtre',
    rechercher: 'Rechercher',
    knowledgeGraphCard: 'Knowledge Graph',
    knowledgeGraphDesc: 'Structures, synonymes et relations ontologiques FMA/UBERON.',
    threeDAnatomyCard: '3D Anatomy',
    threeDAnatomyDesc: 'Modèles 3D interactifs, dissection par couches et repérage.',
    mappingEngineCard: 'Mapping Engine',
    mappingEngineDesc: 'Correspondances exactes, xrefs et mappings certifiés.',
    medicalEducationCard: 'Éducation Médicale',
    medicalEducationDesc: 'Examens cliniques, QCM, repérage 3D et suivi des promotions.',
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
    searchPlaceholder: 'Search organ, system (⌘K)...',
    quickSearchTooltip: 'Quick Global Search (⌘K / Ctrl+K)',
    uxColorGuide: 'Color Psychology & UX Laws',
    notificationsFcm: 'Push Notifications (FCM)',
    questionNext: 'Next Question',
    questionPrev: 'Previous Question',
    finishExam: 'Finish Exam',
    examFinished: 'Exam Completed',
    timeRemaining: 'Time Remaining',
    secureExamNotice: 'Secure exam mode (atlas hidden)',
    selectedStructure: 'Selected Structure',
    noStructureSelected: 'No structure selected',
    targetStructure: 'Target',
    returnToWorkspace: 'Return to Workspace',
    scoreResult: 'Result',
    points: 'points',
    male: 'Male',
    female: 'Female',
    resetView: 'Reset View',
    show: 'Show',
    hide: 'Hide',
    transparency: 'Transparency',
    close: 'Close',
    cancel: 'Cancel',
    save: 'Save',
    delete: 'Delete',
    edit: 'Edit',
    details: 'Details',
    refresh: 'Refresh',
    back: 'Back',
    allSystems: 'All Systems',
    catalog: 'Catalog',
    systems: 'Systems',
    exams: 'Exams',
    profile: 'Profile',
    newStudent: 'New Student',
    quickCreate: 'Quick Create',
    full3dEditor: 'Full 3D Editor',
    enrolledStudents: 'Enrolled Students',
    publishedExams: 'Published Exams',
    gradedSubmissions: 'Graded Submissions',
    cohortAverage: 'Cohort Average',
    studentManagementCrud: 'Student Management (Full CRUD)',
    addStudent: 'Add Student',
    lectureDemo: 'Launch 3D Lecture Demo',
    rechercher: 'Search',
    knowledgeGraphCard: 'Knowledge Graph',
    knowledgeGraphDesc: 'FMA/UBERON ontological structures, synonyms, and relations.',
    threeDAnatomyCard: '3D Anatomy',
    threeDAnatomyDesc: 'Interactive 3D models, layer dissection, and structure targeting.',
    mappingEngineCard: 'Mapping Engine',
    mappingEngineDesc: 'Exact cross-references, xrefs, and certified mesh mappings.',
    medicalEducationCard: 'Medical Education',
    medicalEducationDesc: 'Clinical exams, MCQs, 3D targeting, and cohort gradebooks.',
  },
};

/**
 * Bidirectional phrase & substring dictionary for comprehensive DOM translation
 */
export const UI_PHRASE_PAIRS: Array<{ fr: string; en: string }> = [
  // Systems
  { fr: 'Système squelettique', en: 'Skeletal system' },
  { fr: 'Système musculaire', en: 'Muscular system' },
  { fr: 'Système articulaire', en: 'Articular system' },
  { fr: 'Système cardiovasculaire', en: 'Cardiovascular system' },
  { fr: 'Système nerveux', en: 'Nervous system' },
  { fr: 'Système respiratoire', en: 'Respiratory system' },
  { fr: 'Système digestif', en: 'Digestive system' },
  { fr: 'Système endocrinien', en: 'Endocrine system' },
  { fr: 'Système urinaire', en: 'Urinary system' },
  { fr: 'Système reproducteur', en: 'Reproductive system' },
  { fr: 'Système lymphatique', en: 'Lymphatic system' },
  { fr: 'Système tégumentaire', en: 'Integumentary system' },
  { fr: 'Anatomie viscérale', en: 'Visceral anatomy' },
  { fr: 'Anatomie régionale', en: 'Regional anatomy' },

  // Organs
  { fr: 'Cœur', en: 'Heart' },
  { fr: 'Poumon droit', en: 'Right lung' },
  { fr: 'Poumon gauche', en: 'Left lung' },
  { fr: 'Poumon', en: 'Lung' },
  { fr: 'Poumons', en: 'Lungs' },
  { fr: 'Foie', en: 'Liver' },
  { fr: 'Estomac', en: 'Stomach' },
  { fr: 'Cerveau', en: 'Brain' },
  { fr: 'Rein', en: 'Kidney' },
  { fr: 'Reins', en: 'Kidneys' },
  { fr: 'Rate', en: 'Spleen' },
  { fr: 'Pancréas', en: 'Pancreas' },
  { fr: 'Atrium droit', en: 'Right atrium' },
  { fr: 'Atrium gauche', en: 'Left atrium' },
  { fr: 'Ventricule droit', en: 'Right ventricle' },
  { fr: 'Ventricule gauche', en: 'Left ventricle' },

  // Workspaces and cards
  { fr: 'Espace Étudiant en Médecine', en: 'Medical Student Workspace' },
  { fr: 'Espace Enseignant / Professeur', en: 'Professor / Faculty Workspace' },
  { fr: 'Espace Professeur', en: 'Professor Workspace' },
  { fr: 'Espace Étudiant', en: 'Student Workspace' },
  { fr: 'Panneau d’Administration Institutionnelle', en: 'Institutional Administration Panel' },
  { fr: 'Panneau d\'Administration Institutionnelle', en: 'Institutional Administration Panel' },
  { fr: 'Supervision Institutionnelle & Accréditations', en: 'Institutional Supervision & Accreditations' },
  { fr: 'Validation des professeurs avec détail profil, attribution des rôles et supervision Firestore.', en: 'Validate professors with detailed profiles, assign roles, and supervise Firestore.' },
  { fr: 'Gérer les étudiants (CRUD), créer des examens et projeter l’Atlas 3D.', en: 'Manage students (CRUD), create exams, and project the 3D Atlas.' },
  { fr: 'Gérer les étudiants (CRUD), créer des examens et projeter l\'Atlas 3D.', en: 'Manage students (CRUD), create exams, and project the 3D Atlas.' },
  { fr: 'Évaluations cliniques, flashcards d’anatomie et carnet de notes.', en: 'Clinical assessments, anatomy flashcards, and gradebook.' },
  { fr: 'Évaluations cliniques, flashcards d\'anatomie et carnet de notes.', en: 'Clinical assessments, anatomy flashcards, and gradebook.' },
  { fr: 'Accès limité aux démonstrations 3D jusqu’à validation par l’administrateur.', en: 'Restricted to 3D demonstrations only until validated by the administrator.' },
  { fr: 'Accès limité aux démonstrations 3D jusqu\'à validation par l\'administrateur.', en: 'Restricted to 3D demonstrations only until validated by the administrator.' },
  { fr: 'Démos 3D uniquement (Attente Admin)', en: '3D Demos Only (Pending Admin)' },
  { fr: 'Plateforme Académique', en: 'Academic Platform' },
  { fr: 'Authentification Universitaire Requise', en: 'University Authentication Required' },
  { fr: 'L’accès aux espaces de travail Étudiant et Professeur, la passation des examens et la consultation des relevés de notes nécessitent une connexion préalable.', en: 'Access to the Student and Professor workspaces, taking exams, and viewing grade transcripts require prior authentication.' },
  { fr: 'Les profils Étudiants sont validés immédiatement. Les profils Enseignants sont soumis à l’approbation administrative.', en: 'Student profiles are validated immediately. Professor profiles require administrator approval.' },
  { fr: 'Se connecter avec Google pour accéder aux rôles', en: 'Sign in with Google to access workspaces' },
  { fr: 'Se connecter avec Google', en: 'Sign in with Google' },
  { fr: 'Connexion Google', en: 'Google Sign-In' },
  { fr: 'Explorer l’Atlas 3D en mode démonstration', en: 'Explore 3D Atlas in demo mode' },
  { fr: 'Explorer l\'Atlas 3D en mode démonstration', en: 'Explore 3D Atlas in demo mode' },
  { fr: 'Explorer directement l’atlas anatomique 3D', en: 'Explore the 3D anatomical atlas directly' },
  { fr: 'Explorer directement l\'atlas anatomique 3D', en: 'Explore the 3D anatomical atlas directly' },
  { fr: 'Session Active', en: 'Active Session' },
  { fr: 'Rôle actuel :', en: 'Current role:' },
  { fr: 'Rôle actuel', en: 'Current role' },
  { fr: 'Gérer mon profil', en: 'Manage Profile' },
  { fr: 'Votre espace autorisé', en: 'Your Authorized Workspace' },
  { fr: 'Tous les espaces (Supervision Admin)', en: 'All Workspaces (Admin Supervision)' },
  { fr: 'Sélectionnez pour accéder', en: 'Select to enter' },
  { fr: 'Compte Professeur en attente de validation par l’Administrateur', en: 'Professor Account Pending Administrator Validation' },
  { fr: 'Compte Professeur en attente de validation par l\'Administrateur', en: 'Professor Account Pending Administrator Validation' },
  { fr: 'Votre compte Professeur doit être validé par l’administrateur. En attendant son acceptation, vous avez uniquement accès aux démonstrations 3D et ne pouvez ni interagir avec les étudiants ni accéder aux autres fonctionnalités.', en: 'Your Professor account must be validated by the administrator. Until accepted, you only have access to 3D demonstrations and cannot interact with students or access other app features.' },
  { fr: 'Vérifier l’état de la demande', en: 'Check request status' },
  { fr: 'Vérifier l\'état de la demande', en: 'Check request status' },
  { fr: 'Accéder aux démonstrations 3D (Mode restreint)', en: 'Open 3D Demonstrations (Restricted Mode)' },

  // Knowledge Architecture Cards
  { fr: 'Structures, synonymes et relations ontologiques FMA/UBERON.', en: 'FMA/UBERON ontological structures, synonyms, and relations.' },
  { fr: 'Modèles 3D interactifs, dissection par couches et repérage.', en: 'Interactive 3D models, layer dissection, and structure targeting.' },
  { fr: 'Correspondances exactes, xrefs et mappings certifiés.', en: 'Exact cross-references, xrefs, and certified mesh mappings.' },
  { fr: 'Examens cliniques, QCM, repérage 3D et suivi des promotions.', en: 'Clinical exams, MCQs, 3D targeting, and cohort gradebooks.' },
  { fr: 'Éducation Médicale', en: 'Medical Education' },

  // Role Selection Modal
  { fr: 'Bienvenue sur AnatomyZ', en: 'Welcome to AnatomyZ' },
  { fr: 'Pour configurer votre profil, veuillez sélectionner votre statut universitaire :', en: 'To set up your profile, please select your university status:' },
  { fr: 'Étudiant en médecine', en: 'Medical Student' },
  { fr: 'Enseignant / Professeur', en: 'Professor / Faculty' },
  { fr: 'Validation automatique. Accès immédiat à l\'Atlas 3D, aux examens et à l\'enregistrement des notes.', en: 'Automatic validation. Instant access to 3D Atlas, exams, and grades.' },
  { fr: 'Concevoir des examens et gérer les cohortes. Soumis à validation par l\'administration (forslog@gmail.com).', en: 'Design exams and manage cohorts. Subject to administration validation (forslog@gmail.com).' },
  { fr: 'Validation requise :', en: 'Approval required:' },
  { fr: 'Validation requise', en: 'Approval required' },
  { fr: 'Votre demande pour le rôle Professeur sera transmise à l\'administrateur (forslog@gmail.com). Vous pourrez explorer l\'Atlas 3D ou utiliser le mode Étudiant en attendant la validation.', en: 'Your request for Professor role will be submitted to the administrator. You can explore the 3D Atlas or use Student mode while awaiting approval.' },
  { fr: 'Privilège super-administrateur reconnu (forslog@gmail.com)', en: 'Super-administrator privilege granted (forslog@gmail.com)' },
  { fr: 'Mode Admin', en: 'Admin Mode' },
  { fr: 'Confirmer et accéder', en: 'Confirm and continue' },
  { fr: 'Sur validation', en: 'Requires approval' },
  { fr: 'Immédiat', en: 'Instant' },

  // Exams & Tests
  { fr: 'Question suivante', en: 'Next Question' },
  { fr: 'Question précédente', en: 'Previous Question' },
  { fr: 'Terminer l’examen', en: 'Finish Exam' },
  { fr: 'Terminer l\'examen', en: 'Finish Exam' },
  { fr: 'Examen terminé', en: 'Exam Completed' },
  { fr: 'Temps restant', en: 'Time Remaining' },
  { fr: 'Mode examen sécurisé (atlas masqué)', en: 'Secure Exam Mode (atlas hidden)' },
  { fr: 'Structure sélectionnée :', en: 'Selected structure:' },
  { fr: 'Structure sélectionnée', en: 'Selected structure' },
  { fr: 'Aucune structure sélectionnée', en: 'No structure selected' },
  { fr: 'Touchez directement la structure demandée dans le modèle 3D.', en: 'Tap the requested structure directly on the 3D model.' },
  { fr: 'Votre réponse…', en: 'Your answer…' },
  { fr: 'Votre réponse...', en: 'Your answer...' },
  { fr: 'Bonne réponse :', en: 'Correct answer:' },
  { fr: 'Bonne réponse', en: 'Correct answer' },
  { fr: 'Cible :', en: 'Target:' },
  { fr: 'Cible', en: 'Target' },
  { fr: 'Résultat :', en: 'Score:' },
  { fr: 'Résultat', en: 'Score' },
  { fr: 'Question libre', en: 'Open question' },
  { fr: 'Identification 3D', en: '3D Identification' },
  { fr: 'Questions sélectionnées', en: 'Selected questions' },
  { fr: 'Banque de questions FMA/UBERON', en: 'FMA/UBERON Question Bank' },
  { fr: 'Banque de questions', en: 'Question bank' },
  { fr: 'Importez directement des questions vérifiées dans votre examen.', en: 'Import verified questions directly into your exam.' },
  { fr: 'Publier l’examen sécurisé', en: 'Publish secure exam' },
  { fr: 'Publier l\'examen sécurisé', en: 'Publish secure exam' },
  { fr: 'Informations de l’examen', en: 'Exam Information' },
  { fr: 'Titre de l’examen', en: 'Exam Title' },
  { fr: 'Titre de l\'examen', en: 'Exam Title' },
  { fr: 'Description', en: 'Description' },
  { fr: 'Nouvelle question', en: 'New Question' },
  { fr: 'Énoncé de la question…', en: 'Question text…' },
  { fr: 'Choix séparés par ;', en: 'Choices separated by ;' },
  { fr: 'Ajouter la question', en: 'Add question' },
  { fr: '+ Importer', en: '+ Import' },
  { fr: 'Démarrer l’examen', en: 'Start Exam' },
  { fr: 'Démarrer l\'examen', en: 'Start Exam' },
  { fr: 'Repasser l’examen', en: 'Retake Exam' },
  { fr: 'Repasser', en: 'Retake' },
  { fr: 'Relevé de Notes', en: 'Grade Transcript' },
  { fr: 'Flashcards Maîtrisées', en: 'Mastered Flashcards' },
  { fr: 'Flashcards Cliniques', en: 'Clinical Flashcards' },
  { fr: 'Examens & Évaluations', en: 'Exams & Assessments' },
  { fr: 'Atlas 3D Rapide', en: 'Quick 3D Atlas' },
  { fr: 'Moyenne Générale', en: 'Overall Average' },
  { fr: 'Examens Complétés', en: 'Completed Exams' },
  { fr: 'Épreuves Disponibles', en: 'Available Exams' },
  { fr: 'Explorer l’Atlas 3D', en: 'Explore 3D Atlas' },
  { fr: 'Explorer l\'Atlas 3D', en: 'Explore 3D Atlas' },
  { fr: 'Retour à mon espace', en: 'Return to Workspace' },

  // Flashcards bank
  { fr: 'Révéler la réponse', en: 'Reveal answer' },
  { fr: 'Masquer la réponse', en: 'Hide answer' },
  { fr: 'J\'ai réussi (Maîtrisé)', en: 'I got it right (Mastered)' },
  { fr: 'À revoir', en: 'Needs review' },
  { fr: 'Recommencer la session', en: 'Restart session' },
  { fr: 'Perle clinique :', en: 'Clinical pearl:' },
  { fr: 'Terme latin certifié :', en: 'Certified Latin term:' },

  // Navigation and Buttons
  { fr: 'Accueil', en: 'Home' },
  { fr: 'Atlas 3D', en: '3D Atlas' },
  { fr: 'Catalogue', en: 'Catalog' },
  { fr: 'Systèmes', en: 'Systems' },
  { fr: 'Examens', en: 'Exams' },
  { fr: 'Profil', en: 'Profile' },
  { fr: 'Mon Compte', en: 'My Account' },
  { fr: 'Homme', en: 'Male' },
  { fr: 'Femme', en: 'Female' },
  { fr: 'Afficher', en: 'Show' },
  { fr: 'Masquer', en: 'Hide' },
  { fr: 'Transparence', en: 'Transparency' },
  { fr: 'Réinitialiser la vue', en: 'Reset view' },
  { fr: 'Réinitialiser', en: 'Reset' },
  { fr: 'Rechercher un organe, un système...', en: 'Search organ, system...' },
  { fr: 'Rechercher', en: 'Search' },
  { fr: 'Recherche', en: 'Search' },
  { fr: 'Fermer', en: 'Close' },
  { fr: 'Annuler', en: 'Cancel' },
  { fr: 'Enregistrer', en: 'Save' },
  { fr: 'Supprimer', en: 'Delete' },
  { fr: 'Modifier', en: 'Edit' },
  { fr: 'Détail', en: 'Details' },
  { fr: 'Actualiser', en: 'Refresh' },
  { fr: 'Se déconnecter', en: 'Sign Out' },
  { fr: 'Notifications Push (FCM)', en: 'Push Notifications (FCM)' },
  { fr: 'Notifications Firebase (FCM)', en: 'Firebase Push Notifications (FCM)' },
  { fr: 'État des notifications Push', en: 'Push Notification Status' },
  { fr: 'Activer les notifications push Web', en: 'Enable Web Push Notifications' },
  { fr: 'Actualiser la synchronisation FCM', en: 'Refresh FCM Sync' },
  { fr: 'Tester un push', en: 'Send Test Push' },
  { fr: 'Enregistrer mon profil académique', en: 'Save Academic Profile' },
  { fr: 'Matricule universitaire', en: 'University Student ID' },
  { fr: 'Matricule :', en: 'Matricule:' },
  { fr: 'Matricule', en: 'Student ID' },
  { fr: 'Université', en: 'University' },
  { fr: 'Année académique', en: 'Academic Year' },
  { fr: 'Spécialité', en: 'Specialty' },
  { fr: 'Téléphone', en: 'Phone' },
  { fr: 'Biographie', en: 'Biography' },
  { fr: 'Enregistrer les modifications', en: 'Save changes' },
  { fr: 'Retour', en: 'Back' },
  { fr: 'Tous les systèmes', en: 'All systems' },
  { fr: 'Moyenne Promotion', en: 'Cohort Average' },
  { fr: 'Copies Corrigées', en: 'Graded Submissions' },
  { fr: 'Épreuves Publiées', en: 'Published Exams' },
  { fr: 'Étudiants Inscrit(s)', en: 'Enrolled Students' },
  { fr: 'Éditeur 3D Complet', en: 'Full 3D Editor' },
  { fr: 'Création Rapide', en: 'Quick Create' },
  { fr: 'Nouvel Étudiant', en: 'New Student' },
  { fr: 'Gestion des Étudiants (CRUD Complet)', en: 'Student Management (Full CRUD)' },
  { fr: '+ Ajouter un Étudiant', en: '+ Add Student' },
  { fr: 'Ajouter l’étudiant', en: 'Add Student' },
  { fr: 'Ajouter l\'étudiant', en: 'Add Student' },
  { fr: 'Modifier le profil étudiant', en: 'Edit Student Profile' },
  { fr: 'Démonstrations 3D d’Amphithéâtre', en: '3D Lecture Hall Demonstrations' },
  { fr: 'Démonstrations 3D d\'Amphithéâtre', en: '3D Lecture Hall Demonstrations' },
  { fr: 'Lancer la Démo 3D en Amphithéâtre', en: 'Launch 3D Lecture Demo' },
  { fr: '+ Ajouter un Professeur', en: '+ Add Professor' },
  { fr: 'Liste des Utilisateurs Professeurs à Accepter', en: 'List of Professor Users to Accept' },
  { fr: 'Entrer détail profil & Accepter', en: 'Enter Profile Details & Accept' },
  { fr: 'Accepter Professeur', en: 'Accept Professor' },
  { fr: 'Refuser', en: 'Reject' },
  { fr: 'Horaire Auto', en: 'Auto Schedule' },
  { fr: 'Clair', en: 'Light' },
  { fr: 'Sombre', en: 'Dark' },
  { fr: 'Télécharger l\'application (APK)', en: 'Download App (APK)' },
  { fr: 'AnatomyZ est aussi disponible sur Android', en: 'AnatomyZ is also available on Android' },
  { fr: 'Psychologie des Couleurs & Lois UX', en: 'Color Psychology & UX Laws' },
  { fr: 'Recherche globale', en: 'Global Search' },
  { fr: 'Organes & Structures 3D', en: 'Organs & 3D Structures' },
  { fr: 'Systèmes Anatomiques', en: 'Anatomical Systems' },
  { fr: 'Actions Rapides', en: 'Quick Actions' },
  { fr: 'Guide Psychologie des Couleurs & Lois UX', en: 'Color Psychology & UX Laws Guide' },
  { fr: 'Ouvrir l’Espace Étudiant', en: 'Open Student Workspace' },
  { fr: 'Ouvrir l\'Espace Étudiant', en: 'Open Student Workspace' },
  { fr: 'Ouvrir l’Espace Professeur', en: 'Open Professor Workspace' },
  { fr: 'Ouvrir l\'Espace Professeur', en: 'Open Professor Workspace' },
  { fr: 'Ouvrir le Panneau Admin', en: 'Open Admin Panel' },
];

// Merge all TRANSLATIONS keys into phrase pairs automatically
Object.keys(TRANSLATIONS.fr).forEach((key) => {
  const fr = TRANSLATIONS.fr[key];
  const en = TRANSLATIONS.en[key];
  if (fr && en && fr !== en) {
    if (!UI_PHRASE_PAIRS.some((p) => p.fr === fr)) {
      UI_PHRASE_PAIRS.push({ fr, en });
    }
  }
});

// Sort phrases from longest to shortest to prevent partial overlapping replacements
const SORTED_FR_TO_EN = [...UI_PHRASE_PAIRS].sort(
  (a, b) => b.fr.length - a.fr.length
);
const SORTED_EN_TO_FR = [...UI_PHRASE_PAIRS].sort(
  (a, b) => b.en.length - a.en.length
);

export function translateText(rawText: string, targetLang: AppLanguage): string {
  if (!rawText || !rawText.trim()) return rawText;
  let result = rawText;

  if (targetLang === 'en') {
    for (const pair of SORTED_FR_TO_EN) {
      if (!pair.fr || !pair.en) continue;
      if (result.includes(pair.fr)) {
        result = result.replaceAll(pair.fr, pair.en);
      } else {
        const altFr = pair.fr.includes('’')
          ? pair.fr.replace(/’/g, "'")
          : pair.fr.replace(/'/g, '’');
        if (result.includes(altFr)) {
          result = result.replaceAll(altFr, pair.en);
        }
      }
    }
  } else {
    for (const pair of SORTED_EN_TO_FR) {
      if (!pair.en || !pair.fr) continue;
      if (result.includes(pair.en)) {
        result = result.replaceAll(pair.en, pair.fr);
      }
    }
  }

  return result;
}

let isMutatingDom = false;
// WeakMap caching the original source text of each node to enable non-destructive, 100% reversible translation
const originalTextByNode = new WeakMap<Node, string>();

export function applyDomTranslations(targetLang: AppLanguage) {
  if (typeof document === 'undefined') return;
  const root = document.getElementById('root');
  if (!root) return;

  isMutatingDom = true;
  try {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    let node = walker.nextNode() as Text | null;
    while (node) {
      const currentVal = node.nodeValue || '';
      if (currentVal.trim().length > 0) {
        // If not recorded yet, capture pristine text
        if (!originalTextByNode.has(node)) {
          originalTextByNode.set(node, currentVal);
        }
        const sourceVal = originalTextByNode.get(node) || currentVal;

        if (targetLang === 'en') {
          const translated = translateText(sourceVal, 'en');
          if (node.nodeValue !== translated) {
            node.nodeValue = translated;
          }
        } else {
          // In French mode, restore pristine French text
          if (node.nodeValue !== sourceVal) {
            node.nodeValue = sourceVal;
          }
        }
      }
      node = walker.nextNode() as Text | null;
    }

    const elements = root.querySelectorAll(
      '[placeholder],[title],[aria-label]'
    );
    elements.forEach((el) => {
      (['placeholder', 'title', 'aria-label'] as const).forEach((attr) => {
        const currentVal = el.getAttribute(attr);
        if (currentVal && currentVal.trim().length > 0) {
          const dataKey = `data-orig-${attr}`;
          let sourceVal = el.getAttribute(dataKey);
          if (!sourceVal) {
            sourceVal = currentVal;
            el.setAttribute(dataKey, currentVal);
          }

          if (targetLang === 'en') {
            const translated = translateText(sourceVal, 'en');
            if (el.getAttribute(attr) !== translated) {
              el.setAttribute(attr, translated);
            }
          } else {
            if (el.getAttribute(attr) !== sourceVal) {
              el.setAttribute(attr, sourceVal);
            }
          }
        }
      });
    });
  } catch (err) {
    console.warn('applyDomTranslations error safely caught:', err);
  } finally {
    isMutatingDom = false;
  }
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

  const currentLangRef = useRef<AppLanguage>(lang);
  currentLangRef.current = lang;

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', resolvedTheme);
      document.documentElement.setAttribute('lang', lang);

      // Apply translations immediately
      applyDomTranslations(lang);

      const root = document.getElementById('root');
      if (!root) return;

      let rafId = 0;
      const observer = new MutationObserver(() => {
        if (isMutatingDom) return;
        if (rafId) cancelAnimationFrame(rafId);
        rafId = requestAnimationFrame(() => {
          if (!isMutatingDom) {
            applyDomTranslations(currentLangRef.current);
          }
        });
      });

      observer.observe(root, {
        childList: true,
        subtree: true,
        characterData: true,
      });

      return () => {
        if (rafId) cancelAnimationFrame(rafId);
        observer.disconnect();
      };
    }
  }, [resolvedTheme, lang]);

  const setLang = (next: AppLanguage) => {
    currentLangRef.current = next;
    setLangState(next);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('anatomyz_lang', next);
    }
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('lang', next);
      applyDomTranslations(next);
    }
  };

  const setThemePreference = (next: ThemePreference) => {
    setThemePrefState(next);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('anatomyz_theme_pref', next);
    }
  };

  const t = (key: string): string => {
    const direct = TRANSLATIONS[lang]?.[key];
    if (direct) return direct;
    return translateText(key, lang);
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
