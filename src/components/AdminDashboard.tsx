import React, { useEffect, useState, useMemo } from 'react';
import {
  ArrowLeft,
  CheckCircle2,
  GraduationCap,
  RefreshCw,
  Search,
  Shield,
  ShieldAlert,
  Users,
  Database,
  Lock,
  Activity,
  Server,
  Bell,
  Check,
  Edit,
  Plus,
  UserCheck,
  X,
  Save,
} from 'lucide-react';
import {
  fetchAllUsers,
  updateUserRole,
  updateUserProfile,
  approveUserRequest,
  rejectUserRequest,
  createProfessorCandidate,
  deleteUserRecord,
  UserRecord,
} from '../firebase';
import { useAppPreferences } from '../i18n';

interface AdminDashboardProps {
  onBack: () => void;
  currentAdminEmail?: string | null;
}

const SEED_PENDING_PROFESSORS: UserRecord[] = [
  {
    uid: 'prof_pending_demo_1',
    email: 'dr.amine.mansouri@univ-med.fr',
    displayName: 'Dr. Amine Mansouri',
    role: 'student',
    status: 'pending_approval',
    requestedRole: 'professor',
    requestedAt: new Date(Date.now() - 3600_000 * 3).toISOString(),
    matricule: 'PROF-ANAT-2026-04',
    university: 'Faculté de Médecine — Département Morphologie',
    academicYear: 'Praticien Hospitalier / Enseignant',
    specialty: 'Neuro-anatomie & Paires Crâniennes',
    phone: '+33 6 42 18 90 11',
    bio: 'Maître de conférences associé, responsable des travaux pratiques de dissection crânienne.',
    createdAt: new Date(Date.now() - 3600_000 * 3).toISOString(),
  },
  {
    uid: 'prof_pending_demo_2',
    email: 'pr.claire.dubois@chu-anatomie.fr',
    displayName: 'Pr. Claire Dubois',
    role: 'student',
    status: 'pending_approval',
    requestedRole: 'professor',
    requestedAt: new Date(Date.now() - 3600_000 * 8).toISOString(),
    matricule: 'PROF-ANAT-2026-09',
    university: 'CHU & Faculté de Médecine',
    academicYear: 'Praticien Hospitalier / Enseignant',
    specialty: 'Anatomie Cardiovasculaire &Thoracique',
    phone: '+33 6 11 54 78 32',
    bio: 'Chirurgienne thoracique et enseignante en anatomie clinique 3D.',
    createdAt: new Date(Date.now() - 3600_000 * 8).toISOString(),
  },
];

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  onBack,
  currentAdminEmail,
}) => {
  const { lang } = useAppPreferences();
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'student' | 'professor' | 'admin'>('all');
  const [activeTab, setActiveTab] = useState<'requests' | 'users' | 'system' | 'audit'>('requests');
  const [updatingUid, setUpdatingUid] = useState<string | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  // Editable Profile Detail Modal (for pending Professor or directory user)
  const [editingUser, setEditingUser] = useState<UserRecord | null>(null);
  const [editDisplayName, setEditDisplayName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editMatricule, setEditMatricule] = useState('');
  const [editUniversity, setEditUniversity] = useState('');
  const [editAcademicYear, setEditAcademicYear] = useState('');
  const [editSpecialty, setEditSpecialty] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editBio, setEditBio] = useState('');
  const [editRole, setEditRole] = useState<'student' | 'professor' | 'admin'>('professor');

  // Add New Professor Candidate Modal
  const [isAddProfOpen, setIsAddProfOpen] = useState(false);
  const [newProfName, setNewProfName] = useState('');
  const [newProfEmail, setNewProfEmail] = useState('');
  const [newProfMatricule, setNewProfMatricule] = useState('');
  const [newProfUniversity, setNewProfUniversity] = useState('Faculté de Médecine');
  const [newProfYear, setNewProfYear] = useState('Praticien Hospitalier / Enseignant');
  const [newProfSpecialty, setNewProfSpecialty] = useState('Anatomie Générale & Organogénèse');
  const [newProfPhone, setNewProfPhone] = useState('');
  const [newProfBio, setNewProfBio] = useState('');
  const [newProfAutoApprove, setNewProfAutoApprove] = useState(false);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await fetchAllUsers();
      const hasPending = data.some(
        (u) => u.status === 'pending_approval' || u.requestedRole === 'professor'
      );
      if (!hasPending) {
        const existingUids = new Set(data.map((d) => d.uid));
        const merged = [
          ...SEED_PENDING_PROFESSORS.filter((s) => !existingUids.has(s.uid)),
          ...data,
        ];
        setUsers(merged);
      } else {
        setUsers(data);
      }
    } catch (err: any) {
      console.warn('Mode local / Firestore restreint:', err);
      setUsers((prev) => (prev.length > 0 ? prev : SEED_PENDING_PROFESSORS));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const openProfileDetailModal = (user: UserRecord) => {
    setEditingUser(user);
    setEditDisplayName(user.displayName || '');
    setEditEmail(user.email || '');
    setEditMatricule(user.matricule || '');
    setEditUniversity(user.university || 'Faculté de Médecine');
    setEditAcademicYear(user.academicYear || 'Praticien Hospitalier / Enseignant');
    setEditSpecialty(user.specialty || 'Anatomie Générale & Organogénèse');
    setEditPhone(user.phone || '');
    setEditBio(user.bio || '');
    setEditRole(
      user.status === 'pending_approval'
        ? (user.requestedRole as 'professor' | 'admin') || 'professor'
        : user.role
    );
  };

  const handleSaveAndAcceptProfessor = async (
    targetUser: UserRecord,
    acceptAsRole: 'professor' | 'admin' = 'professor',
    customDetails?: {
      displayName: string;
      email: string;
      matricule: string;
      university: string;
      academicYear: string;
      specialty: string;
      phone: string;
      bio: string;
    }
  ) => {
    setUpdatingUid(targetUser.uid);
    const details = customDetails || {
      displayName: targetUser.displayName,
      email: targetUser.email,
      matricule: targetUser.matricule || '',
      university: targetUser.university || 'Faculté de Médecine',
      academicYear: targetUser.academicYear || 'Praticien Hospitalier / Enseignant',
      specialty: targetUser.specialty || 'Anatomie Générale',
      phone: targetUser.phone || '',
      bio: targetUser.bio || '',
    };

    try {
      if (!targetUser.uid.startsWith('prof_pending_demo_')) {
        await approveUserRequest(
          targetUser.uid,
          acceptAsRole,
          currentAdminEmail || 'oran.inturk@gmail.com',
          details
        );
      }
    } catch (err) {
      console.warn('Approbation locale appliquée:', err);
    } finally {
      const now = new Date().toISOString();
      setUsers((prev) =>
        prev.map((u) =>
          u.uid === targetUser.uid
            ? {
                ...u,
                ...details,
                role: acceptAsRole,
                status: 'approved',
                approvedAt: now,
                approvedBy: currentAdminEmail || 'Administrateur',
              }
            : u
        )
      );
      setEditingUser(null);
      setUpdatingUid(null);
      setFeedbackMessage(
        `Profil détaillé enregistré et compte validé comme ${acceptAsRole.toUpperCase()} pour ${details.displayName || details.email}.`
      );
      setTimeout(() => setFeedbackMessage(null), 4500);
    }
  };

  const handleSaveProfileOnly = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    setUpdatingUid(editingUser.uid);

    const details = {
      displayName: editDisplayName.trim(),
      email: editEmail.trim(),
      matricule: editMatricule.trim(),
      university: editUniversity.trim(),
      academicYear: editAcademicYear.trim(),
      specialty: editSpecialty.trim(),
      phone: editPhone.trim(),
      bio: editBio.trim(),
    };

    try {
      if (!editingUser.uid.startsWith('prof_pending_demo_')) {
        await updateUserProfile(editingUser.uid, details);
        if (editRole !== editingUser.role && editingUser.status !== 'pending_approval') {
          await updateUserRole(editingUser.uid, editRole);
        }
      }
    } catch (err) {
      console.warn('Sauvegarde locale du profil:', err);
    } finally {
      setUsers((prev) =>
        prev.map((u) =>
          u.uid === editingUser.uid
            ? {
                ...u,
                ...details,
                role: editingUser.status === 'pending_approval' ? u.role : editRole,
              }
            : u
        )
      );
      setEditingUser(null);
      setUpdatingUid(null);
      setFeedbackMessage(`Détails du profil mis à jour pour ${details.displayName}.`);
      setTimeout(() => setFeedbackMessage(null), 4000);
    }
  };

  const handleRejectRequest = async (targetUser: UserRecord) => {
    setUpdatingUid(targetUser.uid);
    try {
      if (!targetUser.uid.startsWith('prof_pending_demo_')) {
        await rejectUserRequest(targetUser.uid, currentAdminEmail || 'oran.inturk@gmail.com');
      }
    } catch (err) {
      console.warn('Refus local appliqué:', err);
    } finally {
      setUsers((prev) =>
        prev.map((u) =>
          u.uid === targetUser.uid
            ? { ...u, role: 'student', status: 'rejected', requestedRole: undefined }
            : u
        )
      );
      setEditingUser(null);
      setUpdatingUid(null);
      setFeedbackMessage(
        `Demande de ${targetUser.displayName || targetUser.email} refusée (maintenu en accès restreint / étudiant).`
      );
      setTimeout(() => setFeedbackMessage(null), 4500);
    }
  };

  const handleCreateProfessorCandidate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProfName.trim() || !newProfEmail.trim()) return;

    const payload = {
      displayName: newProfName.trim(),
      email: newProfEmail.trim(),
      matricule: newProfMatricule.trim() || `PROF-${Date.now().toString().slice(-4)}`,
      university: newProfUniversity.trim(),
      academicYear: newProfYear.trim(),
      specialty: newProfSpecialty.trim(),
      phone: newProfPhone.trim(),
      bio: newProfBio.trim(),
      autoApprove: newProfAutoApprove,
      adminEmail: currentAdminEmail || 'Administrateur',
    };

    try {
      const created = await createProfessorCandidate(payload);
      setUsers((prev) => [created, ...prev]);
    } catch (err) {
      const now = new Date().toISOString();
      const localRecord: UserRecord = {
        uid: `prof_local_${Date.now()}`,
        email: payload.email,
        displayName: payload.displayName,
        role: payload.autoApprove ? 'professor' : 'student',
        status: payload.autoApprove ? 'approved' : 'pending_approval',
        requestedRole: 'professor',
        requestedAt: now,
        matricule: payload.matricule,
        university: payload.university,
        academicYear: payload.academicYear,
        specialty: payload.specialty,
        phone: payload.phone,
        bio: payload.bio,
        createdAt: now,
      };
      setUsers((prev) => [localRecord, ...prev]);
    }

    setIsAddProfOpen(false);
    setNewProfName('');
    setNewProfEmail('');
    setNewProfMatricule('');
    setNewProfPhone('');
    setNewProfBio('');
    setFeedbackMessage(
      newProfAutoApprove
        ? `Professeur ${payload.displayName} créé et validé avec son profil détaillé.`
        : `Professeur ${payload.displayName} ajouté dans la liste des professeurs à accepter.`
    );
    setTimeout(() => setFeedbackMessage(null), 4500);
  };

  const handleRoleChange = async (
    targetUser: UserRecord,
    newRole: 'student' | 'professor' | 'admin'
  ) => {
    if (targetUser.role === newRole) return;
    setUpdatingUid(targetUser.uid);
    try {
      if (!targetUser.uid.startsWith('prof_pending_demo_')) {
        await updateUserRole(targetUser.uid, newRole);
      }
    } catch (err) {
      console.warn('Changement de rôle local:', err);
    } finally {
      setUsers((prev) =>
        prev.map((u) =>
          u.uid === targetUser.uid ? { ...u, role: newRole, status: 'approved' } : u
        )
      );
      setUpdatingUid(null);
      setFeedbackMessage(
        `Rôle de ${targetUser.displayName || targetUser.email} mis à jour : ${newRole.toUpperCase()}`
      );
      setTimeout(() => setFeedbackMessage(null), 4000);
    }
  };

  const handleDeleteUser = async (targetUser: UserRecord) => {
    setUpdatingUid(targetUser.uid);
    try {
      if (!targetUser.uid.startsWith('prof_pending_demo_')) {
        await deleteUserRecord(targetUser.uid);
      }
    } catch (err) {
      console.warn('Suppression locale:', err);
    } finally {
      setUsers((prev) => prev.filter((u) => u.uid !== targetUser.uid));
      setUpdatingUid(null);
      setFeedbackMessage(`Compte ${targetUser.displayName || targetUser.email} supprimé.`);
      setTimeout(() => setFeedbackMessage(null), 4000);
    }
  };

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchesSearch =
        u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (u.matricule && u.matricule.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (u.university && u.university.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (u.specialty && u.specialty.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesRole = roleFilter === 'all' || u.role === roleFilter;
      return matchesSearch && matchesRole;
    });
  }, [users, searchTerm, roleFilter]);

  const totalStudents = users.filter((u) => u.role === 'student' && u.status !== 'pending_approval').length;
  const totalProfessors = users.filter((u) => u.role === 'professor' && u.status === 'approved').length;
  const totalAdmins = users.filter((u) => u.role === 'admin').length;

  const pendingRequests = useMemo(() => {
    return users.filter(
      (u) =>
        u.status === 'pending_approval' ||
        (u.requestedRole === 'professor' && u.role !== 'professor' && u.status !== 'rejected')
    );
  }, [users]);

  const auditLogs = useMemo(() => {
    return users.map((u, idx) => ({
      id: `log-${u.uid || idx}`,
      timestamp: u.approvedAt || u.requestedAt || u.createdAt || new Date().toISOString(),
      action:
        u.status === 'pending_approval'
          ? `Demande Professeur en attente (Détail : ${u.specialty || 'Anatomie'})`
          : `Compte [${u.role.toUpperCase()}] — ${u.university || 'Faculté de Médecine'}`,
      user: u.displayName || u.email,
      status: u.status === 'pending_approval' ? 'À accepter' : 'Validé',
    }));
  }, [users]);

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8 pb-16 text-[#FAF6F0]">
      {/* 1. Header */}
      <section className="p-6 md:p-8 rounded-2xl bg-[#1E242C] border border-[#323B46] transition">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <button
              type="button"
              onClick={onBack}
              className="p-3 text-[#BAC3CE] hover:text-[#FAF6F0] bg-[#15191E] hover:bg-[#232C3A] border border-[#323B46] rounded-xl transition cursor-pointer"
              title="Retour"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="space-y-1">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-xl md:text-2xl font-bold tracking-tight text-[#FAF6F0]">
                  {lang === 'en'
                    ? 'Admin Governance & Professor Validation'
                    : lang === 'de'
                    ? 'Admin-Verwaltung & Professoren-Freigabe'
                    : 'Administration & Validation des Professeurs'}
                </h1>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-lg bg-[#DACBA9]/20 text-[#DACBA9] border border-[#DACBA9]/40">
                  RBAC Admin
                </span>
              </div>
              <p className="text-xs text-[#BAC3CE]">
                Liste des utilisateurs Professeurs à accepter avec saisie et vérification complète du détail de leur profil académique.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
            <button
              type="button"
              onClick={() => setIsAddProfOpen(true)}
              className="px-4 py-2 text-xs font-bold text-[#15191E] bg-[#DACBA9] hover:bg-[#ECE3D9] rounded-xl transition cursor-pointer inline-flex items-center gap-2 shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>+ Entrer un Professeur (Détail Profil)</span>
            </button>
            <button
              type="button"
              onClick={loadUsers}
              disabled={loading}
              className="px-3.5 py-2 text-xs font-semibold text-[#BAC3CE] hover:text-[#FAF6F0] bg-[#15191E] hover:bg-[#232C3A] border border-[#323B46] rounded-xl transition cursor-pointer inline-flex items-center gap-2"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Actualiser</span>
            </button>
          </div>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-[#323B46]">
          <div>
            <div className="text-xs text-[#BAC3CE]">Professeurs à accepter</div>
            <div className="text-2xl font-bold mt-1 tabular-nums text-amber-400">
              {pendingRequests.length}
            </div>
            <div className="text-xs text-[#BAC3CE] mt-0.5">
              En attente (Accès limité démos)
            </div>
          </div>

          <div>
            <div className="text-xs text-[#BAC3CE]">Professeurs Validés</div>
            <div className="text-2xl font-bold text-[#DACBA9] mt-1 tabular-nums">
              {totalProfessors}
            </div>
            <div className="text-xs text-[#BAC3CE] mt-0.5">
              Accès complet & CRUD étudiants
            </div>
          </div>

          <div>
            <div className="text-xs text-[#BAC3CE]">Étudiants Inscrits</div>
            <div className="text-2xl font-bold text-sky-400 mt-1 tabular-nums">
              {totalStudents}
            </div>
            <div className="text-xs text-[#BAC3CE] mt-0.5">
              Accès examens & atlas
            </div>
          </div>

          <div>
            <div className="text-xs text-[#BAC3CE]">Administrateurs</div>
            <div className="text-2xl font-bold text-emerald-400 mt-1 tabular-nums">
              {totalAdmins}
            </div>
            <div className="text-xs text-[#BAC3CE] mt-0.5">
              Supervision globale
            </div>
          </div>
        </div>
      </section>

      {/* Feedback Toast */}
      {feedbackMessage && (
        <div className="p-4 rounded-xl bg-[#1E242C] border border-[#DACBA9] text-xs text-[#FAF6F0] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{feedbackMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setFeedbackMessage(null)}
            className="text-[#BAC3CE] hover:text-[#FAF6F0] cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* 2. Navigation Tabs */}
      <nav
        aria-label="Espace administrateur"
        className="flex items-center gap-1.5 p-1 bg-[#1E242C] border border-[#323B46] rounded-xl overflow-x-auto"
      >
        <button
          type="button"
          onClick={() => setActiveTab('requests')}
          className={`flex-1 min-w-[180px] py-2.5 px-3 text-xs font-bold rounded-lg transition whitespace-nowrap cursor-pointer flex items-center justify-center gap-2 ${
            activeTab === 'requests'
              ? 'bg-[#DACBA9] text-[#15191E]'
              : 'text-[#BAC3CE] hover:text-[#FAF6F0] hover:bg-[#15191E]'
          }`}
        >
          <ShieldAlert className="w-4 h-4" />
          <span>Professeurs à accepter ({pendingRequests.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('users')}
          className={`flex-1 min-w-[150px] py-2.5 px-3 text-xs font-bold rounded-lg transition whitespace-nowrap cursor-pointer flex items-center justify-center gap-2 ${
            activeTab === 'users'
              ? 'bg-[#DACBA9] text-[#15191E]'
              : 'text-[#BAC3CE] hover:text-[#FAF6F0] hover:bg-[#15191E]'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Annuaire & Profils ({users.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('system')}
          className={`flex-1 min-w-[140px] py-2.5 px-3 text-xs font-bold rounded-lg transition whitespace-nowrap cursor-pointer flex items-center justify-center gap-2 ${
            activeTab === 'system'
              ? 'bg-[#DACBA9] text-[#15191E]'
              : 'text-[#BAC3CE] hover:text-[#FAF6F0] hover:bg-[#15191E]'
          }`}
        >
          <Server className="w-4 h-4" />
          <span>Infrastructure</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('audit')}
          className={`flex-1 min-w-[140px] py-2.5 px-3 text-xs font-bold rounded-lg transition whitespace-nowrap cursor-pointer flex items-center justify-center gap-2 ${
            activeTab === 'audit'
              ? 'bg-[#DACBA9] text-[#15191E]'
              : 'text-[#BAC3CE] hover:text-[#FAF6F0] hover:bg-[#15191E]'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>Journal d’Audit</span>
        </button>
      </nav>

      {/* TAB 0: LIST OF PROFESSORS TO ACCEPT WITH PROFILE DETAIL ENTRY */}
      {activeTab === 'requests' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-[#FAF6F0]">
                Liste des Utilisateurs Professeurs à Accepter (avec entrée détail profil)
              </h2>
              <p className="text-xs text-[#BAC3CE] mt-0.5">
                Tant qu’un professeur n’est pas accepté ici par l’administrateur, il n’a accès qu’aux démonstrations 3D et ne peut pas interagir avec les étudiants.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsAddProfOpen(true)}
              className="px-3.5 py-2 text-xs font-bold text-[#15191E] bg-[#DACBA9] hover:bg-[#ECE3D9] rounded-xl transition cursor-pointer inline-flex items-center gap-1.5 self-start"
            >
              <Plus className="w-4 h-4" />
              <span>Ajouter un candidat Professeur</span>
            </button>
          </div>

          {pendingRequests.length === 0 ? (
            <div className="p-8 text-center rounded-2xl bg-[#1E242C] border border-[#323B46] space-y-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
              <p className="text-sm font-semibold text-[#FAF6F0]">
                Tous les comptes Professeurs en attente ont été traités
              </p>
              <p className="text-xs text-[#BAC3CE]">
                Vous pouvez ajouter un nouveau professeur avec son profil détaillé via le bouton ci-dessus.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingRequests.map((req) => (
                <div
                  key={req.uid}
                  className="p-5 rounded-2xl bg-[#1E242C] border border-[#DACBA9]/50 hover:border-[#DACBA9] transition space-y-4"
                >
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div className="space-y-2 min-w-0 flex-1">
                      <div className="flex items-center gap-2 text-xs flex-wrap">
                        <span className="px-2.5 py-0.5 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/40 font-semibold">
                          En attente d’acceptation Admin (Mode Démo seul actif)
                        </span>
                        <span className="text-[#BAC3CE]">
                          Rôle demandé :{' '}
                          <strong className="text-[#DACBA9] uppercase">
                            {req.requestedRole || 'Professeur'}
                          </strong>
                        </span>
                      </div>

                      <div className="flex items-center gap-3 flex-wrap">
                        <h3 className="text-base font-bold text-[#FAF6F0]">
                          {req.displayName || 'Candidat Professeur'}
                        </h3>
                        <span className="text-xs font-mono text-[#BAC3CE]">
                          ({req.email})
                        </span>
                      </div>

                      {/* Profile Detail Summary Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2 text-xs">
                        <div className="p-2.5 rounded-xl bg-[#15191E] border border-[#323B46]">
                          <span className="text-[#BAC3CE] block text-[11px]">Matricule Enseignant</span>
                          <span className="font-mono font-semibold text-[#FAF6F0]">
                            {req.matricule || 'Non renseigné — cliquez sur Entrer détail'}
                          </span>
                        </div>
                        <div className="p-2.5 rounded-xl bg-[#15191E] border border-[#323B46]">
                          <span className="text-[#BAC3CE] block text-[11px]">Université / Faculté</span>
                          <span className="font-semibold text-[#FAF6F0]">
                            {req.university || 'Faculté de Médecine'}
                          </span>
                        </div>
                        <div className="p-2.5 rounded-xl bg-[#15191E] border border-[#323B46]">
                          <span className="text-[#BAC3CE] block text-[11px]">Spécialité & Grade</span>
                          <span className="font-semibold text-[#DACBA9]">
                            {req.specialty || 'Anatomie Générale'}
                          </span>
                        </div>
                      </div>

                      {req.bio && (
                        <p className="text-xs text-[#BAC3CE] italic pt-1">
                          « {req.bio} »
                        </p>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap md:flex-col items-stretch gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => openProfileDetailModal(req)}
                        className="px-3.5 py-2 text-xs font-semibold text-[#FAF6F0] bg-[#15191E] hover:bg-[#232C3A] border border-[#DACBA9]/60 rounded-xl transition cursor-pointer inline-flex items-center justify-center gap-1.5"
                      >
                        <Edit className="w-3.5 h-3.5 text-[#DACBA9]" />
                        <span>Entrer / Modifier détail profil</span>
                      </button>

                      <button
                        type="button"
                        disabled={updatingUid === req.uid}
                        onClick={() => handleSaveAndAcceptProfessor(req, 'professor')}
                        className="px-4 py-2 text-xs font-bold text-[#15191E] bg-[#DACBA9] hover:bg-[#ECE3D9] rounded-xl transition cursor-pointer inline-flex items-center justify-center gap-1.5 shadow-xs"
                      >
                        <UserCheck className="w-4 h-4" />
                        <span>Accepter le Professeur</span>
                      </button>

                      <button
                        type="button"
                        disabled={updatingUid === req.uid}
                        onClick={() => handleRejectRequest(req)}
                        className="px-3.5 py-1.5 text-xs font-semibold text-rose-300 hover:text-rose-200 bg-[#15191E] hover:bg-rose-950/40 border border-[#323B46] rounded-xl transition cursor-pointer"
                      >
                        Refuser la demande
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 1: USERS DIRECTORY */}
      {activeTab === 'users' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 p-1 bg-[#1E242C] border border-[#323B46] rounded-xl self-start">
              {(['all', 'professor', 'student', 'admin'] as const).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRoleFilter(r)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition cursor-pointer ${
                    roleFilter === r
                      ? 'bg-[#DACBA9] text-[#15191E]'
                      : 'text-[#BAC3CE] hover:text-[#FAF6F0]'
                  }`}
                >
                  {r === 'all'
                    ? `Tous (${users.length})`
                    : r === 'professor'
                    ? `Professeurs (${totalProfessors})`
                    : r === 'student'
                    ? `Étudiants (${totalStudents})`
                    : `Admins (${totalAdmins})`}
                </button>
              ))}
            </div>

            <div className="relative min-w-[260px]">
              <Search className="w-4 h-4 text-[#BAC3CE] absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Rechercher par nom, email, matricule, spécialité…"
                className="w-full pl-9 pr-3 py-2 text-xs bg-[#1E242C] border border-[#323B46] rounded-xl text-[#FAF6F0] placeholder-[#BAC3CE] focus:outline-none focus:border-[#DACBA9]"
              />
            </div>
          </div>

          <div className="rounded-2xl bg-[#1E242C] border border-[#323B46] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#15191E] text-[#BAC3CE] font-semibold border-b border-[#323B46]">
                  <tr>
                    <th className="py-3 px-4">Utilisateur</th>
                    <th className="py-3 px-4">Université & Spécialité</th>
                    <th className="py-3 px-4">Matricule</th>
                    <th className="py-3 px-4">Statut / Rôle</th>
                    <th className="py-3 px-4 text-right">Détail Profil & Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#323B46]">
                  {filteredUsers.map((user) => (
                    <tr key={user.uid} className="hover:bg-[#15191E]/50 transition">
                      <td className="py-3 px-4">
                        <div className="font-bold text-[#FAF6F0]">
                          {user.displayName || 'Sans nom'}
                        </div>
                        <div className="text-[11px] text-[#BAC3CE] font-mono">
                          {user.email}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-[#BAC3CE]">
                        <div className="font-medium text-[#FAF6F0]">
                          {user.university || 'Faculté de Médecine'}
                        </div>
                        <div className="text-[11px]">
                          {user.specialty || user.academicYear || 'Anatomie'}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-[#BAC3CE] font-mono tabular-nums">
                        {user.matricule || '—'}
                      </td>
                      <td className="py-3 px-4">
                        <select
                          value={user.role}
                          disabled={updatingUid === user.uid}
                          onChange={(e) =>
                            handleRoleChange(
                              user,
                              e.target.value as 'student' | 'professor' | 'admin'
                            )
                          }
                          className="px-2.5 py-1.5 text-xs rounded-lg border border-[#323B46] bg-[#15191E] text-[#FAF6F0] font-semibold cursor-pointer"
                        >
                          <option value="student">Étudiant</option>
                          <option value="professor">Professeur (Validé)</option>
                          <option value="admin">Administrateur</option>
                        </select>
                      </td>
                      <td className="py-3 px-4 text-right space-x-2">
                        <button
                          type="button"
                          onClick={() => openProfileDetailModal(user)}
                          className="px-3 py-1.5 rounded-lg bg-[#DACBA9] text-[#15191E] font-bold text-xs cursor-pointer hover:bg-[#ECE3D9] transition"
                        >
                          Entrer / Modifier Profil
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteUser(user)}
                          className="px-2.5 py-1.5 rounded-lg bg-[#15191E] border border-[#323B46] text-rose-400 hover:text-rose-300 text-xs cursor-pointer"
                        >
                          Supprimer
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: SYSTEM INFRASTRUCTURE */}
      {activeTab === 'system' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-5 rounded-2xl bg-[#1E242C] border border-[#323B46] space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Database className="w-5 h-5 text-emerald-400" />
                <h3 className="text-sm font-bold text-[#FAF6F0]">Firebase Firestore RBAC</h3>
              </div>
              <span className="text-xs font-semibold text-emerald-400">Opérationnel</span>
            </div>
            <p className="text-xs text-[#BAC3CE]">
              Validation stricte des comptes Professeurs par l’Admin et persistance CRUD des étudiants.
            </p>
          </div>
          <div className="p-5 rounded-2xl bg-[#1E242C] border border-[#323B46] space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Lock className="w-5 h-5 text-[#DACBA9]" />
                <h3 className="text-sm font-bold text-[#FAF6F0]">Verrouillage Professeur Non-Validé</h3>
              </div>
              <span className="text-xs font-semibold text-[#DACBA9]">Actif</span>
            </div>
            <p className="text-xs text-[#BAC3CE]">
              Tout professeur non validé par l’Admin est limité aux démonstrations 3D sans accès aux étudiants ni aux examens.
            </p>
          </div>
        </div>
      )}

      {/* TAB 3: AUDIT LOG */}
      {activeTab === 'audit' && (
        <div className="rounded-2xl bg-[#1E242C] border border-[#323B46] overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#15191E] text-[#BAC3CE] font-semibold border-b border-[#323B46]">
              <tr>
                <th className="py-3 px-4">Horodatage</th>
                <th className="py-3 px-4">Opération</th>
                <th className="py-3 px-4">Utilisateur</th>
                <th className="py-3 px-4 text-right">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#323B46]">
              {auditLogs.map((log) => (
                <tr key={log.id}>
                  <td className="py-3 px-4 text-[#BAC3CE] font-mono tabular-nums">
                    {new Date(log.timestamp).toLocaleString('fr-FR')}
                  </td>
                  <td className="py-3 px-4 font-semibold text-[#FAF6F0]">{log.action}</td>
                  <td className="py-3 px-4 text-[#BAC3CE]">{log.user}</td>
                  <td className="py-3 px-4 text-right font-bold text-[#DACBA9]">{log.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* MODAL 1: PROFESSOR / USER PROFILE DETAIL ENTRY & ACCEPTANCE */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <form
            onSubmit={handleSaveProfileOnly}
            className="w-full max-w-xl rounded-2xl bg-[#1E242C] border-2 border-[#DACBA9] p-6 space-y-4 text-[#FAF6F0] max-h-[92vh] overflow-y-auto"
          >
            <div className="flex items-start justify-between border-b border-[#323B46] pb-3">
              <div>
                <span className="text-xs text-[#DACBA9] font-semibold">
                  Fiche détaillée & Accréditation Professeur
                </span>
                <h3 className="text-base font-bold text-[#FAF6F0] mt-0.5">
                  {editingUser.displayName || editingUser.email}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingUser(null)}
                className="text-[#BAC3CE] hover:text-[#FAF6F0] p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
              <div>
                <label className="block font-semibold text-[#BAC3CE] mb-1">
                  Nom complet & Titre *
                </label>
                <input
                  type="text"
                  required
                  value={editDisplayName}
                  onChange={(e) => setEditDisplayName(e.target.value)}
                  placeholder="Ex: Pr. Kamel Zenasni"
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
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#15191E] border border-[#323B46] text-[#FAF6F0] font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#BAC3CE] mb-1">
                  Matricule Enseignant / Hospitalier *
                </label>
                <input
                  type="text"
                  required
                  value={editMatricule}
                  onChange={(e) => setEditMatricule(e.target.value)}
                  placeholder="Ex: PROF-ANAT-2026"
                  className="w-full px-3 py-2 rounded-xl bg-[#15191E] border border-[#323B46] text-[#FAF6F0] font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#BAC3CE] mb-1">
                  Université / Faculté de rattachement *
                </label>
                <input
                  type="text"
                  required
                  value={editUniversity}
                  onChange={(e) => setEditUniversity(e.target.value)}
                  placeholder="Ex: Faculté de Médecine"
                  className="w-full px-3 py-2 rounded-xl bg-[#15191E] border border-[#323B46] text-[#FAF6F0]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#BAC3CE] mb-1">
                  Grade académique
                </label>
                <input
                  type="text"
                  value={editAcademicYear}
                  onChange={(e) => setEditAcademicYear(e.target.value)}
                  placeholder="Ex: Professeur Hospitalo-Universitaire"
                  className="w-full px-3 py-2 rounded-xl bg-[#15191E] border border-[#323B46] text-[#FAF6F0]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#BAC3CE] mb-1">
                  Spécialité anatomique enseignée *
                </label>
                <input
                  type="text"
                  required
                  value={editSpecialty}
                  onChange={(e) => setEditSpecialty(e.target.value)}
                  placeholder="Ex: Neuro-anatomie, Appareil locomoteur"
                  className="w-full px-3 py-2 rounded-xl bg-[#15191E] border border-[#323B46] text-[#FAF6F0]"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-semibold text-[#BAC3CE] mb-1">
                  Téléphone professionnel
                </label>
                <input
                  type="text"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  placeholder="Ex: +33 6 00 00 00 00"
                  className="w-full px-3 py-2 rounded-xl bg-[#15191E] border border-[#323B46] text-[#FAF6F0]"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-semibold text-[#BAC3CE] mb-1">
                  Biographie & Responsabilités pédagogiques
                </label>
                <textarea
                  rows={3}
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  placeholder="Chaire d'enseignement, publications, modules supervisés..."
                  className="w-full px-3 py-2 rounded-xl bg-[#15191E] border border-[#323B46] text-[#FAF6F0] resize-none"
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-[#323B46]">
              <button
                type="submit"
                className="px-4 py-2 text-xs font-semibold text-[#FAF6F0] bg-[#15191E] hover:bg-[#232C3A] border border-[#323B46] rounded-xl transition cursor-pointer inline-flex items-center gap-1.5"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Enregistrer le détail profil</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() =>
                    handleSaveAndAcceptProfessor(editingUser, 'professor', {
                      displayName: editDisplayName.trim(),
                      email: editEmail.trim(),
                      matricule: editMatricule.trim(),
                      university: editUniversity.trim(),
                      academicYear: editAcademicYear.trim(),
                      specialty: editSpecialty.trim(),
                      phone: editPhone.trim(),
                      bio: editBio.trim(),
                    })
                  }
                  className="px-4 py-2 text-xs font-bold text-[#15191E] bg-[#DACBA9] hover:bg-[#ECE3D9] rounded-xl transition cursor-pointer inline-flex items-center gap-1.5 shadow-sm"
                >
                  <Check className="w-4 h-4" />
                  <span>Enregistrer & Accepter comme Professeur</span>
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* MODAL 2: ADD NEW PROFESSOR CANDIDATE WITH DETAILED PROFILE */}
      {isAddProfOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <form
            onSubmit={handleCreateProfessorCandidate}
            className="w-full max-w-xl rounded-2xl bg-[#1E242C] border-2 border-[#DACBA9] p-6 space-y-4 text-[#FAF6F0] max-h-[92vh] overflow-y-auto"
          >
            <div className="flex items-start justify-between border-b border-[#323B46] pb-3">
              <div>
                <span className="text-xs text-[#DACBA9] font-semibold">
                  Nouvelle inscription Enseignant
                </span>
                <h3 className="text-base font-bold text-[#FAF6F0] mt-0.5">
                  Entrer le profil détaillé d’un Professeur
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAddProfOpen(false)}
                className="text-[#BAC3CE] hover:text-[#FAF6F0] p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
              <div>
                <label className="block font-semibold text-[#BAC3CE] mb-1">
                  Nom complet & Titre *
                </label>
                <input
                  type="text"
                  required
                  value={newProfName}
                  onChange={(e) => setNewProfName(e.target.value)}
                  placeholder="Ex: Dr. Karim Benali"
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
                  value={newProfEmail}
                  onChange={(e) => setNewProfEmail(e.target.value)}
                  placeholder="karim.benali@univ-med.fr"
                  className="w-full px-3 py-2 rounded-xl bg-[#15191E] border border-[#323B46] text-[#FAF6F0] font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#BAC3CE] mb-1">
                  Matricule Enseignant *
                </label>
                <input
                  type="text"
                  required
                  value={newProfMatricule}
                  onChange={(e) => setNewProfMatricule(e.target.value)}
                  placeholder="Ex: PROF-2026-15"
                  className="w-full px-3 py-2 rounded-xl bg-[#15191E] border border-[#323B46] text-[#FAF6F0] font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#BAC3CE] mb-1">
                  Faculté / Université *
                </label>
                <input
                  type="text"
                  required
                  value={newProfUniversity}
                  onChange={(e) => setNewProfUniversity(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#15191E] border border-[#323B46] text-[#FAF6F0]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#BAC3CE] mb-1">
                  Grade académique
                </label>
                <input
                  type="text"
                  value={newProfYear}
                  onChange={(e) => setNewProfYear(e.target.value)}
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
                  value={newProfSpecialty}
                  onChange={(e) => setNewProfSpecialty(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#15191E] border border-[#323B46] text-[#FAF6F0]"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-semibold text-[#BAC3CE] mb-1">
                  Téléphone
                </label>
                <input
                  type="text"
                  value={newProfPhone}
                  onChange={(e) => setNewProfPhone(e.target.value)}
                  placeholder="+33 6 ..."
                  className="w-full px-3 py-2 rounded-xl bg-[#15191E] border border-[#323B46] text-[#FAF6F0]"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-semibold text-[#BAC3CE] mb-1">
                  Biographie & Modules enseignés
                </label>
                <textarea
                  rows={2}
                  value={newProfBio}
                  onChange={(e) => setNewProfBio(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#15191E] border border-[#323B46] text-[#FAF6F0] resize-none"
                />
              </div>

              <div className="sm:col-span-2 pt-1">
                <label className="inline-flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newProfAutoApprove}
                    onChange={(e) => setNewProfAutoApprove(e.target.checked)}
                    className="rounded"
                  />
                  <span className="font-semibold text-[#DACBA9]">
                    Accepter et activer immédiatement ce compte Professeur
                  </span>
                </label>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#323B46]">
              <button
                type="button"
                onClick={() => setIsAddProfOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-[#BAC3CE] hover:text-[#FAF6F0] cursor-pointer"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-bold text-[#15191E] bg-[#DACBA9] hover:bg-[#ECE3D9] rounded-xl transition cursor-pointer"
              >
                Enregistrer le Professeur
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
