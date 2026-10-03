enum ExamQuestionType { quiz, question }

class AnatomyExamQuestion {
  const AnatomyExamQuestion({
    required this.id,
    required this.text,
    required this.type,
    this.options = const [],
    this.correctOptionIndex,
    this.expectedAnswer,
    this.points = 1,
  });

  final String id;
  final String text;
  final ExamQuestionType type;
  final List<String> options;
  final int? correctOptionIndex;
  final String? expectedAnswer;
  final int points;
}

class AnatomyExam {
  const AnatomyExam({
    required this.id,
    required this.title,
    required this.description,
    required this.questions,
    this.durationMinutes = 30,
    this.hideAnatomy = true,
  });

  final String id;
  final String title;
  final String description;
  final List<AnatomyExamQuestion> questions;
  final int durationMinutes;
  final bool hideAnatomy;

  int get totalPoints =>
      questions.fold(0, (sum, question) => sum + question.points);
}
