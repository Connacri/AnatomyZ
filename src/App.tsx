import React, { useEffect, useRef, useState } from 'react';
import {
  ArrowLeft,
  BookOpen,
  Box,
  CheckCircle2,
  ChevronRight,
  Clock,
  Eye,
  EyeOff,
  FilePlus,
  FileText,
  GraduationCap,
  History,
  Layers,
  Lock,
  Menu,
  Plus,
  RotateCcw,
  Search,
  Shield,
  Sparkles,
  User,
  Users,
  X,
  ZoomIn,
  ZoomOut,
  Bell,
  BellRing,
} from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  AcademicRepository,
  AnatomyCatalogRepository,
  AnatomyExamRepository,
  AnatomyModelRepository,
  AnatomyQuestionBankRepository,
  RemoteAnatomyCatalogRepository,
  RemoteAnatomyRelationRepository,
  gradeForPercentage,
} from './data/repositories';
import {
  auth,
  loginWithGoogle,
  logoutUser,
  getUserProfile,
  registerNewUser,
  updateUserRole,
  isSuperAdminEmail,
  saveExamResult,
  saveUserHistoryEntry,
  requestWebPushPermissionAndToken,
  saveFcmToken,
  getStoredFcmTokens,
  deleteStoredFcmToken,
  subscribeToForegroundMessages,
  createNotificationRecord,
  FcmTokenRecord,
  UserRecord,
} from './firebase';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { AnatomyZLogo } from './components/AnatomyZLogo';
import { SplashScreen } from './components/SplashScreen';
import { AdminDashboard } from './components/AdminDashboard';
import { FcmNotificationsModal } from './components/FcmNotificationsModal';
import { UserProfileModal } from './components/UserProfileModal';
import {
  Interactive3DControllerHandle,
  Interactive3DViewer,
} from './components/Interactive3DViewer';
import {
  AnatomyExam,
  AnatomyExamQuestion,
  AnatomyHistoryType,
  AnatomyRelation,
  AnatomyRole,
  AnatomySex,
  AnatomyStructure,
  AnatomySystemInfo,
  EntityData,
  ExamAssignmentStatus,
  ExamQuestionType,
} from './types';

type ScreenState =
  | { name: 'home' }
  | { name: 'academic_dashboard'; role: AnatomyRole }
  | { name: 'professor_exam_editor'; role: AnatomyRole }
  | { name: 'anatomy_home'; role?: AnatomyRole }
  | { name: 'student_exam'; role: AnatomyRole; exam: AnatomyExam }
  | { name: 'admin_dashboard' };

export function GoogleIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.65v3.03h3.88c2.27-2.09 3.665-5.17 3.665-9.12z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.03c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.27v3.13C3.26 21.36 7.33 24 12 24z"
      />
      <path
        fill="#FBBC05"
        d="M5.28 14.29c-.25-.72-.38-1.49-.38-2.29s.13-1.57.38-2.29V6.57H1.27C.46 8.2 0 10.04 0 12s.46 3.8 1.27 5.43l4.01-3.14z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.27 6.57l4.01 3.14c.95-2.83 3.6-4.96 6.72-4.96z"
      />
    </svg>
  );
}

interface NewUserRoleModalProps {
  user: FirebaseUser;
  onSelectRole: (role: 'student' | 'professor' | 'admin') => Promise<void>;
  loading: boolean;
}

function NewUserRoleModal({
  user,
  onSelectRole,
  loading,
}: NewUserRoleModalProps) {
  const [selectedRole, setSelectedRole] = useState<'student' | 'professor' | 'admin'>('student');
  const isSuper = isSuperAdminEmail(user.email);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-lg rounded-3xl bg-[#1E242C] border-2 border-[#D8CCBF] shadow-2xl p-6 sm:p-8 space-y-6 text-[#FAF6F0]">
        <div className="text-center space-y-2">
          <div className="w-16 h-16 rounded-2xl mx-auto bg-[#ECE3D9] flex items-center justify-center shadow-lg border border-[#D8CCBF]">
            <AnatomyZLogo className="w-12 h-12" />
          </div>
          <h2 className="text-2xl font-bold text-[#FAF6F0]">
            Bienvenue sur AnatomyZ
          </h2>
          <p className="text-sm text-[#BAC3CE]">
            Bonjour <strong className="text-[#ECE3D9]">{user.displayName || user.email}</strong>. Pour configurer votre profil, veuillez sélectionner votre rôle universitaire :
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <button
            type="button"
            onClick={() => setSelectedRole('student')}
            className={`p-4 rounded-2xl border-2 text-left transition cursor-pointer flex flex-col justify-between ${
              selectedRole === 'student'
                ? 'border-[#ECE3D9] bg-[#646D79]/40 text-[#FAF6F0] shadow-lg'
                : 'border-[#323B46] bg-[#15191E] text-[#BAC3CE] hover:border-[#455160]'
            }`}
          >
            <div className="w-10 h-10 rounded-xl bg-sky-500/20 text-sky-300 flex items-center justify-center mb-3">
              <User className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-base text-[#FAF6F0]">Étudiant</div>
              <p className="text-xs text-[#BAC3CE] mt-1">
                Explorer l&apos;atlas 3D, passer les examens et enregistrer mes notes sur Firestore.
              </p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setSelectedRole('professor')}
            className={`p-4 rounded-2xl border-2 text-left transition cursor-pointer flex flex-col justify-between ${
              selectedRole === 'professor'
                ? 'border-[#ECE3D9] bg-[#646D79]/40 text-[#FAF6F0] shadow-lg'
                : 'border-[#323B46] bg-[#15191E] text-[#BAC3CE] hover:border-[#455160]'
            }`}
          >
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-300 flex items-center justify-center mb-3">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-base text-[#FAF6F0]">Professeur</div>
              <p className="text-xs text-[#BAC3CE] mt-1">
                Concevoir des quiz, créer des examens et gérer les promotions académiques.
              </p>
            </div>
          </button>
        </div>

        {isSuper && (
          <div className="p-3.5 rounded-2xl bg-amber-950/40 border border-amber-500/40 flex items-center justify-between text-xs text-amber-200">
            <span>Privilège super-administrateur détecté ({user.email})</span>
            <button
              type="button"
              onClick={() => setSelectedRole('admin')}
              className={`px-3 py-1.5 rounded-xl font-bold transition cursor-pointer ${
                selectedRole === 'admin'
                  ? 'bg-amber-500 text-black'
                  : 'bg-amber-900/50 text-amber-300'
              }`}
            >
              Mode Admin
            </button>
          </div>
        )}

        <button
          type="button"
          disabled={loading}
          onClick={() => onSelectRole(selectedRole)}
          className="w-full min-h-[48px] rounded-xl bg-[#ECE3D9] hover:bg-[#FAF6F0] text-[#1E242C] font-bold text-sm shadow-xl transition cursor-pointer flex items-center justify-center gap-2 active:scale-98"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-[#1E242C] border-t-transparent rounded-full animate-spin" />
          ) : (
            <span>Confirmer et accéder à AnatomyZ</span>
          )}
        </button>
      </div>
    </div>
  );
}

function TopNavBar({
  currentUser,
  authLoading,
  activeRole,
  isAdmin,
  onOpenAdmin,
  onOpenFcm,
  hasFcmToken,
  onSignIn,
  onOpenProfile,
  onGoHome,
  onOpenAtlas,
  onOpenSplash,
}: {
  currentUser: FirebaseUser | null;
  authLoading: boolean;
  activeRole?: AnatomyRole;
  isAdmin?: boolean;
  onOpenAdmin?: () => void;
  onOpenFcm: () => void;
  hasFcmToken?: boolean;
  onSignIn: () => void;
  onOpenProfile: () => void;
  onGoHome: () => void;
  onOpenAtlas: () => void;
  onOpenSplash: () => void;
}) {
  return (
    <header className="sticky top-0 z-40 h-14 border-b border-[#323B46] bg-[#1E242C]/95 backdrop-blur-md px-3 sm:px-6 flex items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onGoHome}
          className="flex items-center gap-2.5 text-left cursor-pointer group"
        >
          <AnatomyZLogo className="w-8 h-8 rounded-lg shadow-sm group-hover:scale-105 transition" />
          <span className="font-bold text-sm sm:text-base tracking-tight text-[#FAF6F0] group-hover:text-[#ECE3D9] transition">
            AnatomyZ
          </span>
        </button>

        <span className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-[#15191E] border border-[#323B46] text-[#DACBA9]">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          Plateforme Académique
        </span>
      </div>

      <div className="flex items-center gap-2">
        {isAdmin && onOpenAdmin && (
          <button
            type="button"
            onClick={onOpenAdmin}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-amber-500/50 bg-amber-950/40 hover:bg-amber-900/50 text-xs font-bold text-amber-300 transition cursor-pointer"
            title="Panneau Administrateur"
          >
            <Shield className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Admin</span>
          </button>
        )}

        {/* Notifications FCM button */}
        <button
          type="button"
          onClick={onOpenFcm}
          className="relative inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-[#455160] bg-[#15191E] hover:border-[#ECE3D9] text-xs font-semibold text-[#ECE3D9] transition cursor-pointer"
          title="Gestion des Notifications Push (FCM)"
        >
          <Bell className="w-3.5 h-3.5 text-[#ECE3D9]" />
          {hasFcmToken && (
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-[#1E242C] animate-pulse" />
          )}
          <span className="hidden sm:inline">FCM</span>
        </button>

        <button
          type="button"
          onClick={onOpenSplash}
          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-[#455160] bg-[#15191E] hover:border-[#ECE3D9] text-xs font-medium text-[#FAF6F0] transition cursor-pointer"
          title="Afficher l'écran splash de l'application"
        >
          <Sparkles className="w-3.5 h-3.5 text-[#ECE3D9]" />
          <span className="hidden sm:inline">Splash</span>
        </button>

        <button
          type="button"
          onClick={onOpenAtlas}
          className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#455160] bg-[#15191E] hover:border-[#ECE3D9] text-xs font-semibold text-[#FAF6F0] transition cursor-pointer"
        >
          <Box className="w-3.5 h-3.5 text-[#ECE3D9]" />
          <span>Atlas 3D</span>
        </button>

        {authLoading ? (
          <div className="w-7 h-7 rounded-full border-2 border-[#ECE3D9] border-t-transparent animate-spin" />
        ) : currentUser ? (
          <button
            type="button"
            onClick={onOpenProfile}
            className="flex items-center gap-2 p-1 pl-2 pr-2.5 rounded-xl bg-[#15191E] border border-[#323B46] hover:border-[#ECE3D9] text-xs font-medium transition cursor-pointer"
          >
            {currentUser.photoURL ? (
              <img
                src={currentUser.photoURL}
                alt={currentUser.displayName || 'Photo'}
                className="w-6 h-6 rounded-full"
              />
            ) : (
              <div className="w-6 h-6 rounded-full bg-[#2A323D] text-[#ECE3D9] flex items-center justify-center text-xs font-bold">
                {(currentUser.displayName || currentUser.email || 'U')[0].toUpperCase()}
              </div>
            )}
            <span className="max-w-[110px] truncate text-[#FAF6F0] hidden sm:inline">
              {currentUser.displayName?.split(' ')[0] || 'Mon Compte'}
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-[#2A323D] text-[#ECE3D9] font-semibold border border-[#455160]">
              {isAdmin ? 'Admin' : activeRole === AnatomyRole.Professor ? 'Professeur' : 'Étudiant'}
            </span>
          </button>
        ) : (
          <button
            type="button"
            onClick={onSignIn}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#FAF6F0] hover:bg-[#ECE3D9] text-[#1E242C] text-xs font-semibold shadow-sm transition cursor-pointer active:scale-95"
          >
            <GoogleIcon className="w-3.5 h-3.5" />
            <span>Connexion Google</span>
          </button>
        )}
      </div>
    </header>
  );
}

export function App() {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserRecord | null>(null);
  const [needsRoleSelection, setNeedsRoleSelection] = useState<boolean>(false);
  const [roleSaving, setRoleSaving] = useState<boolean>(false);
  const [showSplash, setShowSplash] = useState<boolean>(false);
  const [authLoading, setAuthLoading] = useState<boolean>(true);
  const [profileModalOpen, setProfileModalOpen] = useState<boolean>(false);
  const [userRole, setUserRole] = useState<'student' | 'professor' | 'admin'>('student');
  const [authError, setAuthError] = useState<string | null>(null);

  // FCM Cloud Messaging state
  const [fcmModalOpen, setFcmModalOpen] = useState<boolean>(false);
  const [fcmToken, setFcmToken] = useState<string | null>(null);
  const [fcmTokensList, setFcmTokensList] = useState<FcmTokenRecord[]>([]);
  const [fcmLoading, setFcmLoading] = useState<boolean>(false);
  const [fcmError, setFcmError] = useState<string | null>(null);
  const [activeNotificationToast, setActiveNotificationToast] = useState<{
    title: string;
    body: string;
  } | null>(null);

  const isAdmin =
    userProfile?.role === 'admin' || isSuperAdminEmail(currentUser?.email);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      setAuthLoading(false);
      if (user) {
        try {
          const profile = await getUserProfile(user.uid);
          if (!profile) {
            // New user: must choose role
            setNeedsRoleSelection(true);
          } else {
            setUserProfile(profile);
            setUserRole(profile.role);
            if (profile.fcmToken) {
              setFcmToken(profile.fcmToken);
            }
          }
        } catch (err: any) {
          console.error('Erreur chargement profil utilisateur:', err);
          // Fallback to new user role selection
          setNeedsRoleSelection(true);
        }

        // Fetch stored FCM tokens for multi-device sync
        try {
          const tokens = await getStoredFcmTokens(user.uid);
          if (tokens && tokens.length > 0) {
            setFcmTokensList(tokens);
            const webTok = tokens.find((t) => t.platform === 'web');
            if (webTok) {
              setFcmToken(webTok.token);
            }
          }
        } catch (tokErr) {
          console.warn('Erreur récupération tokens FCM:', tokErr);
        }
      } else {
        setUserProfile(null);
        setNeedsRoleSelection(false);
        setFcmToken(null);
        setFcmTokensList([]);
      }
    });
    return () => unsub();
  }, []);

  // Foreground FCM message subscription
  useEffect(() => {
    let unsubMessaging: (() => void) | null = null;
    subscribeToForegroundMessages((payload) => {
      const title =
        payload?.notification?.title ||
        payload?.data?.title ||
        '🔔 Notification AnatomyZ';
      const body =
        payload?.notification?.body ||
        payload?.data?.body ||
        'Nouveau message push synchronisé.';
      setActiveNotificationToast({ title, body });
      setTimeout(() => setActiveNotificationToast(null), 6000);
    }).then((unsub) => {
      if (unsub) unsubMessaging = unsub;
    });

    return () => {
      if (unsubMessaging) unsubMessaging();
    };
  }, []);

  const handleEnableFcm = async () => {
    setFcmLoading(true);
    setFcmError(null);
    try {
      const res = await requestWebPushPermissionAndToken(currentUser?.uid);
      if (res.error) {
        setFcmError(res.error);
      } else if (res.token) {
        setFcmToken(res.token);
        if (currentUser) {
          const updated = await getStoredFcmTokens(currentUser.uid);
          setFcmTokensList(updated);
        }
      }
    } catch (err: any) {
      setFcmError(err?.message || 'Erreur lors de l’activation des notifications FCM.');
    } finally {
      setFcmLoading(false);
    }
  };

  const handleRefreshFcmTokens = async () => {
    if (!currentUser) return;
    try {
      const list = await getStoredFcmTokens(currentUser.uid);
      setFcmTokensList(list);
    } catch (err: any) {
      console.warn(err);
    }
  };

  const handleDeleteFcmToken = async (tokenId: string) => {
    if (!currentUser) return;
    try {
      await deleteStoredFcmToken(currentUser.uid, tokenId);
      setFcmTokensList((prev) => prev.filter((t) => t.id !== tokenId));
      if (fcmTokensList.length <= 1) {
        setFcmToken(null);
      }
    } catch (err: any) {
      setFcmError(err?.message || 'Erreur suppression token');
    }
  };

  const handleSendTestNotification = async () => {
    const targetId = currentUser?.uid || 'guest_demo';
    const notif = {
      id: `test_${Date.now()}`,
      targetUserId: targetId,
      title: '🔔 AnatomyZ — Push FCM Persisté',
      body: 'Votre token FCM fonctionne et est synchronisé dans Firestore !',
      category: 'system' as const,
      createdAt: new Date().toISOString(),
    };

    if (currentUser) {
      try {
        await createNotificationRecord(notif);
      } catch (e) {
        console.warn(e);
      }
    }

    setActiveNotificationToast({
      title: notif.title,
      body: notif.body,
    });
    setTimeout(() => setActiveNotificationToast(null), 6000);

    if (
      typeof window !== 'undefined' &&
      'Notification' in window &&
      Notification.permission === 'granted'
    ) {
      try {
        new Notification(notif.title, {
          body: notif.body,
          icon: '/icon.png',
        });
      } catch (e) {
        console.warn(e);
      }
    }
  };

  const handleNewUserRoleSelected = async (
    chosenRole: 'student' | 'professor' | 'admin'
  ) => {
    if (!currentUser) return;
    setRoleSaving(true);
    try {
      const record = await registerNewUser(currentUser, chosenRole);
      setUserProfile(record);
      setUserRole(record.role);
      setNeedsRoleSelection(false);
    } catch (err: any) {
      setAuthError(err?.message || 'Erreur lors de la création du compte.');
    } finally {
      setRoleSaving(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setAuthError(null);
      await loginWithGoogle();
    } catch (err: any) {
      setAuthError(err?.message || 'Erreur lors de la connexion Google');
    }
  };

  const handleSignOut = async () => {
    try {
      await logoutUser();
      setUserProfile(null);
      setProfileModalOpen(false);
    } catch (err: any) {
      console.error(err);
    }
  };

  const [historyStack, setHistoryStack] = useState<ScreenState[]>(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash.toLowerCase();
      if (hash === '#professor') {
        return [
          { name: 'home' },
          { name: 'academic_dashboard', role: AnatomyRole.Professor },
        ];
      }
      if (hash === '#student') {
        return [
          { name: 'home' },
          { name: 'academic_dashboard', role: AnatomyRole.Student },
        ];
      }
      if (hash === '#atlas') {
        return [{ name: 'home' }, { name: 'anatomy_home' }];
      }
    }
    return [{ name: 'home' }];
  });

  useEffect(() => {
    const onHashChange = () => {
      const hash = window.location.hash.toLowerCase();
      if (hash === '#professor') {
        setUserRole('professor');
        setHistoryStack([
          { name: 'home' },
          { name: 'academic_dashboard', role: AnatomyRole.Professor },
        ]);
      } else if (hash === '#student') {
        setUserRole('student');
        setHistoryStack([
          { name: 'home' },
          { name: 'academic_dashboard', role: AnatomyRole.Student },
        ]);
      } else if (hash === '#atlas') {
        setHistoryStack([{ name: 'home' }, { name: 'anatomy_home' }]);
      } else if (hash === '' || hash === '#') {
        setHistoryStack([{ name: 'home' }]);
      }
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  const currentScreen = historyStack[historyStack.length - 1];

  const pushScreen = (next: ScreenState) => {
    if ('role' in next && next.role) {
      setUserRole(next.role === AnatomyRole.Professor ? 'professor' : 'student');
    }
    setHistoryStack((prev) => [...prev, next]);
  };

  const replaceTopScreen = (next: ScreenState) => {
    if ('role' in next && next.role) {
      setUserRole(next.role === AnatomyRole.Professor ? 'professor' : 'student');
    }
    setHistoryStack((prev) => [...prev.slice(0, -1), next]);
  };

  const popScreen = () => {
    setHistoryStack((prev) => (prev.length > 1 ? prev.slice(0, -1) : prev));
  };

  const activeRole: AnatomyRole | undefined =
    'role' in currentScreen ? currentScreen.role : undefined;

  const showMobileBottomNav =
    activeRole !== undefined && currentScreen.name !== 'student_exam';

  return (
    <div className="min-h-screen bg-[#15191E] text-[#FAF6F0] flex flex-col">
      {showSplash && (
        <SplashScreen onDismiss={() => setShowSplash(false)} autoClose={false} />
      )}

      {needsRoleSelection && currentUser && (
        <NewUserRoleModal
          user={currentUser}
          onSelectRole={handleNewUserRoleSelected}
          loading={roleSaving}
        />
      )}

      <TopNavBar
        currentUser={currentUser}
        authLoading={authLoading}
        activeRole={activeRole}
        isAdmin={isAdmin}
        onOpenAdmin={() => pushScreen({ name: 'admin_dashboard' })}
        onOpenFcm={() => setFcmModalOpen(true)}
        hasFcmToken={!!fcmToken}
        onSignIn={handleGoogleSignIn}
        onOpenProfile={() => setProfileModalOpen(true)}
        onGoHome={() => setHistoryStack([{ name: 'home' }])}
        onOpenAtlas={() => pushScreen({ name: 'anatomy_home', role: activeRole })}
        onOpenSplash={() => setShowSplash(true)}
      />

      {/* Push Notification In-App Toast */}
      {activeNotificationToast && (
        <div className="fixed top-16 right-4 z-50 max-w-sm w-full animate-in slide-in-from-top duration-300">
          <div className="p-4 rounded-2xl bg-[#1E242C] border-2 border-emerald-500 shadow-2xl flex items-start gap-3 text-[#FAF6F0]">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
              <BellRing className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-bold text-xs text-emerald-300">
                {activeNotificationToast.title}
              </div>
              <p className="text-xs text-[#BAC3CE] mt-0.5 leading-snug">
                {activeNotificationToast.body}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setActiveNotificationToast(null)}
              className="text-[#8C97A5] hover:text-[#FAF6F0] p-1 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* FCM Notifications Management Modal */}
      <FcmNotificationsModal
        isOpen={fcmModalOpen}
        onClose={() => setFcmModalOpen(false)}
        currentUser={currentUser}
        userProfile={userProfile}
        fcmToken={fcmToken}
        tokensList={fcmTokensList}
        onEnableNotifications={handleEnableFcm}
        onRefreshTokens={handleRefreshFcmTokens}
        onDeleteToken={handleDeleteFcmToken}
        onSendTestNotification={handleSendTestNotification}
        loading={fcmLoading}
        error={fcmError}
      />

      {authError && (
        <div className="bg-rose-950/80 border-b border-rose-500/50 px-4 py-2 text-xs text-rose-200 flex items-center justify-between">
          <span>{authError}</span>
          <button
            type="button"
            onClick={() => setAuthError(null)}
            className="text-rose-300 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {profileModalOpen && currentUser && (
        <UserProfileModal
          isOpen={profileModalOpen}
          onClose={() => setProfileModalOpen(false)}
          currentUser={currentUser}
          userProfile={userProfile}
          onProfileUpdated={(updated) => {
            setUserProfile(updated);
          }}
          isAdmin={isAdmin}
          onOpenAdmin={() => pushScreen({ name: 'admin_dashboard' })}
          onOpenNotifications={() => setFcmModalOpen(true)}
          onSignOut={handleSignOut}
          onNavigateToExams={() =>
            pushScreen({
              name: 'academic_dashboard',
              role: AnatomyRole.Student,
            })
          }
        />
      )}

      <div
        className={`flex-1 flex flex-col ${
          showMobileBottomNav ? 'pb-16 md:pb-0' : ''
        }`}
      >
        {currentScreen.name === 'home' && (
          <HomeScreen
            currentUser={currentUser}
            onSignIn={handleGoogleSignIn}
            onOpenProfile={() => setProfileModalOpen(true)}
            onSelectRole={(role) =>
              pushScreen({ name: 'academic_dashboard', role })
            }
            onOpenAtlas={() => pushScreen({ name: 'anatomy_home' })}
          />
        )}

        {currentScreen.name === 'admin_dashboard' && (
          <AdminDashboard
            onBack={popScreen}
            currentAdminEmail={currentUser?.email}
          />
        )}

        {currentScreen.name === 'academic_dashboard' && (
          <AcademicDashboardScreen
            role={currentScreen.role}
            onBack={() => setHistoryStack([{ name: 'home' }])}
            onOpenAtlas={() =>
              pushScreen({ name: 'anatomy_home', role: currentScreen.role })
            }
            onOpenExamEditor={() =>
              pushScreen({
                name: 'professor_exam_editor',
                role: currentScreen.role,
              })
            }
            onStartExam={(exam) =>
              pushScreen({
                name: 'student_exam',
                role: currentScreen.role,
                exam,
              })
            }
          />
        )}

        {currentScreen.name === 'professor_exam_editor' && (
          <ProfessorExamEditorScreen onBack={popScreen} />
        )}

        {currentScreen.name === 'anatomy_home' && (
          <AnatomyHomeScreen onBack={popScreen} />
        )}

        {currentScreen.name === 'student_exam' && (
          <StudentExamScreen
            exam={currentScreen.exam}
            currentUser={currentUser}
            onFinish={popScreen}
          />
        )}
      </div>

      {/* Mobile Bottom Navigation (Only shown on mobile inside a Role workspace) */}
      {showMobileBottomNav && activeRole && (
        <nav
          aria-label="Navigation mobile"
          className={`fixed bottom-0 left-0 right-0 z-30 md:hidden bg-[#0d1a2b]/95 backdrop-blur-md border-t border-[#203651] grid ${
            activeRole === AnatomyRole.Professor ? 'grid-cols-3' : 'grid-cols-2'
          } items-center h-16 px-2`}
        >
          <button
            type="button"
            onClick={() =>
              replaceTopScreen({ name: 'academic_dashboard', role: activeRole })
            }
            className={`min-h-[48px] flex flex-col items-center justify-center rounded-xl transition cursor-pointer ${
              currentScreen.name === 'academic_dashboard'
                ? 'text-[#8fc5ff]'
                : 'text-[#71839b] hover:text-[#eef4ff]'
            }`}
          >
            <Layers className="w-5 h-5" />
            <span className="text-[11px] font-medium mt-1 whitespace-nowrap">
              {activeRole === AnatomyRole.Professor
                ? 'Espace Professeur'
                : 'Espace Étudiant'}
            </span>
          </button>

          {activeRole === AnatomyRole.Professor && (
            <button
              type="button"
              onClick={() =>
                replaceTopScreen({
                  name: 'professor_exam_editor',
                  role: activeRole,
                })
              }
              className={`min-h-[48px] flex flex-col items-center justify-center rounded-xl transition cursor-pointer ${
                currentScreen.name === 'professor_exam_editor'
                  ? 'text-[#8fc5ff]'
                  : 'text-[#71839b] hover:text-[#eef4ff]'
              }`}
            >
              <FilePlus className="w-5 h-5" />
              <span className="text-[11px] font-medium mt-1 whitespace-nowrap">
                Créer un examen
              </span>
            </button>
          )}

          <button
            type="button"
            onClick={() =>
              replaceTopScreen({ name: 'anatomy_home', role: activeRole })
            }
            className={`min-h-[48px] flex flex-col items-center justify-center rounded-xl transition cursor-pointer ${
              currentScreen.name === 'anatomy_home'
                ? 'text-[#8fc5ff]'
                : 'text-[#71839b] hover:text-[#eef4ff]'
            }`}
          >
            <Box className="w-5 h-5" />
            <span className="text-[11px] font-medium mt-1 whitespace-nowrap">
              Atlas 3D
            </span>
          </button>
        </nav>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* 1. Unified Home & Role Selection Screen (site/index.html + Flutter Home)   */
/* -------------------------------------------------------------------------- */

function HomeScreen({
  currentUser,
  onSignIn,
  onOpenProfile,
  onSelectRole,
  onOpenAtlas,
}: {
  currentUser: FirebaseUser | null;
  onSignIn: () => void;
  onOpenProfile: () => void;
  onSelectRole: (role: AnatomyRole) => void;
  onOpenAtlas: () => void;
}) {
  return (
    <div className="flex-1 bg-[#08111f] text-[#eef4ff]">
      <main className="max-w-[1000px] mx-auto px-6 py-10 sm:py-16">
        <span className="inline-block px-3.5 py-1.5 border border-[#2c4a70] rounded-full text-xs sm:text-sm text-[#8fc5ff]">
          AnatomyZ · Human 3D Anatomy
        </span>

        <h1 className="text-[clamp(40px,7vw,72px)] font-bold leading-none mt-5 mb-3">
          AnatomyZ
        </h1>

        <p className="text-base sm:text-[18px] leading-[1.7] text-[#b8c7da] max-w-3xl">
          Un atlas anatomique humain 3D natif Flutter et Web, construit autour
          d&apos;un Knowledge Graph anatomique, des ontologies FMA/UBERON et de
          modèles GLB/GLTF vérifiés progressivement.
        </p>

        {/* Google Authentication & Firebase Cloud Sync Card */}
        <div className="mt-7 p-4 sm:p-5 rounded-2xl border border-[#2c4a70] bg-[#0d1a2b] shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start sm:items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center shrink-0">
                <GoogleIcon className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-sm sm:text-base text-white">
                    {currentUser ? 'Compte Google Connecté' : 'Authentification Google & Cloud'}
                  </h3>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30">
                    Session Active
                  </span>
                </div>
                <p className="text-xs text-[#b8c7da] mt-0.5 max-w-xl">
                  {currentUser
                    ? `Connecté en tant que ${currentUser.displayName || currentUser.email} · Vos notes, examens et progression sont enregistrés.`
                    : 'Connectez-vous avec votre compte Google pour enregistrer vos résultats d’examens, compléter votre profil et suivre vos notes.'}
                </p>
              </div>
            </div>

            <div className="shrink-0 flex items-center gap-2">
              {currentUser ? (
                <button
                  type="button"
                  onClick={onOpenProfile}
                  className="w-full sm:w-auto min-h-[42px] px-4 py-2 rounded-xl bg-[#13253d] hover:bg-[#1a3252] border border-[#2c4a70] text-xs font-semibold text-[#8fc5ff] inline-flex items-center justify-center gap-2 transition cursor-pointer"
                >
                  <User className="w-4 h-4" />
                  <span>Mon Compte Google</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={onSignIn}
                  className="w-full sm:w-auto min-h-[42px] px-4 py-2 rounded-xl bg-white hover:bg-gray-100 text-gray-900 text-xs font-bold shadow-md inline-flex items-center justify-center gap-2 transition cursor-pointer active:scale-95"
                >
                  <GoogleIcon className="w-4 h-4" />
                  <span>Se connecter avec Google</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Single Role Selection Section (No duplicate role buttons or pages) */}
        <section aria-labelledby="role-heading" className="mt-8 mb-10">
          <h2
            id="role-heading"
            className="text-sm font-semibold uppercase tracking-wider text-[#8fc5ff] mb-3.5"
          >
            Choisissez votre rôle
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => onSelectRole(AnatomyRole.Professor)}
              className="min-h-[88px] text-left p-5 rounded-[18px] border border-[#203651] bg-[#0d1a2b] hover:border-[#8fc5ff] hover:bg-[#112238] active:scale-[0.99] transition flex items-center gap-4 group cursor-pointer"
            >
              <div className="w-12 h-12 rounded-xl bg-indigo-500/15 border border-indigo-400/30 flex items-center justify-center text-[#8fc5ff] shrink-0">
                <GraduationCap className="w-6 h-6" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-lg font-bold text-[#eef4ff] group-hover:text-[#8fc5ff] transition">
                  Professeur
                </div>
                <p className="text-sm text-[#b8c7da]">
                  Créer des quiz, gérer les classes et publier des examens
                </p>
              </div>
              <ChevronRight className="w-5 h-5 text-[#71839b] group-hover:text-[#8fc5ff] shrink-0 transition" />
            </button>

            <button
              type="button"
              onClick={() => onSelectRole(AnatomyRole.Student)}
              className="min-h-[88px] text-left p-5 rounded-[18px] border border-[#203651] bg-[#0d1a2b] hover:border-[#8fc5ff] hover:bg-[#112238] active:scale-[0.99] transition flex items-center gap-4 group cursor-pointer"
            >
              <div className="w-12 h-12 rounded-xl bg-indigo-500/15 border border-indigo-400/30 flex items-center justify-center text-[#8fc5ff] shrink-0">
                <User className="w-6 h-6" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-lg font-bold text-[#eef4ff] group-hover:text-[#8fc5ff] transition">
                  Étudiant
                </div>
                <p className="text-sm text-[#b8c7da]">
                  Consulter les examens assignés, les passer et suivre ses notes
                </p>
              </div>
              <ChevronRight className="w-5 h-5 text-[#71839b] group-hover:text-[#8fc5ff] shrink-0 transition" />
            </button>
          </div>

          <div className="mt-4">
            <button
              type="button"
              onClick={onOpenAtlas}
              className="w-full sm:w-auto min-h-[48px] px-5 py-3 rounded-[14px] border border-[#2c4a70] bg-[#0d1a2b] hover:bg-[#142740] hover:border-[#8fc5ff] text-[#eef4ff] font-semibold text-sm inline-flex items-center justify-center gap-2.5 transition cursor-pointer"
            >
              <Box className="w-4 h-4 text-[#8fc5ff]" />
              <span>Explorer directement l’atlas 3D</span>
            </button>
          </div>
        </section>

        {/* The 4 Architecture Cards from site/index.html (Shown once) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 my-9">
          <section className="p-[22px] border border-[#203651] rounded-[18px] bg-[#0d1a2b]">
            <h3 className="text-lg font-bold mb-2">🧠 Knowledge Graph</h3>
            <p className="text-sm sm:text-[15px] leading-[1.6] text-[#b8c7da]">
              Structures, synonymes et relations anatomiques.
            </p>
          </section>

          <section className="p-[22px] border border-[#203651] rounded-[18px] bg-[#0d1a2b]">
            <h3 className="text-lg font-bold mb-2">🦴 3D Anatomy</h3>
            <p className="text-sm sm:text-[15px] leading-[1.6] text-[#b8c7da]">
              Modèles GLB/GLTF, sélection, visibilité et matériaux.
            </p>
          </section>

          <section className="p-[22px] border border-[#203651] rounded-[18px] bg-[#0d1a2b]">
            <h3 className="text-lg font-bold mb-2">🔗 Mapping Engine</h3>
            <p className="text-sm sm:text-[15px] leading-[1.6] text-[#b8c7da]">
              Correspondances exactes, xrefs et mappings vérifiés.
            </p>
          </section>

          <section className="p-[22px] border border-[#203651] rounded-[18px] bg-[#0d1a2b]">
            <h3 className="text-lg font-bold mb-2">🎓 Education</h3>
            <p className="text-sm sm:text-[15px] leading-[1.6] text-[#b8c7da]">
              Professeur, étudiant, quiz, questions et mode examen sécurisé.
            </p>
          </section>
        </div>

        <div className="flex flex-wrap items-center gap-6 text-sm sm:text-base">
          <a
            href="https://github.com/Connacri/AnatomyZ/releases/latest/download/AnatomyZ-release.apk"
            target="_blank"
            rel="noreferrer"
            className="text-[#8fc5ff] hover:underline"
          >
            → Télécharger APK (Release)
          </a>
          <a
            href="https://github.com/Connacri/AnatomyZ/releases/latest/download/AnatomyZ-release.aab"
            target="_blank"
            rel="noreferrer"
            className="text-[#8fc5ff] hover:underline"
          >
            → Télécharger AAB (Release)
          </a>
          <a
            href="./catalog/index.json"
            className="text-[#8fc5ff] hover:underline"
          >
            → Catalogue anatomique
          </a>
          <a
            href="https://github.com/Connacri/AnatomyZ"
            target="_blank"
            rel="noreferrer"
            className="text-[#8fc5ff] hover:underline"
          >
            → Dépôt GitHub
          </a>
        </div>

        <footer className="mt-12 text-sm text-[#71839b]">
          Projet académique — Professeur Zenasni Kamel
        </footer>
      </main>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* 2. Anatomy Home Screen (3D Atlas & FMA/UBERON Catalog)                     */
/* -------------------------------------------------------------------------- */

const modelRepo = new AnatomyModelRepository();
const localCatalog = new AnatomyCatalogRepository();
const remoteCatalog = new RemoteAnatomyCatalogRepository();
const relationRepo = new RemoteAnatomyRelationRepository();

function AnatomyHomeScreen({ onBack }: { onBack: () => void }) {
  const viewerControllerRef = useRef<Interactive3DControllerHandle | null>(null);

  const [sex, setSex] = useState<AnatomySex>(AnatomySex.Male);
  const [selectedSystem, setSelectedSystem] = useState<AnatomySystemInfo | null>(
    modelRepo.systems.find((s) => s.id === 'cardiovascular') || null
  );
  const [selectedEntity, setSelectedEntity] = useState<EntityData | null>(null);
  const [partHidden, setPartHidden] = useState<boolean>(false);
  const [selectedStructure, setSelectedStructure] =
    useState<AnatomyStructure | null>(null);
  const [structureModal, setStructureModal] = useState<AnatomyStructure | null>(
    null
  );
  const [relations, setRelations] = useState<AnatomyRelation[]>([]);
  const [relationsLoading, setRelationsLoading] = useState<boolean>(false);

  const [systemQuery, setSystemQuery] = useState<string>('');
  const [structureQuery, setStructureQuery] = useState<string>('');
  const [remoteResults, setRemoteResults] = useState<AnatomyStructure[]>([]);
  const [remoteLoading, setRemoteLoading] = useState<boolean>(false);
  const [remoteError, setRemoteError] = useState<string | null>(null);

  const [drawerOpen, setDrawerOpen] = useState<boolean>(() =>
    typeof window !== 'undefined' ? window.innerWidth >= 1024 : false
  );

  useEffect(() => {
    const q = structureQuery.trim();
    if (q.length < 2) {
      setRemoteResults([]);
      setRemoteLoading(false);
      setRemoteError(null);
      return;
    }

    setRemoteLoading(true);
    setRemoteError(null);
    const timer = setTimeout(async () => {
      try {
        const res = await remoteCatalog.search(q);
        setRemoteResults(res);
        setRemoteLoading(false);
      } catch {
        setRemoteResults([]);
        setRemoteLoading(false);
        setRemoteError('Catalogue distant indisponible');
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [structureQuery]);

  const mergedStructureResults = (): AnatomyStructure[] => {
    const q = structureQuery.trim();
    if (!q) return localCatalog.all;
    const local = localCatalog.search(q);
    const map = new Map<string, AnatomyStructure>();
    local.forEach((item) => map.set(item.id, item));
    remoteResults.forEach((item) => map.set(item.id, item));
    return Array.from(map.values()).slice(0, 80);
  };

  const meshNodeFor = (structure: AnatomyStructure): string | null => {
    for (const variant of structure.meshVariants) {
      if (variant.sex === sex && variant.node) {
        return variant.node;
      }
    }
    if (structure.meshSex === sex && structure.meshNode) {
      return structure.meshNode;
    }
    return null;
  };

  const closeDrawerOnMobile = () => {
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      setDrawerOpen(false);
    }
  };

  const openStructureSheet = async (structure: AnatomyStructure) => {
    closeDrawerOnMobile();
    setSelectedStructure(structure);
    setStructureModal(structure);
    setRelationsLoading(true);
    const rels = await relationRepo.forConcept(structure.id);
    setRelations(rels);
    setRelationsLoading(false);

    const sysMatch = modelRepo.systems.find((s) => s.id === structure.system);
    if (sysMatch && modelRepo.hasModel(sysMatch.id, sex)) {
      setSelectedSystem(sysMatch);
    }
  };

  const activeModel = selectedSystem
    ? modelRepo.modelFor(selectedSystem, sex)
    : null;

  const filteredSystems = modelRepo.systems.filter((sys) => {
    const q = systemQuery.trim().toLowerCase();
    return (
      !q ||
      sys.nameFr.toLowerCase().includes(q) ||
      sys.nameEn.toLowerCase().includes(q)
    );
  });

  return (
    <div className="flex-1 flex flex-col h-[calc(100dvh-4rem)] md:h-dvh overflow-hidden">
      {/* Unified Single Header Bar for 3D Atlas (No duplicate sub-header) */}
      <header className="h-14 border-b border-[#203651] bg-[#0d1a2b] px-3 sm:px-4 flex items-center justify-between gap-2 shrink-0 z-30">
        <div className="flex items-center gap-1.5 min-w-0">
          <button
            type="button"
            onClick={onBack}
            className="min-h-[40px] min-w-[40px] rounded-xl hover:bg-[#162a45] text-[#b8c7da] hover:text-white flex items-center justify-center transition cursor-pointer"
            title="Retour"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={() => setDrawerOpen((o) => !o)}
            className="min-h-[40px] px-2.5 rounded-xl hover:bg-[#162a45] text-[#8fc5ff] inline-flex items-center gap-1.5 transition cursor-pointer"
            title="Systèmes & Catalogue"
          >
            <Menu className="w-5 h-5" />
            <span className="text-xs font-semibold hidden sm:inline whitespace-nowrap">
              Catalogue
            </span>
          </button>
          <div className="min-w-0 ml-1">
            <div className="font-bold text-xs sm:text-sm text-[#eef4ff] truncate">
              {activeModel ? activeModel.system.nameFr : 'Atlas 3D'}
            </div>
            {activeModel && (
              <div className="text-[11px] text-[#8fc5ff] truncate hidden sm:block">
                {activeModel.system.nameEn}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {/* Male / Female Segmented Control */}
          <div className="inline-flex rounded-xl border border-[#2c4a70] bg-[#08111f] p-0.5">
            <button
              type="button"
              onClick={() => {
                setSex(AnatomySex.Male);
                setSelectedEntity(null);
                setPartHidden(false);
                if (
                  selectedSystem &&
                  !modelRepo.hasModel(selectedSystem.id, AnatomySex.Male)
                ) {
                  setSelectedSystem(null);
                }
              }}
              className={`min-h-[34px] px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                sex === AnatomySex.Male
                  ? 'bg-indigo-600 text-white'
                  : 'text-[#b8c7da] hover:text-white'
              }`}
            >
              ♂ <span className="hidden md:inline">Homme</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setSex(AnatomySex.Female);
                setSelectedEntity(null);
                setPartHidden(false);
                if (
                  selectedSystem &&
                  !modelRepo.hasModel(selectedSystem.id, AnatomySex.Female)
                ) {
                  setSelectedSystem(null);
                }
              }}
              className={`min-h-[34px] px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                sex === AnatomySex.Female
                  ? 'bg-indigo-600 text-white'
                  : 'text-[#b8c7da] hover:text-white'
              }`}
            >
              ♀ <span className="hidden md:inline">Femme</span>
            </button>
          </div>

          {activeModel && (
            <>
              <button
                type="button"
                onClick={() =>
                  viewerControllerRef.current?.setCameraZoomLevel(0.85)
                }
                className="min-h-[38px] min-w-[38px] rounded-xl border border-[#203651] bg-[#122238] hover:bg-[#192f4d] text-[#eef4ff] flex items-center justify-center transition cursor-pointer"
                title="Zoom arrière"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() =>
                  viewerControllerRef.current?.setCameraZoomLevel(1.35)
                }
                className="min-h-[38px] min-w-[38px] rounded-xl border border-[#203651] bg-[#122238] hover:bg-[#192f4d] text-[#eef4ff] flex items-center justify-center transition cursor-pointer"
                title="Zoom avant"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => {
                  viewerControllerRef.current?.clearSelections();
                  viewerControllerRef.current?.resetAllMaterialOverrides();
                  setSelectedEntity(null);
                  setPartHidden(false);
                }}
                className="min-h-[38px] px-2.5 rounded-xl border border-[#203651] bg-[#122238] hover:bg-[#192f4d] text-xs font-medium text-[#eef4ff] inline-flex items-center gap-1.5 transition cursor-pointer"
                title="Réinitialiser la vue"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="hidden lg:inline whitespace-nowrap">
                  Réinitialiser
                </span>
              </button>
            </>
          )}
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden relative">
        {drawerOpen && (
          <div
            onClick={() => setDrawerOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs z-30 lg:hidden"
            aria-hidden="true"
          />
        )}

        {drawerOpen && (
          <aside className="fixed lg:static inset-y-0 left-0 w-[86vw] max-w-sm lg:w-96 border-r border-[#203651] bg-[#0d1a2b] flex flex-col h-full overflow-y-auto shrink-0 z-40 shadow-2xl lg:shadow-none">
            <div className="p-4 space-y-3 border-b border-[#203651]">
              <div className="flex items-center justify-between lg:hidden pb-1">
                <span className="font-bold text-sm text-[#eef4ff]">
                  Systèmes &amp; Catalogue FMA/UBERON
                </span>
                <button
                  type="button"
                  onClick={() => setDrawerOpen(false)}
                  className="min-h-[38px] min-w-[38px] rounded-xl flex items-center justify-center text-[#b8c7da] hover:text-white cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="relative">
                <Search className="w-4 h-4 text-[#71839b] absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  value={systemQuery}
                  onChange={(e) => setSystemQuery(e.target.value)}
                  placeholder="Filtrer un système…"
                  className="w-full min-h-[42px] pl-10 pr-3 py-2 rounded-xl bg-[#08111f] border border-[#203651] text-sm text-[#eef4ff] placeholder-[#71839b] focus:outline-hidden focus:border-[#8fc5ff]"
                />
              </div>

              <div className="relative">
                <Search className="w-4 h-4 text-[#8fc5ff] absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  value={structureQuery}
                  onChange={(e) => setStructureQuery(e.target.value)}
                  placeholder="Structure (FR / EN / ID)…"
                  className="w-full min-h-[42px] pl-10 pr-3 py-2 rounded-xl bg-[#08111f] border border-[#203651] text-sm text-[#eef4ff] placeholder-[#71839b] focus:outline-hidden focus:border-[#8fc5ff]"
                />
              </div>

              {remoteLoading && (
                <div className="text-xs text-[#8fc5ff] animate-pulse">
                  Recherche dans le catalogue FMA/UBERON…
                </div>
              )}
              {remoteError && (
                <div className="text-xs text-amber-300">
                  {remoteError} · résultats locaux conservés
                </div>
              )}
            </div>

            <div className="px-4 pt-3 pb-2 border-b border-[#203651]">
              <div className="text-xs font-semibold text-[#8fc5ff] mb-2 tabular-nums">
                Structures anatomiques ({mergedStructureResults().length})
              </div>
              <div className="max-h-52 overflow-y-auto space-y-1 pr-1">
                {mergedStructureResults()
                  .slice(0, 40)
                  .map((structure) => (
                    <button
                      key={structure.id}
                      type="button"
                      onClick={() => openStructureSheet(structure)}
                      className="w-full min-h-[46px] text-left px-3 py-2 rounded-xl hover:bg-[#152842] transition flex items-center justify-between gap-2 cursor-pointer"
                    >
                      <div className="min-w-0">
                        <div className="text-sm font-semibold text-[#eef4ff] truncate">
                          {structure.nameFr}
                        </div>
                        <div className="text-xs text-[#71839b] truncate">
                          {structure.nameEn} · {structure.id}
                        </div>
                      </div>
                      <span className="text-xs text-[#8fc5ff] shrink-0">
                        {structure.meshAvailable ? '3D' : 'Catalogue'}
                      </span>
                    </button>
                  ))}
              </div>
            </div>

            <div className="p-4 flex-1">
              <div className="text-xs font-semibold text-[#8fc5ff] mb-2">
                Systèmes anatomiques 3D
              </div>
              <div className="space-y-1">
                {filteredSystems.map((system) => {
                  const available = modelRepo.hasModel(system.id, sex);
                  const isSelected = selectedSystem?.id === system.id;
                  return (
                    <button
                      key={system.id}
                      type="button"
                      disabled={!available}
                      onClick={() => {
                        setSelectedSystem(system);
                        setSelectedEntity(null);
                        setPartHidden(false);
                        closeDrawerOnMobile();
                      }}
                      className={`w-full min-h-[50px] text-left px-3.5 py-2 rounded-xl transition flex items-center gap-3 ${
                        !available
                          ? 'opacity-40 cursor-not-allowed'
                          : isSelected
                          ? 'bg-indigo-600 text-white shadow-xs cursor-pointer'
                          : 'hover:bg-[#152842] text-[#eef4ff] cursor-pointer'
                      }`}
                    >
                      <Box className="w-4 h-4 shrink-0" />
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-semibold truncate">
                          {system.nameFr}
                        </div>
                        <div
                          className={`text-xs truncate ${
                            isSelected ? 'text-indigo-100' : 'text-[#71839b]'
                          }`}
                        >
                          {available
                            ? system.nameEn
                            : `${system.nameEn} · Indisponible en 3D`}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </aside>
        )}

        <main className="flex-1 flex flex-col bg-[#06090e] overflow-hidden min-w-0">
          {!selectedSystem || !activeModel ? (
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
              <Box className="w-12 h-12 text-[#8fc5ff] mb-3" />
              <h2 className="text-lg sm:text-xl font-bold mb-2">
                Sélectionnez un système anatomique
              </h2>
              <p className="text-xs sm:text-sm text-[#b8c7da] mb-5 max-w-md">
                Ouvrez le catalogue pour choisir un système et charger son
                modèle GLB 3D interactif.
              </p>
              <button
                type="button"
                onClick={() => setDrawerOpen(true)}
                className="min-h-[48px] px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold inline-flex items-center gap-2 cursor-pointer"
              >
                <Layers className="w-4 h-4" />
                Choisir un système
              </button>
            </div>
          ) : (
            <>
              {/* Selected Entity Context Bar (Single toggle for visibility + transparency) */}
              {selectedEntity && (
                <div className="bg-[#102036] border-b border-[#203651] px-3 py-2 flex items-center justify-between gap-2 overflow-x-auto shrink-0">
                  <span className="text-xs font-semibold text-[#8fc5ff] whitespace-nowrap">
                    Structure : {selectedEntity.name}
                  </span>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        const nextHidden = !partHidden;
                        setPartHidden(nextHidden);
                        viewerControllerRef.current?.setPartVisibility(
                          selectedEntity.name,
                          !nextHidden
                        );
                      }}
                      className="min-h-[36px] px-3 py-1 rounded-xl border border-[#2c4a70] text-xs font-medium hover:bg-[#172e4d] inline-flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
                    >
                      {partHidden ? (
                        <>
                          <Eye className="w-3.5 h-3.5" />
                          Afficher
                        </>
                      ) : (
                        <>
                          <EyeOff className="w-3.5 h-3.5" />
                          Masquer
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        viewerControllerRef.current?.setEntityTransparency(
                          selectedEntity.name
                        )
                      }
                      className="min-h-[36px] px-3 py-1 rounded-xl border border-[#2c4a70] text-xs font-medium hover:bg-[#172e4d] inline-flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      Transparence
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        viewerControllerRef.current?.resetEntityMaterial(
                          selectedEntity.name
                        )
                      }
                      className="min-h-[36px] px-3 py-1 rounded-xl border border-[#2c4a70] text-xs font-medium hover:bg-[#172e4d] inline-flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      Normal
                    </button>
                  </div>
                </div>
              )}

              <div className="flex-1 relative min-h-0">
                <Interactive3DViewer
                  key={`${activeModel.url}|${
                    selectedStructure ? meshNodeFor(selectedStructure) ?? '' : ''
                  }`}
                  modelUrl={activeModel.url}
                  controllerRef={viewerControllerRef}
                  preselectedEntityName={
                    selectedStructure ? meshNodeFor(selectedStructure) : null
                  }
                  onSelectionChanged={(entities) => {
                    setPartHidden(false);
                    setSelectedEntity(
                      entities.length === 0
                        ? null
                        : entities[entities.length - 1]
                    );
                  }}
                />
              </div>

              <div className="bg-[#0d1a2b] border-t border-[#203651] px-3 py-2 text-center text-xs text-[#b8c7da] truncate shrink-0">
                Touchez une structure anatomique · pincez pour zoomer · glissez
                pour tourner
              </div>
            </>
          )}
        </main>

        {structureModal && (
          <div className="fixed inset-0 bg-black/65 backdrop-blur-xs flex items-end sm:items-center justify-center sm:p-4 z-50">
            <div className="bg-[#0d1a2b] border-t sm:border border-[#2c4a70] rounded-t-3xl sm:rounded-2xl max-w-lg w-full p-5 sm:p-6 shadow-2xl space-y-4 max-h-[85dvh] overflow-y-auto">
              <div className="w-10 h-1.5 bg-[#2c4a70] rounded-full mx-auto mb-1 sm:hidden" />
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-xl sm:text-2xl font-extrabold text-[#eef4ff]">
                    {structureModal.nameFr}
                  </h3>
                  <p className="text-sm sm:text-base text-[#8fc5ff]">
                    {structureModal.nameEn}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setStructureModal(null)}
                  className="min-h-[40px] min-w-[40px] rounded-xl hover:bg-[#182d4a] text-[#b8c7da] flex items-center justify-center cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="text-xs sm:text-sm space-y-1 text-[#b8c7da] bg-[#08111f] p-3.5 rounded-xl border border-[#203651]">
                <div>
                  <span className="font-semibold text-[#eef4ff]">ID :</span>{' '}
                  {structureModal.id}
                </div>
                <div>
                  <span className="font-semibold text-[#eef4ff]">Système :</span>{' '}
                  {structureModal.system}
                </div>
                <div>
                  <span className="font-semibold text-[#eef4ff]">Source :</span>{' '}
                  {structureModal.source}
                </div>
                {meshNodeFor(structureModal) && (
                  <div>
                    <span className="font-semibold text-[#eef4ff]">
                      Nœud GLB :
                    </span>{' '}
                    {meshNodeFor(structureModal)}
                  </div>
                )}
              </div>

              <div>
                <h4 className="text-sm font-bold text-[#eef4ff] mb-2 tabular-nums">
                  Relations anatomiques ({relations.length})
                </h4>
                {relationsLoading ? (
                  <p className="text-xs text-[#8fc5ff]">
                    Chargement des relations FMA/UBERON…
                  </p>
                ) : relations.length === 0 ? (
                  <p className="text-xs text-[#71839b]">
                    Aucune relation publiée pour cette structure.
                  </p>
                ) : (
                  <div className="max-h-40 overflow-y-auto space-y-1.5 bg-[#08111f] p-3 rounded-xl border border-[#203651]">
                    {relations.slice(0, 12).map((rel, idx) => (
                      <div key={idx} className="text-xs text-[#b8c7da]">
                        {rel.predicate === 'xref'
                          ? `${rel.predicate}: ${rel.object}`
                          : `${rel.subject} — ${rel.predicate} → ${rel.object}`}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-2 gap-3">
                <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[#8fc5ff]">
                  {structureModal.meshAvailable ? (
                    <>
                      <Box className="w-4 h-4" />
                      Structure 3D déclarée
                    </>
                  ) : (
                    <>
                      <BookOpen className="w-4 h-4" />
                      Catalogue uniquement
                    </>
                  )}
                </span>

                <button
                  type="button"
                  onClick={() => setStructureModal(null)}
                  className="min-h-[42px] px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold cursor-pointer"
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* 3. Unified Role Workspace (Professor & Student Dashboard)                  */
/* -------------------------------------------------------------------------- */

function AcademicDashboardScreen({
  role,
  onBack,
  onOpenAtlas,
  onOpenExamEditor,
  onStartExam,
}: {
  role: AnatomyRole;
  onBack: () => void;
  onOpenAtlas: () => void;
  onOpenExamEditor: () => void;
  onStartExam: (exam: AnatomyExam) => void;
}) {
  const isProf = role === AnatomyRole.Professor;
  const academicRepo = AcademicRepository.instance;
  const exams = AnatomyExamRepository.instance.exams;

  const classes = academicRepo.classesForProfessor('prof-demo');
  const totalStudents = classes.reduce(
    (sum, c) => sum + academicRepo.studentsForClass(c.id).length,
    0
  );

  const assignments = academicRepo.assignmentsForStudent('student-demo');
  const results = academicRepo.resultsForStudent('student-demo');
  const history = academicRepo.historyForStudent('student-demo');

  const statusLabel = (status: ExamAssignmentStatus) => {
    switch (status) {
      case ExamAssignmentStatus.Assigned:
        return 'À faire';
      case ExamAssignmentStatus.Started:
        return 'En cours';
      case ExamAssignmentStatus.Submitted:
        return 'Soumis';
      case ExamAssignmentStatus.Expired:
        return 'Expiré';
    }
  };

  return (
    <div className="flex-1 flex flex-col">
      <header className="sticky top-0 z-30 h-14 border-b border-[#203651] bg-[#0d1a2b]/95 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <button
            type="button"
            onClick={onBack}
            className="min-h-[40px] min-w-[40px] rounded-xl hover:bg-[#162a45] text-[#b8c7da] hover:text-white flex items-center justify-center transition cursor-pointer"
            title="Changer de rôle"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="font-bold text-base sm:text-lg truncate">
            {isProf ? 'Espace Professeur' : 'Espace Étudiant'}
          </h1>
        </div>

        {/* Desktop Header Actions (Hidden on mobile where bottom nav is shown) */}
        <div className="hidden md:flex items-center gap-2.5">
          {isProf && (
            <button
              type="button"
              onClick={onOpenExamEditor}
              className="min-h-[40px] px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs sm:text-sm font-semibold text-white inline-flex items-center gap-2 transition cursor-pointer"
            >
              <FilePlus className="w-4 h-4" />
              <span>Créer un examen</span>
            </button>
          )}
          <button
            type="button"
            onClick={onOpenAtlas}
            className="min-h-[40px] px-4 py-2 rounded-xl border border-[#2c4a70] bg-[#08111f] hover:border-[#8fc5ff] text-xs sm:text-sm font-semibold text-[#8fc5ff] inline-flex items-center gap-2 transition cursor-pointer"
          >
            <Box className="w-4 h-4" />
            <span>Atlas 3D</span>
          </button>
        </div>
      </header>

      <main className="max-w-4xl w-full mx-auto p-4 sm:p-6 space-y-5">
        {isProf ? (
          <>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold">
                Pilotage pédagogique
              </h2>
              <p className="text-xs sm:text-sm text-[#b8c7da] mt-1">
                Classes, étudiants, création d’examens et suivi réunis dans un
                seul espace.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-2.5 sm:gap-4">
              <StatCard label="Classes" value={String(classes.length)} />
              <StatCard label="Étudiants" value={String(totalStudents)} />
              <StatCard label="Examens" value={String(exams.length)} />
            </div>

            <SectionCard
              title="Mes classes"
              icon={<Users className="w-5 h-5 text-[#8fc5ff]" />}
            >
              <div className="divide-y divide-[#203651]">
                {classes.map((c) => (
                  <div
                    key={c.id}
                    className="py-3 flex items-center justify-between"
                  >
                    <div>
                      <div className="font-semibold text-sm sm:text-base">
                        {c.name}
                      </div>
                      <div className="text-xs text-[#b8c7da] tabular-nums">
                        {c.studentIds.length} étudiant(s) · {c.description}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </SectionCard>

            <SectionCard
              title="Examens publiés"
              icon={<FileText className="w-5 h-5 text-[#8fc5ff]" />}
              action={
                <button
                  type="button"
                  onClick={onOpenExamEditor}
                  className="min-h-[36px] px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white inline-flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Nouvel examen</span>
                </button>
              }
            >
              <div className="divide-y divide-[#203651]">
                {exams.map((exam) => (
                  <div
                    key={exam.id}
                    className="py-3 flex items-center justify-between"
                  >
                    <div>
                      <div className="font-semibold text-sm sm:text-base">
                        {exam.title}
                      </div>
                      <div className="text-xs text-[#b8c7da] tabular-nums">
                        {exam.questions.length} question(s) ·{' '}
                        {exam.durationMinutes} min
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </SectionCard>
          </>
        ) : (
          <>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold">Mon espace</h2>
              <p className="text-xs sm:text-sm text-[#b8c7da] mt-1">
                Examens à passer, résultats, progression et historique
                d’apprentissage.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-2.5 sm:gap-4">
              <StatCard label="Examens" value={String(exams.length)} />
              <StatCard label="Résultats" value={String(results.length)} />
              <StatCard label="Activités" value={String(history.length)} />
            </div>

            <SectionCard
              title="Examens disponibles"
              icon={<FileText className="w-5 h-5 text-[#8fc5ff]" />}
            >
              <div className="divide-y divide-[#203651]">
                {exams.map((exam) => {
                  const assignment = assignments.find(
                    (a) => a.examId === exam.id
                  );
                  return (
                    <div
                      key={exam.id}
                      className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div>
                        <div className="font-semibold text-sm sm:text-base">
                          {exam.title}
                        </div>
                        <div className="text-xs text-[#b8c7da] tabular-nums">
                          {exam.questions.length} question(s) ·{' '}
                          {exam.durationMinutes} min
                          {assignment
                            ? ` · Statut : ${statusLabel(assignment.status)}`
                            : ''}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => onStartExam(exam)}
                        className="min-h-[42px] px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white whitespace-nowrap cursor-pointer"
                      >
                        Passer l’examen
                      </button>
                    </div>
                  );
                })}
              </div>
            </SectionCard>

            <SectionCard
              title="Résultats et notes"
              icon={<CheckCircle2 className="w-5 h-5 text-[#8fc5ff]" />}
            >
              {results.length === 0 ? (
                <p className="text-sm text-[#71839b]">
                  Aucun résultat disponible.
                </p>
              ) : (
                <div className="space-y-5">
                  {/* Recharts Bar Chart of Student Score Performance Over Time */}
                  <div className="pt-1">
                    <div className="flex items-center justify-between text-xs text-[#b8c7da] mb-3 tabular-nums">
                      <span>Progression des scores dans le temps (%)</span>
                      <span>
                        Moyenne :{' '}
                        <strong className="text-[#8fc5ff]">
                          {(
                            results.reduce((acc, r) => acc + r.percentage, 0) /
                            results.length
                          ).toFixed(1)}{' '}
                          %
                        </strong>
                      </span>
                    </div>
                    <div className="w-full h-56 sm:h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={[...results]
                            .sort(
                              (a, b) =>
                                a.submittedAt.getTime() -
                                b.submittedAt.getTime()
                            )
                            .map((r) => {
                              const matched = exams.find(
                                (e) => e.id === r.examId
                              );
                              const shortDate =
                                r.submittedAt.toLocaleDateString('fr-FR', {
                                  day: '2-digit',
                                  month: 'short',
                                });
                              return {
                                id: r.id,
                                dateLabel: shortDate,
                                examTitle: matched
                                  ? matched.title
                                  : `Examen ${r.examId}`,
                                percentage: Number(r.percentage.toFixed(1)),
                                score: r.score,
                                maxScore: r.maxScore,
                                grade: gradeForPercentage(r.percentage),
                              };
                            })}
                          margin={{ top: 8, right: 8, left: -18, bottom: 4 }}
                        >
                          <CartesianGrid
                            strokeDasharray="3 3"
                            stroke="#203651"
                            vertical={false}
                          />
                          <XAxis
                            dataKey="dateLabel"
                            stroke="#71839b"
                            tick={{ fill: '#b8c7da', fontSize: 12 }}
                            tickLine={false}
                            axisLine={{ stroke: '#203651' }}
                          />
                          <YAxis
                            domain={[0, 100]}
                            unit="%"
                            stroke="#71839b"
                            tick={{ fill: '#b8c7da', fontSize: 12 }}
                            tickLine={false}
                            axisLine={{ stroke: '#203651' }}
                          />
                          <Tooltip
                            cursor={{ fill: 'rgba(143, 197, 255, 0.08)' }}
                            content={({ active, payload }) => {
                              if (!active || !payload || !payload.length) {
                                return null;
                              }
                              const item = payload[0].payload;
                              return (
                                <div className="bg-[#08111f] border border-[#2c4a70] rounded-xl px-3.5 py-2.5 text-xs shadow-xl space-y-1 tabular-nums">
                                  <div className="font-bold text-[#eef4ff]">
                                    {item.examTitle}
                                  </div>
                                  <div className="text-[#b8c7da]">
                                    Date : {item.dateLabel}
                                  </div>
                                  <div className="text-[#8fc5ff] font-semibold">
                                    Score : {item.score}/{item.maxScore} ·{' '}
                                    {item.percentage}% · Note {item.grade}
                                  </div>
                                </div>
                              );
                            }}
                          />
                          <Bar
                            dataKey="percentage"
                            name="Score (%)"
                            radius={[6, 6, 0, 0]}
                            maxBarSize={48}
                          >
                            {[...results]
                              .sort(
                                (a, b) =>
                                  a.submittedAt.getTime() -
                                  b.submittedAt.getTime()
                              )
                              .map((entry) => (
                                <Cell
                                  key={entry.id}
                                  fill={
                                    entry.percentage >= 80
                                      ? '#16a34a'
                                      : entry.percentage >= 60
                                      ? '#6366f1'
                                      : '#d97706'
                                  }
                                />
                              ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="divide-y divide-[#203651] border-t border-[#203651]">
                    {results.map((r) => {
                      const matched = exams.find((e) => e.id === r.examId);
                      return (
                        <div
                          key={r.id}
                          className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-1"
                        >
                          <div>
                            <div className="font-semibold text-sm">
                              {matched ? matched.title : `Examen ${r.examId}`}
                            </div>
                            <div className="text-xs text-[#71839b] tabular-nums">
                              {r.submittedAt.toLocaleDateString('fr-FR')}
                            </div>
                          </div>
                          <div className="text-xs sm:text-sm text-[#8fc5ff] font-medium tabular-nums">
                            {r.score}/{r.maxScore} · {r.percentage.toFixed(1)} %
                            · Note {gradeForPercentage(r.percentage)}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </SectionCard>

            <SectionCard
              title="Historique"
              icon={<History className="w-5 h-5 text-[#8fc5ff]" />}
            >
              {history.length === 0 ? (
                <p className="text-sm text-[#71839b]">
                  Votre historique apparaîtra ici.
                </p>
              ) : (
                <div className="divide-y divide-[#203651]">
                  {history.map((entry) => (
                    <div key={entry.id} className="py-3">
                      <div className="font-medium text-sm">{entry.title}</div>
                      <div className="text-xs text-[#71839b] tabular-nums">
                        {entry.occurredAt.toLocaleString('fr-FR')}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </SectionCard>
          </>
        )}
      </main>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-3 sm:p-4 rounded-2xl border border-[#203651] bg-[#0d1a2b] text-center">
      <div className="text-xl sm:text-2xl font-extrabold text-[#eef4ff] tabular-nums">
        {value}
      </div>
      <div className="text-xs text-[#b8c7da] mt-1 truncate">{label}</div>
    </div>
  );
}

function SectionCard({
  title,
  icon,
  action,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="p-4 sm:p-5 rounded-2xl border border-[#203651] bg-[#0d1a2b] space-y-3">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          {icon}
          <h3 className="text-sm sm:text-base font-bold">{title}</h3>
        </div>
        {action}
      </div>
      <div>{children}</div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* 4. Professor Exam Editor Screen                                            */
/* -------------------------------------------------------------------------- */

function ProfessorExamEditorScreen({ onBack }: { onBack: () => void }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<ExamQuestionType>(ExamQuestionType.Quiz);
  const [questionText, setQuestionText] = useState('');
  const [optionsText, setOptionsText] = useState('');
  const [expectedAnswer, setExpectedAnswer] = useState('');
  const [correctIndex, setCorrectIndex] = useState(0);
  const [conceptId, setConceptId] = useState('');
  const [conceptFr, setConceptFr] = useState('');
  const [conceptEn, setConceptEn] = useState('');
  const [meshFile, setMeshFile] = useState('');
  const [meshNode, setMeshNode] = useState('');

  const [questions, setQuestions] = useState<AnatomyExamQuestion[]>([]);
  const [notice, setNotice] = useState<string | null>(null);

  const bankQuestions = AnatomyQuestionBankRepository.instance.all;

  const addQuestion = () => {
    const trimmed = questionText.trim();
    if (!trimmed) return;

    const options = optionsText
      .split(';')
      .map((s) => s.trim())
      .filter(Boolean);

    if (type === ExamQuestionType.Quiz && options.length < 2) {
      setNotice('Un QCM nécessite au moins 2 choix séparés par ";"');
      return;
    }

    if (
      type === ExamQuestionType.Identify3D &&
      (!conceptId.trim() || !meshFile.trim() || !meshNode.trim())
    ) {
      setNotice('Une question 3D exige concept ID, fichier GLB et nœud.');
      return;
    }

    const newQ: AnatomyExamQuestion = {
      id: `q${questions.length + 1}-${Date.now()}`,
      text: trimmed,
      type,
      options: type === ExamQuestionType.Quiz ? options : [],
      correctOptionIndex:
        type === ExamQuestionType.Quiz
          ? Math.min(Math.max(0, correctIndex), options.length - 1)
          : undefined,
      expectedAnswer:
        type === ExamQuestionType.Question ? expectedAnswer.trim() : undefined,
      conceptId: conceptId.trim() || undefined,
      conceptNameFr: conceptFr.trim() || undefined,
      conceptNameEn: conceptEn.trim() || undefined,
      meshFile:
        type === ExamQuestionType.Identify3D ? meshFile.trim() : undefined,
      meshNode:
        type === ExamQuestionType.Identify3D ? meshNode.trim() : undefined,
      points: type === ExamQuestionType.Identify3D ? 2 : 1,
      tags: [],
      difficulty: 1,
    };

    setQuestions((prev) => [...prev, newQ]);
    setQuestionText('');
    setOptionsText('');
    setExpectedAnswer('');
    setConceptId('');
    setConceptFr('');
    setConceptEn('');
    setMeshFile('');
    setMeshNode('');
    setCorrectIndex(0);
    setNotice('Question ajoutée à l’examen.');
  };

  const importBankQuestion = (q: AnatomyExamQuestion) => {
    setQuestions((prev) => [
      ...prev,
      { ...q, id: `${q.id}-${prev.length + 1}` },
    ]);
    setNotice(`Question ajoutée : ${q.conceptNameFr ?? q.text}`);
  };

  const saveExam = () => {
    if (!title.trim() || questions.length === 0) {
      setNotice('Veuillez renseigner un titre et au moins une question.');
      return;
    }

    const newExam: AnatomyExam = {
      id: `exam-${Date.now()}`,
      title: title.trim(),
      description: description.trim() || 'Examen publié en mode sécurisé.',
      questions,
      durationMinutes: 30,
      hideAnatomy: true,
    };

    AnatomyExamRepository.instance.add(newExam);
    AcademicRepository.instance.assignExam({
      id: `assign-${Date.now()}`,
      examId: newExam.id,
      classId: 'class-demo',
      studentId: 'student-demo',
      assignedAt: new Date(),
      status: ExamAssignmentStatus.Assigned,
    });

    onBack();
  };

  return (
    <div className="flex-1 flex flex-col">
      <header className="sticky top-0 z-30 h-14 border-b border-[#203651] bg-[#0d1a2b]/95 backdrop-blur-md px-4 sm:px-6 flex items-center gap-2">
        <button
          type="button"
          onClick={onBack}
          className="min-h-[40px] min-w-[40px] rounded-xl hover:bg-[#162a45] text-[#b8c7da] hover:text-white flex items-center justify-center transition cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="font-bold text-base sm:text-lg truncate">
          Créer un examen
        </h1>
      </header>

      <main className="max-w-3xl w-full mx-auto p-4 sm:p-6 space-y-5">
        {notice && (
          <div className="p-3.5 rounded-xl bg-indigo-500/20 border border-indigo-400/40 text-xs sm:text-sm text-[#8fc5ff] flex items-center justify-between gap-2">
            <span>{notice}</span>
            <button
              type="button"
              onClick={() => setNotice(null)}
              className="min-h-[32px] px-2 text-xs underline shrink-0 cursor-pointer"
            >
              Fermer
            </button>
          </div>
        )}

        <div className="p-4 sm:p-5 rounded-2xl border border-[#203651] bg-[#0d1a2b] space-y-3.5">
          <h2 className="font-bold text-base sm:text-lg">
            Informations de l’examen
          </h2>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Titre de l’examen"
            className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl bg-[#08111f] border border-[#203651] text-sm"
          />
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description"
            className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl bg-[#08111f] border border-[#203651] text-sm"
          />
        </div>

        <div className="p-4 sm:p-5 rounded-2xl border border-[#203651] bg-[#0d1a2b] space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h2 className="font-bold text-base sm:text-lg">
              Nouvelle question
            </h2>
            <div className="inline-flex rounded-xl border border-[#2c4a70] bg-[#08111f] p-1">
              {(
                [
                  [ExamQuestionType.Quiz, 'QCM'],
                  [ExamQuestionType.Question, 'Libre'],
                  [ExamQuestionType.Identify3D, '3D'],
                ] as const
              ).map(([qType, label]) => (
                <button
                  key={qType}
                  type="button"
                  onClick={() => setType(qType)}
                  className={`min-h-[34px] px-3.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                    type === qType
                      ? 'bg-indigo-600 text-white'
                      : 'text-[#b8c7da] hover:text-white'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <textarea
            rows={3}
            value={questionText}
            onChange={(e) => setQuestionText(e.target.value)}
            placeholder="Énoncé de la question…"
            className="w-full px-3.5 py-2.5 rounded-xl bg-[#08111f] border border-[#203651] text-sm"
          />

          {type === ExamQuestionType.Quiz && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <input
                type="text"
                value={optionsText}
                onChange={(e) => setOptionsText(e.target.value)}
                placeholder="Choix séparés par ; (ex: Cœur; Foie; Rein)"
                className="sm:col-span-2 min-h-[44px] px-3.5 py-2.5 rounded-xl bg-[#08111f] border border-[#203651] text-sm"
              />
              <select
                value={correctIndex}
                onChange={(e) => setCorrectIndex(Number(e.target.value))}
                className="min-h-[44px] px-3.5 py-2.5 rounded-xl bg-[#08111f] border border-[#203651] text-sm"
              >
                {[0, 1, 2, 3, 4, 5].map((i) => (
                  <option key={i} value={i}>
                    Bonne réponse : Choix {i + 1}
                  </option>
                ))}
              </select>
            </div>
          )}

          {type === ExamQuestionType.Question && (
            <input
              type="text"
              value={expectedAnswer}
              onChange={(e) => setExpectedAnswer(e.target.value)}
              placeholder="Réponse attendue (optionnelle)"
              className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl bg-[#08111f] border border-[#203651] text-sm"
            />
          )}

          {type === ExamQuestionType.Identify3D && (
            <div className="space-y-3 pt-2 border-t border-[#203651]">
              <div className="text-xs font-semibold text-[#8fc5ff]">
                Cible anatomique 3D
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <input
                  type="text"
                  value={conceptId}
                  onChange={(e) => setConceptId(e.target.value)}
                  placeholder="ID FMA / UBERON (ex. FMA:55675)"
                  className="min-h-[44px] px-3.5 py-2 rounded-xl bg-[#08111f] border border-[#203651] text-sm"
                />
                <input
                  type="text"
                  value={conceptFr}
                  onChange={(e) => setConceptFr(e.target.value)}
                  placeholder="Nom français (ex. Cœur)"
                  className="min-h-[44px] px-3.5 py-2 rounded-xl bg-[#08111f] border border-[#203651] text-sm"
                />
                <input
                  type="text"
                  value={conceptEn}
                  onChange={(e) => setConceptEn(e.target.value)}
                  placeholder="Nom anglais (ex. Heart)"
                  className="min-h-[44px] px-3.5 py-2 rounded-xl bg-[#08111f] border border-[#203651] text-sm"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  value={meshFile}
                  onChange={(e) => setMeshFile(e.target.value)}
                  placeholder="Fichier GLB (ex. cardiovascular_male.glb)"
                  className="min-h-[44px] px-3.5 py-2 rounded-xl bg-[#08111f] border border-[#203651] text-sm"
                />
                <input
                  type="text"
                  value={meshNode}
                  onChange={(e) => setMeshNode(e.target.value)}
                  placeholder="Nœud GLB vérifié (ex. Right atrium)"
                  className="min-h-[44px] px-3.5 py-2 rounded-xl bg-[#08111f] border border-[#203651] text-sm"
                />
              </div>
            </div>
          )}

          <button
            type="button"
            onClick={addQuestion}
            className="w-full sm:w-auto min-h-[44px] px-4 py-2.5 rounded-xl border border-[#2c4a70] bg-[#132640] hover:bg-[#1b3558] text-sm font-semibold text-[#8fc5ff] inline-flex items-center justify-center gap-2 transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Ajouter la question
          </button>
        </div>

        {/* Question Bank */}
        <div className="p-4 sm:p-5 rounded-2xl border border-[#203651] bg-[#0d1a2b] space-y-3">
          <div>
            <h2 className="font-bold text-base sm:text-lg">
              Banque de questions FMA/UBERON
            </h2>
            <p className="text-xs text-[#b8c7da]">
              Importez directement des questions vérifiées dans votre examen.
            </p>
          </div>
          <div className="divide-y divide-[#203651]">
            {bankQuestions.map((q) => (
              <div
                key={q.id}
                className="py-3 flex items-center justify-between gap-3"
              >
                <div className="min-w-0">
                  <div className="text-sm font-semibold">{q.text}</div>
                  <div className="text-xs text-[#8fc5ff] truncate">
                    {q.conceptNameFr ?? 'Concept'} · {q.conceptId ?? 'sans ID'}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => importBankQuestion(q)}
                  className="min-h-[40px] px-3.5 py-1.5 rounded-xl border border-[#2c4a70] hover:bg-[#152842] text-xs font-semibold text-[#8fc5ff] whitespace-nowrap shrink-0 cursor-pointer"
                >
                  + Importer
                </button>
              </div>
            ))}
          </div>
        </div>

        {questions.length > 0 && (
          <div className="p-4 sm:p-5 rounded-2xl border border-[#203651] bg-[#0d1a2b] space-y-4">
            <h2 className="font-bold text-base sm:text-lg tabular-nums">
              Questions sélectionnées ({questions.length})
            </h2>
            <div className="divide-y divide-[#203651]">
              {questions.map((q, idx) => (
                <div key={q.id} className="py-2.5 flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-indigo-600/30 text-[#8fc5ff] text-xs font-bold flex items-center justify-center shrink-0 tabular-nums">
                    {idx + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium">{q.text}</div>
                    <div className="text-xs text-[#71839b]">
                      {q.type === ExamQuestionType.Identify3D
                        ? `Identification 3D · ${q.conceptId ?? 'sans concept'}`
                        : q.type === ExamQuestionType.Quiz
                        ? `QCM · ${q.conceptId ?? 'sans concept'}`
                        : `Question libre · ${q.conceptId ?? 'sans concept'}`}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={saveExam}
              className="w-full min-h-[48px] py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold flex items-center justify-center gap-2 transition cursor-pointer"
            >
              <Lock className="w-4 h-4" />
              Publier l’examen sécurisé
            </button>
          </div>
        )}
      </main>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* 5. Student Exam Screen (Timed Secure Mode + Progress Bar + 3D Identify)    */
/* -------------------------------------------------------------------------- */

function StudentExamScreen({
  exam,
  currentUser,
  onFinish,
}: {
  exam: AnatomyExam;
  currentUser?: FirebaseUser | null;
  onFinish: () => void;
}) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [remainingSeconds, setRemainingSeconds] = useState(
    exam.durationMinutes * 60
  );
  const [currentIndex, setCurrentIndex] = useState(0);
  const [submittedResult, setSubmittedResult] = useState<{
    earned: number;
    total: number;
  } | null>(null);

  const isCorrect = (question: AnatomyExamQuestion, ans?: string): boolean => {
    if (!ans) return false;
    if (question.type === ExamQuestionType.Quiz) {
      return question.options.indexOf(ans) === question.correctOptionIndex;
    }
    if (question.type === ExamQuestionType.Identify3D) {
      return ans.toLowerCase() === (question.meshNode || '').toLowerCase();
    }
    return (
      question.expectedAnswer != null &&
      ans.trim().toLowerCase() === question.expectedAnswer.trim().toLowerCase()
    );
  };

  const handleSubmit = () => {
    if (submittedResult) return;
    let earned = 0;
    let total = 0;
    const questionScores: Record<string, number> = {};

    exam.questions.forEach((q) => {
      total += q.points;
      const pts = isCorrect(q, answers[q.id]) ? q.points : 0;
      earned += pts;
      questionScores[q.id] = pts;
    });

    const percentage = total > 0 ? (earned / total) * 100 : 0;
    AcademicRepository.instance.addResult({
      id: `res-${Date.now()}`,
      examId: exam.id,
      assignmentId: `assign-${exam.id}`,
      studentId: currentUser?.uid || 'student-demo',
      submittedAt: new Date(),
      score: earned,
      maxScore: total,
      percentage,
      questionScores,
    });
    AcademicRepository.instance.markAssignmentSubmitted(
      exam.id,
      currentUser?.uid || 'student-demo'
    );
    AcademicRepository.instance.addHistory({
      id: `hist-${Date.now()}`,
      studentId: currentUser?.uid || 'student-demo',
      type: AnatomyHistoryType.Exam,
      title: `Examen soumis : ${exam.title} (${earned}/${total} pts)`,
      occurredAt: new Date(),
      score: percentage,
    });

    if (currentUser) {
      saveExamResult({
        id: `result_${exam.id}_${Date.now()}`,
        studentId: currentUser.uid,
        studentName: currentUser.displayName || 'Étudiant AnatomyZ',
        studentEmail: currentUser.email || '',
        examId: exam.id,
        examTitle: exam.title,
        score: earned,
        totalPoints: total,
        percentage: Math.round(percentage),
        submittedAt: new Date().toISOString(),
      }).catch((err) => console.error('Erreur sauvegarde Firestore:', err));

      saveUserHistoryEntry({
        id: `hist_${Date.now()}`,
        userId: currentUser.uid,
        title: `Examen soumis : ${exam.title} (${earned}/${total} pts)`,
        type: 'exam_submission',
        timestamp: new Date().toISOString(),
      }).catch((err) => console.error('Erreur historique Firestore:', err));
    }

    setSubmittedResult({ earned, total });
  };

  useEffect(() => {
    if (submittedResult) return;
    const timer = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [submittedResult]);

  if (exam.questions.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-6">
        <p>Cet examen ne contient aucune question.</p>
      </div>
    );
  }

  const question = exam.questions[currentIndex];
  const totalSeconds = Math.max(1, exam.durationMinutes * 60);
  const remainingPercentage = Math.max(
    0,
    Math.min(100, (remainingSeconds / totalSeconds) * 100)
  );
  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;

  const isLowTime = remainingPercentage <= 20;
  const isWarningTime = remainingPercentage > 20 && remainingPercentage <= 50;
  const progressBarColor = isLowTime
    ? 'bg-rose-500'
    : isWarningTime
    ? 'bg-amber-400'
    : 'bg-indigo-500';

  return (
    <div className="flex-1 flex flex-col">
      <header className="sticky top-0 z-30 border-b border-[#203651] bg-[#0d1a2b] px-4 sm:px-6 pt-3 pb-2.5 space-y-2">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <Lock className="w-4 h-4 text-amber-400 shrink-0" />
            <h1 className="font-bold text-sm sm:text-base truncate">
              {exam.title}
            </h1>
          </div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-[#08111f] border border-[#2c4a70] font-mono text-xs sm:text-sm text-[#8fc5ff] tabular-nums shrink-0">
            <Clock className="w-3.5 h-3.5" />
            <span>
              {minutes}:{String(seconds).padStart(2, '0')}
            </span>
          </div>
        </div>

        {/* Real-time visual remaining duration progress bar */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-[11px] text-[#b8c7da] tabular-nums">
            <span>
              Temps restant · Mode examen sécurisé (atlas masqué)
            </span>
            <span className="font-semibold text-[#8fc5ff]">
              {remainingPercentage.toFixed(1)} %
            </span>
          </div>
          <div
            role="progressbar"
            aria-label="Pourcentage du temps restant"
            aria-valuenow={Math.round(remainingPercentage)}
            aria-valuemin={0}
            aria-valuemax={100}
            className="w-full h-2 rounded-full bg-[#08111f] border border-[#203651] overflow-hidden"
          >
            <div
              className={`h-full ${progressBarColor} transition-all duration-500 ease-out rounded-full`}
              style={{ width: `${remainingPercentage}%` }}
            />
          </div>
        </div>
      </header>

      <main className="max-w-3xl w-full mx-auto p-4 sm:p-6 space-y-4">
        <div className="p-4 sm:p-6 rounded-2xl border border-[#203651] bg-[#0d1a2b] space-y-5">
          <div className="flex items-center justify-between text-xs text-[#8fc5ff] font-medium tabular-nums">
            <span>
              Question {currentIndex + 1} / {exam.questions.length}
            </span>
            <span>
              {question.points} pt ·{' '}
              {question.type === ExamQuestionType.Identify3D
                ? 'Identification 3D'
                : question.type === ExamQuestionType.Quiz
                ? 'QCM'
                : 'Réponse libre'}
            </span>
          </div>

          <h2 className="text-lg sm:text-xl font-bold text-[#eef4ff]">
            {question.text}
          </h2>

          {question.type === ExamQuestionType.Quiz && (
            <div className="space-y-2.5">
              {question.options.map((opt) => {
                const checked = answers[question.id] === opt;
                return (
                  <label
                    key={opt}
                    className={`min-h-[48px] flex items-center gap-3 p-3.5 rounded-xl border transition cursor-pointer ${
                      checked
                        ? 'border-indigo-500 bg-indigo-600/20 text-white'
                        : 'border-[#203651] bg-[#08111f] hover:border-[#2c4a70]'
                    }`}
                  >
                    <input
                      type="radio"
                      name={question.id}
                      value={opt}
                      checked={checked}
                      onChange={() =>
                        setAnswers((prev) => ({ ...prev, [question.id]: opt }))
                      }
                      className="accent-indigo-500 w-4 h-4"
                    />
                    <span className="text-sm font-medium">{opt}</span>
                  </label>
                );
              })}
            </div>
          )}

          {question.type === ExamQuestionType.Question && (
            <textarea
              rows={4}
              value={answers[question.id] || ''}
              onChange={(e) =>
                setAnswers((prev) => ({
                  ...prev,
                  [question.id]: e.target.value,
                }))
              }
              placeholder="Votre réponse…"
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#08111f] border border-[#203651] text-sm"
            />
          )}

          {question.type === ExamQuestionType.Identify3D && (
            <div className="space-y-3">
              <p className="text-xs font-semibold text-[#8fc5ff]">
                Touchez directement la structure demandée dans le modèle 3D.
              </p>
              <div className="rounded-2xl overflow-hidden border border-[#203651]">
                <Interactive3DViewer
                  modelUrl={`https://raw.githubusercontent.com/Connacri/Anatria-3D/main/public/anatomy/${
                    question.meshFile || 'cardiovascular_male.glb'
                  }`}
                  selectionColor={[1.0, 0.25, 0.1, 1.0]}
                  heightClass="h-[320px] sm:h-[400px]"
                  onSelectionChanged={(entities) => {
                    if (entities.length > 0) {
                      const last = entities[entities.length - 1];
                      setAnswers((prev) => ({
                        ...prev,
                        [question.id]: last.name,
                      }));
                    }
                  }}
                />
              </div>
              <div className="p-3 rounded-xl bg-[#08111f] border border-[#203651] text-xs flex flex-wrap items-center justify-between gap-2">
                <span>
                  Structure sélectionnée :{' '}
                  <strong className="text-[#8fc5ff]">
                    {answers[question.id] || 'Aucune structure sélectionnée'}
                  </strong>
                </span>
                {question.conceptNameFr && (
                  <span className="text-[#71839b]">
                    Cible : {question.conceptNameFr}
                  </span>
                )}
              </div>
            </div>
          )}

          <div className="pt-2">
            <button
              type="button"
              onClick={() => {
                if (currentIndex + 1 < exam.questions.length) {
                  setCurrentIndex((i) => i + 1);
                } else {
                  handleSubmit();
                }
              }}
              className="w-full min-h-[48px] py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition cursor-pointer"
            >
              {currentIndex + 1 < exam.questions.length
                ? 'Question suivante'
                : 'Terminer l’examen'}
            </button>
          </div>
        </div>
      </main>

      {submittedResult && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-[#0d1a2b] border border-[#2c4a70] rounded-2xl max-w-md w-full p-6 text-center space-y-4">
            <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
            <h3 className="text-2xl font-bold">Examen terminé</h3>
            <p className="text-lg text-[#8fc5ff] font-semibold tabular-nums">
              Résultat : {submittedResult.earned} / {submittedResult.total}{' '}
              points
            </p>
            {currentUser ? (
              <div className="p-2.5 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-xs text-emerald-300 flex items-center justify-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Résultat enregistré et synchronisé avec Firestore ({currentUser.email})</span>
              </div>
            ) : (
              <div className="p-2.5 rounded-xl bg-[#08111f] border border-[#203651] text-xs text-[#b8c7da]">
                Résultat enregistré localement. Connectez-vous avec Google pour l’associer à votre profil universitaire.
              </div>
            )}
            <button
              type="button"
              onClick={onFinish}
              className="w-full min-h-[48px] py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold cursor-pointer"
            >
              Retour à mon espace
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
