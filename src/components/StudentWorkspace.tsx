import React, { useState, useMemo } from 'react';
import {
  BookOpen,
  Award,
  Box,
  CheckCircle2,
  Clock,
  ChevronRight,
  TrendingUp,
  Sparkles,
  ArrowRight,
  RotateCcw,
  GraduationCap,
  FileText,
  Search,
  Filter,
  Check,
  AlertTriangle,
  Layers,
  ChevronLeft,
  Eye,
  Activity,
  Compass,
} from 'lucide-react';
import {
  AnatomyExam,
  AnatomyRole,
  ExamAssignment,
  StudentExamResult,
  AnatomySystem,
} from '../types';
import { UserRecord } from '../firebase';
import { gradeForPercentage } from '../data/repositories';

interface StudentWorkspaceProps {
  userProfile: UserRecord | null;
  exams: AnatomyExam[];
  assignments: ExamAssignment[];
  results: StudentExamResult[];
  onOpenAtlas: (system?: string) => void;
  onStartExam: (exam: AnatomyExam) => void;
  onOpenProfile: () => void;
}

// Medical active recall flashcards bank
interface Flashcard {
  id: string;
  system: string;
  question: string;
  answer: string;
  clinicalPearl: string;
  latinTerm: string;
}

const MEDICAL_FLASHCARDS: Flashcard[] = [
  {
    id: 'fc-1',
    system: 'Neuro-anatomie',
    question: 'Quel nerf crânien traverse le foramen ovale de la grande aile du sphénoïde ?',
    answer: 'Le nerf mandibulaire (V3), branche terminale mixte du nerf trijumeau (V), accompagné de la petite artère méningée.',
    clinicalPearl: 'Responsable de la motricité des muscles masticateurs (masséter, temporal, ptérygoïdiens) et de la sensibilité du tiers inférieur de la face.',
    latinTerm: 'Nervus mandibularis (CN V3)',
  },
  {
    id: 'fc-2',
    system: 'Appareil Locomoteur',
    question: 'Quels sont les 4 muscles constitutifs de la coiffe des rotateurs de l’épaule ?',
    answer: 'Muscles supra-épineux, infra-épineux, petit rond (loge postérieure) et subscapulaire (loge antérieure).',
    clinicalPearl: 'Le tendon du supra-épineux est le plus fréquemment sujet aux ruptures dégénératives et aux conflits sous-acromiaux.',
    latinTerm: 'Musculi rotatores humeri',
  },
  {
    id: 'fc-3',
    system: 'Cardio-vasculaire',
    question: 'Où naissent précisément les artères coronaires gauche et droite ?',
    answer: 'Au niveau des sinus de Valsalva aortiques (sinus antéro-gauche et antérieur droit), juste au-dessus des valvules semi-lunaires de la valve aortique.',
    clinicalPearl: 'Leur remplissage s’effectue préférentiellement en diastole ventriculaire lors de la fermeture de la valve aortique.',
    latinTerm: 'Arteriae coronariae dextra et sinistra',
  },
  {
    id: 'fc-4',
    system: 'Ostéologie & Rachis',
    question: 'Quelle est la particularité anatomique majeure de la deuxième vertèbre cervicale (Axis / C2) ?',
    answer: 'La présence de la dent de l’axis (processus odontoïde) qui s’articule avec la fossette odontoïde de l’arc antérieur de l’Atlas (C1).',
    clinicalPearl: 'Sert de pivot lors des mouvements de rotation de la tête (environ 50% de l’amplitude rotatoire totale du cou).',
    latinTerm: 'Dens axis (processus odontoideus)',
  },
  {
    id: 'fc-5',
    system: 'Viscères & Splanchnologie',
    question: 'Quelles sont les trois branches principales issues directement du tronc cœliaque en T12 ?',
    answer: 'L’artère gastrique gauche (coronaire stomachique), l’artère splénique et l’artère hépatique commune.',
    clinicalPearl: 'Assure l’irrigation de tout l’intestin antérieur primitif (estomac, foie, vésicule biliaire, rate, pancréas et duodénum proximal).',
    latinTerm: 'Truncus coeliacus',
  },
  {
    id: 'fc-6',
    system: 'Respiratoire',
    question: 'Combien de segments bronchopulmonaires compte le poumon droit comparativement au poumon gauche ?',
    answer: 'Le poumon droit comprend 10 segments répartis sur 3 lobes (supérieur, moyen, inférieur), tandis que le gauche en compte 8 à 10 sur 2 lobes.',
    clinicalPearl: 'La bronche principale droite est plus large, plus courte et plus verticale, expliquant la prédilection des inhalations de corps étrangers.',
    latinTerm: 'Segmenta bronchopulmonalia',
  },
];

const ANATOMY_SYSTEM_PREVIEWS = [
  { id: AnatomySystem.Skeletal, name: 'Squelettique', count: '206 os répertoriés', desc: 'Rachis, crâne, cage thoracique et membres squelettiques.' },
  { id: AnatomySystem.Muscular, name: 'Musculaire', count: '640+ muscles', desc: 'Muscles striés squelettiques, aponévroses et loges musculaires.' },
  { id: AnatomySystem.Cardiovascular, name: 'Cardiovasculaire', count: 'Cœur & Réseau hémodynamique', desc: 'Cavités cardiaques, circulation coronaire et grands troncs.' },
  { id: AnatomySystem.Nervous, name: 'Nerveux', count: '12 paires crâniennes & Moelle', desc: 'Système nerveux central, encéphale et plexus périphériques.' },
  { id: AnatomySystem.Digestive, name: 'Digestif & Viscères', count: 'Tube digestif & Glandes annexes', desc: 'Péritoine, foie, loge pancréatique et mésentère.' },
  { id: AnatomySystem.Respiratory, name: 'Respiratoire', count: 'Arbre trachéo-bronchique', desc: 'Larynx, plèvres pariétale/viscérale et lobes pulmonaires.' },
];

export function StudentWorkspace({
  userProfile,
  exams,
  assignments,
  results,
  onOpenAtlas,
  onStartExam,
  onOpenProfile,
}: StudentWorkspaceProps) {
  const [activeTab, setActiveTab] = useState<'exams' | 'atlas' | 'flashcards' | 'transcript'>('exams');
  const [examFilter, setExamFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [examSearch, setExamSearch] = useState('');

  // Flashcards state
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [masteredCards, setMasteredCards] = useState<string[]>([]);
  const [needsReviewCards, setNeedsReviewCards] = useState<string[]>([]);

  // Selected Exam for Details Modal
  const [selectedExamDetails, setSelectedExamDetails] = useState<AnatomyExam | null>(null);

  const currentCard = MEDICAL_FLASHCARDS[currentCardIndex];

  const handleNextCard = () => {
    setIsFlipped(false);
    setCurrentCardIndex((prev) => (prev + 1) % MEDICAL_FLASHCARDS.length);
  };

  const handlePrevCard = () => {
    setIsFlipped(false);
    setCurrentCardIndex((prev) => (prev - 1 + MEDICAL_FLASHCARDS.length) % MEDICAL_FLASHCARDS.length);
  };

  const markMastered = (id: string) => {
    setNeedsReviewCards((prev) => prev.filter((c) => c !== id));
    setMasteredCards((prev) => (prev.includes(id) ? prev : [...prev, id]));
    handleNextCard();
  };

  const markNeedsReview = (id: string) => {
    setMasteredCards((prev) => prev.filter((c) => c !== id));
    setNeedsReviewCards((prev) => (prev.includes(id) ? prev : [...prev, id]));
    handleNextCard();
  };

  // Metrics calculation
  const totalExams = exams.length;
  const completedResults = results.length;
  const averagePercentage =
    completedResults > 0
      ? Math.round(
          results.reduce((acc, curr) => acc + (curr.percentage || 0), 0) /
            completedResults
        )
      : null;

  const passedCount = results.filter((r) => r.percentage >= 60).length;

  const filteredExams = useMemo(() => {
    return exams.filter((exam) => {
      const isCompleted = results.some((r) => r.examId === exam.id);
      const matchesSearch =
        exam.title.toLowerCase().includes(examSearch.toLowerCase()) ||
        (exam.targetSystem && exam.targetSystem.toLowerCase().includes(examSearch.toLowerCase())) ||
        exam.description.toLowerCase().includes(examSearch.toLowerCase());

      if (!matchesSearch) return false;
      if (examFilter === 'pending') return !isCompleted;
      if (examFilter === 'completed') return isCompleted;
      return true;
    });
  }, [exams, results, examFilter, examSearch]);

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8 pb-16 text-[#F5F7FA]">
      {/* 1. Medical Student Clinical Profile Header */}
      <section className="p-6 md:p-8 rounded-2xl bg-[#161C24] border border-[#263140] transition">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-xl bg-[#232C3A] border border-[#2D3847] text-[#E5DCD0] flex items-center justify-center font-bold text-xl shrink-0">
              {(userProfile?.displayName || 'E')[0].toUpperCase()}
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-xl md:text-2xl font-bold tracking-tight text-[#F5F7FA]">
                  {userProfile?.displayName || 'Étudiant en Médecine'}
                </h1>
                <span className="text-xs font-medium text-[#E5DCD0]">
                  {userProfile?.academicYear || 'DFGSM 2'}
                </span>
                <span className="text-xs text-[#8F9CAE]">
                  {userProfile?.matricule ? `Matricule ${userProfile.matricule}` : 'Espace Étudiant'}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-[#8F9CAE] flex-wrap">
                <span>{userProfile?.university || 'Faculté de Médecine'}</span>
                <span aria-hidden="true">·</span>
                <span className="text-[#BCC7D5]">{userProfile?.specialty || 'Anatomie Humaine & Organogénèse'}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0 flex-wrap">
            <button
              type="button"
              onClick={onOpenProfile}
              className="px-4 py-2 text-xs font-semibold text-[#BCC7D5] hover:text-[#F5F7FA] bg-[#1D2530] hover:bg-[#232C3A] border border-[#263140] rounded-xl transition cursor-pointer"
            >
              Éditer mon profil
            </button>
            <button
              type="button"
              onClick={() => onOpenAtlas()}
              className="px-4 py-2 text-xs font-bold text-[#0F1318] bg-[#E5DCD0] hover:bg-[#F5EFEB] rounded-xl transition cursor-pointer inline-flex items-center gap-2"
            >
              <Box className="w-4 h-4" />
              <span>Ouvrir l'Atlas 3D</span>
            </button>
          </div>
        </div>

        {/* Quiet Performance Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-[#263140]">
          <div>
            <div className="text-xs text-[#8F9CAE]">Évaluations Actives</div>
            <div className="text-2xl font-bold text-[#F5F7FA] mt-1 tabular-nums">
              {totalExams}
            </div>
            <div className="text-xs text-[#8F9CAE] mt-0.5">
              {totalExams - completedResults} restante(s)
            </div>
          </div>

          <div>
            <div className="text-xs text-[#8F9CAE]">Épreuves Validées</div>
            <div className="text-2xl font-bold text-emerald-400 mt-1 tabular-nums">
              {completedResults}
            </div>
            <div className="text-xs text-[#8F9CAE] mt-0.5">
              {passedCount} avec mention requise
            </div>
          </div>

          <div>
            <div className="text-xs text-[#8F9CAE]">Moyenne Pondérée</div>
            <div className="text-2xl font-bold text-[#E5DCD0] mt-1 tabular-nums">
              {averagePercentage !== null ? `${averagePercentage}%` : '—'}
            </div>
            <div className="text-xs text-[#8F9CAE] mt-0.5">
              {averagePercentage !== null ? `Mention ${gradeForPercentage(averagePercentage)}` : 'En attente de copies'}
            </div>
          </div>

          <div>
            <div className="text-xs text-[#8F9CAE]">Flashcards Maîtrisées</div>
            <div className="text-2xl font-bold text-sky-400 mt-1 tabular-nums">
              {masteredCards.length} / {MEDICAL_FLASHCARDS.length}
            </div>
            <div className="text-xs text-[#8F9CAE] mt-0.5">
              Rappel actif en cours
            </div>
          </div>
        </div>
      </section>

      {/* 2. Interactive Navigation Deck (Segmented Controls) */}
      <nav aria-label="Espace de travail étudiant" className="flex items-center gap-1.5 p-1 bg-[#161C24] border border-[#263140] rounded-xl overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab('exams')}
          className={`flex-1 min-w-[140px] py-2 px-3 text-xs font-semibold rounded-lg transition whitespace-nowrap cursor-pointer flex items-center justify-center gap-2 ${
            activeTab === 'exams'
              ? 'bg-[#E5DCD0] text-[#0F1318]'
              : 'text-[#8F9CAE] hover:text-[#F5F7FA] hover:bg-[#1D2530]'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Évaluations & Examens</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('atlas')}
          className={`flex-1 min-w-[140px] py-2 px-3 text-xs font-semibold rounded-lg transition whitespace-nowrap cursor-pointer flex items-center justify-center gap-2 ${
            activeTab === 'atlas'
              ? 'bg-[#E5DCD0] text-[#0F1318]'
              : 'text-[#8F9CAE] hover:text-[#F5F7FA] hover:bg-[#1D2530]'
          }`}
        >
          <Compass className="w-4 h-4" />
          <span>Studio Anatomie 3D</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('flashcards')}
          className={`flex-1 min-w-[140px] py-2 px-3 text-xs font-semibold rounded-lg transition whitespace-nowrap cursor-pointer flex items-center justify-center gap-2 ${
            activeTab === 'flashcards'
              ? 'bg-[#E5DCD0] text-[#0F1318]'
              : 'text-[#8F9CAE] hover:text-[#F5F7FA] hover:bg-[#1D2530]'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Rappel Actif & Flashcards</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('transcript')}
          className={`flex-1 min-w-[140px] py-2 px-3 text-xs font-semibold rounded-lg transition whitespace-nowrap cursor-pointer flex items-center justify-center gap-2 ${
            activeTab === 'transcript'
              ? 'bg-[#E5DCD0] text-[#0F1318]'
              : 'text-[#8F9CAE] hover:text-[#F5F7FA] hover:bg-[#1D2530]'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>Relevé Académique</span>
        </button>
      </nav>

      {/* 3. Tab Contents */}

      {/* TAB 1: EXAMS & EVALUATIONS */}
      {activeTab === 'exams' && (
        <div className="space-y-6">
          {/* Filter Bar & Search */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 p-1 bg-[#161C24] border border-[#263140] rounded-xl self-start">
              <button
                type="button"
                onClick={() => setExamFilter('all')}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition cursor-pointer ${
                  examFilter === 'all'
                    ? 'bg-[#1D2530] text-[#F5F7FA] border border-[#263140]'
                    : 'text-[#8F9CAE] hover:text-[#F5F7FA]'
                }`}
              >
                Tous ({exams.length})
              </button>
              <button
                type="button"
                onClick={() => setExamFilter('pending')}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition cursor-pointer ${
                  examFilter === 'pending'
                    ? 'bg-[#1D2530] text-[#F5F7FA] border border-[#263140]'
                    : 'text-[#8F9CAE] hover:text-[#F5F7FA]'
                }`}
              >
                À composer ({exams.length - completedResults})
              </button>
              <button
                type="button"
                onClick={() => setExamFilter('completed')}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition cursor-pointer ${
                  examFilter === 'completed'
                    ? 'bg-[#1D2530] text-[#F5F7FA] border border-[#263140]'
                    : 'text-[#8F9CAE] hover:text-[#F5F7FA]'
                }`}
              >
                Validés ({completedResults})
              </button>
            </div>

            <div className="relative min-w-[240px]">
              <Search className="w-4 h-4 text-[#8F9CAE] absolute left-3 top-2.5" />
              <input
                type="text"
                value={examSearch}
                onChange={(e) => setExamSearch(e.target.value)}
                placeholder="Rechercher par titre ou système…"
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-[#161C24] border border-[#263140] rounded-xl text-[#F5F7FA] placeholder-[#8F9CAE] focus:outline-none focus:border-[#E5DCD0]"
              />
            </div>
          </div>

          {/* Exam Grid */}
          {filteredExams.length === 0 ? (
            <div className="p-8 text-center rounded-2xl bg-[#161C24] border border-[#263140] space-y-2">
              <p className="text-sm font-semibold text-[#F5F7FA]">Aucun examen ne correspond à vos critères</p>
              <p className="text-xs text-[#8F9CAE]">Modifiez vos filtres ou effectuez une recherche différente.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredExams.map((exam) => {
                const matchedResult = results.find((r) => r.examId === exam.id);
                const isCompleted = !!matchedResult;

                return (
                  <div
                    key={exam.id}
                    className="p-5 rounded-2xl bg-[#161C24] border border-[#263140] hover:border-[#384659] transition flex flex-col justify-between space-y-4"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs text-[#8F9CAE]">
                        <span>{exam.targetSystem || 'Anatomie Générale'}</span>
                        {isCompleted ? (
                          <span className="text-emerald-400 font-medium flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Validé · {matchedResult.score}/{matchedResult.maxScore}</span>
                          </span>
                        ) : (
                          <span className="text-amber-400 font-medium">À passer</span>
                        )}
                      </div>

                      <h3 className="text-base font-bold text-[#F5F7FA]">
                        {exam.title}
                      </h3>
                      <p className="text-xs text-[#8F9CAE] line-clamp-2 leading-relaxed">
                        {exam.description}
                      </p>

                      <div className="flex items-center gap-3 text-xs text-[#8F9CAE] pt-1">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          <span className="tabular-nums">{exam.durationMinutes} min</span>
                        </span>
                        <span aria-hidden="true">·</span>
                        <span className="tabular-nums">{exam.questions.length} questions</span>
                        <span aria-hidden="true">·</span>
                        <span>{exam.targetCohort || 'DFGSM'}</span>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-[#263140] flex items-center justify-between gap-3">
                      <button
                        type="button"
                        onClick={() => setSelectedExamDetails(exam)}
                        className="text-xs text-[#BCC7D5] hover:text-[#F5F7FA] font-medium transition cursor-pointer"
                      >
                        Détails du programme
                      </button>

                      <button
                        type="button"
                        onClick={() => onStartExam(exam)}
                        className={`px-4 py-2 text-xs font-bold rounded-xl transition cursor-pointer inline-flex items-center gap-1.5 ${
                          isCompleted
                            ? 'bg-[#1D2530] text-[#BCC7D5] hover:bg-[#232C3A]'
                            : 'bg-[#E5DCD0] text-[#0F1318] hover:bg-[#F5EFEB]'
                        }`}
                      >
                        <span>{isCompleted ? 'Recommencer pour s’entraîner' : 'Commencer l’épreuve'}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: STUDIO ANATOMIE 3D */}
      {activeTab === 'atlas' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-[#F5F7FA]">Studio d’Exploration Anatomique 3D</h2>
              <p className="text-xs text-[#8F9CAE] mt-0.5">
                Sélectionnez un système anatomique pour charger les géométries 3D certifiées et isoler les structures.
              </p>
            </div>
            <button
              type="button"
              onClick={() => onOpenAtlas()}
              className="px-3.5 py-1.5 text-xs font-semibold text-[#0F1318] bg-[#E5DCD0] hover:bg-[#F5EFEB] rounded-xl transition cursor-pointer"
            >
              Atlas Complet
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {ANATOMY_SYSTEM_PREVIEWS.map((sys) => (
              <div
                key={sys.id}
                className="p-5 rounded-2xl bg-[#161C24] border border-[#263140] hover:border-[#384659] transition flex flex-col justify-between space-y-4"
              >
                <div className="space-y-2">
                  <div className="text-xs font-medium text-[#E5DCD0]">
                    Système {sys.name}
                  </div>
                  <h3 className="text-sm font-bold text-[#F5F7FA]">{sys.count}</h3>
                  <p className="text-xs text-[#8F9CAE] leading-relaxed">
                    {sys.desc}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => onOpenAtlas(sys.id)}
                  className="w-full py-2 px-3 text-xs font-semibold text-[#BCC7D5] hover:text-[#F5F7FA] bg-[#1D2530] hover:bg-[#232C3A] rounded-xl transition cursor-pointer flex items-center justify-between"
                >
                  <span>Explorer en 3D</span>
                  <ChevronRight className="w-4 h-4 text-[#8F9CAE]" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: FLASHCARDS & RAPPEL ACTIF */}
      {activeTab === 'flashcards' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-[#F5F7FA]">Rappel Actif Spécifique — Anatomie Humaine</h2>
              <p className="text-xs text-[#8F9CAE] mt-0.5">
                Méthode de répétition espacée : formulez mentalement la réponse avant de retourner la fiche.
              </p>
            </div>
            <div className="text-xs text-[#8F9CAE] tabular-nums font-mono">
              Fiche {currentCardIndex + 1} sur {MEDICAL_FLASHCARDS.length}
            </div>
          </div>

          {/* Flashcard Component */}
          <div
            onClick={() => setIsFlipped(!isFlipped)}
            className="w-full min-h-[260px] p-6 sm:p-8 rounded-2xl bg-[#161C24] border border-[#263140] hover:border-[#384659] transition cursor-pointer flex flex-col justify-between"
          >
            <div className="flex items-center justify-between text-xs text-[#8F9CAE]">
              <span>{currentCard.system}</span>
              <span className="font-mono text-[11px]">{currentCard.latinTerm}</span>
            </div>

            <div className="my-6 text-center">
              {!isFlipped ? (
                <div className="space-y-3">
                  <span className="text-xs text-[#E5DCD0]">Question d'évaluation</span>
                  <p className="text-base sm:text-lg font-semibold text-[#F5F7FA] max-w-xl mx-auto leading-relaxed">
                    {currentCard.question}
                  </p>
                  <p className="text-xs text-[#8F9CAE] pt-2">
                    Cliquez sur la fiche pour afficher la réponse anatomique
                  </p>
                </div>
              ) : (
                <div className="space-y-3 animate-in fade-in duration-150">
                  <span className="text-xs text-emerald-400">Réponse anatomique</span>
                  <p className="text-sm sm:text-base font-medium text-[#F5F7FA] max-w-xl mx-auto leading-relaxed">
                    {currentCard.answer}
                  </p>
                  <div className="p-3 mt-3 rounded-xl bg-[#1D2530] text-xs text-[#BCC7D5] max-w-lg mx-auto text-left leading-relaxed">
                    <strong className="text-[#E5DCD0]">Intérêt clinique : </strong>
                    {currentCard.clinicalPearl}
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between text-xs text-[#8F9CAE] pt-3 border-t border-[#263140]">
              <span>Cliquez pour basculer Recto / Verso</span>
              <span>{masteredCards.includes(currentCard.id) ? '✓ Marqué maîtrisé' : 'En apprentissage'}</span>
            </div>
          </div>

          {/* Flashcard Actions & Rating */}
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handlePrevCard}
                className="p-2 text-xs font-semibold bg-[#161C24] hover:bg-[#1D2530] border border-[#263140] rounded-xl transition cursor-pointer text-[#BCC7D5]"
                title="Précédent"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleNextCard}
                className="p-2 text-xs font-semibold bg-[#161C24] hover:bg-[#1D2530] border border-[#263140] rounded-xl transition cursor-pointer text-[#BCC7D5]"
                title="Suivant"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => markNeedsReview(currentCard.id)}
                className="px-3.5 py-2 text-xs font-medium text-amber-300 bg-[#1D2530] hover:bg-[#232C3A] border border-[#263140] rounded-xl transition cursor-pointer"
              >
                À revoir
              </button>
              <button
                type="button"
                onClick={() => markMastered(currentCard.id)}
                className="px-4 py-2 text-xs font-bold text-[#0F1318] bg-[#E5DCD0] hover:bg-[#F5EFEB] rounded-xl transition cursor-pointer inline-flex items-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Maîtrisé</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: TRANSCRIPT & GRADES */}
      {activeTab === 'transcript' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-[#F5F7FA]">Relevé de Notes & Historique d'Évaluation</h2>
              <p className="text-xs text-[#8F9CAE] mt-0.5">
                Copies soumises et archivées sur le serveur académique.
              </p>
            </div>
            <div className="text-xs text-[#8F9CAE] tabular-nums font-mono">
              Total : {results.length} épreuves
            </div>
          </div>

          {results.length === 0 ? (
            <div className="p-8 text-center rounded-2xl bg-[#161C24] border border-[#263140] space-y-2">
              <p className="text-sm font-semibold text-[#F5F7FA]">Aucune note enregistrée pour le moment</p>
              <p className="text-xs text-[#8F9CAE]">Passez votre première épreuve pour faire apparaître vos résultats.</p>
            </div>
          ) : (
            <div className="rounded-2xl bg-[#161C24] border border-[#263140] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#1D2530] text-[#8F9CAE] font-medium border-b border-[#263140]">
                    <tr>
                      <th className="py-3 px-4">Épreuve</th>
                      <th className="py-3 px-4">Date de soumission</th>
                      <th className="py-3 px-4 text-right">Score</th>
                      <th className="py-3 px-4 text-right">Pourcentage</th>
                      <th className="py-3 px-4 text-center">Mention</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#263140]">
                    {results.map((res) => {
                      const matchedExam = exams.find((e) => e.id === res.examId);
                      const mention = gradeForPercentage(res.percentage);

                      return (
                        <tr key={res.id} className="hover:bg-[#1D2530]/50 transition">
                          <td className="py-3 px-4">
                            <div className="font-semibold text-[#F5F7FA]">
                              {matchedExam?.title || `Examen ${res.examId}`}
                            </div>
                            <div className="text-[11px] text-[#8F9CAE]">
                              {matchedExam?.targetSystem || 'Anatomie'}
                            </div>
                          </td>
                          <td className="py-3 px-4 text-[#8F9CAE] tabular-nums">
                            {new Date(res.submittedAt).toLocaleDateString('fr-FR', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric',
                            })}
                          </td>
                          <td className="py-3 px-4 text-right font-mono tabular-nums text-[#F5F7FA]">
                            {res.score} / {res.maxScore}
                          </td>
                          <td className="py-3 px-4 text-right font-mono tabular-nums text-emerald-400 font-semibold">
                            {res.percentage.toFixed(1)}%
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span className="font-mono text-xs font-bold text-[#E5DCD0]">
                              {mention}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Program Details Drawer / Modal */}
      {selectedExamDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl bg-[#161C24] border border-[#263140] p-6 space-y-4 text-[#F5F7FA]">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs text-[#E5DCD0] font-medium">
                  {selectedExamDetails.targetSystem || 'Anatomie'} · {selectedExamDetails.targetCohort || 'DFGSM'}
                </span>
                <h3 className="text-lg font-bold text-[#F5F7FA] mt-1">
                  {selectedExamDetails.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedExamDetails(null)}
                className="text-[#8F9CAE] hover:text-[#F5F7FA] p-1 text-base cursor-pointer"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-[#8F9CAE] leading-relaxed">
              {selectedExamDetails.description}
            </p>

            <div className="p-3.5 rounded-xl bg-[#1D2530] text-xs text-[#BCC7D5] space-y-2">
              <div className="flex items-center justify-between">
                <span>Durée de l'épreuve :</span>
                <span className="font-mono tabular-nums text-[#F5F7FA]">{selectedExamDetails.durationMinutes} minutes</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Nombre de questions :</span>
                <span className="font-mono tabular-nums text-[#F5F7FA]">{selectedExamDetails.questions.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Accès à l'Atlas 3D en cours d'épreuve :</span>
                <span className="font-medium text-[#F5F7FA]">{selectedExamDetails.hideAnatomy ? 'Masqué (Mode sécurisé)' : 'Autorisé'}</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#263140]">
              <button
                type="button"
                onClick={() => setSelectedExamDetails(null)}
                className="px-4 py-2 text-xs font-medium text-[#8F9CAE] hover:text-[#F5F7FA] cursor-pointer"
              >
                Fermer
              </button>
              <button
                type="button"
                onClick={() => {
                  const examToStart = selectedExamDetails;
                  setSelectedExamDetails(null);
                  onStartExam(examToStart);
                }}
                className="px-4 py-2 text-xs font-bold text-[#0F1318] bg-[#E5DCD0] hover:bg-[#F5EFEB] rounded-xl transition cursor-pointer"
              >
                Passer l'épreuve maintenant
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
