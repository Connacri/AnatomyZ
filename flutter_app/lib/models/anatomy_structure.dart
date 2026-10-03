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
    this.meshSex,
    this.meshFile,
    this.meshNode,
    this.meshVariants = const [],
  });

  final String id;
  final String nameFr;
  final String nameEn;
  final String system;
  final List<String> synonymsFr;
  final List<String> synonymsEn;
  final String source;
  final bool meshAvailable;
  final String? meshSex;
  final String? meshFile;
  final String? meshNode;
  final List<Map<String, dynamic>> meshVariants;

  Map<String, dynamic> toJson() => {
        'id': id,
        'name_fr': nameFr,
        'name_en': nameEn,
        'system': system,
        'synonyms_fr': synonymsFr,
        'synonyms_en': synonymsEn,
        'source': source,
        'mesh_available': meshAvailable,
        'mesh_sex': meshSex,
        'mesh_file': meshFile,
        'mesh_node': meshNode,
        'mesh_variants': meshVariants,
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
      meshSex: json['mesh_sex'] as String?,
      meshFile: json['mesh_file'] as String?,
      meshNode: json['mesh_node'] as String?,
      meshVariants: (json['mesh_variants'] as List<dynamic>? ?? const [])
          .map((dynamic item) => Map<String, dynamic>.from(item as Map))
          .toList(growable: false),
    );
  }
}
