import 'dart:convert';

import 'package:http/http.dart' as http;

import '../models/anatomy_relation.dart';

class RemoteAnatomyRelationRepository {
  RemoteAnatomyRelationRepository({
    this.baseUrl = 'https://connacri.github.io/AnatomyZ/catalog/relations',
  });

  final String baseUrl;
  Map<String, dynamic>? _index;

  Future<List<AnatomyRelation>> forConcept(String conceptId) async {
    final index = await _loadIndex();
    final entry = index['concepts']?[conceptId] as Map<String, dynamic>?;
    if (entry == null) return const [];

    final file = entry['file'] as String;
    final response = await http.get(
      Uri.parse('https://connacri.github.io/AnatomyZ/$file'),
    );
    if (response.statusCode != 200) {
      throw Exception(
        'Relations AnatomyZ indisponibles (${response.statusCode})',
      );
    }

    for (final line in const LineSplitter().convert(response.body)) {
      if (line.trim().isEmpty) continue;
      final row = jsonDecode(line) as Map<String, dynamic>;
      if (row['concept'] != conceptId) continue;
      final values = row['relations'] as List<dynamic>? ?? const [];
      return values
          .map(
            (dynamic item) =>
                AnatomyRelation.fromJson(item as Map<String, dynamic>),
          )
          .toList(growable: false);
    }
    return const [];
  }

  Future<Map<String, dynamic>> _loadIndex() async {
    if (_index != null) return _index!;
    final response = await http.get(Uri.parse('$baseUrl/index.json'));
    if (response.statusCode != 200) {
      throw Exception(
        'Index des relations AnatomyZ indisponible (${response.statusCode})',
      );
    }
    _index = jsonDecode(response.body) as Map<String, dynamic>;
    return _index!;
  }
}
