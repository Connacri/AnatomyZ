class AnatomyStudent {
  const AnatomyStudent({
    required this.id,
    required this.name,
    this.email = '',
    this.classIds = const [],
  });

  final String id;
  final String name;
  final String email;
  final List<String> classIds;
}
