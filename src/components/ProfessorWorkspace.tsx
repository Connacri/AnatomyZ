import React, { useState, useMemo, useEffect } from 'react';
import {
  FilePlus,
  Users,
  Box,
  CheckCircle2,
  Eye,
  Edit,
  Trash2,
  Copy,
  BookOpen,
  GraduationCap,
  Search,
  Download,
  Plus,
  Compass,
  Lock,
  FileSpreadsheet,
  UserPlus,
  X,
  Save,
  ShieldAlert,
} from 'lucide-react';
import {
  AcademicClass,
  AnatomyExam,
  StudentExamResult,
  ExamQuestionType,
} from '../types';
import {
  UserRecord,
  isSuperAdminEmail,
  fetchStudentRecords,
  createStudentRecord,
  updateStudentRecord,
  deleteStudentRecord,
  requestProfessorAccreditation,
} from '../firebase';
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
  onProfileUpdated?: (updated: UserRecord) => void;
}

const AMPHITHEATER_DEMOS = [
  {
    id: 'demo-skull',
    title: 'Base du crâne & Paires crâniennes',
    system: 'nervous',
    systemFr: 'Système Nerveux',
    description:
      'Démonstration des foramens (ovale, rond, jugulaire) et trajets des nerfs trijumeau et facial.',
    keyPoints: 'Foramen ovale (V3), canal carotidien, foramen magnum.',
  },
  {
    id: 'demo-heart',
    title: 'Anatomie Cardiaque & Artères Coronaires',
    system: 'cardiovascular',
    systemFr: 'Cardiovasculaire',
    description:
      'Vascularisation du myocarde, artère interventriculaire antérieure et drainage par le sinus coronaire.',
    keyPoints: 'Sinus de Valsalva, coronaire gauche vs droite, apex cardiaque.',
  },
  {
    id: 'demo-spine',
    title: 'Biomécanique Rachidienne & Vertèbre C2',
    system: 'skeletal',
    systemFr: 'Squelettique',
    description:
      'Morphologie de l’Atlas et de l’Axis, ligaments alaires et apophyse odontoïde en 3D.',
    keyPoints: 'Dent de l’axis, foramen transversaire, canal vertébral.',
  },
  {
    id: 'demo-viscera',
    title: 'Tronc Cœliaque & Organogénèse Abdominale',
    system: 'digestive',
    systemFr: 'Digestif & Viscères',
    description:
      'Branches trifurquées du tronc cœliaque et rapports péritonéaux du bloc duodéno-pancréatique.',
    keyPoints: 'Artère gastrique gauche, hépatique commune, splénique.',
  },
];

const INITIAL_DEMO_STUDENTS: UserRecord[] = [
  {
    uid: 'student-demo',
    email: 'ines.benali@etu.univ-med.fr',
    displayName: 'Inès Benali',
    role: 'student',
    status: 'approved',
    matricule: 'MED-2026-0142',
    university: 'Faculté de Médecine',
    academicYear: 'DFGSM 2 (2ème année)',
    specialty: 'Anatomie Générale & Cardiovasculaire',
    phone: '+33 6 12 34 56 78',
    bio: 'Étudiante en 2ème année de médecine, groupe TP A.',
  },
  {
    uid: 'student-2',
    email: 'lucas.martin@etu.univ-med.fr',
    displayName: 'Lucas Martin',
    role: 'student',
    status: 'approved',
    matricule: 'MED-2026-0189',
    university: 'Faculté de Médecine',
    academicYear: 'DFGSM 2 (2ème année)',
    specialty: 'Ostéologie & Arthrologie',
    phone: '+33 6 98 76 54 32',
    bio: 'Étudiant DFGSM 2 — tutorat d’anatomie.',
  },
  {
    uid: 'student-3',
    email: 'sarah.khelifi@etu.univ-med.fr',
    displayName: 'Sarah Khelifi',
    role: 'student',
    status: 'approved',
    matricule: 'MED-2026-0215',
    university: 'Faculté de Médecine',
    academicYear: 'DFGSM 3 (3ème année)',
    specialty: 'Neuro-anatomie clinique',
    phone: '+33 6 45 67 89 10',
    bio: 'Certificat optionnel d’imagerie et neuro-anatomie 3D.',
  },
];

export function ProfessorWorkspace({
  userProfile,
  exams: initialExams,
  classes: initialClasses,
  results,
  onOpenAtlas,
  onOpenExamEditor,
  onPreviewExam,
  onProfileUpdated,
}: ProfessorWorkspaceProps) {
  // STRICT ADMIN VALIDATION CHECK:
  // Professor account is ONLY validated by Admin; otherwise only Demos are accessible!
  const isApprovedProfessor =
    isSuperAdminEmail(userProfile?.email) ||
    userProfile?.role === 'admin' ||
    (userProfile?.role === 'professor' && userProfile?.status === 'approved');

  const [activeTab, setActiveTab] = useState<
    'students' | 'exams' | 'cohorts' | 'submissions' | 'amphi'
  >(isApprovedProfessor ? 'students' : 'amphi');

  useEffect(() => {
    if (!isApprovedProfessor) {
      setActiveTab('amphi');
    }
  }, [isApprovedProfessor]);

  const [examList, setExamList] = useState<AnatomyExam[]>(initialExams);
  const [classesList, setClassesList] = useState<AcademicClass[]>(initialClasses);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft'>('all');
  const [feedback, setFeedback] = useState<string | null>(null);

  // Student CRUD state
  const [students, setStudents] = useState<UserRecord[]>(INITIAL_DEMO_STUDENTS);
  const [studentSearch, setStudentSearch] = useState('');
  const [studentCohortFilter, setStudentCohortFilter] = useState('all');
  const [editingStudent, setEditingStudent] = useState<UserRecord | null>(null);
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
  const [viewingStudent, setViewingStudent] = useState<UserRecord | null>(null);

  // Student Form fields
  const [stuName, setStuName] = useState('');
  const [stuEmail, setStuEmail] = useState('');
  const [stuMatricule, setStuMatricule] = useState('');
  const [stuUniversity, setStuUniversity] = useState('Faculté de Médecine');
  const [stuYear, setStuYear] = useState('DFGSM 2 (2ème année)');
  const [stuSpecialty, setStuSpecialty] = useState('Anatomie Générale');
  const [stuPhone, setStuPhone] = useState('');
  const [stuBio, setStuBio] = useState('');

  // Academic year / level management (created by the professor)
  const DEFAULT_LEVELS = [
    'PASS / LAS (1ère année)',
    'DFGSM 2 (2ème année)',
    'DFGSM 3 (3ème année)',
    'DFASM 1 (Externat)',
  ];
  const [academicLevels, setAcademicLevels] = useState<string[]>(() => {
    try {
      const saved = window.localStorage.getItem('anatomyz_academic_levels');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.filter((v) => typeof v === 'string' && v.trim());
        }
      }
    } catch {
      /* ignore */
    }
    return DEFAULT_LEVELS;
  });
  const [newLevelInput, setNewLevelInput] = useState('');

  const persistLevels = (levels: string[]) => {
    setAcademicLevels(levels);
    try {
      window.localStorage.setItem(
        'anatomyz_academic_levels',
        JSON.stringify(levels)
      );
    } catch {
      /* ignore */
    }
  };

  const addAcademicLevel = () => {
    const value = newLevelInput.trim();
    if (!value || academicLevels.includes(value)) return;
    persistLevels([...academicLevels, value]);
    setStuYear(value);
    setNewLevelInput('');
  };

  const removeAcademicLevel = (level: string) => {
    persistLevels(academicLevels.filter((l) => l !== level));
  };

  // Professor Accreditation Profile Detail Modal (for unapproved professor)
  const [isProfRequestModalOpen, setIsProfRequestModalOpen] = useState(false);
  const [profName, setProfName] = useState(userProfile?.displayName || '');
  const [profMatricule, setProfMatricule] = useState(userProfile?.matricule || '');
  const [profUniversity, setProfUniversity] = useState(
    userProfile?.university || 'Faculté de Médecine'
  );
  const [profYear, setProfYear] = useState(
    userProfile?.academicYear || 'Praticien Hospitalier / Enseignant'
  );
  const [profSpecialty, setProfSpecialty] = useState(
    userProfile?.specialty || 'Anatomie Générale & Organogénèse'
  );
  const [profPhone, setProfPhone] = useState(userProfile?.phone || '');
  const [profBio, setProfBio] = useState(userProfile?.bio || '');

  // Cohort creation modal
  const [isNewCohortOpen, setIsNewCohortOpen] = useState(false);
  const [newCohortName, setNewCohortName] = useState('');
  const [newCohortDesc, setNewCohortDesc] = useState('');

  // Exam Submissions / Inspection state
  const [selectedSubmission, setSelectedSubmission] =
    useState<StudentExamResult | null>(null);

  // Quick In-Situ New Exam Modal
  const [isQuickCreateOpen, setIsQuickCreateOpen] = useState(false);
  const [quickTitle, setQuickTitle] = useState('');
  const [quickSystem, setQuickSystem] = useState('Cardiovasculaire');
  const [quickDuration, setQuickDuration] = useState(30);
  const [quickCohort, setQuickCohort] = useState('DFGSM 2');

  useEffect(() => {
    if (!isApprovedProfessor) return;
    fetchStudentRecords().then((remote) => {
      if (remote && remote.length > 0) {
        const remoteUids = new Set(remote.map((r) => r.uid));
        setStudents([
          ...remote,
          ...INITIAL_DEMO_STUDENTS.filter((d) => !remoteUids.has(d.uid)),
        ]);
      }
    });
  }, [isApprovedProfessor]);

  const showToast = (msg: string) => {
    setFeedback(msg);
    setTimeout(() => setFeedback(null), 4000);
  };

  // Student CRUD Handlers
  const openCreateStudentModal = () => {
    setEditingStudent(null);
    setStuName('');
    setStuEmail('');
    setStuMatricule(`MED-2026-${Math.floor(1000 + Math.random() * 9000)}`);
    setStuUniversity('Faculté de Médecine');
    setStuYear('DFGSM 2 (2ème année)');
    setStuSpecialty('Anatomie Générale');
    setStuPhone('');
    setStuBio('');
    setIsStudentModalOpen(true);
  };

  const openEditStudentModal = (stu: UserRecord) => {
    setEditingStudent(stu);
    setStuName(stu.displayName || '');
    setStuEmail(stu.email || '');
    setStuMatricule(stu.matricule || '');
    setStuUniversity(stu.university || 'Faculté de Médecine');
    setStuYear(stu.academicYear || 'DFGSM 2 (2ème année)');
    setStuSpecialty(stu.specialty || 'Anatomie Générale');
    setStuPhone(stu.phone || '');
    setStuBio(stu.bio || '');
    setIsStudentModalOpen(true);
  };

  const handleSaveStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isApprovedProfessor) return;

    const payload = {
      displayName: stuName.trim(),
      email: stuEmail.trim(),
      matricule: stuMatricule.trim(),
      university: stuUniversity.trim(),
      academicYear: stuYear.trim(),
      specialty: stuSpecialty.trim(),
      phone: stuPhone.trim(),
      bio: stuBio.trim(),
    };

    if (editingStudent) {
      try {
        if (!editingStudent.uid.startsWith('student-')) {
          await updateStudentRecord(editingStudent.uid, payload);
        }
      } catch (err) {
        console.warn('Mise à jour locale étudiant:', err);
      }
      setStudents((prev) =>
        prev.map((s) =>
          s.uid === editingStudent.uid ? { ...s, ...payload } : s
        )
      );
      showToast(`Profil de l’étudiant ${payload.displayName} mis à jour.`);
    } else {
      try {
        const created = await createStudentRecord(payload);
        setStudents((prev) => [created, ...prev]);
      } catch (err) {
        const localStu: UserRecord = {
          uid: `student-${Date.now()}`,
          role: 'student',
          status: 'approved',
          ...payload,
        };
        setStudents((prev) => [localStu, ...prev]);
      }
      showToast(`Nouvel étudiant ${payload.displayName} ajouté avec succès.`);
    }
    setIsStudentModalOpen(false);
    setEditingStudent(null);
  };

  const handleDeleteStudent = async (stu: UserRecord) => {
    if (!isApprovedProfessor) return;
    try {
      if (!stu.uid.startsWith('student-')) {
        await deleteStudentRecord(stu.uid);
      }
    } catch (err) {
      console.warn('Suppression locale étudiant:', err);
    }
    setStudents((prev) => prev.filter((s) => s.uid !== stu.uid));
    showToast(`Étudiant ${stu.displayName} retiré de la promotion.`);
  };

  const handleSubmitProfRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    const details = {
      displayName: profName.trim() || 'Candidat Professeur',
      matricule: profMatricule.trim() || 'PROF-2026',
      university: profUniversity.trim() || 'Faculté de Médecine',
      academicYear: profYear.trim() || 'Praticien Hospitalier / Enseignant',
      specialty: profSpecialty.trim() || 'Anatomie Générale',
      bio: profBio.trim(),
      phone: profPhone.trim(),
    };
    if (userProfile?.uid) {
      try {
        await requestProfessorAccreditation(userProfile.uid, details);
      } catch (err) {
        console.warn('Demande enregistrée localement:', err);
      }
      if (onProfileUpdated) {
        onProfileUpdated({
          ...userProfile,
          ...details,
          status: 'pending_approval',
          requestedRole: 'professor',
        });
      }
    }
    setIsProfRequestModalOpen(false);
    showToast(
      'Votre profil détaillé a été transmis à l’Administrateur pour validation.'
    );
  };

  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      const q = studentSearch.toLowerCase();
      const matchText =
        s.displayName.toLowerCase().includes(q) ||
        s.email.toLowerCase().includes(q) ||
        (s.matricule && s.matricule.toLowerCase().includes(q)) ||
        (s.specialty && s.specialty.toLowerCase().includes(q));
      const matchCohort =
        studentCohortFilter === 'all' ||
        (s.academicYear && s.academicYear.includes(studentCohortFilter));
      return matchText && matchCohort;
    });
  }, [students, studentSearch, studentCohortFilter]);

  const togglePublish = (examId: string) => {
    if (!isApprovedProfessor) return;
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
    if (!isApprovedProfessor) return;
    setExamList((prev) => prev.filter((e) => e.id !== examId));
    AnatomyExamRepository.instance.delete(examId);
    showToast('Épreuve supprimée.');
  };

  const handleDuplicateExam = (exam: AnatomyExam) => {
    if (!isApprovedProfessor) return;
    const duplicated: AnatomyExam = {
      ...exam,
      id: `exam-${Date.now()}`,
      title: `${exam.title} (Copie)`,
      isPublished: false,
    };
    AnatomyExamRepository.instance.add(duplicated);
    setExamList((prev) => [duplicated, ...prev]);
    showToast('Épreuve dupliquée en brouillon.');
  };

  const handleSaveQuickExam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isApprovedProfessor || !quickTitle.trim()) return;

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
    showToast('Nouvelle épreuve créée.');
  };

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
        (exam.targetSystem &&
          exam.targetSystem.toLowerCase().includes(searchTerm.toLowerCase())) ||
        exam.description.toLowerCase().includes(searchTerm.toLowerCase());

      if (!matchesSearch) return false;
      if (statusFilter === 'published') return exam.isPublished;
      if (statusFilter === 'draft') return !exam.isPublished;
      return true;
    });
  }, [examList, searchTerm, statusFilter]);

  const handleExportCSV = () => {
    if (!isApprovedProfessor) return;
    const headers = [
      'ID Copie',
      'ID Examen',
      'Score',
      'Max Score',
      'Pourcentage',
      'Mention',
      'Date',
    ];
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
    <div className="w-full max-w-5xl mx-auto space-y-6 pb-16 text-[#FAF6F0]">
      {/* RESTRICTED BANNER WHEN PROFESSOR IS NOT YET VALIDATED BY ADMIN */}
      {!isApprovedProfessor && (
        <section className="p-5 rounded-2xl bg-[#1E242C] border-2 border-amber-500/60 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center shrink-0">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm sm:text-base font-bold text-[#FAF6F0]">
                  Compte Professeur en attente d’acceptation par l’Administrateur
                </h2>
                <p className="text-xs text-[#BAC3CE] mt-0.5 leading-relaxed">
                  Votre compte Professeur est validé uniquement par l’administrateur. En attendant son acceptation,{' '}
                  <strong className="text-[#DACBA9]">
                    vous avez uniquement accès aux démonstrations 3D
                  </strong>{' '}
                  et ne pouvez ni interagir avec les étudiants (CRUD verrouillé) ni accéder aux fonctionnalités d’examen.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsProfRequestModalOpen(true)}
              className="px-4 py-2 text-xs font-bold text-[#15191E] bg-[#DACBA9] hover:bg-[#ECE3D9] rounded-xl transition cursor-pointer shrink-0"
            >
              Entrer mon détail profil pour l’Admin
            </button>
          </div>
        </section>
      )}

      {/* Feedback Toast */}
      {feedback && (
        <div className="p-3.5 rounded-xl bg-[#1E242C] border border-[#DACBA9] text-xs text-[#FAF6F0] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{feedback}</span>
          </div>
          <button
            type="button"
            onClick={() => setFeedback(null)}
            className="text-[#BAC3CE] hover:text-[#FAF6F0] cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* 1. Professor Leadership Banner */}
      <section className="p-6 md:p-8 rounded-2xl bg-[#1E242C] border border-[#323B46] transition">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-xl bg-[#15191E] border border-[#323B46] text-[#DACBA9] flex items-center justify-center font-bold text-xl shrink-0">
              <GraduationCap className="w-7 h-7 text-[#DACBA9]" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-xl md:text-2xl font-bold tracking-tight text-[#FAF6F0]">
                  {userProfile?.displayName || 'Professeur Zenasni Kamel'}
                </h1>
                <span
                  className={`text-xs font-semibold px-2.5 py-0.5 rounded-lg border ${
                    isApprovedProfessor
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                  }`}
                >
                  {isApprovedProfessor
                    ? 'Professeur Accrédité par Admin'
                    : 'Accès Démo Seul (En attente Admin)'}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-[#BAC3CE] flex-wrap">
                <span>{userProfile?.university || 'Faculté de Médecine'}</span>
                <span aria-hidden="true">·</span>
                <span>
                  {userProfile?.specialty || 'Chaire d’Anatomie & Organogénèse'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0 flex-wrap">
            {isApprovedProfessor ? (
              <>
                <button
                  type="button"
                  onClick={openCreateStudentModal}
                  className="px-4 py-2 text-xs font-bold text-[#15191E] bg-[#DACBA9] hover:bg-[#ECE3D9] rounded-xl transition cursor-pointer inline-flex items-center gap-2"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>+ Ajouter un étudiant</span>
                </button>
                <button
                  type="button"
                  onClick={onOpenExamEditor}
                  className="px-4 py-2 text-xs font-semibold text-[#FAF6F0] bg-[#15191E] hover:bg-[#232C3A] border border-[#323B46] rounded-xl transition cursor-pointer inline-flex items-center gap-2"
                >
                  <FilePlus className="w-4 h-4 text-[#DACBA9]" />
                  <span>Créer une épreuve</span>
                </button>
              </>
            ) : (
              <span className="px-3.5 py-2 text-xs font-semibold text-[#BAC3CE] bg-[#15191E] border border-[#323B46] rounded-xl inline-flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-amber-400" />
                <span>Actions verrouillées jusqu’à validation Admin</span>
              </span>
            )}
            <button
              type="button"
              onClick={() => onOpenAtlas()}
              className="px-4 py-2 text-xs font-semibold text-[#FAF6F0] bg-[#15191E] hover:bg-[#232C3A] border border-[#323B46] rounded-xl transition cursor-pointer inline-flex items-center gap-2"
            >
              <Box className="w-4 h-4 text-[#DACBA9]" />
              <span>Amphithéâtre 3D</span>
            </button>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-[#323B46]">
          <div>
            <div className="text-xs text-[#BAC3CE]">Étudiants (CRUD)</div>
            <div className="text-2xl font-bold text-[#DACBA9] mt-1 tabular-nums">
              {isApprovedProfessor ? students.length : '🔒'}
            </div>
            <div className="text-xs text-[#BAC3CE] mt-0.5">
              {isApprovedProfessor
                ? 'Ajout, modification & suivi'
                : 'Validation Admin requise'}
            </div>
          </div>

          <div>
            <div className="text-xs text-[#BAC3CE]">Examens Rédigés</div>
            <div className="text-2xl font-bold text-[#FAF6F0] mt-1 tabular-nums">
              {isApprovedProfessor ? examList.length : '🔒'}
            </div>
            <div className="text-xs text-[#BAC3CE] mt-0.5">
              {isApprovedProfessor
                ? `${publishedCount} publié(s) · ${draftCount} brouillon(s)`
                : 'Verrouillé'}
            </div>
          </div>

          <div>
            <div className="text-xs text-[#BAC3CE]">Moyenne Promotion</div>
            <div className="text-2xl font-bold text-emerald-400 mt-1 tabular-nums">
              {isApprovedProfessor
                ? averageCohortScore !== null
                  ? `${averageCohortScore}%`
                  : '—'
                : '🔒'}
            </div>
            <div className="text-xs text-[#BAC3CE] mt-0.5">
              Résultats des étudiants
            </div>
          </div>

          <div>
            <div className="text-xs text-[#BAC3CE]">Démonstrations 3D</div>
            <div className="text-2xl font-bold text-sky-400 mt-1 tabular-nums">
              {AMPHITHEATER_DEMOS.length}
            </div>
            <div className="text-xs text-[#BAC3CE] mt-0.5">
              Disponibles en accès libre
            </div>
          </div>
        </div>
      </section>

      {/* 2. Navigation Tabs (Locked tabs if !isApprovedProfessor) */}
      <nav
        aria-label="Espace de travail professeur"
        className="flex items-center gap-1.5 p-1 bg-[#1E242C] border border-[#323B46] rounded-xl overflow-x-auto"
      >
        <button
          type="button"
          onClick={() => {
            if (isApprovedProfessor) setActiveTab('students');
            else
              showToast(
                'Accès refusé : votre compte Professeur doit être validé par l’Admin pour gérer les étudiants.'
              );
          }}
          className={`flex-1 min-w-[155px] py-2.5 px-3 text-xs font-bold rounded-lg transition whitespace-nowrap cursor-pointer flex items-center justify-center gap-2 ${
            activeTab === 'students'
              ? 'bg-[#DACBA9] text-[#15191E]'
              : !isApprovedProfessor
              ? 'text-[#BAC3CE]/50 cursor-not-allowed'
              : 'text-[#BAC3CE] hover:text-[#FAF6F0] hover:bg-[#15191E]'
          }`}
        >
          {isApprovedProfessor ? (
            <Users className="w-4 h-4" />
          ) : (
            <Lock className="w-3.5 h-3.5 text-amber-400" />
          )}
          <span>Étudiants CRUD ({isApprovedProfessor ? students.length : '🔒'})</span>
        </button>

        <button
          type="button"
          onClick={() => {
            if (isApprovedProfessor) setActiveTab('exams');
            else
              showToast(
                'Accès refusé : validation par l’Admin requise pour gérer les examens.'
              );
          }}
          className={`flex-1 min-w-[150px] py-2.5 px-3 text-xs font-bold rounded-lg transition whitespace-nowrap cursor-pointer flex items-center justify-center gap-2 ${
            activeTab === 'exams'
              ? 'bg-[#DACBA9] text-[#15191E]'
              : !isApprovedProfessor
              ? 'text-[#BAC3CE]/50 cursor-not-allowed'
              : 'text-[#BAC3CE] hover:text-[#FAF6F0] hover:bg-[#15191E]'
          }`}
        >
          {isApprovedProfessor ? (
            <BookOpen className="w-4 h-4" />
          ) : (
            <Lock className="w-3.5 h-3.5 text-amber-400" />
          )}
          <span>Examens ({isApprovedProfessor ? examList.length : '🔒'})</span>
        </button>

        <button
          type="button"
          onClick={() => {
            if (isApprovedProfessor) setActiveTab('cohorts');
            else
              showToast(
                'Accès refusé : validation par l’Admin requise pour gérer les promotions.'
              );
          }}
          className={`flex-1 min-w-[140px] py-2.5 px-3 text-xs font-bold rounded-lg transition whitespace-nowrap cursor-pointer flex items-center justify-center gap-2 ${
            activeTab === 'cohorts'
              ? 'bg-[#DACBA9] text-[#15191E]'
              : !isApprovedProfessor
              ? 'text-[#BAC3CE]/50 cursor-not-allowed'
              : 'text-[#BAC3CE] hover:text-[#FAF6F0] hover:bg-[#15191E]'
          }`}
        >
          {isApprovedProfessor ? (
            <Users className="w-4 h-4" />
          ) : (
            <Lock className="w-3.5 h-3.5 text-amber-400" />
          )}
          <span>Promotions</span>
        </button>

        <button
          type="button"
          onClick={() => {
            if (isApprovedProfessor) setActiveTab('submissions');
            else
              showToast(
                'Accès refusé : validation par l’Admin requise pour consulter les copies des étudiants.'
              );
          }}
          className={`flex-1 min-w-[140px] py-2.5 px-3 text-xs font-bold rounded-lg transition whitespace-nowrap cursor-pointer flex items-center justify-center gap-2 ${
            activeTab === 'submissions'
              ? 'bg-[#DACBA9] text-[#15191E]'
              : !isApprovedProfessor
              ? 'text-[#BAC3CE]/50 cursor-not-allowed'
              : 'text-[#BAC3CE] hover:text-[#FAF6F0] hover:bg-[#15191E]'
          }`}
        >
          {isApprovedProfessor ? (
            <FileSpreadsheet className="w-4 h-4" />
          ) : (
            <Lock className="w-3.5 h-3.5 text-amber-400" />
          )}
          <span>Copies ({isApprovedProfessor ? results.length : '🔒'})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('amphi')}
          className={`flex-1 min-w-[160px] py-2.5 px-3 text-xs font-bold rounded-lg transition whitespace-nowrap cursor-pointer flex items-center justify-center gap-2 ${
            activeTab === 'amphi'
              ? 'bg-[#DACBA9] text-[#15191E]'
              : 'text-[#BAC3CE] hover:text-[#FAF6F0] hover:bg-[#15191E]'
          }`}
        >
          <Compass className="w-4 h-4" />
          <span>Démonstrations 3D</span>
        </button>
      </nav>

      {/* TAB 0: STUDENTS LIST & FULL CRUD (ONLY WHEN APPROVED BY ADMIN) */}
      {isApprovedProfessor && activeTab === 'students' && (
        <div className="space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-[#FAF6F0]">
                Liste des Étudiants — Gestion CRUD Complète
              </h2>
              <p className="text-xs text-[#BAC3CE] mt-0.5">
                Ajoutez, consultez, modifiez et supprimez les fiches étudiantes de vos promotions médicales.
              </p>
            </div>

            <div className="flex items-center gap-2.5 flex-wrap">
              <div className="relative min-w-[220px]">
                <Search className="w-4 h-4 text-[#BAC3CE] absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={studentSearch}
                  onChange={(e) => setStudentSearch(e.target.value)}
                  placeholder="Rechercher nom, email, matricule…"
                  className="w-full pl-9 pr-3 py-2 text-xs bg-[#1E242C] border border-[#323B46] rounded-xl text-[#FAF6F0] placeholder-[#BAC3CE] focus:outline-none focus:border-[#DACBA9]"
                />
              </div>

              <select
                value={studentCohortFilter}
                onChange={(e) => setStudentCohortFilter(e.target.value)}
                className="px-3 py-2 text-xs bg-[#1E242C] border border-[#323B46] rounded-xl text-[#FAF6F0] cursor-pointer"
              >
                <option value="all">Toutes promotions</option>
                {academicLevels.map((level) => (
                  <option key={level} value={level}>
                    {level}
                  </option>
                ))}
              </select>

              <button
                type="button"
                onClick={openCreateStudentModal}
                className="px-4 py-2 text-xs font-bold text-[#15191E] bg-[#DACBA9] hover:bg-[#ECE3D9] rounded-xl transition cursor-pointer inline-flex items-center gap-1.5"
              >
                <UserPlus className="w-4 h-4" />
                <span>+ Nouvel étudiant</span>
              </button>
            </div>
          </div>

          {filteredStudents.length === 0 ? (
            <div className="p-8 text-center rounded-2xl bg-[#1E242C] border border-[#323B46] space-y-2">
              <p className="text-sm font-semibold text-[#FAF6F0]">
                Aucun étudiant correspondant
              </p>
              <p className="text-xs text-[#BAC3CE]">
                Cliquez sur « + Nouvel étudiant » pour inscrire un étudiant dans votre promotion.
              </p>
            </div>
          ) : (
            <div className="rounded-2xl bg-[#1E242C] border border-[#323B46] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#15191E] text-[#BAC3CE] font-semibold border-b border-[#323B46]">
                    <tr>
                      <th className="py-3 px-4">Étudiant</th>
                      <th className="py-3 px-4">Matricule</th>
                      <th className="py-3 px-4">Promotion / Année</th>
                      <th className="py-3 px-4">Spécialité / Groupe</th>
                      <th className="py-3 px-4 text-right">Actions CRUD</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#323B46]">
                    {filteredStudents.map((stu) => (
                      <tr
                        key={stu.uid}
                        className="hover:bg-[#15191E]/50 transition"
                      >
                        <td className="py-3 px-4">
                          <div className="font-bold text-[#FAF6F0]">
                            {stu.displayName}
                          </div>
                          <div className="text-[11px] text-[#BAC3CE] font-mono">
                            {stu.email}
                          </div>
                        </td>
                        <td className="py-3 px-4 font-mono text-[#DACBA9]">
                          {stu.matricule || '—'}
                        </td>
                        <td className="py-3 px-4 text-[#FAF6F0]">
                          <div>{stu.academicYear || 'DFGSM 2'}</div>
                          <div className="text-[11px] text-[#BAC3CE]">
                            {stu.university || 'Faculté de Médecine'}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-[#BAC3CE]">
                          {stu.specialty || 'Anatomie Générale'}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="inline-flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => setViewingStudent(stu)}
                              className="p-2 rounded-lg bg-[#15191E] border border-[#323B46] text-[#BAC3CE] hover:text-[#FAF6F0] cursor-pointer"
                              title="Consulter le détail et les notes"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => openEditStudentModal(stu)}
                              className="px-2.5 py-1.5 rounded-lg bg-[#DACBA9] text-[#15191E] font-bold text-xs cursor-pointer hover:bg-[#ECE3D9] inline-flex items-center gap-1"
                              title="Modifier l’étudiant"
                            >
                              <Edit className="w-3.5 h-3.5" />
                              <span>Modifier</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteStudent(stu)}
                              className="p-2 rounded-lg bg-[#15191E] border border-[#323B46] text-rose-400 hover:text-rose-300 cursor-pointer"
                              title="Supprimer l’étudiant"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 1: EXAM MANAGEMENT (ONLY WHEN APPROVED BY ADMIN) */}
      {isApprovedProfessor && activeTab === 'exams' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 p-1 bg-[#1E242C] border border-[#323B46] rounded-xl self-start">
              {(['all', 'published', 'draft'] as const).map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition cursor-pointer ${
                    statusFilter === st
                      ? 'bg-[#DACBA9] text-[#15191E]'
                      : 'text-[#BAC3CE] hover:text-[#FAF6F0]'
                  }`}
                >
                  {st === 'all'
                    ? `Tous (${examList.length})`
                    : st === 'published'
                    ? `Publiés (${publishedCount})`
                    : `Brouillons (${draftCount})`}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3">
              <div className="relative min-w-[220px]">
                <Search className="w-4 h-4 text-[#BAC3CE] absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Rechercher une épreuve…"
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-[#1E242C] border border-[#323B46] rounded-xl text-[#FAF6F0] placeholder-[#BAC3CE] focus:outline-none focus:border-[#DACBA9]"
                />
              </div>
              <button
                type="button"
                onClick={() => setIsQuickCreateOpen(true)}
                className="px-3.5 py-2 text-xs font-bold text-[#15191E] bg-[#DACBA9] hover:bg-[#ECE3D9] rounded-xl transition cursor-pointer inline-flex items-center gap-1.5 whitespace-nowrap"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Nouvel examen</span>
              </button>
            </div>
          </div>

          <div className="space-y-3">
            {filteredExams.map((exam) => (
              <div
                key={exam.id}
                className="p-5 rounded-2xl bg-[#1E242C] border border-[#323B46] flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 min-w-0">
                  <div className="flex items-center gap-2 text-xs text-[#BAC3CE]">
                    <span>{exam.targetSystem || 'Général'}</span>
                    <span aria-hidden="true">·</span>
                    <span>{exam.targetCohort || 'DFGSM 2'}</span>
                    <span aria-hidden="true">·</span>
                    <span className="tabular-nums">{exam.durationMinutes} min</span>
                    <span aria-hidden="true">·</span>
                    <span className="tabular-nums">
                      {exam.questions.length} question(s)
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-[#FAF6F0] truncate">
                    {exam.title}
                  </h3>

                  <p className="text-xs text-[#BAC3CE] line-clamp-1">
                    {exam.description}
                  </p>
                </div>

                <div className="flex items-center gap-2.5 shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-[#323B46]">
                  <button
                    type="button"
                    onClick={() => togglePublish(exam.id)}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition cursor-pointer ${
                      exam.isPublished
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        : 'bg-[#15191E] text-[#BAC3CE] border border-[#323B46]'
                    }`}
                  >
                    {exam.isPublished ? 'Publié' : 'Brouillon'}
                  </button>

                  <button
                    type="button"
                    onClick={() => onPreviewExam(exam)}
                    className="p-2 text-xs text-[#BAC3CE] hover:text-[#FAF6F0] bg-[#15191E] rounded-xl border border-[#323B46] transition cursor-pointer"
                    title="Aperçu"
                  >
                    <Eye className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDuplicateExam(exam)}
                    className="p-2 text-xs text-[#BAC3CE] hover:text-[#FAF6F0] bg-[#15191E] rounded-xl border border-[#323B46] transition cursor-pointer"
                    title="Dupliquer"
                  >
                    <Copy className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDeleteExam(exam.id)}
                    className="p-2 text-xs text-rose-400 hover:text-rose-300 bg-[#15191E] rounded-xl border border-[#323B46] transition cursor-pointer"
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

      {/* TAB 2: PROMOTIONS & COHORTS (ONLY WHEN APPROVED BY ADMIN) */}
      {isApprovedProfessor && activeTab === 'cohorts' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-[#FAF6F0]">
                Promotions & Groupes Pédagogiques
              </h2>
              <p className="text-xs text-[#BAC3CE] mt-0.5">
                Organisation des promotions médicales rattachées à vos enseignements.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsNewCohortOpen(true)}
              className="px-3.5 py-2 text-xs font-bold text-[#15191E] bg-[#DACBA9] hover:bg-[#ECE3D9] rounded-xl transition cursor-pointer inline-flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Créer une promotion</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {classesList.map((c) => (
              <div
                key={c.id}
                className="p-5 rounded-2xl bg-[#1E242C] border border-[#323B46] flex flex-col justify-between space-y-4"
              >
                <div className="space-y-2">
                  <div className="text-xs text-[#DACBA9] font-semibold">
                    Promotion Médicale
                  </div>
                  <h3 className="text-base font-bold text-[#FAF6F0]">{c.name}</h3>
                  <p className="text-xs text-[#BAC3CE] leading-relaxed">
                    {c.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-[#323B46] flex items-center justify-between">
                  <span className="text-xs text-[#BAC3CE]">
                    {students.length} étudiants actifs
                  </span>
                  <button
                    type="button"
                    onClick={() => setActiveTab('students')}
                    className="px-3 py-1.5 text-xs font-bold text-[#15191E] bg-[#DACBA9] hover:bg-[#ECE3D9] rounded-xl transition cursor-pointer"
                  >
                    Gérer les étudiants (CRUD)
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: SUBMISSIONS (ONLY WHEN APPROVED BY ADMIN) */}
      {isApprovedProfessor && activeTab === 'submissions' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-[#FAF6F0]">
                Registre Académique des Copies Rendues
              </h2>
              <p className="text-xs text-[#BAC3CE] mt-0.5">
                Copies horodatées transmises par les étudiants avec calcul des notes en direct.
              </p>
            </div>
            <button
              type="button"
              onClick={handleExportCSV}
              className="px-3.5 py-2 text-xs font-bold text-[#15191E] bg-[#DACBA9] hover:bg-[#ECE3D9] rounded-xl transition cursor-pointer inline-flex items-center gap-1.5 self-start sm:self-auto"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Exporter le relevé (CSV)</span>
            </button>
          </div>

          <div className="rounded-2xl bg-[#1E242C] border border-[#323B46] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#15191E] text-[#BAC3CE] font-semibold border-b border-[#323B46]">
                  <tr>
                    <th className="py-3 px-4">Épreuve</th>
                    <th className="py-3 px-4">Étudiant</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4 text-right">Score</th>
                    <th className="py-3 px-4 text-right">Pourcentage</th>
                    <th className="py-3 px-4 text-center">Mention</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#323B46]">
                  {results.map((r) => {
                    const matchedExam = examList.find((e) => e.id === r.examId);
                    const mention = gradeForPercentage(r.percentage);
                    return (
                      <tr key={r.id} className="hover:bg-[#15191E]/50 transition">
                        <td className="py-3 px-4 font-semibold text-[#FAF6F0]">
                          {matchedExam?.title || `Examen ${r.examId}`}
                        </td>
                        <td className="py-3 px-4 text-[#BAC3CE] font-mono">
                          {r.studentId}
                        </td>
                        <td className="py-3 px-4 text-[#BAC3CE] tabular-nums">
                          {new Date(r.submittedAt).toLocaleDateString('fr-FR')}
                        </td>
                        <td className="py-3 px-4 text-right font-mono tabular-nums text-[#FAF6F0]">
                          {r.score} / {r.maxScore}
                        </td>
                        <td className="py-3 px-4 text-right font-mono tabular-nums text-emerald-400 font-semibold">
                          {r.percentage.toFixed(1)}%
                        </td>
                        <td className="py-3 px-4 text-center font-bold text-[#DACBA9]">
                          {mention}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            type="button"
                            onClick={() => setSelectedSubmission(r)}
                            className="text-xs text-[#DACBA9] hover:underline font-semibold cursor-pointer"
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
        </div>
      )}

      {/* TAB 4: AMPHITHEATER DEMONSTRATIONS 3D (ALWAYS ACCESSIBLE) */}
      {activeTab === 'amphi' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h2 className="text-base font-bold text-[#FAF6F0]">
                Mode Démonstration Amphithéâtre & Cours Magistraux 3D
              </h2>
              <p className="text-xs text-[#BAC3CE] mt-0.5">
                {isApprovedProfessor
                  ? 'Projetez directement un système anatomique avec repères cliniques pour vos cours.'
                  : 'Mode démonstration actif en attendant la validation de votre compte Professeur par l’Administrateur.'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => onOpenAtlas()}
              className="px-4 py-2 text-xs font-bold text-[#15191E] bg-[#DACBA9] hover:bg-[#ECE3D9] rounded-xl transition cursor-pointer"
            >
              Lancer l’Atlas 3D Général
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {AMPHITHEATER_DEMOS.map((demo) => (
              <div
                key={demo.id}
                className="p-5 rounded-2xl bg-[#1E242C] border border-[#323B46] flex flex-col justify-between space-y-4"
              >
                <div className="space-y-2">
                  <div className="text-xs text-[#DACBA9] font-semibold">
                    {demo.systemFr}
                  </div>
                  <h3 className="text-base font-bold text-[#FAF6F0]">
                    {demo.title}
                  </h3>
                  <p className="text-xs text-[#BAC3CE] leading-relaxed">
                    {demo.description}
                  </p>
                  <div className="p-3 rounded-xl bg-[#15191E] text-xs text-[#BAC3CE]">
                    <strong className="text-[#DACBA9]">
                      Repères pédagogiques :{' '}
                    </strong>
                    {demo.keyPoints}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onOpenAtlas(demo.system)}
                  className="w-full py-2.5 px-3 text-xs font-bold text-[#15191E] bg-[#DACBA9] hover:bg-[#ECE3D9] rounded-xl transition cursor-pointer flex items-center justify-center gap-2"
                >
                  <Box className="w-4 h-4" />
                  <span>Projeter la démo en 3D</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL A: CREATE / EDIT STUDENT (CRUD) */}
      {isStudentModalOpen && isApprovedProfessor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <form
            onSubmit={handleSaveStudent}
            className="w-full max-w-lg rounded-2xl bg-[#1E242C] border-2 border-[#DACBA9] p-6 space-y-4 text-[#FAF6F0] max-h-[92vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between border-b border-[#323B46] pb-3">
              <h3 className="text-base font-bold text-[#FAF6F0]">
                {editingStudent
                  ? `Modifier l’étudiant : ${editingStudent.displayName}`
                  : 'Ajouter un nouvel étudiant'}
              </h3>
              <button
                type="button"
                onClick={() => setIsStudentModalOpen(false)}
                className="text-[#BAC3CE] hover:text-[#FAF6F0] p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
              <div>
                <label className="block font-semibold text-[#BAC3CE] mb-1">
                  Nom complet *
                </label>
                <input
                  type="text"
                  required
                  value={stuName}
                  onChange={(e) => setStuName(e.target.value)}
                  placeholder="Ex: Yassine Mansouri"
                  className="w-full px-3 py-2 rounded-xl bg-[#15191E] border border-[#323B46] text-[#FAF6F0]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#BAC3CE] mb-1">
                  Email universitaire *
                </label>
                <input
                  type="email"
                  required
                  value={stuEmail}
                  onChange={(e) => setStuEmail(e.target.value)}
                  placeholder="yassine@etu.univ-med.fr"
                  className="w-full px-3 py-2 rounded-xl bg-[#15191E] border border-[#323B46] text-[#FAF6F0] font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#BAC3CE] mb-1">
                  Numéro de matricule *
                </label>
                <input
                  type="text"
                  required
                  value={stuMatricule}
                  onChange={(e) => setStuMatricule(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#15191E] border border-[#323B46] text-[#FAF6F0] font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#BAC3CE] mb-1">
                  Promotion / Année *
                </label>
                <select
                  value={stuYear}
                  onChange={(e) => setStuYear(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#15191E] border border-[#323B46] text-[#FAF6F0]"
                >
                  {academicLevels.map((level) => (
                    <option key={level} value={level}>
                      {level}
                    </option>
                  ))}
                </select>

                {/* Professeur : créer / supprimer des niveaux */}
                <div className="mt-2 flex items-center gap-2">
                  <input
                    type="text"
                    value={newLevelInput}
                    onChange={(e) => setNewLevelInput(e.target.value)}
                    placeholder="Nouveau niveau (ex: DFASM 2)"
                    className="flex-1 px-3 py-1.5 rounded-xl bg-[#15191E] border border-[#323B46] text-[#FAF6F0] text-sm"
                  />
                  <button
                    type="button"
                    onClick={addAcademicLevel}
                    className="px-3 py-1.5 rounded-xl bg-[#DACBA9] text-[#15191E] text-xs font-bold transition cursor-pointer"
                  >
                    + Ajouter
                  </button>
                </div>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {academicLevels.map((level) => (
                    <span
                      key={level}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#1E242C] border border-[#323B46] text-[10px] text-[#BAC3CE]"
                    >
                      {level}
                      <button
                        type="button"
                        onClick={() => removeAcademicLevel(level)}
                        className="text-rose-400 hover:text-rose-300 cursor-pointer"
                        title="Supprimer ce niveau"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#BAC3CE] mb-1">
                  Faculté / Université
                </label>
                <input
                  type="text"
                  value={stuUniversity}
                  onChange={(e) => setStuUniversity(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#15191E] border border-[#323B46] text-[#FAF6F0]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#BAC3CE] mb-1">
                  Spécialité / Groupe TP
                </label>
                <input
                  type="text"
                  value={stuSpecialty}
                  onChange={(e) => setStuSpecialty(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#15191E] border border-[#323B46] text-[#FAF6F0]"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-semibold text-[#BAC3CE] mb-1">
                  Téléphone
                </label>
                <input
                  type="text"
                  value={stuPhone}
                  onChange={(e) => setStuPhone(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#15191E] border border-[#323B46] text-[#FAF6F0]"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-semibold text-[#BAC3CE] mb-1">
                  Observations pédagogiques
                </label>
                <textarea
                  rows={2}
                  value={stuBio}
                  onChange={(e) => setStuBio(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#15191E] border border-[#323B46] text-[#FAF6F0] resize-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#323B46]">
              <button
                type="button"
                onClick={() => setIsStudentModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-[#BAC3CE] hover:text-[#FAF6F0] cursor-pointer"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-bold text-[#15191E] bg-[#DACBA9] hover:bg-[#ECE3D9] rounded-xl transition cursor-pointer inline-flex items-center gap-1.5"
              >
                <Save className="w-3.5 h-3.5" />
                <span>
                  {editingStudent ? 'Enregistrer les modifications' : 'Créer l’étudiant'}
                </span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL B: VIEW STUDENT DETAIL (READ) */}
      {viewingStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl bg-[#1E242C] border-2 border-[#DACBA9] p-6 space-y-4 text-[#FAF6F0]">
            <div className="flex items-start justify-between border-b border-[#323B46] pb-3">
              <div>
                <span className="text-xs text-[#DACBA9] font-semibold">
                  Dossier Académique Étudiant
                </span>
                <h3 className="text-base font-bold text-[#FAF6F0] mt-0.5">
                  {viewingStudent.displayName}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setViewingStudent(null)}
                className="text-[#BAC3CE] hover:text-[#FAF6F0] p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 rounded-xl bg-[#15191E] space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-[#BAC3CE]">Email :</span>
                <span className="font-mono text-[#FAF6F0]">{viewingStudent.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#BAC3CE]">Matricule :</span>
                <span className="font-mono text-[#DACBA9]">
                  {viewingStudent.matricule || '—'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#BAC3CE]">Promotion :</span>
                <span className="text-[#FAF6F0]">
                  {viewingStudent.academicYear || 'DFGSM 2'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#BAC3CE]">Spécialité / Groupe :</span>
                <span className="text-[#FAF6F0]">
                  {viewingStudent.specialty || 'Anatomie Générale'}
                </span>
              </div>
              {viewingStudent.bio && (
                <div className="pt-2 border-t border-[#323B46] text-[#BAC3CE]">
                  {viewingStudent.bio}
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  const s = viewingStudent;
                  setViewingStudent(null);
                  openEditStudentModal(s);
                }}
                className="px-4 py-2 text-xs font-bold text-[#15191E] bg-[#DACBA9] hover:bg-[#ECE3D9] rounded-xl cursor-pointer"
              >
                Modifier la fiche
              </button>
              <button
                type="button"
                onClick={() => setViewingStudent(null)}
                className="px-4 py-2 text-xs font-semibold text-[#FAF6F0] bg-[#15191E] border border-[#323B46] rounded-xl cursor-pointer"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL C: PROFESSOR PROFILE DETAIL ENTRY FOR ADMIN VALIDATION */}
      {isProfRequestModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <form
            onSubmit={handleSubmitProfRequest}
            className="w-full max-w-lg rounded-2xl bg-[#1E242C] border-2 border-[#DACBA9] p-6 space-y-4 text-[#FAF6F0]"
          >
            <div className="flex items-center justify-between border-b border-[#323B46] pb-3">
              <div>
                <span className="text-xs text-[#DACBA9] font-semibold">
                  Demande d’accréditation Enseignant
                </span>
                <h3 className="text-base font-bold text-[#FAF6F0]">
                  Détail de votre profil Professeur pour l’Admin
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsProfRequestModalOpen(false)}
                className="text-[#BAC3CE] hover:text-[#FAF6F0] p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block font-semibold text-[#BAC3CE] mb-1">
                  Nom complet & Titre *
                </label>
                <input
                  type="text"
                  required
                  value={profName}
                  onChange={(e) => setProfName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#15191E] border border-[#323B46] text-[#FAF6F0]"
                />
              </div>
              <div>
                <label className="block font-semibold text-[#BAC3CE] mb-1">
                  Matricule Enseignant *
                </label>
                <input
                  type="text"
                  required
                  value={profMatricule}
                  onChange={(e) => setProfMatricule(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#15191E] border border-[#323B46] text-[#FAF6F0] font-mono"
                />
              </div>
              <div>
                <label className="block font-semibold text-[#BAC3CE] mb-1">
                  Université / Faculté *
                </label>
                <input
                  type="text"
                  required
                  value={profUniversity}
                  onChange={(e) => setProfUniversity(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#15191E] border border-[#323B46] text-[#FAF6F0]"
                />
              </div>
              <div>
                <label className="block font-semibold text-[#BAC3CE] mb-1">
                  Spécialité anatomique *
                </label>
                <input
                  type="text"
                  required
                  value={profSpecialty}
                  onChange={(e) => setProfSpecialty(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#15191E] border border-[#323B46] text-[#FAF6F0]"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block font-semibold text-[#BAC3CE] mb-1">
                  Téléphone professionnel
                </label>
                <input
                  type="text"
                  value={profPhone}
                  onChange={(e) => setProfPhone(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#15191E] border border-[#323B46] text-[#FAF6F0]"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block font-semibold text-[#BAC3CE] mb-1">
                  Biographie & Cours supervisés
                </label>
                <textarea
                  rows={2}
                  value={profBio}
                  onChange={(e) => setProfBio(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#15191E] border border-[#323B46] text-[#FAF6F0] resize-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#323B46]">
              <button
                type="button"
                onClick={() => setIsProfRequestModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-[#BAC3CE] cursor-pointer"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-bold text-[#15191E] bg-[#DACBA9] hover:bg-[#ECE3D9] rounded-xl cursor-pointer"
              >
                Envoyer pour validation Admin
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL D: NEW COHORT */}
      {isNewCohortOpen && isApprovedProfessor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!newCohortName.trim()) return;
              setClassesList((prev) => [
                ...prev,
                {
                  id: `class-${Date.now()}`,
                  name: newCohortName.trim(),
                  professorId: userProfile?.uid || 'prof-demo',
                  description:
                    newCohortDesc.trim() || 'Nouvelle promotion académique.',
                  studentIds: [],
                },
              ]);
              setNewCohortName('');
              setNewCohortDesc('');
              setIsNewCohortOpen(false);
              showToast('Nouvelle promotion créée.');
            }}
            className="w-full max-w-md rounded-2xl bg-[#1E242C] border-2 border-[#DACBA9] p-6 space-y-4 text-[#FAF6F0]"
          >
            <h3 className="text-base font-bold text-[#FAF6F0]">
              Créer une nouvelle promotion
            </h3>
            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-[#BAC3CE] mb-1">
                  Nom de la promotion *
                </label>
                <input
                  type="text"
                  required
                  value={newCohortName}
                  onChange={(e) => setNewCohortName(e.target.value)}
                  placeholder="Ex: DFGSM 3 — Promotion 2026"
                  className="w-full px-3 py-2 rounded-xl bg-[#15191E] border border-[#323B46] text-[#FAF6F0]"
                />
              </div>
              <div>
                <label className="block font-semibold text-[#BAC3CE] mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={newCohortDesc}
                  onChange={(e) => setNewCohortDesc(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#15191E] border border-[#323B46] text-[#FAF6F0] resize-none"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsNewCohortOpen(false)}
                className="px-4 py-2 text-xs text-[#BAC3CE] cursor-pointer"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-bold text-[#15191E] bg-[#DACBA9] rounded-xl cursor-pointer"
              >
                Créer
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Quick Exam Creation Modal */}
      {isQuickCreateOpen && isApprovedProfessor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <form
            onSubmit={handleSaveQuickExam}
            className="w-full max-w-md rounded-2xl bg-[#1E242C] border-2 border-[#DACBA9] p-6 space-y-4 text-[#FAF6F0]"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-[#FAF6F0]">
                Créer une nouvelle épreuve
              </h3>
              <button
                type="button"
                onClick={() => setIsQuickCreateOpen(false)}
                className="text-[#BAC3CE] hover:text-[#FAF6F0] p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-[#BAC3CE] mb-1">
                  Titre de l’épreuve *
                </label>
                <input
                  type="text"
                  required
                  value={quickTitle}
                  onChange={(e) => setQuickTitle(e.target.value)}
                  placeholder="ex: Évaluation — Rachis & Nerfs Spinaux"
                  className="w-full px-3 py-2 bg-[#15191E] border border-[#323B46] rounded-xl text-[#FAF6F0]"
                />
              </div>

              <div>
                <label className="block text-[#BAC3CE] mb-1">
                  Système Anatomique Ciblé
                </label>
                <select
                  value={quickSystem}
                  onChange={(e) => setQuickSystem(e.target.value)}
                  className="w-full px-3 py-2 bg-[#15191E] border border-[#323B46] rounded-xl text-[#FAF6F0]"
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
                  <label className="block text-[#BAC3CE] mb-1">
                    Durée (minutes)
                  </label>
                  <input
                    type="number"
                    min="5"
                    max="180"
                    value={quickDuration}
                    onChange={(e) => setQuickDuration(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-[#15191E] border border-[#323B46] rounded-xl text-[#FAF6F0]"
                  />
                </div>
                <div>
                  <label className="block text-[#BAC3CE] mb-1">
                    Promotion cible
                  </label>
                  <select
                    value={quickCohort}
                    onChange={(e) => setQuickCohort(e.target.value)}
                    className="w-full px-3 py-2 bg-[#15191E] border border-[#323B46] rounded-xl text-[#FAF6F0]"
                  >
                    <option value="DFGSM 2">DFGSM 2 (2ème année)</option>
                    <option value="DFGSM 3">DFGSM 3 (3ème année)</option>
                    <option value="DFASM 1">DFASM 1 (Externat)</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#323B46]">
              <button
                type="button"
                onClick={() => setIsQuickCreateOpen(false)}
                className="px-4 py-2 text-xs font-medium text-[#BAC3CE] cursor-pointer"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-bold text-[#15191E] bg-[#DACBA9] rounded-xl cursor-pointer"
              >
                Enregistrer l’examen
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Submission Detail Modal */}
      {selectedSubmission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl bg-[#1E242C] border border-[#323B46] p-6 space-y-4 text-[#FAF6F0]">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs text-[#DACBA9] font-medium">
                  Copie d’examen certifiée
                </span>
                <h3 className="text-base font-bold text-[#FAF6F0] mt-0.5">
                  Étudiant {selectedSubmission.studentId}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedSubmission(null)}
                className="text-[#BAC3CE] hover:text-[#FAF6F0] p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-4 rounded-xl bg-[#15191E] space-y-2 text-xs text-[#BAC3CE]">
              <div className="flex items-center justify-between">
                <span>Épreuve :</span>
                <span className="font-semibold text-[#FAF6F0]">
                  {selectedSubmission.examId}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Note finale :</span>
                <span className="font-mono text-[#FAF6F0] font-bold">
                  {selectedSubmission.score} / {selectedSubmission.maxScore} (
                  {selectedSubmission.percentage.toFixed(1)}%)
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Mention académique :</span>
                <span className="font-bold text-[#DACBA9]">
                  Mention {gradeForPercentage(selectedSubmission.percentage)}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-end pt-3 border-t border-[#323B46]">
              <button
                type="button"
                onClick={() => setSelectedSubmission(null)}
                className="px-4 py-2 text-xs font-bold text-[#15191E] bg-[#DACBA9] rounded-xl cursor-pointer"
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
