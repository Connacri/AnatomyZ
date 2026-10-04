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
        return ValueListenableBuilder<AppLanguage>(
          valueListenable: _authService.languageNotifier,
          builder: (context, lang, _) {
            final isAdmin = user?.isAdmin ?? false;
            final isProf = user?.isProfessor ?? false;
            final isPendingProf = user?.isPendingProfessor ?? false;

            // Strict Role-Based Workspace Card Visibility (Request #9):
            // - Unauthenticated: both cards visible for initial role sign-in (and widget_test)
            // - Admin: sees ALL cards (Professor + Student + Admin Panel)
            // - Professor: sees ONLY the Professor card
            // - Student: sees ONLY the Student card
            final showProfessorCard = user == null || isAdmin || isProf;
            final showStudentCard =
                user == null || isAdmin || (!isProf && !isAdmin);
            final showAdminCard = isAdmin;

            return Scaffold(
              appBar: AppBar(
                title: Row(
                  children: [
                    Container(
                      width: 30,
                      height: 30,
                      decoration: BoxDecoration(
                        color: const Color(0xFFDACBA9),
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
                      style:
                          TextStyle(fontWeight: FontWeight.bold, fontSize: 18),
                    ),
                  ],
                ),
                actions: [
                  // Multilingual selector FR / EN
                  PopupMenuButton<AppLanguage>(
                    tooltip: 'Langue (FR / EN)',
                    icon: const Icon(Icons.language, size: 20),
                    onSelected: _authService.setLanguage,
                    itemBuilder: (context) => const [
                      PopupMenuItem(
                        value: AppLanguage.fr,
                        child: Text('FR — Français'),
                      ),
                      PopupMenuItem(
                        value: AppLanguage.en,
                        child: Text('EN — English'),
                      ),
                    ],
                  ),
                  // Time-based / Manual Theme Switcher
                  IconButton(
                    tooltip: _authService.t('themeAuto'),
                    icon: Icon(
                      _authService.themePreferenceNotifier.value ==
                              ThemeScheduleMode.auto
                          ? Icons.schedule
                          : _authService.resolvedThemeMode == ThemeMode.light
                              ? Icons.light_mode
                              : Icons.dark_mode,
                      size: 20,
                    ),
                    onPressed: () {
                      _authService.cycleThemePreference();
                      setState(() {});
                    },
                  ),
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
                          backgroundColor: const Color(0xFFDACBA9),
                          child: Text(
                            (user.displayName.isNotEmpty
                                    ? user.displayName[0]
                                    : 'U')
                                .toUpperCase(),
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
                                  style: const TextStyle(
                                      fontWeight: FontWeight.bold),
                                ),
                                Text(
                                  user.email,
                                  style: const TextStyle(
                                      fontSize: 12, color: Colors.grey),
                                ),
                              ],
                            ),
                          ),
                          const PopupMenuDivider(),
                          const PopupMenuItem(
                            value: 'fcm',
                            child: Row(
                              children: [
                                Icon(Icons.cloud_sync,
                                    size: 18, color: Colors.blueAccent),
                                SizedBox(width: 8),
                                Text('Statut FCM'),
                              ],
                            ),
                          ),
                          const PopupMenuItem(
                            value: 'signout',
                            child: Row(
                              children: [
                                Icon(Icons.logout,
                                    size: 18, color: Colors.redAccent),
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
                      padding: const EdgeInsets.symmetric(
                          horizontal: 20, vertical: 24),
                      children: [
                        const Icon(Icons.biotech,
                            size: 64, color: Color(0xFFDACBA9)),
                        const SizedBox(height: 12),
                        Text(
                          user == null
                              ? _authService.t('chooseRole')
                              : (isAdmin
                                  ? _authService.t('allSpacesAdmin')
                                  : _authService.t('authorizedSpace')),
                          textAlign: TextAlign.center,
                          style: Theme.of(context)
                              .textTheme
                              .headlineSmall
                              ?.copyWith(
                                fontWeight: FontWeight.w800,
                              ),
                        ),
                        const SizedBox(height: 8),
                        Text(
                          _authService.t('subtitle'),
                          textAlign: TextAlign.center,
                          style: Theme.of(context).textTheme.bodyMedium,
                        ),
                        const SizedBox(height: 16),
                        // Pending Professor Approval Banner
                        if (isPendingProf) ...[
                          Container(
                            padding: const EdgeInsets.all(14),
                            decoration: BoxDecoration(
                              color: const Color(0xFF1E242C),
                              borderRadius: BorderRadius.circular(14),
                              border: Border.all(
                                  color: Colors.amberAccent, width: 1.5),
                            ),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Row(
                                  children: [
                                    const Icon(Icons.warning_amber_rounded,
                                        color: Colors.amberAccent, size: 20),
                                    const SizedBox(width: 8),
                                    Expanded(
                                      child: Text(
                                        _authService.t('pendingBannerTitle'),
                                        style: const TextStyle(
                                          fontWeight: FontWeight.bold,
                                          color: Color(0xFFFAF6F0),
                                          fontSize: 13,
                                        ),
                                      ),
                                    ),
                                  ],
                                ),
                                const SizedBox(height: 6),
                                Text(
                                  _authService.t('pendingBannerDesc'),
                                  style: const TextStyle(
                                    fontSize: 12,
                                    color: Color(0xFFBAC3CE),
                                  ),
                                ),
                              ],
                            ),
                          ),
                          const SizedBox(height: 14),
                        ],
                        // FCM Badge
                        ValueListenableBuilder<String?>(
                          valueListenable: _fcmService.currentTokenNotifier,
                          builder: (context, token, _) {
                            return Container(
                              padding: const EdgeInsets.symmetric(
                                  horizontal: 14, vertical: 10),
                              decoration: BoxDecoration(
                                color: const Color(0xFF1E242C),
                                borderRadius: BorderRadius.circular(14),
                                border:
                                    Border.all(color: const Color(0xFF323B46)),
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
                                    onPressed: () =>
                                        _showFcmDialog(context, user),
                                    child: const Text('Gérer',
                                        style: TextStyle(fontSize: 12)),
                                  ),
                                ],
                              ),
                            );
                          },
                        ),
                        const SizedBox(height: 18),
                        // Role Cards filtered strictly by authorized role
                        if (showProfessorCard) ...[
                          _RoleCard(
                            icon: Icons.school,
                            title: _authService.t('professor'),
                            subtitle: isPendingProf
                                ? _authService.t('professorPendingSub')
                                : _authService.t('professorSub'),
                            onTap: () async {
                              if (user == null) {
                                await _authService.signInWithGoogle(
                                    defaultRole: 'professor');
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
                        ],
                        if (showStudentCard) ...[
                          _RoleCard(
                            icon: Icons.person,
                            title: _authService.t('student'),
                            subtitle: _authService.t('studentSub'),
                            onTap: () async {
                              if (user == null) {
                                await _authService.signInWithGoogle(
                                    defaultRole: 'student');
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
                          const SizedBox(height: 12),
                        ],
                        if (showAdminCard) ...[
                          _RoleCard(
                            icon: Icons.admin_panel_settings,
                            title: _authService.t('adminPanel'),
                            subtitle: _authService.t('adminSub'),
                            onTap: () {
                              Navigator.push(
                                context,
                                MaterialPageRoute(
                                  builder: (_) => const AdminDashboardPage(),
                                ),
                              );
                            },
                          ),
                          const SizedBox(height: 12),
                        ],
                        if (user == null) ...[
                          const SizedBox(height: 8),
                          Container(
                            padding: const EdgeInsets.all(16),
                            decoration: BoxDecoration(
                              color: const Color(0xFF1E242C),
                              borderRadius: BorderRadius.circular(16),
                              border:
                                  Border.all(color: const Color(0xFF323B46)),
                            ),
                            child: Column(
                              children: [
                                const Row(
                                  mainAxisAlignment: MainAxisAlignment.center,
                                  children: [
                                    Icon(Icons.account_circle_outlined,
                                        size: 20, color: Color(0xFFDACBA9)),
                                    SizedBox(width: 8),
                                    Text(
                                      'Connexion Google Universitaire',
                                      style: TextStyle(
                                        fontWeight: FontWeight.bold,
                                        fontSize: 14,
                                        color: Color(0xFFFAF6F0),
                                      ),
                                    ),
                                  ],
                                ),
                                const SizedBox(height: 6),
                                const Text(
                                  'Connectez votre compte pour synchroniser vos examens, notes et notifications sur tous vos appareils.',
                                  textAlign: TextAlign.center,
                                  style: TextStyle(
                                      fontSize: 12, color: Color(0xFFBAC3CE)),
                                ),
                                const SizedBox(height: 12),
                                ElevatedButton.icon(
                                  style: ElevatedButton.styleFrom(
                                    backgroundColor: const Color(0xFFDACBA9),
                                    foregroundColor: const Color(0xFF15191E),
                                    shape: RoundedRectangleBorder(
                                        borderRadius:
                                            BorderRadius.circular(12)),
                                  ),
                                  icon: const Icon(Icons.login),
                                  label:
                                      const Text('Se connecter avec Google'),
                                  onPressed: () =>
                                      _authService.signInWithGoogle(),
                                ),
                              ],
                            ),
                          ),
                        ],
                        const SizedBox(height: 16),
                        OutlinedButton.icon(
                          icon: const Icon(Icons.view_in_ar),
                          label: Text(_authService.t('exploreAtlas')),
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
              shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(20)),
              title: const Row(
                children: [
                  Icon(Icons.notifications_active, color: Color(0xFFDACBA9)),
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
                        enabled
                            ? 'Notifications actives'
                            : 'Notifications désactivées',
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
                      style:
                          TextStyle(fontSize: 12, fontWeight: FontWeight.bold),
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
                                color: Color(0xFFDACBA9),
                              ),
                            ),
                          ),
                          IconButton(
                            icon: const Icon(Icons.copy, size: 16),
                            tooltip: 'Copier le token',
                            onPressed: () {
                              Clipboard.setData(ClipboardData(text: token));
                              ScaffoldMessenger.of(context).showSnackBar(
                                const SnackBar(
                                    content: Text(
                                        'Token FCM copié dans le presse-papiers !')),
                              );
                            },
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 12),
                    Row(
                      children: [
                        const Icon(Icons.check_circle,
                            size: 14, color: Colors.greenAccent),
                        const SizedBox(width: 6),
                        Expanded(
                          child: Text(
                            user != null
                                ? 'Lié au profil Firestore : ${user.email}'
                                : 'Connectez-vous avec Google pour lier votre token.',
                            style: const TextStyle(
                                fontSize: 11, color: Color(0xFFBAC3CE)),
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
                            body:
                                'Votre token FCM fonctionne parfaitement et est synchronisé !',
                          );
                          ScaffoldMessenger.of(context).showSnackBar(
                            const SnackBar(
                              backgroundColor: Color(0xFF1E242C),
                              content:
                                  Text('🔔 Notification push test reçue !'),
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
        leading: Icon(icon, size: 36, color: const Color(0xFFDACBA9)),
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
