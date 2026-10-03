class AnatomyExamResult {
  const AnatomyExamResult({
    required this.id,
    required this.examId,
    required this.assignmentId,
    required this.studentId,
    required this.submittedAt,
    required this.score,
    required this.maxScore,
    this.percentage = 0,
    this.questionScores = const {},
  });

  final String id;
  final String examId;
  final String assignmentId;
  final String studentId;
  final DateTime submittedAt;
  final int score;
  final int maxScore;
  final double percentage;
  final Map<String, int> questionScores;

  String get grade => _gradeFor(percentage);

  static String _gradeFor(double value) {
    if (value >= 90) return 'A';
    if (value >= 80) return 'B';
    if (value >= 70) return 'C';
    if (value >= 60) return 'D';
    return 'F';
  }
}
