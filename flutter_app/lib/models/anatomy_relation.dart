class AnatomyRelation {
  const AnatomyRelation({
    required this.source,
    required this.subject,
    required this.predicate,
    required this.object,
    this.subjectIri,
    this.objectIri,
    this.predicateIri,
    this.direction = "forward",
  });

  final String source;
  final String subject;
  final String predicate;
  final String object;
  final String? subjectIri;
  final String? objectIri;
  final String? predicateIri;
  final String direction;

  factory AnatomyRelation.fromJson(Map<String, dynamic> json) {
    return AnatomyRelation(
      source: json['source'] as String? ?? '',
      subject: json['subject'] as String? ?? '',
      predicate: json['predicate'] as String? ?? '',
      object: json['object'] as String? ?? '',
      subjectIri: json['subject_iri'] as String?,
      objectIri: json['object_iri'] as String?,
      predicateIri: json['predicate_iri'] as String?,
      direction: json['direction'] as String? ?? "forward",
    );
  }
}
