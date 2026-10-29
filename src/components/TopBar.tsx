import React from 'react';
import { Calendar, List, Moon, Sun } from 'lucide-react';

interface TopBarProps {
  streak: number;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  onOpenCalendar: () => void;
  onOpenCurriculum: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  streak,
  theme,
  onToggleTheme,
  onOpenCalendar,
  onOpenCurriculum,
}) => {
  return (
    <header className="w-full h-12 px-4 sm:px-6 flex items-center justify-between select-none shrink-0 z-20 relative">
      {/* Left: App name with scribble underline & pencil doodle */}
      <div className="relative flex items-center gap-2">
        <div className="relative flex flex-col">
          <span className="font-title text-[15px] sm:text-[16px] font-bold tracking-tight text-[var(--ink-color)]">
            Pick a Chit
          </span>
          {/* Doodle 3: Loose scribble underline under app title */}
          <svg
            aria-hidden="true"
            className="w-full h-[6px] overflow-visible opacity-35 pointer-events-none -mt-0.5"
            viewBox="0 0 100 6"
            fill="none"
          >
            <path
              d="M 2 3 C 25 1, 48 5, 70 2 C 82 1, 94 4, 98 2"
              stroke="var(--ink-color)"
              strokeWidth="1.6"
              strokeLinecap="round"
            />
          </svg>
        </div>

        {/* Doodle 4: Small pencil doodle near title (hidden on narrow screens) */}
        <svg
          aria-hidden="true"
          className="w-4 h-4 opacity-35 pointer-events-none hidden sm:block -rotate-12 ml-1"
          viewBox="0 0 20 20"
          fill="none"
        >
          {/* Hand-drawn pencil outline */}
          <path
            d="M 3 17 L 3 14 L 13 4 L 16 7 L 6 17 Z"
            stroke="var(--ink-color)"
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
          <path d="M 3 17 L 3 14 L 6 17 Z" fill="var(--ink-color)" />
          <line x1="11" y1="6" x2="14" y2="9" stroke="var(--ink-color)" strokeWidth="1.2" />
        </svg>
      </div>

      {/* Right: Streak number + 3 line icons */}
      <div className="flex items-center gap-3.5 sm:gap-4">
        {/* Streak number */}
        <div
          title={`Streak: ${streak} day${streak === 1 ? '' : 's'}`}
          className="flex items-center justify-center font-mono-chit text-[13px] font-medium text-[var(--ink-color)]"
        >
          <span className="opacity-75">{streak}</span>
        </div>

        {/* Calendar icon */}
        <button
          type="button"
          onClick={onOpenCalendar}
          title="Calendar"
          aria-label="Open calendar"
          className="p-1.5 rounded-md text-[var(--ink-color)] hover:opacity-70 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-blue)] active:scale-90 transition-transform"
        >
          <Calendar className="w-4 h-4 stroke-[2.2]" />
        </button>

        {/* Curriculum list icon */}
        <button
          type="button"
          onClick={onOpenCurriculum}
          title="Curriculum"
          aria-label="Open curriculum"
          className="p-1.5 rounded-md text-[var(--ink-color)] hover:opacity-70 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-blue)] active:scale-90 transition-transform"
        >
          <List className="w-4 h-4 stroke-[2.2]" />
        </button>

        {/* Dark / Light Mode Toggle */}
        <button
          type="button"
          onClick={onToggleTheme}
          title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
          aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          className="p-1.5 rounded-md text-[var(--ink-color)] hover:opacity-70 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-blue)] active:scale-90 transition-transform"
        >
          {theme === 'dark' ? (
            <Sun className="w-4 h-4 stroke-[2.2]" />
          ) : (
            <Moon className="w-4 h-4 stroke-[2.2]" />
          )}
        </button>
      </div>
    </header>
  );
};
