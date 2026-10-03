class AnatomyStructure {
  const AnatomyStructure({
    required this.id,
    required this.nameFr,
    required this.nameEn,
    required this.system,
    this.synonymsFr = const [],
    this.synonymsEn = const [],
    this.source = 'AnatomyZ',
    this.meshAvailable = false,
  });

  final String id;
  final String nameFr;
  final String nameEn;
  final String system;
  final List<String> synonymsFr;
  final List<String> synonymsEn;
  final String source;
  final bool meshAvailable;

  Map<String, dynamic> toJson() => {
        'id': id,
        'name_fr': nameFr,
        'name_en': nameEn,
        'system': system,
        'synonyms_fr': synonymsFr,
        'synonyms_en': synonymsEn,
        'source': source,
        'mesh_available': meshAvailable,
      };

  factory AnatomyStructure.fromJson(Map<String, dynamic> json) {
    return AnatomyStructure(
      id: json['id'] as String,
      nameFr: json['name_fr'] as String,
      nameEn: json['name_en'] as String,
      system: json['system'] as String,
      synonymsFr: List<String>.from(json['synonyms_fr'] ?? const []),
      synonymsEn: List<String>.from(json['synonyms_en'] ?? const []),
      source: json['source'] as String? ?? 'AnatomyZ',
      meshAvailable: json['mesh_available'] as bool? ?? false,
    );
  }
}
