import '../models/anatomy_class.dart';
import '../models/anatomy_exam_assignment.dart';
import '../models/anatomy_exam_result.dart';
import '../models/anatomy_history_entry.dart';
import '../models/anatomy_student.dart';

class AcademicRepository {
  AcademicRepository._();

  static final AcademicRepository instance = AcademicRepository._();

  final List<AnatomyClass> _classes = [
    const AnatomyClass(
      id: 'class-demo',
      name: 'Anatomie humaine — L1',
      professorId: 'prof-demo',
      description: 'Classe de démonstration AnatomyZ.',
      studentIds: ['student-demo'],
    ),
  ];

  final List<AnatomyStudent> _students = [
    const AnatomyStudent(
      id: 'student-demo',
      name: 'Étudiant démonstration',
      email: 'student@anatomyz.local',
      classIds: ['class-demo'],
    ),
  ];

  final List<AnatomyExamAssignment> _assignments = [];
  final List<AnatomyExamResult> _results = [
    AnatomyExamResult(
      id: 'res-demo-1',
      examId: 'osteo-l1',
      assignmentId: 'assign-osteo-1',
      studentId: 'student-demo',
      submittedAt: DateTime.utc(2026, 9, 19),
      score: 14,
      maxScore: 20,
      percentage: 70.0,
      questionScores: const {'q1': 14},
    ),
    AnatomyExamResult(
      id: 'res-demo-2',
      examId: 'respiratory-l1',
      assignmentId: 'assign-resp-1',
      studentId: 'student-demo',
      submittedAt: DateTime.utc(2026, 9, 26),
      score: 16,
      maxScore: 20,
      percentage: 80.0,
      questionScores: const {'q1': 16},
    ),
    AnatomyExamResult(
      id: 'res-demo-3',
      examId: 'digestive-l1',
      assignmentId: 'assign-dig-1',
      studentId: 'student-demo',
      submittedAt: DateTime.utc(2026, 10, 1),
      score: 18,
      maxScore: 20,
      percentage: 90.0,
      questionScores: const {'q1': 18},
    ),
  ];
  final List<AnatomyHistoryEntry> _history = [];

  List<AnatomyClass> classesForProfessor(String professorId) =>
      List.unmodifiable(_classes.where((item) => item.professorId == professorId));

  List<AnatomyStudent> studentsForClass(String classId) {
    final classItem = _classes.where((item) => item.id == classId).firstOrNull;
    if (classItem == null) return const [];
    return List.unmodifiable(
      _students.where((student) => classItem.studentIds.contains(student.id)),
    );
  }

  List<AnatomyExamAssignment> assignmentsForStudent(String studentId) =>
      List.unmodifiable(_assignments.where((item) => item.studentId == studentId));

  List<AnatomyExamResult> resultsForStudent(String studentId) =>
      List.unmodifiable(_results.where((item) => item.studentId == studentId));

  List<AnatomyHistoryEntry> historyForStudent(String studentId) =>
      List.unmodifiable(_history.where((item) => item.studentId == studentId));

  void assignExam(AnatomyExamAssignment assignment) => _assignments.add(assignment);

  void addResult(AnatomyExamResult result) => _results.add(result);

  void addHistory(AnatomyHistoryEntry entry) => _history.add(entry);
}

extension<T> on Iterable<T> {
  T? get firstOrNull => isEmpty ? null : first;
}
