import 'package:flutter/material.dart';

import 'screens/role_selection.dart';

void main() {
  runApp(const AnatomyZApp());
}

class AnatomyZApp extends StatelessWidget {
  const AnatomyZApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'AnatomyZ',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(seedColor: Colors.indigo),
        useMaterial3: true,
      ),
      home: const RoleSelectionPage(),
    );
  }
}
