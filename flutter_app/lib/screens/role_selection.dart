import 'package:flutter/material.dart';

import '../models/anatomy_role.dart';
import 'academic_dashboard.dart';
import 'anatomy_home.dart';

class RoleSelectionPage extends StatelessWidget {
  const RoleSelectionPage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('AnatomyZ'),
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
                const SizedBox(height: 24),
                _RoleCard(
                  icon: Icons.school,
                  title: 'Professeur',
                  subtitle: 'Créer des quiz, gérer les classes et publier des examens',
                  onTap: () => Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (_) => const AcademicDashboardPage(
                        role: AnatomyRole.professor,
                      ),
                    ),
                  ),
                ),
                const SizedBox(height: 12),
                _RoleCard(
                  icon: Icons.person,
                  title: 'Étudiant',
                  subtitle: 'Consulter les examens assignés, les passer et suivre ses notes',
                  onTap: () => Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (_) => const AcademicDashboardPage(
                        role: AnatomyRole.student,
                      ),
                    ),
                  ),
                ),
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
