import 'dart:async';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart' as fb;
import 'package:firebase_core/firebase_core.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:google_sign_in/google_sign_in.dart';

enum AppLanguage { fr, en }

enum ThemeScheduleMode { auto, light, dark }

/// Representation of an authenticated or managed AnatomyZ user.
class AnatomyUser {
  const AnatomyUser({
    required this.uid,
    required this.email,
    required this.displayName,
    this.photoUrl,
    this.role = 'student',
    this.status = 'approved',
    this.requestedRole,
    this.matricule = '',
    this.university = 'Faculté de Médecine',
    this.academicYear = 'DFGSM 2 (2ème année)',
    this.specialty = 'Anatomie Générale',
    this.phone = '',
    this.bio = '',
  });

  final String uid;
  final String email;
  final String displayName;
  final String? photoUrl;
  final String role;
  final String status; // 'approved' | 'pending_approval' | 'rejected'
  final String? requestedRole;
  final String matricule;
  final String university;
  final String academicYear;
  final String specialty;
  final String phone;
  final String bio;

  bool get isSuperAdmin {
    final lower = email.toLowerCase();
    return lower == 'oran.inturk@gmail.com' ||
        lower == 'forslog@gmail.com' ||
        lower == 'ramzi.guedouar@gmail.com' ||
        lower == 'samuel69tr00@gmail.com';
  }

  bool get isAdmin => role == 'admin' || isSuperAdmin;
  bool get isProfessor => role == 'professor' || requestedRole == 'professor';
  bool get isApprovedProfessor =>
      isAdmin || (role == 'professor' && status == 'approved');
  bool get isPendingProfessor =>
      !isAdmin &&
      (status == 'pending_approval' ||
          (requestedRole == 'professor' && role != 'professor'));
  bool get isStudent => !isAdmin && !isProfessor;

  AnatomyUser copyWith({
    String? displayName,
    String? email,
    String? role,
    String? status,
    String? requestedRole,
    String? matricule,
    String? university,
    String? academicYear,
    String? specialty,
    String? phone,
    String? bio,
  }) {
    return AnatomyUser(
      uid: uid,
      email: email ?? this.email,
      displayName: displayName ?? this.displayName,
      photoUrl: photoUrl,
      role: role ?? this.role,
      status: status ?? this.status,
      requestedRole: requestedRole ?? this.requestedRole,
      matricule: matricule ?? this.matricule,
      university: university ?? this.university,
      academicYear: academicYear ?? this.academicYear,
      specialty: specialty ?? this.specialty,
      phone: phone ?? this.phone,
      bio: bio ?? this.bio,
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'uid': uid,
      'email': email,
      'displayName': displayName,
      'photoURL': photoUrl,
      'role': role,
      'status': status,
      'requestedRole': requestedRole,
      'matricule': matricule,
      'university': university,
      'academicYear': academicYear,
      'specialty': specialty,
      'phone': phone,
      'bio': bio,
      'updatedAt': DateTime.now().toIso8601String(),
    };
  }
}

/// Firebase Auth, Google Sign-In, Role Approval, Student CRUD, and Theme/i18n Service
class FirebaseAuthService {
  FirebaseAuthService._() {
    if (Firebase.apps.isNotEmpty) {
      try {
        fb.FirebaseAuth.instance
            .authStateChanges()
            .listen(_onAuthStateChanged);
      } catch (e) {
        debugPrint('FirebaseAuth listener non initialisé: $e');
      }
    }
  }
  static final FirebaseAuthService instance = FirebaseAuthService._();

  static const String _webClientId =
      '986358610101-fhkt7d0qgthjf39munv6hvrqui962pk0.apps.googleusercontent.com';

  final ValueNotifier<AnatomyUser?> currentUserNotifier =
      ValueNotifier<AnatomyUser?>(null);

  final ValueNotifier<AppLanguage> languageNotifier =
      ValueNotifier<AppLanguage>(AppLanguage.fr);

  final ValueNotifier<ThemeScheduleMode> themePreferenceNotifier =
      ValueNotifier<ThemeScheduleMode>(ThemeScheduleMode.auto);

  final ValueNotifier<List<AnatomyUser>> pendingProfessorsNotifier =
      ValueNotifier<List<AnatomyUser>>([
    const AnatomyUser(
      uid: 'prof_pending_demo_1',
      email: 'dr.amine.mansouri@univ-med.fr',
      displayName: 'Dr. Amine Mansouri',
      role: 'student',
      status: 'pending_approval',
      requestedRole: 'professor',
      matricule: 'PROF-ANAT-2026-04',
      university: 'Faculté de Médecine — Département Morphologie',
      academicYear: 'Praticien Hospitalier / Enseignant',
      specialty: 'Neuro-anatomie & Paires Crâniennes',
      phone: '+33 6 42 18 90 11',
      bio: 'Maître de conférences associé, responsable des TP de dissection crânienne.',
    ),
    const AnatomyUser(
      uid: 'prof_pending_demo_2',
      email: 'pr.claire.dubois@chu-anatomie.fr',
      displayName: 'Pr. Claire Dubois',
      role: 'student',
      status: 'pending_approval',
      requestedRole: 'professor',
      matricule: 'PROF-ANAT-2026-09',
      university: 'CHU & Faculté de Médecine',
      academicYear: 'Praticien Hospitalier / Enseignant',
      specialty: 'Anatomie Cardiovasculaire & Thoracique',
      phone: '+33 6 11 54 78 32',
      bio: 'Chirurgienne thoracique et enseignante en anatomie clinique 3D.',
    ),
  ]);

  final ValueNotifier<List<AnatomyUser>> studentsNotifier =
      ValueNotifier<List<AnatomyUser>>([
    const AnatomyUser(
      uid: 'student-demo',
      email: 'ines.benali@etu.univ-med.fr',
      displayName: 'Inès Benali',
      role: 'student',
      status: 'approved',
      matricule: 'MED-2026-0142',
      university: 'Faculté de Médecine',
      academicYear: 'DFGSM 2 (2ème année)',
      specialty: 'Anatomie Générale & Cardiovasculaire',
      phone: '+33 6 12 34 56 78',
      bio: 'Étudiante en 2ème année de médecine, groupe TP A.',
    ),
    const AnatomyUser(
      uid: 'student-2',
      email: 'lucas.martin@etu.univ-med.fr',
      displayName: 'Lucas Martin',
      role: 'student',
      status: 'approved',
      matricule: 'MED-2026-0189',
      university: 'Faculté de Médecine',
      academicYear: 'DFGSM 2 (2ème année)',
      specialty: 'Ostéologie & Arthrologie',
      phone: '+33 6 98 76 54 32',
      bio: 'Étudiant DFGSM 2 — tutorat d’anatomie.',
    ),
    const AnatomyUser(
      uid: 'student-3',
      email: 'sarah.khelifi@etu.univ-med.fr',
      displayName: 'Sarah Khelifi',
      role: 'student',
      status: 'approved',
      matricule: 'MED-2026-0215',
      university: 'Faculté de Médecine',
      academicYear: 'DFGSM 3 (3ème année)',
      specialty: 'Neuro-anatomie clinique',
      phone: '+33 6 45 67 89 10',
      bio: 'Certificat optionnel d’imagerie et neuro-anatomie 3D.',
    ),
  ]);

  final Map<String, AnatomyUser> _profilesByUid = {};
  bool _googleSignInInitialized = false;

  AnatomyUser? get currentUser => currentUserNotifier.value;
  bool get isAuthenticated => currentUserNotifier.value != null;

  bool get isCurrentProfessorApproved {
    final u = currentUserNotifier.value;
    if (u == null) return false;
    return u.isApprovedProfessor;
  }

  /// Resolve ThemeMode based on schedule (07:00..18:59 -> Light, 19:00..06:59 -> Dark) or manual override
  ThemeMode get resolvedThemeMode {
    final pref = themePreferenceNotifier.value;
    if (pref == ThemeScheduleMode.light) return ThemeMode.light;
    if (pref == ThemeScheduleMode.dark) return ThemeMode.dark;
    final hour = DateTime.now().hour;
    return (hour >= 7 && hour < 19) ? ThemeMode.light : ThemeMode.dark;
  }

  void cycleThemePreference() {
    const values = ThemeScheduleMode.values;
    final next = values[(values.indexOf(themePreferenceNotifier.value) + 1) % values.length];
    themePreferenceNotifier.value = next;
  }

  void setLanguage(AppLanguage lang) {
    languageNotifier.value = lang;
  }

  String t(String key) {
    final lang = languageNotifier.value;
    const map = <AppLanguage, Map<String, String>>{
      AppLanguage.fr: {
        'chooseRole': 'Choisissez votre rôle',
        'authorizedSpace': 'Votre espace autorisé',
        'allSpacesAdmin': 'Tous les espaces (Supervision Admin)',
        'subtitle':
            'Atlas anatomique humain 3D, Knowledge Graph FMA/UBERON et espace pédagogique sécurisé.',
        'professor': 'Professeur',
        'professorSub':
            'Gérer les étudiants (CRUD), créer des examens et projeter l’Atlas 3D',
        'professorPendingSub':
            'Accès limité aux démonstrations 3D jusqu’à validation par l’administrateur',
        'student': 'Étudiant',
        'studentSub':
            'Consulter les examens assignés, les passer et suivre ses notes',
        'adminPanel': 'Administration Institutionnelle',
        'adminSub':
            'Liste des professeurs à accepter avec entrée détail profil et supervision',
        'exploreAtlas': 'Explorer directement l’atlas 3D',
        'pendingBannerTitle':
            'Compte Professeur en attente de validation par l’Administrateur',
        'pendingBannerDesc':
            'Votre compte Professeur est validé uniquement par l’administrateur. En attendant son acceptation, vous avez uniquement accès aux démonstrations 3D et ne pouvez ni interagir avec vos étudiants ni accéder aux autres fonctionnalités.',
        'themeAuto': 'Horaire Auto',
        'themeLight': 'Clair',
        'themeDark': 'Sombre',
      },
      AppLanguage.en: {
        'chooseRole': 'Choose your role',
        'authorizedSpace': 'Your Authorized Workspace',
        'allSpacesAdmin': 'All Workspaces (Admin Supervision)',
        'subtitle':
            '3D human anatomical atlas, FMA/UBERON Knowledge Graph, and secure academic workspace.',
        'professor': 'Professor',
        'professorSub':
            'Manage students (CRUD), create exams, and project the 3D Atlas',
        'professorPendingSub':
            'Restricted to 3D demonstrations only until validated by the administrator',
        'student': 'Student',
        'studentSub': 'View assigned exams, take assessments, and track grades',
        'adminPanel': 'Institutional Administration',
        'adminSub':
            'Pending professors list to accept with profile details entry & supervision',
        'exploreAtlas': 'Explore the 3D Atlas directly',
        'pendingBannerTitle':
            'Professor Account Pending Administrator Validation',
        'pendingBannerDesc':
            'Your Professor account is validated solely by the administrator. Until accepted, you only have access to 3D demonstrations and cannot interact with students or access other features.',
        'themeAuto': 'Auto Schedule',
        'themeLight': 'Light',
        'themeDark': 'Dark',
      },
    };
    return map[lang]?[key] ?? map[AppLanguage.fr]![key] ?? key;
  }

  Future<void> _ensureGoogleSignInInitialized() async {
    if (_googleSignInInitialized) return;
    await GoogleSignIn.instance.initialize(
      clientId: kIsWeb ? _webClientId : null,
      serverClientId: _webClientId,
    );
    _googleSignInInitialized = true;
  }

  AnatomyUser _buildUserWithRoleRules({
    required String uid,
    required String email,
    required String displayName,
    String? photoUrl,
    required String requestedRole,
  }) {
    final existing = _profilesByUid[uid];
    if (existing != null) return existing;

    final lower = email.toLowerCase();
    final isSuper = lower == 'oran.inturk@gmail.com' ||
        lower == 'forslog@gmail.com' ||
        lower == 'ramzi.guedouar@gmail.com' ||
        lower == 'samuel69tr00@gmail.com';

    if (isSuper || requestedRole == 'admin') {
      final adminUser = AnatomyUser(
        uid: uid,
        email: email,
        displayName: displayName,
        photoUrl: photoUrl,
        role: 'admin',
        status: 'approved',
        requestedRole: 'admin',
        academicYear: 'Direction Académique',
      );
      _profilesByUid[uid] = adminUser;
      return adminUser;
    }

    if (requestedRole == 'professor') {
      // Professor account MUST be validated by Admin first!
      final pendingProf = AnatomyUser(
        uid: uid,
        email: email,
        displayName: displayName,
        photoUrl: photoUrl,
        role: 'student',
        status: 'pending_approval',
        requestedRole: 'professor',
        matricule: 'PROF-2026-${uid.substring(0, uid.length.clamp(0, 4)).toUpperCase()}',
        university: 'Faculté de Médecine',
        academicYear: 'Praticien Hospitalier / Enseignant',
        specialty: 'Anatomie Générale & Morphologie',
      );
      _profilesByUid[uid] = pendingProf;
      final list = List<AnatomyUser>.from(pendingProfessorsNotifier.value);
      if (!list.any((p) => p.uid == uid)) {
        pendingProfessorsNotifier.value = [pendingProf, ...list];
      }
      return pendingProf;
    }

    final studentUser = AnatomyUser(
      uid: uid,
      email: email,
      displayName: displayName,
      photoUrl: photoUrl,
      role: 'student',
      status: 'approved',
      requestedRole: 'student',
    );
    _profilesByUid[uid] = studentUser;
    return studentUser;
  }

  static const String _firestoreDatabaseId =
      'ai-studio-anatomyz-9293ceee-b20a-4a07-ad36-4cadd3fe02a5';

  FirebaseFirestore get _firestore => FirebaseFirestore.instanceFor(
        app: Firebase.app(),
        databaseId: _firestoreDatabaseId,
      );

  /// Resolve the authoritative AnatomyZ profile from Firestore.
  /// - Existing Firestore profile -> returned as-is (never mixed with another role)
  /// - Missing -> created once with the requested role rules shared with the website
  Future<AnatomyUser> _resolveFirestoreProfile(
    fb.User firebaseUser, {
    String requestedRole = 'student',
  }) async {
    try {
      final docRef =
          _firestore.collection('users').doc(firebaseUser.uid);
      final snap = await docRef.get();
      if (snap.exists && snap.data() != null) {
        final data = snap.data()!;
        return AnatomyUser(
          uid: firebaseUser.uid,
          email: (data['email'] as String?)?.isNotEmpty == true
              ? data['email'] as String
              : (firebaseUser.email ?? ''),
          displayName: (data['displayName'] as String?) ??
              firebaseUser.displayName ??
              'Utilisateur AnatomyZ',
          photoUrl: (data['photoURL'] as String?) ?? firebaseUser.photoURL,
          role: (data['role'] as String?) ?? 'student',
          status: (data['status'] as String?) ?? 'approved',
          requestedRole: data['requestedRole'] as String?,
          matricule: (data['matricule'] as String?) ?? '',
          university: (data['university'] as String?) ?? 'Faculté de Médecine',
          academicYear: (data['academicYear'] as String?) ?? 'DFGSM 2 (2ème année)',
          specialty: (data['specialty'] as String?) ?? 'Anatomie Générale',
          phone: (data['phone'] as String?) ?? '',
          bio: (data['bio'] as String?) ?? '',
        );
      }

      // No profile yet: create it with the shared role rules
      final email = firebaseUser.email ?? '';
      final lower = email.toLowerCase();
      const superAdmins = [
        'oran.inturk@gmail.com',
        'forslog@gmail.com',
        'ramzi.guedouar@gmail.com',
        'samuel69tr00@gmail.com',
      ];
      final isSuper = superAdmins.contains(lower);
      final now = DateTime.now().toUtc().toIso8601String();

      late final AnatomyUser created;
      if (isSuper) {
        created = AnatomyUser(
          uid: firebaseUser.uid,
          email: email,
          displayName: firebaseUser.displayName ?? 'Utilisateur AnatomyZ',
          photoUrl: firebaseUser.photoURL,
          role: 'admin',
          status: 'approved',
          requestedRole: 'admin',
          academicYear: 'Direction Académique',
        );
      } else if (requestedRole == 'professor') {
        created = AnatomyUser(
          uid: firebaseUser.uid,
          email: email,
          displayName: firebaseUser.displayName ?? 'Utilisateur AnatomyZ',
          photoUrl: firebaseUser.photoURL,
          role: 'student',
          status: 'pending_approval',
          requestedRole: 'professor',
          university: 'Faculté de Médecine',
          academicYear: 'Praticien Hospitalier / Enseignant',
        );
      } else {
        created = AnatomyUser(
          uid: firebaseUser.uid,
          email: email,
          displayName: firebaseUser.displayName ?? 'Utilisateur AnatomyZ',
          photoUrl: firebaseUser.photoURL,
          role: 'student',
          status: 'approved',
          requestedRole: 'student',
        );
      }

      await docRef.set({
        ...created.toMap(),
        'createdAt': now,
        'notificationsEnabled': true,
      });
      return created;
    } catch (e) {
      debugPrint('[Auth] Firestore profile error, fallback local: $e');
      return _buildUserWithRoleRules(
        uid: firebaseUser.uid,
        email: firebaseUser.email ?? '',
        displayName: firebaseUser.displayName ?? 'Utilisateur AnatomyZ',
        photoUrl: firebaseUser.photoURL,
        requestedRole: requestedRole,
      );
    }
  }

  void _onAuthStateChanged(fb.User? firebaseUser) {
    if (firebaseUser == null) {
      currentUserNotifier.value = null;
      return;
    }
    final cached = _profilesByUid[firebaseUser.uid];
    if (cached != null) {
      currentUserNotifier.value = cached;
      return;
    }
    _resolveFirestoreProfile(firebaseUser).then((profile) {
      _profilesByUid[firebaseUser.uid] = profile;
      currentUserNotifier.value = profile;
    });
  }

  /// Trigger Google Sign-In flow
  Future<AnatomyUser?> signInWithGoogle({String defaultRole = 'student'}) async {
    try {
      await _ensureGoogleSignInInitialized();
      final account = await GoogleSignIn.instance.authenticate(
        scopeHint: const ['email', 'profile'],
      );

      final idToken = account.authentication.idToken;
      String? accessToken;
      try {
        final authorization = await account.authorizationClient
            .authorizationForScopes(const ['email', 'profile']);
        accessToken = authorization?.accessToken;
      } catch (_) {}

      final credential = fb.GoogleAuthProvider.credential(
        idToken: idToken,
        accessToken: accessToken,
      );
      final userCredential =
          await fb.FirebaseAuth.instance.signInWithCredential(credential);
      final firebaseUser = userCredential.user;
      if (firebaseUser != null) {
        _profilesByUid.remove(firebaseUser.uid);
        currentUserNotifier.value = _buildUserWithRoleRules(
          uid: firebaseUser.uid,
          email: firebaseUser.email ?? '',
          displayName: firebaseUser.displayName ?? 'Utilisateur AnatomyZ',
          photoUrl: firebaseUser.photoURL,
          requestedRole: defaultRole,
        );
      }
      return currentUserNotifier.value;
    } on GoogleSignInException catch (e) {
      if (e.code == GoogleSignInExceptionCode.canceled) {
        debugPrint('Google Sign-In annulé par l’utilisateur.');
        return null;
      }
      debugPrint('Google Sign-In Error: $e');
      rethrow;
    } catch (e) {
      debugPrint('Google Sign-In Error: $e');
      rethrow;
    }
  }

  /// Sign out current user
  Future<void> signOut() async {
    try {
      await GoogleSignIn.instance.signOut();
    } catch (_) {}
    if (Firebase.apps.isNotEmpty) {
      try {
        await fb.FirebaseAuth.instance.signOut();
      } catch (_) {}
    }
    currentUserNotifier.value = null;
  }

  /// Switch or simulate role while respecting Admin validation for Professor
  void setRole(String newRole) {
    final current = currentUserNotifier.value;
    if (current != null) {
      if (newRole == 'professor' && !current.isApprovedProfessor) {
        final updated = current.copyWith(
          status: 'pending_approval',
          requestedRole: 'professor',
        );
        _profilesByUid[current.uid] = updated;
        currentUserNotifier.value = updated;
        final list = List<AnatomyUser>.from(pendingProfessorsNotifier.value);
        if (!list.any((p) => p.uid == updated.uid)) {
          pendingProfessorsNotifier.value = [updated, ...list];
        }
        return;
      }
      final updated = current.copyWith(role: newRole);
      _profilesByUid[current.uid] = updated;
      currentUserNotifier.value = updated;
    }
  }

  /// Update pending Professor's own profile details for Admin review
  void updateCurrentProfessorRequestDetails({
    required String displayName,
    required String matricule,
    required String university,
    required String academicYear,
    required String specialty,
    required String phone,
    required String bio,
  }) {
    final current = currentUserNotifier.value;
    if (current == null) return;
    final updated = current.copyWith(
      displayName: displayName,
      matricule: matricule,
      university: university,
      academicYear: academicYear,
      specialty: specialty,
      phone: phone,
      bio: bio,
      status: 'pending_approval',
      requestedRole: 'professor',
    );
    _profilesByUid[current.uid] = updated;
    currentUserNotifier.value = updated;
    final list = List<AnatomyUser>.from(pendingProfessorsNotifier.value);
    final idx = list.indexWhere((u) => u.uid == current.uid);
    if (idx >= 0) {
      list[idx] = updated;
    } else {
      list.insert(0, updated);
    }
    pendingProfessorsNotifier.value = list;
  }

  // ---------------------------------------------------------------------------
  // ADMIN: Approve / Reject Professor with Profile Detail Entry
  // ---------------------------------------------------------------------------

  void approveProfessorWithDetails({
    required String uid,
    required String displayName,
    required String email,
    required String matricule,
    required String university,
    required String academicYear,
    required String specialty,
    required String phone,
    required String bio,
  }) {
    final approved = AnatomyUser(
      uid: uid,
      email: email,
      displayName: displayName,
      role: 'professor',
      status: 'approved',
      requestedRole: 'professor',
      matricule: matricule,
      university: university,
      academicYear: academicYear,
      specialty: specialty,
      phone: phone,
      bio: bio,
    );
    _profilesByUid[uid] = approved;
    pendingProfessorsNotifier.value = pendingProfessorsNotifier.value
        .where((p) => p.uid != uid)
        .toList(growable: false);
    if (currentUserNotifier.value?.uid == uid) {
      currentUserNotifier.value = approved;
    }
  }

  void addAndApproveProfessorCandidate({
    required String displayName,
    required String email,
    required String matricule,
    required String university,
    required String academicYear,
    required String specialty,
    required String phone,
    required String bio,
    required bool autoApprove,
  }) {
    final uid = 'prof_${DateTime.now().millisecondsSinceEpoch}';
    final candidate = AnatomyUser(
      uid: uid,
      email: email,
      displayName: displayName,
      role: autoApprove ? 'professor' : 'student',
      status: autoApprove ? 'approved' : 'pending_approval',
      requestedRole: 'professor',
      matricule: matricule,
      university: university,
      academicYear: academicYear,
      specialty: specialty,
      phone: phone,
      bio: bio,
    );
    _profilesByUid[uid] = candidate;
    if (!autoApprove) {
      pendingProfessorsNotifier.value = [
        candidate,
        ...pendingProfessorsNotifier.value,
      ];
    }
  }

  void rejectProfessor(String uid) {
    pendingProfessorsNotifier.value = pendingProfessorsNotifier.value
        .where((p) => p.uid != uid)
        .toList(growable: false);
  }

  // ---------------------------------------------------------------------------
  // PROFESSOR: Student CRUD Operations
  // ---------------------------------------------------------------------------

  void addStudent({
    required String displayName,
    required String email,
    required String matricule,
    required String university,
    required String academicYear,
    required String specialty,
    String phone = '',
    String bio = '',
  }) {
    final created = AnatomyUser(
      uid: 'stu_${DateTime.now().millisecondsSinceEpoch}',
      email: email,
      displayName: displayName,
      role: 'student',
      status: 'approved',
      matricule: matricule,
      university: university,
      academicYear: academicYear,
      specialty: specialty,
      phone: phone,
      bio: bio,
    );
    studentsNotifier.value = [created, ...studentsNotifier.value];
  }

  void updateStudent({
    required String uid,
    required String displayName,
    required String email,
    required String matricule,
    required String university,
    required String academicYear,
    required String specialty,
    String phone = '',
    String bio = '',
  }) {
    studentsNotifier.value = studentsNotifier.value.map((s) {
      if (s.uid != uid) return s;
      return s.copyWith(
        displayName: displayName,
        email: email,
        matricule: matricule,
        university: university,
        academicYear: academicYear,
        specialty: specialty,
        phone: phone,
        bio: bio,
      );
    }).toList(growable: false);
  }

  void deleteStudent(String uid) {
    studentsNotifier.value = studentsNotifier.value
        .where((s) => s.uid != uid)
        .toList(growable: false);
  }
}
