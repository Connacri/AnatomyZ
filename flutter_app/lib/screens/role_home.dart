import 'package:flutter/material.dart';

import '../models/anatomy_role.dart';
import 'academic_dashboard.dart';
import 'anatomy_home.dart';
import 'professor_exam_editor.dart';
import 'student_exam_list.dart';

class RoleHomePage extends StatelessWidget {
  const RoleHomePage({super.key, required this.role});

  final AnatomyRole role;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('AnatomyZ — ${role.labelFr}')),
      body: ListView(
        padding: const EdgeInsets.all(20),
        children: [
          Card(
            child: ListTile(
              leading: Icon(role == AnatomyRole.professor ? Icons.school : Icons.person, size: 34),
              title: Text(role.labelFr),
              subtitle: Text(role == AnatomyRole.professor
                  ? 'Créer et gérer des examens'
                  : 'Passer les examens assignés'),
            ),
          ),
          const SizedBox(height: 16),
          FilledButton.icon(
            icon: Icon(role == AnatomyRole.professor ? Icons.dashboard : Icons.school),
            label: Text(role == AnatomyRole.professor ? 'Espace professeur' : 'Mon espace étudiant'),
            onPressed: () => Navigator.push(
              context,
              MaterialPageRoute(builder: (_) => AcademicDashboardPage(role: role)),
            ),
          ),
          const SizedBox(height: 8),
          if (role == AnatomyRole.professor) ...[
            FilledButton.icon(
              icon: const Icon(Icons.add_task),
              label: const Text('Créer un examen'),
              onPressed: () => Navigator.push(
                context,
                MaterialPageRoute(builder: (_) => const ProfessorExamEditor()),
              ),
            ),
            OutlinedButton.icon(
              icon: const Icon(Icons.assignment),
              label: const Text('Mes examens'),
              onPressed: () => Navigator.push(
                context,
                MaterialPageRoute(builder: (_) => const ProfessorExamEditor(showExisting: true)),
              ),
            ),
          ] else
            FilledButton.icon(
              icon: const Icon(Icons.assignment_turned_in),
              label: const Text('Examens disponibles'),
              onPressed: () => Navigator.push(
                context,
                MaterialPageRoute(builder: (_) => const StudentExamList()),
              ),
            ),
          const SizedBox(height: 12),
          OutlinedButton.icon(
            icon: const Icon(Icons.view_in_ar),
            label: const Text('Explorer l’atlas anatomique'),
            onPressed: () => Navigator.push(
              context,
              MaterialPageRoute(builder: (_) => const AnatomyHomePage()),
            ),
          ),
        ],
      ),
    );
  }
}
