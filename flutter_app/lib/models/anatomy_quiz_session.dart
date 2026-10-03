import 'anatomy_exam.dart';

class AnatomyQuizSession {
  AnatomyQuizSession({
    required this.exam,
    List<AnatomyExamQuestion>? questions,
  }) : questions = List.unmodifiable(questions ?? exam.questions);

  final AnatomyExam exam;
  final List<AnatomyExamQuestion> questions;
  final Map<String, String> answers = {};
  final DateTime startedAt = DateTime.now();

  int get answeredCount => answers.length;
  int get totalQuestions => questions.length;
  double get progress =>
      totalQuestions == 0 ? 0 : answeredCount / totalQuestions;

  bool isCorrect(AnatomyExamQuestion question) {
    final answer = answers[question.id];
    if (answer == null) return false;

    switch (question.type) {
      case ExamQuestionType.quiz:
        return question.options.indexOf(answer) == question.correctOptionIndex;
      case ExamQuestionType.identify3d:
        return question.meshNode != null && answer == question.meshNode;
      case ExamQuestionType.question:
        final expected = question.expectedAnswer?.trim().toLowerCase();
        return expected != null && answer.trim().toLowerCase() == expected;
    }
  }

  int get earnedPoints => questions
      .where(isCorrect)
      .fold(0, (sum, question) => sum + question.points);

  int get totalPoints => questions.fold(0, (sum, question) => sum + question.points);

  double get percentage =>
      totalPoints == 0 ? 0 : earnedPoints * 100 / totalPoints;

  List<AnatomyExamQuestion> get incorrectQuestions =>
      questions.where((question) => answers.containsKey(question.id) && !isCorrect(question)).toList(growable: false);
}
