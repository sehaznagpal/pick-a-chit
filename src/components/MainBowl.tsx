import React from 'react';

interface MainBowlProps {
  remainingCount: number;
  totalCount: number;
  todayDoneCount: number;
  isBreathing: boolean;
  isWobbling: boolean;
  canPull: boolean;
  onPull: () => void;
}

// 16 hand-drawn folded paper chit strips poking out of the bowl
const CHIT_STRIPS = [
  { id: 1, x: 70, y: 38, w: 26, h: 54, rot: -28, fold: 16 },
  { id: 2, x: 92, y: 22, w: 28, h: 68, rot: -14, fold: 22 },
  { id: 3, x: 120, y: 15, w: 30, h: 74, rot: -6, fold: 24 },
  { id: 4, x: 152, y: 12, w: 28, h: 76, rot: 4, fold: 26 },
  { id: 5, x: 182, y: 18, w: 32, h: 72, rot: 16, fold: 20 },
  { id: 6, x: 216, y: 28, w: 28, h: 62, rot: 28, fold: 18 },
  { id: 7, x: 244, y: 44, w: 24, h: 50, rot: 36, fold: 14 },
  { id: 8, x: 80, y: 48, w: 26, h: 50, rot: -34, fold: 15 },
  { id: 9, x: 106, y: 32, w: 26, h: 62, rot: -20, fold: 20 },
  { id: 10, x: 138, y: 26, w: 30, h: 66, rot: -2, fold: 22 },
  { id: 11, x: 168, y: 24, w: 30, h: 68, rot: 10, fold: 23 },
  { id: 12, x: 198, y: 34, w: 26, h: 60, rot: 22, fold: 19 },
  { id: 13, x: 230, y: 46, w: 24, h: 52, rot: 32, fold: 16 },
  { id: 14, x: 118, y: 44, w: 32, h: 54, rot: -12, fold: 18 },
  { id: 15, x: 154, y: 40, w: 32, h: 56, rot: 3, fold: 20 },
  { id: 16, x: 186, y: 46, w: 30, h: 52, rot: 15, fold: 17 },
];

export const MainBowl: React.FC<MainBowlProps> = ({
  remainingCount,
  totalCount,
  todayDoneCount,
  isBreathing,
  isWobbling,
  canPull,
  onPull,
}) => {
  const isEmpty = remainingCount === 0;

  // Fraction of chits to show based on remaining count
  const visibleChitsCount = isEmpty
    ? 0
    : Math.max(1, Math.min(16, Math.ceil((remainingCount / Math.max(1, totalCount)) * 16)));

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.key === 'Enter' || e.key === ' ') && canPull) {
      e.preventDefault();
      onPull();
    }
  };

  return (
    <div className="flex flex-col items-center justify-center relative select-none">
      <button
        type="button"
        onClick={canPull ? onPull : undefined}
        onKeyDown={handleKeyDown}
        disabled={!canPull}
        aria-label={canPull ? 'Pull a chit from the bowl' : 'No chits left to pull'}
        className={`relative flex items-center justify-center outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-blue)] rounded-3xl transition-transform duration-300 ${
          canPull ? 'cursor-pointer hover:scale-[1.015]' : 'cursor-default'
        } ${isBreathing && !isWobbling ? 'animate-breathe' : ''} ${
          isWobbling ? 'animate-bowl-wobble' : ''
        }`}
        style={{
          // ~20% bigger than original (was min(78vw, 360px) and min(45vh, 275px))
          width: 'min(88vw, 432px)',
          height: 'min(44vh, 325px)',
        }}
      >
        <svg
          viewBox="0 0 340 270"
          className="w-full h-full overflow-visible"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Doodle 1: Sparkle tick marks near upper left rim (aria-hidden, ~35% opacity) */}
          <g
            aria-hidden="true"
            className="pointer-events-none opacity-35 transition-opacity"
            stroke="var(--ink-color)"
            strokeWidth="2"
            strokeLinecap="round"
          >
            <path d="M 28 58 L 18 52" />
            <path d="M 38 46 L 34 35" />
            <path d="M 52 38 L 57 28" />
          </g>

          {/* Bowl Rim Back Interior */}
          <ellipse
            cx="170"
            cy="80"
            rx="138"
            ry="24"
            fill="var(--bg-color)"
            stroke="var(--ink-color)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Paper Chits Stacked Inside Bowl */}
          {!isEmpty && (
            <g className={`transition-transform duration-300 ${isWobbling ? 'scale-95' : ''}`}>
              {CHIT_STRIPS.slice(0, visibleChitsCount).map((chit) => (
                <g
                  key={chit.id}
                  transform={`rotate(${chit.rot + (isWobbling ? (chit.id % 2 === 0 ? 5 : -5) : 0)}, ${chit.x + chit.w / 2}, ${chit.y + chit.h})`}
                  className="transition-transform duration-200"
                >
                  {/* Folded paper slip with distinct hand-drawn outline */}
                  <rect
                    x={chit.x}
                    y={chit.y}
                    width={chit.w}
                    height={chit.h}
                    rx="2"
                    fill="var(--paper-color)"
                    stroke="#1A1A1A"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  {/* Paper fold crease line */}
                  <line
                    x1={chit.x + 1}
                    y1={chit.y + chit.fold}
                    x2={chit.x + chit.w - 1}
                    y2={chit.y + chit.fold + 1}
                    stroke="#1A1A1A"
                    strokeWidth="1.6"
                    strokeDasharray="2 2"
                    strokeOpacity="0.7"
                  />
                  {/* Tiny pen mark hint on chit top */}
                  <path
                    d={`M ${chit.x + 5} ${chit.y + 7} Q ${chit.x + chit.w / 2} ${chit.y + 9} ${chit.x + chit.w - 5} ${chit.y + 6}`}
                    stroke="#2447D6"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                    fill="none"
                    opacity="0.9"
                  />
                </g>
              ))}
            </g>
          )}

          {/* Bowl Main Body Front Wall */}
          <path
            d="M 32 80 
               C 32 152, 92 224, 126 236 
               C 142 241, 198 241, 214 236 
               C 248 224, 308 152, 308 80 
               C 292 98, 222 104, 170 104 
               C 118 104, 48 98, 32 80 Z"
            fill="var(--bg-color)"
            stroke="var(--ink-color)"
            strokeWidth="3.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Front Rim Overlap Lip (Confident Hand-Drawn Stroke) */}
          <path
            d="M 32 80 
               C 46 96, 118 104, 170 104 
               C 222 104, 294 96, 308 80"
            stroke="var(--ink-color)"
            strokeWidth="3.2"
            strokeLinecap="round"
            fill="none"
          />

          {/* Hand-drawn Foot Ring at bottom */}
          <path
            d="M 126 236 
               C 130 248, 210 248, 214 236"
            stroke="var(--ink-color)"
            strokeWidth="3"
            strokeLinecap="round"
            fill="none"
          />

          {/* Subtle hand-drawn ceramic accent curves */}
          <path
            d="M 75 145 C 95 180, 130 205, 160 215"
            stroke="var(--ink-color)"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeDasharray="4 6"
            opacity="0.35"
            fill="none"
          />

          {/* Doodle 2: Hatching lines under bowl base as cast shadow (aria-hidden, ~35% opacity) */}
          <g
            aria-hidden="true"
            className="pointer-events-none opacity-35"
            stroke="var(--ink-color)"
            strokeWidth="2.2"
            strokeLinecap="round"
          >
            <line x1="112" y1="250" x2="128" y2="259" />
            <line x1="130" y1="251" x2="147" y2="260" />
            <line x1="149" y1="251" x2="166" y2="260" />
            <line x1="168" y1="251" x2="185" y2="260" />
            <line x1="187" y1="251" x2="204" y2="259" />
            <line x1="206" y1="250" x2="222" y2="258" />
          </g>
        </svg>
      </button>

      {/* Tiny mono counts under main bowl */}
      <div className="mt-2.5 flex items-center justify-center gap-2 font-mono-chit text-[11px] sm:text-[12px] text-[var(--ink-color)]">
        <span className="opacity-80">{remainingCount} left</span>
        {todayDoneCount >= 1 && (
          <span className="opacity-75">
            • {todayDoneCount} today
          </span>
        )}
      </div>
    </div>
  );
};
