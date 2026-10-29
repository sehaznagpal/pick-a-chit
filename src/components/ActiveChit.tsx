import React, { useState, useEffect } from 'react';
import { Topic } from '../data/topics';

interface ActiveChitProps {
  topic: Topic;
  isInitialLoadOpen: boolean;
  onMarkDone: () => void;
  onAnimationEnd?: () => void;
}

export const ActiveChit: React.FC<ActiveChitProps> = ({
  topic,
  isInitialLoadOpen,
  onMarkDone,
}) => {
  // Animation phase: 'pulling' (1.6s) -> 'open' -> 'folding-away' (0.7s)
  const [phase, setPhase] = useState<'pulling' | 'open' | 'folding-away'>(
    isInitialLoadOpen ? 'open' : 'pulling'
  );

  // Timer states (60 seconds)
  const [timerActive, setTimerActive] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(60);

  // Check prefers-reduced-motion
  const prefersReducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  useEffect(() => {
    if (phase === 'pulling') {
      if (prefersReducedMotion) {
        setPhase('open');
      } else {
        const timeout = setTimeout(() => {
          setPhase('open');
        }, 1600);
        return () => clearTimeout(timeout);
      }
    }
  }, [phase, prefersReducedMotion]);

  // Countdown timer logic
  useEffect(() => {
    if (!timerActive) return;
    const intervalId = window.setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          setTimerActive(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearInterval(intervalId);
    };
  }, [timerActive]);

  const toggleTimer = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (secondsLeft === 0) {
      setSecondsLeft(60);
      setTimerActive(true);
    } else {
      setTimerActive((prev) => !prev);
    }
  };

  const handleMarkDoneClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (phase !== 'open') return;
    if (prefersReducedMotion) {
      onMarkDone();
    } else {
      setPhase('folding-away');
      setTimeout(() => {
        onMarkDone();
      }, 650);
    }
  };

  // Timer formatted mm:ss
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // Timer progress fraction (from 1 down to 0)
  const timerProgress = secondsLeft / 60;

  return (
    <div
      className={`fixed inset-x-0 top-12 z-30 flex flex-col items-center pointer-events-none transition-opacity duration-300 ${
        phase === 'folding-away' ? 'pointer-events-none' : 'pointer-events-auto'
      }`}
    >
      <div
        className={`relative flex flex-col items-center max-w-[92vw] w-[380px] pointer-events-auto transition-all duration-700 ease-out px-2 ${
          phase === 'pulling' ? 'chit-pull-anim' : ''
        } ${phase === 'folding-away' ? 'chit-fly-done-anim' : ''}`}
      >
        {/* The Compact Paper Chit Card (max-h ~38vh so it leaves full room for bowl below) */}
        <div
          className="relative w-full rounded-sm transition-transform duration-500 overflow-hidden flex flex-col justify-between max-h-[35vh] sm:max-h-[38vh]"
          style={{
            backgroundColor: 'var(--paper-color)',
            border: '2.6px solid #1A1A1A',
            boxShadow: 'none',
          }}
        >
          {/* Subtle fold crease lines */}
          <div className="absolute top-[33.3%] left-0 right-0 border-b border-dashed border-[#1A1A1A] opacity-20 pointer-events-none" />
          <div className="absolute top-[66.6%] left-0 right-0 border-b border-dashed border-[#1A1A1A] opacity-20 pointer-events-none" />

          {/* Chit Contents */}
          <div className="p-3.5 sm:p-4 flex flex-col justify-between h-full min-h-[145px] sm:min-h-[165px] text-[#1A1A1A]">
            {/* Top metadata: Unit label & ID */}
            <div className="flex items-center justify-between pb-1">
              <span className="font-mono-chit text-[10px] sm:text-[11px] uppercase tracking-wider text-[#1A1A1A] opacity-70 truncate max-w-[80%]">
                {topic.unit}
              </span>
              <span className="font-mono-chit text-[9px] text-[#1A1A1A] opacity-50 shrink-0">
                {topic.id}
              </span>
            </div>

            {/* Topic handwriting in pen blue */}
            <div className="my-auto py-1 sm:py-2 text-center overflow-hidden">
              <h1
                className="font-handwriting font-bold leading-snug select-text text-[20px] sm:text-[23px] line-clamp-3"
                style={{
                  color: '#2447D6',
                  textShadow: '0.2px 0 0 #2447D6',
                }}
              >
                {topic.topic}
              </h1>
            </div>

            {/* Bottom metadata / covers hint */}
            {topic.covers && (
              <div className="pt-1 border-t border-[#1A1A1A]/15 text-left">
                <p className="font-mono-chit text-[9px] sm:text-[10px] leading-tight text-[#1A1A1A] opacity-65 truncate">
                  covers: {topic.covers}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Action Controls Below the Chit */}
        {phase === 'open' && (
          <div className="mt-2.5 sm:mt-3 w-full flex items-center justify-center gap-2.5 animate-fade-in pointer-events-auto z-20">
            {/* 1-Minute Countdown Button */}
            <button
              type="button"
              onClick={toggleTimer}
              aria-label={
                timerActive
                  ? 'Pause 1 minute timer'
                  : secondsLeft === 60
                  ? 'Start 1 minute speech timer'
                  : 'Resume 1 minute speech timer'
              }
              className="flex-1 h-9 py-1.5 px-3 rounded-lg border-2 border-[var(--ink-color)] bg-[var(--bg-color)] text-[var(--ink-color)] font-mono-chit text-[12px] font-medium flex items-center justify-center gap-2 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-blue)] active:scale-95 transition-transform"
            >
              {/* Minimalist circular timer indicator */}
              <div className="relative w-3.5 h-3.5 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 24 24">
                  <circle
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    fill="none"
                    opacity="0.3"
                  />
                  <circle
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    fill="none"
                    strokeDasharray={2 * Math.PI * 10}
                    strokeDashoffset={2 * Math.PI * 10 * (1 - timerProgress)}
                    strokeLinecap="round"
                    className="transition-all duration-300"
                  />
                </svg>
              </div>
              <span>
                {timerActive || secondsLeft < 60
                  ? formatTime(secondsLeft)
                  : 'Start 1:00'}
              </span>
            </button>

            {/* Primary Action: Mark as done */}
            <button
              type="button"
              onClick={handleMarkDoneClick}
              aria-label="Mark topic as done"
              className="flex-1 h-9 py-1.5 px-3 rounded-lg border-2 border-[var(--ink-color)] font-title text-[12px] font-bold cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-blue)] active:scale-95 transition-all text-white dark:text-[#1C1C1E]"
              style={{
                backgroundColor: 'var(--accent-blue)',
              }}
            >
              Mark as done
            </button>
          </div>
        )}
      </div>

      <style>{`
        /* Pull animation: rises from lower bowl to upper area */
        @keyframes chitPullKeyframes {
          0% {
            transform: translateY(180px) scale(0.35) rotate(-12deg);
            opacity: 0.5;
          }
          40% {
            transform: translateY(-20px) scale(0.8) rotate(6deg);
            opacity: 0.9;
          }
          70% {
            transform: translateY(4px) scale(0.97) rotate(-2deg);
            opacity: 1;
          }
          100% {
            transform: translateY(0px) scale(1) rotate(0deg);
            opacity: 1;
          }
        }

        .chit-pull-anim {
          animation: chitPullKeyframes 1.55s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          will-change: transform, opacity;
        }

        /* Done animation: folds and flies in arc to bottom-right done bowl */
        @keyframes chitFlyDoneKeyframes {
          0% {
            transform: translate(0, 0) scale(1) rotate(0deg);
            opacity: 1;
          }
          30% {
            transform: translate(50px, 30px) scale(0.8) rotate(15deg);
            opacity: 0.95;
          }
          100% {
            transform: translate(calc(45vw - 40px), calc(65vh - 40px)) scale(0.2) rotate(45deg);
            opacity: 0;
          }
        }

        .chit-fly-done-anim {
          animation: chitFlyDoneKeyframes 0.65s cubic-bezier(0.4, 0, 0.2, 1) forwards;
          will-change: transform, opacity;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fadeIn 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
};
