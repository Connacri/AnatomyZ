import React, { useEffect, useRef, useState } from 'react';
import {
  Search,
  Box,
  GraduationCap,
  Layers,
  ArrowRight,
  X,
  Sparkles,
  Command,
  Check,
  Palette,
  ExternalLink,
} from 'lucide-react';
import { ANATOMY_SYSTEMS, AnatomyCatalogRepository } from '../data/repositories';
import { AnatomyExam, AnatomySystemInfo, AnatomyStructure } from '../types';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectSystem: (systemId: string) => void;
  onSelectStructure: (structure: AnatomyStructure) => void;
  onSelectExam: (exam: AnatomyExam) => void;
  onOpenUxModal: () => void;
  exams: AnatomyExam[];
}

export function GlobalSearchModal({
  isOpen,
  onClose,
  onSelectSystem,
  onSelectStructure,
  onSelectExam,
  onOpenUxModal,
  exams,
}: GlobalSearchModalProps) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const catalogRepo = useRef(new AnatomyCatalogRepository()).current;

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 60);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const normalizedQuery = query.trim().toLowerCase();

  // Search Systems
  const matchedSystems = ANATOMY_SYSTEMS.filter(
    (sys) =>
      !normalizedQuery ||
      sys.nameFr.toLowerCase().includes(normalizedQuery) ||
      sys.nameEn.toLowerCase().includes(normalizedQuery) ||
      sys.id.toLowerCase().includes(normalizedQuery)
  ).slice(0, 4);

  // Search Structures
  const matchedStructures = normalizedQuery
    ? catalogRepo.search(normalizedQuery).slice(0, 6)
    : catalogRepo.all.slice(0, 4);

  // Search Exams
  const matchedExams = exams
    .filter(
      (exam) =>
        !normalizedQuery ||
        exam.title.toLowerCase().includes(normalizedQuery) ||
        (exam.description && exam.description.toLowerCase().includes(normalizedQuery))
    )
    .slice(0, 4);

  // Flattened items for keyboard navigation
  type SearchItem =
    | { type: 'system'; data: AnatomySystemInfo }
    | { type: 'structure'; data: AnatomyStructure }
    | { type: 'exam'; data: AnatomyExam }
    | { type: 'action'; label: string; action: () => void; icon: any };

  const allItems: SearchItem[] = [
    ...matchedSystems.map((s) => ({ type: 'system' as const, data: s })),
    ...matchedStructures.map((st) => ({ type: 'structure' as const, data: st })),
    ...matchedExams.map((e) => ({ type: 'exam' as const, data: e })),
    {
      type: 'action' as const,
      label: 'Psychologie des Couleurs & Lois UX (Jakob, Fitts, Proximité)',
      action: () => {
        onClose();
        onOpenUxModal();
      },
      icon: Palette,
    },
  ];

  const handleSelectItem = (item: SearchItem) => {
    if (item.type === 'system') {
      onSelectSystem(item.data.id);
    } else if (item.type === 'structure') {
      onSelectStructure(item.data);
    } else if (item.type === 'exam') {
      onSelectExam(item.data);
    } else if (item.type === 'action') {
      item.action();
      return;
    }
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (allItems.length === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % allItems.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + allItems.length) % allItems.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (allItems[selectedIndex]) {
        handleSelectItem(allItems[selectedIndex]);
      }
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Recherche globale"
      className="fixed inset-0 z-50 flex items-start justify-center p-3 sm:p-6 pt-16 sm:pt-24 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-[#161C24] border border-[#323B46] rounded-2xl shadow-2xl overflow-hidden flex flex-col text-[#FAF6F0] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        {/* Search Input Bar (Jakob's Law: standard search input at top) */}
        <div className="relative flex items-center px-4 py-3.5 border-b border-[#323B46] bg-[#1E242C]">
          <Search className="w-5 h-5 text-[#DACBA9] shrink-0 mr-3" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Rechercher un organe, un système (ex: Cœur, Foie, Squelettique), un examen..."
            className="w-full bg-transparent text-sm sm:text-base text-[#FAF6F0] placeholder-[#8F9CAE] focus:outline-none"
          />
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery('');
                inputRef.current?.focus();
              }}
              className="p-1 rounded-lg text-[#8F9CAE] hover:text-[#FAF6F0] hover:bg-[#2A323D] transition mr-2"
              title="Effacer la recherche"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-flex items-center gap-0.5 px-2 py-1 rounded bg-[#15191E] border border-[#323B46] text-[10px] font-mono text-[#BAC3CE]">
            ESC
          </kbd>
        </div>

        {/* Search Results Body */}
        <div className="max-h-[65vh] overflow-y-auto p-3 space-y-4 divide-y divide-[#263140]/60">
          {/* Quick UX & PaletteVault action */}
          <div className="pt-1">
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenUxModal();
              }}
              className="w-full min-h-[46px] p-3 rounded-xl bg-gradient-to-r from-[#232C3A] to-[#1E242C] border border-[#384659] hover:border-[#DACBA9] flex items-center justify-between transition cursor-pointer text-left group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#DACBA9]/20 text-[#DACBA9] flex items-center justify-center shrink-0">
                  <Palette className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs sm:text-sm font-bold text-[#FAF6F0] group-hover:text-[#ECE3D9] transition">
                    Psychologie des Couleurs & Lois UX
                  </div>
                  <div className="text-[11px] text-[#BAC3CE]">
                    Loi de Jakob, Fitts, Proximité, Figure-Fond, Clôture et règle 60-30-10
                  </div>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-[#DACBA9] group-hover:translate-x-1 transition shrink-0" />
            </button>
          </div>

          {/* Anatomical Systems */}
          {matchedSystems.length > 0 && (
            <div className="pt-3">
              <div className="text-[11px] font-bold uppercase tracking-wider text-[#DACBA9] px-2 mb-2 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5" />
                <span>Systèmes anatomiques ({matchedSystems.length})</span>
              </div>
              <div className="space-y-1">
                {matchedSystems.map((sys) => (
                  <button
                    key={sys.id}
                    type="button"
                    onClick={() => {
                      onSelectSystem(sys.id);
                      onClose();
                    }}
                    className="w-full min-h-[44px] px-3 py-2 rounded-xl hover:bg-[#232C3A] text-left flex items-center justify-between transition cursor-pointer group"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-[#15191E] border border-[#323B46] text-[#DACBA9] flex items-center justify-center text-xs">
                        🦴
                      </div>
                      <div>
                        <div className="text-xs sm:text-sm font-semibold text-[#FAF6F0] group-hover:text-[#ECE3D9]">
                          {sys.nameFr}
                        </div>
                        <div className="text-[11px] text-[#8F9CAE]">{sys.nameEn}</div>
                      </div>
                    </div>
                    <span className="text-[11px] px-2 py-0.5 rounded bg-[#15191E] text-[#BAC3CE] border border-[#323B46] group-hover:border-[#DACBA9]">
                      Ouvrir dans l'Atlas 3D
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Anatomical Structures & Organs */}
          {matchedStructures.length > 0 && (
            <div className="pt-3">
              <div className="text-[11px] font-bold uppercase tracking-wider text-sky-400 px-2 mb-2 flex items-center gap-1.5">
                <Box className="w-3.5 h-3.5" />
                <span>Structures & Organes certifiés FMA/UBERON ({matchedStructures.length})</span>
              </div>
              <div className="space-y-1">
                {matchedStructures.map((st) => (
                  <button
                    key={st.id}
                    type="button"
                    onClick={() => {
                      onSelectStructure(st);
                      onClose();
                    }}
                    className="w-full min-h-[44px] px-3 py-2 rounded-xl hover:bg-[#232C3A] text-left flex items-center justify-between transition cursor-pointer group"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-7 h-7 rounded-lg bg-[#15191E] border border-[#323B46] text-sky-300 flex items-center justify-center text-xs shrink-0">
                        {st.meshAvailable ? '3D' : 'KG'}
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs sm:text-sm font-semibold text-[#FAF6F0] truncate group-hover:text-sky-200">
                          {st.nameFr}{' '}
                          <span className="text-[11px] text-[#8F9CAE] font-normal">
                            ({st.nameEn})
                          </span>
                        </div>
                        <div className="text-[11px] text-[#8F9CAE] truncate font-mono">
                          {st.id} · Système {st.system}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      {st.meshAvailable && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-sky-950/60 border border-sky-600/40 text-sky-300 font-semibold">
                          Modèle 3D prêt
                        </span>
                      )}
                      <ArrowRight className="w-3.5 h-3.5 text-[#BAC3CE] group-hover:text-[#FAF6F0] group-hover:translate-x-0.5 transition" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Exams & Assessments */}
          {matchedExams.length > 0 && (
            <div className="pt-3">
              <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 px-2 mb-2 flex items-center gap-1.5">
                <GraduationCap className="w-3.5 h-3.5" />
                <span>Examens & Évaluations Cliniques ({matchedExams.length})</span>
              </div>
              <div className="space-y-1">
                {matchedExams.map((exam) => (
                  <button
                    key={exam.id}
                    type="button"
                    onClick={() => {
                      onSelectExam(exam);
                      onClose();
                    }}
                    className="w-full min-h-[44px] px-3 py-2 rounded-xl hover:bg-[#232C3A] text-left flex items-center justify-between transition cursor-pointer group"
                  >
                    <div className="min-w-0">
                      <div className="text-xs sm:text-sm font-semibold text-[#FAF6F0] truncate group-hover:text-emerald-300">
                        {exam.title}
                      </div>
                      <div className="text-[11px] text-[#8F9CAE] truncate">
                        {exam.questions.length} questions · {exam.durationMinutes} min
                      </div>
                    </div>
                    <span className="text-[11px] px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-300 border border-emerald-600/40 shrink-0">
                      Lancer
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer (Fitts's Law + Proximity: helper shortcuts) */}
        <div className="px-4 py-2.5 bg-[#15191E] border-t border-[#323B46] text-[11px] text-[#8F9CAE] flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <span>
              <kbd className="px-1.5 py-0.5 rounded bg-[#1E242C] border border-[#323B46] text-[#BAC3CE] font-mono mr-1">
                ↑
              </kbd>
              <kbd className="px-1.5 py-0.5 rounded bg-[#1E242C] border border-[#323B46] text-[#BAC3CE] font-mono mr-1">
                ↓
              </kbd>
              Naviguer
            </span>
            <span>
              <kbd className="px-1.5 py-0.5 rounded bg-[#1E242C] border border-[#323B46] text-[#BAC3CE] font-mono mr-1">
                ↵
              </kbd>
              Sélectionner
            </span>
          </div>
          <span className="text-[#DACBA9]">Conforme à la Loi de Jakob & Psychologie PaletteVault</span>
        </div>
      </div>
    </div>
  );
}
