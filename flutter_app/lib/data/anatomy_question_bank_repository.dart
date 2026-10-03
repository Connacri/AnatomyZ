import '../models/anatomy_exam.dart';

class AnatomyQuestionBankRepository {
  AnatomyQuestionBankRepository._();

  static final AnatomyQuestionBankRepository instance =
      AnatomyQuestionBankRepository._();

  final List<AnatomyExamQuestion> _questions = [
    const AnatomyExamQuestion(
      id: 'q-heart-basic',
      text: 'Quel organe propulse le sang dans la circulation ?',
      type: ExamQuestionType.quiz,
      options: ['Le cœur', 'Le foie', 'Le rein', 'Le poumon'],
      correctOptionIndex: 0,
      conceptId: 'FMA:55675',
      conceptNameFr: 'Cœur',
      conceptNameEn: 'Heart',
      tags: ['cardiovasculaire', 'fonction'],
      difficulty: 1,
    ),
    const AnatomyExamQuestion(
      id: 'q-lung-basic',
      text: 'Quel organe est principalement responsable des échanges gazeux pulmonaires ?',
      type: ExamQuestionType.quiz,
      options: ['Le foie', 'Le poumon', 'Le rein', 'Le cerveau'],
      correctOptionIndex: 1,
      conceptId: 'FMA:7196',
      conceptNameFr: 'Poumon',
      conceptNameEn: 'Lung',
      tags: ['respiratoire', 'fonction'],
      difficulty: 1,
    ),
  ];

  List<AnatomyExamQuestion> get all => List.unmodifiable(_questions);

  List<AnatomyExamQuestion> byConcept(String conceptId) =>
      List.unmodifiable(
        _questions.where((question) => question.conceptId == conceptId),
      );

  List<AnatomyExamQuestion> byDifficulty(int difficulty) =>
      List.unmodifiable(
        _questions.where((question) => question.difficulty == difficulty),
      );

  void add(AnatomyExamQuestion question) {
    _questions.add(question);
  }
}
