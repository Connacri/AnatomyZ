class AnatomyClass {
  const AnatomyClass({
    required this.id,
    required this.name,
    required this.professorId,
    this.description = '',
    this.studentIds = const [],
  });

  final String id;
  final String name;
  final String professorId;
  final String description;
  final List<String> studentIds;

  AnatomyClass copyWith({String? name, String? description, List<String>? studentIds}) {
    return AnatomyClass(
      id: id,
      name: name ?? this.name,
      professorId: professorId,
      description: description ?? this.description,
      studentIds: studentIds ?? this.studentIds,
    );
  }
}
