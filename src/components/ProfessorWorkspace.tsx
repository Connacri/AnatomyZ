import React, { useState, useMemo } from 'react';
import {
  FilePlus,
  Users,
  Award,
  Box,
  CheckCircle2,
  Clock,
  Eye,
  Edit,
  Trash2,
  Copy,
  BookOpen,
  ArrowRight,
  TrendingUp,
  GraduationCap,
  Sparkles,
  Search,
  Filter,
  Download,
  Plus,
  Compass,
  Check,
  AlertCircle,
  FileSpreadsheet,
} from 'lucide-react';
import {
  AcademicClass,
  AnatomyExam,
  StudentExamResult,
  ExamQuestionType,
} from '../types';
import { UserRecord } from '../firebase';
import { gradeForPercentage, AnatomyExamRepository } from '../data/repositories';

interface ProfessorWorkspaceProps {
  userProfile: UserRecord | null;
  exams: AnatomyExam[];
  classes: AcademicClass[];
  results: StudentExamResult[];
  onOpenAtlas: (system?: string) => void;
  onOpenExamEditor: () => void;
  onOpenProfile: () => void;
  onPreviewExam: (exam: AnatomyExam) => void;
}

const AMPHITHEATER_DEMOS = [
  {
    id: 'demo-skull',
    title: 'Base du crâne & Paires crâniennes',
    system: 'nervous',
    systemFr: 'Système Nerveux',
    description: 'Démonstration des foramens (ovale, rond, jugulaire) et trajets des nerfs trijumeau et facial.',
    keyPoints: 'Foramen ovale (V3), canal carotidien, foramen magnum.',
  },
  {
    id: 'demo-heart',
    title: 'Anatomie Cardiaque & Artères Coronaires',
    system: 'cardiovascular',
    systemFr: 'Cardiovasculaire',
    description: 'Vascularisation du myocarde, artère interventriculaire antérieure et drainage par le sinus coronaire.',
    keyPoints: 'Sinus de Valsalva, coronaire gauche vs droite, apex cardiaque.',
  },
  {
    id: 'demo-spine',
    title: 'Biomécanique Rachidienne & Vertèbre C2',
    system: 'skeletal',
    systemFr: 'Squelettique',
    description: 'Morphologie de l’Atlas et de l’Axis, ligaments alaires et apophyse odontoïde en 3D.',
    keyPoints: 'Dent de l’axis, foramen transversaire, canal vertébral.',
  },
  {
    id: 'demo-viscera',
    title: 'Tronc Cœliaque & Organogénèse Abdominale',
    system: 'digestive',
    systemFr: 'Digestif & Viscères',
    description: 'Branches trifurquées du tronc cœliaque et rapports péritonéaux du bloc duodéno-pancréatique.',
    keyPoints: 'Artère gastrique gauche, hépatique commune, splénique.',
  },
];

export function ProfessorWorkspace({
  userProfile,
  exams: initialExams,
  classes: initialClasses,
  results,
  onOpenAtlas,
  onOpenExamEditor,
  onOpenProfile,
  onPreviewExam,
}: ProfessorWorkspaceProps) {
  const [activeTab, setActiveTab] = useState<'exams' | 'cohorts' | 'submissions' | 'amphi'>('exams');
  const [examList, setExamList] = useState<AnatomyExam[]>(initialExams);
  const [classesList, setClassesList] = useState<AcademicClass[]>(initialClasses);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft'>('all');

  // Exam Submissions / Inspection state
  const [selectedSubmission, setSelectedSubmission] = useState<StudentExamResult | null>(null);

  // Quick In-Situ New Exam Modal
  const [isQuickCreateOpen, setIsQuickCreateOpen] = useState(false);
  const [quickTitle, setQuickTitle] = useState('');
  const [quickSystem, setQuickSystem] = useState('Cardiovasculaire');
  const [quickDuration, setQuickDuration] = useState(30);
  const [quickCohort, setQuickCohort] = useState('DFGSM 2');

  const togglePublish = (examId: string) => {
    setExamList((prev) =>
      prev.map((e) => {
        if (e.id === examId) {
          const updated = { ...e, isPublished: !e.isPublished };
          AnatomyExamRepository.instance.update(updated);
          return updated;
        }
        return e;
      })
    );
  };

  const handleDeleteExam = (examId: string) => {
    if (window.confirm('Confirmez-vous la suppression de cette épreuve ?')) {
      setExamList((prev) => prev.filter((e) => e.id !== examId));
      AnatomyExamRepository.instance.delete(examId);
    }
  };

  const handleDuplicateExam = (exam: AnatomyExam) => {
    const duplicated: AnatomyExam = {
      ...exam,
      id: `exam-${Date.now()}`,
      title: `${exam.title} (Copie)`,
      isPublished: false,
    };
    AnatomyExamRepository.instance.add(duplicated);
    setExamList((prev) => [duplicated, ...prev]);
  };

  const handleSaveQuickExam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickTitle.trim()) return;

    const newExam: AnatomyExam = {
      id: `exam-${Date.now()}`,
      title: quickTitle.trim(),
      description: `Évaluation clinique rédigée par la Chaire d'Anatomie (${quickSystem}).`,
      durationMinutes: quickDuration,
      hideAnatomy: true,
      targetSystem: quickSystem,
      isPublished: false,
      targetCohort: quickCohort,
      passingScore: 10,
      questions: [
        {
          id: `q-${Date.now()}-1`,
          text: `Question clinique introductive concernant le système ${quickSystem} :`,
          type: ExamQuestionType.Quiz,
          options: ['Option A (Correcte)', 'Option B', 'Option C', 'Option D'],
          correctOptionIndex: 0,
          points: 2,
          tags: [quickSystem.toLowerCase()],
          difficulty: 1,
        },
      ],
    };

    AnatomyExamRepository.instance.add(newExam);
    setExamList((prev) => [newExam, ...prev]);
    setIsQuickCreateOpen(false);
    setQuickTitle('');
  };

  // Metrics
  const totalStudents = classesList.reduce(
    (sum, c) => sum + (c.studentIds?.length || 0),
    0
  );
  const publishedCount = examList.filter((e) => e.isPublished).length;
  const draftCount = examList.length - publishedCount;

  const averageCohortScore =
    results.length > 0
      ? Math.round(
          results.reduce((acc, curr) => acc + (curr.percentage || 0), 0) /
            results.length
        )
      : null;

  const filteredExams = useMemo(() => {
    return examList.filter((exam) => {
      const matchesSearch =
        exam.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (exam.targetSystem && exam.targetSystem.toLowerCase().includes(searchTerm.toLowerCase())) ||
        exam.description.toLowerCase().includes(searchTerm.toLowerCase());

      if (!matchesSearch) return false;
      if (statusFilter === 'published') return exam.isPublished;
      if (statusFilter === 'draft') return !exam.isPublished;
      return true;
    });
  }, [examList, searchTerm, statusFilter]);

  // Export CSV of student submissions
  const handleExportCSV = () => {
    const headers = ['ID Copie', 'ID Examen', 'Score', 'Max Score', 'Pourcentage', 'Mention', 'Date'];
    const rows = results.map((r) => [
      r.id,
      r.examId,
      r.score,
      r.maxScore,
      `${r.percentage.toFixed(1)}%`,
      gradeForPercentage(r.percentage),
      new Date(r.submittedAt).toISOString(),
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `releve_notes_anatomyz_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8 pb-16 text-[#F5F7FA]">
      {/* 1. Professor Leadership Banner */}
      <section className="p-6 md:p-8 rounded-2xl bg-[#161C24] border border-[#263140] transition">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-xl bg-[#232C3A] border border-[#2D3847] text-[#E5DCD0] flex items-center justify-center font-bold text-xl shrink-0">
              <GraduationCap className="w-7 h-7 text-[#E5DCD0]" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-xl md:text-2xl font-bold tracking-tight text-[#F5F7FA]">
                  {userProfile?.displayName || 'Professeur Zenasni Kamel'}
                </h1>
                <span className="text-xs font-medium text-[#E5DCD0]">
                  Chaire d'Anatomie & Organogénèse
                </span>
                <span className="text-xs text-[#8F9CAE]">
                  Espace Enseignant
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-[#8F9CAE] flex-wrap">
                <span>{userProfile?.university || 'Faculté de Médecine'}</span>
                <span aria-hidden="true">·</span>
                <span className="text-[#BCC7D5]">Responsable Pédagogique des Évaluations 3D</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0 flex-wrap">
            <button
              type="button"
              onClick={onOpenExamEditor}
              className="px-4 py-2 text-xs font-bold text-[#0F1318] bg-[#E5DCD0] hover:bg-[#F5EFEB] rounded-xl transition cursor-pointer inline-flex items-center gap-2"
            >
              <FilePlus className="w-4 h-4" />
              <span>Créer une épreuve</span>
            </button>
            <button
              type="button"
              onClick={() => onOpenAtlas()}
              className="px-4 py-2 text-xs font-semibold text-[#BCC7D5] hover:text-[#F5F7FA] bg-[#1D2530] hover:bg-[#232C3A] border border-[#263140] rounded-xl transition cursor-pointer inline-flex items-center gap-2"
            >
              <Box className="w-4 h-4 text-[#E5DCD0]" />
              <span>Amphithéâtre 3D</span>
            </button>
          </div>
        </div>

        {/* Quiet Pedagogical Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-[#263140]">
          <div>
            <div className="text-xs text-[#8F9CAE]">Examens Rédigés</div>
            <div className="text-2xl font-bold text-[#F5F7FA] mt-1 tabular-nums">
              {examList.length}
            </div>
            <div className="text-xs text-[#8F9CAE] mt-0.5">
              {publishedCount} publié(s) · {draftCount} brouillon(s)
            </div>
          </div>

          <div>
            <div className="text-xs text-[#8F9CAE]">Promotions & Groupes</div>
            <div className="text-2xl font-bold text-[#E5DCD0] mt-1 tabular-nums">
              {classesList.length}
            </div>
            <div className="text-xs text-[#8F9CAE] mt-0.5">
              {totalStudents} étudiants inscrits
            </div>
          </div>

          <div>
            <div className="text-xs text-[#8F9CAE]">Moyenne Promotion</div>
            <div className="text-2xl font-bold text-emerald-400 mt-1 tabular-nums">
              {averageCohortScore !== null ? `${averageCohortScore}%` : '—'}
            </div>
            <div className="text-xs text-[#8F9CAE] mt-0.5">
              Taux de validation cohortes
            </div>
          </div>

          <div>
            <div className="text-xs text-[#8F9CAE]">Copies Évaluées</div>
            <div className="text-2xl font-bold text-sky-400 mt-1 tabular-nums">
              {results.length}
            </div>
            <div className="text-xs text-[#8F9CAE] mt-0.5">
              Archivage sécurisé
            </div>
          </div>
        </div>
      </section>

      {/* 2. Interactive Navigation Deck (Segmented Controls) */}
      <nav aria-label="Espace de travail professeur" className="flex items-center gap-1.5 p-1 bg-[#161C24] border border-[#263140] rounded-xl overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab('exams')}
          className={`flex-1 min-w-[140px] py-2 px-3 text-xs font-semibold rounded-lg transition whitespace-nowrap cursor-pointer flex items-center justify-center gap-2 ${
            activeTab === 'exams'
              ? 'bg-[#E5DCD0] text-[#0F1318]'
              : 'text-[#8F9CAE] hover:text-[#F5F7FA] hover:bg-[#1D2530]'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Gestion des Examens ({examList.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('cohorts')}
          className={`flex-1 min-w-[140px] py-2 px-3 text-xs font-semibold rounded-lg transition whitespace-nowrap cursor-pointer flex items-center justify-center gap-2 ${
            activeTab === 'cohorts'
              ? 'bg-[#E5DCD0] text-[#0F1318]'
              : 'text-[#8F9CAE] hover:text-[#F5F7FA] hover:bg-[#1D2530]'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Promotions & Étudiants</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('submissions')}
          className={`flex-1 min-w-[140px] py-2 px-3 text-xs font-semibold rounded-lg transition whitespace-nowrap cursor-pointer flex items-center justify-center gap-2 ${
            activeTab === 'submissions'
              ? 'bg-[#E5DCD0] text-[#0F1318]'
              : 'text-[#8F9CAE] hover:text-[#F5F7FA] hover:bg-[#1D2530]'
          }`}
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>Copies & Relevé ({results.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('amphi')}
          className={`flex-1 min-w-[140px] py-2 px-3 text-xs font-semibold rounded-lg transition whitespace-nowrap cursor-pointer flex items-center justify-center gap-2 ${
            activeTab === 'amphi'
              ? 'bg-[#E5DCD0] text-[#0F1318]'
              : 'text-[#8F9CAE] hover:text-[#F5F7FA] hover:bg-[#1D2530]'
          }`}
        >
          <Compass className="w-4 h-4" />
          <span>Démonstration Amphithéâtre</span>
        </button>
      </nav>

      {/* 3. Tab Contents */}

      {/* TAB 1: EXAM MANAGEMENT */}
      {activeTab === 'exams' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 p-1 bg-[#161C24] border border-[#263140] rounded-xl self-start">
              <button
                type="button"
                onClick={() => setStatusFilter('all')}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition cursor-pointer ${
                  statusFilter === 'all'
                    ? 'bg-[#1D2530] text-[#F5F7FA] border border-[#263140]'
                    : 'text-[#8F9CAE] hover:text-[#F5F7FA]'
                }`}
              >
                Tous ({examList.length})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('published')}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition cursor-pointer ${
                  statusFilter === 'published'
                    ? 'bg-[#1D2530] text-[#F5F7FA] border border-[#263140]'
                    : 'text-[#8F9CAE] hover:text-[#F5F7FA]'
                }`}
              >
                Publiés ({publishedCount})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('draft')}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition cursor-pointer ${
                  statusFilter === 'draft'
                    ? 'bg-[#1D2530] text-[#F5F7FA] border border-[#263140]'
                    : 'text-[#8F9CAE] hover:text-[#F5F7FA]'
                }`}
              >
                Brouillons ({draftCount})
              </button>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative min-w-[220px]">
                <Search className="w-4 h-4 text-[#8F9CAE] absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Rechercher une épreuve…"
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-[#161C24] border border-[#263140] rounded-xl text-[#F5F7FA] placeholder-[#8F9CAE] focus:outline-none focus:border-[#E5DCD0]"
                />
              </div>
              <button
                type="button"
                onClick={() => setIsQuickCreateOpen(true)}
                className="px-3.5 py-1.5 text-xs font-bold text-[#0F1318] bg-[#E5DCD0] hover:bg-[#F5EFEB] rounded-xl transition cursor-pointer inline-flex items-center gap-1.5 whitespace-nowrap"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Nouveau</span>
              </button>
            </div>
          </div>

          <div className="space-y-3">
            {filteredExams.map((exam) => (
              <div
                key={exam.id}
                className="p-5 rounded-2xl bg-[#161C24] border border-[#263140] hover:border-[#384659] transition flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 min-w-0">
                  <div className="flex items-center gap-2 text-xs text-[#8F9CAE]">
                    <span>{exam.targetSystem || 'Général'}</span>
                    <span aria-hidden="true">·</span>
                    <span>{exam.targetCohort || 'DFGSM 2'}</span>
                    <span aria-hidden="true">·</span>
                    <span className="tabular-nums">{exam.durationMinutes} min</span>
                    <span aria-hidden="true">·</span>
                    <span className="tabular-nums">{exam.questions.length} question(s)</span>
                  </div>

                  <h3 className="text-base font-bold text-[#F5F7FA] truncate">
                    {exam.title}
                  </h3>

                  <p className="text-xs text-[#8F9CAE] line-clamp-1">
                    {exam.description}
                  </p>
                </div>

                <div className="flex items-center gap-3 shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-[#263140]">
                  {/* Status Toggle */}
                  <button
                    type="button"
                    onClick={() => togglePublish(exam.id)}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition cursor-pointer ${
                      exam.isPublished
                        ? 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/30'
                        : 'bg-[#1D2530] text-[#8F9CAE] hover:text-[#F5F7FA] border border-[#263140]'
                    }`}
                  >
                    {exam.isPublished ? 'En ligne pour étudiants' : 'Brouillon privé'}
                  </button>

                  <button
                    type="button"
                    onClick={() => onPreviewExam(exam)}
                    className="p-2 text-xs text-[#BCC7D5] hover:text-[#F5F7FA] bg-[#1D2530] hover:bg-[#232C3A] rounded-xl border border-[#263140] transition cursor-pointer"
                    title="Aperçu étudiant"
                  >
                    <Eye className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDuplicateExam(exam)}
                    className="p-2 text-xs text-[#BCC7D5] hover:text-[#F5F7FA] bg-[#1D2530] hover:bg-[#232C3A] rounded-xl border border-[#263140] transition cursor-pointer"
                    title="Dupliquer"
                  >
                    <Copy className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDeleteExam(exam.id)}
                    className="p-2 text-xs text-red-400 hover:text-red-300 bg-[#1D2530] hover:bg-red-500/10 rounded-xl border border-[#263140] transition cursor-pointer"
                    title="Supprimer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: PROMOTIONS & COHORTS */}
      {activeTab === 'cohorts' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-[#F5F7FA]">Promotions & Effectifs Étudiants</h2>
              <p className="text-xs text-[#8F9CAE] mt-0.5">
                Gestion des promotions médicales et des cohortes affiliées à la Faculté.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                const name = window.prompt('Nom de la nouvelle promotion (ex: DFGSM 3 — Promotion 2026-2027) :');
                if (name && name.trim()) {
                  const newClass: AcademicClass = {
                    id: `class-${Date.now()}`,
                    name: name.trim(),
                    professorId: 'prof-demo',
                    description: 'Nouvelle promotion académique.',
                    studentIds: [],
                  };
                  setClassesList((prev) => [...prev, newClass]);
                }
              }}
              className="px-3.5 py-1.5 text-xs font-bold text-[#0F1318] bg-[#E5DCD0] hover:bg-[#F5EFEB] rounded-xl transition cursor-pointer inline-flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Créer une promotion</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {classesList.map((c) => (
              <div
                key={c.id}
                className="p-5 rounded-2xl bg-[#161C24] border border-[#263140] hover:border-[#384659] transition flex flex-col justify-between space-y-4"
              >
                <div className="space-y-2">
                  <div className="text-xs text-[#E5DCD0] font-medium">Promotion Médicale</div>
                  <h3 className="text-base font-bold text-[#F5F7FA]">{c.name}</h3>
                  <p className="text-xs text-[#8F9CAE] leading-relaxed">
                    {c.description}
                  </p>
                  <div className="text-xs text-[#8F9CAE] pt-1">
                    <span className="tabular-nums font-mono text-[#F5F7FA]">{c.studentIds.length}</span> étudiants enregistrés
                  </div>
                </div>

                <div className="pt-3 border-t border-[#263140] flex items-center justify-between">
                  <span className="text-xs text-[#8F9CAE]">Faculté de Médecine</span>
                  <button
                    type="button"
                    onClick={() => {
                      const email = window.prompt('Entrez l\'email de l\'étudiant à inscrire :');
                      if (email && email.trim()) {
                        setClassesList((prev) =>
                          prev.map((cls) =>
                            cls.id === c.id
                              ? { ...cls, studentIds: [...cls.studentIds, `stu-${Date.now()}`] }
                              : cls
                          )
                        );
                        alert(`Étudiant (${email}) inscrit avec succès.`);
                      }
                    }}
                    className="px-3 py-1.5 text-xs font-semibold text-[#BCC7D5] hover:text-[#F5F7FA] bg-[#1D2530] hover:bg-[#232C3A] rounded-xl transition cursor-pointer"
                  >
                    + Inscrire un étudiant
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: SUBMISSIONS & GRADING LEDGER */}
      {activeTab === 'submissions' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-[#F5F7FA]">Registre Académique des Copies Rendu</h2>
              <p className="text-xs text-[#8F9CAE] mt-0.5">
                Copies horodatées transmises par les étudiants avec calcul des notes en direct.
              </p>
            </div>
            <button
              type="button"
              onClick={handleExportCSV}
              className="px-3.5 py-1.5 text-xs font-semibold text-[#0F1318] bg-[#E5DCD0] hover:bg-[#F5EFEB] rounded-xl transition cursor-pointer inline-flex items-center gap-1.5 self-start sm:self-auto"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Exporter le relevé (CSV)</span>
            </button>
          </div>

          {results.length === 0 ? (
            <div className="p-8 text-center rounded-2xl bg-[#161C24] border border-[#263140] space-y-2">
              <p className="text-sm font-semibold text-[#F5F7FA]">Aucune copie soumise pour l'instant</p>
              <p className="text-xs text-[#8F9CAE]">Les résultats des étudiants apparaîtront ici dès la première soumission.</p>
            </div>
          ) : (
            <div className="rounded-2xl bg-[#161C24] border border-[#263140] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#1D2530] text-[#8F9CAE] font-medium border-b border-[#263140]">
                    <tr>
                      <th className="py-3 px-4">Épreuve</th>
                      <th className="py-3 px-4">Identifiant Étudiant</th>
                      <th className="py-3 px-4">Date de soumission</th>
                      <th className="py-3 px-4 text-right">Score</th>
                      <th className="py-3 px-4 text-right">Pourcentage</th>
                      <th className="py-3 px-4 text-center">Mention</th>
                      <th className="py-3 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#263140]">
                    {results.map((r) => {
                      const matchedExam = examList.find((e) => e.id === r.examId);
                      const mention = gradeForPercentage(r.percentage);

                      return (
                        <tr key={r.id} className="hover:bg-[#1D2530]/50 transition">
                          <td className="py-3 px-4 font-semibold text-[#F5F7FA]">
                            {matchedExam?.title || `Examen ${r.examId}`}
                          </td>
                          <td className="py-3 px-4 text-[#8F9CAE] font-mono">
                            {r.studentId}
                          </td>
                          <td className="py-3 px-4 text-[#8F9CAE] tabular-nums">
                            {new Date(r.submittedAt).toLocaleDateString('fr-FR', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric',
                            })}
                          </td>
                          <td className="py-3 px-4 text-right font-mono tabular-nums text-[#F5F7FA]">
                            {r.score} / {r.maxScore}
                          </td>
                          <td className="py-3 px-4 text-right font-mono tabular-nums text-emerald-400 font-semibold">
                            {r.percentage.toFixed(1)}%
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span className="font-mono text-xs font-bold text-[#E5DCD0]">
                              {mention}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <button
                              type="button"
                              onClick={() => setSelectedSubmission(r)}
                              className="text-xs text-[#BCC7D5] hover:text-[#F5F7FA] font-medium underline cursor-pointer"
                            >
                              Consulter
                            </button>
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

      {/* TAB 4: AMPHITHEATER DEMONSTRATION 3D */}
      {activeTab === 'amphi' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-[#F5F7FA]">Mode Démonstration Amphithéâtre & Cours Magistraux</h2>
              <p className="text-xs text-[#8F9CAE] mt-0.5">
                Projetez directement un système anatomique avec repères cliniques pour vos cours en amphithéâtre.
              </p>
            </div>
            <button
              type="button"
              onClick={() => onOpenAtlas()}
              className="px-3.5 py-1.5 text-xs font-bold text-[#0F1318] bg-[#E5DCD0] hover:bg-[#F5EFEB] rounded-xl transition cursor-pointer"
            >
              Lancer l'Atlas Général
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {AMPHITHEATER_DEMOS.map((demo) => (
              <div
                key={demo.id}
                className="p-5 rounded-2xl bg-[#161C24] border border-[#263140] hover:border-[#384659] transition flex flex-col justify-between space-y-4"
              >
                <div className="space-y-2">
                  <div className="text-xs text-[#E5DCD0] font-medium">{demo.systemFr}</div>
                  <h3 className="text-base font-bold text-[#F5F7FA]">{demo.title}</h3>
                  <p className="text-xs text-[#8F9CAE] leading-relaxed">
                    {demo.description}
                  </p>
                  <div className="p-3 rounded-xl bg-[#1D2530] text-xs text-[#BCC7D5] leading-relaxed">
                    <strong className="text-[#E5DCD0]">Repères pédagogiques : </strong>
                    {demo.keyPoints}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onOpenAtlas(demo.system)}
                  className="w-full py-2.5 px-3 text-xs font-bold text-[#0F1318] bg-[#E5DCD0] hover:bg-[#F5EFEB] rounded-xl transition cursor-pointer flex items-center justify-center gap-2"
                >
                  <Box className="w-4 h-4" />
                  <span>Projeter en 3D</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Exam Creation Modal */}
      {isQuickCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <form
            onSubmit={handleSaveQuickExam}
            className="w-full max-w-md rounded-2xl bg-[#161C24] border border-[#263140] p-6 space-y-4 text-[#F5F7FA]"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-[#F5F7FA]">Créer une nouvelle épreuve</h3>
              <button
                type="button"
                onClick={() => setIsQuickCreateOpen(false)}
                className="text-[#8F9CAE] hover:text-[#F5F7FA] p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs text-[#8F9CAE] mb-1">Titre de l'épreuve *</label>
                <input
                  type="text"
                  required
                  value={quickTitle}
                  onChange={(e) => setQuickTitle(e.target.value)}
                  placeholder="ex: Évaluation — Rachis & Nerfs Spinaux"
                  className="w-full px-3 py-2 text-xs bg-[#1D2530] border border-[#263140] rounded-xl text-[#F5F7FA] focus:outline-none focus:border-[#E5DCD0]"
                />
              </div>

              <div>
                <label className="block text-xs text-[#8F9CAE] mb-1">Système Anatomique Ciblé</label>
                <select
                  value={quickSystem}
                  onChange={(e) => setQuickSystem(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-[#1D2530] border border-[#263140] rounded-xl text-[#F5F7FA] focus:outline-none focus:border-[#E5DCD0]"
                >
                  <option value="Cardiovasculaire">Système Cardiovasculaire</option>
                  <option value="Squelettique">Système Squelettique</option>
                  <option value="Musculaire">Système Musculaire</option>
                  <option value="Nerveux">Système Nerveux</option>
                  <option value="Digestif">Système Digestif & Viscères</option>
                  <option value="Respiratoire">Système Respiratoire</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-[#8F9CAE] mb-1">Durée (minutes)</label>
                  <input
                    type="number"
                    min="5"
                    max="180"
                    value={quickDuration}
                    onChange={(e) => setQuickDuration(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs bg-[#1D2530] border border-[#263140] rounded-xl text-[#F5F7FA] focus:outline-none focus:border-[#E5DCD0]"
                  />
                </div>
                <div>
                  <label className="block text-xs text-[#8F9CAE] mb-1">Promotion cible</label>
                  <select
                    value={quickCohort}
                    onChange={(e) => setQuickCohort(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-[#1D2530] border border-[#263140] rounded-xl text-[#F5F7FA] focus:outline-none focus:border-[#E5DCD0]"
                  >
                    <option value="DFGSM 2">DFGSM 2 (2ème année)</option>
                    <option value="DFGSM 3">DFGSM 3 (3ème année)</option>
                    <option value="DFASM 1">DFASM 1 (Externat)</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#263140]">
              <button
                type="button"
                onClick={() => setIsQuickCreateOpen(false)}
                className="px-4 py-2 text-xs font-medium text-[#8F9CAE] hover:text-[#F5F7FA] cursor-pointer"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-bold text-[#0F1318] bg-[#E5DCD0] hover:bg-[#F5EFEB] rounded-xl transition cursor-pointer"
              >
                Enregistrer l'examen
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Submission Detail Modal */}
      {selectedSubmission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl bg-[#161C24] border border-[#263140] p-6 space-y-4 text-[#F5F7FA]">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs text-[#E5DCD0] font-medium">Copie d'examen certifiée</span>
                <h3 className="text-base font-bold text-[#F5F7FA] mt-0.5">
                  Étudiant {selectedSubmission.studentId}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedSubmission(null)}
                className="text-[#8F9CAE] hover:text-[#F5F7FA] p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-4 rounded-xl bg-[#1D2530] space-y-2 text-xs text-[#BCC7D5]">
              <div className="flex items-center justify-between">
                <span>Épreuve :</span>
                <span className="font-semibold text-[#F5F7FA]">{selectedSubmission.examId}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Note finale :</span>
                <span className="font-mono text-[#F5F7FA] font-bold">
                  {selectedSubmission.score} / {selectedSubmission.maxScore} ({selectedSubmission.percentage.toFixed(1)}%)
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Mention académique :</span>
                <span className="font-bold text-[#E5DCD0]">
                  Mention {gradeForPercentage(selectedSubmission.percentage)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Date de remise :</span>
                <span className="text-[#8F9CAE] tabular-nums">
                  {new Date(selectedSubmission.submittedAt).toLocaleString('fr-FR')}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-end pt-3 border-t border-[#263140]">
              <button
                type="button"
                onClick={() => setSelectedSubmission(null)}
                className="px-4 py-2 text-xs font-semibold text-[#0F1318] bg-[#E5DCD0] hover:bg-[#F5EFEB] rounded-xl transition cursor-pointer"
              >
                Fermer la copie
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
