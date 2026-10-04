import React, { useEffect, useState } from 'react';
import { AnatomyZLogo } from './AnatomyZLogo';
import splashUrl from '../assets/images/anatomyz_splash_1791101122723.jpg';
import { Sparkles, X } from 'lucide-react';

interface SplashScreenProps {
  onDismiss: () => void;
  autoClose?: boolean;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({
  onDismiss,
  autoClose = true,
}) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const start = Date.now();
    const duration = 1800;
    const interval = setInterval(() => {
      const elapsed = Date.now() - start;
      const pct = Math.min(100, Math.round((elapsed / duration) * 100));
      setProgress(pct);
      if (pct >= 100) {
        clearInterval(interval);
        if (autoClose) {
          setTimeout(onDismiss, 200);
        }
      }
    }, 40);

    return () => clearInterval(interval);
  }, [autoClose, onDismiss]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-between p-8 bg-[#ECE3D9] text-[#1E242C] select-none animate-in fade-in duration-300">
      <div className="w-full flex justify-end">
        <button
          type="button"
          onClick={onDismiss}
          className="p-2 rounded-full text-[#646D79] hover:bg-black/5 transition cursor-pointer"
          title="Passer l'introduction"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex flex-col items-center text-center max-w-sm px-4">
        {/* Anatomical Head Logo with seamless integration */}
        <div className="relative mb-6">
          <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-3xl overflow-hidden shadow-2xl bg-[#DACBA8] flex items-center justify-center">
            <img
              src={splashUrl}
              alt="Splash AnatomyZ"
              className="w-full h-full object-cover block"
            />
          </div>
          <span className="absolute -bottom-2 -right-2 px-2.5 py-1 rounded-full bg-[#646D79] text-[#FAF6F0] text-[10px] font-bold tracking-wider uppercase shadow-md">
            Atlas 3D
          </span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#1E242C]">
          AnatomyZ
        </h1>
        <p className="text-sm font-medium text-[#646D79] mt-2">
          Atlas anatomique humain 3D & Knowledge Graph
        </p>
        <p className="text-xs text-[#8C97A5] mt-1">
          Faculté de Médecine · Professeur Zenasni Kamel
        </p>

        {/* Minimalist progress bar */}
        <div className="w-48 sm:w-60 h-1.5 bg-[#D8CCBF] rounded-full overflow-hidden mt-8">
          <div
            className="h-full bg-[#646D79] rounded-full transition-all duration-150 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        <span className="text-[11px] font-mono text-[#8C97A5] mt-2 tabular-nums">
          Initialisation du moteur 3D… {progress}%
        </span>
      </div>

      <div className="text-center text-xs text-[#8C97A5]">
        <span>Ontologies FMA / UBERON · Modèles GLB vérifiés</span>
      </div>
    </div>
  );
};
