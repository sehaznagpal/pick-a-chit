import React from 'react';

interface DoneBowlProps {
  doneCount: number;
  totalCount: number;
  isSettling: boolean;
}

// 12 chits that fill in progressively as done / total increases
const DONE_CHITS = [
  { id: 1, x: 50, y: 35, w: 20, h: 32, rot: -25, fold: 10 },
  { id: 2, x: 80, y: 38, w: 22, h: 30, rot: 15, fold: 12 },
  { id: 3, x: 62, y: 28, w: 22, h: 36, rot: -5, fold: 11 },
  { id: 4, x: 42, y: 26, w: 20, h: 36, rot: -35, fold: 12 },
  { id: 5, x: 92, y: 29, w: 18, h: 34, rot: 28, fold: 10 },
  { id: 6, x: 55, y: 18, w: 22, h: 38, rot: -18, fold: 12 },
  { id: 7, x: 74, y: 16, w: 24, h: 40, rot: 8, fold: 13 },
  { id: 8, x: 40, y: 14, w: 20, h: 36, rot: -30, fold: 11 },
  { id: 9, x: 86, y: 12, w: 20, h: 38, rot: 22, fold: 12 },
  { id: 10, x: 60, y: 8, w: 22, h: 42, rot: -4, fold: 14 },
  { id: 11, x: 46, y: 4, w: 20, h: 40, rot: -22, fold: 13 },
  { id: 12, x: 78, y: 5, w: 22, h: 40, rot: 18, fold: 13 },
];

export const DoneBowl: React.FC<DoneBowlProps> = ({
  doneCount,
  totalCount,
  isSettling,
}) => {
  const safeTotal = Math.max(1, totalCount);
  const ratio = Math.min(1, Math.max(0, doneCount / safeTotal));
  
  // Calculate how many chits are visible in the done bowl (0 when empty, up to 12 when full)
  const visibleCount = doneCount === 0 ? 0 : Math.max(1, Math.ceil(ratio * DONE_CHITS.length));

  return (
    <div
      className={`flex flex-col items-center select-none ${
        isSettling ? 'animate-settle' : ''
      }`}
      style={{ width: 'min(38vw, 150px)' }}
    >
      <div className="relative w-full h-[85px] flex items-center justify-center">
        <svg
          viewBox="0 0 160 115"
          className="w-full h-full overflow-visible"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Done Bowl Rim Back */}
          <ellipse
            cx="80"
            cy="42"
            rx="62"
            ry="14"
            fill="var(--bg-color)"
            stroke="var(--ink-color)"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Chits piled inside done bowl */}
          {visibleCount > 0 && (
            <g>
              {DONE_CHITS.slice(0, visibleCount).map((chit) => (
                <g
                  key={chit.id}
                  transform={`rotate(${chit.rot}, ${chit.x + chit.w / 2}, ${chit.y + chit.h})`}
                >
                  <rect
                    x={chit.x}
                    y={chit.y}
                    width={chit.w}
                    height={chit.h}
                    rx="1.5"
                    fill="var(--paper-color)"
                    stroke="#1A1A1A"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  {/* Crease line */}
                  <line
                    x1={chit.x + 1}
                    y1={chit.y + chit.fold}
                    x2={chit.x + chit.w - 1}
                    y2={chit.y + chit.fold}
                    stroke="#1A1A1A"
                    strokeWidth="1.2"
                    strokeDasharray="1.5 1.5"
                    strokeOpacity="0.7"
                  />
                  {/* Blue pen ink scribble */}
                  <path
                    d={`M ${chit.x + 3} ${chit.y + 5} Q ${chit.x + chit.w / 2} ${chit.y + 7} ${chit.x + chit.w - 3} ${chit.y + 4}`}
                    stroke="#2447D6"
                    strokeWidth="1.2"
                    strokeLinecap="round"
                    fill="none"
                  />
                </g>
              ))}
            </g>
          )}

          {/* Done Bowl Body Front Wall */}
          <path
            d="M 18 42 
               C 18 78, 44 104, 62 109 
               C 70 111, 90 111, 98 109 
               C 116 104, 142 78, 142 42 
               C 134 52, 102 55, 80 55 
               C 58 55, 26 52, 18 42 Z"
            fill="var(--bg-color)"
            stroke="var(--ink-color)"
            strokeWidth="2.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Front Rim Edge */}
          <path
            d="M 18 42 
               C 26 52, 58 55, 80 55 
               C 102 55, 134 52, 142 42"
            stroke="var(--ink-color)"
            strokeWidth="2.5"
            strokeLinecap="round"
            fill="none"
          />

          {/* Foot ring */}
          <path
            d="M 62 109 C 64 114, 96 114, 98 109"
            stroke="var(--ink-color)"
            strokeWidth="2.2"
            strokeLinecap="round"
            fill="none"
          />
        </svg>
      </div>

      {/* Tiny mono counts and label under done bowl */}
      <div className="mt-1 flex flex-col items-center">
        <span className="font-mono-chit text-[10px] uppercase tracking-wider text-[var(--ink-color)] opacity-60">
          done
        </span>
        <span className="font-mono-chit text-[11px] text-[var(--ink-color)] opacity-80">
          {doneCount} done
        </span>
      </div>
    </div>
  );
};
