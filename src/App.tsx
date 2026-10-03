import React, { useEffect, useRef, useState } from 'react';
import {
  ArrowLeft,
  BookOpen,
  Box,
  CheckCircle2,
  ChevronRight,
  Clock,
  Eye,
  EyeOff,
  FilePlus,
  FileText,
  GraduationCap,
  History,
  Info,
  Layers,
  Lock,
  Menu,
  Microscope,
  Plus,
  RotateCcw,
  Search,
  Sparkles,
  User,
  Users,
  X,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import {
  AcademicRepository,
  AnatomyCatalogRepository,
  AnatomyExamRepository,
  AnatomyModelRepository,
  AnatomyQuestionBankRepository,
  RemoteAnatomyCatalogRepository,
  RemoteAnatomyRelationRepository,
  gradeForPercentage,
} from './data/repositories';
import {
  Interactive3DControllerHandle,
  Interactive3DViewer,
} from './components/Interactive3DViewer';
import {
  AnatomyExam,
  AnatomyExamQuestion,
  AnatomyHistoryType,
  AnatomyRelation,
  AnatomyRole,
  AnatomySex,
  AnatomyStructure,
  AnatomySystemInfo,
  EntityData,
  ExamAssignmentStatus,
  ExamQuestionType,
} from './types';

type ScreenState =
  | { name: 'role_selection' }
  | { name: 'role_home'; role: AnatomyRole }
  | { name: 'anatomy_home' }
  | { name: 'academic_dashboard'; role: AnatomyRole }
  | { name: 'professor_exam_editor'; showExisting: boolean }
  | { name: 'student_exam_list' }
  | { name: 'student_exam'; exam: AnatomyExam };

export function App() {
  const [historyStack, setHistoryStack] = useState<ScreenState[]>([
    { name: 'role_selection' },
  ]);

  const currentScreen = historyStack[historyStack.length - 1];

  const pushScreen = (next: ScreenState) => {
    setHistoryStack((prev) => [...prev, next]);
  };

  const popScreen = () => {
    setHistoryStack((prev) => (prev.length > 1 ? prev.slice(0, -1) : prev));
  };

  return (
    <div className="min-h-screen bg-[#08111f] text-[#eef4ff] flex flex-col">
      {currentScreen.name === 'role_selection' && (
        <RoleSelectionScreen
          onSelectRole={(role) => pushScreen({ name: 'role_home', role })}
          onOpenAtlas={() => pushScreen({ name: 'anatomy_home' })}
        />
      )}

      {currentScreen.name === 'role_home' && (
        <RoleHomeScreen
          role={currentScreen.role}
          onBack={popScreen}
          onNavigate={pushScreen}
        />
      )}

      {currentScreen.name === 'anatomy_home' && (
        <AnatomyHomeScreen onBack={popScreen} />
      )}

      {currentScreen.name === 'academic_dashboard' && (
        <AcademicDashboardScreen
          role={currentScreen.role}
          onBack={popScreen}
          onStartExam={(exam) => pushScreen({ name: 'student_exam', exam })}
        />
      )}

      {currentScreen.name === 'professor_exam_editor' && (
        <ProfessorExamEditorScreen
          showExisting={currentScreen.showExisting}
          onBack={popScreen}
        />
      )}

      {currentScreen.name === 'student_exam_list' && (
        <StudentExamListScreen
          onBack={popScreen}
          onSelectExam={(exam) => pushScreen({ name: 'student_exam', exam })}
        />
      )}

      {currentScreen.name === 'student_exam' && (
        <StudentExamScreen
          exam={currentScreen.exam}
          onFinish={() => {
            setHistoryStack((prev) =>
              prev.length > 1 ? prev.slice(0, -1) : prev
            );
          }}
        />
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* 1. Role Selection Screen                                                   */
/* -------------------------------------------------------------------------- */

function RoleSelectionScreen({
  onSelectRole,
  onOpenAtlas,
}: {
  onSelectRole: (role: AnatomyRole) => void;
  onOpenAtlas: () => void;
}) {
  return (
    <div className="flex-1 flex flex-col">
      <header className="border-b border-[#203651] bg-[#0d1a2b]/80 backdrop-blur-md px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Microscope className="w-6 h-6 text-[#8fc5ff]" />
          <span className="font-bold text-lg tracking-tight">AnatomyZ</span>
          <span className="hidden sm:inline-block text-xs px-2.5 py-0.5 rounded-full border border-[#2c4a70] text-[#8fc5ff]">
            Human 3D Anatomy
          </span>
        </div>
        <button
          type="button"
          onClick={onOpenAtlas}
          className="inline-flex items-center gap-2 text-sm font-medium px-3.5 py-1.5 rounded-lg border border-[#2c4a70] bg-[#12243b] text-[#8fc5ff] hover:bg-[#193150] transition cursor-pointer"
        >
          <Box className="w-4 h-4" />
          Atlas 3D direct
        </button>
      </header>

      <main className="flex-1 max-w-4xl w-full mx-auto px-6 py-12 flex flex-col justify-center">
        <div className="text-center mb-10">
          <div className="w-16 h-16 rounded-2xl bg-[#0d1a2b] border border-[#2c4a70] flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Microscope className="w-9 h-9 text-[#8fc5ff]" />
          </div>
          <span className="inline-block px-3.5 py-1 text-xs font-medium border border-[#2c4a70] rounded-full text-[#8fc5ff] mb-3">
            AnatomyZ · Atlas Anatomique Humain 3D
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight mb-3">
            Choisissez votre rôle
          </h1>
          <p className="text-[#b8c7da] max-w-2xl mx-auto text-base sm:text-lg leading-relaxed">
            Un atlas anatomique humain 3D construit autour d’un Knowledge Graph
            anatomique, des ontologies FMA/UBERON et de modèles GLB/GLTF vérifiés
            progressivement.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-4 max-w-2xl mx-auto w-full mb-10">
          <button
            type="button"
            onClick={() => onSelectRole(AnatomyRole.Professor)}
            className="text-left p-6 rounded-2xl border border-[#203651] bg-[#0d1a2b] hover:border-[#8fc5ff] hover:bg-[#112238] transition flex items-center gap-4 group cursor-pointer"
          >
            <div className="w-12 h-12 rounded-xl bg-indigo-500/15 border border-indigo-400/30 flex items-center justify-center text-[#8fc5ff] shrink-0">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-bold text-[#eef4ff] group-hover:text-[#8fc5ff] transition">
                Professeur
              </h2>
              <p className="text-sm text-[#b8c7da]">
                Créer des quiz et des questions d’examen
              </p>
            </div>
            <ChevronRight className="w-5 h-5 text-[#71839b] group-hover:text-[#8fc5ff] transition" />
          </button>

          <button
            type="button"
            onClick={() => onSelectRole(AnatomyRole.Student)}
            className="text-left p-6 rounded-2xl border border-[#203651] bg-[#0d1a2b] hover:border-[#8fc5ff] hover:bg-[#112238] transition flex items-center gap-4 group cursor-pointer"
          >
            <div className="w-12 h-12 rounded-xl bg-indigo-500/15 border border-indigo-400/30 flex items-center justify-center text-[#8fc5ff] shrink-0">
              <User className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-bold text-[#eef4ff] group-hover:text-[#8fc5ff] transition">
                Étudiant
              </h2>
              <p className="text-sm text-[#b8c7da]">
                Consulter les examens et les passer
              </p>
            </div>
            <ChevronRight className="w-5 h-5 text-[#71839b] group-hover:text-[#8fc5ff] transition" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl border border-[#203651] bg-[#0d1a2b]">
            <h3 className="font-semibold text-[#eef4ff] mb-1">🧠 Knowledge Graph</h3>
            <p className="text-sm text-[#b8c7da]">
              Structures, synonymes et relations anatomiques FMA/UBERON.
            </p>
          </div>
          <div className="p-5 rounded-2xl border border-[#203651] bg-[#0d1a2b]">
            <h3 className="font-semibold text-[#eef4ff] mb-1">🦴 3D Anatomy</h3>
            <p className="text-sm text-[#b8c7da]">
              Modèles GLB/GLTF, sélection, visibilité et matériaux.
            </p>
          </div>
          <div className="p-5 rounded-2xl border border-[#203651] bg-[#0d1a2b]">
            <h3 className="font-semibold text-[#eef4ff] mb-1">🔗 Mapping Engine</h3>
            <p className="text-sm text-[#b8c7da]">
              Correspondances exactes, xrefs et mappings vérifiés.
            </p>
          </div>
          <div className="p-5 rounded-2xl border border-[#203651] bg-[#0d1a2b]">
            <h3 className="font-semibold text-[#eef4ff] mb-1">🎓 Education</h3>
            <p className="text-sm text-[#b8c7da]">
              Professeur, étudiant, quiz, questions et mode examen sécurisé.
            </p>
          </div>
        </div>

        <footer className="mt-12 text-center text-sm text-[#71839b]">
          Projet académique — Professeur Zenasni Kamel
        </footer>
      </main>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* 2. Role Home Screen                                                        */
/* -------------------------------------------------------------------------- */

function RoleHomeScreen({
  role,
  onBack,
  onNavigate,
}: {
  role: AnatomyRole;
  onBack: () => void;
  onNavigate: (screen: ScreenState) => void;
}) {
  const isProf = role === AnatomyRole.Professor;
  const labelFr = isProf ? 'Professeur' : 'Étudiant';

  return (
    <div className="flex-1 flex flex-col">
      <header className="border-b border-[#203651] bg-[#0d1a2b] px-6 py-4 flex items-center gap-3">
        <button
          type="button"
          onClick={onBack}
          className="p-2 rounded-lg hover:bg-[#162a45] text-[#b8c7da] hover:text-white transition cursor-pointer"
          title="Retour"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="font-bold text-lg">AnatomyZ — {labelFr}</h1>
      </header>

      <main className="max-w-2xl w-full mx-auto p-6 space-y-4">
        <div className="p-5 rounded-2xl border border-[#203651] bg-[#0d1a2b] flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-500/15 border border-indigo-400/30 flex items-center justify-center text-[#8fc5ff]">
            {isProf ? <GraduationCap className="w-6 h-6" /> : <User className="w-6 h-6" />}
          </div>
          <div>
            <h2 className="font-bold text-lg">{labelFr}</h2>
            <p className="text-sm text-[#b8c7da]">
              {isProf ? 'Créer et gérer des examens' : 'Passer les examens assignés'}
            </p>
          </div>
        </div>

        <div className="space-y-3 pt-2">
          <button
            type="button"
            onClick={() => onNavigate({ name: 'academic_dashboard', role })}
            className="w-full py-3.5 px-5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold flex items-center justify-center gap-2.5 transition cursor-pointer"
          >
            <Layers className="w-5 h-5" />
            {isProf ? 'Espace professeur' : 'Mon espace étudiant'}
          </button>

          {isProf ? (
            <>
              <button
                type="button"
                onClick={() =>
                  onNavigate({ name: 'professor_exam_editor', showExisting: false })
                }
                className="w-full py-3.5 px-5 rounded-xl bg-indigo-600/90 hover:bg-indigo-500 text-white font-semibold flex items-center justify-center gap-2.5 transition cursor-pointer"
              >
                <FilePlus className="w-5 h-5" />
                Créer un examen
              </button>
              <button
                type="button"
                onClick={() =>
                  onNavigate({ name: 'professor_exam_editor', showExisting: true })
                }
                className="w-full py-3.5 px-5 rounded-xl border border-[#2c4a70] bg-[#0d1a2b] hover:bg-[#142740] text-[#8fc5ff] font-semibold flex items-center justify-center gap-2.5 transition cursor-pointer"
              >
                <FileText className="w-5 h-5" />
                Mes examens
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => onNavigate({ name: 'student_exam_list' })}
              className="w-full py-3.5 px-5 rounded-xl bg-indigo-600/90 hover:bg-indigo-500 text-white font-semibold flex items-center justify-center gap-2.5 transition cursor-pointer"
            >
              <FileText className="w-5 h-5" />
              Examens disponibles
            </button>
          )}

          <button
            type="button"
            onClick={() => onNavigate({ name: 'anatomy_home' })}
            className="w-full py-3.5 px-5 rounded-xl border border-[#2c4a70] bg-[#0d1a2b] hover:bg-[#142740] text-[#eef4ff] font-semibold flex items-center justify-center gap-2.5 transition cursor-pointer"
          >
            <Box className="w-5 h-5 text-[#8fc5ff]" />
            Explorer l’atlas anatomique
          </button>
        </div>
      </main>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* 3. Anatomy Home Screen (3D Atlas + Knowledge Graph Catalog + Relations)    */
/* -------------------------------------------------------------------------- */

const modelRepo = new AnatomyModelRepository();
const localCatalog = new AnatomyCatalogRepository();
const remoteCatalog = new RemoteAnatomyCatalogRepository();
const relationRepo = new RemoteAnatomyRelationRepository();

function AnatomyHomeScreen({ onBack }: { onBack: () => void }) {
  const viewerControllerRef = useRef<Interactive3DControllerHandle | null>(null);

  const [sex, setSex] = useState<AnatomySex>(AnatomySex.Male);
  const [selectedSystem, setSelectedSystem] = useState<AnatomySystemInfo | null>(
    modelRepo.systems.find((s) => s.id === 'cardiovascular') || null
  );
  const [selectedEntity, setSelectedEntity] = useState<EntityData | null>(null);
  const [selectedStructure, setSelectedStructure] =
    useState<AnatomyStructure | null>(null);
  const [structureModal, setStructureModal] = useState<AnatomyStructure | null>(
    null
  );
  const [relations, setRelations] = useState<AnatomyRelation[]>([]);
  const [relationsLoading, setRelationsLoading] = useState<boolean>(false);

  const [systemQuery, setSystemQuery] = useState<string>('');
  const [structureQuery, setStructureQuery] = useState<string>('');
  const [remoteResults, setRemoteResults] = useState<AnatomyStructure[]>([]);
  const [remoteLoading, setRemoteLoading] = useState<boolean>(false);
  const [remoteError, setRemoteError] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState<boolean>(true);

  useEffect(() => {
    const q = structureQuery.trim();
    if (q.length < 2) {
      setRemoteResults([]);
      setRemoteLoading(false);
      setRemoteError(null);
      return;
    }

    setRemoteLoading(true);
    setRemoteError(null);
    const timer = setTimeout(async () => {
      try {
        const res = await remoteCatalog.search(q);
        setRemoteResults(res);
        setRemoteLoading(false);
      } catch {
        setRemoteResults([]);
        setRemoteLoading(false);
        setRemoteError('Catalogue distant indisponible');
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [structureQuery]);

  const mergedStructureResults = (): AnatomyStructure[] => {
    const q = structureQuery.trim();
    if (!q) return localCatalog.all;
    const local = localCatalog.search(q);
    const map = new Map<string, AnatomyStructure>();
    local.forEach((item) => map.set(item.id, item));
    remoteResults.forEach((item) => map.set(item.id, item));
    return Array.from(map.values()).slice(0, 80);
  };

  const meshNodeFor = (structure: AnatomyStructure): string | null => {
    for (const variant of structure.meshVariants) {
      if (variant.sex === sex && variant.node) {
        return variant.node;
      }
    }
    if (structure.meshSex === sex && structure.meshNode) {
      return structure.meshNode;
    }
    return null;
  };

  const openStructureSheet = async (structure: AnatomyStructure) => {
    setSelectedStructure(structure);
    setStructureModal(structure);
    setRelationsLoading(true);
    const rels = await relationRepo.forConcept(structure.id);
    setRelations(rels);
    setRelationsLoading(false);

    // Also switch to the structure's system if a 3D model is available
    const sysMatch = modelRepo.systems.find((s) => s.id === structure.system);
    if (sysMatch && modelRepo.hasModel(sysMatch.id, sex)) {
      setSelectedSystem(sysMatch);
    }
  };

  const activeModel = selectedSystem
    ? modelRepo.modelFor(selectedSystem, sex)
    : null;

  const filteredSystems = modelRepo.systems.filter((sys) => {
    const q = systemQuery.trim().toLowerCase();
    return (
      !q ||
      sys.nameFr.toLowerCase().includes(q) ||
      sys.nameEn.toLowerCase().includes(q)
    );
  });

  return (
    <div className="flex-1 flex flex-col h-screen overflow-hidden">
      {/* Top App Bar */}
      <header className="border-b border-[#203651] bg-[#0d1a2b] px-4 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onBack}
            className="p-2 rounded-lg hover:bg-[#162a45] text-[#b8c7da] hover:text-white transition cursor-pointer"
            title="Retour"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={() => setDrawerOpen((o) => !o)}
            className="p-2 rounded-lg hover:bg-[#162a45] text-[#8fc5ff] transition cursor-pointer"
            title="Catalogue & Systèmes"
          >
            <Menu className="w-5 h-5" />
          </button>
          <span className="font-bold text-lg ml-1">AnatomyZ — Atlas 3D</span>
        </div>

        {/* Male / Female Segmented Button */}
        <div className="inline-flex rounded-xl border border-[#2c4a70] bg-[#08111f] p-1">
          <button
            type="button"
            onClick={() => {
              setSex(AnatomySex.Male);
              setSelectedEntity(null);
              if (
                selectedSystem &&
                !modelRepo.hasModel(selectedSystem.id, AnatomySex.Male)
              ) {
                setSelectedSystem(null);
              }
            }}
            className={`px-3.5 py-1 rounded-lg text-sm font-semibold transition cursor-pointer ${
              sex === AnatomySex.Male
                ? 'bg-indigo-600 text-white'
                : 'text-[#b8c7da] hover:text-white'
            }`}
          >
            ♂ Homme
          </button>
          <button
            type="button"
            onClick={() => {
              setSex(AnatomySex.Female);
              setSelectedEntity(null);
              if (
                selectedSystem &&
                !modelRepo.hasModel(selectedSystem.id, AnatomySex.Female)
              ) {
                setSelectedSystem(null);
              }
            }}
            className={`px-3.5 py-1 rounded-lg text-sm font-semibold transition cursor-pointer ${
              sex === AnatomySex.Female
                ? 'bg-indigo-600 text-white'
                : 'text-[#b8c7da] hover:text-white'
            }`}
          >
            ♀ Femme
          </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden relative">
        {/* Sidebar / Drawer */}
        {drawerOpen && (
          <aside className="w-80 sm:w-96 border-r border-[#203651] bg-[#0d1a2b] flex flex-col h-full overflow-y-auto shrink-0 z-20">
            <div className="p-4 space-y-3 border-b border-[#203651]">
              <div className="relative">
                <Search className="w-4 h-4 text-[#71839b] absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={systemQuery}
                  onChange={(e) => setSystemQuery(e.target.value)}
                  placeholder="Rechercher un système…"
                  className="w-full pl-10 pr-3 py-2 rounded-xl bg-[#08111f] border border-[#203651] text-sm text-[#eef4ff] placeholder-[#71839b] focus:outline-hidden focus:border-[#8fc5ff]"
                />
              </div>

              <div className="relative">
                <Search className="w-4 h-4 text-[#8fc5ff] absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={structureQuery}
                  onChange={(e) => setStructureQuery(e.target.value)}
                  placeholder="Rechercher une structure (FR / EN / ID)…"
                  className="w-full pl-10 pr-3 py-2 rounded-xl bg-[#08111f] border border-[#203651] text-sm text-[#eef4ff] placeholder-[#71839b] focus:outline-hidden focus:border-[#8fc5ff]"
                />
              </div>

              {remoteLoading && (
                <div className="text-xs text-[#8fc5ff] animate-pulse">
                  Recherche dans le catalogue FMA/UBERON…
                </div>
              )}
              {remoteError && (
                <div className="text-xs text-amber-300">
                  {remoteError} • résultats locaux conservés
                </div>
              )}
            </div>

            {/* Structure search results */}
            <div className="px-4 pt-3 pb-2 border-b border-[#203651]">
              <div className="text-xs font-bold uppercase tracking-wider text-[#8fc5ff] mb-2">
                Structures anatomiques ({mergedStructureResults().length})
              </div>
              <div className="max-h-52 overflow-y-auto space-y-1 pr-1">
                {mergedStructureResults()
                  .slice(0, 40)
                  .map((structure) => (
                    <button
                      key={structure.id}
                      type="button"
                      onClick={() => openStructureSheet(structure)}
                      className="w-full text-left px-3 py-2 rounded-xl hover:bg-[#152842] transition flex items-center justify-between gap-2 cursor-pointer"
                    >
                      <div className="min-w-0">
                        <div className="text-sm font-semibold text-[#eef4ff] truncate">
                          {structure.nameFr}
                        </div>
                        <div className="text-xs text-[#71839b] truncate">
                          {structure.nameEn} • {structure.id}
                        </div>
                      </div>
                      <span
                        className={`text-[11px] px-2 py-0.5 rounded-full shrink-0 ${
                          structure.meshAvailable
                            ? 'bg-indigo-500/20 text-[#8fc5ff] border border-indigo-400/30'
                            : 'bg-[#122238] text-[#71839b]'
                        }`}
                      >
                        {structure.meshAvailable ? '3D' : 'Catalogue'}
                      </span>
                    </button>
                  ))}
              </div>
            </div>

            {/* Systems list */}
            <div className="p-4 flex-1">
              <div className="text-xs font-bold uppercase tracking-wider text-[#8fc5ff] mb-2">
                Systèmes anatomiques 3D
              </div>
              <div className="space-y-1">
                {filteredSystems.map((system) => {
                  const available = modelRepo.hasModel(system.id, sex);
                  const isSelected = selectedSystem?.id === system.id;
                  return (
                    <button
                      key={system.id}
                      type="button"
                      disabled={!available}
                      onClick={() => {
                        setSelectedSystem(system);
                        setSelectedEntity(null);
                      }}
                      className={`w-full text-left px-3.5 py-2.5 rounded-xl transition flex items-center gap-3 ${
                        !available
                          ? 'opacity-40 cursor-not-allowed'
                          : isSelected
                          ? 'bg-indigo-600 text-white shadow-xs cursor-pointer'
                          : 'hover:bg-[#152842] text-[#eef4ff] cursor-pointer'
                      }`}
                    >
                      <Box className="w-4 h-4 shrink-0" />
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-semibold truncate">
                          {system.nameFr}
                        </div>
                        <div
                          className={`text-xs truncate ${
                            isSelected ? 'text-indigo-100' : 'text-[#71839b]'
                          }`}
                        >
                          {available
                            ? system.nameEn
                            : `${system.nameEn} • 3D asset unavailable`}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </aside>
        )}

        {/* Main 3D Viewer Area */}
        <main className="flex-1 flex flex-col bg-[#06090e] overflow-hidden">
          {!selectedSystem || !activeModel ? (
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
              <Box className="w-12 h-12 text-[#8fc5ff] mb-3" />
              <h2 className="text-xl font-bold mb-2">
                Sélectionnez un système anatomique
              </h2>
              <p className="text-sm text-[#b8c7da] mb-5 max-w-md">
                Choisissez un système dans le panneau latéral pour charger son
                modèle GLB 3D interactif.
              </p>
              <button
                type="button"
                onClick={() => setDrawerOpen(true)}
                className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold inline-flex items-center gap-2 cursor-pointer"
              >
                <Layers className="w-4 h-4" />
                Explorer les systèmes
              </button>
            </div>
          ) : (
            <>
              {/* Viewer Toolbar */}
              <div className="bg-[#0d1a2b] border-b border-[#203651] px-4 py-2.5 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="font-bold text-sm sm:text-base text-[#eef4ff]">
                    {activeModel.system.nameFr}
                  </div>
                  <div className="text-xs text-[#8fc5ff]">
                    {activeModel.system.nameEn} •{' '}
                    {activeModel.sex === AnatomySex.Male ? 'Male' : 'Female'}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      viewerControllerRef.current?.setCameraZoomLevel(0.85)
                    }
                    className="p-2 rounded-lg border border-[#203651] bg-[#122238] hover:bg-[#192f4d] text-[#eef4ff] transition cursor-pointer"
                    title="Zoom arrière"
                  >
                    <ZoomOut className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      viewerControllerRef.current?.setCameraZoomLevel(1.35)
                    }
                    className="p-2 rounded-lg border border-[#203651] bg-[#122238] hover:bg-[#192f4d] text-[#eef4ff] transition cursor-pointer"
                    title="Zoom avant"
                  >
                    <ZoomIn className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      viewerControllerRef.current?.clearSelections();
                      viewerControllerRef.current?.resetAllMaterialOverrides();
                      setSelectedEntity(null);
                    }}
                    className="px-3 py-1.5 rounded-lg border border-[#203651] bg-[#122238] hover:bg-[#192f4d] text-xs font-medium text-[#eef4ff] inline-flex items-center gap-1.5 transition cursor-pointer"
                    title="Réinitialiser"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Réinitialiser
                  </button>
                </div>
              </div>

              {/* Selected entity controls */}
              {selectedEntity && (
                <div className="bg-[#102036] border-b border-[#203651] px-4 py-2 flex flex-wrap items-center justify-center gap-2">
                  <span className="text-xs font-semibold text-[#8fc5ff] mr-2">
                    Sélection : {selectedEntity.name}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      viewerControllerRef.current?.setPartVisibility(
                        selectedEntity.name,
                        false
                      )
                    }
                    className="px-2.5 py-1 rounded-lg border border-[#2c4a70] text-xs font-medium hover:bg-[#172e4d] inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <EyeOff className="w-3.5 h-3.5" />
                    Masquer
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      viewerControllerRef.current?.setPartVisibility(
                        selectedEntity.name,
                        true
                      )
                    }
                    className="px-2.5 py-1 rounded-lg border border-[#2c4a70] text-xs font-medium hover:bg-[#172e4d] inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    Afficher
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      viewerControllerRef.current?.setEntityTransparency(
                        selectedEntity.name
                      )
                    }
                    className="px-2.5 py-1 rounded-lg border border-[#2c4a70] text-xs font-medium hover:bg-[#172e4d] inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    Transparence
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      viewerControllerRef.current?.resetEntityMaterial(
                        selectedEntity.name
                      )
                    }
                    className="px-2.5 py-1 rounded-lg border border-[#2c4a70] text-xs font-medium hover:bg-[#172e4d] inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Matériau original
                  </button>
                </div>
              )}

              {/* 3D Canvas */}
              <div className="flex-1 relative">
                <Interactive3DViewer
                  key={`${activeModel.url}|${
                    selectedStructure ? meshNodeFor(selectedStructure) ?? '' : ''
                  }`}
                  modelUrl={activeModel.url}
                  controllerRef={viewerControllerRef}
                  preselectedEntityName={
                    selectedStructure ? meshNodeFor(selectedStructure) : null
                  }
                  onSelectionChanged={(entities) => {
                    setSelectedEntity(
                      entities.length === 0
                        ? null
                        : entities[entities.length - 1]
                    );
                  }}
                />
              </div>

              {/* Footer status hint */}
              <div className="bg-[#0d1a2b] border-t border-[#203651] px-4 py-2 text-center text-xs text-[#b8c7da]">
                {selectedEntity ? (
                  <span className="font-bold text-[#8fc5ff]">
                    Structure sélectionnée : {selectedEntity.name}
                  </span>
                ) : (
                  'Cliquez sur une structure anatomique • molette pour zoomer • glissez pour tourner/déplacer'
                )}
              </div>
            </>
          )}
        </main>

        {/* Structure Knowledge Graph Sheet / Modal */}
        {structureModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-4 z-50">
            <div className="bg-[#0d1a2b] border border-[#2c4a70] rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-2xl font-extrabold text-[#eef4ff]">
                    {structureModal.nameFr}
                  </h3>
                  <p className="text-base text-[#8fc5ff]">
                    {structureModal.nameEn}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setStructureModal(null)}
                  className="p-1.5 rounded-lg hover:bg-[#182d4a] text-[#b8c7da] cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="text-sm space-y-1 text-[#b8c7da] bg-[#08111f] p-3.5 rounded-xl border border-[#203651]">
                <div>
                  <span className="font-semibold text-[#eef4ff]">ID :</span>{' '}
                  {structureModal.id}
                </div>
                <div>
                  <span className="font-semibold text-[#eef4ff]">Système :</span>{' '}
                  {structureModal.system}
                </div>
                <div>
                  <span className="font-semibold text-[#eef4ff]">Source :</span>{' '}
                  {structureModal.source}
                </div>
                {meshNodeFor(structureModal) && (
                  <div>
                    <span className="font-semibold text-[#eef4ff]">
                      Nœud GLB :
                    </span>{' '}
                    {meshNodeFor(structureModal)}
                  </div>
                )}
              </div>

              <div>
                <h4 className="text-sm font-bold text-[#eef4ff] mb-2">
                  Relations anatomiques ({relations.length})
                </h4>
                {relationsLoading ? (
                  <p className="text-xs text-[#8fc5ff]">
                    Chargement des relations FMA/UBERON…
                  </p>
                ) : relations.length === 0 ? (
                  <p className="text-xs text-[#71839b]">
                    Aucune relation publiée pour cette structure.
                  </p>
                ) : (
                  <div className="max-h-40 overflow-y-auto space-y-1.5 bg-[#08111f] p-3 rounded-xl border border-[#203651]">
                    {relations.slice(0, 12).map((rel, idx) => (
                      <div key={idx} className="text-xs text-[#b8c7da]">
                        {rel.predicate === 'xref'
                          ? `${rel.predicate}: ${rel.object}`
                          : `${rel.subject} — ${rel.predicate} → ${rel.object}`}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1 rounded-full bg-indigo-500/20 text-[#8fc5ff] border border-indigo-400/30">
                  {structureModal.meshAvailable ? (
                    <>
                      <Box className="w-3.5 h-3.5" />
                      Structure 3D déclarée
                    </>
                  ) : (
                    <>
                      <BookOpen className="w-3.5 h-3.5" />
                      Catalogue uniquement
                    </>
                  )}
                </span>

                <button
                  type="button"
                  onClick={() => setStructureModal(null)}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold cursor-pointer"
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* 4. Academic Dashboard Screen (Professor & Student)                         */
/* -------------------------------------------------------------------------- */

function AcademicDashboardScreen({
  role,
  onBack,
  onStartExam,
}: {
  role: AnatomyRole;
  onBack: () => void;
  onStartExam: (exam: AnatomyExam) => void;
}) {
  const isProf = role === AnatomyRole.Professor;
  const academicRepo = AcademicRepository.instance;
  const exams = AnatomyExamRepository.instance.exams;

  const classes = academicRepo.classesForProfessor('prof-demo');
  const totalStudents = classes.reduce(
    (sum, c) => sum + academicRepo.studentsForClass(c.id).length,
    0
  );

  const assignments = academicRepo.assignmentsForStudent('student-demo');
  const results = academicRepo.resultsForStudent('student-demo');
  const history = academicRepo.historyForStudent('student-demo');

  const statusLabel = (status: ExamAssignmentStatus) => {
    switch (status) {
      case ExamAssignmentStatus.Assigned:
        return 'À faire';
      case ExamAssignmentStatus.Started:
        return 'En cours';
      case ExamAssignmentStatus.Submitted:
        return 'Soumis';
      case ExamAssignmentStatus.Expired:
        return 'Expiré';
    }
  };

  return (
    <div className="flex-1 flex flex-col">
      <header className="border-b border-[#203651] bg-[#0d1a2b] px-6 py-4 flex items-center gap-3">
        <button
          type="button"
          onClick={onBack}
          className="p-2 rounded-lg hover:bg-[#162a45] text-[#b8c7da] hover:text-white transition cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="font-bold text-lg">
          {isProf ? 'Espace professeur' : 'Espace étudiant'}
        </h1>
      </header>

      <main className="max-w-4xl w-full mx-auto p-6 space-y-6">
        {isProf ? (
          <>
            <div>
              <h2 className="text-2xl font-bold">Pilotage pédagogique</h2>
              <p className="text-sm text-[#b8c7da]">
                Classes, étudiants, examens assignés et résultats réunis au même
                endroit.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <StatCard label="Classes" value={String(classes.length)} />
              <StatCard label="Étudiants" value={String(totalStudents)} />
              <StatCard label="Examens" value={String(exams.length)} />
            </div>

            <SectionCard title="Mes classes" icon={<Users className="w-5 h-5 text-[#8fc5ff]" />}>
              <div className="divide-y divide-[#203651]">
                {classes.map((c) => (
                  <div key={c.id} className="py-3 flex items-center justify-between">
                    <div>
                      <div className="font-semibold">{c.name}</div>
                      <div className="text-xs text-[#b8c7da]">
                        {c.studentIds.length} étudiant(s) • {c.description}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </SectionCard>

            <SectionCard title="Examens publiés" icon={<FileText className="w-5 h-5 text-[#8fc5ff]" />}>
              <div className="divide-y divide-[#203651]">
                {exams.map((exam) => (
                  <div key={exam.id} className="py-3 flex items-center justify-between">
                    <div>
                      <div className="font-semibold">{exam.title}</div>
                      <div className="text-xs text-[#b8c7da]">
                        {exam.questions.length} question(s) · {exam.durationMinutes} min
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </SectionCard>

            <SectionCard
              title="Fonctions pédagogiques"
              icon={<Sparkles className="w-5 h-5 text-[#8fc5ff]" />}
            >
              <p className="text-sm text-[#b8c7da]">
                Banque de questions · assignation par classe · calendrier · notes
                · statistiques · correction · export · parcours pédagogiques.
              </p>
            </SectionCard>
          </>
        ) : (
          <>
            <div>
              <h2 className="text-2xl font-bold">Mon espace</h2>
              <p className="text-sm text-[#b8c7da]">
                Examens assignés, résultats, notes et historique d’apprentissage.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <StatCard label="Assignés" value={String(assignments.length)} />
              <StatCard label="Résultats" value={String(results.length)} />
              <StatCard label="Activités" value={String(history.length)} />
            </div>

            <SectionCard
              title="Examens assignés"
              icon={<FileText className="w-5 h-5 text-[#8fc5ff]" />}
            >
              {assignments.length === 0 ? (
                <p className="text-sm text-[#71839b]">
                  Aucun examen assigné pour le moment.
                </p>
              ) : (
                <div className="divide-y divide-[#203651]">
                  {assignments.map((a) => {
                    const matchedExam = exams.find((e) => e.id === a.examId);
                    return (
                      <div
                        key={a.id}
                        className="py-3 flex items-center justify-between gap-4"
                      >
                        <div>
                          <div className="font-semibold">
                            {matchedExam ? matchedExam.title : `Examen ${a.examId}`}
                          </div>
                          <div className="text-xs text-[#8fc5ff]">
                            Statut : {statusLabel(a.status)}
                          </div>
                        </div>
                        {matchedExam && (
                          <button
                            type="button"
                            onClick={() => onStartExam(matchedExam)}
                            className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white cursor-pointer"
                          >
                            Passer l’examen
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </SectionCard>

            <SectionCard
              title="Résultats et notes"
              icon={<CheckCircle2 className="w-5 h-5 text-[#8fc5ff]" />}
            >
              {results.length === 0 ? (
                <p className="text-sm text-[#71839b]">Aucun résultat disponible.</p>
              ) : (
                <div className="divide-y divide-[#203651]">
                  {results.map((r) => (
                    <div key={r.id} className="py-3 flex items-center justify-between">
                      <div className="font-semibold">Examen {r.examId}</div>
                      <div className="text-sm text-[#8fc5ff] font-medium">
                        {r.score}/{r.maxScore} · {r.percentage.toFixed(1)} % · Note{' '}
                        {gradeForPercentage(r.percentage)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </SectionCard>

            <SectionCard
              title="Historique"
              icon={<History className="w-5 h-5 text-[#8fc5ff]" />}
            >
              {history.length === 0 ? (
                <p className="text-sm text-[#71839b]">
                  Votre historique apparaîtra ici.
                </p>
              ) : (
                <div className="divide-y divide-[#203651]">
                  {history.map((entry) => (
                    <div key={entry.id} className="py-3">
                      <div className="font-medium text-sm">{entry.title}</div>
                      <div className="text-xs text-[#71839b]">
                        {entry.occurredAt.toLocaleString('fr-FR')}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </SectionCard>
          </>
        )}
      </main>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-4 rounded-2xl border border-[#203651] bg-[#0d1a2b] text-center">
      <div className="text-2xl font-extrabold text-[#eef4ff]">{value}</div>
      <div className="text-xs text-[#b8c7da] mt-1">{label}</div>
    </div>
  );
}

function SectionCard({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="p-5 rounded-2xl border border-[#203651] bg-[#0d1a2b] space-y-3">
      <div className="flex items-center gap-2.5">
        {icon}
        <h3 className="text-base font-bold">{title}</h3>
      </div>
      <div>{children}</div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* 5. Professor Exam Editor Screen                                            */
/* -------------------------------------------------------------------------- */

function ProfessorExamEditorScreen({
  showExisting,
  onBack,
}: {
  showExisting: boolean;
  onBack: () => void;
}) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<ExamQuestionType>(ExamQuestionType.Quiz);
  const [questionText, setQuestionText] = useState('');
  const [optionsText, setOptionsText] = useState('');
  const [expectedAnswer, setExpectedAnswer] = useState('');
  const [correctIndex, setCorrectIndex] = useState(0);
  const [conceptId, setConceptId] = useState('');
  const [conceptFr, setConceptFr] = useState('');
  const [conceptEn, setConceptEn] = useState('');
  const [meshFile, setMeshFile] = useState('');
  const [meshNode, setMeshNode] = useState('');

  const [questions, setQuestions] = useState<AnatomyExamQuestion[]>([]);
  const [notice, setNotice] = useState<string | null>(null);

  const existingExams = AnatomyExamRepository.instance.exams;
  const bankQuestions = AnatomyQuestionBankRepository.instance.all;

  const addQuestion = () => {
    const trimmed = questionText.trim();
    if (!trimmed) return;

    const options = optionsText
      .split(';')
      .map((s) => s.trim())
      .filter(Boolean);

    if (type === ExamQuestionType.Quiz && options.length < 2) {
      setNotice('Un QCM nécessite au moins 2 choix séparés par ";"');
      return;
    }

    if (
      type === ExamQuestionType.Identify3D &&
      (!conceptId.trim() || !meshFile.trim() || !meshNode.trim())
    ) {
      setNotice('Une question 3D exige concept ID, fichier GLB et nœud.');
      return;
    }

    const newQ: AnatomyExamQuestion = {
      id: `q${questions.length + 1}-${Date.now()}`,
      text: trimmed,
      type,
      options: type === ExamQuestionType.Quiz ? options : [],
      correctOptionIndex:
        type === ExamQuestionType.Quiz
          ? Math.min(Math.max(0, correctIndex), options.length - 1)
          : undefined,
      expectedAnswer:
        type === ExamQuestionType.Question ? expectedAnswer.trim() : undefined,
      conceptId: conceptId.trim() || undefined,
      conceptNameFr: conceptFr.trim() || undefined,
      conceptNameEn: conceptEn.trim() || undefined,
      meshFile:
        type === ExamQuestionType.Identify3D ? meshFile.trim() : undefined,
      meshNode:
        type === ExamQuestionType.Identify3D ? meshNode.trim() : undefined,
      points: type === ExamQuestionType.Identify3D ? 2 : 1,
      tags: [],
      difficulty: 1,
    };

    setQuestions((prev) => [...prev, newQ]);
    setQuestionText('');
    setOptionsText('');
    setExpectedAnswer('');
    setConceptId('');
    setConceptFr('');
    setConceptEn('');
    setMeshFile('');
    setMeshNode('');
    setCorrectIndex(0);
    setNotice('Question ajoutée à l’examen.');
  };

  const importBankQuestion = (q: AnatomyExamQuestion) => {
    setQuestions((prev) => [...prev, { ...q, id: `${q.id}-${ prev.length + 1}` }]);
    setNotice(`Question ajoutée : ${q.conceptNameFr ?? q.text}`);
  };

  const saveExam = () => {
    if (!title.trim() || questions.length === 0) {
      setNotice('Veuillez renseigner un titre et au moins une question.');
      return;
    }

    const newExam: AnatomyExam = {
      id: `exam-${Date.now()}`,
      title: title.trim(),
      description: description.trim() || 'Examen publié en mode sécurisé.',
      questions,
      durationMinutes: 30,
      hideAnatomy: true,
    };

    AnatomyExamRepository.instance.add(newExam);
    AcademicRepository.instance.assignExam({
      id: `assign-${Date.now()}`,
      examId: newExam.id,
      classId: 'class-demo',
      studentId: 'student-demo',
      assignedAt: new Date(),
      status: ExamAssignmentStatus.Assigned,
    });

    onBack();
  };

  return (
    <div className="flex-1 flex flex-col">
      <header className="border-b border-[#203651] bg-[#0d1a2b] px-6 py-4 flex items-center gap-3">
        <button
          type="button"
          onClick={onBack}
          className="p-2 rounded-lg hover:bg-[#162a45] text-[#b8c7da] hover:text-white transition cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="font-bold text-lg">Créateur d’examen</h1>
      </header>

      <main className="max-w-3xl w-full mx-auto p-6 space-y-6">
        {notice && (
          <div className="p-3.5 rounded-xl bg-indigo-500/20 border border-indigo-400/40 text-sm text-[#8fc5ff] flex items-center justify-between">
            <span>{notice}</span>
            <button
              type="button"
              onClick={() => setNotice(null)}
              className="text-xs underline ml-4 cursor-pointer"
            >
              Fermer
            </button>
          </div>
        )}

        <div className="p-5 rounded-2xl border border-[#203651] bg-[#0d1a2b] space-y-4">
          <h2 className="font-bold text-lg">Informations de l’examen</h2>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Titre de l’examen"
            className="w-full px-3.5 py-2.5 rounded-xl bg-[#08111f] border border-[#203651] text-sm"
          />
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description"
            className="w-full px-3.5 py-2.5 rounded-xl bg-[#08111f] border border-[#203651] text-sm"
          />
        </div>

        <div className="p-5 rounded-2xl border border-[#203651] bg-[#0d1a2b] space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h2 className="font-bold text-lg">Nouvelle question</h2>
            <div className="inline-flex rounded-xl border border-[#2c4a70] bg-[#08111f] p-1">
              {(
                [
                  [ExamQuestionType.Quiz, 'QCM'],
                  [ExamQuestionType.Question, 'Libre'],
                  [ExamQuestionType.Identify3D, '3D'],
                ] as const
              ).map(([qType, label]) => (
                <button
                  key={qType}
                  type="button"
                  onClick={() => setType(qType)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                    type === qType
                      ? 'bg-indigo-600 text-white'
                      : 'text-[#b8c7da] hover:text-white'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <textarea
            rows={3}
            value={questionText}
            onChange={(e) => setQuestionText(e.target.value)}
            placeholder="Énoncé de la question…"
            className="w-full px-3.5 py-2.5 rounded-xl bg-[#08111f] border border-[#203651] text-sm"
          />

          {type === ExamQuestionType.Quiz && (
            <div className="grid sm:grid-cols-3 gap-3">
              <input
                type="text"
                value={optionsText}
                onChange={(e) => setOptionsText(e.target.value)}
                placeholder="Choix séparés par ; (ex: Cœur; Foie; Rein)"
                className="sm:col-span-2 px-3.5 py-2.5 rounded-xl bg-[#08111f] border border-[#203651] text-sm"
              />
              <select
                value={correctIndex}
                onChange={(e) => setCorrectIndex(Number(e.target.value))}
                className="px-3.5 py-2.5 rounded-xl bg-[#08111f] border border-[#203651] text-sm"
              >
                {[0, 1, 2, 3, 4, 5].map((i) => (
                  <option key={i} value={i}>
                    Bonne réponse : Choix {i + 1}
                  </option>
                ))}
              </select>
            </div>
          )}

          {type === ExamQuestionType.Question && (
            <input
              type="text"
              value={expectedAnswer}
              onChange={(e) => setExpectedAnswer(e.target.value)}
              placeholder="Réponse attendue (optionnelle)"
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#08111f] border border-[#203651] text-sm"
            />
          )}

          {type === ExamQuestionType.Identify3D && (
            <div className="space-y-3 pt-2 border-t border-[#203651]">
              <div className="text-xs font-bold uppercase tracking-wider text-[#8fc5ff]">
                Cible anatomique 3D
              </div>
              <div className="grid sm:grid-cols-3 gap-3">
                <input
                  type="text"
                  value={conceptId}
                  onChange={(e) => setConceptId(e.target.value)}
                  placeholder="ID FMA / UBERON (ex. FMA:55675)"
                  className="px-3.5 py-2 rounded-xl bg-[#08111f] border border-[#203651] text-sm"
                />
                <input
                  type="text"
                  value={conceptFr}
                  onChange={(e) => setConceptFr(e.target.value)}
                  placeholder="Nom français (ex. Cœur)"
                  className="px-3.5 py-2 rounded-xl bg-[#08111f] border border-[#203651] text-sm"
                />
                <input
                  type="text"
                  value={conceptEn}
                  onChange={(e) => setConceptEn(e.target.value)}
                  placeholder="Nom anglais (ex. Heart)"
                  className="px-3.5 py-2 rounded-xl bg-[#08111f] border border-[#203651] text-sm"
                />
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  value={meshFile}
                  onChange={(e) => setMeshFile(e.target.value)}
                  placeholder="Fichier GLB (ex. cardiovascular_male.glb)"
                  className="px-3.5 py-2 rounded-xl bg-[#08111f] border border-[#203651] text-sm"
                />
                <input
                  type="text"
                  value={meshNode}
                  onChange={(e) => setMeshNode(e.target.value)}
                  placeholder="Nœud GLB vérifié (ex. Heart)"
                  className="px-3.5 py-2 rounded-xl bg-[#08111f] border border-[#203651] text-sm"
                />
              </div>
              <p className="text-xs text-[#71839b]">
                Le nœud doit provenir d’un mapping physiquement vérifié ; la
                vérification physique ne suffit pas à prouver l’équivalence
                sémantique.
              </p>
            </div>
          )}

          <button
            type="button"
            onClick={addQuestion}
            className="px-4 py-2.5 rounded-xl border border-[#2c4a70] bg-[#132640] hover:bg-[#1b3558] text-sm font-semibold text-[#8fc5ff] inline-flex items-center gap-2 transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Ajouter la question
          </button>
        </div>

        {/* Question Bank */}
        <div className="p-5 rounded-2xl border border-[#203651] bg-[#0d1a2b] space-y-3">
          <div>
            <h2 className="font-bold text-lg">Banque de questions</h2>
            <p className="text-xs text-[#b8c7da]">
              Questions déjà liées à des concepts FMA/UBERON.
            </p>
          </div>
          <div className="divide-y divide-[#203651]">
            {bankQuestions.map((q) => (
              <div
                key={q.id}
                className="py-3 flex items-center justify-between gap-4"
              >
                <div>
                  <div className="text-sm font-semibold">{q.text}</div>
                  <div className="text-xs text-[#8fc5ff]">
                    {q.conceptNameFr ?? 'Concept non renseigné'} •{' '}
                    {q.conceptId ?? 'sans ID'} ({q.type})
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => importBankQuestion(q)}
                  className="px-3 py-1.5 rounded-lg border border-[#2c4a70] hover:bg-[#152842] text-xs font-semibold text-[#8fc5ff] shrink-0 cursor-pointer"
                >
                  + Ajouter
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Current Exam Questions */}
        {questions.length > 0 && (
          <div className="p-5 rounded-2xl border border-[#203651] bg-[#0d1a2b] space-y-4">
            <h2 className="font-bold text-lg">
              Questions de l’examen ({questions.length})
            </h2>
            <div className="divide-y divide-[#203651]">
              {questions.map((q, idx) => (
                <div key={q.id} className="py-2.5 flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-indigo-600/30 text-[#8fc5ff] text-xs font-bold flex items-center justify-center">
                    {idx + 1}
                  </span>
                  <div className="flex-1">
                    <div className="text-sm font-medium">{q.text}</div>
                    <div className="text-xs text-[#71839b]">
                      {q.type === ExamQuestionType.Identify3D
                        ? `Identification 3D • ${q.conceptId ?? 'sans concept'}`
                        : q.type === ExamQuestionType.Quiz
                        ? `QCM • ${q.conceptId ?? 'sans concept'}`
                        : `Question libre • ${q.conceptId ?? 'sans concept'}`}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={saveExam}
              className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold flex items-center justify-center gap-2 transition cursor-pointer"
            >
              <Lock className="w-4 h-4" />
              Publier l’examen sécurisé
            </button>
          </div>
        )}

        {showExisting && (
          <div className="p-5 rounded-2xl border border-[#203651] bg-[#0d1a2b] space-y-3">
            <h2 className="font-bold text-lg">Examens enregistrés</h2>
            <div className="divide-y divide-[#203651]">
              {existingExams.map((exam) => (
                <div key={exam.id} className="py-3">
                  <div className="font-semibold">{exam.title}</div>
                  <div className="text-xs text-[#b8c7da]">
                    {exam.questions.length} question(s) • {exam.durationMinutes}{' '}
                    min
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* 6. Student Exam List Screen                                                */
/* -------------------------------------------------------------------------- */

function StudentExamListScreen({
  onBack,
  onSelectExam,
}: {
  onBack: () => void;
  onSelectExam: (exam: AnatomyExam) => void;
}) {
  const exams = AnatomyExamRepository.instance.exams;

  return (
    <div className="flex-1 flex flex-col">
      <header className="border-b border-[#203651] bg-[#0d1a2b] px-6 py-4 flex items-center gap-3">
        <button
          type="button"
          onClick={onBack}
          className="p-2 rounded-lg hover:bg-[#162a45] text-[#b8c7da] hover:text-white transition cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="font-bold text-lg">Examens disponibles</h1>
      </header>

      <main className="max-w-3xl w-full mx-auto p-6 space-y-3">
        {exams.map((exam) => (
          <button
            key={exam.id}
            type="button"
            onClick={() => onSelectExam(exam)}
            className="w-full text-left p-5 rounded-2xl border border-[#203651] bg-[#0d1a2b] hover:border-[#8fc5ff] transition flex items-center justify-between gap-4 cursor-pointer"
          >
            <div>
              <div className="font-bold text-base text-[#eef4ff]">
                {exam.title}
              </div>
              <div className="text-xs text-[#b8c7da] mt-0.5">
                {exam.questions.length} question(s) • {exam.durationMinutes} min
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-[#8fc5ff]" />
          </button>
        ))}
      </main>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* 7. Student Exam Screen (Timed Secure Mode + 3D Identification)             */
/* -------------------------------------------------------------------------- */

function StudentExamScreen({
  exam,
  onFinish,
}: {
  exam: AnatomyExam;
  onFinish: () => void;
}) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [remainingSeconds, setRemainingSeconds] = useState(
    exam.durationMinutes * 60
  );
  const [currentIndex, setCurrentIndex] = useState(0);
  const [submittedResult, setSubmittedResult] = useState<{
    earned: number;
    total: number;
  } | null>(null);

  const isCorrect = (question: AnatomyExamQuestion, ans?: string): boolean => {
    if (!ans) return false;
    if (question.type === ExamQuestionType.Quiz) {
      return question.options.indexOf(ans) === question.correctOptionIndex;
    }
    if (question.type === ExamQuestionType.Identify3D) {
      return (
        ans.toLowerCase() === (question.meshNode || '').toLowerCase()
      );
    }
    return (
      question.expectedAnswer != null &&
      ans.trim().toLowerCase() === question.expectedAnswer.trim().toLowerCase()
    );
  };

  const handleSubmit = () => {
    if (submittedResult) return;
    let earned = 0;
    let total = 0;
    const questionScores: Record<string, number> = {};

    exam.questions.forEach((q) => {
      total += q.points;
      const pts = isCorrect(q, answers[q.id]) ? q.points : 0;
      earned += pts;
      questionScores[q.id] = pts;
    });

    const percentage = total > 0 ? (earned / total) * 100 : 0;
    AcademicRepository.instance.addResult({
      id: `res-${Date.now()}`,
      examId: exam.id,
      assignmentId: `assign-${exam.id}`,
      studentId: 'student-demo',
      submittedAt: new Date(),
      score: earned,
      maxScore: total,
      percentage,
      questionScores,
    });
    AcademicRepository.instance.markAssignmentSubmitted(exam.id, 'student-demo');
    AcademicRepository.instance.addHistory({
      id: `hist-${Date.now()}`,
      studentId: 'student-demo',
      type: AnatomyHistoryType.Exam,
      title: `Examen soumis : ${exam.title} (${earned}/${total} pts)`,
      occurredAt: new Date(),
      score: percentage,
    });

    setSubmittedResult({ earned, total });
  };

  useEffect(() => {
    if (submittedResult) return;
    const timer = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [submittedResult]);

  if (exam.questions.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-6">
        <p>Cet examen ne contient aucune question.</p>
      </div>
    );
  }

  const question = exam.questions[currentIndex];
  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;

  return (
    <div className="flex-1 flex flex-col">
      <header className="border-b border-[#203651] bg-[#0d1a2b] px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <Lock className="w-5 h-5 text-amber-400" />
          <h1 className="font-bold text-lg">{exam.title}</h1>
        </div>
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[#08111f] border border-[#2c4a70] font-mono text-sm text-[#8fc5ff]">
          <Clock className="w-4 h-4" />
          {minutes}:{String(seconds).padStart(2, '0')}
        </div>
      </header>

      <main className="max-w-3xl w-full mx-auto p-6 space-y-6">
        <div className="p-4 rounded-2xl border border-amber-500/30 bg-amber-500/10 flex items-center gap-3">
          <Lock className="w-5 h-5 text-amber-300 shrink-0" />
          <div>
            <div className="font-semibold text-sm text-amber-200">
              Mode examen sécurisé
            </div>
            <div className="text-xs text-amber-200/80">
              L’atlas anatomique est masqué pendant cette épreuve.
            </div>
          </div>
        </div>

        <div className="p-6 rounded-2xl border border-[#203651] bg-[#0d1a2b] space-y-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#8fc5ff]">
              Question {currentIndex + 1} / {exam.questions.length}
            </span>
            <div className="flex items-center gap-2">
              <span className="text-xs px-2.5 py-1 rounded-full bg-[#12243b] border border-[#2c4a70] text-[#8fc5ff]">
                {question.points} pt
              </span>
              <span className="text-xs px-2.5 py-1 rounded-full bg-[#12243b] border border-[#2c4a70] text-[#b8c7da]">
                {question.type === ExamQuestionType.Identify3D
                  ? 'Identification 3D'
                  : question.type === ExamQuestionType.Quiz
                  ? 'QCM'
                  : 'Réponse libre'}
              </span>
            </div>
          </div>

          <h2 className="text-xl font-bold text-[#eef4ff]">{question.text}</h2>

          {question.type === ExamQuestionType.Quiz && (
            <div className="space-y-2.5">
              {question.options.map((opt) => {
                const checked = answers[question.id] === opt;
                return (
                  <label
                    key={opt}
                    className={`flex items-center gap-3 p-3.5 rounded-xl border transition cursor-pointer ${
                      checked
                        ? 'border-indigo-500 bg-indigo-600/20 text-white'
                        : 'border-[#203651] bg-[#08111f] hover:border-[#2c4a70]'
                    }`}
                  >
                    <input
                      type="radio"
                      name={question.id}
                      value={opt}
                      checked={checked}
                      onChange={() =>
                        setAnswers((prev) => ({ ...prev, [question.id]: opt }))
                      }
                      className="accent-indigo-500"
                    />
                    <span className="text-sm font-medium">{opt}</span>
                  </label>
                );
              })}
            </div>
          )}

          {question.type === ExamQuestionType.Question && (
            <textarea
              rows={4}
              value={answers[question.id] || ''}
              onChange={(e) =>
                setAnswers((prev) => ({
                  ...prev,
                  [question.id]: e.target.value,
                }))
              }
              placeholder="Votre réponse…"
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#08111f] border border-[#203651] text-sm"
            />
          )}

          {question.type === ExamQuestionType.Identify3D && (
            <div className="space-y-3">
              <p className="text-xs font-semibold text-[#8fc5ff]">
                Touchez directement la structure demandée dans le modèle 3D.
              </p>
              <div className="rounded-2xl overflow-hidden border border-[#203651]">
                <Interactive3DViewer
                  modelUrl={`https://raw.githubusercontent.com/Connacri/Anatria-3D/main/public/anatomy/${
                    question.meshFile || 'cardiovascular_male.glb'
                  }`}
                  selectionColor={[1.0, 0.25, 0.1, 1.0]}
                  heightClass="h-[380px]"
                  onSelectionChanged={(entities) => {
                    if (entities.length > 0) {
                      const last = entities[entities.length - 1];
                      setAnswers((prev) => ({
                        ...prev,
                        [question.id]: last.name,
                      }));
                    }
                  }}
                />
              </div>
              <div className="p-3 rounded-xl bg-[#08111f] border border-[#203651] text-xs flex items-center justify-between">
                <span>
                  Structure sélectionnée :{' '}
                  <strong className="text-[#8fc5ff]">
                    {answers[question.id] || 'Aucune structure sélectionnée'}
                  </strong>
                </span>
                {question.conceptNameFr && (
                  <span className="text-[#71839b]">
                    Cible : {question.conceptNameFr}
                  </span>
                )}
              </div>
            </div>
          )}

          <div className="pt-2">
            <button
              type="button"
              onClick={() => {
                if (currentIndex + 1 < exam.questions.length) {
                  setCurrentIndex((i) => i + 1);
                } else {
                  handleSubmit();
                }
              }}
              className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition cursor-pointer"
            >
              {currentIndex + 1 < exam.questions.length
                ? 'Question suivante'
                : 'Terminer l’examen'}
            </button>
          </div>
        </div>
      </main>

      {submittedResult && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-[#0d1a2b] border border-[#2c4a70] rounded-2xl max-w-md w-full p-6 text-center space-y-4">
            <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
            <h3 className="text-2xl font-bold">Examen terminé</h3>
            <p className="text-lg text-[#8fc5ff] font-semibold">
              Résultat : {submittedResult.earned} / {submittedResult.total}{' '}
              points
            </p>
            <button
              type="button"
              onClick={onFinish}
              className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold cursor-pointer"
            >
              Terminer
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
