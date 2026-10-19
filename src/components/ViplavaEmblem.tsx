import React from 'react';

interface ViplavaEmblemProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showSubtitle?: boolean;
  className?: string;
}

export const ViplavaEmblem: React.FC<ViplavaEmblemProps> = ({
  size = 'md',
  showSubtitle = true,
  className = '',
}) => {
  const isSm = size === 'sm';
  const isLg = size === 'lg';
  const isXl = size === 'xl';

  return (
    <div className={`flex flex-col items-center select-none text-center ${className}`}>
      {/* Sacred Golden Lotus Icon */}
      <div
        className={`relative flex items-center justify-center transition-transform ${
          isSm ? 'w-6 h-6 mb-1' : isLg ? 'w-16 h-16 mb-2.5' : isXl ? 'w-20 h-20 mb-3' : 'w-10 h-10 mb-1.5'
        }`}
      >
        <svg
          viewBox="0 0 100 80"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full drop-shadow-[0_2px_12px_rgba(232,185,87,0.45)]"
        >
          {/* Central Sacred Lotus Petal */}
          <path
            d="M50 5 C45 28 35 48 50 72 C65 48 55 28 50 5 Z"
            fill="url(#goldGrad)"
            stroke="#FFF4D8"
            strokeWidth="1.5"
          />
          {/* Left Main Petal */}
          <path
            d="M50 72 C30 68 12 52 18 32 C30 40 42 56 50 72 Z"
            fill="url(#goldGrad)"
            stroke="#FFF4D8"
            strokeWidth="1.2"
          />
          {/* Right Main Petal */}
          <path
            d="M50 72 C70 68 88 52 82 32 C70 40 58 56 50 72 Z"
            fill="url(#goldGrad)"
            stroke="#FFF4D8"
            strokeWidth="1.2"
          />
          {/* Outer Left Small Petal */}
          <path
            d="M50 72 C25 76 5 66 8 50 C20 54 38 64 50 72 Z"
            fill="url(#goldGradSubtle)"
            stroke="#E8B957"
            strokeWidth="1"
          />
          {/* Outer Right Small Petal */}
          <path
            d="M50 72 C75 76 95 66 92 50 C80 54 62 64 50 72 Z"
            fill="url(#goldGradSubtle)"
            stroke="#E8B957"
            strokeWidth="1"
          />
          {/* Base Calyx Ring */}
          <ellipse cx="50" cy="73" rx="14" ry="3.5" fill="#E8B957" />

          <defs>
            <linearGradient id="goldGrad" x1="50" y1="5" x2="50" y2="72" gradientUnits="userSpaceOnUse">
              <stop stopColor="#FFF4D8" />
              <stop offset="0.45" stopColor="#E8B957" />
              <stop offset="1" stopColor="#B37D22" />
            </linearGradient>
            <linearGradient id="goldGradSubtle" x1="50" y1="30" x2="50" y2="72" gradientUnits="userSpaceOnUse">
              <stop stopColor="#E8B957" />
              <stop offset="1" stopColor="#8A5A12" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Brand Text */}
      <div className="flex flex-col items-center">
        <h1
          className={`font-['Cinzel',serif] tracking-[0.22em] font-extrabold uppercase bg-gradient-to-r from-[#FFF4D8] via-[#E8B957] to-[#F39B37] bg-clip-text text-transparent ${
            isSm ? 'text-xs' : isLg ? 'text-2xl sm:text-3xl' : isXl ? 'text-3xl sm:text-4xl' : 'text-base sm:text-lg'
          }`}
        >
          VIPLAVA
        </h1>

        <div className="flex items-center gap-2 mt-0.5">
          <span className="w-3 sm:w-5 h-[1px] bg-gradient-to-r from-transparent to-[#E8B957]/80" />
          <span
            className={`font-['Cinzel',serif] tracking-[0.3em] font-bold text-[#E8B957] ${
              isSm ? 'text-[9px]' : isLg ? 'text-xs sm:text-sm' : isXl ? 'text-sm' : 'text-[10px] sm:text-xs'
            }`}
          >
            2026
          </span>
          <span className="w-3 sm:w-5 h-[1px] bg-gradient-to-l from-transparent to-[#E8B957]/80" />
        </div>

        {showSubtitle && (
          <span
            className={`font-['Plus_Jakarta_Sans',sans-serif] tracking-[0.25em] uppercase font-bold text-[#FFF4D8]/80 mt-0.5 ${
              isSm ? 'text-[7px]' : isLg ? 'text-[11px]' : isXl ? 'text-xs' : 'text-[9px]'
            }`}
          >
            ISKCON
          </span>
        )}
      </div>
    </div>
  );
};
