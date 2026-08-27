import React from 'react';

interface PragyaLogoProps {
  variant?: 'full' | 'horizontal' | 'compact' | 'icon';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  isDark?: boolean;
}

export const PragyaLogo: React.FC<PragyaLogoProps> = ({
  variant = 'horizontal',
  size = 'md',
  className = '',
  isDark = true,
}) => {
  // Dimension mappings
  const iconSizes = {
    xs: 'w-6 h-6',
    sm: 'w-8 h-8',
    md: 'w-9 h-9',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  };

  const textSizes = {
    xs: 'text-sm',
    sm: 'text-base',
    md: 'text-xl',
    lg: 'text-2xl sm:text-3xl',
    xl: 'text-3xl sm:text-4xl',
  };

  const subtextSizes = {
    xs: 'text-[8px]',
    sm: 'text-[9px]',
    md: 'text-[10px]',
    lg: 'text-xs',
    xl: 'text-sm',
  };

  // Folded Golden Sacred Geometry / Yogi Monogram Icon
  const PragyaIcon = (
    <div className={`${iconSizes[size]} shrink-0 relative flex items-center justify-center`}>
      <svg
        viewBox="0 0 100 100"
        className="w-full h-full drop-shadow-[0_2px_8px_rgba(217,174,41,0.4)] text-[#D9AE29]"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="pragyaGold" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FDE047" />
            <stop offset="50%" stopColor="#D9AE29" />
            <stop offset="100%" stopColor="#B45309" />
          </linearGradient>
        </defs>

        {/* Outer Sacred Triangle */}
        <polygon
          points="50,12 88,82 12,82"
          stroke="url(#pragyaGold)"
          strokeWidth="7"
          strokeLinejoin="round"
        />

        {/* Inner Ascending Apex */}
        <polygon
          points="50,42 70,82 30,82"
          fill="url(#pragyaGold)"
          fillOpacity="0.25"
          stroke="url(#pragyaGold)"
          strokeWidth="5"
          strokeLinejoin="round"
        />

        {/* Central Axis (Sushumna Nadi Plumb Line) */}
        <line
          x1="50"
          y1="12"
          x2="50"
          y2="82"
          stroke="url(#pragyaGold)"
          strokeWidth="5"
          strokeLinecap="round"
        />

        {/* Central Bindu Dot */}
        <circle cx="50" cy="50" r="3.5" fill="#FFFBEB" />
      </svg>
    </div>
  );

  if (variant === 'icon') {
    return (
      <div className={`inline-flex items-center justify-center ${className}`}>
        {PragyaIcon}
      </div>
    );
  }

  // PRAGYA in capital and 3d verse in small
  return (
    <div className={`inline-flex items-center gap-2.5 sm:gap-3 ${className} select-none`}>
      {PragyaIcon}

      <div className="flex flex-col justify-center">
        {/* Main Title: PRAGYA in Capital */}
        <span
          className={`font-display font-black tracking-wider ${textSizes[size]} text-[#D9AE29] leading-none drop-shadow-sm`}
        >
          PRAGYA
        </span>

        {/* Subtitle: 3d verse in small as it was before */}
        <span
          className={`font-mono font-bold tracking-[0.25em] ${subtextSizes[size]} text-[#e5c158]/90 leading-none mt-1 lowercase`}
        >
          3d verse
        </span>
      </div>
    </div>
  );
};
