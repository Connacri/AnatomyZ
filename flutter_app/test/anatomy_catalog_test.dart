import 'package:flutter_test/flutter_test.dart';
import 'package:anatomyz/data/anatomy_catalog_repository.dart';

void main() {
  final catalog = AnatomyCatalogRepository();

  test('search is accent-insensitive in French', () {
    expect(catalog.search('coeur').single.nameEn, 'Heart');
    expect(catalog.search('cerveau').single.nameEn, 'Brain');
  });

  test('structures keep canonical source identifiers', () {
    final heart = catalog.byId('FMA:55675');
    expect(heart?.nameFr, 'Cœur');
    expect(heart?.source, 'FMA');
    expect(heart?.meshAvailable, isTrue);
  });
}
