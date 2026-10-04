import React, { useEffect, useState } from 'react';
import { User as FirebaseUser } from 'firebase/auth';
import {
  User,
  GraduationCap,
  Award,
  BookOpen,
  Calendar,
  Building,
  Phone,
  FileText,
  CheckCircle2,
  XCircle,
  Clock,
  Shield,
  LogOut,
  X,
  Save,
  Bell,
  RefreshCw,
  Sparkles,
  TrendingUp,
} from 'lucide-react';
import {
  UserRecord,
  ExamResultRecord,
  updateUserProfile,
  getUserExamResults,
} from '../firebase';
import { gradeForPercentage } from '../data/repositories';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: FirebaseUser;
  userProfile: UserRecord | null;
  onProfileUpdated: (updated: UserRecord) => void;
  isAdmin?: boolean;
  onOpenAdmin?: () => void;
  onOpenNotifications?: () => void;
  onSignOut: () => void;
  onNavigateToExams?: () => void;
}

export function UserProfileModal({
  isOpen,
  onClose,
  currentUser,
  userProfile,
  onProfileUpdated,
  isAdmin,
  onOpenAdmin,
  onOpenNotifications,
  onSignOut,
  onNavigateToExams,
}: UserProfileModalProps) {
  const [activeTab, setActiveTab] = useState<'profile' | 'history'>('profile');

  // Academic Profile Form state
  const [displayName, setDisplayName] = useState(
    userProfile?.displayName || currentUser.displayName || ''
  );
  const [matricule, setMatricule] = useState(userProfile?.matricule || '');
  const [university, setUniversity] = useState(
    userProfile?.university || 'Faculté de Médecine'
  );
  const [academicYear, setAcademicYear] = useState(
    userProfile?.academicYear || 'DFGSM 2 (2ème année)'
  );
  const [specialty, setSpecialty] = useState(
    userProfile?.specialty || 'Anatomie Générale & Appareil Locomoteur'
  );
  const [phone, setPhone] = useState(userProfile?.phone || '');
  const [bio, setBio] = useState(userProfile?.bio || '');

  // Submission & Data state
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Exam History state
  const [examResults, setExamResults] = useState<ExamResultRecord[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Synchronize initial state when userProfile loads
  useEffect(() => {
    if (userProfile) {
      if (userProfile.displayName) setDisplayName(userProfile.displayName);
      if (userProfile.matricule) setMatricule(userProfile.matricule);
      if (userProfile.university) setUniversity(userProfile.university);
      if (userProfile.academicYear) setAcademicYear(userProfile.academicYear);
      if (userProfile.specialty) setSpecialty(userProfile.specialty);
      if (userProfile.phone) setPhone(userProfile.phone);
      if (userProfile.bio) setBio(userProfile.bio);
    }
  }, [userProfile]);

  // Fetch student exam history
  useEffect(() => {
    if (isOpen && currentUser) {
      setLoadingHistory(true);
      getUserExamResults(currentUser.uid)
        .then((results) => {
          setExamResults(results);
        })
        .finally(() => {
          setLoadingHistory(false);
        });
    }
  }, [isOpen, currentUser]);

  if (!isOpen) return null;

  const currentRole = userProfile?.role || 'student';

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveError(null);
    setSaveSuccess(false);

    try {
      const payload = {
        displayName: displayName.trim(),
        matricule: matricule.trim(),
        university: university.trim(),
        academicYear,
        specialty,
        phone: phone.trim(),
        bio: bio.trim(),
      };

      await updateUserProfile(currentUser.uid, payload);

      if (userProfile) {
        onProfileUpdated({
          ...userProfile,
          ...payload,
        });
      }

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      setSaveError(err?.message || 'Erreur lors de la sauvegarde du profil.');
    } finally {
      setSaving(false);
    }
  };

  // Stats calculation
  const totalExams = examResults.length;
  const averagePercentage =
    totalExams > 0
      ? Math.round(
          examResults.reduce((acc, curr) => acc + (curr.percentage || 0), 0) /
            totalExams
        )
      : null;
  const bestScore =
    totalExams > 0
      ? Math.max(...examResults.map((r) => r.percentage || 0))
      : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-2xl rounded-3xl bg-[#1E242C] border-2 border-[#D8CCBF] shadow-2xl flex flex-col max-h-[92vh] text-[#FAF6F0] overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 pt-6 pb-4 border-b border-[#323B46] bg-[#1E242C] flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            {currentUser.photoURL ? (
              <img
                src={currentUser.photoURL}
                alt={displayName || 'Photo de profil'}
                className="w-14 h-14 rounded-2xl border-2 border-[#D8CCBF] object-cover shadow-md"
              />
            ) : (
              <div className="w-14 h-14 rounded-2xl bg-[#15191E] border-2 border-[#D8CCBF] flex items-center justify-center text-xl font-bold text-[#DACBA9] shadow-md">
                {(displayName || currentUser.email || 'U')[0].toUpperCase()}
              </div>
            )}
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-extrabold text-lg text-[#FAF6F0]">
                  {displayName || 'Étudiant en Médecine'}
                </h2>
                <span
                  className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider border ${
                    currentRole === 'admin'
                      ? 'bg-amber-950/70 text-amber-300 border-amber-500/50'
                      : currentRole === 'professor'
                      ? 'bg-purple-950/70 text-purple-300 border-purple-500/50'
                      : 'bg-[#646D79]/40 text-[#ECE3D9] border-[#D8CCBF]/50'
                  }`}
                >
                  {currentRole === 'admin'
                    ? 'Administrateur'
                    : currentRole === 'professor'
                    ? 'Professeur'
                    : 'Étudiant'}
                </span>
              </div>
              <p className="text-xs text-[#BAC3CE] font-mono mt-0.5">
                {currentUser.email}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-[#BAC3CE] hover:text-[#FAF6F0] hover:bg-[#323B46] transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-[#323B46] bg-[#15191E] px-6">
          <button
            type="button"
            onClick={() => setActiveTab('profile')}
            className={`py-3 px-4 font-bold text-xs flex items-center gap-2 border-b-2 transition cursor-pointer ${
              activeTab === 'profile'
                ? 'border-[#DACBA9] text-[#DACBA9] bg-[#1E242C]/50'
                : 'border-transparent text-[#BAC3CE] hover:text-[#FAF6F0]'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Mon Profil Académique</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('history')}
            className={`py-3 px-4 font-bold text-xs flex items-center gap-2 border-b-2 transition cursor-pointer relative ${
              activeTab === 'history'
                ? 'border-[#DACBA9] text-[#DACBA9] bg-[#1E242C]/50'
                : 'border-transparent text-[#BAC3CE] hover:text-[#FAF6F0]'
            }`}
          >
            <Award className="w-4 h-4" />
            <span>Historique des Examens & Notes</span>
            {totalExams > 0 && (
              <span className="w-5 h-5 rounded-full bg-[#DACBA9] text-[#15191E] font-extrabold text-[10px] flex items-center justify-center ml-1">
                {totalExams}
              </span>
            )}
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {activeTab === 'profile' && (
            <form onSubmit={handleSaveProfile} className="space-y-5">
              {/* Role Protection Banner */}
              <div className="p-3.5 rounded-2xl bg-[#15191E] border border-[#323B46] flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-300 flex items-center justify-center shrink-0">
                    <Shield className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-semibold text-[#FAF6F0] block">
                      Rôle statutaire :{' '}
                      <span className="text-[#DACBA9] uppercase font-bold">
                        {currentRole === 'admin'
                          ? 'Administrateur'
                          : currentRole === 'professor'
                          ? 'Professeur Enseignant'
                          : 'Étudiant en Médecine'}
                      </span>
                    </span>
                    <span className="text-[11px] text-[#8C97A5]">
                      🔒 Rôle attribué par l'université (modifiable uniquement par un Administrateur certifié).
                    </span>
                  </div>
                </div>

                {isAdmin && onOpenAdmin && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenAdmin();
                    }}
                    className="py-1.5 px-3 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-200 font-semibold text-[11px] transition cursor-pointer"
                  >
                    Panneau Admin
                  </button>
                )}
              </div>

              {saveSuccess && (
                <div className="p-3 rounded-2xl bg-emerald-950/60 border border-emerald-500/50 flex items-center gap-2 text-xs text-emerald-200 animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Votre profil a été mis à jour et enregistré avec succès !</span>
                </div>
              )}

              {saveError && (
                <div className="p-3 rounded-2xl bg-rose-950/60 border border-rose-500/50 flex items-center gap-2 text-xs text-rose-200">
                  <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>{saveError}</span>
                </div>
              )}

              {/* Profile Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#BAC3CE] mb-1.5">
                    Nom complet & Titre académique
                  </label>
                  <input
                    type="text"
                    required
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Ex: Dr. Sarah Bennani"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#15191E] border border-[#323B46] focus:border-[#DACBA9] text-xs text-[#FAF6F0] outline-none transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#BAC3CE] mb-1.5">
                    Numéro d'étudiant / Matricule
                  </label>
                  <input
                    type="text"
                    value={matricule}
                    onChange={(e) => setMatricule(e.target.value)}
                    placeholder="Ex: MED-2026-9481"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#15191E] border border-[#323B46] focus:border-[#DACBA9] text-xs text-[#FAF6F0] outline-none transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#BAC3CE] mb-1.5">
                    Faculté / Université
                  </label>
                  <input
                    type="text"
                    value={university}
                    onChange={(e) => setUniversity(e.target.value)}
                    placeholder="Ex: Faculté de Médecine"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#15191E] border border-[#323B46] focus:border-[#DACBA9] text-xs text-[#FAF6F0] outline-none transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#BAC3CE] mb-1.5">
                    Année d'étude / Niveau
                  </label>
                  <select
                    value={academicYear}
                    onChange={(e) => setAcademicYear(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#15191E] border border-[#323B46] focus:border-[#DACBA9] text-xs text-[#FAF6F0] outline-none transition cursor-pointer"
                  >
                    <option value="PASS / LAS (1ère année)">PASS / LAS (1ère année)</option>
                    <option value="DFGSM 2 (2ème année)">DFGSM 2 (2ème année)</option>
                    <option value="DFGSM 3 (3ème année)">DFGSM 3 (3ème année)</option>
                    <option value="DFASM 1 (Externat)">DFASM 1 (Externat)</option>
                    <option value="DFASM 2 (Externat)">DFASM 2 (Externat)</option>
                    <option value="DFASM 3 (Externat)">DFASM 3 (Externat)</option>
                    <option value="Internat / Résidanat">Internat / Résidanat</option>
                    <option value="Praticien Hospitalier / Enseignant">
                      Praticien Hospitalier / Enseignant
                    </option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-[#BAC3CE] mb-1.5">
                    Spécialité / Discipline anatomique d'intérêt
                  </label>
                  <input
                    type="text"
                    value={specialty}
                    onChange={(e) => setSpecialty(e.target.value)}
                    placeholder="Ex: Neuro-anatomie, Chirurgie, Appareil locomoteur..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#15191E] border border-[#323B46] focus:border-[#DACBA9] text-xs text-[#FAF6F0] outline-none transition"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-[#BAC3CE] mb-1.5">
                    Présentation académique / Notes d'étude
                  </label>
                  <textarea
                    rows={3}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Vos objectifs d'apprentissage en anatomie 3D..."
                    className="w-full px-3.5 py-2 rounded-xl bg-[#15191E] border border-[#323B46] focus:border-[#DACBA9] text-xs text-[#FAF6F0] outline-none transition resize-none"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center justify-between">
                {onOpenNotifications ? (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenNotifications();
                    }}
                    className="py-2.5 px-4 rounded-xl border border-[#455160] hover:border-[#DACBA9] bg-[#15191E] text-xs font-semibold text-[#FAF6F0] transition cursor-pointer flex items-center gap-2"
                  >
                    <Bell className="w-3.5 h-3.5 text-[#DACBA9]" />
                    <span>Notifications Push</span>
                  </button>
                ) : (
                  <div />
                )}

                <button
                  type="submit"
                  disabled={saving}
                  className="py-2.5 px-6 rounded-xl bg-[#DACBA9] hover:bg-[#FAF6F0] text-[#15191E] font-bold text-xs transition cursor-pointer flex items-center gap-2 shadow-md disabled:opacity-50"
                >
                  {saving ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  <span>{saving ? 'Enregistrement…' : 'Enregistrer mon profil'}</span>
                </button>
              </div>
            </form>
          )}

          {activeTab === 'history' && (
            <div className="space-y-5">
              {/* Summary Score Cards */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3.5 rounded-2xl bg-[#15191E] border border-[#323B46] text-center">
                  <div className="text-[11px] font-semibold text-[#BAC3CE]">
                    Examens Passés
                  </div>
                  <div className="text-2xl font-black text-[#DACBA9] mt-1">
                    {totalExams}
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-[#15191E] border border-[#323B46] text-center">
                  <div className="text-[11px] font-semibold text-[#BAC3CE]">
                    Moyenne Générale
                  </div>
                  <div className="text-2xl font-black text-emerald-400 mt-1">
                    {averagePercentage !== null ? `${averagePercentage}%` : '—'}
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-[#15191E] border border-[#323B46] text-center">
                  <div className="text-[11px] font-semibold text-[#BAC3CE]">
                    Meilleur Score
                  </div>
                  <div className="text-2xl font-black text-sky-400 mt-1">
                    {bestScore !== null ? `${bestScore}%` : '—'}
                  </div>
                </div>
              </div>

              {/* Exam Results List */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-[#FAF6F0]">
                    Détail des évaluations enregistrées
                  </span>
                  <span className="text-[11px] text-[#8C97A5]">
                    Synchronisation automatique
                  </span>
                </div>

                {loadingHistory ? (
                  <div className="py-10 text-center space-y-2">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto text-[#DACBA9]" />
                    <p className="text-xs text-[#BAC3CE]">
                      Chargement de vos notes d'examens…
                    </p>
                  </div>
                ) : examResults.length > 0 ? (
                  <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                    {examResults.map((result) => {
                      const grade = gradeForPercentage(result.percentage || 0);
                      const isPassing = (result.percentage || 0) >= 50;

                      return (
                        <div
                          key={result.id}
                          className="p-3.5 rounded-2xl bg-[#15191E] border border-[#323B46] flex items-center justify-between gap-4"
                        >
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <h4 className="font-bold text-xs text-[#FAF6F0] truncate">
                                {result.examTitle}
                              </h4>
                              <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                  isPassing
                                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                                    : 'bg-rose-950 text-rose-300 border border-rose-500/40'
                                }`}
                              >
                                {isPassing ? 'Validé' : 'À rattraper'}
                              </span>
                            </div>

                            <div className="flex items-center gap-3 text-[11px] text-[#BAC3CE] mt-1">
                              <span className="flex items-center gap-1 font-mono">
                                <Clock className="w-3 h-3 text-[#8C97A5]" />
                                {new Date(result.submittedAt).toLocaleDateString(
                                  'fr-FR',
                                  {
                                    day: '2-digit',
                                    month: 'short',
                                    year: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  }
                                )}
                              </span>
                              <span>·</span>
                              <span>
                                Note :{' '}
                                <strong className="text-[#FAF6F0]">
                                  {result.score} / {result.totalPoints}
                                </strong>
                              </span>
                            </div>

                            {/* Progress bar */}
                            <div className="w-full h-1.5 bg-[#1E242C] rounded-full overflow-hidden mt-2 border border-[#323B46]/60">
                              <div
                                className={`h-full rounded-full ${
                                  (result.percentage || 0) >= 75
                                    ? 'bg-emerald-400'
                                    : (result.percentage || 0) >= 50
                                    ? 'bg-amber-400'
                                    : 'bg-rose-500'
                                }`}
                                style={{ width: `${result.percentage || 0}%` }}
                              />
                            </div>
                          </div>

                          <div className="text-right shrink-0">
                            <div
                              className={`text-lg font-black ${
                                (result.percentage || 0) >= 75
                                  ? 'text-emerald-400'
                                  : (result.percentage || 0) >= 50
                                  ? 'text-amber-300'
                                  : 'text-rose-400'
                              }`}
                            >
                              {result.percentage}%
                            </div>
                            <span className="text-[10px] font-semibold text-[#8C97A5]">
                              Mention {grade}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-8 rounded-2xl bg-[#15191E] border border-dashed border-[#323B46] text-center space-y-3">
                    <div className="w-12 h-12 rounded-2xl bg-[#1E242C] border border-[#323B46] flex items-center justify-center mx-auto text-[#DACBA9]">
                      <BookOpen className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-[#FAF6F0]">
                        Aucun examen passé pour le moment
                      </h4>
                      <p className="text-xs text-[#BAC3CE] max-w-sm mx-auto mt-1">
                        Passez vos examens d'anatomie 3D pour tester vos
                        connaissances et retrouver vos notes ici.
                      </p>
                    </div>
                    {onNavigateToExams && (
                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                          onNavigateToExams();
                        }}
                        className="py-2 px-4 rounded-xl bg-[#DACBA9] text-[#15191E] font-bold text-xs transition cursor-pointer hover:bg-[#FAF6F0]"
                      >
                        Consulter les examens disponibles
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 px-6 border-t border-[#323B46] bg-[#15191E] flex items-center justify-between">
          <button
            type="button"
            onClick={onSignOut}
            className="py-2 px-4 rounded-xl bg-rose-950/30 hover:bg-rose-900/40 border border-rose-500/40 text-rose-300 font-semibold text-xs transition cursor-pointer flex items-center gap-1.5"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Se déconnecter</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="py-2 px-5 rounded-xl border border-[#455160] hover:border-[#DACBA9] bg-[#1E242C] text-xs font-semibold text-[#FAF6F0] transition cursor-pointer"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}
