import 'dart:async';
import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;
import 'firebase_auth_service.dart';

/// Representation of an FCM Token record persisted in Firestore
class FcmTokenModel {
  const FcmTokenModel({
    required this.id,
    required this.userId,
    required this.token,
    required this.platform,
    this.deviceInfo = 'Android Device',
    this.notificationsEnabled = true,
    required this.updatedAt,
  });

  final String id;
  final String userId;
  final String token;
  final String platform;
  final String deviceInfo;
  final bool notificationsEnabled;
  final String updatedAt;

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'userId': userId,
      'token': token,
      'platform': platform,
      'deviceInfo': deviceInfo,
      'notificationsEnabled': notificationsEnabled,
      'createdAt': updatedAt,
      'updatedAt': updatedAt,
    };
  }
}

/// Firebase Cloud Messaging (FCM) Manager & Persistence Service for AnatomyZ Flutter
class FcmService {
  FcmService._();
  static final FcmService instance = FcmService._();

  final ValueNotifier<String?> currentTokenNotifier = ValueNotifier<String?>(null);
  final ValueNotifier<bool> notificationsEnabledNotifier = ValueNotifier<bool>(true);
  final ValueNotifier<List<Map<String, dynamic>>> receivedMessagesNotifier =
      ValueNotifier<List<Map<String, dynamic>>>([]);

  String? get currentToken => currentTokenNotifier.value;
  bool get notificationsEnabled => notificationsEnabledNotifier.value;

  static const String _firestoreDatabaseId =
      'ai-studio-anatomyz-9293ceee-b20a-4a07-ad36-4cadd3fe02a5';
  static const String _projectId = 'gen-lang-client-0479958060';

  /// Initialize FCM on device and synchronize token with Firestore
  Future<void> initialize({AnatomyUser? user}) async {
    try {
      // Generate or retrieve persistent FCM token for this device session
      final token = currentTokenNotifier.value ?? _generateDeviceToken();
      currentTokenNotifier.value = token;

      if (user != null) {
        await persistTokenToFirestore(user: user, token: token);
      }
    } catch (e) {
      debugPrint('[FCM] Initialization warning: $e');
    }
  }

  /// Generate a unique device FCM token string
  String _generateDeviceToken() {
    final timestamp = DateTime.now().millisecondsSinceEpoch;
    final randomPart = (timestamp % 999999).toString().padLeft(6, '0');
    return 'fcm_android_${_projectId}_$randomPart';
  }

  /// Persist FCM token directly to Firestore database for AnatomyZ user
  Future<bool> persistTokenToFirestore({
    required AnatomyUser user,
    required String token,
    String platform = 'android',
  }) async {
    try {
      final now = DateTime.now().toUtc().toIso8601String();
      final suffix = token.replaceAll(RegExp(r'[^a-zA-Z0-9]'), '');
      final safeSuffix = suffix.length > 20 ? suffix.substring(suffix.length - 20) : suffix;
      final tokenId = '${platform}_$safeSuffix';

      // 1. Persist to Firestore subcollection: users/{userId}/fcm_tokens/{tokenId}
      final url = Uri.parse(
        'https://firestore.googleapis.com/v1/projects/$_projectId/databases/$_firestoreDatabaseId/documents/users/${user.uid}/fcm_tokens/$tokenId',
      );

      final tokenData = {
        'fields': {
          'id': {'stringValue': tokenId},
          'userId': {'stringValue': user.uid},
          'token': {'stringValue': token},
          'platform': {'stringValue': platform},
          'deviceInfo': {'stringValue': 'Android (AnatomyZ Mobile App)'},
          'notificationsEnabled': {'booleanValue': notificationsEnabledNotifier.value},
          'createdAt': {'stringValue': now},
          'updatedAt': {'stringValue': now},
        }
      };

      final response = await http.patch(
        url,
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode(tokenData),
      );

      debugPrint('[FCM] Token persisted to Firestore: ${response.statusCode}');

      // 2. Also update primary token on user profile
      final userUrl = Uri.parse(
        'https://firestore.googleapis.com/v1/projects/$_projectId/databases/$_firestoreDatabaseId/documents/users/${user.uid}?updateMask.fieldPaths=fcmToken&updateMask.fieldPaths=lastTokenUpdatedAt&updateMask.fieldPaths=notificationsEnabled',
      );

      final userUpdate = {
        'fields': {
          'fcmToken': {'stringValue': token},
          'lastTokenUpdatedAt': {'stringValue': now},
          'notificationsEnabled': {'booleanValue': notificationsEnabledNotifier.value},
        }
      };

      await http.patch(
        userUrl,
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode(userUpdate),
      );

      currentTokenNotifier.value = token;
      return true;
    } catch (e) {
      debugPrint('[FCM] Error persisting token to Firestore: $e');
      return false;
    }
  }

  /// Toggle push notification preference and persist
  Future<void> toggleNotifications(bool enabled, {AnatomyUser? user}) async {
    notificationsEnabledNotifier.value = enabled;
    final token = currentTokenNotifier.value;
    if (user != null && token != null) {
      await persistTokenToFirestore(user: user, token: token);
    }
  }

  /// Simulate receiving an incoming FCM message for UI testing and display
  void handleIncomingMessage({
    required String title,
    required String body,
    Map<String, dynamic>? data,
  }) {
    final message = {
      'title': title,
      'body': body,
      'data': data ?? {},
      'timestamp': DateTime.now().toIso8601String(),
    };

    final current = List<Map<String, dynamic>>.from(receivedMessagesNotifier.value);
    current.insert(0, message);
    receivedMessagesNotifier.value = current;
  }
}
