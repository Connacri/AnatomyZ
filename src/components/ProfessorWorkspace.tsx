import React, { useState } from 'react';
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
  Share2,
  FolderPlus,
  BookOpen,
  ArrowRight,
  TrendingUp,
  GraduationCap,
  Sparkles,
} from 'lucide-react';
import {
  AcademicClass,
  AnatomyExam,
  StudentExamResult,
} from '../domain/anatomy';
import { UserRecord } from '../firebase';
import { gradeForPercentage } from '../data/repositories';

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

export function ProfessorWorkspace({
  userProfile,
  exams,
  classes,
  results,
  onOpenAtlas,
  onOpenExamEditor,
  onOpenProfile,
  onPreviewExam,
}: ProfessorWorkspaceProps) {
  const [activeTab, setActiveTab] = useState<'exams' | 'cohorts' | 'submissions' | 'lecture'>('exams');
  const [examList, setExamList] = useState<AnatomyExam[]>(exams);
  const [searchTerm, setSearchTerm] = useState('');

  const togglePublish = (examId: string) => {
    setExamList((prev) =>
      prev.map((e) =>
        e.id === examId ? { ...e, isPublished: !e.isPublished } : e
      )
    );
  };

  const totalStudents = classes.reduce(
    (sum, c) => sum + (c.studentIds?.length || 0),
    0
  );

  const publishedCount = examList.filter((e) => e.isPublished).length;
  const averageCohortScore =
    results.length > 0
      ? Math.round(
          results.reduce((acc, curr) => acc + (curr.percentage || 0), 0) /
            results.length
        )
      : null;

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 pb-12">
      {/* Professor Pedagogical Header Banner */}
      <div className="p-6 rounded-3xl bg-[#1E242C] border-2 border-[#323B46] shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-start sm:items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-purple-500/20 text-purple-300 border border-purple-500/40 flex items-center justify-center font-black text-2xl shadow-md shrink-0">
            <GraduationCap className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-extrabold text-[#FAF6F0]">
                {userProfile?.displayName || 'Professeur Zenasni Kamel'}
              </h1>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-purple-950 text-purple-300 border border-purple-500/40">
                Chaire d'Anatomie Humaine
              </span>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-[#252D37] text-[#BAC3CE] border border-[#323B46]">
                Espace Enseignant
              </span>
            </div>
            <p className="text-xs text-[#BAC3CE] mt-1 flex items-center gap-2 flex-wrap">
              <span>{userProfile?.university || 'Faculté de Médecine'}</span>
              <span>·</span>
              <span className="text-[#DACBA9]">Coordination des Évaluations & Atlas 3D</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={onOpenExamEditor}
            className="px-4 py-2.5 rounded-xl bg-[#DACBA9] hover:bg-[#FAF6F0] text-[#15191E] text-xs font-bold transition cursor-pointer flex items-center gap-1.5 shadow-md"
          >
            <FilePlus className="w-4 h-4" />
            <span>Créer un nouvel examen</span>
          </button>
          <button
            type="button"
            onClick={() => onOpenAtlas()}
            className="px-4 py-2.5 rounded-xl bg-[#252D37] hover:bg-[#323B46] border border-[#323B46] text-xs font-semibold text-[#FAF6F0] transition cursor-pointer flex items-center gap-1.5"
          >
            <Box className="w-4 h-4 text-[#DACBA9]" />
            <span>Mode Amphithéâtre</span>
          </button>
        </div>
      </div>

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-2xl bg-[#1E242C] border border-[#323B46]">
          <div className="text-xs text-[#8C97A5] font-semibold">Examens Conçus</div>
          <div className="text-2xl font-black text-[#FAF6F0] mt-1 tabular-nums">{examList.length}</div>
          <div className="text-[11px] text-[#DACBA9] mt-0.5">{publishedCount} publié(s)</div>
        </div>

        <div className="p-4 rounded-2xl bg-[#1E242C] border border-[#323B46]">
          <div className="text-xs text-[#8C97A5] font-semibold">Promotions & Classes</div>
          <div className="text-2xl font-black text-purple-400 mt-1 tabular-nums">{classes.length}</div>
          <div className="text-[11px] text-[#BAC3CE] mt-0.5">{totalStudents} étudiants suivis</div>
        </div>

        <div className="p-4 rounded-2xl bg-[#1E242C] border border-[#323B46]">
          <div className="text-xs text-[#8C97A5] font-semibold">Taux de Réussite Cohorte</div>
          <div className="text-2xl font-black text-emerald-400 mt-1 tabular-nums">
            {averageCohortScore !== null ? `${averageCohortScore}%` : '—'}
          </div>
          <div className="text-[11px] text-emerald-300 mt-0.5">Moyenne promotions</div>
        </div>

        <div className="p-4 rounded-2xl bg-[#1E242C] border border-[#323B46]">
          <div className="text-xs text-[#8C97A5] font-semibold">Copies Reçues</div>
          <div className="text-2xl font-black text-sky-400 mt-1 tabular-nums">{results.length}</div>
          <div className="text-[11px] text-sky-300 mt-0.5">Évaluations corrigées</div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-[#323B46] bg-[#1E242C] rounded-2xl p-1.5 gap-1.5">
        <button
          type="button"
          onClick={() => setActiveTab('exams')}
          className={`flex-1 py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer ${
            activeTab === 'exams'
              ? 'bg-[#DACBA9] text-[#15191E] shadow-sm'
              : 'text-[#BAC3CE] hover:text-[#FAF6F0] hover:bg-[#252D37]'
          }`}
        >
          <FilePlus className="w-4 h-4" />
          <span>Gestion des Examens ({examList.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('cohorts')}
          className={`flex-1 py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer ${
            activeTab === 'cohorts'
              ? 'bg-[#DACBA9] text-[#15191E] shadow-sm'
              : 'text-[#BAC3CE] hover:text-[#FAF6F0] hover:bg-[#252D37]'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Classes & Promotions ({classes.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('submissions')}
          className={`flex-1 py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer ${
            activeTab === 'submissions'
              ? 'bg-[#DACBA9] text-[#15191E] shadow-sm'
              : 'text-[#BAC3CE] hover:text-[#FAF6F0] hover:bg-[#252D37]'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>Copies & Notes Étudiants ({results.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('lecture')}
          className={`flex-1 py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer ${
            activeTab === 'lecture'
              ? 'bg-[#DACBA9] text-[#15191E] shadow-sm'
              : 'text-[#BAC3CE] hover:text-[#FAF6F0] hover:bg-[#252D37]'
          }`}
        >
          <Box className="w-4 h-4" />
          <span>Démonstration Cours 3D</span>
        </button>
      </div>

      {/* Tab 1: Exam Management */}
      {activeTab === 'exams' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-[#FAF6F0]">Examens Rédigés & Banques de Questions</h2>
              <p className="text-xs text-[#BAC3CE]">
                Publiez ou modifiez les épreuves pour vos promotions médicales.
              </p>
            </div>

            <button
              type="button"
              onClick={onOpenExamEditor}
              className="py-2 px-4 rounded-xl bg-[#DACBA9] text-[#15191E] text-xs font-bold transition hover:bg-[#FAF6F0] flex items-center gap-1.5 shadow-sm"
            >
              <FilePlus className="w-4 h-4" />
              <span>Créer un examen</span>
            </button>
          </div>

          <div className="space-y-3">
            {examList.map((exam) => (
              <div
                key={exam.id}
                className="p-5 rounded-3xl bg-[#1E242C] border-2 border-[#323B46] hover:border-[#DACBA9]/60 transition flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 min-w-0 flex-1">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <h3 className="font-extrabold text-base text-[#FAF6F0] truncate">
                      {exam.title}
                    </h3>
                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                        exam.isPublished
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                          : 'bg-zinc-800 text-zinc-300 border border-zinc-600'
                      }`}
                    >
                      {exam.isPublished ? 'En Ligne (Publié)' : 'Brouillon privé'}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#252D37] text-[#BAC3CE] border border-[#323B46]">
                      {exam.targetSystem || 'Anatomie Générale'}
                    </span>
                  </div>

                  <p className="text-xs text-[#BAC3CE] line-clamp-1">
                    {exam.description || 'Évaluation des connaissances anatomiques et repérage 3D.'}
                  </p>

                  <div className="flex items-center gap-3 text-xs text-[#8C97A5] pt-1">
                    <span>{exam.questions.length} question(s) QCM & Repérage</span>
                    <span>·</span>
                    <span>Durée : {exam.durationMinutes} min</span>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 shrink-0 self-end md:self-auto">
                  <button
                    type="button"
                    onClick={() => togglePublish(exam.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition cursor-pointer ${
                      exam.isPublished
                        ? 'bg-zinc-800 text-zinc-300 border-zinc-600 hover:bg-zinc-700'
                        : 'bg-emerald-600 text-white border-emerald-500 hover:bg-emerald-500'
                    }`}
                  >
                    {exam.isPublished ? 'Dépublier' : 'Publier aux étudiants'}
                  </button>

                  <button
                    type="button"
                    onClick={() => onPreviewExam(exam)}
                    className="p-2 rounded-xl bg-[#252D37] hover:bg-[#323B46] text-[#BAC3CE] hover:text-[#FAF6F0] transition cursor-pointer"
                    title="Prévisualiser l'examen"
                  >
                    <Eye className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={onOpenExamEditor}
                    className="p-2 rounded-xl bg-[#252D37] hover:bg-[#323B46] text-[#DACBA9] transition cursor-pointer"
                    title="Modifier dans l'éditeur"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: Cohorts & Classes */}
      {activeTab === 'cohorts' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-[#FAF6F0]">Classes & Promotions Suivies</h2>
              <p className="text-xs text-[#BAC3CE]">
                Effectifs, cohortes d'externes et étudiants inscrits.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {classes.map((c) => (
              <div
                key={c.id}
                className="p-5 rounded-3xl bg-[#1E242C] border-2 border-[#323B46] space-y-4"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-extrabold text-base text-[#FAF6F0]">{c.name}</h3>
                    <p className="text-xs text-[#BAC3CE] mt-0.5">{c.description}</p>
                  </div>
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-purple-950 text-purple-300 border border-purple-500/40">
                    {c.studentIds?.length || 0} inscrits
                  </span>
                </div>

                <div className="pt-3 border-t border-[#323B46] flex items-center justify-between text-xs text-[#8C97A5]">
                  <span>Semestre en cours</span>
                  <span className="text-[#DACBA9] font-semibold">Programme Faculté 2026</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Student Submissions Roster */}
      {activeTab === 'submissions' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-[#FAF6F0]">Copies d'Examens des Étudiants</h2>
              <p className="text-xs text-[#BAC3CE]">
                Relevé chronologique des évaluations soumises avec scores et mentions.
              </p>
            </div>
            <span className="text-xs text-[#8C97A5] font-mono">
              Total : {results.length} copie(s)
            </span>
          </div>

          {results.length > 0 ? (
            <div className="space-y-2.5">
              {results.map((res) => {
                const grade = gradeForPercentage(res.percentage);
                const isPassing = res.percentage >= 50;

                return (
                  <div
                    key={res.id}
                    className="p-4 rounded-2xl bg-[#1E242C] border border-[#323B46] flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-[#FAF6F0]">
                          {res.studentName || 'Étudiant Anonyme'}
                        </span>
                        <span className="text-xs text-[#8C97A5]">({res.examTitle})</span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            isPassing
                              ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                              : 'bg-rose-950 text-rose-300 border border-rose-500/40'
                          }`}
                        >
                          {isPassing ? 'Admis' : 'Rattrapage'}
                        </span>
                      </div>
                      <p className="text-xs text-[#8C97A5] mt-0.5">
                        Soumis le{' '}
                        {new Date(res.submittedAt).toLocaleDateString('fr-FR', {
                          day: '2-digit',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>

                    <div className="text-right">
                      <div className="text-base font-black text-[#DACBA9]">
                        {res.score} / {res.totalPoints} ({res.percentage}%)
                      </div>
                      <div className="text-[11px] text-[#8C97A5]">Mention {grade}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-8 rounded-3xl bg-[#1E242C] border border-dashed border-[#323B46] text-center space-y-2">
              <Award className="w-8 h-8 text-[#DACBA9] mx-auto" />
              <p className="text-sm font-bold text-[#FAF6F0]">Aucune copie soumise</p>
              <p className="text-xs text-[#BAC3CE]">Les résultats apparaîtront dès que vos étudiants valident un examen.</p>
            </div>
          )}
        </div>
      )}

      {/* Tab 4: 3D Lecture Projection */}
      {activeTab === 'lecture' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-[#FAF6F0]">Mode Démonstration Cours 3D Amphithéâtre</h2>
              <p className="text-xs text-[#BAC3CE]">
                Affichez les modélisations anatomiques pour vos cours magistraux et travaux dirigés.
              </p>
            </div>
          </div>

          <div className="p-8 rounded-3xl bg-[#1E242C] border-2 border-[#DACBA9] text-center space-y-4 shadow-xl">
            <div className="w-16 h-16 rounded-3xl bg-[#DACBA9]/20 text-[#DACBA9] flex items-center justify-center mx-auto">
              <Box className="w-8 h-8" />
            </div>
            <div className="max-w-md mx-auto space-y-1">
              <h3 className="text-lg font-extrabold text-[#FAF6F0]">
                Atlas Anatomique 3D Haute Résolution
              </h3>
              <p className="text-xs text-[#BAC3CE]">
                Plein écran optimisé pour vidéo-projecteur, rotation orbitale 360°, dissection couche par couche et épinglage des repères anatomiques.
              </p>
            </div>
            <button
              type="button"
              onClick={() => onOpenAtlas()}
              className="py-3 px-6 rounded-2xl bg-[#DACBA9] hover:bg-[#FAF6F0] text-[#15191E] font-black text-sm transition cursor-pointer inline-flex items-center gap-2 shadow-lg"
            >
              <Box className="w-5 h-5" />
              <span>Lancer la projection 3D</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
