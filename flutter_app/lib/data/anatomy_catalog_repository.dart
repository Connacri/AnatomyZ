import '../models/anatomy_structure.dart';

/// Runtime catalog facade.
///
/// The production catalog is generated as JSONL and loaded lazily by
/// [RemoteAnatomyCatalogRepository]. This repository remains the offline
/// fallback used when the network catalog is unavailable.
class AnatomyCatalogRepository {
  AnatomyCatalogRepository({List<AnatomyStructure>? structures})
      : _structures = structures ?? _seed;

  final List<AnatomyStructure> _structures;

  List<AnatomyStructure> get all => List.unmodifiable(_structures);

  List<AnatomyStructure> search(String query) {
    final String normalized = _normalize(query);
    if (normalized.isEmpty) return all;

    return _structures.where((AnatomyStructure structure) {
      final List<String> values = <String>[
        structure.id,
        structure.nameFr,
        structure.nameEn,
        ...structure.synonymsFr,
        ...structure.synonymsEn,
      ];
      return values.any(
        (String value) => _normalize(value).contains(normalized),
      );
    }).toList(growable: false);
  }

  AnatomyStructure? byId(String id) {
    for (final AnatomyStructure structure in _structures) {
      if (structure.id == id) return structure;
    }
    return null;
  }

  static String _normalize(String value) {
    return value
        .toLowerCase()
        .replaceAll(RegExp(r'[àáâäãå]'), 'a')
        .replaceAll(RegExp(r'[èéêë]'), 'e')
        .replaceAll(RegExp(r'[ìíîï]'), 'i')
        .replaceAll(RegExp(r'[òóôöõ]'), 'o')
        .replaceAll(RegExp(r'[ùúûü]'), 'u')
        .replaceAll('ç', 'c')
        .trim();
  }

  static const List<AnatomyStructure> _seed = <AnatomyStructure>[
    AnatomyStructure(
      id: 'FMA:55675',
      nameFr: 'Cœur',
      nameEn: 'Heart',
      system: 'cardiovascular',
      synonymsFr: <String>['coeur'],
      source: 'FMA',
      meshAvailable: true,
    ),
    AnatomyStructure(
      id: 'FMA:7196',
      nameFr: 'Poumon',
      nameEn: 'Lung',
      system: 'respiratory',
      synonymsFr: <String>['poumons'],
      synonymsEn: <String>['lungs'],
      source: 'FMA',
      meshAvailable: true,
    ),
    AnatomyStructure(
      id: 'FMA:9668',
      nameFr: 'Foie',
      nameEn: 'Liver',
      system: 'digestive',
      source: 'FMA',
      meshAvailable: true,
    ),
    AnatomyStructure(
      id: 'FMA:5824',
      nameFr: 'Rein',
      nameEn: 'Kidney',
      system: 'urinary',
      synonymsFr: <String>['reins'],
      source: 'FMA',
      meshAvailable: true,
    ),
    AnatomyStructure(
      id: 'FMA:7197',
      nameFr: 'Estomac',
      nameEn: 'Stomach',
      system: 'digestive',
      source: 'FMA',
      meshAvailable: true,
    ),
    AnatomyStructure(
      id: 'FMA:7154',
      nameFr: 'Cerveau',
      nameEn: 'Brain',
      system: 'nervous',
      synonymsFr: <String>['encéphale'],
      synonymsEn: <String>['encephalon'],
      source: 'FMA',
      meshAvailable: true,
    ),
  ];
}
