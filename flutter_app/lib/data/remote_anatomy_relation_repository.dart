import 'dart:convert';

import 'package:http/http.dart' as http;

import '../models/anatomy_relation.dart';

class RemoteAnatomyRelationRepository {
  RemoteAnatomyRelationRepository({
    this.baseUrl = 'https://connacri.github.io/AnatomyZ/catalog/relations',
  });

  final String baseUrl;

  Future<List<AnatomyRelation>> forConcept(String conceptId) async {
    final response = await http.get(Uri.parse('$baseUrl/all.jsonl'));
    if (response.statusCode != 200) {
      throw Exception(
        'Relations AnatomyZ indisponibles (${response.statusCode})',
      );
    }

    final relations = <AnatomyRelation>[];
    for (final line in const LineSplitter().convert(response.body)) {
      if (line.trim().isEmpty) continue;
      final relation = AnatomyRelation.fromJson(
        jsonDecode(line) as Map<String, dynamic>,
      );
      if (relation.subject == conceptId || relation.object == conceptId) {
        relations.add(relation);
      }
    }
    return relations;
  }
}
