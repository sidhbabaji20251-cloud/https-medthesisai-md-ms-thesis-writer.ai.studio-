import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const YadavThesisLogo: React.FC<LogoProps> = ({ size = 'md', className = '' }) => {
  const dimensions =
    size === 'sm'
      ? 'w-11 h-11'
      : size === 'lg'
        ? 'w-16 h-16'
        : size === 'xl'
          ? 'w-20 h-20'
          : 'w-13 h-13';

  return (
    <div
      className={`relative inline-flex items-center justify-center rounded-2xl p-0.5 bg-gradient-to-br from-yellow-300 via-red-600 to-blue-950 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 shrink-0 ring-2 ring-amber-400/90 ${dimensions} ${className}`}
      title="Yadav MD/MS Thesis Studio — Courtesy : Prof R S Yadav Biochemistry NIMS Jaipur"
    >
      <div className="w-full h-full rounded-[14px] bg-gradient-to-br from-blue-950 via-indigo-950 to-red-950 flex items-center justify-center overflow-hidden relative">
        <svg
          viewBox="0 0 120 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full p-0.5"
        >
          <defs>
            <linearGradient id="imperialGold" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fef08a" />
              <stop offset="35%" stopColor="#facc15" />
              <stop offset="70%" stopColor="#d97706" />
              <stop offset="100%" stopColor="#fef08a" />
            </linearGradient>
            <linearGradient id="royalRed" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ef4444" />
              <stop offset="50%" stopColor="#dc2626" />
              <stop offset="100%" stopColor="#991b1b" />
            </linearGradient>
            <linearGradient id="oxfordNavy" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1e40af" />
              <stop offset="50%" stopColor="#1e3a8a" />
              <stop offset="100%" stopColor="#172554" />
            </linearGradient>
            <linearGradient id="parchmentPages" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#fef9c3" />
              <stop offset="50%" stopColor="#ffffff" />
              <stop offset="100%" stopColor="#e0f2fe" />
            </linearGradient>
            <radialGradient id="centerGlow" cx="50%" cy="45%" r="50%">
              <stop offset="0%" stopColor="#fde047" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#1e3a8a" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Subtle Golden Backlight Glow */}
          <circle cx="60" cy="54" r="48" fill="url(#centerGlow)" />

          {/* Outer Imperial Medallion Ring */}
          <circle
            cx="60"
            cy="60"
            r="56"
            stroke="url(#imperialGold)"
            strokeWidth="2.5"
            fill="none"
          />
          <circle
            cx="60"
            cy="60"
            r="51.5"
            stroke="#38bdf8"
            strokeWidth="1"
            strokeDasharray="3 2"
            opacity="0.85"
          />

          {/* Golden Laurel Wreath Left & Right */}
          <path
            d="M26 88 C11 70, 11 40, 29 22"
            stroke="url(#imperialGold)"
            strokeWidth="2.8"
            strokeLinecap="round"
            fill="none"
          />
          <path
            d="M94 88 C109 70, 109 40, 91 22"
            stroke="url(#imperialGold)"
            strokeWidth="2.8"
            strokeLinecap="round"
            fill="none"
          />
          {/* Left Laurel Leaves */}
          <ellipse cx="16" cy="72" rx="5.2" ry="2.4" transform="rotate(-40 16 72)" fill="url(#imperialGold)" />
          <ellipse cx="13" cy="58" rx="5.2" ry="2.4" transform="rotate(-20 13 58)" fill="url(#imperialGold)" />
          <ellipse cx="15" cy="43" rx="5.2" ry="2.4" transform="rotate(5 15 43)" fill="url(#imperialGold)" />
          <ellipse cx="21" cy="30" rx="5.2" ry="2.4" transform="rotate(28 21 30)" fill="url(#imperialGold)" />
          {/* Right Laurel Leaves */}
          <ellipse cx="104" cy="72" rx="5.2" ry="2.4" transform="rotate(40 104 72)" fill="url(#imperialGold)" />
          <ellipse cx="107" cy="58" rx="5.2" ry="2.4" transform="rotate(20 107 58)" fill="url(#imperialGold)" />
          <ellipse cx="105" cy="43" rx="5.2" ry="2.4" transform="rotate(-5 105 43)" fill="url(#imperialGold)" />
          <ellipse cx="99" cy="30" rx="5.2" ry="2.4" transform="rotate(-28 99 30)" fill="url(#imperialGold)" />

          {/* Royal Heraldic Shield (Split Red & Dark Blue for Medical & Biochemistry Excellence) */}
          <path
            d="M28 25 L92 25 L92 58 C92 80, 60 95, 60 95 C60 95, 28 80, 28 58 Z"
            fill="url(#oxfordNavy)"
            stroke="url(#imperialGold)"
            strokeWidth="3.2"
          />
          {/* Left Half Shield in Royal Crimson Red */}
          <path
            d="M29.5 26.5 L60 26.5 L60 93.2 C55 90, 29.5 77.5, 29.5 58 Z"
            fill="url(#royalRed)"
          />
          {/* Gold Shield Divider Line */}
          <line x1="60" y1="25" x2="60" y2="94" stroke="url(#imperialGold)" strokeWidth="1.6" opacity="0.85" />

          {/* Biochemistry Hexagonal Ring Pattern (Subtle Scientific Motif in Shield) */}
          <polygon
            points="43,36 49,39.5 49,46.5 43,50 37,46.5 37,39.5"
            stroke="#fef08a"
            strokeWidth="1.2"
            fill="none"
            opacity="0.65"
          />
          <polygon
            points="77,36 83,39.5 83,46.5 77,50 71,46.5 71,39.5"
            stroke="#38bdf8"
            strokeWidth="1.2"
            fill="none"
            opacity="0.75"
          />

          {/* Top Sovereign Academic Mortarboard Cap */}
          <polygon
            points="60,6 84,15 60,24 36,15"
            fill="url(#imperialGold)"
            stroke="#78350f"
            strokeWidth="1.1"
          />
          <path d="M46 19 L46 24 C52 26.5, 68 26.5, 74 24 L74 19" fill="#b91c1c" stroke="url(#imperialGold)" strokeWidth="1" />
          <line x1="79" y1="16.5" x2="83" y2="27" stroke="#fde047" strokeWidth="2" strokeLinecap="round" />
          <circle cx="83" cy="28.5" r="2.3" fill="#ef4444" stroke="#fef08a" strokeWidth="0.8" />

          {/* Open Medical Dissertation Book (Tome of Knowledge) */}
          <path
            d="M34 59 Q47 53 60 59 Q73 53 86 59 L86 77 Q73 71 60 77 Q47 71 34 77 Z"
            fill="url(#parchmentPages)"
            stroke="#1e3a8a"
            strokeWidth="1.6"
          />
          <line x1="60" y1="59" x2="60" y2="77" stroke="#dc2626" strokeWidth="1.8" />
          {/* Manuscript Lines Left (Red) & Right (Dark Blue) */}
          <line x1="39" y1="64" x2="55" y2="64" stroke="#dc2626" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="39" y1="68.5" x2="53" y2="68.5" stroke="#1e3a8a" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="39" y1="73" x2="51" y2="73" stroke="#dc2626" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="65" y1="64" x2="81" y2="64" stroke="#1e3a8a" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="65" y1="68.5" x2="79" y2="68.5" stroke="#dc2626" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="65" y1="73" x2="77" y2="73" stroke="#1e3a8a" strokeWidth="1.5" strokeLinecap="round" />

          {/* Central Golden Caduceus & Biochemistry DNA Helix Staff */}
          <line x1="60" y1="28" x2="60" y2="76" stroke="url(#imperialGold)" strokeWidth="3.2" strokeLinecap="round" />
          <circle cx="60" cy="27.5" r="4" fill="#fde047" stroke="#991b1b" strokeWidth="1.2" />

          {/* Golden Wings of Asclepius */}
          <path
            d="M58 34 C46 27, 36 31, 34 39 C41 39, 49 38, 58 40 Z"
            fill="url(#imperialGold)"
          />
          <path
            d="M62 34 C74 27, 84 31, 86 39 C79 39, 71 38, 62 40 Z"
            fill="url(#imperialGold)"
          />

          {/* Intertwined DNA / Serpent Strands */}
          <path
            d="M51 55 C69 49, 51 42, 68 36"
            stroke="#fef08a"
            strokeWidth="2.3"
            strokeLinecap="round"
            fill="none"
          />
          <path
            d="M69 55 C51 49, 69 42, 52 36"
            stroke="#38bdf8"
            strokeWidth="2.3"
            strokeLinecap="round"
            fill="none"
          />

          {/* Bottom Royal Crimson & Dark Blue Ribbon Banner */}
          <rect
            x="14"
            y="95"
            width="92"
            height="17"
            rx="5"
            fill="url(#royalRed)"
            stroke="url(#imperialGold)"
            strokeWidth="2"
          />
          <text
            x="60"
            y="106.5"
            textAnchor="middle"
            fill="#fef08a"
            fontSize="9.8"
            fontWeight="900"
            fontFamily="serif"
            letterSpacing="0.9"
          >
            YADAV MD/MS
          </text>
        </svg>
      </div>
    </div>
  );
};
