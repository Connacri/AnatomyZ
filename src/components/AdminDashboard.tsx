import React, { useEffect, useState, useMemo } from 'react';
import {
  ArrowLeft,
  CheckCircle2,
  GraduationCap,
  RefreshCw,
  Search,
  Shield,
  ShieldAlert,
  User,
  Users,
  Database,
  Lock,
  Activity,
  Server,
  Bell,
  Check,
  Filter,
  Eye,
  Calendar,
  Building,
  Key,
} from 'lucide-react';
import { fetchAllUsers, updateUserRole, approveUserRequest, rejectUserRequest, UserRecord } from '../firebase';

interface AdminDashboardProps {
  onBack: () => void;
  currentAdminEmail?: string | null;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  onBack,
  currentAdminEmail,
}) => {
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'student' | 'professor' | 'admin'>('all');
  const [activeTab, setActiveTab] = useState<'requests' | 'users' | 'system' | 'audit'>('requests');
  const [updatingUid, setUpdatingUid] = useState<string | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  // User detail inspection modal
  const [selectedUser, setSelectedUser] = useState<UserRecord | null>(null);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await fetchAllUsers();
      setUsers(data);
    } catch (err: any) {
      console.error('Erreur chargement utilisateurs:', err);
      setFeedbackMessage('Impossible de charger les utilisateurs. Vérifiez vos permissions administrateur.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleApproveRequest = async (targetUser: UserRecord, role: 'professor' | 'admin') => {
    setUpdatingUid(targetUser.uid);
    try {
      await approveUserRequest(targetUser.uid, role, currentAdminEmail || 'forslog@gmail.com');
      setUsers((prev) =>
        prev.map((u) => (u.uid === targetUser.uid ? { ...u, role, status: 'approved', requestedRole: undefined } : u))
      );
      setFeedbackMessage(`Accès validé avec succès pour ${targetUser.displayName || targetUser.email} en tant que ${role.toUpperCase()}.`);
      setTimeout(() => setFeedbackMessage(null), 4500);
    } catch (err) {
      console.error('Erreur approbation:', err);
      setFeedbackMessage('Erreur lors de l’approbation de la demande.');
    } finally {
      setUpdatingUid(null);
    }
  };

  const handleRejectRequest = async (targetUser: UserRecord) => {
    setUpdatingUid(targetUser.uid);
    try {
      await rejectUserRequest(targetUser.uid, currentAdminEmail || 'forslog@gmail.com');
      setUsers((prev) =>
        prev.map((u) => (u.uid === targetUser.uid ? { ...u, role: 'student', status: 'approved', requestedRole: undefined } : u))
      );
      setFeedbackMessage(`Demande de ${targetUser.displayName || targetUser.email} réorientée vers le profil Étudiant.`);
      setTimeout(() => setFeedbackMessage(null), 4500);
    } catch (err) {
      console.error('Erreur refus:', err);
      setFeedbackMessage('Erreur lors du traitement de la demande.');
    } finally {
      setUpdatingUid(null);
    }
  };

  const handleRoleChange = async (
    targetUser: UserRecord,
    newRole: 'student' | 'professor' | 'admin'
  ) => {
    if (targetUser.role === newRole) return;
    setUpdatingUid(targetUser.uid);
    try {
      await updateUserRole(targetUser.uid, newRole);
      setUsers((prev) =>
        prev.map((u) => (u.uid === targetUser.uid ? { ...u, role: newRole } : u))
      );
      setFeedbackMessage(
        `Rôle de ${targetUser.displayName || targetUser.email} mis à jour : ${newRole.toUpperCase()}`
      );
      setTimeout(() => setFeedbackMessage(null), 4000);
    } catch (err: any) {
      console.error('Erreur mise à jour rôle:', err);
      setFeedbackMessage('Erreur lors du changement de rôle dans Firestore.');
    } finally {
      setUpdatingUid(null);
    }
  };

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchesSearch =
        u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (u.matricule && u.matricule.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (u.university && u.university.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesRole = roleFilter === 'all' || u.role === roleFilter;
      return matchesSearch && matchesRole;
    });
  }, [users, searchTerm, roleFilter]);

  const totalUsers = users.length;
  const totalStudents = users.filter((u) => u.role === 'student').length;
  const totalProfessors = users.filter((u) => u.role === 'professor').length;
  const totalAdmins = users.filter((u) => u.role === 'admin').length;

  const pendingRequests = useMemo(() => {
    return users.filter((u) => u.status === 'pending_approval');
  }, [users]);

  const auditLogs = useMemo(() => {
    return users.map((u, idx) => ({
      id: `log-${u.uid || idx}`,
      timestamp: u.approvedAt || u.requestedAt || u.createdAt || new Date().toISOString(),
      action:
        u.status === 'pending_approval'
          ? `Demande de rôle [${(u.requestedRole || 'professeur').toUpperCase()}] soumise`
          : `Compte opérationnel [${u.role.toUpperCase()}]`,
      user: u.displayName || u.email,
      status: u.status === 'pending_approval' ? 'En attente' : 'Validé',
    }));
  }, [users]);

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8 pb-16 text-[#F5F7FA]">
      {/* 1. Header with Breadcrumb and Governance Status */}
      <section className="p-6 md:p-8 rounded-2xl bg-[#161C24] border border-[#263140] transition">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <button
              type="button"
              onClick={onBack}
              className="p-3 text-[#BCC7D5] hover:text-[#F5F7FA] bg-[#1D2530] hover:bg-[#232C3A] border border-[#263140] rounded-xl transition cursor-pointer"
              title="Retour à l'accueil"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="space-y-1">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-xl md:text-2xl font-bold tracking-tight text-[#F5F7FA]">
                  Gouvernance & Administration
                </h1>
                <span className="text-xs font-medium text-[#E5DCD0]">
                  Contrôle d'Accès RBAC
                </span>
                <span className="text-xs text-[#8F9CAE]">
                  Session : {currentAdminEmail || 'forslog@gmail.com'}
                </span>
              </div>
              <p className="text-xs text-[#8F9CAE]">
                Gestion centrale des accréditations universitaires et validation des accès Enseignants par forslog@gmail.com.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={loadUsers}
              disabled={loading}
              className="px-4 py-2 text-xs font-semibold text-[#BCC7D5] hover:text-[#F5F7FA] bg-[#1D2530] hover:bg-[#232C3A] border border-[#263140] rounded-xl transition cursor-pointer inline-flex items-center gap-2"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Actualiser l'annuaire</span>
            </button>
          </div>
        </div>

        {/* System & RBAC Statistics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-[#263140]">
          <div>
            <div className="text-xs text-[#8F9CAE]">Demandes en attente</div>
            <div className={`text-2xl font-bold mt-1 tabular-nums ${pendingRequests.length > 0 ? 'text-amber-400' : 'text-[#F5F7FA]'}`}>
              {pendingRequests.length}
            </div>
            <div className="text-xs text-[#8F9CAE] mt-0.5">
              Validation requise
            </div>
          </div>

          <div>
            <div className="text-xs text-[#8F9CAE]">Étudiants Enregistrés</div>
            <div className="text-2xl font-bold text-sky-400 mt-1 tabular-nums">
              {totalStudents}
            </div>
            <div className="text-xs text-[#8F9CAE] mt-0.5">
              Validation automatique
            </div>
          </div>

          <div>
            <div className="text-xs text-[#8F9CAE]">Corps Professoral</div>
            <div className="text-2xl font-bold text-[#E5DCD0] mt-1 tabular-nums">
              {totalProfessors}
            </div>
            <div className="text-xs text-[#8F9CAE] mt-0.5">
              Accrédités par admin
            </div>
          </div>

          <div>
            <div className="text-xs text-[#8F9CAE]">Administrateurs Système</div>
            <div className="text-2xl font-bold text-emerald-400 mt-1 tabular-nums">
              {totalAdmins}
            </div>
            <div className="text-xs text-[#8F9CAE] mt-0.5">
              forslog@gmail.com
            </div>
          </div>
        </div>
      </section>

      {/* Feedback Toast */}
      {feedbackMessage && (
        <div className="p-4 rounded-xl bg-[#161C24] border border-[#263140] text-xs text-[#F5F7FA] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{feedbackMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setFeedbackMessage(null)}
            className="text-[#8F9CAE] hover:text-[#F5F7FA] cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* 2. Interactive Navigation Deck (Segmented Controls) */}
      <nav aria-label="Espace administrateur" className="flex items-center gap-1.5 p-1 bg-[#161C24] border border-[#263140] rounded-xl overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab('requests')}
          className={`flex-1 min-w-[160px] py-2 px-3 text-xs font-semibold rounded-lg transition whitespace-nowrap cursor-pointer flex items-center justify-center gap-2 ${
            activeTab === 'requests'
              ? 'bg-[#E5DCD0] text-[#0F1318]'
              : pendingRequests.length > 0
              ? 'text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30'
              : 'text-[#8F9CAE] hover:text-[#F5F7FA] hover:bg-[#1D2530]'
          }`}
        >
          <ShieldAlert className="w-4 h-4" />
          <span>Demandes d'accès ({pendingRequests.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('users')}
          className={`flex-1 min-w-[140px] py-2 px-3 text-xs font-semibold rounded-lg transition whitespace-nowrap cursor-pointer flex items-center justify-center gap-2 ${
            activeTab === 'users'
              ? 'bg-[#E5DCD0] text-[#0F1318]'
              : 'text-[#8F9CAE] hover:text-[#F5F7FA] hover:bg-[#1D2530]'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Annuaire & Rôles ({users.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('system')}
          className={`flex-1 min-w-[140px] py-2 px-3 text-xs font-semibold rounded-lg transition whitespace-nowrap cursor-pointer flex items-center justify-center gap-2 ${
            activeTab === 'system'
              ? 'bg-[#E5DCD0] text-[#0F1318]'
              : 'text-[#8F9CAE] hover:text-[#F5F7FA] hover:bg-[#1D2530]'
          }`}
        >
          <Server className="w-4 h-4" />
          <span>Infrastructure & Sécurité</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('audit')}
          className={`flex-1 min-w-[140px] py-2 px-3 text-xs font-semibold rounded-lg transition whitespace-nowrap cursor-pointer flex items-center justify-center gap-2 ${
            activeTab === 'audit'
              ? 'bg-[#E5DCD0] text-[#0F1318]'
              : 'text-[#8F9CAE] hover:text-[#F5F7FA] hover:bg-[#1D2530]'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>Journal d'Audit</span>
        </button>
      </nav>

      {/* 3. Tab Contents */}

      {/* TAB 0: PENDING APPROVAL REQUESTS */}
      {activeTab === 'requests' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-[#F5F7FA]">Demandes d'Accréditation en Attente</h2>
              <p className="text-xs text-[#8F9CAE] mt-0.5">
                Les nouveaux utilisateurs sollicitant un profil Enseignant doivent être validés par forslog@gmail.com avant d'accéder à l'espace Professeur.
              </p>
            </div>
            <span className="text-xs text-[#8F9CAE] font-mono tabular-nums">
              {pendingRequests.length} demande(s) à traiter
            </span>
          </div>

          {pendingRequests.length === 0 ? (
            <div className="p-8 text-center rounded-2xl bg-[#161C24] border border-[#263140] space-y-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
              <p className="text-sm font-semibold text-[#F5F7FA]">Toutes les demandes ont été traitées</p>
              <p className="text-xs text-[#8F9CAE]">Aucun profil Enseignant ou Administrateur n'est actuellement en attente d'approbation.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingRequests.map((req) => (
                <div
                  key={req.uid}
                  className="p-5 rounded-2xl bg-[#161C24] border border-amber-500/30 hover:border-amber-500/50 transition flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5 min-w-0">
                    <div className="flex items-center gap-2 text-xs text-[#8F9CAE]">
                      <span className="text-amber-300 font-semibold">En attente de validation</span>
                      <span aria-hidden="true">·</span>
                      <span>Rôle sollicité : <strong className="text-[#E5DCD0] capitalize">{req.requestedRole || 'Professeur'}</strong></span>
                      <span aria-hidden="true">·</span>
                      <span className="tabular-nums">
                        {req.requestedAt ? new Date(req.requestedAt).toLocaleString('fr-FR') : 'Date récente'}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-[#F5F7FA] truncate">
                      {req.displayName || 'Utilisateur'}
                    </h3>

                    <div className="flex items-center gap-3 text-xs text-[#8F9CAE] flex-wrap">
                      <span className="font-mono text-[#F5F7FA]">{req.email}</span>
                      <span aria-hidden="true">·</span>
                      <span>{req.university || 'Faculté de Médecine'}</span>
                      {req.matricule && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span className="font-mono">Matricule : {req.matricule}</span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-[#263140]">
                    <button
                      type="button"
                      disabled={updatingUid === req.uid}
                      onClick={() => handleRejectRequest(req)}
                      className="px-3.5 py-2 text-xs font-semibold text-[#8F9CAE] hover:text-[#F5F7FA] bg-[#1D2530] hover:bg-[#232C3A] border border-[#263140] rounded-xl transition cursor-pointer"
                    >
                      Assigner Étudiant
                    </button>

                    <button
                      type="button"
                      disabled={updatingUid === req.uid}
                      onClick={() => handleApproveRequest(req, (req.requestedRole as 'professor' | 'admin') || 'professor')}
                      className="px-4 py-2 text-xs font-bold text-[#0F1318] bg-[#E5DCD0] hover:bg-[#F5EFEB] rounded-xl transition cursor-pointer inline-flex items-center gap-1.5"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Valider comme {req.requestedRole === 'admin' ? 'Administrateur' : 'Professeur'}</span>
                    </button>
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
            <div className="flex items-center gap-1.5 p-1 bg-[#161C24] border border-[#263140] rounded-xl self-start">
              <button
                type="button"
                onClick={() => setRoleFilter('all')}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition cursor-pointer ${
                  roleFilter === 'all'
                    ? 'bg-[#1D2530] text-[#F5F7FA] border border-[#263140]'
                    : 'text-[#8F9CAE] hover:text-[#F5F7FA]'
                }`}
              >
                Tous ({users.length})
              </button>
              <button
                type="button"
                onClick={() => setRoleFilter('student')}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition cursor-pointer ${
                  roleFilter === 'student'
                    ? 'bg-[#1D2530] text-[#F5F7FA] border border-[#263140]'
                    : 'text-[#8F9CAE] hover:text-[#F5F7FA]'
                }`}
              >
                Étudiants ({totalStudents})
              </button>
              <button
                type="button"
                onClick={() => setRoleFilter('professor')}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition cursor-pointer ${
                  roleFilter === 'professor'
                    ? 'bg-[#1D2530] text-[#F5F7FA] border border-[#263140]'
                    : 'text-[#8F9CAE] hover:text-[#F5F7FA]'
                }`}
              >
                Professeurs ({totalProfessors})
              </button>
              <button
                type="button"
                onClick={() => setRoleFilter('admin')}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition cursor-pointer ${
                  roleFilter === 'admin'
                    ? 'bg-[#1D2530] text-[#F5F7FA] border border-[#263140]'
                    : 'text-[#8F9CAE] hover:text-[#F5F7FA]'
                }`}
              >
                Admins ({totalAdmins})
              </button>
            </div>

            <div className="relative min-w-[260px]">
              <Search className="w-4 h-4 text-[#8F9CAE] absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Rechercher par nom, email, matricule…"
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-[#161C24] border border-[#263140] rounded-xl text-[#F5F7FA] placeholder-[#8F9CAE] focus:outline-none focus:border-[#E5DCD0]"
              />
            </div>
          </div>

          {filteredUsers.length === 0 ? (
            <div className="p-8 text-center rounded-2xl bg-[#161C24] border border-[#263140] space-y-2">
              <p className="text-sm font-semibold text-[#F5F7FA]">Aucun utilisateur trouvé</p>
              <p className="text-xs text-[#8F9CAE]">Ajustez votre recherche ou vos critères de filtrage.</p>
            </div>
          ) : (
            <div className="rounded-2xl bg-[#161C24] border border-[#263140] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#1D2530] text-[#8F9CAE] font-medium border-b border-[#263140]">
                    <tr>
                      <th className="py-3 px-4">Utilisateur</th>
                      <th className="py-3 px-4">Affiliation & Faculté</th>
                      <th className="py-3 px-4">Matricule</th>
                      <th className="py-3 px-4">Rôle Attribué</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#263140]">
                    {filteredUsers.map((user) => (
                      <tr key={user.uid} className="hover:bg-[#1D2530]/50 transition">
                        <td className="py-3 px-4">
                          <div className="font-semibold text-[#F5F7FA]">
                            {user.displayName || 'Sans nom'}
                          </div>
                          <div className="text-[11px] text-[#8F9CAE] font-mono">
                            {user.email}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-[#BCC7D5]">
                          <div>{user.university || 'Faculté de Médecine'}</div>
                          <div className="text-[11px] text-[#8F9CAE]">
                            {user.academicYear || 'Non spécifié'}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-[#8F9CAE] font-mono tabular-nums">
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
                            className={`px-2.5 py-1 text-xs rounded-lg border font-medium focus:outline-none transition cursor-pointer ${
                              user.role === 'admin'
                                ? 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                                : user.role === 'professor'
                                ? 'bg-[#E5DCD0]/10 text-[#E5DCD0] border-[#E5DCD0]/30'
                                : 'bg-sky-500/10 text-sky-300 border-sky-500/30'
                            }`}
                          >
                            <option value="student" className="bg-[#161C24] text-[#F5F7FA]">Étudiant</option>
                            <option value="professor" className="bg-[#161C24] text-[#F5F7FA]">Professeur</option>
                            <option value="admin" className="bg-[#161C24] text-[#F5F7FA]">Administrateur</option>
                          </select>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            type="button"
                            onClick={() => setSelectedUser(user)}
                            className="text-xs text-[#BCC7D5] hover:text-[#F5F7FA] font-medium underline cursor-pointer"
                          >
                            Fiche détaillée
                          </button>
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

      {/* TAB 2: SYSTEM INFRASTRUCTURE & HEALTH */}
      {activeTab === 'system' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-base font-bold text-[#F5F7FA]">État de l'Infrastructure & Intégrité Sécurité</h2>
            <p className="text-xs text-[#8F9CAE] mt-0.5">
              Statuts des passerelles Firebase Firestore, Cloud Auth et notification FCM.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl bg-[#161C24] border border-[#263140] space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Database className="w-5 h-5 text-emerald-400" />
                  <h3 className="text-sm font-bold text-[#F5F7FA]">Firebase Firestore</h3>
                </div>
                <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Opérationnel</span>
                </span>
              </div>
              <p className="text-xs text-[#8F9CAE]">
                Base de données multi-région configurée pour la persistance des rôles, notes et catalogues anatomiques.
              </p>
              <div className="p-3 rounded-xl bg-[#1D2530] text-xs font-mono text-[#8F9CAE] space-y-1">
                <div>Projet : <span className="text-[#F5F7FA]">mega-inscriber-xcbh2</span></div>
                <div className="truncate">Base ID : <span className="text-[#F5F7FA]">ai-studio-anatomyz-9293ceee-b20a-4a07-ad36-4cadd3fe02a5</span></div>
                <div>Règles RBAC : <span className="text-emerald-400">Verrouillées et auditées</span></div>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-[#161C24] border border-[#263140] space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Lock className="w-5 h-5 text-emerald-400" />
                  <h3 className="text-sm font-bold text-[#F5F7FA]">Authentication & OAuth 2.0</h3>
                </div>
                <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Actif</span>
                </span>
              </div>
              <p className="text-xs text-[#8F9CAE]">
                Authentification Google Identity sécurisée en mode pop-up sans fuite de jetons côté serveur.
              </p>
              <div className="p-3 rounded-xl bg-[#1D2530] text-xs font-mono text-[#8F9CAE] space-y-1">
                <div>Fournisseur : <span className="text-[#F5F7FA]">Google Provider Client-side</span></div>
                <div>Session : <span className="text-[#F5F7FA]">Chiffrée / Persistante</span></div>
                <div>Super-admins : <span className="text-[#E5DCD0]">2 comptes habilités</span></div>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-[#161C24] border border-[#263140] space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bell className="w-5 h-5 text-sky-400" />
                  <h3 className="text-sm font-bold text-[#F5F7FA]">Firebase Cloud Messaging (FCM)</h3>
                </div>
                <span className="text-xs font-semibold text-sky-400 flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" />
                  <span>Configuré</span>
                </span>
              </div>
              <p className="text-xs text-[#8F9CAE]">
                Diffusion des alertes d'examens et convocations pédagogiques sur navigateurs et terminaux mobiles.
              </p>
              <div className="p-3 rounded-xl bg-[#1D2530] text-xs font-mono text-[#8F9CAE] space-y-1">
                <div>Service Worker : <span className="text-[#F5F7FA]">/firebase-messaging-sw.js</span></div>
                <div>Format : <span className="text-[#F5F7FA]">WebPush RFC 8292</span></div>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-[#161C24] border border-[#263140] space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Server className="w-5 h-5 text-[#E5DCD0]" />
                  <h3 className="text-sm font-bold text-[#F5F7FA]">Catalogue Ontologique FMA / UBERON</h3>
                </div>
                <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Synchronisé</span>
                </span>
              </div>
              <p className="text-xs text-[#8F9CAE]">
                Résolution bilingue FR/EN des termes anatomiques et maillage géométrique 3D.
              </p>
              <div className="p-3 rounded-xl bg-[#1D2530] text-xs font-mono text-[#8F9CAE] space-y-1">
                <div>Structures mappées : <span className="text-[#F5F7FA]">180+ identifiants certifiés</span></div>
                <div>Modèles 3D GLB : <span className="text-[#F5F7FA]">Hommes & Femmes disponibles</span></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: AUDIT LOG */}
      {activeTab === 'audit' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-[#F5F7FA]">Journal d'Audit Académique & Traçabilité</h2>
              <p className="text-xs text-[#8F9CAE] mt-0.5">
                Historique des opérations privilégiées et des attributions de rôles.
              </p>
            </div>
            <div className="text-xs text-[#8F9CAE] font-mono">
              Registres certifiés
            </div>
          </div>

          <div className="rounded-2xl bg-[#161C24] border border-[#263140] overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#1D2530] text-[#8F9CAE] font-medium border-b border-[#263140]">
                <tr>
                  <th className="py-3 px-4">Horodatage</th>
                  <th className="py-3 px-4">Action effectrice</th>
                  <th className="py-3 px-4">Opérateur</th>
                  <th className="py-3 px-4 text-right">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#263140]">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-[#1D2530]/50 transition">
                    <td className="py-3 px-4 text-[#8F9CAE] font-mono tabular-nums">
                      {new Date(log.timestamp).toLocaleString('fr-FR')}
                    </td>
                    <td className="py-3 px-4 font-semibold text-[#F5F7FA]">
                      {log.action}
                    </td>
                    <td className="py-3 px-4 text-[#BCC7D5]">
                      {log.user}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className="text-xs font-medium text-emerald-400">
                        {log.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* User Detail Inspection Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl bg-[#161C24] border border-[#263140] p-6 space-y-4 text-[#F5F7FA]">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs text-[#E5DCD0] font-medium">Détail du compte utilisateur</span>
                <h3 className="text-base font-bold text-[#F5F7FA] mt-0.5">
                  {selectedUser.displayName || 'Utilisateur'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedUser(null)}
                className="text-[#8F9CAE] hover:text-[#F5F7FA] p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-4 rounded-xl bg-[#1D2530] space-y-2.5 text-xs text-[#BCC7D5]">
              <div className="flex items-center justify-between">
                <span>Adresse courriel :</span>
                <span className="font-mono text-[#F5F7FA]">{selectedUser.email}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Rôle universitaire :</span>
                <span className="font-bold text-[#E5DCD0] capitalize">{selectedUser.role}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Matricule étudiant / Enseignant :</span>
                <span className="font-mono text-[#F5F7FA]">{selectedUser.matricule || 'Non renseigné'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Établissement de rattachement :</span>
                <span className="text-[#F5F7FA]">{selectedUser.university || 'Faculté de Médecine'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Année académique :</span>
                <span className="text-[#F5F7FA]">{selectedUser.academicYear || 'Non spécifiée'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Spécialité :</span>
                <span className="text-[#F5F7FA]">{selectedUser.specialty || 'Anatomie générale'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Date d'inscription :</span>
                <span className="text-[#8F9CAE] tabular-nums">
                  {selectedUser.createdAt ? new Date(selectedUser.createdAt).toLocaleDateString('fr-FR') : '—'}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-end pt-3 border-t border-[#263140]">
              <button
                type="button"
                onClick={() => setSelectedUser(null)}
                className="px-4 py-2 text-xs font-semibold text-[#0F1318] bg-[#E5DCD0] hover:bg-[#F5EFEB] rounded-xl transition cursor-pointer"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
