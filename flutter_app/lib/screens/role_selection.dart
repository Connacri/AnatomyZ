import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

import '../models/anatomy_role.dart';
import '../services/fcm_service.dart';
import '../services/firebase_auth_service.dart';
import 'academic_dashboard.dart';
import 'anatomy_home.dart';

class RoleSelectionPage extends StatefulWidget {
  const RoleSelectionPage({super.key});

  @override
  State<RoleSelectionPage> createState() => _RoleSelectionPageState();
}

class _RoleSelectionPageState extends State<RoleSelectionPage> {
  final FirebaseAuthService _authService = FirebaseAuthService.instance;
  final FcmService _fcmService = FcmService.instance;

  @override
  Widget build(BuildContext context) {
    return ValueListenableBuilder<AnatomyUser?>(
      valueListenable: _authService.currentUserNotifier,
      builder: (context, user, _) {
        return Scaffold(
          appBar: AppBar(
            title: Row(
              children: [
                Container(
                  width: 30,
                  height: 30,
                  decoration: BoxDecoration(
                    color: const Color(0xFFECE3D9),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: const Center(
                    child: Text(
                      'Z',
                      style: TextStyle(
                        color: Color(0xFF1E242C),
                        fontWeight: FontWeight.bold,
                        fontSize: 16,
                      ),
                    ),
                  ),
                ),
                const SizedBox(width: 10),
                const Text(
                  'AnatomyZ',
                  style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18),
                ),
              ],
            ),
            actions: [
              // FCM Push Notifications Button
              IconButton(
                icon: const Icon(Icons.notifications_active_outlined),
                tooltip: 'Notifications FCM',
                onPressed: () => _showFcmDialog(context, user),
              ),
              // User Account Status
              if (user != null)
                Padding(
                  padding: const EdgeInsets.only(right: 8.0),
                  child: PopupMenuButton<String>(
                    tooltip: 'Profil',
                    child: CircleAvatar(
                      radius: 16,
                      backgroundColor: const Color(0xFFECE3D9),
                      child: Text(
                        (user.displayName.isNotEmpty ? user.displayName[0] : 'U').toUpperCase(),
                        style: const TextStyle(
                          color: Color(0xFF1E242C),
                          fontWeight: FontWeight.bold,
                          fontSize: 14,
                        ),
                      ),
                    ),
                    itemBuilder: (context) => [
                      PopupMenuItem(
                        enabled: false,
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              user.displayName,
                              style: const TextStyle(fontWeight: FontWeight.bold),
                            ),
                            Text(
                              user.email,
                              style: const TextStyle(fontSize: 12, color: Colors.grey),
                            ),
                          ],
                        ),
                      ),
                      const PopupMenuDivider(),
                      const PopupMenuItem(
                        value: 'fcm',
                        child: Row(
                          children: [
                            Icon(Icons.cloud_sync, size: 18, color: Colors.blueAccent),
                            SizedBox(width: 8),
                            Text('Statut FCM'),
                          ],
                        ),
                      ),
                      const PopupMenuItem(
                        value: 'signout',
                        child: Row(
                          children: [
                            Icon(Icons.logout, size: 18, color: Colors.redAccent),
                            SizedBox(width: 8),
                            Text('Se déconnecter'),
                          ],
                        ),
                      ),
                    ],
                    onSelected: (value) {
                      if (value == 'signout') {
                        _authService.signOut();
                      } else if (value == 'fcm') {
                        _showFcmDialog(context, user);
                      }
                    },
                  ),
                )
              else
                Padding(
                  padding: const EdgeInsets.only(right: 8.0),
                  child: TextButton.icon(
                    icon: const Icon(Icons.account_circle, size: 18),
                    label: const Text('Google Sign-In'),
                    style: TextButton.styleFrom(
                      foregroundColor: const Color(0xFFECE3D9),
                    ),
                    onPressed: () async {
                      await _authService.signInWithGoogle();
                      final loggedIn = _authService.currentUser;
                      if (loggedIn != null) {
                        await _fcmService.initialize(user: loggedIn);
                      }
                    },
                  ),
                ),
            ],
          ),
          body: SafeArea(
            child: Center(
              child: ConstrainedBox(
                constraints: const BoxConstraints(maxWidth: 560),
                child: ListView(
                  shrinkWrap: true,
                  padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 24),
                  children: [
                    const Icon(Icons.biotech, size: 64, color: Color(0xFF8FC5FF)),
                    const SizedBox(height: 12),
                    Text(
                      'Choisissez votre rôle',
                      textAlign: TextAlign.center,
                      style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                            fontWeight: FontWeight.w800,
                          ),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      'Atlas anatomique humain 3D, Knowledge Graph FMA/UBERON et espace pédagogique sécurisé.',
                      textAlign: TextAlign.center,
                      style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                            color: const Color(0xFFB8C7DA),
                          ),
                    ),
                    const SizedBox(height: 16),
                    // FCM Badge
                    ValueListenableBuilder<String?>(
                      valueListenable: _fcmService.currentTokenNotifier,
                      builder: (context, token, _) {
                        return Container(
                          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                          decoration: BoxDecoration(
                            color: const Color(0xFF15191E),
                            borderRadius: BorderRadius.circular(14),
                            border: Border.all(color: const Color(0xFF323B46)),
                          ),
                          child: Row(
                            children: [
                              Container(
                                width: 8,
                                height: 8,
                                decoration: const BoxDecoration(
                                  color: Colors.greenAccent,
                                  shape: BoxShape.circle,
                                ),
                              ),
                              const SizedBox(width: 10),
                              Expanded(
                                child: Text(
                                  token != null
                                      ? 'FCM connecté & synchronisé dans Firestore'
                                      : 'FCM en cours d’initialisation...',
                                  style: const TextStyle(
                                    fontSize: 12,
                                    color: Color(0xFFECE3D9),
                                    fontWeight: FontWeight.w500,
                                  ),
                                ),
                              ),
                              TextButton(
                                onPressed: () => _showFcmDialog(context, user),
                                child: const Text('Gérer', style: TextStyle(fontSize: 12)),
                              ),
                            ],
                          ),
                        );
                      },
                    ),
                    const SizedBox(height: 18),
                    // Role Cards (Professeur & Étudiant)
                    _RoleCard(
                      icon: Icons.school,
                      title: 'Professeur',
                      subtitle: 'Créer des quiz, gérer les classes et publier des examens',
                      onTap: () async {
                        if (user == null) {
                          await _authService.signInWithGoogle(defaultRole: 'professor');
                        } else {
                          _authService.setRole('professor');
                        }
                        if (context.mounted) {
                          Navigator.push(
                            context,
                            MaterialPageRoute(
                              builder: (_) => const AcademicDashboardPage(
                                role: AnatomyRole.professor,
                              ),
                            ),
                          );
                        }
                      },
                    ),
                    const SizedBox(height: 12),
                    _RoleCard(
                      icon: Icons.person,
                      title: 'Étudiant',
                      subtitle: 'Consulter les examens assignés, les passer et suivre ses notes',
                      onTap: () async {
                        if (user == null) {
                          await _authService.signInWithGoogle(defaultRole: 'student');
                        } else {
                          _authService.setRole('student');
                        }
                        if (context.mounted) {
                          Navigator.push(
                            context,
                            MaterialPageRoute(
                              builder: (_) => const AcademicDashboardPage(
                                role: AnatomyRole.student,
                              ),
                            ),
                          );
                        }
                      },
                    ),
                    if (user == null) ...[
                      const SizedBox(height: 16),
                      Container(
                        padding: const EdgeInsets.all(16),
                        decoration: BoxDecoration(
                          color: const Color(0xFF161C24),
                          borderRadius: BorderRadius.circular(16),
                          border: Border.all(color: const Color(0xFF263140)),
                        ),
                        child: Column(
                          children: [
                            Row(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: const [
                                Icon(Icons.account_circle_outlined, size: 20, color: Color(0xFFE5DCD0)),
                                SizedBox(width: 8),
                                Text(
                                  'Connexion Google optionnelle',
                                  style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
                                ),
                              ],
                            ),
                            const SizedBox(height: 6),
                            const Text(
                              'Connectez votre compte pour synchroniser vos examens, notes et notifications sur tous vos appareils.',
                              textAlign: TextAlign.center,
                              style: TextStyle(fontSize: 12, color: Color(0xFF8F9CAE)),
                            ),
                            const SizedBox(height: 12),
                            ElevatedButton.icon(
                              style: ElevatedButton.styleFrom(
                                backgroundColor: const Color(0xFFE5DCD0),
                                foregroundColor: const Color(0xFF0F1318),
                                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                              ),
                              icon: const Icon(Icons.login),
                              label: const Text('Se connecter avec Google'),
                              onPressed: () => _authService.signInWithGoogle(),
                            ),
                          ],
                        ),
                      ),
                    ],
                    const SizedBox(height: 16),
                    OutlinedButton.icon(
                      icon: const Icon(Icons.view_in_ar),
                      label: const Text('Explorer directement l’atlas 3D'),
                      onPressed: () => Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (_) => const AnatomyHomePage(),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
        );
      },
    );
  }

  void _showFcmDialog(BuildContext context, AnatomyUser? user) {
    showDialog(
      context: context,
      builder: (context) {
        return ValueListenableBuilder<bool>(
          valueListenable: _fcmService.notificationsEnabledNotifier,
          builder: (context, enabled, _) {
            final token = _fcmService.currentToken ?? 'Génération du token...';
            return AlertDialog(
              backgroundColor: const Color(0xFF1E242C),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
              title: const Row(
                children: [
                  Icon(Icons.notifications_active, color: Color(0xFFECE3D9)),
                  SizedBox(width: 10),
                  Text('Firebase Cloud Messaging'),
                ],
              ),
              content: SingleChildScrollView(
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'Gestion des notifications push et synchronisation du token FCM dans Firestore.',
                      style: TextStyle(fontSize: 13, color: Color(0xFFBAC3CE)),
                    ),
                    const SizedBox(height: 16),
                    SwitchListTile(
                      contentPadding: EdgeInsets.zero,
                      title: const Text('Activer les notifications push'),
                      subtitle: Text(
                        enabled ? 'Notifications actives' : 'Notifications désactivées',
                        style: const TextStyle(fontSize: 12),
                      ),
                      value: enabled,
                      onChanged: (val) {
                        _fcmService.toggleNotifications(val, user: user);
                      },
                    ),
                    const Divider(color: Color(0xFF323B46)),
                    const SizedBox(height: 8),
                    const Text(
                      'Token FCM de cet appareil :',
                      style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold),
                    ),
                    const SizedBox(height: 6),
                    Container(
                      padding: const EdgeInsets.all(10),
                      decoration: BoxDecoration(
                        color: const Color(0xFF15191E),
                        borderRadius: BorderRadius.circular(10),
                        border: Border.all(color: const Color(0xFF323B46)),
                      ),
                      child: Row(
                        children: [
                          Expanded(
                            child: Text(
                              token,
                              maxLines: 2,
                              overflow: TextOverflow.ellipsis,
                              style: const TextStyle(
                                fontFamily: 'monospace',
                                fontSize: 11,
                                color: Color(0xFF8FC5FF),
                              ),
                            ),
                          ),
                          IconButton(
                            icon: const Icon(Icons.copy, size: 16),
                            tooltip: 'Copier le token',
                            onPressed: () {
                              Clipboard.setData(ClipboardData(text: token));
                              ScaffoldMessenger.of(context).showSnackBar(
                                const SnackBar(content: Text('Token FCM copié dans le presse-papiers !')),
                              );
                            },
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 12),
                    Row(
                      children: [
                        const Icon(Icons.check_circle, size: 14, color: Colors.greenAccent),
                        const SizedBox(width: 6),
                        Expanded(
                          child: Text(
                            user != null
                                ? 'Lié au profil Firestore : ${user.email}'
                                : 'Connectez-vous avec Google pour lier votre token.',
                            style: const TextStyle(fontSize: 11, color: Color(0xFFBAC3CE)),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 16),
                    SizedBox(
                      width: double.infinity,
                      child: FilledButton.icon(
                        icon: const Icon(Icons.send, size: 16),
                        label: const Text('Tester une notification locale'),
                        onPressed: () {
                          _fcmService.handleIncomingMessage(
                            title: 'AnatomyZ Push FCM',
                            body: 'Votre token FCM fonctionne parfaitement et est synchronisé !',
                          );
                          ScaffoldMessenger.of(context).showSnackBar(
                            const SnackBar(
                              backgroundColor: Color(0xFF1E242C),
                              content: Text('🔔 Notification push test reçue !'),
                            ),
                          );
                          Navigator.pop(context);
                        },
                      ),
                    ),
                  ],
                ),
              ),
              actions: [
                TextButton(
                  onPressed: () => Navigator.pop(context),
                  child: const Text('Fermer'),
                ),
              ],
            );
          },
        );
      },
    );
  }
}

class _RoleCard extends StatelessWidget {
  const _RoleCard({
    required this.icon,
    required this.title,
    required this.subtitle,
    required this.onTap,
  });

  final IconData icon;
  final String title;
  final String subtitle;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Card(
      child: ListTile(
        contentPadding: const EdgeInsets.symmetric(
          horizontal: 18,
          vertical: 12,
        ),
        leading: Icon(icon, size: 36, color: const Color(0xFF8FC5FF)),
        title: Text(
          title,
          style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 17),
        ),
        subtitle: Text(subtitle),
        trailing: const Icon(Icons.arrow_forward_ios, size: 18),
        onTap: onTap,
      ),
    );
  }
}
