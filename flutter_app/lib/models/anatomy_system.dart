enum AnatomySex { male, female }

enum AnatomySystem {
  skeletal, muscular, articular, cardiovascular, nervous, respiratory,
  digestive, endocrine, urinary, reproductive, lymphatic, integumentary,
  visceral, regional,
}

extension AnatomySystemX on AnatomySystem {
  String get id => name;

  String get nameEn => switch (this) {
    AnatomySystem.skeletal => 'Skeletal system',
    AnatomySystem.muscular => 'Muscular system',
    AnatomySystem.articular => 'Articular system',
    AnatomySystem.cardiovascular => 'Cardiovascular system',
    AnatomySystem.nervous => 'Nervous system',
    AnatomySystem.respiratory => 'Respiratory system',
    AnatomySystem.digestive => 'Digestive system',
    AnatomySystem.endocrine => 'Endocrine system',
    AnatomySystem.urinary => 'Urinary system',
    AnatomySystem.reproductive => 'Reproductive system',
    AnatomySystem.lymphatic => 'Lymphatic system',
    AnatomySystem.integumentary => 'Integumentary system',
    AnatomySystem.visceral => 'Visceral anatomy',
    AnatomySystem.regional => 'Regional anatomy',
  };

  String get nameFr => switch (this) {
    AnatomySystem.skeletal => 'Système squelettique',
    AnatomySystem.muscular => 'Système musculaire',
    AnatomySystem.articular => 'Système articulaire',
    AnatomySystem.cardiovascular => 'Système cardiovasculaire',
    AnatomySystem.nervous => 'Système nerveux',
    AnatomySystem.respiratory => 'Système respiratoire',
    AnatomySystem.digestive => 'Système digestif',
    AnatomySystem.endocrine => 'Système endocrinien',
    AnatomySystem.urinary => 'Système urinaire',
    AnatomySystem.reproductive => 'Système reproducteur',
    AnatomySystem.lymphatic => 'Système lymphatique',
    AnatomySystem.integumentary => 'Système tégumentaire',
    AnatomySystem.visceral => 'Anatomie viscérale',
    AnatomySystem.regional => 'Anatomie régionale',
  };
}

class AnatomyModelRef {
  const AnatomyModelRef({
    required this.system,
    required this.sex,
    required this.url,
  });

  final AnatomySystem system;
  final AnatomySex sex;
  final String url;
}
