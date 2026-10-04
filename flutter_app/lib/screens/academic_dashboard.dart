import 'package:flutter/material.dart';

import '../data/academic_repository.dart';
import '../data/exam_repository.dart';
import '../models/anatomy_exam_result.dart';
import '../models/anatomy_history_entry.dart';
import '../models/anatomy_role.dart';
import '../services/firebase_auth_service.dart';
import 'anatomy_home.dart';
import 'professor_exam_editor.dart';
import 'student_exam.dart';

class AcademicDashboardPage extends StatefulWidget {
  const AcademicDashboardPage({super.key, required this.role});
  final AnatomyRole role;

  @override
  State<AcademicDashboardPage> createState() => _AcademicDashboardPageState();
}

class _AcademicDashboardPageState extends State<AcademicDashboardPage> {
  final FirebaseAuthService _authService = FirebaseAuthService.instance;

  @override
  Widget build(BuildContext context) {
    final isProf = widget.role == AnatomyRole.professor;
    return ValueListenableBuilder<AnatomyUser?>(
      valueListenable: _authService.currentUserNotifier,
      builder: (context, user, _) {
        final isApprovedProf = _authService.isCurrentProfessorApproved;
        return Scaffold(
          appBar: AppBar(
            title: Text(isProf ? 'Espace Professeur' : 'Espace Étudiant'),
            actions: [
              // Only approved professors (or Admin) can create exams
              if (isProf && isApprovedProf)
                IconButton(
                  tooltip: 'Créer un examen',
                  icon: const Icon(Icons.add_task),
                  onPressed: () async {
                    await Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (_) => const ProfessorExamEditor(),
                      ),
                    );
                    if (mounted) setState(() {});
                  },
                ),
              IconButton(
                tooltip: 'Atlas 3D',
                icon: const Icon(Icons.view_in_ar),
                onPressed: () => Navigator.push(
                  context,
                  MaterialPageRoute(builder: (_) => const AnatomyHomePage()),
                ),
              ),
            ],
          ),
          body: isProf
              ? _ProfessorDashboard(
                  isApproved: isApprovedProf,
                  onRefresh: () => setState(() {}),
                )
              : _StudentDashboard(onRefresh: () => setState(() {})),
        );
      },
    );
  }
}

class _ProfessorDashboard extends StatelessWidget {
  const _ProfessorDashboard({
    required this.isApproved,
    required this.onRefresh,
  });
  final bool isApproved;
  final VoidCallback onRefresh;

  static const List<Map<String, String>> _demos = [
    {
      'title': 'Base du crâne & Paires crâniennes',
      'system': 'Système Nerveux',
      'desc': 'Foramens ovale, rond, jugulaire et trajets des nerfs crâniens.',
    },
    {
      'title': 'Anatomie Cardiaque & Artères Coronaires',
      'system': 'Cardiovasculaire',
      'desc': 'Vascularisation du myocarde et drainage par le sinus coronaire.',
    },
    {
      'title': 'Biomécanique Rachidienne & Vertèbre C2',
      'system': 'Squelettique',
      'desc': 'Morphologie de l’Atlas et de l’Axis en 3D.',
    },
    {
      'title': 'Tronc Cœliaque & Organogénèse Abdominale',
      'system': 'Digestif & Viscères',
      'desc': 'Branches trifurquées du tronc cœliaque et rapports péritonéaux.',
    },
  ];

  @override
  Widget build(BuildContext context) {
    final authService = FirebaseAuthService.instance;
    final repository = AcademicRepository.instance;
    final classes = repository.classesForProfessor('prof-demo');
    final exams = AnatomyExamRepository.instance.exams;

    // RESTRICTED DEMO-ONLY VIEW WHEN PROFESSOR IS NOT YET VALIDATED BY ADMIN
    if (!isApproved) {
      return ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: const Color(0xFF1E242C),
              borderRadius: BorderRadius.circular(18),
              border: Border.all(color: Colors.amberAccent, width: 1.5),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Row(
                  children: [
                    Icon(Icons.lock_clock, color: Colors.amberAccent),
                    SizedBox(width: 10),
                    Expanded(
                      child: Text(
                        'Compte Professeur en attente de validation Admin',
                        style: TextStyle(
                          fontWeight: FontWeight.bold,
                          fontSize: 16,
                          color: Color(0xFFFAF6F0),
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 8),
                const Text(
                  'Le compte du professeur est validé uniquement par l’administrateur. En attendant son acceptation, vous avez uniquement accès aux démonstrations 3D et ne pouvez ni interagir avec vos étudiants (CRUD verrouillé) ni accéder aux fonctionnalités d’examen.',
                  style: TextStyle(fontSize: 13, color: Color(0xFFBAC3CE)),
                ),
                const SizedBox(height: 12),
                FilledButton.icon(
                  icon: const Icon(Icons.badge_outlined, size: 18),
                  label: const Text('Entrer mon détail profil pour l’Admin'),
                  onPressed: () =>
                      _showProfessorRequestProfileDialog(context, authService),
                ),
              ],
            ),
          ),
          const SizedBox(height: 20),
          _SectionCard(
            title: 'Démonstrations 3D d’Amphithéâtre (Mode restreint)',
            icon: Icons.view_in_ar,
            child: Column(
              children: _demos
                  .map(
                    (d) => ListTile(
                      contentPadding: EdgeInsets.zero,
                      leading: const Icon(Icons.biotech,
                          color: Color(0xFFDACBA9)),
                      title: Text(d['title']!),
                      subtitle: Text('${d['system']} — ${d['desc']}'),
                      trailing: OutlinedButton(
                        onPressed: () => Navigator.push(
                          context,
                          MaterialPageRoute(
                            builder: (_) => const AnatomyHomePage(),
                          ),
                        ),
                        child: const Text('Démo 3D'),
                      ),
                    ),
                  )
                  .toList(growable: false),
            ),
          ),
        ],
      );
    }

    return ValueListenableBuilder<List<AnatomyUser>>(
      valueListenable: authService.studentsNotifier,
      builder: (context, studentsList, _) {
        return ListView(
          padding: const EdgeInsets.all(16),
          children: [
            const Text(
              'Pilotage pédagogique (Professeur Validé)',
              style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 6),
            const Text(
              'Liste des étudiants (CRUD), classes, création d’examens et démonstrations 3D.',
            ),
            const SizedBox(height: 20),
            Row(
              children: [
                Expanded(
                  child: _StatCard(
                      label: 'Étudiants', value: '${studentsList.length}'),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child:
                      _StatCard(label: 'Classes', value: '${classes.length}'),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: _StatCard(label: 'Examens', value: '${exams.length}'),
                ),
              ],
            ),
            const SizedBox(height: 20),
            // STUDENT CRUD SECTION FOR VALIDATED PROFESSOR
            _SectionCard(
              title: 'Liste des Étudiants (CRUD)',
              icon: Icons.people_alt,
              trailing: FilledButton.icon(
                icon: const Icon(Icons.person_add, size: 18),
                label: const Text('Ajouter'),
                onPressed: () =>
                    _showStudentCrudDialog(context, authService, null),
              ),
              child: Column(
                children: studentsList
                    .map(
                      (stu) => ListTile(
                        contentPadding: EdgeInsets.zero,
                        leading: CircleAvatar(
                          backgroundColor: const Color(0xFFDACBA9),
                          child: Text(
                            (stu.displayName.isNotEmpty
                                    ? stu.displayName[0]
                                    : 'E')
                                .toUpperCase(),
                            style: const TextStyle(
                              color: Color(0xFF1E242C),
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ),
                        title: Text(
                          stu.displayName,
                          style: const TextStyle(fontWeight: FontWeight.bold),
                        ),
                        subtitle: Text(
                          '${stu.email} · ${stu.matricule.isNotEmpty ? stu.matricule : stu.academicYear}',
                        ),
                        trailing: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            IconButton(
                              tooltip: 'Modifier étudiant',
                              icon: const Icon(Icons.edit_outlined, size: 20),
                              onPressed: () => _showStudentCrudDialog(
                                  context, authService, stu),
                            ),
                            IconButton(
                              tooltip: 'Supprimer étudiant',
                              icon: const Icon(Icons.delete_outline,
                                  size: 20, color: Colors.redAccent),
                              onPressed: () =>
                                  authService.deleteStudent(stu.uid),
                            ),
                          ],
                        ),
                      ),
                    )
                    .toList(growable: false),
              ),
            ),
            _SectionCard(
              title: 'Mes classes',
              icon: Icons.groups,
              child: Column(
                children: classes
                    .map(
                      (item) => ListTile(
                        contentPadding: EdgeInsets.zero,
                        leading: const CircleAvatar(child: Icon(Icons.school)),
                        title: Text(item.name),
                        subtitle: Text('${item.studentIds.length} étudiant(s)'),
                      ),
                    )
                    .toList(growable: false),
              ),
            ),
            _SectionCard(
              title: 'Examens publiés',
              icon: Icons.assignment,
              trailing: FilledButton.tonalIcon(
                icon: const Icon(Icons.add, size: 18),
                label: const Text('Nouvel examen'),
                onPressed: () async {
                  await Navigator.push(
                    context,
                    MaterialPageRoute(
                        builder: (_) => const ProfessorExamEditor()),
                  );
                  onRefresh();
                },
              ),
              child: Column(
                children: exams
                    .map(
                      (exam) => ListTile(
                        contentPadding: EdgeInsets.zero,
                        leading: const Icon(Icons.quiz),
                        title: Text(exam.title),
                        subtitle: Text(
                          '${exam.questions.length} question(s) · ${exam.durationMinutes} min',
                        ),
                      ),
                    )
                    .toList(growable: false),
              ),
            ),
          ],
        );
      },
    );
  }

  static void _showStudentCrudDialog(
    BuildContext context,
    FirebaseAuthService authService,
    AnatomyUser? existing,
  ) {
    final nameCtrl = TextEditingController(text: existing?.displayName ?? '');
    final emailCtrl = TextEditingController(text: existing?.email ?? '');
    final matCtrl =
        TextEditingController(text: existing?.matricule ?? 'MED-2026-0301');
    final univCtrl = TextEditingController(
        text: existing?.university ?? 'Faculté de Médecine');
    final yearCtrl = TextEditingController(
        text: existing?.academicYear ?? 'DFGSM 2 (2ème année)');
    final specCtrl = TextEditingController(
        text: existing?.specialty ?? 'Anatomie Générale');

    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text(
            existing == null ? 'Ajouter un étudiant' : 'Modifier l’étudiant'),
        content: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              TextField(
                controller: nameCtrl,
                decoration: const InputDecoration(labelText: 'Nom complet'),
              ),
              const SizedBox(height: 8),
              TextField(
                controller: emailCtrl,
                decoration:
                    const InputDecoration(labelText: 'Email universitaire'),
              ),
              const SizedBox(height: 8),
              TextField(
                controller: matCtrl,
                decoration: const InputDecoration(labelText: 'Matricule'),
              ),
              const SizedBox(height: 8),
              TextField(
                controller: univCtrl,
                decoration: const InputDecoration(labelText: 'Université'),
              ),
              const SizedBox(height: 8),
              TextField(
                controller: yearCtrl,
                decoration:
                    const InputDecoration(labelText: 'Année / Promotion'),
              ),
              const SizedBox(height: 8),
              TextField(
                controller: specCtrl,
                decoration: const InputDecoration(labelText: 'Spécialité'),
              ),
            ],
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Annuler'),
          ),
          FilledButton(
            onPressed: () {
              if (nameCtrl.text.trim().isEmpty ||
                  emailCtrl.text.trim().isEmpty) {
                return;
              }
              if (existing == null) {
                authService.addStudent(
                  displayName: nameCtrl.text.trim(),
                  email: emailCtrl.text.trim(),
                  matricule: matCtrl.text.trim(),
                  university: univCtrl.text.trim(),
                  academicYear: yearCtrl.text.trim(),
                  specialty: specCtrl.text.trim(),
                );
              } else {
                authService.updateStudent(
                  uid: existing.uid,
                  displayName: nameCtrl.text.trim(),
                  email: emailCtrl.text.trim(),
                  matricule: matCtrl.text.trim(),
                  university: univCtrl.text.trim(),
                  academicYear: yearCtrl.text.trim(),
                  specialty: specCtrl.text.trim(),
                );
              }
              Navigator.pop(context);
            },
            child: const Text('Enregistrer'),
          ),
        ],
      ),
    );
  }

  static void _showProfessorRequestProfileDialog(
    BuildContext context,
    FirebaseAuthService authService,
  ) {
    final user = authService.currentUser;
    final nameCtrl =
        TextEditingController(text: user?.displayName ?? 'Candidat Professeur');
    final matCtrl =
        TextEditingController(text: user?.matricule ?? 'PROF-ANAT-2026');
    final univCtrl =
        TextEditingController(text: user?.university ?? 'Faculté de Médecine');
    final yearCtrl = TextEditingController(
        text: user?.academicYear ?? 'Praticien Hospitalier / Enseignant');
    final specCtrl = TextEditingController(
        text: user?.specialty ?? 'Anatomie Générale & Morphologie');
    final phoneCtrl = TextEditingController(text: user?.phone ?? '');
    final bioCtrl = TextEditingController(text: user?.bio ?? '');

    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Détail profil Professeur (Pour validation Admin)'),
        content: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              TextField(
                controller: nameCtrl,
                decoration:
                    const InputDecoration(labelText: 'Nom & Titre académique'),
              ),
              const SizedBox(height: 8),
              TextField(
                controller: matCtrl,
                decoration:
                    const InputDecoration(labelText: 'Matricule Enseignant'),
              ),
              const SizedBox(height: 8),
              TextField(
                controller: univCtrl,
                decoration:
                    const InputDecoration(labelText: 'Université / CHU'),
              ),
              const SizedBox(height: 8),
              TextField(
                controller: yearCtrl,
                decoration:
                    const InputDecoration(labelText: 'Grade académique'),
              ),
              const SizedBox(height: 8),
              TextField(
                controller: specCtrl,
                decoration: const InputDecoration(
                    labelText: 'Chaire / Spécialité anatomique'),
              ),
              const SizedBox(height: 8),
              TextField(
                controller: phoneCtrl,
                decoration: const InputDecoration(labelText: 'Téléphone'),
              ),
              const SizedBox(height: 8),
              TextField(
                controller: bioCtrl,
                decoration:
                    const InputDecoration(labelText: 'Biographie / Notes'),
              ),
            ],
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Annuler'),
          ),
          FilledButton(
            onPressed: () {
              authService.updateCurrentProfessorRequestDetails(
                displayName: nameCtrl.text.trim(),
                matricule: matCtrl.text.trim(),
                university: univCtrl.text.trim(),
                academicYear: yearCtrl.text.trim(),
                specialty: specCtrl.text.trim(),
                phone: phoneCtrl.text.trim(),
                bio: bioCtrl.text.trim(),
              );
              Navigator.pop(context);
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(
                  content: Text(
                      'Détail profil transmis à l’Administrateur pour validation.'),
                ),
              );
            },
            child: const Text('Transmettre à l’Admin'),
          ),
        ],
      ),
    );
  }
}

/// Institutional Admin Dashboard in Flutter:
/// List of pending Professor users to accept with full profile detail entry
class AdminDashboardPage extends StatelessWidget {
  const AdminDashboardPage({super.key});

  @override
  Widget build(BuildContext context) {
    final authService = FirebaseAuthService.instance;
    return Scaffold(
      appBar: AppBar(
        title: const Text('Dashboard Admin — Validation Professeurs'),
      ),
      body: ValueListenableBuilder<List<AnatomyUser>>(
        valueListenable: authService.pendingProfessorsNotifier,
        builder: (context, pendingList, _) {
          return ListView(
            padding: const EdgeInsets.all(16),
            children: [
              _SectionCard(
                title:
                    'Professeurs à accepter (${pendingList.length}) — Entrer détail profil',
                icon: Icons.verified_user,
                child: pendingList.isEmpty
                    ? const Text(
                        'Aucune demande de professeur en attente de validation.')
                    : Column(
                        children: pendingList
                            .map(
                              (prof) => Card(
                                margin: const EdgeInsets.only(bottom: 10),
                                child: ListTile(
                                  leading: const CircleAvatar(
                                    backgroundColor: Color(0xFFDACBA9),
                                    child: Icon(Icons.school,
                                        color: Color(0xFF1E242C)),
                                  ),
                                  title: Text(
                                    prof.displayName,
                                    style: const TextStyle(
                                        fontWeight: FontWeight.bold),
                                  ),
                                  subtitle: Text(
                                    '${prof.email}\n${prof.university} · ${prof.specialty}',
                                  ),
                                  isThreeLine: true,
                                  trailing: FilledButton.icon(
                                    icon: const Icon(Icons.edit_note, size: 18),
                                    label: const Text('Détail & Accepter'),
                                    onPressed: () =>
                                        _showAdminAcceptProfessorDialog(
                                            context, authService, prof),
                                  ),
                                ),
                              ),
                            )
                            .toList(growable: false),
                      ),
              ),
            ],
          );
        },
      ),
    );
  }

  static void _showAdminAcceptProfessorDialog(
    BuildContext context,
    FirebaseAuthService authService,
    AnatomyUser prof,
  ) {
    final nameCtrl = TextEditingController(text: prof.displayName);
    final emailCtrl = TextEditingController(text: prof.email);
    final matCtrl = TextEditingController(
        text: prof.matricule.isNotEmpty ? prof.matricule : 'PROF-ANAT-2026');
    final univCtrl = TextEditingController(text: prof.university);
    final yearCtrl = TextEditingController(text: prof.academicYear);
    final specCtrl = TextEditingController(text: prof.specialty);
    final phoneCtrl = TextEditingController(text: prof.phone);
    final bioCtrl = TextEditingController(text: prof.bio);

    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Entrer détail profil & Accepter le Professeur'),
        content: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              TextField(
                controller: nameCtrl,
                decoration:
                    const InputDecoration(labelText: 'Nom & Titre académique'),
              ),
              const SizedBox(height: 8),
              TextField(
                controller: emailCtrl,
                decoration:
                    const InputDecoration(labelText: 'Email institutionnel'),
              ),
              const SizedBox(height: 8),
              TextField(
                controller: matCtrl,
                decoration:
                    const InputDecoration(labelText: 'Matricule Enseignant'),
              ),
              const SizedBox(height: 8),
              TextField(
                controller: univCtrl,
                decoration:
                    const InputDecoration(labelText: 'Université / CHU'),
              ),
              const SizedBox(height: 8),
              TextField(
                controller: yearCtrl,
                decoration:
                    const InputDecoration(labelText: 'Statut / Grade'),
              ),
              const SizedBox(height: 8),
              TextField(
                controller: specCtrl,
                decoration: const InputDecoration(
                    labelText: 'Spécialité / Chaire d’anatomie'),
              ),
              const SizedBox(height: 8),
              TextField(
                controller: phoneCtrl,
                decoration: const InputDecoration(labelText: 'Téléphone'),
              ),
              const SizedBox(height: 8),
              TextField(
                controller: bioCtrl,
                decoration:
                    const InputDecoration(labelText: 'Biographie & Parcours'),
              ),
            ],
          ),
        ),
        actions: [
          TextButton(
            onPressed: () {
              authService.rejectProfessor(prof.uid);
              Navigator.pop(context);
            },
            child: const Text('Refuser',
                style: TextStyle(color: Colors.redAccent)),
          ),
          FilledButton.icon(
            icon: const Icon(Icons.check_circle_outline, size: 18),
            label: const Text('Valider et Accepter Professeur'),
            onPressed: () {
              authService.approveProfessorWithDetails(
                uid: prof.uid,
                displayName: nameCtrl.text.trim(),
                email: emailCtrl.text.trim(),
                matricule: matCtrl.text.trim(),
                university: univCtrl.text.trim(),
                academicYear: yearCtrl.text.trim(),
                specialty: specCtrl.text.trim(),
                phone: phoneCtrl.text.trim(),
                bio: bioCtrl.text.trim(),
              );
              Navigator.pop(context);
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(
                  content: Text(
                      'Compte Professeur de ${nameCtrl.text.trim()} validé par l’Admin !'),
                ),
              );
            },
          ),
        ],
      ),
    );
  }
}

class _StudentDashboard extends StatelessWidget {
  const _StudentDashboard({required this.onRefresh});
  final VoidCallback onRefresh;

  @override
  Widget build(BuildContext context) {
    final repository = AcademicRepository.instance;
    final exams = AnatomyExamRepository.instance.exams;
    final results = repository.resultsForStudent('student-demo');
    final history = repository.historyForStudent('student-demo');

    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        const Text(
          'Mon espace',
          style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
        ),
        const SizedBox(height: 6),
        const Text(
          'Examens disponibles, résultats, notes et historique d’apprentissage.',
        ),
        const SizedBox(height: 20),
        Row(
          children: [
            Expanded(
              child: _StatCard(label: 'Examens', value: '${exams.length}'),
            ),
            const SizedBox(width: 10),
            Expanded(
              child: _StatCard(label: 'Résultats', value: '${results.length}'),
            ),
            const SizedBox(width: 10),
            Expanded(
              child: _StatCard(label: 'Activités', value: '${history.length}'),
            ),
          ],
        ),
        const SizedBox(height: 20),
        _SectionCard(
          title: 'Examens disponibles',
          icon: Icons.assignment_turned_in,
          child: exams.isEmpty
              ? const Text('Aucun examen disponible pour le moment.')
              : Column(
                  children: exams
                      .map(
                        (exam) => ListTile(
                          contentPadding: EdgeInsets.zero,
                          title: Text(exam.title),
                          subtitle: Text(
                            '${exam.questions.length} question(s) · ${exam.durationMinutes} min',
                          ),
                          trailing: FilledButton(
                            onPressed: () async {
                              await Navigator.push(
                                context,
                                MaterialPageRoute(
                                  builder: (_) => StudentExamPage(exam: exam),
                                ),
                              );
                              onRefresh();
                            },
                            child: const Text('Passer'),
                          ),
                        ),
                      )
                      .toList(growable: false),
                ),
        ),
        _SectionCard(
          title: 'Résultats et notes',
          icon: Icons.grade,
          child: results.isEmpty
              ? const Text('Aucun résultat disponible.')
              : Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    _StudentScoreBarChart(results: results),
                    const SizedBox(height: 12),
                    const Divider(),
                    ...results.map(
                      (result) => ListTile(
                        contentPadding: EdgeInsets.zero,
                        title: Text('Examen ${result.examId}'),
                        subtitle: Text(
                          '${result.score}/${result.maxScore} · ${result.percentage.toStringAsFixed(1)} % · ${result.grade}',
                        ),
                      ),
                    ),
                  ],
                ),
        ),
        _SectionCard(
          title: 'Historique',
          icon: Icons.history,
          child: history.isEmpty
              ? const Text('Votre historique apparaîtra ici.')
              : Column(
                  children: history
                      .map(
                        (entry) => ListTile(
                          contentPadding: EdgeInsets.zero,
                          leading: Icon(_historyIcon(entry.type)),
                          title: Text(entry.title),
                          subtitle: Text(entry.occurredAt.toLocal().toString()),
                        ),
                      )
                      .toList(growable: false),
                ),
        ),
      ],
    );
  }

  static IconData _historyIcon(AnatomyHistoryType type) {
    switch (type) {
      case AnatomyHistoryType.exam:
        return Icons.assignment;
      case AnatomyHistoryType.lesson:
        return Icons.menu_book;
      case AnatomyHistoryType.dissection:
        return Icons.content_cut;
      case AnatomyHistoryType.quiz:
        return Icons.quiz;
      case AnatomyHistoryType.atlas:
        return Icons.view_in_ar;
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
          child: Column(
            children: [
              Text(
                value,
                style: const TextStyle(
                  fontSize: 22,
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 4),
              Text(label, textAlign: TextAlign.center),
            ],
          ),
        ),
      );
}

class _SectionCard extends StatelessWidget {
  const _SectionCard({
    required this.title,
    required this.icon,
    required this.child,
    this.trailing,
  });
  final String title;
  final IconData icon;
  final Widget child;
  final Widget? trailing;

  @override
  Widget build(BuildContext context) => Card(
        margin: const EdgeInsets.only(bottom: 12),
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Expanded(
                    child: Row(
                      children: [
                        Icon(icon),
                        const SizedBox(width: 8),
                        Expanded(
                          child: Text(
                            title,
                            style: const TextStyle(
                              fontSize: 18,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                  if (trailing != null) trailing!,
                ],
              ),
              const SizedBox(height: 10),
              child,
            ],
          ),
        ),
      );
}

class _StudentScoreBarChart extends StatelessWidget {
  const _StudentScoreBarChart({required this.results});
  final List<AnatomyExamResult> results;

  @override
  Widget build(BuildContext context) {
    final sorted = List<AnatomyExamResult>.from(results)
      ..sort((a, b) => a.submittedAt.compareTo(b.submittedAt));

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Progression des scores dans le temps (%)',
          style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600),
        ),
        const SizedBox(height: 12),
        SizedBox(
          height: 150,
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.end,
            mainAxisAlignment: MainAxisAlignment.spaceEvenly,
            children: sorted.map((result) {
              final ratio = (result.percentage / 100.0).clamp(0.05, 1.0);
              final day = result.submittedAt.day.toString().padLeft(2, '0');
              final month = result.submittedAt.month.toString().padLeft(2, '0');
              return Expanded(
                child: Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 6),
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.end,
                    children: [
                      Text(
                        '${result.percentage.round()}%',
                        style: const TextStyle(
                          fontSize: 11,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Expanded(
                        child: Align(
                          alignment: Alignment.bottomCenter,
                          child: FractionallySizedBox(
                            heightFactor: ratio,
                            widthFactor: 0.65,
                            child: DecoratedBox(
                              decoration: BoxDecoration(
                                color: Theme.of(context).colorScheme.primary,
                                borderRadius: const BorderRadius.vertical(
                                  top: Radius.circular(6),
                                ),
                              ),
                            ),
                          ),
                        ),
                      ),
                      const SizedBox(height: 6),
                      Text(
                        '$day/$month',
                        style: const TextStyle(fontSize: 11),
                      ),
                    ],
                  ),
                ),
              );
            }).toList(growable: false),
          ),
        ),
      ],
    );
  }
}
