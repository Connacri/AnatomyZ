import React, { useState } from 'react';
import { User as FirebaseUser } from 'firebase/auth';
import {
  Bell,
  BellRing,
  BellOff,
  Check,
  Copy,
  Smartphone,
  Globe,
  Trash2,
  Send,
  RefreshCw,
  X,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';
import { FcmTokenRecord, UserRecord } from '../firebase';

interface FcmNotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: FirebaseUser | null;
  userProfile: UserRecord | null;
  fcmToken: string | null;
  tokensList: FcmTokenRecord[];
  onEnableNotifications: () => Promise<void>;
  onRefreshTokens: () => Promise<void>;
  onDeleteToken: (tokenId: string) => Promise<void>;
  onSendTestNotification: () => Promise<void>;
  loading: boolean;
  error: string | null;
}

export function FcmNotificationsModal({
  isOpen,
  onClose,
  currentUser,
  userProfile,
  fcmToken,
  tokensList,
  onEnableNotifications,
  onRefreshTokens,
  onDeleteToken,
  onSendTestNotification,
  loading,
  error,
}: FcmNotificationsModalProps) {
  const [copied, setCopied] = useState(false);
  const [sendingTest, setSendingTest] = useState(false);
  const [testSent, setTestSent] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    if (!fcmToken) return;
    navigator.clipboard.writeText(fcmToken);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleTestNotification = async () => {
    try {
      setSendingTest(true);
      await onSendTestNotification();
      setTestSent(true);
      setTimeout(() => setTestSent(false), 3000);
    } finally {
      setSendingTest(false);
    }
  };

  const hasActiveToken = !!fcmToken;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-xl rounded-3xl bg-[#1E242C] border-2 border-[#D8CCBF] shadow-2xl p-6 sm:p-7 space-y-5 text-[#FAF6F0] max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#323B46]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#ECE3D9] flex items-center justify-center text-[#1E242C] shadow-md">
              <BellRing className="w-5 h-5 text-[#1E242C]" />
            </div>
            <div>
              <h2 className="font-bold text-lg text-[#FAF6F0]">
                Notifications Firebase (FCM)
              </h2>
              <p className="text-xs text-[#BAC3CE]">
                Persistance des tokens cloud messaging sur Web & Application Mobile
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-[#BAC3CE] hover:text-[#FAF6F0] hover:bg-[#323B46] transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error notice */}
        {error && (
          <div className="p-3.5 rounded-2xl bg-rose-950/40 border border-rose-500/50 flex items-start gap-2.5 text-xs text-rose-200">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <div className="flex-1">{error}</div>
          </div>
        )}

        {/* Status card */}
        <div className="p-4 rounded-2xl bg-[#15191E] border border-[#323B46] space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#BAC3CE]">
              État des notifications Push
            </span>
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                hasActiveToken
                  ? 'bg-emerald-950/70 border border-emerald-500/40 text-emerald-300'
                  : 'bg-amber-950/70 border border-amber-500/40 text-amber-300'
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  hasActiveToken ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
                }`}
              />
              {hasActiveToken ? 'FCM Actif & Synchronisé' : 'En attente d’activation'}
            </span>
          </div>

          <p className="text-xs text-[#BAC3CE] leading-relaxed">
            Lorsque les notifications sont activées, votre token FCM unique est
            enregistré et synchronisé en continu dans Firestore sous votre profil{' '}
            <code className="px-1.5 py-0.5 rounded bg-[#1E242C] text-[#ECE3D9] font-mono text-[11px]">
              users/{currentUser?.uid || 'guest'}
            </code>
            .
          </p>

          <div className="pt-2 flex flex-wrap gap-2">
            <button
              type="button"
              disabled={loading}
              onClick={onEnableNotifications}
              className="flex-1 py-2.5 px-4 rounded-xl bg-[#ECE3D9] hover:bg-[#FAF6F0] text-[#1E242C] font-bold text-xs transition cursor-pointer flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
            >
              {loading ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : hasActiveToken ? (
                <RefreshCw className="w-3.5 h-3.5" />
              ) : (
                <Bell className="w-3.5 h-3.5" />
              )}
              <span>
                {hasActiveToken
                  ? 'Actualiser la synchronisation FCM'
                  : 'Activer les notifications push Web'}
              </span>
            </button>

            <button
              type="button"
              disabled={!hasActiveToken || sendingTest}
              onClick={handleTestNotification}
              className="py-2.5 px-4 rounded-xl border border-[#455160] hover:border-[#ECE3D9] bg-[#1E242C] text-xs font-semibold text-[#ECE3D9] transition cursor-pointer flex items-center gap-2 disabled:opacity-40"
            >
              {sendingTest ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : testSent ? (
                <Check className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <Send className="w-3.5 h-3.5" />
              )}
              <span>{testSent ? 'Envoyé !' : 'Tester un push'}</span>
            </button>
          </div>
        </div>

        {/* Current Active Token details */}
        {fcmToken && (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-[#BAC3CE]">
                Token FCM actuel de ce navigateur :
              </span>
              <button
                type="button"
                onClick={handleCopy}
                className="inline-flex items-center gap-1 text-[11px] font-medium text-[#ECE3D9] hover:underline cursor-pointer"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Copié !</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copier le token</span>
                  </>
                )}
              </button>
            </div>
            <div className="p-3 rounded-xl bg-[#15191E] border border-[#323B46] font-mono text-[11px] text-[#8FC5FF] break-all select-all">
              {fcmToken}
            </div>
          </div>
        )}

        {/* Multi-device sync list */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-bold text-xs text-[#FAF6F0]">
              Appareils & Navigateurs enregistrés ({tokensList.length || (fcmToken ? 1 : 0)})
            </span>
            <button
              type="button"
              onClick={onRefreshTokens}
              className="text-[11px] text-[#BAC3CE] hover:text-[#ECE3D9] flex items-center gap-1 cursor-pointer"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Rafraîchir</span>
            </button>
          </div>

          <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
            {tokensList.length > 0 ? (
              tokensList.map((t) => (
                <div
                  key={t.id}
                  className="p-3 rounded-xl bg-[#15191E] border border-[#323B46] flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-7 h-7 rounded-lg bg-[#1E242C] border border-[#455160] flex items-center justify-center shrink-0">
                      {t.platform === 'android' ? (
                        <Smartphone className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <Globe className="w-4 h-4 text-sky-400" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="font-semibold text-[#ECE3D9] truncate">
                        {t.platform === 'android' ? 'Application Flutter Mobile' : 'Navigateur Web'}
                      </div>
                      <div className="text-[11px] text-[#BAC3CE] truncate font-mono">
                        {t.token.slice(0, 24)}...{t.token.slice(-8)}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[10px] text-[#8C97A5]">
                      {new Date(t.updatedAt).toLocaleDateString('fr-FR', {
                        day: '2-digit',
                        month: 'short',
                      })}
                    </span>
                    <button
                      type="button"
                      title="Supprimer ce token de Firestore"
                      onClick={() => onDeleteToken(t.id)}
                      className="p-1 rounded-lg text-[#8C97A5] hover:text-rose-400 hover:bg-rose-950/30 transition cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            ) : fcmToken ? (
              <div className="p-3 rounded-xl bg-[#15191E] border border-[#323B46] flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-7 h-7 rounded-lg bg-[#1E242C] border border-[#455160] flex items-center justify-center shrink-0">
                    <Globe className="w-4 h-4 text-sky-400" />
                  </div>
                  <div className="min-w-0">
                    <div className="font-semibold text-[#ECE3D9] truncate">
                      Session Web actuelle
                    </div>
                    <div className="text-[11px] text-[#BAC3CE] truncate font-mono">
                      {fcmToken.slice(0, 24)}...{fcmToken.slice(-8)}
                    </div>
                  </div>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950 border border-emerald-500/30 text-emerald-300">
                  Connecté
                </span>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-[#15191E] border border-dashed border-[#323B46] text-center text-xs text-[#BAC3CE]">
                Aucun appareil ou token FCM enregistré pour le moment.
              </div>
            )}
          </div>
        </div>

        {/* Security & Sync metadata info */}
        <div className="p-3 rounded-xl bg-[#15191E]/70 border border-[#323B46] text-[11px] text-[#BAC3CE] space-y-1">
          <div className="flex items-center gap-1.5 font-semibold text-[#ECE3D9]">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Architecture Sécurisée Firebase Firestore</span>
          </div>
          <p>
            Les règles de sécurité Firestore n’autorisent la lecture et modification
            des tokens FCM qu’à l’utilisateur propriétaire authentifié (
            <code className="text-[#8FC5FF]">request.auth.uid == userId</code>) ou aux
            administrateurs certifiés.
          </p>
        </div>

        {/* Close action */}
        <div className="pt-1 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="py-2 px-5 rounded-xl border border-[#455160] hover:border-[#ECE3D9] bg-[#15191E] text-xs font-semibold text-[#ECE3D9] transition cursor-pointer"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}
