import React from 'react';

interface StethoscopeIllustrationProps {
  className?: string;
  width?: number | string;
  height?: number | string;
}

export const StethoscopeIllustration: React.FC<StethoscopeIllustrationProps> = ({
  className = '',
  width = 240,
  height = 160,
}) => {
  return (
    <div className={`relative flex items-center justify-center select-none pointer-events-none ${className}`}>
      <svg
        width={width}
        height={height}
        viewBox="0 0 320 240"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="overflow-visible"
      >
        {/* --- LIGHT BLUE BINAURAL METAL TUBES --- */}
        {/* Left Tube */}
        <path
          d="M 119 46 C 104 46, 92 56, 92 70 C 92 88, 102 108, 107 122"
          stroke="#B9D8F2"
          strokeWidth="7.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />

        {/* Right Tube */}
        <path
          d="M 153 46 C 168 46, 180 56, 180 70 C 180 88, 170 108, 165 122"
          stroke="#B9D8F2"
          strokeWidth="7.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />

        {/* --- EARPIECES (BLACK CAPSULES WITH WHITE HIGHLIGHTS) --- */}
        {/* Left Earpiece */}
        <g transform="rotate(-6 119 42)">
          <rect
            x="107"
            y="36"
            width="24"
            height="14"
            rx="7"
            fill="#182738"
          />
          {/* White glossy shine */}
          <path
            d="M 112 39.5 Q 119 37.5 126 39.5"
            stroke="#FFFFFF"
            strokeWidth="2.2"
            strokeLinecap="round"
            opacity="0.9"
          />
        </g>

        {/* Right Earpiece */}
        <g transform="rotate(6 153 42)">
          <rect
            x="141"
            y="36"
            width="24"
            height="14"
            rx="7"
            fill="#182738"
          />
          {/* White glossy shine */}
          <path
            d="M 146 39.5 Q 153 37.5 160 39.5"
            stroke="#FFFFFF"
            strokeWidth="2.2"
            strokeLinecap="round"
            opacity="0.9"
          />
        </g>

        {/* --- MAIN RUBBER TUBE (DEEP NAVY #173A5E) --- */}
        {/* Continuous path from bottom loop up to chestpiece */}
        <path
          d="M 136 154 L 138 172 C 141 198, 165 214, 192 212 C 220 210, 238 188, 238 160 C 238 147, 244 140, 252 136"
          stroke="#173A5E"
          strokeWidth="14"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />

        {/* --- DARK NAVY Y-YOKE / COLLAR --- */}
        {/* Curved U-shaped junction uniting binaural tubes */}
        <path
          d="M 107 122 C 107 142, 122 154, 136 154 C 150 154, 165 142, 165 122"
          stroke="#173A5E"
          strokeWidth="14"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />

        {/* --- SPECULAR HIGHLIGHTS ON Y-YOKE (EXACTLY AS IN REFERENCE IMAGE) --- */}
        {/* Left arm: elongated white pill highlight */}
        <path
          d="M 105 124 L 106 131"
          stroke="#FFFFFF"
          strokeWidth="3.2"
          strokeLinecap="round"
        />
        {/* Left arm: white dot highlight below */}
        <circle cx="109.5" cy="138" r="1.8" fill="#FFFFFF" />

        {/* Right arm: white dot highlight */}
        <circle cx="167" cy="125" r="1.8" fill="#FFFFFF" />

        {/* --- CHESTPIECE (MÀNG NGHE) --- */}
        {/* Outer Dark Navy Rim */}
        <circle cx="266" cy="136" r="23" fill="#173A5E" />
        {/* Intermediate Gray-Blue Bevel */}
        <circle cx="266" cy="136" r="18.5" fill="#8FA7BD" />
        {/* Inner Light Blue Diaphragm */}
        <circle cx="266" cy="136" r="14.5" fill="#B9D8F2" />
      </svg>
    </div>
  );
};
