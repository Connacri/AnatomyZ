import React from 'react';

interface AnatomyZLogoProps {
  className?: string;
  size?: number;
  variant?: 'full' | 'icon' | 'badge';
}

export const AnatomyZLogo: React.FC<AnatomyZLogoProps> = ({
  className = 'w-8 h-8',
  size,
}) => {
  return (
    <div
      style={size ? { width: size, height: size } : undefined}
      className={`relative shrink-0 overflow-hidden rounded-xl border border-[#D8CCBF]/50 shadow-sm bg-[#15191E] ${className}`}
    >
      <img
        src="/icon.png"
        alt="Logo officiel AnatomyZ"
        className="w-full h-full object-cover select-none pointer-events-none"
        loading="eager"
      />
    </div>
  );
};
