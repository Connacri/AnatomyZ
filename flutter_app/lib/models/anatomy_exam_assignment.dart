enum ExamAssignmentStatus { assigned, started, submitted, expired }

class AnatomyExamAssignment {
  const AnatomyExamAssignment({
    required this.id,
    required this.examId,
    required this.classId,
    required this.studentId,
    required this.assignedAt,
    this.dueAt,
    this.status = ExamAssignmentStatus.assigned,
  });

  final String id;
  final String examId;
  final String classId;
  final String studentId;
  final DateTime assignedAt;
  final DateTime? dueAt;
  final ExamAssignmentStatus status;

  AnatomyExamAssignment copyWith({ExamAssignmentStatus? status}) {
    return AnatomyExamAssignment(
      id: id,
      examId: examId,
      classId: classId,
      studentId: studentId,
      assignedAt: assignedAt,
      dueAt: dueAt,
      status: status ?? this.status,
    );
  }
}
