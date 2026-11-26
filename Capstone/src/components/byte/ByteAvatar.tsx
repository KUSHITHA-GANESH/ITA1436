import React from 'react';
import { ByteMood } from '../../types/cyberquest';

interface ByteAvatarProps {
  mood?: ByteMood;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const SIZE_MAP = {
  xs: 40,
  sm: 56,
  md: 76,
  lg: 108,
  xl: 136,
};

export const ByteAvatar: React.FC<ByteAvatarProps> = ({
  mood = 'idle',
  size = 'md',
  className = '',
}) => {
  const px = SIZE_MAP[size];

  const isBouncing = mood === 'excited' || mood === 'mission-complete' || mood === 'happy';
  const isWaving = mood === 'welcome';
  const isThinking = mood === 'thinking';
  const isConcerned = mood === 'concerned';
  const isHint = mood === 'hint';
  const isMissionComplete = mood === 'mission-complete';

  const eyeColor = isConcerned
    ? '#E65B6A'
    : isHint
    ? '#E5B84B'
    : isMissionComplete
    ? '#19B5A5'
    : '#38BDF8';

  const antennaColor = isConcerned
    ? '#E65B6A'
    : isHint || isMissionComplete
    ? '#E5B84B'
    : '#19B5A5';

  return (
    <div
      className={`relative inline-flex items-center justify-center select-none ${
        isBouncing ? 'animate-byte-bounce' : 'animate-byte-float'
      } ${className}`}
      style={{ width: px, height: px }}
      aria-label={`Byte companion (${mood})`}
    >
      <svg
        viewBox="0 0 120 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full overflow-visible"
      >
        <defs>
          <linearGradient id="byteShell" x1="25" y1="20" x2="95" y2="95" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#F8FBFF" />
            <stop offset="65%" stopColor="#DCE8F8" />
            <stop offset="100%" stopColor="#B8D0EE" />
          </linearGradient>
          <linearGradient id="byteBlue" x1="20" y1="50" x2="100" y2="108" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#3B82F6" />
            <stop offset="100%" stopColor="#1D4ED8" />
          </linearGradient>
          <linearGradient id="byteVisor" x1="30" y1="36" x2="90" y2="70" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#071426" />
            <stop offset="100%" stopColor="#0F2744" />
          </linearGradient>
        </defs>

        {/* Ground shadow */}
        <ellipse cx="60" cy="112" rx="24" ry="4.5" fill="#040B16" opacity="0.55" />

        {/* Celebratory confetti sparks on mission-complete */}
        {isMissionComplete && (
          <g>
            <circle cx="16" cy="24" r="3" fill="#E5B84B" />
            <circle cx="104" cy="26" r="3" fill="#19B5A5" />
            <rect x="20" y="42" width="5" height="5" rx="1" transform="rotate(20 20 42)" fill="#7C5CFC" />
            <rect x="97" y="44" width="5" height="5" rx="1" transform="rotate(-18 97 44)" fill="#38BDF8" />
            <path d="M60 4 L62 10 L68 10 L63 14 L65 20 L60 16 L55 20 L57 14 L52 10 L58 10 Z" fill="#E5B84B" />
          </g>
        )}

        {/* Hint lightbulb halo */}
        {isHint && (
          <g>
            <circle cx="60" cy="14" r="9" fill="#E5B84B" opacity="0.18" />
            <path d="M46 14 H50 M70 14 H74 M60 3 V6" stroke="#E5B84B" strokeWidth="2" strokeLinecap="round" />
          </g>
        )}

        {/* Thinking dots */}
        {isThinking && (
          <g opacity="0.85">
            <circle cx="96" cy="24" r="2.5" fill="#38BDF8" />
            <circle cx="103" cy="18" r="3.2" fill="#19B5A5" />
          </g>
        )}

        {/* Whole character group (tilts gently when thinking) */}
        <g transform={isThinking ? 'rotate(-5 60 64)' : undefined}>
          {/* Antenna */}
          <line x1="60" y1="26" x2="60" y2="14" stroke="#9BAEC3" strokeWidth="3.5" strokeLinecap="round" />
          <circle cx="60" cy="13" r="4.5" fill={antennaColor} />
          <circle cx="58.7" cy="11.7" r="1.4" fill="#FFFFFF" opacity="0.85" />

          {/* Left Arm */}
          <rect x="19" y="66" width="10" height="22" rx="5" fill="url(#byteBlue)" stroke="#071426" strokeWidth="1.5" />

          {/* Right Arm (waves during welcome!) */}
          <g className={isWaving ? 'animate-byte-wave' : ''}>
            <rect
              x="91"
              y={isWaving ? 48 : 66}
              width="10"
              height="22"
              rx="5"
              transform={isWaving ? 'rotate(24 96 66)' : undefined}
              fill="url(#byteBlue)"
              stroke="#071426"
              strokeWidth="1.5"
            />
          </g>

          {/* Compact Cyber Body */}
          <g className="animate-byte-breathe">
            <rect
              x="34"
              y="66"
              width="52"
              height="33"
              rx="14"
              fill="url(#byteShell)"
              stroke="#2463EB"
              strokeWidth="1.8"
            />
            {/* Chest collar & shield emblem */}
            <path d="M42 68 H78 L72 78 H48 Z" fill="url(#byteBlue)" />
            <path
              d="M60 80 L67 83 V88.5 C67 92.5 60 95.5 60 95.5 C60 95.5 53 92.5 53 88.5 V83 L60 80 Z"
              fill="#19B5A5"
            />
            <path d="M57.5 87.5 L59.4 89.4 L63 85.8" stroke="#071426" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </g>

          {/* Hover Feet / Thruster Pods */}
          <rect x="42" y="97" width="12" height="7" rx="3.5" fill="#2463EB" />
          <rect x="66" y="97" width="12" height="7" rx="3.5" fill="#2463EB" />
          <ellipse cx="48" cy="105.5" rx="4" ry="1.5" fill="#19B5A5" opacity="0.7" />
          <ellipse cx="72" cy="105.5" rx="4" ry="1.5" fill="#19B5A5" opacity="0.7" />

          {/* Ear / Headphone Nodes */}
          <rect x="21" y="38" width="7" height="18" rx="3.5" fill="url(#byteBlue)" />
          <rect x="92" y="38" width="7" height="18" rx="3.5" fill="url(#byteBlue)" />

          {/* Head Shell */}
          <rect
            x="25"
            y="24"
            width="70"
            height="47"
            rx="20"
            fill="url(#byteShell)"
            stroke="#2463EB"
            strokeWidth="2"
          />

          {/* Dark Protective Visor */}
          <rect x="32" y="31" width="56" height="33" rx="13" fill="url(#byteVisor)" />
          {/* Visor subtle top reflection */}
          <path d="M39 34 H81" stroke="#38BDF8" strokeWidth="1.2" strokeLinecap="round" opacity="0.3" />

          {/* Expressive LED Eyes */}
          <g className={mood === 'idle' || mood === 'explaining' ? 'animate-byte-blink' : ''}>
            {mood === 'happy' || mood === 'welcome' || mood === 'excited' ? (
              <>
                <path
                  d="M41 47 Q46 40 51 47"
                  stroke={eyeColor}
                  strokeWidth="3.2"
                  strokeLinecap="round"
                  fill="none"
                />
                <path
                  d="M69 47 Q74 40 79 47"
                  stroke={eyeColor}
                  strokeWidth="3.2"
                  strokeLinecap="round"
                  fill="none"
                />
              </>
            ) : mood === 'mission-complete' ? (
              <>
                <path d="M46 40 L47.6 43.8 L51.5 44.2 L48.4 46.8 L49.4 50.8 L46 48.6 L42.6 50.8 L43.6 46.8 L40.5 44.2 L44.4 43.8 Z" fill="#E5B84B" />
                <path d="M74 40 L75.6 43.8 L79.5 44.2 L76.4 46.8 L77.4 50.8 L74 48.6 L70.6 50.8 L71.6 46.8 L68.5 44.2 L72.4 43.8 Z" fill="#E5B84B" />
              </>
            ) : isConcerned ? (
              <>
                <line x1="40" y1="41" x2="51" y2="44" stroke={eyeColor} strokeWidth="2.6" strokeLinecap="round" />
                <line x1="80" y1="41" x2="69" y2="44" stroke={eyeColor} strokeWidth="2.6" strokeLinecap="round" />
                <circle cx="46" cy="48" r="3.6" fill={eyeColor} />
                <circle cx="74" cy="48" r="3.6" fill={eyeColor} />
              </>
            ) : isHint ? (
              <>
                <ellipse cx="46" cy="46" rx="4.2" ry="5" fill={eyeColor} />
                <path d="M69 46 Q74 41 79 46" stroke={eyeColor} strokeWidth="3" strokeLinecap="round" fill="none" />
              </>
            ) : (
              <g className={isThinking ? 'animate-byte-scan' : ''}>
                <rect x="41.5" y="40.5" width="8.5" height="10.5" rx="4.25" fill={eyeColor} />
                <rect x="70" y="40.5" width="8.5" height="10.5" rx="4.25" fill={eyeColor} />
                <circle cx="44" cy="43.5" r="1.5" fill="#FFFFFF" opacity="0.85" />
                <circle cx="72.5" cy="43.5" r="1.5" fill="#FFFFFF" opacity="0.85" />
              </g>
            )}
          </g>

          {/* Subtle LED Mouth */}
          {isConcerned ? (
            <path d="M54 57 Q60 54 66 57" stroke="#E65B6A" strokeWidth="2.2" strokeLinecap="round" fill="none" />
          ) : mood === 'happy' || mood === 'welcome' || mood === 'excited' || mood === 'mission-complete' ? (
            <path d="M53 54 Q60 60 67 54" stroke="#19B5A5" strokeWidth="2.4" strokeLinecap="round" fill="none" />
          ) : (
            <path d="M55 55.5 Q60 57.5 65 55.5" stroke="#38BDF8" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.85" />
          )}
        </g>
      </svg>
    </div>
  );
};
