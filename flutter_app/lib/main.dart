import 'package:firebase_core/firebase_core.dart';
import 'package:flutter/material.dart';

import 'firebase_options.dart';
import 'screens/role_selection.dart';
import 'services/fcm_service.dart';

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
    // Theme palette extracted directly from the official AnatomyZ image:
    // Primary: #DACBA9 / #ECE3D9 (Warm Limestone Ochre)
    // Surface: #1E242C (Dark Slate Charcoal)
    // Background: #15191E (Deep Obsidian)
    // Secondary: #5C656B (Anatomical Slate Gray)
    final colorScheme = ColorScheme.fromSeed(
      seedColor: const Color(0xFFDACBA9),
      brightness: Brightness.dark,
      surface: const Color(0xFF1E242C),
      primary: const Color(0xFFDACBA9),
      onPrimary: const Color(0xFF15191E),
      secondary: const Color(0xFF646D79),
      onSecondary: const Color(0xFFFAF6F0),
    );

    return MaterialApp(
      title: 'AnatomyZ',
      debugShowCheckedModeBanner: false,
      themeMode: ThemeMode.dark,
      darkTheme: ThemeData(
        useMaterial3: true,
        colorScheme: colorScheme,
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
            borderSide: const BorderSide(color: Color(0xFFDACBA9), width: 1.5),
          ),
        ),
      ),
      home: const RoleSelectionPage(),
    );
  }
}
