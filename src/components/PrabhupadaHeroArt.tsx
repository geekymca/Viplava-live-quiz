import React from 'react';

interface PrabhupadaHeroArtProps {
  className?: string;
}

export const PrabhupadaHeroArt: React.FC<PrabhupadaHeroArtProps> = ({ className = '' }) => {
  return (
    <div className={`relative w-full h-full min-h-[420px] sm:min-h-[500px] flex items-center justify-center overflow-hidden ${className}`}>
      {/* Background Sacred Sunset Gradient */}
      <div className="absolute inset-0 bg-gradient-to-tr from-[#071329] via-[#21153D]/90 to-[#4a2612]/60 -z-10" />

      {/* Decorative Golden Mandala Glow behind portrait */}
      <div className="absolute right-4 sm:right-12 top-1/2 -translate-y-1/2 w-[340px] sm:w-[480px] h-[340px] sm:h-[480px] rounded-full bg-gradient-to-tr from-[#F39B37]/20 via-[#E8B957]/15 to-transparent blur-2xl pointer-events-none" />

      {/* SVG Canvas Art representing Srila Prabhupada with Sacred Books & Temple Spires */}
      <div className="relative w-full max-w-xl h-[420px] sm:h-[520px] flex items-center justify-center">
        <svg
          viewBox="0 0 600 600"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full object-contain filter drop-shadow-[0_15px_35px_rgba(0,0,0,0.6)]"
        >
          {/* Temple Skyline Silhouettes in Sunset */}
          <g opacity="0.35" fill="#E8B957">
            {/* Left Temple Spires */}
            <path d="M40 380 L60 280 L70 240 L80 280 L100 380 Z" />
            <path d="M85 390 L110 260 L125 210 L140 260 L165 390 Z" />
            <path d="M150 400 L180 300 L195 250 L210 300 L240 400 Z" />
            {/* Right Temple Spires */}
            <path d="M460 380 L480 270 L495 220 L510 270 L530 380 Z" />
            <path d="M515 390 L535 290 L545 240 L555 290 L575 390 Z" />
          </g>

          {/* Golden Sun / Halo Aura */}
          <circle cx="340" cy="240" r="170" fill="url(#haloGrad)" opacity="0.85" />
          <circle cx="340" cy="240" r="160" stroke="#E8B957" strokeWidth="1" strokeDasharray="6 6" opacity="0.4" />

          {/* Majestic Portrait Silhouette & Shading of His Divine Grace */}
          <g>
            {/* Shoulders & Saffron Silk Shawl / Robes */}
            <path
              d="M170 560 C180 430 230 380 340 380 C450 380 500 430 520 560 Z"
              fill="url(#saffronRobe)"
            />
            {/* Saffron Robe folds and drapery */}
            <path
              d="M210 560 C230 470 280 420 340 420 C400 420 450 470 480 560"
              stroke="#D97706"
              strokeWidth="4"
              opacity="0.6"
            />
            {/* Fresh Rose & Jasmine Garland (Mala) */}
            <path
              d="M245 420 C270 530 410 530 435 420"
              stroke="url(#garlandRed)"
              strokeWidth="22"
              strokeLinecap="round"
            />
            <path
              d="M245 420 C270 530 410 530 435 420"
              stroke="#FFF4D8"
              strokeWidth="6"
              strokeDasharray="14 14"
              strokeLinecap="round"
            />

            {/* Head & Neck */}
            <path
              d="M305 385 L305 340 C280 330 255 280 260 215 C265 150 310 110 350 110 C395 110 435 150 435 220 C435 285 410 330 380 340 L380 385 Z"
              fill="url(#skinTone)"
            />

            {/* Noble Facial Features */}
            {/* Forehead Urdhva Pundra Tilak */}
            <path
              d="M338 140 L338 190 A8 8 0 0 0 354 190 L354 140"
              stroke="#FFF4D8"
              strokeWidth="4"
              fill="none"
            />
            <line x1="346" y1="145" x2="346" y2="200" stroke="#DC2626" strokeWidth="2.5" />
            <circle cx="346" cy="208" r="3.5" fill="#16A34A" />

            {/* Peaceful, Wise Compassionate Eyes looking upwards */}
            <path d="M305 210 Q325 204 335 214" stroke="#451A03" strokeWidth="3" fill="none" strokeLinecap="round" />
            <path d="M358 214 Q368 204 388 210" stroke="#451A03" strokeWidth="3" fill="none" strokeLinecap="round" />
            <circle cx="323" cy="210" r="3" fill="#1C1917" />
            <circle cx="370" cy="210" r="3" fill="#1C1917" />

            {/* Noble Nose & Contours */}
            <path d="M346 195 Q348 235 342 245 Q346 250 352 245" stroke="#9A3412" strokeWidth="2.5" fill="none" />

            {/* Gentle, Serene Transcendental Smile */}
            <path d="M330 268 Q346 276 364 268" stroke="#7C2D12" strokeWidth="3" fill="none" strokeLinecap="round" />

            {/* Ears with traditional sacred earlobes */}
            <path d="M260 220 C252 235 252 260 262 270" stroke="#C2410C" strokeWidth="3.5" fill="none" />
            <path d="M432 220 C440 235 440 260 430 270" stroke="#C2410C" strokeWidth="3.5" fill="none" />

            {/* Classical Vaishnava Kantha Mala (Neck Beads) */}
            <path d="M298 348 Q344 365 388 348" stroke="#78350F" strokeWidth="6" strokeDasharray="7 5" fill="none" />
            <path d="M295 358 Q344 378 392 358" stroke="#78350F" strokeWidth="6" strokeDasharray="7 5" fill="none" />
          </g>

          {/* Sacred Transcendental Books Stack on Right */}
          <g transform="translate(410, 390)">
            {/* Bhagavad-gita As It Is */}
            <g transform="translate(0, 0)">
              <rect x="0" y="0" width="165" height="38" rx="5" fill="#78350F" stroke="#E8B957" strokeWidth="1.5" />
              <text x="82" y="16" fill="#FFF4D8" fontSize="10" fontFamily="'Cinzel', serif" fontWeight="bold" textAnchor="middle">
                BHAGAVAD-GITA
              </text>
              <text x="82" y="28" fill="#E8B957" fontSize="8" fontFamily="'Plus Jakarta Sans', sans-serif" fontWeight="bold" textAnchor="middle">
                AS IT IS
              </text>
            </g>
            {/* Srimad Bhagavatam */}
            <g transform="translate(10, 42)">
              <rect x="0" y="0" width="165" height="38" rx="5" fill="#581C87" stroke="#E8B957" strokeWidth="1.5" />
              <text x="82" y="16" fill="#FFF4D8" fontSize="10" fontFamily="'Cinzel', serif" fontWeight="bold" textAnchor="middle">
                SRIMAD
              </text>
              <text x="82" y="28" fill="#E8B957" fontSize="8" fontFamily="'Plus Jakarta Sans', sans-serif" fontWeight="bold" textAnchor="middle">
                BHAGAVATAM
              </text>
            </g>
            {/* Caitanya Caritamrita */}
            <g transform="translate(5, 84)">
              <rect x="0" y="0" width="165" height="38" rx="5" fill="#064E3B" stroke="#E8B957" strokeWidth="1.5" />
              <text x="82" y="16" fill="#FFF4D8" fontSize="10" fontFamily="'Cinzel', serif" fontWeight="bold" textAnchor="middle">
                CAITANYA
              </text>
              <text x="82" y="28" fill="#E8B957" fontSize="8" fontFamily="'Plus Jakarta Sans', sans-serif" fontWeight="bold" textAnchor="middle">
                CARITAMRITA
              </text>
            </g>
          </g>

          {/* Gradients */}
          <defs>
            <radialGradient id="haloGrad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#FFF4D8" stopOpacity="0.8" />
              <stop offset="40%" stopColor="#E8B957" stopOpacity="0.4" />
              <stop offset="80%" stopColor="#F39B37" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#21153D" stopOpacity="0" />
            </radialGradient>
            <linearGradient id="saffronRobe" x1="170" y1="380" x2="520" y2="560" gradientUnits="userSpaceOnUse">
              <stop stopColor="#F39B37" />
              <stop offset="0.5" stopColor="#EA580C" />
              <stop offset="1" stopColor="#9A3412" />
            </linearGradient>
            <linearGradient id="garlandRed" x1="245" y1="420" x2="435" y2="530" gradientUnits="userSpaceOnUse">
              <stop stopColor="#991B1B" />
              <stop offset="0.5" stopColor="#DC2626" />
              <stop offset="1" stopColor="#7F1D1D" />
            </linearGradient>
            <linearGradient id="skinTone" x1="300" y1="120" x2="400" y2="380" gradientUnits="userSpaceOnUse">
              <stop stopColor="#FEF3C7" />
              <stop offset="0.6" stopColor="#FDE68A" />
              <stop offset="1" stopColor="#F59E0B" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    </div>
  );
};
