import {
  AnatomyClass,
  AnatomyExam,
  AnatomyExamAssignment,
  AnatomyExamQuestion,
  AnatomyExamResult,
  AnatomyHistoryEntry,
  AnatomyHistoryType,
  AnatomyModelRef,
  AnatomyRelation,
  AnatomySex,
  AnatomyStructure,
  AnatomyStudent,
  AnatomySystem,
  AnatomySystemInfo,
  ExamAssignmentStatus,
  ExamQuestionType,
} from '../types';

export const ANATOMY_SYSTEMS: AnatomySystemInfo[] = [
  { id: AnatomySystem.Skeletal, nameFr: 'Système squelettique', nameEn: 'Skeletal system' },
  { id: AnatomySystem.Muscular, nameFr: 'Système musculaire', nameEn: 'Muscular system' },
  { id: AnatomySystem.Articular, nameFr: 'Système articulaire', nameEn: 'Articular system' },
  { id: AnatomySystem.Cardiovascular, nameFr: 'Système cardiovasculaire', nameEn: 'Cardiovascular system' },
  { id: AnatomySystem.Nervous, nameFr: 'Système nerveux', nameEn: 'Nervous system' },
  { id: AnatomySystem.Respiratory, nameFr: 'Système respiratoire', nameEn: 'Respiratory system' },
  { id: AnatomySystem.Digestive, nameFr: 'Système digestif', nameEn: 'Digestive system' },
  { id: AnatomySystem.Endocrine, nameFr: 'Système endocrinien', nameEn: 'Endocrine system' },
  { id: AnatomySystem.Urinary, nameFr: 'Système urinaire', nameEn: 'Urinary system' },
  { id: AnatomySystem.Reproductive, nameFr: 'Système reproducteur', nameEn: 'Reproductive system' },
  { id: AnatomySystem.Lymphatic, nameFr: 'Système lymphatique', nameEn: 'Lymphatic system' },
  { id: AnatomySystem.Integumentary, nameFr: 'Système tégumentaire', nameEn: 'Integumentary system' },
  { id: AnatomySystem.Visceral, nameFr: 'Anatomie viscérale', nameEn: 'Visceral anatomy' },
  { id: AnatomySystem.Regional, nameFr: 'Anatomie régionale', nameEn: 'Regional anatomy' },
];

const MODELS_BASE_URL =
  import.meta.env.VITE_MODELS_BASE_URL ||
  'https://raw.githubusercontent.com/Connacri/Anatria-3D/main/public/anatomy';

const AVAILABLE_MODELS: Record<AnatomySex, Set<AnatomySystem>> = {
  [AnatomySex.Male]: new Set([
    AnatomySystem.Skeletal,
    AnatomySystem.Muscular,
    AnatomySystem.Articular,
    AnatomySystem.Cardiovascular,
    AnatomySystem.Lymphatic,
    AnatomySystem.Nervous,
    AnatomySystem.Digestive,
    AnatomySystem.Respiratory,
    AnatomySystem.Endocrine,
    AnatomySystem.Urinary,
    AnatomySystem.Reproductive,
    AnatomySystem.Visceral,
    AnatomySystem.Regional,
  ]),
  [AnatomySex.Female]: new Set([
    AnatomySystem.Skeletal,
    AnatomySystem.Cardiovascular,
    AnatomySystem.Digestive,
    AnatomySystem.Lymphatic,
    AnatomySystem.Urinary,
    AnatomySystem.Reproductive,
    AnatomySystem.Integumentary,
  ]),
};

const FILE_IDS: Partial<Record<AnatomySystem, string>> = {
  [AnatomySystem.Urinary]: 'renal',
};

export class AnatomyModelRepository {
  get systems(): AnatomySystemInfo[] {
    return ANATOMY_SYSTEMS;
  }

  hasModel(system: AnatomySystem, sex: AnatomySex): boolean {
    return AVAILABLE_MODELS[sex]?.has(system) ?? false;
  }

  modelFor(systemInfo: AnatomySystemInfo, sex: AnatomySex): AnatomyModelRef | null {
    if (!this.hasModel(systemInfo.id, sex)) return null;
    const suffix = sex === AnatomySex.Male ? 'male' : 'female';
    const fileId = FILE_IDS[systemInfo.id] ?? systemInfo.id;
    return {
      system: systemInfo,
      sex,
      url: `${MODELS_BASE_URL}/${fileId}_${suffix}.glb`,
    };
  }
}

export function normalizeText(value: string): string {
  return value
    .toLowerCase()
    .replace(/[àáâäãå]/g, 'a')
    .replace(/[èéêë]/g, 'e')
    .replace(/[ìíîï]/g, 'i')
    .replace(/[òóôöõ]/g, 'o')
    .replace(/[ùúûü]/g, 'u')
    .replace(/ç/g, 'c')
    .replace(/œ/g, 'oe')
    .trim();
}

const SEED_STRUCTURES: AnatomyStructure[] = [
  {
    id: 'FMA:55675',
    nameFr: 'Cœur',
    nameEn: 'Heart',
    system: 'cardiovascular',
    synonymsFr: ['coeur', 'myocarde'],
    synonymsEn: ['cardiac organ'],
    source: 'FMA',
    meshAvailable: true,
    meshSex: 'male',
    meshFile: 'cardiovascular_male.glb',
    meshNode: 'Right atrium',
    meshVariants: [
      { sex: 'male', mesh_file: 'cardiovascular_male.glb', node: 'Right atrium', match_type: 'manual_verified' },
    ],
    meshMappingStatus: 'expert_verified',
  },
  {
    id: 'FMA:7196',
    nameFr: 'Poumon',
    nameEn: 'Lung',
    system: 'respiratory',
    synonymsFr: ['poumons', 'poumon droit', 'poumon gauche'],
    synonymsEn: ['lungs', 'pulmo'],
    source: 'FMA',
    meshAvailable: true,
    meshSex: 'male',
    meshFile: 'respiratory_male.glb',
    meshNode: 'Right superior lobar bronchus',
    meshVariants: [
      { sex: 'male', mesh_file: 'respiratory_male.glb', node: 'Right superior lobar bronchus', match_type: 'manual_verified' },
    ],
    meshMappingStatus: 'expert_verified',
  },
  {
    id: 'FMA:9668',
    nameFr: 'Foie',
    nameEn: 'Liver',
    system: 'digestive',
    synonymsFr: ['hepar'],
    synonymsEn: ['hepatic organ'],
    source: 'FMA',
    meshAvailable: true,
    meshSex: 'male',
    meshFile: 'digestive_male.glb',
    meshNode: 'Liver',
    meshVariants: [
      { sex: 'male', mesh_file: 'digestive_male.glb', node: 'Liver', match_type: 'manual_verified' },
      { sex: 'female', mesh_file: 'digestive_female.glb', node: 'VH_F_bare_area_of_liver', match_type: 'manual_verified' },
    ],
    meshMappingStatus: 'expert_verified',
  },
  {
    id: 'FMA:5824',
    nameFr: 'Rein',
    nameEn: 'Kidney',
    system: 'urinary',
    synonymsFr: ['reins', 'rein droit', 'rein gauche'],
    synonymsEn: ['ren', 'kidneys'],
    source: 'FMA',
    meshAvailable: true,
    meshSex: 'male',
    meshFile: 'renal_male.glb',
    meshNode: 'Kidney.l',
    meshVariants: [
      { sex: 'male', mesh_file: 'renal_male.glb', node: 'Kidney.l', match_type: 'manual_verified' },
      { sex: 'female', mesh_file: 'renal_female.glb', node: 'VH_F_kidney_capsule_L', match_type: 'manual_verified' },
    ],
    meshMappingStatus: 'expert_verified',
  },
  {
    id: 'FMA:7197',
    nameFr: 'Estomac',
    nameEn: 'Stomach',
    system: 'digestive',
    synonymsFr: ['gaster', 'ventricule'],
    synonymsEn: ['gastric organ'],
    source: 'FMA',
    meshAvailable: true,
    meshSex: 'male',
    meshFile: 'digestive_male.glb',
    meshNode: 'Stomach',
    meshVariants: [
      { sex: 'male', mesh_file: 'digestive_male.glb', node: 'Stomach', match_type: 'manual_verified' },
    ],
    meshMappingStatus: 'expert_verified',
  },
  {
    id: 'FMA:7154',
    nameFr: 'Cerveau',
    nameEn: 'Brain',
    system: 'nervous',
    synonymsFr: ['encéphale', 'encephale'],
    synonymsEn: ['encephalon', 'cerebrum'],
    source: 'FMA',
    meshAvailable: true,
    meshSex: 'male',
    meshFile: 'nervous_male.glb',
    meshNode: 'Superior frontal gyrus.l',
    meshVariants: [
      { sex: 'male', mesh_file: 'nervous_male.glb', node: 'Superior frontal gyrus.l', match_type: 'manual_verified' },
    ],
    meshMappingStatus: 'expert_verified',
  },
  {
    id: 'FMA:9611',
    nameFr: 'Fémur',
    nameEn: 'Femur',
    system: 'skeletal',
    synonymsFr: ['femur', 'os de la cuisse'],
    synonymsEn: ['thigh bone'],
    source: 'FMA',
    meshAvailable: true,
    meshSex: 'male',
    meshFile: 'skeletal_male.glb',
    meshNode: 'Femur.l',
    meshVariants: [
      { sex: 'male', mesh_file: 'skeletal_male.glb', node: 'Femur.l', match_type: 'manual_verified' },
    ],
    meshMappingStatus: 'expert_verified',
  },
  {
    id: 'FMA:3734',
    nameFr: 'Aorte',
    nameEn: 'Aorta',
    system: 'cardiovascular',
    synonymsFr: ['aorte thoracique', 'aorte abdominale'],
    synonymsEn: ['trunk of systemic arterial tree'],
    source: 'FMA',
    meshAvailable: true,
    meshSex: 'male',
    meshFile: 'cardiovascular_male.glb',
    meshNode: 'Ascending aorta',
    meshVariants: [
      { sex: 'male', mesh_file: 'cardiovascular_male.glb', node: 'Ascending aorta', match_type: 'manual_verified' },
      { sex: 'female', mesh_file: 'cardiovascular_female.glb', node: 'VH_F_descending_aorta_a', match_type: 'manual_verified' },
    ],
    meshMappingStatus: 'expert_verified',
  },
];

const LOCAL_RELATIONS: Record<string, AnatomyRelation[]> = {
  'FMA:55675': [
    { source: 'FMA', subject: 'Cœur (FMA:55675)', predicate: 'part_of', object: 'Système cardiovasculaire (FMA:7161)', direction: 'forward' },
    { source: 'FMA', subject: 'Cœur (FMA:55675)', predicate: 'has_part', object: 'Ventricule gauche (FMA:7101)', direction: 'forward' },
    { source: 'FMA', subject: 'Cœur (FMA:55675)', predicate: 'has_part', object: 'Ventricule droit (FMA:7098)', direction: 'forward' },
    { source: 'FMA', subject: 'Cœur (FMA:55675)', predicate: 'continuous_with', object: 'Aorte ascendante (FMA:3736)', direction: 'forward' },
    { source: 'UBERON', subject: 'FMA:55675', predicate: 'xref', object: 'UBERON:0000948', direction: 'forward' },
  ],
  'FMA:7196': [
    { source: 'FMA', subject: 'Poumon (FMA:7196)', predicate: 'part_of', object: 'Système respiratoire (FMA:7158)', direction: 'forward' },
    { source: 'FMA', subject: 'Poumon (FMA:7196)', predicate: 'continuous_with', object: 'Bronche principale (FMA:7394)', direction: 'forward' },
    { source: 'UBERON', subject: 'FMA:7196', predicate: 'xref', object: 'UBERON:0002048', direction: 'forward' },
  ],
  'FMA:9668': [
    { source: 'FMA', subject: 'Foie (FMA:9668)', predicate: 'part_of', object: 'Système digestif (FMA:7152)', direction: 'forward' },
    { source: 'FMA', subject: 'Foie (FMA:9668)', predicate: 'has_part', object: 'Lobe hépatique droit (FMA:13321)', direction: 'forward' },
    { source: 'UBERON', subject: 'FMA:9668', predicate: 'xref', object: 'UBERON:0002107', direction: 'forward' },
  ],
  'FMA:5824': [
    { source: 'FMA', subject: 'Rein (FMA:5824)', predicate: 'part_of', object: 'Système urinaire (FMA:7159)', direction: 'forward' },
    { source: 'FMA', subject: 'Rein (FMA:5824)', predicate: 'continuous_with', object: 'Uretère (FMA:9704)', direction: 'forward' },
    { source: 'UBERON', subject: 'FMA:5824', predicate: 'xref', object: 'UBERON:0002113', direction: 'forward' },
  ],
  'FMA:7197': [
    { source: 'FMA', subject: 'Estomac (FMA:7197)', predicate: 'part_of', object: 'Tube digestif (FMA:71132)', direction: 'forward' },
    { source: 'FMA', subject: 'Estomac (FMA:7197)', predicate: 'continuous_with', object: 'Duodénum (FMA:7206)', direction: 'forward' },
    { source: 'UBERON', subject: 'FMA:7197', predicate: 'xref', object: 'UBERON:0000945', direction: 'forward' },
  ],
  'FMA:7154': [
    { source: 'FMA', subject: 'Cerveau (FMA:7154)', predicate: 'part_of', object: 'Système nerveux central (FMA:55675)', direction: 'forward' },
    { source: 'FMA', subject: 'Cerveau (FMA:7154)', predicate: 'has_part', object: 'Cortex cérébral (FMA:61830)', direction: 'forward' },
    { source: 'UBERON', subject: 'FMA:7154', predicate: 'xref', object: 'UBERON:0000955', direction: 'forward' },
  ],
};

export class AnatomyCatalogRepository {
  private structures: AnatomyStructure[] = SEED_STRUCTURES;

  get all(): AnatomyStructure[] {
    return this.structures;
  }

  search(query: string): AnatomyStructure[] {
    const normalized = normalizeText(query);
    if (!normalized) return this.all;

    return this.structures.filter((structure) => {
      const values = [
        structure.id,
        structure.nameFr,
        structure.nameEn,
        ...structure.synonymsFr,
        ...structure.synonymsEn,
        structure.system,
      ];
      return values.some((value) => normalizeText(value).includes(normalized));
    });
  }

  byId(id: string): AnatomyStructure | undefined {
    return this.structures.find((s) => s.id === id);
  }
}

export class RemoteAnatomyCatalogRepository {
  private baseUrl =
    import.meta.env.VITE_CATALOG_BASE_URL ||
    'https://connacri.github.io/AnatomyZ/catalog';
  private cache = new Map<string, AnatomyStructure[]>();
  private index: Record<string, any> | null = null;

  async search(query: string): Promise<AnatomyStructure[]> {
    const normalized = normalizeText(query);
    if (!normalized) return [];
    const prefix = normalized[0];
    const index = await this.loadIndex();
    const prefixData = index?.prefixes?.[prefix];
    if (!prefixData) return [];

    let rows = this.cache.get(prefix);
    if (!rows) {
      rows = await this.loadPrefix(prefix, prefixData);
    }

    return rows
      .filter((structure) => {
        const values = [
          structure.id,
          structure.nameFr,
          structure.nameEn,
          ...structure.synonymsFr,
          ...structure.synonymsEn,
        ];
        return values.some((v) => normalizeText(v).includes(normalized));
      })
      .slice(0, 80);
  }

  private async loadIndex(): Promise<Record<string, any>> {
    if (this.index) return this.index;
    const response = await fetch(`${this.baseUrl}/index.json`);
    if (!response.ok) {
      throw new Error(`Catalogue AnatomyZ indisponible (${response.status})`);
    }
    this.index = await response.json();
    return this.index!;
  }

  private async loadPrefix(
    prefix: string,
    prefixData: Record<string, any>
  ): Promise<AnatomyStructure[]> {
    const chunks: Array<{ file: string }> = prefixData.chunks || [];
    const rows: AnatomyStructure[] = [];
    for (const item of chunks) {
      const response = await fetch(`${this.baseUrl}/${item.file}`);
      if (!response.ok) continue;
      const text = await response.text();
      for (const line of text.split('\n')) {
        if (!line.trim()) continue;
        try {
          const json = JSON.parse(line);
          rows.push({
            id: json.id,
            nameFr: json.name_fr,
            nameEn: json.name_en,
            system: json.system,
            synonymsFr: json.synonyms_fr || [],
            synonymsEn: json.synonyms_en || [],
            source: json.source || 'AnatomyZ',
            meshAvailable: Boolean(json.mesh_available),
            meshSex: json.mesh_sex,
            meshFile: json.mesh_file,
            meshNode: json.mesh_node,
            meshVariants: json.mesh_variants || [],
            meshMappingStatus: json.mesh_mapping_status || 'catalog_only',
          });
        } catch {
          // ignore malformed line
        }
      }
    }
    this.cache.set(prefix, rows);
    return rows;
  }
}

export class RemoteAnatomyRelationRepository {
  private baseUrl =
    import.meta.env.VITE_RELATIONS_BASE_URL ||
    'https://connacri.github.io/AnatomyZ/catalog/relations';
  private index: Record<string, any> | null = null;

  async forConcept(conceptId: string): Promise<AnatomyRelation[]> {
    try {
      const index = await this.loadIndex();
      const entry = index?.concepts?.[conceptId];
      if (!entry) return LOCAL_RELATIONS[conceptId] || [];

      const response = await fetch(
        `https://connacri.github.io/AnatomyZ/${entry.file}`
      );
      if (!response.ok) {
        return LOCAL_RELATIONS[conceptId] || [];
      }

      const text = await response.text();
      for (const line of text.split('\n')) {
        if (!line.trim()) continue;
        const row = JSON.parse(line);
        if (row.concept !== conceptId) continue;
        const values: any[] = row.relations || [];
        return values.map((item) => ({
          source: item.source || '',
          subject: item.subject || '',
          predicate: item.predicate || '',
          object: item.object || '',
          subjectIri: item.subject_iri,
          objectIri: item.object_iri,
          predicateIri: item.predicate_iri,
          direction: item.direction || 'forward',
        }));
      }
    } catch {
      // Fallback to local relations when offline or remote index not yet built
    }
    return LOCAL_RELATIONS[conceptId] || [];
  }

  private async loadIndex(): Promise<Record<string, any>> {
    if (this.index) return this.index;
    const response = await fetch(`${this.baseUrl}/index.json`);
    if (!response.ok) {
      throw new Error(
        `Index des relations AnatomyZ indisponible (${response.status})`
      );
    }
    this.index = await response.json();
    return this.index!;
  }
}

export class AnatomyQuestionBankRepository {
  static instance = new AnatomyQuestionBankRepository();

  private questions: AnatomyExamQuestion[] = [
    {
      id: 'q-heart-basic',
      text: 'Quel organe propulse le sang dans la circulation ?',
      type: ExamQuestionType.Quiz,
      options: ['Le cœur', 'Le foie', 'Le rein', 'Le poumon'],
      correctOptionIndex: 0,
      points: 1,
      conceptId: 'FMA:55675',
      conceptNameFr: 'Cœur',
      conceptNameEn: 'Heart',
      tags: ['cardiovasculaire', 'fonction'],
      difficulty: 1,
    },
    {
      id: 'q-lung-basic',
      text: 'Quel organe est principalement responsable des échanges gazeux pulmonaires ?',
      type: ExamQuestionType.Quiz,
      options: ['Le foie', 'Le poumon', 'Le rein', 'Le cerveau'],
      correctOptionIndex: 1,
      points: 1,
      conceptId: 'FMA:7196',
      conceptNameFr: 'Poumon',
      conceptNameEn: 'Lung',
      tags: ['respiratoire', 'fonction'],
      difficulty: 1,
    },
    {
      id: 'q-liver-basic',
      text: 'Quel organe produit la bile et assure la détoxification métabolique majeure ?',
      type: ExamQuestionType.Quiz,
      options: ['La rate', 'L’estomac', 'Le foie', 'Le pancréas'],
      correctOptionIndex: 2,
      points: 1,
      conceptId: 'FMA:9668',
      conceptNameFr: 'Foie',
      conceptNameEn: 'Liver',
      tags: ['digestif', 'métabolisme'],
      difficulty: 1,
    },
    {
      id: 'q-heart-3d',
      text: 'Identifiez directement l’atrium droit (Right atrium) sur le modèle cardiovasculaire 3D.',
      type: ExamQuestionType.Identify3D,
      options: [],
      points: 2,
      conceptId: 'FMA:55675',
      conceptNameFr: 'Cœur (Atrium droit)',
      conceptNameEn: 'Heart (Right atrium)',
      meshSex: 'male',
      meshFile: 'cardiovascular_male.glb',
      meshNode: 'Right atrium',
      tags: ['cardiovasculaire', '3D'],
      difficulty: 2,
    },
  ];

  get all(): AnatomyExamQuestion[] {
    return [...this.questions];
  }

  add(question: AnatomyExamQuestion): void {
    this.questions.push(question);
  }
}

export class AnatomyExamRepository {
  static instance = new AnatomyExamRepository();

  private examsList: AnatomyExam[] = [
    {
      id: 'demo-cardiovascular',
      title: 'Évaluation Clinique — Système Cardiovasculaire & Grands Vaisseaux',
      description: 'Anatomie du myocarde, vascularisation coronaire et anatomie topographique médiastinale.',
      durationMinutes: 30,
      hideAnatomy: true,
      targetSystem: 'Cardiovasculaire',
      isPublished: true,
      targetCohort: 'DFGSM 2',
      passingScore: 12,
      questions: [
        {
          id: 'q1',
          text: 'Quel organe musculaire creux assure la propulsion systémique du sang dans la grande circulation ?',
          type: ExamQuestionType.Quiz,
          options: ['Le ventricule gauche et le myocarde', 'Le foie lobulaire', 'Le diaphragme thoraco-abdominal', 'La rate hémo-lymphatique'],
          correctOptionIndex: 0,
          points: 2,
          conceptId: 'FMA:55675',
          conceptNameFr: 'Cœur',
          conceptNameEn: 'Heart',
          tags: ['cardiovasculaire', 'myocarde'],
          difficulty: 1,
        },
        {
          id: 'q2',
          text: 'Quel est le tronc artériel principal émergeant du ventricule gauche au-dessus des valves sigmoïdes ?',
          type: ExamQuestionType.Question,
          options: [],
          expectedAnswer: 'Aorte',
          points: 2,
          conceptId: 'FMA:3734',
          conceptNameFr: 'Aorte',
          conceptNameEn: 'Aorta',
          tags: ['cardiovasculaire', 'artères'],
          difficulty: 1,
        },
        {
          id: 'q3',
          text: 'Identifier l’oreillette droite (atrium droit) recevant le sang désoxygéné par les veines caves.',
          type: ExamQuestionType.Identify3D,
          options: ['Atrium droit', 'Atrium gauche', 'Ventricule droit', 'Tronc pulmonaire'],
          correctOptionIndex: 0,
          points: 3,
          conceptId: 'FMA:7098',
          conceptNameFr: 'Atrium droit',
          conceptNameEn: 'Right atrium',
          meshSex: 'male',
          meshFile: 'cardiovascular_male.glb',
          meshNode: 'Right atrium',
          tags: ['cardiovasculaire', '3D', 'oreillette'],
          difficulty: 2,
        },
      ],
    },
    {
      id: 'demo-neuro',
      title: 'Neuro-anatomie — Tronc Cérébral & Nerfs Crâniens',
      description: 'Émergence des paires crâniennes, foramen jugulaire et étage moyen de la base du crâne.',
      durationMinutes: 45,
      hideAnatomy: false,
      targetSystem: 'Nerveux',
      isPublished: true,
      targetCohort: 'DFGSM 2',
      passingScore: 10,
      questions: [
        {
          id: 'qn1',
          text: 'Quel nerf crânien traverse le foramen ovale de la grande aile du sphénoïde ?',
          type: ExamQuestionType.Quiz,
          options: ['Nerf mandibulaire (V3)', 'Nerf maxillaire (V2)', 'Nerf ophtalmique (V1)', 'Nerf facial (VII)'],
          correctOptionIndex: 0,
          points: 2,
          conceptId: 'FMA:52627',
          conceptNameFr: 'Nerf mandibulaire (V3)',
          conceptNameEn: 'Mandibular nerve',
          tags: ['neuro', 'base-du-crane'],
          difficulty: 2,
        },
        {
          id: 'qn2',
          text: 'Quel nerf crânien émerge de la face postérieure du tronc cérébral (sous les colliculi inférieurs) ?',
          type: ExamQuestionType.Quiz,
          options: ['Nerf trochléaire (IV)', 'Nerf abducens (VI)', 'Nerf oculomoteur (III)', 'Nerf trijumeau (V)'],
          correctOptionIndex: 0,
          points: 2,
          conceptId: 'FMA:52625',
          conceptNameFr: 'Nerf trochléaire (IV)',
          conceptNameEn: 'Trochlear nerve',
          tags: ['neuro', 'tronc-cerebral'],
          difficulty: 3,
        },
      ],
    },
    {
      id: 'demo-osteo',
      title: 'Ostéologie & Biomécanique du Rachis',
      description: 'Morphologie des vertèbres cervicales, jonction cervico-occipitale et courbures physiologiques.',
      durationMinutes: 25,
      hideAnatomy: true,
      targetSystem: 'Squelettique',
      isPublished: true,
      targetCohort: 'DFGSM 2',
      passingScore: 10,
      questions: [
        {
          id: 'qo1',
          text: 'Quelle vertèbre cervicale est caractérisée par son apophyse odontoïde (dent de l’axis) ?',
          type: ExamQuestionType.Quiz,
          options: ['Axis (C2)', 'Atlas (C1)', 'Vertèbre proéminente (C7)', 'C3'],
          correctOptionIndex: 0,
          points: 2,
          conceptId: 'FMA:13478',
          conceptNameFr: 'Axis (C2)',
          conceptNameEn: 'Axis',
          tags: ['osteo', 'rachis'],
          difficulty: 1,
        },
        {
          id: 'qo2',
          text: 'Quel foramen vertébral est traversé par les artères vertébrales dans le rachis cervical ?',
          type: ExamQuestionType.Quiz,
          options: ['Foramen transversaire', 'Foramen intervertébral', 'Foramen magnum', 'Canal sacré'],
          correctOptionIndex: 0,
          points: 2,
          conceptId: 'FMA:13480',
          conceptNameFr: 'Foramen transversaire',
          conceptNameEn: 'Transverse foramen',
          tags: ['osteo', 'cervical'],
          difficulty: 2,
        },
      ],
    },
    {
      id: 'demo-viscera',
      title: 'Splanchnologie — Viscères Abdominaux & Péritoine',
      description: 'Anatomie hépatique, carrefour biliopancréatique et rétro-cavité des épiploons.',
      durationMinutes: 40,
      hideAnatomy: false,
      targetSystem: 'Digestif',
      isPublished: false,
      targetCohort: 'DFGSM 3',
      passingScore: 12,
      questions: [
        {
          id: 'qv1',
          text: 'Quelles sont les trois branches principales issues directement du tronc cœliaque ?',
          type: ExamQuestionType.Quiz,
          options: [
            'Artère gastrique gauche, artère hépatique commune, artère splénique',
            'Artère mésentérique supérieure, artère rénale gauche, aorte',
            'Artère iliaque commune, artère cystique, artère hépatique propre',
            'Artère gastro-duodénale, artère splénique, artère phrénique'
          ],
          correctOptionIndex: 0,
          points: 3,
          conceptId: 'FMA:14757',
          conceptNameFr: 'Tronc cœliaque',
          conceptNameEn: 'Celiac trunk',
          tags: ['digestif', 'vaisseaux'],
          difficulty: 2,
        },
      ],
    },
  ];

  get exams(): AnatomyExam[] {
    return [...this.examsList];
  }

  add(exam: AnatomyExam): void {
    this.examsList.unshift(exam);
  }

  update(exam: AnatomyExam): void {
    const idx = this.examsList.findIndex((e) => e.id === exam.id);
    if (idx !== -1) {
      this.examsList[idx] = exam;
    } else {
      this.examsList.unshift(exam);
    }
  }

  delete(id: string): void {
    this.examsList = this.examsList.filter((e) => e.id !== id);
  }
}

export class AcademicRepository {
  static instance = new AcademicRepository();

  private classes: AnatomyClass[] = [
    {
      id: 'class-demo',
      name: 'Anatomie humaine — L1',
      professorId: 'prof-demo',
      description: 'Classe de démonstration AnatomyZ.',
      studentIds: ['student-demo'],
    },
  ];

  private students: AnatomyStudent[] = [
    {
      id: 'student-demo',
      name: 'Étudiant démonstration',
      email: 'student@anatomyz.local',
      classIds: ['class-demo'],
    },
  ];

  private assignments: AnatomyExamAssignment[] = [
    {
      id: 'assign-demo-1',
      examId: 'demo-cardiovascular',
      classId: 'class-demo',
      studentId: 'student-demo',
      assignedAt: new Date(),
      status: ExamAssignmentStatus.Assigned,
    },
  ];

  private results: AnatomyExamResult[] = [
    {
      id: 'res-demo-1',
      examId: 'osteo-l1',
      assignmentId: 'assign-osteo-1',
      studentId: 'student-demo',
      submittedAt: new Date(Date.now() - 86400 * 1000 * 14),
      score: 14,
      maxScore: 20,
      percentage: 70.0,
      questionScores: { q1: 14 },
    },
    {
      id: 'res-demo-2',
      examId: 'respiratory-l1',
      assignmentId: 'assign-resp-1',
      studentId: 'student-demo',
      submittedAt: new Date(Date.now() - 86400 * 1000 * 7),
      score: 16,
      maxScore: 20,
      percentage: 80.0,
      questionScores: { q1: 16 },
    },
    {
      id: 'res-demo-3',
      examId: 'digestive-l1',
      assignmentId: 'assign-dig-1',
      studentId: 'student-demo',
      submittedAt: new Date(Date.now() - 86400 * 1000 * 2),
      score: 18,
      maxScore: 20,
      percentage: 90.0,
      questionScores: { q1: 18 },
    },
  ];
  private history: AnatomyHistoryEntry[] = [
    {
      id: 'hist-1',
      studentId: 'student-demo',
      type: AnatomyHistoryType.Atlas,
      title: 'Exploration de l’atlas 3D — Système cardiovasculaire',
      occurredAt: new Date(Date.now() - 3600 * 1000 * 2),
    },
  ];

  classesForProfessor(professorId: string): AnatomyClass[] {
    return this.classes.filter((item) => item.professorId === professorId);
  }

  studentsForClass(classId: string): AnatomyStudent[] {
    const classItem = this.classes.find((item) => item.id === classId);
    if (!classItem) return [];
    return this.students.filter((s) => classItem.studentIds.includes(s.id));
  }

  assignmentsForStudent(studentId: string): AnatomyExamAssignment[] {
    return this.assignments.filter((item) => item.studentId === studentId);
  }

  resultsForStudent(studentId: string): AnatomyExamResult[] {
    return this.results.filter((item) => item.studentId === studentId);
  }

  historyForStudent(studentId: string): AnatomyHistoryEntry[] {
    return this.history.filter((item) => item.studentId === studentId);
  }

  assignExam(assignment: AnatomyExamAssignment): void {
    this.assignments.push(assignment);
  }

  markAssignmentSubmitted(examId: string, studentId: string): void {
    this.assignments = this.assignments.map((a) =>
      a.examId === examId && a.studentId === studentId
        ? { ...a, status: ExamAssignmentStatus.Submitted }
        : a
    );
  }

  addResult(result: AnatomyExamResult): void {
    this.results.unshift(result);
  }

  addHistory(entry: AnatomyHistoryEntry): void {
    this.history.unshift(entry);
  }
}

export function gradeForPercentage(value: number): string {
  if (value >= 90) return 'A';
  if (value >= 80) return 'B';
  if (value >= 70) return 'C';
  if (value >= 60) return 'D';
  return 'F';
}
