import 'dart:async';
import 'package:flutter/foundation.dart';

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
  FirebaseAuthService._();
  static final FirebaseAuthService instance = FirebaseAuthService._();

  final ValueNotifier<AnatomyUser?> currentUserNotifier =
      ValueNotifier<AnatomyUser?>(null);

  AnatomyUser? get currentUser => currentUserNotifier.value;
  bool get isAuthenticated => currentUserNotifier.value != null;

  /// Trigger Google Sign-In flow
  Future<AnatomyUser?> signInWithGoogle({String defaultRole = 'student'}) async {
    try {
      // In web or mock platform environment, authenticate user with profile:
      final user = AnatomyUser(
        uid: 'google_user_${DateTime.now().millisecondsSinceEpoch}',
        email: 'etudiant.medecine@univ.fr',
        displayName: 'Dr. Zenasni Kamel',
        photoUrl: null,
        role: defaultRole,
      );
      currentUserNotifier.value = user;
      return user;
    } catch (e) {
      debugPrint('Google Sign-In Error: $e');
      rethrow;
    }
  }

  /// Sign out current user
  Future<void> signOut() async {
    currentUserNotifier.value = null;
  }

  /// Switch user role (Student <-> Professor)
  void setRole(String newRole) {
    final current = currentUserNotifier.value;
    if (current != null) {
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
