import '../models/anatomy_exam.dart';

class AnatomyExamRepository {
  AnatomyExamRepository._();

  static final AnatomyExamRepository instance = AnatomyExamRepository._();

  final List<AnatomyExam> _exams = [
    const AnatomyExam(
      id: 'demo-cardiovascular',
      title: 'Évaluation — Système cardiovasculaire',
      description: 'Quiz de démonstration AnatomyZ.',
      questions: [
        AnatomyExamQuestion(
          id: 'q1',
          text: 'Quel organe pompe le sang dans la circulation ?',
          type: ExamQuestionType.quiz,
          options: ['Le cœur', 'Le foie', 'Le rein', 'Le poumon'],
          correctOptionIndex: 0,
        ),
      ],
    ),
  ];

  List<AnatomyExam> get exams => List.unmodifiable(_exams);

  void add(AnatomyExam exam) => _exams.add(exam);
}
