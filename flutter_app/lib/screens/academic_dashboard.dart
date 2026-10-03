import 'package:flutter/material.dart';

import '../data/academic_repository.dart';
import '../data/exam_repository.dart';
import '../models/anatomy_exam_assignment.dart';
import '../models/anatomy_role.dart';
import '../models/anatomy_history_entry.dart';

class AcademicDashboardPage extends StatelessWidget {
  const AcademicDashboardPage({super.key, required this.role});
  final AnatomyRole role;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text(role == AnatomyRole.professor ? 'Espace professeur' : 'Espace étudiant')),
      body: role == AnatomyRole.professor ? const _ProfessorDashboard() : const _StudentDashboard(),
    );
  }
}

class _ProfessorDashboard extends StatelessWidget {
  const _ProfessorDashboard();

  @override
  Widget build(BuildContext context) {
    final repository = AcademicRepository.instance;
    final classes = repository.classesForProfessor('prof-demo');
    final students = classes.expand(repository.studentsForClass).toSet().length;
    final exams = AnatomyExamRepository.instance.exams;

    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        const Text('Pilotage pédagogique', style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold)),
        const SizedBox(height: 6),
        const Text('Classes, étudiants, examens assignés et résultats réunis au même endroit.'),
        const SizedBox(height: 20),
        Row(children: [
          Expanded(child: _StatCard(label: 'Classes', value: '${classes.length}')),
          const SizedBox(width: 10),
          Expanded(child: _StatCard(label: 'Étudiants', value: '${students}')),
          const SizedBox(width: 10),
          Expanded(child: _StatCard(label: 'Examens', value: '${exams.length}')),
        ]),
        const SizedBox(height: 20),
        _SectionCard(
          title: 'Mes classes',
          icon: Icons.groups,
          child: Column(children: classes.map((item) => ListTile(
            contentPadding: EdgeInsets.zero,
            leading: const CircleAvatar(child: Icon(Icons.school)),
            title: Text(item.name),
            subtitle: Text('${item.studentIds.length} étudiant(s)'),
            trailing: const Icon(Icons.chevron_right),
          )).toList()),
        ),
        _SectionCard(
          title: 'Examens',
          icon: Icons.assignment,
          child: Column(children: exams.map((exam) => ListTile(
            contentPadding: EdgeInsets.zero,
            leading: const Icon(Icons.quiz),
            title: Text(exam.title),
            subtitle: Text('${exam.questions.length} question(s) · ${exam.durationMinutes} min'),
          )).toList()),
        ),
        const _SectionCard(
          title: 'Fonctions pédagogiques prévues',
          icon: Icons.auto_graph,
          child: Text('Banque de questions · assignation par classe · calendrier · notes · statistiques · correction · export · parcours pédagogiques.'),
        ),
      ],
    );
  }
}

class _StudentDashboard extends StatelessWidget {
  const _StudentDashboard();

  @override
  Widget build(BuildContext context) {
    final repository = AcademicRepository.instance;
    final assignments = repository.assignmentsForStudent('student-demo');
    final results = repository.resultsForStudent('student-demo');
    final history = repository.historyForStudent('student-demo');

    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        const Text('Mon espace', style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold)),
        const SizedBox(height: 6),
        const Text('Examens assignés, résultats, notes et historique d’apprentissage.'),
        const SizedBox(height: 20),
        Row(children: [
          Expanded(child: _StatCard(label: 'Assignés', value: '${assignments.length}')),
          const SizedBox(width: 10),
          Expanded(child: _StatCard(label: 'Résultats', value: '${results.length}')),
          const SizedBox(width: 10),
          Expanded(child: _StatCard(label: 'Activités', value: '${history.length}')),
        ]),
        const SizedBox(height: 20),
        _SectionCard(
          title: 'Examens assignés',
          icon: Icons.assignment_turned_in,
          child: assignments.isEmpty
              ? const Text('Aucun examen assigné pour le moment.')
              : Column(children: assignments.map((assignment) => ListTile(
                  contentPadding: EdgeInsets.zero,
                  leading: const Icon(Icons.pending_actions),
                  title: Text('Examen ${assignment.examId}'),
                  subtitle: Text(_statusLabel(assignment.status)),
                )).toList()),
        ),
        _SectionCard(
          title: 'Résultats et notes',
          icon: Icons.grade,
          child: results.isEmpty
              ? const Text('Aucun résultat disponible.')
              : Column(children: results.map((result) => ListTile(
                  contentPadding: EdgeInsets.zero,
                  title: Text('Examen ${result.examId}'),
                  subtitle: Text('${result.score}/${result.maxScore} · ${result.percentage.toStringAsFixed(1)} % · ${result.grade}'),
                )).toList()),
        ),
        _SectionCard(
          title: 'Historique',
          icon: Icons.history,
          child: history.isEmpty
              ? const Text('Votre historique apparaîtra ici.')
              : Column(children: history.map((entry) => ListTile(
                  contentPadding: EdgeInsets.zero,
                  leading: Icon(_historyIcon(entry.type)),
                  title: Text(entry.title),
                  subtitle: Text(entry.occurredAt.toLocal().toString()),
                )).toList()),
        ),
      ],
    );
  }

  static String _statusLabel(ExamAssignmentStatus status) {
    switch (status) {
      case ExamAssignmentStatus.assigned: return 'À faire';
      case ExamAssignmentStatus.started: return 'En cours';
      case ExamAssignmentStatus.submitted: return 'Soumis';
      case ExamAssignmentStatus.expired: return 'Expiré';
    }
  }

  static IconData _historyIcon(AnatomyHistoryType type) {
    switch (type) {
      case AnatomyHistoryType.exam: return Icons.assignment;
      case AnatomyHistoryType.lesson: return Icons.menu_book;
      case AnatomyHistoryType.dissection: return Icons.content_cut;
      case AnatomyHistoryType.quiz: return Icons.quiz;
      case AnatomyHistoryType.atlas: return Icons.view_in_ar;
    }
  }
}

class _StatCard extends StatelessWidget {
  const _StatCard({required this.label, required this.value});
  final String label;
  final String value;

  @override
  Widget build(BuildContext context) => Card(
    child: Padding(
      padding: const EdgeInsets.all(12),
      child: Column(children: [
        Text(value, style: const TextStyle(fontSize: 22, fontWeight: FontWeight.bold)),
        const SizedBox(height: 4),
        Text(label, textAlign: TextAlign.center),
      ]),
    ),
  );
}

class _SectionCard extends StatelessWidget {
  const _SectionCard({required this.title, required this.icon, required this.child});
  final String title;
  final IconData icon;
  final Widget child;

  @override
  Widget build(BuildContext context) => Card(
    margin: const EdgeInsets.only(bottom: 12),
    child: Padding(
      padding: const EdgeInsets.all(16),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Row(children: [
          Icon(icon),
          const SizedBox(width: 8),
          Text(title, style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w600)),
        ]),
        const SizedBox(height: 10),
        child,
      ]),
    ),
  );
}
