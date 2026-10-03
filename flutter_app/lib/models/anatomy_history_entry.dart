enum AnatomyHistoryType { exam, lesson, dissection, quiz, atlas }

class AnatomyHistoryEntry {
  const AnatomyHistoryEntry({
    required this.id,
    required this.studentId,
    required this.type,
    required this.title,
    required this.occurredAt,
    this.score,
    this.durationSeconds,
  });

  final String id;
  final String studentId;
  final AnatomyHistoryType type;
  final String title;
  final DateTime occurredAt;
  final double? score;
  final int? durationSeconds;
}
