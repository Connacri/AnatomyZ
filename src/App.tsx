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
  Home,
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
  | { name: 'anatomy_home'; role?: AnatomyRole }
  | { name: 'academic_dashboard'; role: AnatomyRole }
  | { name: 'professor_exam_editor'; role: AnatomyRole; showExisting: boolean }
  | { name: 'student_exam_list'; role: AnatomyRole }
  | { name: 'student_exam'; role: AnatomyRole; exam: AnatomyExam };

export function App() {
  const [historyStack, setHistoryStack] = useState<ScreenState[]>([
    { name: 'role_selection' },
  ]);

  const currentScreen = historyStack[historyStack.length - 1];

  const pushScreen = (next: ScreenState) => {
    setHistoryStack((prev) => [...prev, next]);
  };

  const replaceTopScreen = (next: ScreenState) => {
    setHistoryStack((prev) => [...prev.slice(0, -1), next]);
  };

  const popScreen = () => {
    setHistoryStack((prev) => (prev.length > 1 ? prev.slice(0, -1) : prev));
  };

  const activeRole: AnatomyRole | undefined =
    'role' in currentScreen ? currentScreen.role : undefined;

  const showMobileBottomNav =
    activeRole !== undefined && currentScreen.name !== 'student_exam';

  return (
    <div className="min-h-screen bg-[#08111f] text-[#eef4ff] flex flex-col">
      <div className={`flex-1 flex flex-col ${showMobileBottomNav ? 'pb-16 md:pb-0' : ''}`}>
        {currentScreen.name === 'role_selection' && (
          <RoleSelectionScreen
            onSelectRole={(role) => pushScreen({ name: 'role_home', role })}
            onOpenAtlas={() => pushScreen({ name: 'anatomy_home' })}
          />
        )}

        {currentScreen.name === 'role_home' && (
          <RoleHomeScreen
            role={currentScreen.role}
            onBack={() => setHistoryStack([{ name: 'role_selection' }])}
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
            onStartExam={(exam) =>
              pushScreen({ name: 'student_exam', role: currentScreen.role, exam })
            }
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
            onSelectExam={(exam) =>
              pushScreen({ name: 'student_exam', role: currentScreen.role, exam })
            }
          />
        )}

        {currentScreen.name === 'student_exam' && (
          <StudentExamScreen
            exam={currentScreen.exam}
            onFinish={popScreen}
          />
        )}
      </div>

      {/* Mobile Ergonomic Bottom Tab Navigation (Thumb Zone) */}
      {showMobileBottomNav && activeRole && (
        <nav
          aria-label="Navigation principale mobile"
          className="fixed bottom-0 left-0 right-0 z-30 md:hidden bg-[#0d1a2b]/95 backdrop-blur-md border-t border-[#203651] grid grid-cols-4 items-center h-16 px-1"
        >
          <button
            type="button"
            onClick={() =>
              replaceTopScreen({ name: 'role_home', role: activeRole })
            }
            className={`min-h-[48px] flex flex-col items-center justify-center rounded-xl transition cursor-pointer ${
              currentScreen.name === 'role_home'
                ? 'text-[#8fc5ff]'
                : 'text-[#71839b] hover:text-[#eef4ff]'
            }`}
          >
            <Home className="w-5 h-5" />
            <span className="text-[11px] font-medium mt-1 whitespace-nowrap">
              Accueil
            </span>
          </button>

          <button
            type="button"
            onClick={() =>
              replaceTopScreen({ name: 'academic_dashboard', role: activeRole })
            }
            className={`min-h-[48px] flex flex-col items-center justify-center rounded-xl transition cursor-pointer ${
              currentScreen.name === 'academic_dashboard'
                ? 'text-[#8fc5ff]'
                : 'text-[#71839b] hover:text-[#eef4ff]'
            }`}
          >
            <Layers className="w-5 h-5" />
            <span className="text-[11px] font-medium mt-1 whitespace-nowrap">
              Espace
            </span>
          </button>

          <button
            type="button"
            onClick={() =>
              activeRole === AnatomyRole.Professor
                ? replaceTopScreen({
                    name: 'professor_exam_editor',
                    role: activeRole,
                    showExisting: true,
                  })
                : replaceTopScreen({
                    name: 'student_exam_list',
                    role: activeRole,
                  })
            }
            className={`min-h-[48px] flex flex-col items-center justify-center rounded-xl transition cursor-pointer ${
              currentScreen.name === 'professor_exam_editor' ||
              currentScreen.name === 'student_exam_list'
                ? 'text-[#8fc5ff]'
                : 'text-[#71839b] hover:text-[#eef4ff]'
            }`}
          >
            <FileText className="w-5 h-5" />
            <span className="text-[11px] font-medium mt-1 whitespace-nowrap">
              Examens
            </span>
          </button>

          <button
            type="button"
            onClick={() =>
              replaceTopScreen({ name: 'anatomy_home', role: activeRole })
            }
            className={`min-h-[48px] flex flex-col items-center justify-center rounded-xl transition cursor-pointer ${
              currentScreen.name === 'anatomy_home'
                ? 'text-[#8fc5ff]'
                : 'text-[#71839b] hover:text-[#eef4ff]'
            }`}
          >
            <Box className="w-5 h-5" />
            <span className="text-[11px] font-medium mt-1 whitespace-nowrap">
              Atlas 3D
            </span>
          </button>
        </nav>
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
      {/* 3-Zone Top Bar Contract */}
      <header className="sticky top-0 z-30 h-14 border-b border-[#203651] bg-[#0d1a2b]/90 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between">
        <span className="font-bold text-lg tracking-tight text-[#eef4ff]">
          AnatomyZ
        </span>

        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-[#b8c7da]">
          <button
            type="button"
            onClick={() => onSelectRole(AnatomyRole.Professor)}
            className="hover:text-[#eef4ff] transition cursor-pointer whitespace-nowrap"
          >
            Professeur
          </button>
          <button
            type="button"
            onClick={() => onSelectRole(AnatomyRole.Student)}
            className="hover:text-[#eef4ff] transition cursor-pointer whitespace-nowrap"
          >
            Étudiant
          </button>
          <button
            type="button"
            onClick={onOpenAtlas}
            className="hover:text-[#eef4ff] transition cursor-pointer whitespace-nowrap"
          >
            Atlas 3D
          </button>
        </nav>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onOpenAtlas}
            className="min-h-[40px] px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs sm:text-sm font-semibold text-white whitespace-nowrap transition cursor-pointer"
          >
            Explorer l’atlas 3D
          </button>
        </div>
      </header>

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-14 flex flex-col justify-center">
        <div className="text-center mb-8 sm:mb-10">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-[#0d1a2b] border border-[#2c4a70] flex items-center justify-center mx-auto mb-4">
            <Microscope className="w-8 h-8 text-[#8fc5ff]" />
          </div>
          <p className="text-xs sm:text-sm font-medium text-[#8fc5ff] mb-2">
            Atlas anatomique humain 3D · FMA &amp; UBERON
          </p>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight mb-3 text-balance">
            Choisissez votre rôle
          </h1>
          <p className="text-[#b8c7da] max-w-2xl mx-auto text-sm sm:text-base leading-relaxed">
            Plateforme éducative multi-plateforme (Mobile &amp; Web) combinant un
            Knowledge Graph anatomique, des modèles GLB/GLTF vérifiés et un mode
            examen sécurisé.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 max-w-2xl mx-auto w-full mb-10">
          <button
            type="button"
            onClick={() => onSelectRole(AnatomyRole.Professor)}
            className="min-h-[84px] text-left p-5 rounded-2xl border border-[#203651] bg-[#0d1a2b] hover:border-[#8fc5ff] hover:bg-[#112238] active:scale-[0.99] transition flex items-center gap-4 group cursor-pointer"
          >
            <div className="w-12 h-12 rounded-xl bg-indigo-500/15 border border-indigo-400/30 flex items-center justify-center text-[#8fc5ff] shrink-0">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-base sm:text-lg font-bold text-[#eef4ff] group-hover:text-[#8fc5ff] transition">
                Professeur
              </h2>
              <p className="text-xs sm:text-sm text-[#b8c7da]">
                Créer des quiz et des questions d’examen
              </p>
            </div>
            <ChevronRight className="w-5 h-5 text-[#71839b] group-hover:text-[#8fc5ff] shrink-0 transition" />
          </button>

          <button
            type="button"
            onClick={() => onSelectRole(AnatomyRole.Student)}
            className="min-h-[84px] text-left p-5 rounded-2xl border border-[#203651] bg-[#0d1a2b] hover:border-[#8fc5ff] hover:bg-[#112238] active:scale-[0.99] transition flex items-center gap-4 group cursor-pointer"
          >
            <div className="w-12 h-12 rounded-xl bg-indigo-500/15 border border-indigo-400/30 flex items-center justify-center text-[#8fc5ff] shrink-0">
              <User className="w-6 h-6" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-base sm:text-lg font-bold text-[#eef4ff] group-hover:text-[#8fc5ff] transition">
                Étudiant
              </h2>
              <p className="text-xs sm:text-sm text-[#b8c7da]">
                Consulter les examens et les passer
              </p>
            </div>
            <ChevronRight className="w-5 h-5 text-[#71839b] group-hover:text-[#8fc5ff] shrink-0 transition" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          <div className="p-4 sm:p-5 rounded-2xl border border-[#203651] bg-[#0d1a2b]">
            <h3 className="font-semibold text-sm sm:text-base text-[#eef4ff] mb-1">
              Knowledge Graph
            </h3>
            <p className="text-xs sm:text-sm text-[#b8c7da]">
              Structures, synonymes bilingues et relations anatomiques FMA/UBERON.
            </p>
          </div>
          <div className="p-4 sm:p-5 rounded-2xl border border-[#203651] bg-[#0d1a2b]">
            <h3 className="font-semibold text-sm sm:text-base text-[#eef4ff] mb-1">
              Atlas 3D GLB/GLTF
            </h3>
            <p className="text-xs sm:text-sm text-[#b8c7da]">
              Sélection tactile/souris, visibilité, transparence et matériaux.
            </p>
          </div>
          <div className="p-4 sm:p-5 rounded-2xl border border-[#203651] bg-[#0d1a2b]">
            <h3 className="font-semibold text-sm sm:text-base text-[#eef4ff] mb-1">
              Moteur de Mapping
            </h3>
            <p className="text-xs sm:text-sm text-[#b8c7da]">
              Correspondances exactes, xrefs et nœuds 3D vérifiés.
            </p>
          </div>
          <div className="p-4 sm:p-5 rounded-2xl border border-[#203651] bg-[#0d1a2b]">
            <h3 className="font-semibold text-sm sm:text-base text-[#eef4ff] mb-1">
              Éducation &amp; Examen
            </h3>
            <p className="text-xs sm:text-sm text-[#b8c7da]">
              Espaces dédiés, banque de questions et mode examen sécurisé.
            </p>
          </div>
        </div>

        <footer className="mt-10 text-center text-xs sm:text-sm text-[#71839b]">
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
      <header className="sticky top-0 z-30 h-14 border-b border-[#203651] bg-[#0d1a2b]/95 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between">
        <div className="flex items-center gap-2 min-w-0">
          <button
            type="button"
            onClick={onBack}
            className="min-h-[44px] min-w-[44px] rounded-xl hover:bg-[#162a45] text-[#b8c7da] hover:text-white flex items-center justify-center transition cursor-pointer"
            title="Changer de rôle"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="font-bold text-base sm:text-lg truncate">
            AnatomyZ — {labelFr}
          </h1>
        </div>
      </header>

      <main className="max-w-2xl w-full mx-auto p-4 sm:p-6 space-y-4">
        <div className="p-5 rounded-2xl border border-[#203651] bg-[#0d1a2b] flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-500/15 border border-indigo-400/30 flex items-center justify-center text-[#8fc5ff] shrink-0">
            {isProf ? (
              <GraduationCap className="w-6 h-6" />
            ) : (
              <User className="w-6 h-6" />
            )}
          </div>
          <div className="min-w-0">
            <h2 className="font-bold text-base sm:text-lg">{labelFr}</h2>
            <p className="text-xs sm:text-sm text-[#b8c7da]">
              {isProf
                ? 'Créer et gérer des examens'
                : 'Passer les examens assignés'}
            </p>
          </div>
        </div>

        <div className="space-y-3 pt-1">
          <button
            type="button"
            onClick={() => onNavigate({ name: 'academic_dashboard', role })}
            className="w-full min-h-[48px] py-3 px-5 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:scale-[0.99] text-white text-sm sm:text-base font-semibold flex items-center justify-center gap-2.5 transition cursor-pointer"
          >
            <Layers className="w-5 h-5 shrink-0" />
            <span className=" whitespace-nowrap">
              {isProf ? 'Espace professeur' : 'Mon espace étudiant'}
            </span>
          </button>

          {isProf ? (
            <>
              <button
                type="button"
                onClick={() =>
                  onNavigate({
                    name: 'professor_exam_editor',
                    role,
                    showExisting: false,
                  })
                }
                className="w-full min-h-[48px] py-3 px-5 rounded-xl bg-indigo-600/90 hover:bg-indigo-500 active:scale-[0.99] text-white text-sm sm:text-base font-semibold flex items-center justify-center gap-2.5 transition cursor-pointer"
              >
                <FilePlus className="w-5 h-5 shrink-0" />
                <span className="whitespace-nowrap">Créer un examen</span>
              </button>
              <button
                type="button"
                onClick={() =>
                  onNavigate({
                    name: 'professor_exam_editor',
                    role,
                    showExisting: true,
                  })
                }
                className="w-full min-h-[48px] py-3 px-5 rounded-xl border border-[#2c4a70] bg-[#0d1a2b] hover:bg-[#142740] active:scale-[0.99] text-[#8fc5ff] text-sm sm:text-base font-semibold flex items-center justify-center gap-2.5 transition cursor-pointer"
              >
                <FileText className="w-5 h-5 shrink-0" />
                <span className="whitespace-nowrap">Mes examens</span>
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => onNavigate({ name: 'student_exam_list', role })}
              className="w-full min-h-[48px] py-3 px-5 rounded-xl bg-indigo-600/90 hover:bg-indigo-500 active:scale-[0.99] text-white text-sm sm:text-base font-semibold flex items-center justify-center gap-2.5 transition cursor-pointer"
            >
              <FileText className="w-5 h-5 shrink-0" />
              <span className="whitespace-nowrap">Examens disponibles</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => onNavigate({ name: 'anatomy_home', role })}
            className="w-full min-h-[48px] py-3 px-5 rounded-xl border border-[#2c4a70] bg-[#0d1a2b] hover:bg-[#142740] active:scale-[0.99] text-[#eef4ff] text-sm sm:text-base font-semibold flex items-center justify-center gap-2.5 transition cursor-pointer"
          >
            <Box className="w-5 h-5 text-[#8fc5ff] shrink-0" />
            <span className="whitespace-nowrap">
              Explorer l’atlas anatomique
            </span>
          </button>
        </div>
      </main>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* 3. Anatomy Home Screen (Responsive Mobile/Desktop 3D Atlas & Catalog)      */
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

  // Open sidebar by default on desktop (>= 1024px), closed overlay drawer on mobile
  const [drawerOpen, setDrawerOpen] = useState<boolean>(() =>
    typeof window !== 'undefined' ? window.innerWidth >= 1024 : false
  );

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

  const closeDrawerOnMobile = () => {
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      setDrawerOpen(false);
    }
  };

  const openStructureSheet = async (structure: AnatomyStructure) => {
    closeDrawerOnMobile();
    setSelectedStructure(structure);
    setStructureModal(structure);
    setRelationsLoading(true);
    const rels = await relationRepo.forConcept(structure.id);
    setRelations(rels);
    setRelationsLoading(false);

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
    <div className="flex-1 flex flex-col h-[calc(100dvh-4rem)] md:h-dvh overflow-hidden">
      {/* Compact Sticky App Bar */}
      <header className="h-14 border-b border-[#203651] bg-[#0d1a2b] px-3 sm:px-4 flex items-center justify-between gap-2 shrink-0 z-30">
        <div className="flex items-center gap-1.5 min-w-0">
          <button
            type="button"
            onClick={onBack}
            className="min-h-[44px] min-w-[44px] rounded-xl hover:bg-[#162a45] text-[#b8c7da] hover:text-white flex items-center justify-center transition cursor-pointer"
            title="Retour"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={() => setDrawerOpen((o) => !o)}
            className="min-h-[44px] px-2.5 rounded-xl hover:bg-[#162a45] text-[#8fc5ff] inline-flex items-center gap-1.5 transition cursor-pointer"
            title="Systèmes & Catalogue"
          >
            <Menu className="w-5 h-5" />
            <span className="text-xs font-semibold hidden sm:inline whitespace-nowrap">
              Catalogue
            </span>
          </button>
          <span className="font-bold text-sm sm:text-base truncate ml-1">
            AnatomyZ
          </span>
        </div>

        {/* Male / Female Segmented Control */}
        <div className="inline-flex rounded-xl border border-[#2c4a70] bg-[#08111f] p-1 shrink-0">
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
            className={`min-h-[36px] px-3 py-1 rounded-lg text-xs sm:text-sm font-semibold whitespace-nowrap transition cursor-pointer ${
              sex === AnatomySex.Male
                ? 'bg-indigo-600 text-white'
                : 'text-[#b8c7da] hover:text-white'
            }`}
          >
            ♂ <span className="hidden xs:inline">Homme</span>
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
            className={`min-h-[36px] px-3 py-1 rounded-lg text-xs sm:text-sm font-semibold whitespace-nowrap transition cursor-pointer ${
              sex === AnatomySex.Female
                ? 'bg-indigo-600 text-white'
                : 'text-[#b8c7da] hover:text-white'
            }`}
          >
            ♀ <span className="hidden xs:inline">Femme</span>
          </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden relative">
        {/* Mobile Backdrop Scrim when Drawer is open */}
        {drawerOpen && (
          <div
            onClick={() => setDrawerOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs z-30 lg:hidden"
            aria-hidden="true"
          />
        )}

        {/* Responsive Drawer (Modal Overlay on Mobile, Persistent Sidebar on Desktop) */}
        {drawerOpen && (
          <aside className="fixed lg:static inset-y-0 left-0 w-[86vw] max-w-sm lg:w-96 border-r border-[#203651] bg-[#0d1a2b] flex flex-col h-full overflow-y-auto shrink-0 z-40 shadow-2xl lg:shadow-none">
            <div className="p-4 space-y-3 border-b border-[#203651]">
              <div className="flex items-center justify-between lg:hidden pb-1">
                <span className="font-bold text-sm text-[#eef4ff]">
                  Systèmes &amp; Catalogue FMA/UBERON
                </span>
                <button
                  type="button"
                  onClick={() => setDrawerOpen(false)}
                  className="min-h-[40px] min-w-[40px] rounded-xl flex items-center justify-center text-[#b8c7da] hover:text-white cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="relative">
                <Search className="w-4 h-4 text-[#71839b] absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  value={systemQuery}
                  onChange={(e) => setSystemQuery(e.target.value)}
                  placeholder="Rechercher un système…"
                  className="w-full min-h-[44px] pl-10 pr-3 py-2 rounded-xl bg-[#08111f] border border-[#203651] text-sm text-[#eef4ff] placeholder-[#71839b] focus:outline-hidden focus:border-[#8fc5ff]"
                />
              </div>

              <div className="relative">
                <Search className="w-4 h-4 text-[#8fc5ff] absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  value={structureQuery}
                  onChange={(e) => setStructureQuery(e.target.value)}
                  placeholder="Structure (FR / EN / ID)…"
                  className="w-full min-h-[44px] pl-10 pr-3 py-2 rounded-xl bg-[#08111f] border border-[#203651] text-sm text-[#eef4ff] placeholder-[#71839b] focus:outline-hidden focus:border-[#8fc5ff]"
                />
              </div>

              {remoteLoading && (
                <div className="text-xs text-[#8fc5ff] animate-pulse">
                  Recherche dans le catalogue FMA/UBERON…
                </div>
              )}
              {remoteError && (
                <div className="text-xs text-amber-300">
                  {remoteError} · résultats locaux conservés
                </div>
              )}
            </div>

            {/* Structure search results */}
            <div className="px-4 pt-3 pb-2 border-b border-[#203651]">
              <div className="text-xs font-semibold text-[#8fc5ff] mb-2 tabular-nums">
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
                      className="w-full min-h-[48px] text-left px-3 py-2 rounded-xl hover:bg-[#152842] transition flex items-center justify-between gap-2 cursor-pointer"
                    >
                      <div className="min-w-0">
                        <div className="text-sm font-semibold text-[#eef4ff] truncate">
                          {structure.nameFr}
                        </div>
                        <div className="text-xs text-[#71839b] truncate">
                          {structure.nameEn} · {structure.id}
                        </div>
                      </div>
                      <span className="text-xs text-[#8fc5ff] shrink-0">
                        {structure.meshAvailable ? '3D' : 'Catalogue'}
                      </span>
                    </button>
                  ))}
              </div>
            </div>

            {/* Systems list */}
            <div className="p-4 flex-1">
              <div className="text-xs font-semibold text-[#8fc5ff] mb-2">
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
                        closeDrawerOnMobile();
                      }}
                      className={`w-full min-h-[52px] text-left px-3.5 py-2.5 rounded-xl transition flex items-center gap-3 ${
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
                            : `${system.nameEn} · Indisponible en 3D`}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </aside>
        )}

        {/* Main 3D Viewport */}
        <main className="flex-1 flex flex-col bg-[#06090e] overflow-hidden min-w-0">
          {!selectedSystem || !activeModel ? (
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
              <Box className="w-12 h-12 text-[#8fc5ff] mb-3" />
              <h2 className="text-lg sm:text-xl font-bold mb-2">
                Sélectionnez un système anatomique
              </h2>
              <p className="text-xs sm:text-sm text-[#b8c7da] mb-5 max-w-md">
                Ouvrez le catalogue pour choisir un système et charger son
                modèle GLB 3D interactif.
              </p>
              <button
                type="button"
                onClick={() => setDrawerOpen(true)}
                className="min-h-[48px] px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold inline-flex items-center gap-2 cursor-pointer"
              >
                <Layers className="w-4 h-4" />
                Explorer les systèmes
              </button>
            </div>
          ) : (
            <>
              {/* Compact Viewer Control Strip */}
              <div className="bg-[#0d1a2b] border-b border-[#203651] px-3 sm:px-4 py-2 flex items-center justify-between gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setDrawerOpen(true)}
                  className="min-w-0 text-left group cursor-pointer"
                >
                  <div className="font-bold text-xs sm:text-sm text-[#eef4ff] group-hover:text-[#8fc5ff] truncate">
                    {activeModel.system.nameFr}
                  </div>
                  <div className="text-[11px] sm:text-xs text-[#8fc5ff] truncate">
                    {activeModel.system.nameEn} ·{' '}
                    {activeModel.sex === AnatomySex.Male ? 'Male' : 'Female'}
                  </div>
                </button>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() =>
                      viewerControllerRef.current?.setCameraZoomLevel(0.85)
                    }
                    className="min-h-[40px] min-w-[40px] rounded-xl border border-[#203651] bg-[#122238] hover:bg-[#192f4d] text-[#eef4ff] flex items-center justify-center transition cursor-pointer"
                    title="Zoom arrière"
                  >
                    <ZoomOut className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      viewerControllerRef.current?.setCameraZoomLevel(1.35)
                    }
                    className="min-h-[40px] min-w-[40px] rounded-xl border border-[#203651] bg-[#122238] hover:bg-[#192f4d] text-[#eef4ff] flex items-center justify-center transition cursor-pointer"
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
                    className="min-h-[40px] px-3 rounded-xl border border-[#203651] bg-[#122238] hover:bg-[#192f4d] text-xs font-medium text-[#eef4ff] inline-flex items-center gap-1.5 transition cursor-pointer"
                    title="Réinitialiser"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline whitespace-nowrap">
                      Réinitialiser
                    </span>
                  </button>
                </div>
              </div>

              {/* Selected Entity Touch Action Bar (Horizontal Scroll on Mobile) */}
              {selectedEntity && (
                <div className="bg-[#102036] border-b border-[#203651] px-3 py-2 flex items-center gap-2 overflow-x-auto shrink-0">
                  <span className="text-xs font-semibold text-[#8fc5ff] whitespace-nowrap mr-1">
                    {selectedEntity.name}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      viewerControllerRef.current?.setPartVisibility(
                        selectedEntity.name,
                        false
                      )
                    }
                    className="min-h-[38px] px-3 py-1 rounded-xl border border-[#2c4a70] text-xs font-medium hover:bg-[#172e4d] inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
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
                    className="min-h-[38px] px-3 py-1 rounded-xl border border-[#2c4a70] text-xs font-medium hover:bg-[#172e4d] inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
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
                    className="min-h-[38px] px-3 py-1 rounded-xl border border-[#2c4a70] text-xs font-medium hover:bg-[#172e4d] inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
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
                    className="min-h-[38px] px-3 py-1 rounded-xl border border-[#2c4a70] text-xs font-medium hover:bg-[#172e4d] inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Matériau original
                  </button>
                </div>
              )}

              {/* 3D Canvas */}
              <div className="flex-1 relative min-h-0">
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

              {/* Footer Status Hint */}
              <div className="bg-[#0d1a2b] border-t border-[#203651] px-3 py-2 text-center text-xs text-[#b8c7da] truncate shrink-0">
                {selectedEntity ? (
                  <span className="font-semibold text-[#8fc5ff]">
                    Structure sélectionnée : {selectedEntity.name}
                  </span>
                ) : (
                  'Touchez une structure anatomique · pincez pour zoomer · glissez pour tourner'
                )}
              </div>
            </>
          )}
        </main>

        {/* Mobile Bottom Sheet / Modal for Structure Knowledge Graph */}
        {structureModal && (
          <div className="fixed inset-0 bg-black/65 backdrop-blur-xs flex items-end sm:items-center justify-center sm:p-4 z-50">
            <div className="bg-[#0d1a2b] border-t sm:border border-[#2c4a70] rounded-t-3xl sm:rounded-2xl max-w-lg w-full p-5 sm:p-6 shadow-2xl space-y-4 max-h-[85dvh] overflow-y-auto">
              <div className="w-10 h-1.5 bg-[#2c4a70] rounded-full mx-auto mb-1 sm:hidden" />
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-xl sm:text-2xl font-extrabold text-[#eef4ff]">
                    {structureModal.nameFr}
                  </h3>
                  <p className="text-sm sm:text-base text-[#8fc5ff]">
                    {structureModal.nameEn}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setStructureModal(null)}
                  className="min-h-[44px] min-w-[44px] rounded-xl hover:bg-[#182d4a] text-[#b8c7da] flex items-center justify-center cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="text-xs sm:text-sm space-y-1 text-[#b8c7da] bg-[#08111f] p-3.5 rounded-xl border border-[#203651]">
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
                <h4 className="text-sm font-bold text-[#eef4ff] mb-2 tabular-nums">
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

              <div className="flex items-center justify-between pt-2 gap-3">
                <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[#8fc5ff]">
                  {structureModal.meshAvailable ? (
                    <>
                      <Box className="w-4 h-4" />
                      Structure 3D déclarée
                    </>
                  ) : (
                    <>
                      <BookOpen className="w-4 h-4" />
                      Catalogue uniquement
                    </>
                  )}
                </span>

                <button
                  type="button"
                  onClick={() => setStructureModal(null)}
                  className="min-h-[44px] px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold cursor-pointer"
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
      <header className="sticky top-0 z-30 h-14 border-b border-[#203651] bg-[#0d1a2b]/95 backdrop-blur-md px-4 sm:px-6 flex items-center gap-2">
        <button
          type="button"
          onClick={onBack}
          className="min-h-[44px] min-w-[44px] rounded-xl hover:bg-[#162a45] text-[#b8c7da] hover:text-white flex items-center justify-center transition cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="font-bold text-base sm:text-lg truncate">
          {isProf ? 'Espace professeur' : 'Espace étudiant'}
        </h1>
      </header>

      <main className="max-w-4xl w-full mx-auto p-4 sm:p-6 space-y-5">
        {isProf ? (
          <>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold">
                Pilotage pédagogique
              </h2>
              <p className="text-xs sm:text-sm text-[#b8c7da] mt-1">
                Classes, étudiants, examens assignés et résultats réunis au même
                endroit.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-2.5 sm:gap-4">
              <StatCard label="Classes" value={String(classes.length)} />
              <StatCard label="Étudiants" value={String(totalStudents)} />
              <StatCard label="Examens" value={String(exams.length)} />
            </div>

            <SectionCard
              title="Mes classes"
              icon={<Users className="w-5 h-5 text-[#8fc5ff]" />}
            >
              <div className="divide-y divide-[#203651]">
                {classes.map((c) => (
                  <div
                    key={c.id}
                    className="py-3 flex items-center justify-between"
                  >
                    <div>
                      <div className="font-semibold text-sm sm:text-base">
                        {c.name}
                      </div>
                      <div className="text-xs text-[#b8c7da] tabular-nums">
                        {c.studentIds.length} étudiant(s) · {c.description}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </SectionCard>

            <SectionCard
              title="Examens publiés"
              icon={<FileText className="w-5 h-5 text-[#8fc5ff]" />}
            >
              <div className="divide-y divide-[#203651]">
                {exams.map((exam) => (
                  <div
                    key={exam.id}
                    className="py-3 flex items-center justify-between"
                  >
                    <div>
                      <div className="font-semibold text-sm sm:text-base">
                        {exam.title}
                      </div>
                      <div className="text-xs text-[#b8c7da] tabular-nums">
                        {exam.questions.length} question(s) ·{' '}
                        {exam.durationMinutes} min
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
              <p className="text-xs sm:text-sm text-[#b8c7da] leading-relaxed">
                Banque de questions · assignation par classe · calendrier ·
                notes · statistiques · correction · export · parcours
                pédagogiques.
              </p>
            </SectionCard>
          </>
        ) : (
          <>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold">Mon espace</h2>
              <p className="text-xs sm:text-sm text-[#b8c7da] mt-1">
                Examens assignés, résultats, notes et historique
                d’apprentissage.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-2.5 sm:gap-4">
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
                        className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                      >
                        <div>
                          <div className="font-semibold text-sm sm:text-base">
                            {matchedExam
                              ? matchedExam.title
                              : `Examen ${a.examId}`}
                          </div>
                          <div className="text-xs text-[#8fc5ff]">
                            Statut : {statusLabel(a.status)}
                          </div>
                        </div>
                        {matchedExam && (
                          <button
                            type="button"
                            onClick={() => onStartExam(matchedExam)}
                            className="min-h-[44px] px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white whitespace-nowrap cursor-pointer"
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
                <p className="text-sm text-[#71839b]">
                  Aucun résultat disponible.
                </p>
              ) : (
                <div className="divide-y divide-[#203651]">
                  {results.map((r) => (
                    <div
                      key={r.id}
                      className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-1"
                    >
                      <div className="font-semibold text-sm">
                        Examen {r.examId}
                      </div>
                      <div className="text-xs sm:text-sm text-[#8fc5ff] font-medium tabular-nums">
                        {r.score}/{r.maxScore} · {r.percentage.toFixed(1)} % ·
                        Note {gradeForPercentage(r.percentage)}
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
                      <div className="text-xs text-[#71839b] tabular-nums">
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
    <div className="p-3 sm:p-4 rounded-2xl border border-[#203651] bg-[#0d1a2b] text-center">
      <div className="text-xl sm:text-2xl font-extrabold text-[#eef4ff] tabular-nums">
        {value}
      </div>
      <div className="text-xs text-[#b8c7da] mt-1 truncate">{label}</div>
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
    <div className="p-4 sm:p-5 rounded-2xl border border-[#203651] bg-[#0d1a2b] space-y-3">
      <div className="flex items-center gap-2.5">
        {icon}
        <h3 className="text-sm sm:text-base font-bold">{title}</h3>
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
    setQuestions((prev) => [
      ...prev,
      { ...q, id: `${q.id}-${prev.length + 1}` },
    ]);
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
      <header className="sticky top-0 z-30 h-14 border-b border-[#203651] bg-[#0d1a2b]/95 backdrop-blur-md px-4 sm:px-6 flex items-center gap-2">
        <button
          type="button"
          onClick={onBack}
          className="min-h-[44px] min-w-[44px] rounded-xl hover:bg-[#162a45] text-[#b8c7da] hover:text-white flex items-center justify-center transition cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="font-bold text-base sm:text-lg truncate">
          Créateur d’examen
        </h1>
      </header>

      <main className="max-w-3xl w-full mx-auto p-4 sm:p-6 space-y-5">
        {notice && (
          <div className="p-3.5 rounded-xl bg-indigo-500/20 border border-indigo-400/40 text-xs sm:text-sm text-[#8fc5ff] flex items-center justify-between gap-2">
            <span>{notice}</span>
            <button
              type="button"
              onClick={() => setNotice(null)}
              className="min-h-[36px] px-2 text-xs underline shrink-0 cursor-pointer"
            >
              Fermer
            </button>
          </div>
        )}

        <div className="p-4 sm:p-5 rounded-2xl border border-[#203651] bg-[#0d1a2b] space-y-3.5">
          <h2 className="font-bold text-base sm:text-lg">
            Informations de l’examen
          </h2>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Titre de l’examen"
            className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl bg-[#08111f] border border-[#203651] text-sm"
          />
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description"
            className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl bg-[#08111f] border border-[#203651] text-sm"
          />
        </div>

        <div className="p-4 sm:p-5 rounded-2xl border border-[#203651] bg-[#0d1a2b] space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h2 className="font-bold text-base sm:text-lg">
              Nouvelle question
            </h2>
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
                  className={`min-h-[36px] px-3.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
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
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <input
                type="text"
                value={optionsText}
                onChange={(e) => setOptionsText(e.target.value)}
                placeholder="Choix séparés par ; (ex: Cœur; Foie; Rein)"
                className="sm:col-span-2 min-h-[44px] px-3.5 py-2.5 rounded-xl bg-[#08111f] border border-[#203651] text-sm"
              />
              <select
                value={correctIndex}
                onChange={(e) => setCorrectIndex(Number(e.target.value))}
                className="min-h-[44px] px-3.5 py-2.5 rounded-xl bg-[#08111f] border border-[#203651] text-sm"
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
              className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl bg-[#08111f] border border-[#203651] text-sm"
            />
          )}

          {type === ExamQuestionType.Identify3D && (
            <div className="space-y-3 pt-2 border-t border-[#203651]">
              <div className="text-xs font-semibold text-[#8fc5ff]">
                Cible anatomique 3D
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <input
                  type="text"
                  value={conceptId}
                  onChange={(e) => setConceptId(e.target.value)}
                  placeholder="ID FMA / UBERON (ex. FMA:55675)"
                  className="min-h-[44px] px-3.5 py-2 rounded-xl bg-[#08111f] border border-[#203651] text-sm"
                />
                <input
                  type="text"
                  value={conceptFr}
                  onChange={(e) => setConceptFr(e.target.value)}
                  placeholder="Nom français (ex. Cœur)"
                  className="min-h-[44px] px-3.5 py-2 rounded-xl bg-[#08111f] border border-[#203651] text-sm"
                />
                <input
                  type="text"
                  value={conceptEn}
                  onChange={(e) => setConceptEn(e.target.value)}
                  placeholder="Nom anglais (ex. Heart)"
                  className="min-h-[44px] px-3.5 py-2 rounded-xl bg-[#08111f] border border-[#203651] text-sm"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  value={meshFile}
                  onChange={(e) => setMeshFile(e.target.value)}
                  placeholder="Fichier GLB (ex. cardiovascular_male.glb)"
                  className="min-h-[44px] px-3.5 py-2 rounded-xl bg-[#08111f] border border-[#203651] text-sm"
                />
                <input
                  type="text"
                  value={meshNode}
                  onChange={(e) => setMeshNode(e.target.value)}
                  placeholder="Nœud GLB vérifié (ex. Right atrium)"
                  className="min-h-[44px] px-3.5 py-2 rounded-xl bg-[#08111f] border border-[#203651] text-sm"
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
            className="w-full sm:w-auto min-h-[44px] px-4 py-2.5 rounded-xl border border-[#2c4a70] bg-[#132640] hover:bg-[#1b3558] text-sm font-semibold text-[#8fc5ff] inline-flex items-center justify-center gap-2 transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Ajouter la question
          </button>
        </div>

        {/* Question Bank */}
        <div className="p-4 sm:p-5 rounded-2xl border border-[#203651] bg-[#0d1a2b] space-y-3">
          <div>
            <h2 className="font-bold text-base sm:text-lg">
              Banque de questions
            </h2>
            <p className="text-xs text-[#b8c7da]">
              Questions déjà liées à des concepts FMA/UBERON.
            </p>
          </div>
          <div className="divide-y divide-[#203651]">
            {bankQuestions.map((q) => (
              <div
                key={q.id}
                className="py-3 flex items-center justify-between gap-3"
              >
                <div className="min-w-0">
                  <div className="text-sm font-semibold">{q.text}</div>
                  <div className="text-xs text-[#8fc5ff] truncate">
                    {q.conceptNameFr ?? 'Concept non renseigné'} ·{' '}
                    {q.conceptId ?? 'sans ID'}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => importBankQuestion(q)}
                  className="min-h-[44px] px-3.5 py-2 rounded-xl border border-[#2c4a70] hover:bg-[#152842] text-xs font-semibold text-[#8fc5ff] whitespace-nowrap shrink-0 cursor-pointer"
                >
                  + Ajouter
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Current Exam Questions */}
        {questions.length > 0 && (
          <div className="p-4 sm:p-5 rounded-2xl border border-[#203651] bg-[#0d1a2b] space-y-4">
            <h2 className="font-bold text-base sm:text-lg tabular-nums">
              Questions de l’examen ({questions.length})
            </h2>
            <div className="divide-y divide-[#203651]">
              {questions.map((q, idx) => (
                <div key={q.id} className="py-2.5 flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-indigo-600/30 text-[#8fc5ff] text-xs font-bold flex items-center justify-center shrink-0 tabular-nums">
                    {idx + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium">{q.text}</div>
                    <div className="text-xs text-[#71839b]">
                      {q.type === ExamQuestionType.Identify3D
                        ? `Identification 3D · ${q.conceptId ?? 'sans concept'}`
                        : q.type === ExamQuestionType.Quiz
                        ? `QCM · ${q.conceptId ?? 'sans concept'}`
                        : `Question libre · ${q.conceptId ?? 'sans concept'}`}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={saveExam}
              className="w-full min-h-[48px] py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold flex items-center justify-center gap-2 transition cursor-pointer"
            >
              <Lock className="w-4 h-4" />
              Publier l’examen sécurisé
            </button>
          </div>
        )}

        {showExisting && (
          <div className="p-4 sm:p-5 rounded-2xl border border-[#203651] bg-[#0d1a2b] space-y-3">
            <h2 className="font-bold text-base sm:text-lg">
              Examens enregistrés
            </h2>
            <div className="divide-y divide-[#203651]">
              {existingExams.map((exam) => (
                <div key={exam.id} className="py-3">
                  <div className="font-semibold text-sm sm:text-base">
                    {exam.title}
                  </div>
                  <div className="text-xs text-[#b8c7da] tabular-nums">
                    {exam.questions.length} question(s) · {exam.durationMinutes}{' '}
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
      <header className="sticky top-0 z-30 h-14 border-b border-[#203651] bg-[#0d1a2b]/95 backdrop-blur-md px-4 sm:px-6 flex items-center gap-2">
        <button
          type="button"
          onClick={onBack}
          className="min-h-[44px] min-w-[44px] rounded-xl hover:bg-[#162a45] text-[#b8c7da] hover:text-white flex items-center justify-center transition cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="font-bold text-base sm:text-lg truncate">
          Examens disponibles
        </h1>
      </header>

      <main className="max-w-3xl w-full mx-auto p-4 sm:p-6 space-y-3">
        {exams.map((exam) => (
          <button
            key={exam.id}
            type="button"
            onClick={() => onSelectExam(exam)}
            className="w-full min-h-[72px] text-left p-4 sm:p-5 rounded-2xl border border-[#203651] bg-[#0d1a2b] hover:border-[#8fc5ff] active:scale-[0.99] transition flex items-center justify-between gap-4 cursor-pointer"
          >
            <div className="min-w-0">
              <div className="font-bold text-sm sm:text-base text-[#eef4ff] truncate">
                {exam.title}
              </div>
              <div className="text-xs text-[#b8c7da] mt-0.5 tabular-nums">
                {exam.questions.length} question(s) · {exam.durationMinutes} min
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-[#8fc5ff] shrink-0" />
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
      return ans.toLowerCase() === (question.meshNode || '').toLowerCase();
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
    AcademicRepository.instance.markAssignmentSubmitted(
      exam.id,
      'student-demo'
    );
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
      <header className="sticky top-0 z-30 h-14 border-b border-[#203651] bg-[#0d1a2b] px-4 sm:px-6 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <Lock className="w-4 h-4 text-amber-400 shrink-0" />
          <h1 className="font-bold text-sm sm:text-base truncate">
            {exam.title}
          </h1>
        </div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#08111f] border border-[#2c4a70] font-mono text-xs sm:text-sm text-[#8fc5ff] tabular-nums shrink-0">
          <Clock className="w-3.5 h-3.5" />
          {minutes}:{String(seconds).padStart(2, '0')}
        </div>
      </header>

      <main className="max-w-3xl w-full mx-auto p-4 sm:p-6 space-y-4">
        <div className="p-3.5 rounded-2xl border border-amber-500/30 bg-amber-500/10 flex items-center gap-3">
          <Lock className="w-5 h-5 text-amber-300 shrink-0" />
          <div>
            <div className="font-semibold text-xs sm:text-sm text-amber-200">
              Mode examen sécurisé
            </div>
            <div className="text-xs text-amber-200/80">
              L’atlas anatomique est masqué pendant cette épreuve.
            </div>
          </div>
        </div>

        <div className="p-4 sm:p-6 rounded-2xl border border-[#203651] bg-[#0d1a2b] space-y-5">
          <div className="flex items-center justify-between text-xs text-[#8fc5ff] font-medium tabular-nums">
            <span>
              Question {currentIndex + 1} / {exam.questions.length}
            </span>
            <span>
              {question.points} pt ·{' '}
              {question.type === ExamQuestionType.Identify3D
                ? 'Identification 3D'
                : question.type === ExamQuestionType.Quiz
                ? 'QCM'
                : 'Réponse libre'}
            </span>
          </div>

          <h2 className="text-lg sm:text-xl font-bold text-[#eef4ff]">
            {question.text}
          </h2>

          {question.type === ExamQuestionType.Quiz && (
            <div className="space-y-2.5">
              {question.options.map((opt) => {
                const checked = answers[question.id] === opt;
                return (
                  <label
                    key={opt}
                    className={`min-h-[48px] flex items-center gap-3 p-3.5 rounded-xl border transition cursor-pointer ${
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
                      className="accent-indigo-500 w-4 h-4"
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
                  heightClass="h-[320px] sm:h-[400px]"
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
              <div className="p-3 rounded-xl bg-[#08111f] border border-[#203651] text-xs flex flex-wrap items-center justify-between gap-2">
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
              className="w-full min-h-[48px] py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition cursor-pointer"
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
            <p className="text-lg text-[#8fc5ff] font-semibold tabular-nums">
              Résultat : {submittedResult.earned} / {submittedResult.total}{' '}
              points
            </p>
            <button
              type="button"
              onClick={onFinish}
              className="w-full min-h-[48px] py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold cursor-pointer"
            >
              Terminer
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
