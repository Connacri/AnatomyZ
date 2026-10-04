import { initializeApp } from 'firebase/app';
import {
  GoogleAuthProvider,
  getAuth,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDoc,
  getDocFromServer,
  setDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  collection,
  query,
  where,
} from 'firebase/firestore';
import {
  getMessaging,
  getToken,
  onMessage,
  isSupported,
  Messaging,
} from 'firebase/messaging';
import firebaseConfig from '../firebase-applet-config.json';

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });
export { onAuthStateChanged };
export type { FirebaseUser };

// Complete a redirect-based Google Sign-In if one is pending
// (used as fallback when popups are blocked). Errors are surfaced
// through authStateChanged / the next loginWithGoogle() call.
getRedirectResult(auth).catch((err) => {
  console.error('Erreur lors du retour de la connexion Google (redirect):', err);
});

// Lazy messaging initialization to support environments where ServiceWorker or Notification is restricted
let messagingInstance: Messaging | null = null;

export async function getFirebaseMessaging(): Promise<Messaging | null> {
  if (typeof window === 'undefined') return null;
  try {
    const supported = await isSupported();
    if (!supported) {
      console.warn('Firebase Messaging n’est pas supporté dans cet environnement de navigateur.');
      return null;
    }
    if (!messagingInstance) {
      messagingInstance = getMessaging(app);
    }
    return messagingInstance;
  } catch (err) {
    console.warn('Erreur lors de l’initialisation de Firebase Messaging:', err);
    return null;
  }
}

export const SUPER_ADMIN_EMAILS = [
  'oran.inturk@gmail.com',
  'forslog@gmail.com',
  'samuel69tr00@gmail.com',
  'ramzi.guedouar@gmail.com',
];

export function isSuperAdminEmail(email?: string | null): boolean {
  if (!email) return false;
  return SUPER_ADMIN_EMAILS.includes(email.toLowerCase().trim());
}

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error:', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Test initial connection as required by Firebase skill
export async function testConnection(): Promise<void> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (
      error instanceof Error &&
      error.message.includes('the client is offline')
    ) {
      console.warn('Firebase client is offline. Please check your network.');
    }
  }
}
testConnection();

export interface UserRecord {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role: 'student' | 'professor' | 'admin';
  status?: 'approved' | 'pending_approval' | 'rejected';
  requestedRole?: 'student' | 'professor' | 'admin';
  requestedAt?: string;
  approvedAt?: string;
  approvedBy?: string;
  matricule?: string;
  university?: string;
  academicYear?: string;
  specialty?: string;
  bio?: string;
  phone?: string;
  fcmToken?: string;
  fcmTokens?: string[];
  lastTokenUpdatedAt?: string;
  notificationsEnabled?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ExamResultRecord {
  id: string;
  studentId: string;
  studentName?: string;
  studentEmail?: string;
  examId: string;
  examTitle: string;
  score: number;
  totalPoints: number;
  percentage: number;
  submittedAt: string;
}

export interface FcmTokenRecord {
  id: string;
  userId: string;
  token: string;
  platform: 'web' | 'android' | 'ios';
  deviceInfo?: string;
  notificationsEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export async function loginWithGoogle(): Promise<FirebaseUser | null> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (err: any) {
    if (
      err?.code === 'auth/popup-closed-by-user' ||
      err?.code === 'auth/cancelled-popup-request'
    ) {
      return null;
    }
    if (
      err?.code === 'auth/popup-blocked' ||
      err?.code === 'auth/web-storage-unsupported' ||
      err?.code === 'auth/operation-not-supported-in-this-environment'
    ) {
      console.warn('Popup bloquée, bascule vers la redirection Google Sign-In.');
      await signInWithRedirect(auth, googleProvider);
      return null;
    }
    if (err?.code === 'auth/unauthorized-domain') {
      const host =
        typeof window !== 'undefined' ? window.location.hostname : 'ce domaine';
      const customErr: any = new Error(
        `Domaine "${host}" non autorisé dans Firebase Auth (${firebaseConfig.projectId}). Ajoutez "${host}" dans Firebase Console > Authentication > Settings > Authorized domains, ou utilisez le mode session locale.`
      );
      customErr.code = 'auth/unauthorized-domain';
      throw customErr;
    }
    console.error('Erreur Google Sign-In:', err);
    throw err;
  }
}

export async function logoutUser(): Promise<void> {
  await signOut(auth);
}

export async function getUserProfile(uid: string): Promise<UserRecord | null> {
  const userRef = doc(db, 'users', uid);
  try {
    const snap = await getDoc(userRef);
    if (snap.exists()) {
      return snap.data() as UserRecord;
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, `users/${uid}`);
  }
}

export async function registerNewUser(
  user: FirebaseUser,
  chosenRole: 'student' | 'professor' | 'admin'
): Promise<UserRecord> {
  const userRef = doc(db, 'users', user.uid);
  const isSuper = isSuperAdminEmail(user.email);
  const isInstantStudent = chosenRole === 'student';

  // Student is instantly approved; Professor and Admin require admin approval unless super admin
  const isApproved = isSuper || isInstantStudent;
  const effectiveRole = isSuper ? 'admin' : (isApproved ? chosenRole : 'student');
  const effectiveStatus: 'approved' | 'pending_approval' = isApproved ? 'approved' : 'pending_approval';

  const now = new Date().toISOString();
  const payload: UserRecord = {
    uid: user.uid,
    email: user.email || '',
    displayName: user.displayName || 'Utilisateur AnatomyZ',
    photoURL: user.photoURL || '',
    role: effectiveRole,
    status: effectiveStatus,
    requestedRole: chosenRole,
    requestedAt: now,
    ...(isApproved ? { approvedAt: now } : {}),
    ...(isSuper
      ? { approvedBy: 'SuperAdmin' }
      : isInstantStudent
        ? { approvedBy: 'AutoValidation' }
        : {}),
    notificationsEnabled: true,
    createdAt: now,
    updatedAt: now,
  };

  try {
    await setDoc(userRef, payload);
    return payload;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `users/${user.uid}`);
  }
}

export async function approveUserRequest(
  targetUid: string,
  approvedRole: 'student' | 'professor' | 'admin',
  adminEmail?: string,
  profileDetails?: {
    displayName?: string;
    email?: string;
    matricule?: string;
    university?: string;
    academicYear?: string;
    specialty?: string;
    bio?: string;
    phone?: string;
  }
): Promise<void> {
  const userRef = doc(db, 'users', targetUid);
  const now = new Date().toISOString();
  const cleanDetails: Record<string, string> = {};
  if (profileDetails) {
    Object.entries(profileDetails).forEach(([k, v]) => {
      if (v !== undefined) {
        cleanDetails[k] = v;
      }
    });
  }
  try {
    await updateDoc(userRef, {
      ...cleanDetails,
      role: approvedRole,
      status: 'approved',
      approvedAt: now,
      approvedBy: adminEmail || 'Administrateur',
      updatedAt: now,
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `users/${targetUid}`);
  }
}

export async function createProfessorCandidate(data: {
  displayName: string;
  email: string;
  matricule?: string;
  university?: string;
  academicYear?: string;
  specialty?: string;
  bio?: string;
  phone?: string;
  autoApprove?: boolean;
  adminEmail?: string;
}): Promise<UserRecord> {
  const now = new Date().toISOString();
  const uid = `prof_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  const isApproved = Boolean(data.autoApprove);
  const record: UserRecord = {
    uid,
    email: data.email.trim(),
    displayName: data.displayName.trim(),
    photoURL: '',
    role: isApproved ? 'professor' : 'student',
    status: isApproved ? 'approved' : 'pending_approval',
    requestedRole: 'professor',
    requestedAt: now,
    ...(isApproved
      ? {
          approvedAt: now,
          approvedBy: data.adminEmail || 'Administrateur',
        }
      : {}),
    matricule: (data.matricule || '').trim(),
    university: (data.university || 'Faculté de Médecine').trim(),
    academicYear: (data.academicYear || 'Praticien Hospitalier / Enseignant').trim(),
    specialty: (data.specialty || 'Anatomie Générale & Organogénèse').trim(),
    bio: (data.bio || '').trim(),
    phone: (data.phone || '').trim(),
    notificationsEnabled: true,
    createdAt: now,
    updatedAt: now,
  };
  const userRef = doc(db, 'users', uid);
  try {
    await setDoc(userRef, record);
    return record;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `users/${uid}`);
  }
}

export async function requestProfessorAccreditation(
  uid: string,
  profileDetails: {
    displayName: string;
    matricule: string;
    university: string;
    academicYear: string;
    specialty: string;
    bio: string;
    phone: string;
  }
): Promise<void> {
  const userRef = doc(db, 'users', uid);
  const now = new Date().toISOString();
  try {
    await updateDoc(userRef, {
      displayName: profileDetails.displayName.trim(),
      matricule: profileDetails.matricule.trim(),
      university: profileDetails.university.trim(),
      academicYear: profileDetails.academicYear.trim(),
      specialty: profileDetails.specialty.trim(),
      bio: profileDetails.bio.trim(),
      phone: profileDetails.phone.trim(),
      status: 'pending_approval',
      requestedRole: 'professor',
      requestedAt: now,
      updatedAt: now,
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `users/${uid}`);
  }
}

export async function deleteUserRecord(targetUid: string): Promise<void> {
  const userRef = doc(db, 'users', targetUid);
  try {
    await deleteDoc(userRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `users/${targetUid}`);
  }
}

// -------------------------------------------------------------
// PROFESSOR -> STUDENT CRUD HELPERS
// -------------------------------------------------------------

export async function fetchStudentRecords(): Promise<UserRecord[]> {
  try {
    const q = query(collection(db, 'users'), where('role', '==', 'student'));
    const snap = await getDocs(q);
    return snap.docs.map((d) => d.data() as UserRecord);
  } catch (error) {
    console.warn('Impossible de charger les étudiants depuis Firestore:', error);
    return [];
  }
}

export async function createStudentRecord(data: {
  displayName: string;
  email: string;
  matricule: string;
  university: string;
  academicYear: string;
  specialty: string;
  phone?: string;
  bio?: string;
}): Promise<UserRecord> {
  const now = new Date().toISOString();
  const uid = `stu_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  const record: UserRecord = {
    uid,
    email: data.email.trim(),
    displayName: data.displayName.trim(),
    photoURL: '',
    role: 'student',
    status: 'approved',
    matricule: data.matricule.trim(),
    university: data.university.trim() || 'Faculté de Médecine',
    academicYear: data.academicYear.trim() || 'DFGSM 2 (2ème année)',
    specialty: data.specialty.trim() || 'Anatomie Générale',
    phone: (data.phone || '').trim(),
    bio: (data.bio || '').trim(),
    notificationsEnabled: true,
    createdAt: now,
    updatedAt: now,
  };
  const userRef = doc(db, 'users', uid);
  try {
    await setDoc(userRef, record);
    return record;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `users/${uid}`);
  }
}

export async function updateStudentRecord(
  uid: string,
  data: {
    displayName: string;
    email: string;
    matricule: string;
    university: string;
    academicYear: string;
    specialty: string;
    phone?: string;
    bio?: string;
  }
): Promise<void> {
  const userRef = doc(db, 'users', uid);
  try {
    await updateDoc(userRef, {
      displayName: data.displayName.trim(),
      email: data.email.trim(),
      matricule: data.matricule.trim(),
      university: data.university.trim(),
      academicYear: data.academicYear.trim(),
      specialty: data.specialty.trim(),
      phone: (data.phone || '').trim(),
      bio: (data.bio || '').trim(),
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `users/${uid}`);
  }
}

export async function deleteStudentRecord(uid: string): Promise<void> {
  const userRef = doc(db, 'users', uid);
  try {
    await deleteDoc(userRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `users/${uid}`);
  }
}

export async function rejectUserRequest(
  targetUid: string,
  adminEmail?: string
): Promise<void> {
  const userRef = doc(db, 'users', targetUid);
  try {
    await updateDoc(userRef, {
      role: 'student',
      status: 'rejected',
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `users/${targetUid}`);
  }
}

export async function updateUserRole(
  targetUid: string,
  newRole: 'student' | 'professor' | 'admin'
): Promise<void> {
  const userRef = doc(db, 'users', targetUid);
  try {
    await updateDoc(userRef, {
      role: newRole,
      status: 'approved',
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `users/${targetUid}`);
  }
}

export async function updateUserProfile(
  uid: string,
  data: {
    displayName?: string;
    matricule?: string;
    university?: string;
    academicYear?: string;
    specialty?: string;
    bio?: string;
    phone?: string;
    photoURL?: string | null;
  }
): Promise<void> {
  const userRef = doc(db, 'users', uid);
  try {
    await updateDoc(userRef, {
      ...data,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `users/${uid}`);
  }
}

export async function getUserExamResults(studentId: string): Promise<ExamResultRecord[]> {
  try {
    const q = query(
      collection(db, 'exam_results'),
      where('studentId', '==', studentId)
    );
    const snap = await getDocs(q);
    const results = snap.docs.map((d) => d.data() as ExamResultRecord);
    return results.sort(
      (a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
    );
  } catch (error) {
    console.warn('Erreur lors de la récupération des notes de l’étudiant:', error);
    return [];
  }
}

export async function fetchAllUsers(): Promise<UserRecord[]> {
  try {
    const snap = await getDocs(collection(db, 'users'));
    return snap.docs.map((d) => d.data() as UserRecord);
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'users');
  }
}

// -------------------------------------------------------------
// FCM TOKEN PERSISTENCE (Web & App)
// -------------------------------------------------------------

function sanitizeTokenId(token: string, platform: string): string {
  // Extract alphanumeric suffix for clean document id
  const suffix = token.replace(/[^a-zA-Z0-9]/g, '').slice(-24) || Date.now().toString();
  return `${platform}_${suffix}`;
}

export async function saveFcmToken(
  userId: string,
  token: string,
  platform: 'web' | 'android' | 'ios' = 'web',
  deviceInfo?: string
): Promise<void> {
  if (!userId || !token) return;

  const now = new Date().toISOString();
  const tokenId = sanitizeTokenId(token, platform);
  const tokenDocRef = doc(db, 'users', userId, 'fcm_tokens', tokenId);
  const userDocRef = doc(db, 'users', userId);

  const tokenRecord: FcmTokenRecord = {
    id: tokenId,
    userId,
    token,
    platform,
    deviceInfo: deviceInfo || (typeof navigator !== 'undefined' ? navigator.userAgent.slice(0, 120) : 'Unknown Device'),
    notificationsEnabled: true,
    createdAt: now,
    updatedAt: now,
  };

  try {
    // 1. Save in multi-device subcollection
    await setDoc(tokenDocRef, tokenRecord, { merge: true });

    // 2. Persist primary token directly in user profile
    await updateDoc(userDocRef, {
      fcmToken: token,
      lastTokenUpdatedAt: now,
      notificationsEnabled: true,
      updatedAt: now,
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `users/${userId}/fcm_tokens/${tokenId}`);
  }
}

export async function getStoredFcmTokens(userId: string): Promise<FcmTokenRecord[]> {
  if (!userId) return [];
  try {
    const snap = await getDocs(collection(db, 'users', userId, 'fcm_tokens'));
    return snap.docs.map((d) => d.data() as FcmTokenRecord);
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, `users/${userId}/fcm_tokens`);
  }
}

export async function deleteStoredFcmToken(userId: string, tokenId: string): Promise<void> {
  if (!userId || !tokenId) return;
  const tokenDocRef = doc(db, 'users', userId, 'fcm_tokens', tokenId);
  try {
    await deleteDoc(tokenDocRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `users/${userId}/fcm_tokens/${tokenId}`);
  }
}

export async function toggleUserNotifications(
  userId: string,
  enabled: boolean
): Promise<void> {
  const userRef = doc(db, 'users', userId);
  try {
    await updateDoc(userRef, {
      notificationsEnabled: enabled,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `users/${userId}`);
  }
}

/**
 * Request notification permissions and register Web FCM token
 */
export async function requestWebPushPermissionAndToken(
  userId?: string
): Promise<{ token: string | null; error?: string }> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return { token: null, error: 'Notifications non supportées sur ce navigateur.' };
  }

  try {
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      return { token: null, error: 'Permission refusée par l’utilisateur.' };
    }

    const messaging = await getFirebaseMessaging();
    if (!messaging) {
      return { token: null, error: 'Service Firebase Messaging indisponible.' };
    }

    // Register service worker if available
    let registration: ServiceWorkerRegistration | undefined = undefined;
    if ('serviceWorker' in navigator) {
      try {
        registration = await navigator.serviceWorker.register('./firebase-messaging-sw.js');
        await navigator.serviceWorker.ready;
      } catch (swErr) {
        console.warn('Impossible d’enregistrer le ServiceWorker FCM:', swErr);
      }
    }

    const token = await getToken(messaging, {
      serviceWorkerRegistration: registration,
    });

    if (token && userId) {
      await saveFcmToken(
        userId,
        token,
        'web',
        `${navigator.userAgent.slice(0, 80)} (${navigator.platform || 'Web'})`
      );
    }

    return { token };
  } catch (err: any) {
    console.error('Erreur getToken FCM:', err);
    return { token: null, error: err?.message || 'Erreur lors de l’obtention du token FCM.' };
  }
}

/**
 * Listen for incoming FCM messages in foreground
 */
export async function subscribeToForegroundMessages(
  onMessageReceived: (payload: any) => void
): Promise<(() => void) | null> {
  const messaging = await getFirebaseMessaging();
  if (!messaging) return null;

  return onMessage(messaging, (payload) => {
    console.log('[AnatomyZ] Foreground FCM message:', payload);
    onMessageReceived(payload);
  });
}

/**
 * Dispatch test notification record for the user or system
 */
export async function createNotificationRecord(notification: {
  id: string;
  targetUserId: string;
  title: string;
  body: string;
  category: 'system' | 'exam' | 'reminder' | 'update';
  createdAt: string;
}): Promise<void> {
  const notifRef = doc(db, 'notifications', notification.id);
  try {
    await setDoc(notifRef, notification);
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `notifications/${notification.id}`);
  }
}

// -------------------------------------------------------------
// EXAM & HISTORY
// -------------------------------------------------------------

export async function saveExamResult(result: {
  id: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  examId: string;
  examTitle: string;
  score: number;
  totalPoints: number;
  percentage: number;
  submittedAt: string;
}): Promise<void> {
  const resultRef = doc(db, 'exam_results', result.id);
  try {
    await setDoc(resultRef, result);
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `exam_results/${result.id}`);
  }
}

export async function saveUserHistoryEntry(entry: {
  id: string;
  userId: string;
  title: string;
  type: string;
  timestamp: string;
}): Promise<void> {
  const historyRef = doc(db, 'history', entry.id);
  try {
    await setDoc(historyRef, entry);
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `history/${entry.id}`);
  }
}
