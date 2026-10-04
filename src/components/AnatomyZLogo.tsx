import React from 'react';

interface AnatomyZLogoProps {
  className?: string;
  size?: number;
  rounded?: string;
}

export const AnatomyZLogo: React.FC<AnatomyZLogoProps> = ({
  className = 'w-8 h-8',
  size,
  rounded = 'rounded-xl',
}) => {
  return (
    <div
      style={size ? { width: size, height: size } : undefined}
      className={`relative shrink-0 overflow-hidden ${rounded} bg-[#DACBA8] shadow-xs ${className}`}
    >
      <img
        src="/icon.png"
        alt="Logo officiel AnatomyZ"
        className="w-full h-full object-cover block select-none pointer-events-none"
        loading="eager"
      />
    </div>
  );
};
