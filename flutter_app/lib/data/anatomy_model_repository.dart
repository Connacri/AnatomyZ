import '../models/anatomy_system.dart';

class AnatomyModelRepository {
  static const _base =
      'https://raw.githubusercontent.com/Connacri/Anatria-3D/main/public/anatomy';

  AnatomyModelRef modelFor(AnatomySystem system, AnatomySex sex) {
    final suffix = sex == AnatomySex.male ? 'male' : 'female';
    return AnatomyModelRef(
      system: system,
      sex: sex,
      url: '$_base/${system.id}_$suffix.glb',
    );
  }

  List<AnatomySystem> get systems => AnatomySystem.values;
}
