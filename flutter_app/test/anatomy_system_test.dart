import 'package:flutter_test/flutter_test.dart';
import 'package:anatomyz/models/anatomy_system.dart';

void main() {
  test('AnatomyZ exposes the initial system taxonomy', () {
    expect(AnatomySystem.values.length, 14);
    expect(AnatomySystem.skeletal.nameFr, 'Système squelettique');
    expect(AnatomySystem.cardiovascular.nameEn, 'Cardiovascular system');
  });
}
