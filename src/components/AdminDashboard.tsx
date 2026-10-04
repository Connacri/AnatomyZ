import React, { useEffect, useState } from 'react';
import {
  ArrowLeft,
  CheckCircle2,
  GraduationCap,
  RefreshCw,
  Search,
  Shield,
  ShieldAlert,
  User,
  UserCheck,
  Users,
} from 'lucide-react';
import { fetchAllUsers, updateUserRole, UserRecord } from '../firebase';

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
  const [updatingUid, setUpdatingUid] = useState<string | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

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
        `Rôle de ${targetUser.displayName || targetUser.email} mis à jour avec succès : ${newRole.toUpperCase()}`
      );
      setTimeout(() => setFeedbackMessage(null), 4000);
    } catch (err: any) {
      console.error('Erreur mise à jour rôle:', err);
      setFeedbackMessage('Erreur lors du changement de rôle dans Firestore.');
    } finally {
      setUpdatingUid(null);
    }
  };

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.displayName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const totalUsers = users.length;
  const totalStudents = users.filter((u) => u.role === 'student').length;
  const totalProfessors = users.filter((u) => u.role === 'professor').length;
  const totalAdmins = users.filter((u) => u.role === 'admin').length;

  return (
    <div className="flex-1 bg-[#15191E] text-[#FAF6F0] p-4 sm:p-8 space-y-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#323B46] pb-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onBack}
              className="p-2 rounded-xl bg-[#1E242C] border border-[#323B46] hover:border-[#ECE3D9] text-[#FAF6F0] transition cursor-pointer"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <Shield className="w-6 h-6 text-amber-400" />
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#FAF6F0]">
                  Panneau Administrateur
                </h1>
                <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/30">
                  Accès Privilégié
                </span>
              </div>
              <p className="text-xs text-[#BAC3CE] mt-0.5">
                Gestion des comptes, attribution des rôles Professeur / Étudiant / Admin dans Firestore.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={loadUsers}
              disabled={loading}
              className="px-3.5 py-2 rounded-xl bg-[#1E242C] border border-[#323B46] hover:border-[#ECE3D9] text-xs font-semibold text-[#ECE3D9] inline-flex items-center gap-2 transition cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Actualiser</span>
            </button>
          </div>
        </div>

        {/* Feedback Alert */}
        {feedbackMessage && (
          <div className="p-3.5 rounded-xl bg-[#1E242C] border border-[#455160] text-xs text-[#ECE3D9] flex items-center justify-between animate-in fade-in duration-150">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{feedbackMessage}</span>
            </div>
            <button
              type="button"
              onClick={() => setFeedbackMessage(null)}
              className="text-[#8C97A5] hover:text-white"
            >
              ×
            </button>
          </div>
        )}

        {/* Overview Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <div className="p-4 rounded-2xl bg-[#1E242C] border border-[#323B46] space-y-1">
            <div className="flex items-center justify-between text-[#8C97A5] text-xs">
              <span>Total Comptes</span>
              <Users className="w-4 h-4 text-[#ECE3D9]" />
            </div>
            <div className="text-2xl font-bold text-[#FAF6F0] tabular-nums">
              {totalUsers}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#1E242C] border border-[#323B46] space-y-1">
            <div className="flex items-center justify-between text-[#8C97A5] text-xs">
              <span>Étudiants</span>
              <User className="w-4 h-4 text-sky-400" />
            </div>
            <div className="text-2xl font-bold text-sky-400 tabular-nums">
              {totalStudents}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#1E242C] border border-[#323B46] space-y-1">
            <div className="flex items-center justify-between text-[#8C97A5] text-xs">
              <span>Professeurs</span>
              <GraduationCap className="w-4 h-4 text-indigo-400" />
            </div>
            <div className="text-2xl font-bold text-indigo-400 tabular-nums">
              {totalProfessors}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#1E242C] border border-[#323B46] space-y-1">
            <div className="flex items-center justify-between text-[#8C97A5] text-xs">
              <span>Admins</span>
              <ShieldAlert className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl font-bold text-amber-400 tabular-nums">
              {totalAdmins}
            </div>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-2xl bg-[#1E242C] border border-[#323B46]">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#8C97A5] absolute left-3 top-3" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Rechercher par nom ou email…"
              className="w-full min-h-[40px] pl-9 pr-3 py-1.5 rounded-xl bg-[#15191E] border border-[#323B46] text-xs text-[#FAF6F0] placeholder-[#8C97A5] focus:outline-hidden focus:border-[#ECE3D9]"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {(['all', 'student', 'professor', 'admin'] as const).map((r) => {
              const label =
                r === 'all'
                  ? 'Tous'
                  : r === 'student'
                  ? 'Étudiants'
                  : r === 'professor'
                  ? 'Professeurs'
                  : 'Admins';
              const active = roleFilter === r;
              return (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRoleFilter(r)}
                  className={`min-h-[36px] px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                    active
                      ? 'bg-[#ECE3D9] text-[#1E242C]'
                      : 'bg-[#15191E] text-[#BAC3CE] hover:text-white border border-[#323B46]'
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Users Table / Cards */}
        {loading ? (
          <div className="p-12 text-center space-y-3 bg-[#1E242C] rounded-2xl border border-[#323B46]">
            <div className="w-8 h-8 rounded-full border-2 border-[#ECE3D9] border-t-transparent animate-spin mx-auto" />
            <p className="text-xs text-[#BAC3CE]">Chargement des comptes Firestore…</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-12 text-center space-y-2 bg-[#1E242C] rounded-2xl border border-[#323B46]">
            <Users className="w-10 h-10 text-[#8C97A5] mx-auto" />
            <p className="text-sm font-semibold text-[#FAF6F0]">
              Aucun utilisateur trouvé
            </p>
            <p className="text-xs text-[#BAC3CE]">
              Les utilisateurs s&apos;enregistrent automatiquement dans Firestore lors de leur première connexion Google.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredUsers.map((user) => {
              const isUpdating = updatingUid === user.uid;
              return (
                <div
                  key={user.uid}
                  className="p-4 rounded-2xl bg-[#1E242C] border border-[#323B46] hover:border-[#455160] flex flex-col md:flex-row md:items-center justify-between gap-4 transition"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {user.photoURL ? (
                      <img
                        src={user.photoURL}
                        alt={user.displayName}
                        className="w-10 h-10 rounded-full border border-[#D8CCBF] shrink-0"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-[#2A323D] border border-[#D8CCBF] flex items-center justify-center text-sm font-bold text-[#ECE3D9] shrink-0">
                        {(user.displayName || user.email || 'U')[0].toUpperCase()}
                      </div>
                    )}
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-sm text-[#FAF6F0] truncate">
                          {user.displayName || 'Utilisateur sans nom'}
                        </span>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                            user.role === 'admin'
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                              : user.role === 'professor'
                              ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                              : 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                          }`}
                        >
                          {user.role}
                        </span>
                      </div>
                      <p className="text-xs text-[#BAC3CE] truncate">{user.email}</p>
                      <p className="text-[10px] font-mono text-[#8C97A5] truncate mt-0.5">
                        UID : {user.uid}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end md:self-auto shrink-0">
                    <span className="text-xs text-[#8C97A5] mr-1 hidden sm:inline">
                      Modifier rôle :
                    </span>
                    <button
                      type="button"
                      disabled={isUpdating || user.role === 'student'}
                      onClick={() => handleRoleChange(user, 'student')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                        user.role === 'student'
                          ? 'bg-sky-600 text-white shadow-xs'
                          : 'bg-[#15191E] border border-[#323B46] text-[#BAC3CE] hover:text-white hover:border-sky-400'
                      }`}
                    >
                      Étudiant
                    </button>

                    <button
                      type="button"
                      disabled={isUpdating || user.role === 'professor'}
                      onClick={() => handleRoleChange(user, 'professor')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                        user.role === 'professor'
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : 'bg-[#15191E] border border-[#323B46] text-[#BAC3CE] hover:text-white hover:border-indigo-400'
                      }`}
                    >
                      Professeur
                    </button>

                    <button
                      type="button"
                      disabled={isUpdating || user.role === 'admin'}
                      onClick={() => handleRoleChange(user, 'admin')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                        user.role === 'admin'
                          ? 'bg-amber-600 text-white shadow-xs'
                          : 'bg-[#15191E] border border-[#323B46] text-[#BAC3CE] hover:text-white hover:border-amber-400'
                      }`}
                    >
                      Admin
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
