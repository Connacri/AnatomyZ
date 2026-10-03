import 'package:flutter/material.dart';

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
      home: const AnatomyZHomePage(),
    );
  }
}

class AnatomyZHomePage extends StatelessWidget {
  const AnatomyZHomePage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('AnatomyZ')),
      body: const Center(
        child: Text(
          'AnatomyZ\n3D Human Anatomy Atlas',
          textAlign: TextAlign.center,
        ),
      ),
    );
  }
}
