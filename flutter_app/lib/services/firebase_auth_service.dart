import 'dart:async';
import 'package:firebase_auth/firebase_auth.dart' as fb;
import 'package:firebase_core/firebase_core.dart';
import 'package:flutter/foundation.dart';
import 'package:google_sign_in/google_sign_in.dart';

/// Representation of an authenticated AnatomyZ user.
class AnatomyUser {
  const AnatomyUser({
    required this.uid,
    required this.email,
    required this.displayName,
    this.photoUrl,
    this.role = 'student',
  });

  final String uid;
  final String email;
  final String displayName;
  final String? photoUrl;
  final String role;

  bool get isProfessor => role == 'professor';
  bool get isStudent => role == 'student';
  bool get isAdmin => role == 'admin' || email.toLowerCase() == 'forslog@gmail.com';

  Map<String, dynamic> toMap() {
    return {
      'uid': uid,
      'email': email,
      'displayName': displayName,
      'photoURL': photoUrl,
      'role': role,
      'updatedAt': DateTime.now().toIso8601String(),
    };
  }
}

/// Firebase Auth & Google Sign-In Service for Flutter
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
      '254886564090-6lhmpnebecd7ubrudmdett4imakmuagi.apps.googleusercontent.com';

  final ValueNotifier<AnatomyUser?> currentUserNotifier =
      ValueNotifier<AnatomyUser?>(null);

  final Map<String, String> _rolesByUid = {};
  bool _googleSignInInitialized = false;

  AnatomyUser? get currentUser => currentUserNotifier.value;
  bool get isAuthenticated => currentUserNotifier.value != null;

  Future<void> _ensureGoogleSignInInitialized() async {
    if (_googleSignInInitialized) return;
    await GoogleSignIn.instance.initialize(
      clientId: kIsWeb ? _webClientId : null,
      serverClientId: _webClientId,
    );
    _googleSignInInitialized = true;
  }

  void _onAuthStateChanged(fb.User? firebaseUser) {
    if (firebaseUser == null) {
      currentUserNotifier.value = null;
      return;
    }
    currentUserNotifier.value = AnatomyUser(
      uid: firebaseUser.uid,
      email: firebaseUser.email ?? '',
      displayName: firebaseUser.displayName ?? 'Utilisateur AnatomyZ',
      photoUrl: firebaseUser.photoURL,
      role: _rolesByUid[firebaseUser.uid] ?? 'student',
    );
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
      } catch (_) {
        // Access token is optional; idToken alone is enough for Firebase.
      }

      final credential = fb.GoogleAuthProvider.credential(
        idToken: idToken,
        accessToken: accessToken,
      );
      final userCredential =
          await fb.FirebaseAuth.instance.signInWithCredential(credential);
      final uid = userCredential.user?.uid;
      if (uid != null) {
        _rolesByUid[uid] = defaultRole;
      }
      // Rebuild the notifier with the requested default role immediately.
      final firebaseUser = userCredential.user;
      if (firebaseUser != null) {
        currentUserNotifier.value = AnatomyUser(
          uid: firebaseUser.uid,
          email: firebaseUser.email ?? '',
          displayName: firebaseUser.displayName ?? 'Utilisateur AnatomyZ',
          photoUrl: firebaseUser.photoURL,
          role: defaultRole,
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
      await fb.FirebaseAuth.instance.signOut();
    }
    currentUserNotifier.value = null;
  }

  /// Switch user role (Student <-> Professor)
  void setRole(String newRole) {
    final current = currentUserNotifier.value;
    if (current != null) {
      _rolesByUid[current.uid] = newRole;
      currentUserNotifier.value = AnatomyUser(
        uid: current.uid,
        email: current.email,
        displayName: current.displayName,
        photoUrl: current.photoUrl,
        role: newRole,
      );
    }
  }
}
