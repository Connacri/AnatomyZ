import 'dart:convert';
import 'package:http/http.dart' as http;

import '../models/anatomy_structure.dart';

class RemoteAnatomyCatalogRepository {
  RemoteAnatomyCatalogRepository({
    this.baseUrl = 'https://connacri.github.io/AnatomyZ/catalog',
  });

  final String baseUrl;
  final Map<String, List<AnatomyStructure>> _cache = {};
  Map<String, dynamic>? _index;

  Future<List<AnatomyStructure>> search(String query) async {
    final normalized = _normalize(query);
    if (normalized.isEmpty) return const [];
    final prefix = normalized[0];
    final index = await _loadIndex();
    final prefixData = index['prefixes']?[prefix] as Map<String, dynamic>?;
    if (prefixData == null) return const [];
    final cached = _cache[prefix];
    final rows = cached ?? await _loadPrefix(prefix, prefixData);
    return rows.where((structure) {
      final values = <String>[structure.id, structure.nameFr, structure.nameEn, ...structure.synonymsFr, ...structure.synonymsEn];
      return values.any((value) => _normalize(value).contains(normalized));
    }).take(80).toList(growable: false);
  }

  Future<Map<String, dynamic>> _loadIndex() async {
    if (_index != null) return _index!;
    final response = await http.get(Uri.parse(baseUrl + '/index.json'));
    if (response.statusCode != 200) throw Exception('Catalogue AnatomyZ indisponible (' + response.statusCode.toString() + ')');
    _index = jsonDecode(response.body) as Map<String, dynamic>;
    return _index!;
  }

  Future<List<AnatomyStructure>> _loadPrefix(String prefix, Map<String, dynamic> prefixData) async {
    final chunks = prefixData['chunks'] as List<dynamic>;
    final rows = <AnatomyStructure>[];
    for (final item in chunks) {
      final file = (item as Map<String, dynamic>)['file'] as String;
      final response = await http.get(Uri.parse(baseUrl + '/' + file));
      if (response.statusCode != 200) continue;
      for (final line in const LineSplitter().convert(response.body)) {
        if (line.trim().isEmpty) continue;
        rows.add(AnatomyStructure.fromJson(jsonDecode(line) as Map<String, dynamic>));
      }
    }
    _cache[prefix] = rows;
    return rows;
  }

  static String _normalize(String value) => value.toLowerCase()
      .replaceAll(RegExp(r'[àáâäãå]'), 'a')
      .replaceAll(RegExp(r'[èéêë]'), 'e')
      .replaceAll(RegExp(r'[ìíîï]'), 'i')
      .replaceAll(RegExp(r'[òóôöõ]'), 'o')
      .replaceAll(RegExp(r'[ùúûü]'), 'u')
      .replaceAll('ç', 'c').trim();
}
