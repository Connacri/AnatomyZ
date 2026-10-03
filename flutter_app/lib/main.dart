import 'package:flutter/material.dart';

import 'screens/role_selection.dart';

void main() {
  runApp(const AnatomyZApp());
}

class AnatomyZApp extends StatelessWidget {
  const AnatomyZApp({super.key});

  @override
  Widget build(BuildContext context) {
    final colorScheme = ColorScheme.fromSeed(
      seedColor: const Color(0xFF4F46E5),
      brightness: Brightness.dark,
      surface: const Color(0xFF0D1A2B),
    );

    return MaterialApp(
      title: 'AnatomyZ',
      debugShowCheckedModeBanner: false,
      themeMode: ThemeMode.dark,
      darkTheme: ThemeData(
        useMaterial3: true,
        colorScheme: colorScheme,
        scaffoldBackgroundColor: const Color(0xFF08111F),
        appBarTheme: const AppBarTheme(
          backgroundColor: Color(0xFF0D1A2B),
          foregroundColor: Color(0xFFEEF4FF),
          elevation: 0,
          centerTitle: false,
        ),
        cardTheme: CardThemeData(
          color: const Color(0xFF0D1A2B),
          elevation: 0,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(18),
            side: const BorderSide(color: Color(0xFF203651)),
          ),
        ),
        filledButtonTheme: FilledButtonThemeData(
          style: FilledButton.styleFrom(
            minimumSize: const Size(48, 48),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(14),
            ),
          ),
        ),
        outlinedButtonTheme: OutlinedButtonThemeData(
          style: OutlinedButton.styleFrom(
            minimumSize: const Size(48, 48),
            side: const BorderSide(color: Color(0xFF2C4A70)),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(14),
            ),
          ),
        ),
        inputDecorationTheme: InputDecorationTheme(
          filled: true,
          fillColor: const Color(0xFF060D18),
          contentPadding: const EdgeInsets.symmetric(
            horizontal: 16,
            vertical: 14,
          ),
          border: OutlineInputBorder(
            borderRadius: BorderRadius.circular(14),
            borderSide: const BorderSide(color: Color(0xFF203651)),
          ),
          enabledBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(14),
            borderSide: const BorderSide(color: Color(0xFF203651)),
          ),
        ),
      ),
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(seedColor: Colors.indigo),
        useMaterial3: true,
      ),
      home: const RoleSelectionPage(),
    );
  }
}
