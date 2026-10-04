import 'package:firebase_core/firebase_core.dart';
import 'package:flutter/material.dart';

import 'firebase_options.dart';
import 'screens/role_selection.dart';
import 'services/fcm_service.dart';
import 'services/firebase_auth_service.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await Firebase.initializeApp(options: DefaultFirebaseOptions.currentPlatform);
  // Initialize FCM service and persist device token
  await FcmService.instance.initialize();
  runApp(const AnatomyZApp());
}

class AnatomyZApp extends StatelessWidget {
  const AnatomyZApp({super.key});

  @override
  Widget build(BuildContext context) {
    final authService = FirebaseAuthService.instance;

    // Original AnatomyZ Icon Palette:
    // Warm Limestone Ochre: #DACBA9 / #ECE3D9 / #F5EFE6
    // Anatomical Slate & Obsidian: #1E242C / #15191E / #5C656B
    final darkScheme = ColorScheme.fromSeed(
      seedColor: const Color(0xFFDACBA9),
      brightness: Brightness.dark,
      surface: const Color(0xFF1E242C),
      primary: const Color(0xFFDACBA9),
      onPrimary: const Color(0xFF15191E),
      secondary: const Color(0xFF646D79),
      onSecondary: const Color(0xFFFAF6F0),
    );

    final lightScheme = ColorScheme.fromSeed(
      seedColor: const Color(0xFFDACBA9),
      brightness: Brightness.light,
      surface: const Color(0xFFECE3D9),
      primary: const Color(0xFF1E242C),
      onPrimary: const Color(0xFFECE3D9),
      secondary: const Color(0xFF5C656B),
      onSecondary: const Color(0xFFFAF6F0),
    );

    return ValueListenableBuilder<ThemeScheduleMode>(
      valueListenable: authService.themePreferenceNotifier,
      builder: (context, themePref, _) {
        return ValueListenableBuilder<AppLanguage>(
          valueListenable: authService.languageNotifier,
          builder: (context, lang, _) {
            return MaterialApp(
              title: 'AnatomyZ',
              debugShowCheckedModeBanner: false,
              themeMode: authService.resolvedThemeMode,
              theme: ThemeData(
                useMaterial3: true,
                colorScheme: lightScheme,
                scaffoldBackgroundColor: const Color(0xFFF5EFE6),
                appBarTheme: const AppBarTheme(
                  backgroundColor: Color(0xFFECE3D9),
                  foregroundColor: Color(0xFF1E242C),
                  elevation: 0,
                  centerTitle: false,
                ),
                cardTheme: CardThemeData(
                  color: const Color(0xFFECE3D9),
                  elevation: 0,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(18),
                    side: const BorderSide(color: Color(0xFFC8B9A6)),
                  ),
                ),
                filledButtonTheme: FilledButtonThemeData(
                  style: FilledButton.styleFrom(
                    backgroundColor: const Color(0xFF1E242C),
                    foregroundColor: const Color(0xFFECE3D9),
                    minimumSize: const Size(48, 48),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(14),
                    ),
                  ),
                ),
                outlinedButtonTheme: OutlinedButtonThemeData(
                  style: OutlinedButton.styleFrom(
                    foregroundColor: const Color(0xFF1E242C),
                    minimumSize: const Size(48, 48),
                    side: const BorderSide(color: Color(0xFF5C656B)),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(14),
                    ),
                  ),
                ),
              ),
              darkTheme: ThemeData(
                useMaterial3: true,
                colorScheme: darkScheme,
                scaffoldBackgroundColor: const Color(0xFF15191E),
                appBarTheme: const AppBarTheme(
                  backgroundColor: Color(0xFF1E242C),
                  foregroundColor: Color(0xFFFAF6F0),
                  elevation: 0,
                  centerTitle: false,
                ),
                cardTheme: CardThemeData(
                  color: const Color(0xFF1E242C),
                  elevation: 0,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(18),
                    side: const BorderSide(color: Color(0xFF323B46)),
                  ),
                ),
                filledButtonTheme: FilledButtonThemeData(
                  style: FilledButton.styleFrom(
                    backgroundColor: const Color(0xFFDACBA9),
                    foregroundColor: const Color(0xFF15191E),
                    minimumSize: const Size(48, 48),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(14),
                    ),
                  ),
                ),
                outlinedButtonTheme: OutlinedButtonThemeData(
                  style: OutlinedButton.styleFrom(
                    foregroundColor: const Color(0xFFFAF6F0),
                    minimumSize: const Size(48, 48),
                    side: const BorderSide(color: Color(0xFF455160)),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(14),
                    ),
                  ),
                ),
                inputDecorationTheme: InputDecorationTheme(
                  filled: true,
                  fillColor: const Color(0xFF15191E),
                  contentPadding: const EdgeInsets.symmetric(
                    horizontal: 16,
                    vertical: 14,
                  ),
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(14),
                    borderSide: const BorderSide(color: Color(0xFF323B46)),
                  ),
                  enabledBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(14),
                    borderSide: const BorderSide(color: Color(0xFF323B46)),
                  ),
                  focusedBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(14),
                    borderSide:
                        const BorderSide(color: Color(0xFFDACBA9), width: 1.5),
                  ),
                ),
              ),
              home: const RoleSelectionPage(),
            );
          },
        );
      },
    );
  }
}
