class AnatomyRelation {
  const AnatomyRelation({
    required this.source,
    required this.subject,
    required this.predicate,
    required this.object,
    this.subjectIri,
    this.objectIri,
  });

  final String source;
  final String subject;
  final String predicate;
  final String object;
  final String? subjectIri;
  final String? objectIri;

  factory AnatomyRelation.fromJson(Map<String, dynamic> json) {
    return AnatomyRelation(
      source: json['source'] as String? ?? '',
      subject: json['subject'] as String? ?? '',
      predicate: json['predicate'] as String? ?? '',
      object: json['object'] as String? ?? '',
      subjectIri: json['subject_iri'] as String?,
      objectIri: json['object_iri'] as String?,
    );
  }
}
