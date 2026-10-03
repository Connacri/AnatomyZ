import 'package:flutter/material.dart';

import '../models/anatomy_role.dart';
import 'role_home.dart';

class RoleSelectionPage extends StatelessWidget {
  const RoleSelectionPage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('AnatomyZ')),
      body: Center(
        child: ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: 560),
          child: ListView(
            shrinkWrap: true,
            padding: const EdgeInsets.all(24),
            children: [
              const Icon(Icons.biotech, size: 72),
              const SizedBox(height: 16),
              Text(
                'Choisissez votre rôle',
                textAlign: TextAlign.center,
                style: Theme.of(context).textTheme.headlineSmall,
              ),
              const SizedBox(height: 24),
              _RoleCard(
                icon: Icons.school,
                title: 'Professeur',
                subtitle: 'Créer des quiz et des questions d’examen',
                onTap: () => Navigator.push(
                  context,
                  MaterialPageRoute(
                    builder: (_) => const RoleHomePage(
                      role: AnatomyRole.professor,
                    ),
                  ),
                ),
              ),
              const SizedBox(height: 12),
              _RoleCard(
                icon: Icons.person,
                title: 'Étudiant',
                subtitle: 'Consulter les examens et les passer',
                onTap: () => Navigator.push(
                  context,
                  MaterialPageRoute(
                    builder: (_) => const RoleHomePage(
                      role: AnatomyRole.student,
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
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
        contentPadding: const EdgeInsets.all(18),
        leading: Icon(icon, size: 38),
        title: Text(title),
        subtitle: Text(subtitle),
        trailing: const Icon(Icons.arrow_forward_ios),
        onTap: onTap,
      ),
    );
  }
}
