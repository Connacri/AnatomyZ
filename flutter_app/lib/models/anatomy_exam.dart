enum ExamQuestionType { quiz, question, identify3d }

class AnatomyExamQuestion {
  const AnatomyExamQuestion({
    required this.id,
    required this.text,
    required this.type,
    this.options = const [],
    this.correctOptionIndex,
    this.expectedAnswer,
    this.points = 1,
    this.conceptId,
    this.conceptNameFr,
    this.conceptNameEn,
    this.meshSex,
    this.meshFile,
    this.meshNode,
    this.relationPredicate,
    this.tags = const [],
    this.difficulty = 1,
  });

  final String id;
  final String text;
  final ExamQuestionType type;
  final List<String> options;
  final int? correctOptionIndex;
  final String? expectedAnswer;
  final int points;

  /// Ontology concept targeted by this question, e.g. FMA:55675 or UBERON:0000948.
  final String? conceptId;
  final String? conceptNameFr;
  final String? conceptNameEn;

  /// Optional physical 3D target. A student answer is valid only when the
  /// selected GLB node matches this value.
  final String? meshSex;
  final String? meshFile;
  final String? meshNode;

  /// Optional ontology relation targeted by a future relation-question engine.
  final String? relationPredicate;

  final List<String> tags;
  final int difficulty;

  bool get has3dTarget =>
      type == ExamQuestionType.identify3d &&
      conceptId != null &&
      meshNode != null &&
      meshNode!.isNotEmpty;
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
