import React, { useState } from 'react';
import {
  BookOpen,
  Award,
  Box,
  Layers,
  CheckCircle2,
  Clock,
  ChevronRight,
  TrendingUp,
  Sparkles,
  ArrowRight,
  RotateCcw,
  GraduationCap,
  Shield,
  FileText,
  AlertCircle,
} from 'lucide-react';
import {
  AnatomyExam,
  AnatomyRole,
  ExamAssignment,
  StudentExamResult,
} from '../domain/anatomy';
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

// Medical active recall flashcards bank for student self-training
const MEDICAL_FLASHCARDS = [
  {
    id: 'fc-1',
    system: 'Neuro-anatomie',
    question: 'Quel nerf crânien traverse le foramen ovale de la base du crâne ?',
    answer: 'Le nerf mandibulaire (V3), branche terminale du nerf trijumeau (V), accompagné de la petite artère méningée.',
    hint: 'Branche du 5ème nerf crânien.',
  },
  {
    id: 'fc-2',
    system: 'Appareil Locomoteur',
    question: 'Quels sont les 4 tendons composant la coiffe des rotateurs de l’épaule ?',
    answer: 'Muscles supra-épineux, infra-épineux, petit rond (postérieurs/latéraux) et subscapulaire (antérieur).',
    hint: '3 dorsaux et 1 ventral.',
  },
  {
    id: 'fc-3',
    system: 'Cardio-vasculaire',
    question: 'D’où naissent précisément les artères coronaires gauche et droite ?',
    answer: 'Des sinus de Valsalva aortiques (sinus aortiques gauche et droit) juste au-dessus des cuspides de la valve aortique.',
    hint: 'À la racine aortique.',
  },
  {
    id: 'fc-4',
    system: 'Ostéologie & Rachis',
    question: 'Quelle est la particularité anatomique majeure de la vertèbre C2 (Axis) ?',
    answer: 'La présence de la dent de l’axis (apophyse odontoïde) qui sert de pivot articulaire avec l’arc antérieur de l’Atlas (C1).',
    hint: 'Une projection osseuse verticale.',
  },
  {
    id: 'fc-5',
    system: 'Viscères & Splanchnologie',
    question: 'Quelles sont les 3 branches principales du tronc cœliaque ?',
    answer: 'L’artère gastrique gauche (coronaire stomachique), l’artère hépatique commune et l’artère splénique.',
    hint: 'Naît en T12 de l’aorte abdominale.',
  },
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
  const [activeTab, setActiveTab] = useState<'exams' | 'flashcards' | 'atlas' | 'grades'>('exams');

  // Flashcards state
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [masteredCards, setMasteredCards] = useState<string[]>([]);

  const currentCard = MEDICAL_FLASHCARDS[currentCardIndex];

  const handleNextCard = () => {
    setIsFlipped(false);
    setCurrentCardIndex((prev) => (prev + 1) % MEDICAL_FLASHCARDS.length);
  };

  const handlePrevCard = () => {
    setIsFlipped(false);
    setCurrentCardIndex((prev) => (prev - 1 + MEDICAL_FLASHCARDS.length) % MEDICAL_FLASHCARDS.length);
  };

  const toggleMastered = (id: string) => {
    setMasteredCards((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  // Performance calculations
  const totalExams = exams.length;
  const completedResults = results.length;
  const averagePercentage =
    completedResults > 0
      ? Math.round(
          results.reduce((acc, curr) => acc + (curr.percentage || 0), 0) /
            completedResults
        )
      : null;

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 pb-12">
      {/* Student Medical Header Banner */}
      <div className="p-6 rounded-3xl bg-[#1E242C] border-2 border-[#323B46] shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-start sm:items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-[#DACBA9] text-[#15191E] flex items-center justify-center font-black text-2xl shadow-md shrink-0">
            {(userProfile?.displayName || 'E')[0].toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-extrabold text-[#FAF6F0]">
                {userProfile?.displayName || 'Étudiant en Médecine'}
              </h1>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#DACBA9]/20 text-[#DACBA9] border border-[#DACBA9]/40">
                {userProfile?.academicYear || 'DFGSM 2'}
              </span>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-[#252D37] text-[#BAC3CE] border border-[#323B46]">
                {userProfile?.matricule ? `Matricule : ${userProfile.matricule}` : 'Espace Étudiant'}
              </span>
            </div>
            <p className="text-xs text-[#BAC3CE] mt-1 flex items-center gap-2 flex-wrap">
              <span>{userProfile?.university || 'Faculté de Médecine'}</span>
              <span>·</span>
              <span className="text-[#DACBA9]">{userProfile?.specialty || 'Anatomie Humaine & Organogénèse'}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={onOpenProfile}
            className="px-4 py-2 rounded-xl bg-[#252D37] hover:bg-[#323B46] border border-[#323B46] text-xs font-semibold text-[#FAF6F0] transition cursor-pointer"
          >
            Compléter mon profil
          </button>
          <button
            type="button"
            onClick={() => onOpenAtlas()}
            className="px-4 py-2 rounded-xl bg-[#DACBA9] hover:bg-[#FAF6F0] text-[#15191E] text-xs font-bold transition cursor-pointer flex items-center gap-1.5 shadow-md"
          >
            <Box className="w-4 h-4" />
            <span>Ouvrir l'Atlas 3D</span>
          </button>
        </div>
      </div>

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-2xl bg-[#1E242C] border border-[#323B46]">
          <div className="text-xs text-[#8C97A5] font-semibold">Examens Disponibles</div>
          <div className="text-2xl font-black text-[#FAF6F0] mt-1 tabular-nums">{totalExams}</div>
          <div className="text-[11px] text-[#DACBA9] mt-0.5">Évaluations actives</div>
        </div>

        <div className="p-4 rounded-2xl bg-[#1E242C] border border-[#323B46]">
          <div className="text-xs text-[#8C97A5] font-semibold">Épreuves Validées</div>
          <div className="text-2xl font-black text-emerald-400 mt-1 tabular-nums">{completedResults}</div>
          <div className="text-[11px] text-emerald-300 mt-0.5">Copies enregistrées</div>
        </div>

        <div className="p-4 rounded-2xl bg-[#1E242C] border border-[#323B46]">
          <div className="text-xs text-[#8C97A5] font-semibold">Moyenne Générale</div>
          <div className="text-2xl font-black text-[#DACBA9] mt-1 tabular-nums">
            {averagePercentage !== null ? `${averagePercentage}%` : '—'}
          </div>
          <div className="text-[11px] text-[#BAC3CE] mt-0.5">
            {averagePercentage !== null ? `Mention ${gradeForPercentage(averagePercentage)}` : 'Non évalué'}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#1E242C] border border-[#323B46]">
          <div className="text-xs text-[#8C97A5] font-semibold">Flashcards Maîtrisées</div>
          <div className="text-2xl font-black text-sky-400 mt-1 tabular-nums">
            {masteredCards.length} / {MEDICAL_FLASHCARDS.length}
          </div>
          <div className="text-[11px] text-sky-300 mt-0.5">Rappel actif</div>
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
          <FileText className="w-4 h-4" />
          <span>Mes Examens ({totalExams})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('flashcards')}
          className={`flex-1 py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer ${
            activeTab === 'flashcards'
              ? 'bg-[#DACBA9] text-[#15191E] shadow-sm'
              : 'text-[#BAC3CE] hover:text-[#FAF6F0] hover:bg-[#252D37]'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Rappel Actif / Flashcards</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('atlas')}
          className={`flex-1 py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer ${
            activeTab === 'atlas'
              ? 'bg-[#DACBA9] text-[#15191E] shadow-sm'
              : 'text-[#BAC3CE] hover:text-[#FAF6F0] hover:bg-[#252D37]'
          }`}
        >
          <Box className="w-4 h-4" />
          <span>Atlas 3D par Système</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('grades')}
          className={`flex-1 py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer ${
            activeTab === 'grades'
              ? 'bg-[#DACBA9] text-[#15191E] shadow-sm'
              : 'text-[#BAC3CE] hover:text-[#FAF6F0] hover:bg-[#252D37]'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>Notes & Suivi ({completedResults})</span>
        </button>
      </div>

      {/* Tab 1: Available Exams */}
      {activeTab === 'exams' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-[#FAF6F0]">Évaluations & Examens Assignés</h2>
              <p className="text-xs text-[#BAC3CE]">
                Évaluations cliniques et anatomiques rédigées par l’équipe professorale.
              </p>
            </div>
            <span className="text-xs text-[#8C97A5] font-mono">Synchronisation continue</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {exams.map((exam) => {
              const matchedResult = results.find((r) => r.examId === exam.id);
              const isCompleted = !!matchedResult;

              return (
                <div
                  key={exam.id}
                  className="p-5 rounded-3xl bg-[#1E242C] border-2 border-[#323B46] hover:border-[#DACBA9] transition flex flex-col justify-between space-y-4 shadow-sm group"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#DACBA9]/20 text-[#DACBA9] border border-[#DACBA9]/40 uppercase tracking-wider">
                        {exam.targetSystem || 'Anatomie Générale'}
                      </span>
                      {isCompleted ? (
                        <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Validé : {matchedResult.score} / {matchedResult.totalPoints}</span>
                        </span>
                      ) : (
                        <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-950 text-amber-300 border border-amber-500/40">
                          À passer
                        </span>
                      )}
                    </div>

                    <h3 className="font-extrabold text-base text-[#FAF6F0] group-hover:text-[#DACBA9] transition">
                      {exam.title}
                    </h3>
                    <p className="text-xs text-[#BAC3CE] line-clamp-2 leading-relaxed">
                      {exam.description || 'Évaluation des connaissances anatomiques, repérage topographique et corrélations cliniques.'}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-[#323B46] flex items-center justify-between">
                    <div className="flex items-center gap-3 text-xs text-[#8C97A5]">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{exam.durationMinutes} min</span>
                      </span>
                      <span>·</span>
                      <span>{exam.questions.length} question(s)</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => onStartExam(exam)}
                      className="px-4 py-2 rounded-xl bg-[#DACBA9] hover:bg-[#FAF6F0] text-[#15191E] font-bold text-xs transition cursor-pointer flex items-center gap-1.5 shadow-sm"
                    >
                      <span>{isCompleted ? 'Repasser l’examen' : 'Démarrer l’épreuve'}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 2: Flashcards (Rappel Actif) */}
      {activeTab === 'flashcards' && (
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-[#FAF6F0]">Rappel Actif & Entraînement Flashcards</h2>
              <p className="text-xs text-[#BAC3CE]">
                Mémorisez rapidement les rapports anatomiques, foramen crâniens et insertions musculaires.
              </p>
            </div>
            <span className="text-xs text-[#DACBA9] font-bold">
              {currentCardIndex + 1} / {MEDICAL_FLASHCARDS.length}
            </span>
          </div>

          <div
            onClick={() => setIsFlipped(!isFlipped)}
            className="w-full min-h-[260px] p-8 rounded-3xl bg-[#1E242C] border-2 border-[#DACBA9] shadow-2xl flex flex-col justify-between cursor-pointer select-none transition hover:border-[#FAF6F0]"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#DACBA9]/20 text-[#DACBA9] border border-[#DACBA9]/40">
                {currentCard.system}
              </span>
              <span className="text-[11px] text-[#8C97A5] font-mono">
                {isFlipped ? '💡 Cliquez pour voir la question' : '👆 Cliquez pour révéler la réponse'}
              </span>
            </div>

            <div className="py-6 text-center space-y-3">
              <p className="text-xs font-bold text-[#8C97A5] uppercase tracking-wider">
                {isFlipped ? 'Réponse anatomique' : 'Question anatomique'}
              </p>
              <h3 className="text-lg sm:text-xl font-extrabold text-[#FAF6F0] max-w-xl mx-auto leading-relaxed">
                {isFlipped ? currentCard.answer : currentCard.question}
              </h3>
              {!isFlipped && (
                <p className="text-xs text-[#8C97A5] italic">Indice : {currentCard.hint}</p>
              )}
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-[#323B46]">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleMastered(currentCard.id);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                  masteredCards.includes(currentCard.id)
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    : 'bg-[#252D37] text-[#BAC3CE] hover:text-[#FAF6F0]'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{masteredCards.includes(currentCard.id) ? 'Maîtrisé ✓' : 'Marquer comme maîtrisé'}</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePrevCard();
                  }}
                  className="px-3.5 py-1.5 rounded-xl bg-[#252D37] hover:bg-[#323B46] text-xs font-bold text-[#FAF6F0] transition"
                >
                  Précédent
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleNextCard();
                  }}
                  className="px-3.5 py-1.5 rounded-xl bg-[#DACBA9] text-[#15191E] text-xs font-bold transition hover:bg-[#FAF6F0]"
                >
                  Suivant
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: 3D Atlas Modules */}
      {activeTab === 'atlas' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-[#FAF6F0]">Exploration Anatomique 3D par Système</h2>
              <p className="text-xs text-[#BAC3CE]">
                Naviguez directement dans les régions anatomiques en modélisation tridimensionnelle.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {[
              {
                title: 'Tête, Cou & Neuro-crâne',
                system: 'cranial',
                description: 'Ostéologie crânienne, base du crâne, foramen et fosses cérébrales.',
              },
              {
                title: 'Tronc, Rachis & Thorax',
                system: 'torso',
                description: 'Cage thoracique, vertèbres, médiastin et appareil cardio-pulmonaire.',
              },
              {
                title: 'Appareil Locomoteur (Membres)',
                system: 'locomotor',
                description: 'Ceinture scapulaire, pelvienne, articulations et myologie complète.',
              },
              {
                title: 'Abdomen & Viscères',
                system: 'visceral',
                description: 'Cavité péritonéale, loges rénales et système digestif.',
              },
              {
                title: 'Système Nerveux Central & Périphérique',
                system: 'nervous',
                description: 'Voies motrices, sensitives, nerfs crâniens et plexus rachidiens.',
              },
              {
                title: 'Système Cardio-Vasculaire & Angiologie',
                system: 'vascular',
                description: 'Aorte, tronc cœliaque, réseau coronarien et retour veineux.',
              },
            ].map((module) => (
              <div
                key={module.system}
                className="p-5 rounded-3xl bg-[#1E242C] border-2 border-[#323B46] hover:border-[#DACBA9] transition flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="w-10 h-10 rounded-2xl bg-[#DACBA9]/20 text-[#DACBA9] flex items-center justify-center font-bold mb-3">
                    <Box className="w-5 h-5" />
                  </div>
                  <h3 className="font-extrabold text-sm text-[#FAF6F0] mb-1">{module.title}</h3>
                  <p className="text-xs text-[#BAC3CE] leading-relaxed">{module.description}</p>
                </div>

                <button
                  type="button"
                  onClick={() => onOpenAtlas(module.system)}
                  className="w-full py-2 px-3 rounded-xl bg-[#252D37] hover:bg-[#DACBA9] hover:text-[#15191E] text-xs font-bold text-[#DACBA9] transition cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <span>Lancer l'Atlas 3D</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Grades & Academic Follow-up */}
      {activeTab === 'grades' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-[#FAF6F0]">Relevé de Notes & Historique d'Évaluations</h2>
              <p className="text-xs text-[#BAC3CE]">
                Suivi de vos copies d’examens, scores obtenus et barèmes officiels.
              </p>
            </div>
            <button
              type="button"
              onClick={onOpenProfile}
              className="text-xs font-bold text-[#DACBA9] hover:underline"
            >
              Voir le profil détaillé →
            </button>
          </div>

          {results.length > 0 ? (
            <div className="space-y-3">
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
                        <h4 className="font-bold text-sm text-[#FAF6F0]">{res.examTitle}</h4>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            isPassing
                              ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                              : 'bg-rose-950 text-rose-300 border border-rose-500/40'
                          }`}
                        >
                          {isPassing ? 'Épreuve Validée' : 'Rattrapage requis'}
                        </span>
                      </div>
                      <p className="text-xs text-[#8C97A5] mt-1">
                        Soumis le{' '}
                        {new Date(res.submittedAt).toLocaleDateString('fr-FR', {
                          day: '2-digit',
                          month: 'long',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-lg font-black text-[#DACBA9]">
                          {res.score} / {res.totalPoints}
                        </div>
                        <div className="text-xs text-[#BAC3CE]">
                          {res.percentage}% · Mention {grade}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-8 rounded-3xl bg-[#1E242C] border border-dashed border-[#323B46] text-center space-y-3">
              <Award className="w-10 h-10 text-[#DACBA9] mx-auto" />
              <h3 className="font-bold text-sm text-[#FAF6F0]">Aucune évaluation terminée pour l'instant</h3>
              <p className="text-xs text-[#BAC3CE] max-w-sm mx-auto">
                Commencez par passer un examen assigné dans l'onglet « Mes Examens » pour enregistrer vos notes.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
