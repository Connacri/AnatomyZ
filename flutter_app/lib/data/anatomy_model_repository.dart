import '../models/anatomy_system.dart';

class AnatomyModelRepository {
  static const _base =
      'https://raw.githubusercontent.com/Connacri/Anatria-3D/main/public/anatomy';

  // Only combinations known to have a 3D asset are exposed to the viewer.
  // Other anatomical concepts can later be represented in the catalog layer
  // without pretending that a mesh exists.
  static const Map<AnatomySex, Set<AnatomySystem>> _available = {
    AnatomySex.male: {
      AnatomySystem.skeletal,
      AnatomySystem.muscular,
      AnatomySystem.articular,
      AnatomySystem.cardiovascular,
      AnatomySystem.lymphatic,
      AnatomySystem.nervous,
      AnatomySystem.digestive,
      AnatomySystem.respiratory,
      AnatomySystem.endocrine,
      AnatomySystem.urinary,
      AnatomySystem.reproductive,
      AnatomySystem.visceral,
      AnatomySystem.regional,
    },
    AnatomySex.female: {
      AnatomySystem.skeletal,
      AnatomySystem.cardiovascular,
      AnatomySystem.digestive,
      AnatomySystem.lymphatic,
      AnatomySystem.urinary,
      AnatomySystem.reproductive,
      AnatomySystem.integumentary,
    },
  };

  bool hasModel(AnatomySystem system, AnatomySex sex) =>
      _available[sex]?.contains(system) ?? false;

  AnatomyModelRef? modelFor(AnatomySystem system, AnatomySex sex) {
    if (!hasModel(system, sex)) return null;
    final suffix = sex == AnatomySex.male ? 'male' : 'female';
    return AnatomyModelRef(
      system: system,
      sex: sex,
      url: '$_base/${system.id}_$suffix.glb',
    );
  }

  List<AnatomySystem> get systems => AnatomySystem.values;

  List<AnatomySystem> systemsFor(AnatomySex sex) =>
      AnatomySystem.values.where((system) => hasModel(system, sex)).toList();
}
