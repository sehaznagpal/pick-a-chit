import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Topic } from './data/topics';
import {
  HistoryMap,
  STORAGE_KEYS,
  calculateStreak,
  getLocalDateString,
  getCompletedTopicIds,
  loadHistory,
  loadStoredTopics,
  saveHistory,
  saveStoredTopics,
  normalizeHistory,
} from './utils/storage';
import { TopBar } from './components/TopBar';
import { MainBowl } from './components/MainBowl';
import { DoneBowl } from './components/DoneBowl';
import { ActiveChit } from './components/ActiveChit';
import { CalendarModal } from './components/CalendarModal';
import { CurriculumModal } from './components/CurriculumModal';

export default function App() {
  // Topics and history (normalized to support multiple chits per day)
  const [topics, setTopics] = useState<Topic[]>(() => loadStoredTopics());
  const [history, setHistory] = useState<HistoryMap>(() => loadHistory());

  // Dev mode offset (in days)
  const [devDayOffset, setDevDayOffset] = useState<number>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.DEV_OFFSET);
      return stored ? Number(stored) : 0;
    } catch {
      return 0;
    }
  });

  // Effective today string (YYYY-MM-DD) based on dev offset
  const todayStr = useMemo(() => getLocalDateString(devDayOffset), [devDayOffset]);

  // Is dev mode active in URL
  const [isDevMode, setIsDevMode] = useState<boolean>(false);
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const hash = window.location.hash;
    setIsDevMode(searchParams.get('dev') === '1' || hash.includes('dev=1'));
  }, []);

  // Theme: dark / light
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.THEME);
      if (stored === 'light' || stored === 'dark') return stored;
    } catch {
      // fallback
    }
    return typeof window !== 'undefined' &&
      window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light';
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    try {
      localStorage.setItem(STORAGE_KEYS.THEME, theme);
    } catch (err) {
      console.error(err);
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Modals
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isCurriculumOpen, setIsCurriculumOpen] = useState(false);

  // Active Chit state (only 1 open chit at a time; carries over if unfinished)
  const [activeTopicId, setActiveTopicId] = useState<string | null>(() => {
    try {
      return localStorage.getItem(STORAGE_KEYS.ACTIVE_TOPIC_ID) || null;
    } catch {
      return null;
    }
  });

  const [activeTopicDate, setActiveTopicDate] = useState<string>(() => {
    try {
      return localStorage.getItem(STORAGE_KEYS.ACTIVE_TOPIC_DATE) || todayStr;
    } catch {
      return todayStr;
    }
  });

  // Was the active chit already open on page load?
  const [isInitialLoadOpen, setIsInitialLoadOpen] = useState<boolean>(() => {
    try {
      return Boolean(localStorage.getItem(STORAGE_KEYS.ACTIVE_TOPIC_ID));
    } catch {
      return false;
    }
  });

  // Animation states
  const [isBowlWobbling, setIsBowlWobbling] = useState(false);
  const [isDoneSettling, setIsDoneSettling] = useState(false);

  // Checkmark flash stamp state (sketch doodle on completion)
  const [showCheckmarkStamp, setShowCheckmarkStamp] = useState(false);

  // Completed topic IDs across history
  const completedTopicIds = useMemo(() => {
    return getCompletedTopicIds(history);
  }, [history]);

  // Remaining topics not yet done
  const remainingTopics = useMemo(() => {
    return topics.filter((t) => !completedTopicIds.has(t.id));
  }, [topics, completedTopicIds]);

  // Streak: consecutive days with >= 1 completed chit
  const streak = useMemo(() => {
    return calculateStreak(history, todayStr);
  }, [history, todayStr]);

  // Chits completed today
  const todayDoneCount = useMemo(() => {
    const list = history[todayStr] || [];
    return list.filter((i) => i.doneAt).length;
  }, [history, todayStr]);

  // Can pull new chit:
  // - No open unfinished chit
  // - Remaining topics exist
  // - Multiple pulls per day allowed!
  const canPull = !activeTopicId && remainingTopics.length > 0;

  // Pull interaction
  const handlePullChit = () => {
    if (!canPull) return;

    // Pick random uncompleted topic
    const randomIndex = Math.floor(Math.random() * remainingTopics.length);
    const chosenTopic = remainingTopics[randomIndex];

    setIsBowlWobbling(true);
    setTimeout(() => {
      setIsBowlWobbling(false);
    }, 600);

    // Save to state and storage
    setActiveTopicId(chosenTopic.id);
    setActiveTopicDate(todayStr);
    setIsInitialLoadOpen(false);

    try {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_TOPIC_ID, chosenTopic.id);
      localStorage.setItem(STORAGE_KEYS.ACTIVE_TOPIC_DATE, todayStr);
    } catch (err) {
      console.error(err);
    }

    // Record in history under today's date
    const currentList = history[todayStr] ? [...history[todayStr]] : [];
    // Only push if not already present
    if (!currentList.some((item) => item.topicId === chosenTopic.id && !item.doneAt)) {
      currentList.push({
        topicId: chosenTopic.id,
        pulledAt: Date.now(),
      });
    }

    const updatedHistory: HistoryMap = {
      ...history,
      [todayStr]: currentList,
    };
    setHistory(updatedHistory);
    saveHistory(updatedHistory);
  };

  // Mark active chit as done
  const handleMarkDone = useCallback(() => {
    if (!activeTopicId) return;

    const targetDate = activeTopicDate || todayStr;
    const currentList = history[targetDate] ? [...history[targetDate]] : [];

    // Find the record for this activeTopicId and mark done
    let found = false;
    for (let i = currentList.length - 1; i >= 0; i--) {
      if (currentList[i].topicId === activeTopicId && !currentList[i].doneAt) {
        currentList[i] = {
          ...currentList[i],
          doneAt: Date.now(),
        };
        found = true;
        break;
      }
    }

    if (!found) {
      currentList.push({
        topicId: activeTopicId,
        pulledAt: Date.now(),
        doneAt: Date.now(),
      });
    }

    const updatedHistory: HistoryMap = {
      ...history,
      [targetDate]: currentList,
    };

    setHistory(updatedHistory);
    saveHistory(updatedHistory);

    // Clear active chit so user can immediately pull another one
    setActiveTopicId(null);
    try {
      localStorage.removeItem(STORAGE_KEYS.ACTIVE_TOPIC_ID);
      localStorage.removeItem(STORAGE_KEYS.ACTIVE_TOPIC_DATE);
    } catch (err) {
      console.error(err);
    }

    // Flash checkmark stamp doodle
    setShowCheckmarkStamp(true);
    setTimeout(() => {
      setShowCheckmarkStamp(false);
    }, 850);

    // Trigger done bowl settle animation
    setIsDoneSettling(true);
    setTimeout(() => {
      setIsDoneSettling(false);
    }, 550);
  }, [activeTopicId, activeTopicDate, todayStr, history]);

  // Import curriculum / history data
  const handleImportData = (data: { topics?: Topic[]; history?: HistoryMap }) => {
    if (data.topics && Array.isArray(data.topics)) {
      setTopics(data.topics);
      saveStoredTopics(data.topics);
    }
    if (data.history && typeof data.history === 'object') {
      const normalized = normalizeHistory(data.history);
      setHistory(normalized);
      saveHistory(normalized);
    }
  };

  // Dev mode helpers
  const handleDevResetToday = () => {
    const updated = { ...history };
    delete updated[todayStr];
    setHistory(updated);
    saveHistory(updated);
    setActiveTopicId(null);
    try {
      localStorage.removeItem(STORAGE_KEYS.ACTIVE_TOPIC_ID);
      localStorage.removeItem(STORAGE_KEYS.ACTIVE_TOPIC_DATE);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDevAdvanceDay = () => {
    const nextOffset = devDayOffset + 1;
    setDevDayOffset(nextOffset);
    try {
      localStorage.setItem(STORAGE_KEYS.DEV_OFFSET, String(nextOffset));
    } catch (err) {
      console.error(err);
    }
  };

  const activeTopic = activeTopicId
    ? topics.find((t) => t.id === activeTopicId) || null
    : null;

  return (
    <div className="relative w-screen h-[100dvh] max-h-[100dvh] overflow-hidden flex flex-col justify-between bg-[var(--bg-color)] text-[var(--ink-color)] select-none">
      {/* Doodle 5: Drafting sheet construction lines & registration cross mark (Top-Left) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-2 left-2 z-10 opacity-35 hidden sm:block"
      >
        <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
          {/* Registration cross mark */}
          <line x1="8" y1="2" x2="8" y2="14" stroke="var(--ink-color)" strokeWidth="1.2" strokeLinecap="round" />
          <line x1="2" y1="8" x2="14" y2="8" stroke="var(--ink-color)" strokeWidth="1.2" strokeLinecap="round" />
          {/* Faint dashed drafting line */}
          <line x1="8" y1="8" x2="36" y2="8" stroke="var(--ink-color)" strokeWidth="1" strokeDasharray="2 3" />
          <line x1="8" y1="8" x2="8" y2="36" stroke="var(--ink-color)" strokeWidth="1" strokeDasharray="2 3" />
        </svg>
      </div>

      {/* Doodle 6: Drafting sheet registration cross mark (Bottom-Left) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-2 left-2 z-10 opacity-35 hidden sm:block"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <line x1="8" y1="2" x2="8" y2="14" stroke="var(--ink-color)" strokeWidth="1.2" strokeLinecap="round" />
          <line x1="2" y1="8" x2="14" y2="8" stroke="var(--ink-color)" strokeWidth="1.2" strokeLinecap="round" />
        </svg>
      </div>

      {/* 1. Thin Top Bar */}
      <TopBar
        streak={streak}
        theme={theme}
        onToggleTheme={toggleTheme}
        onOpenCalendar={() => setIsCalendarOpen(true)}
        onOpenCurriculum={() => setIsCurriculumOpen(true)}
      />

      {/* 2. Main Viewport Area:
             When a chit is open, bowl stays fully visible in the lower area,
             base sitting ~8% above bottom edge. Chit sits in upper area. */}
      <div className="relative flex-1 w-full h-full min-h-0 overflow-hidden">
        {/* Main Bowl: positioned lower so base sits ~8% above screen bottom */}
        <div
          className="absolute inset-x-0 bottom-[8%] flex flex-col items-center justify-end pointer-events-none transition-all duration-300 z-10"
        >
          <div className="pointer-events-auto">
            <MainBowl
              remainingCount={remainingTopics.length}
              totalCount={topics.length}
              todayDoneCount={todayDoneCount}
              isBreathing={!activeTopic}
              isWobbling={isBowlWobbling}
              canPull={canPull}
              onPull={handlePullChit}
            />
          </div>
        </div>

        {/* 3. Active Chit: Upper screen portion, non-overlapping with bowl */}
        {activeTopic && (
          <ActiveChit
            key={activeTopic.id}
            topic={activeTopic}
            isInitialLoadOpen={isInitialLoadOpen}
            onMarkDone={handleMarkDone}
          />
        )}

        {/* Doodle 7: Flashing Hand-Drawn Checkmark Stamp when chit marked done */}
        {showCheckmarkStamp && (
          <div
            aria-hidden="true"
            className="fixed inset-0 pointer-events-none flex items-center justify-center z-40 animate-stamp-flash"
          >
            <div className="flex flex-col items-center justify-center p-4">
              <svg
                width="84"
                height="84"
                viewBox="0 0 84 84"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* Hand-drawn circular stamp */}
                <circle
                  cx="42"
                  cy="42"
                  r="34"
                  stroke="var(--accent-blue)"
                  strokeWidth="3.4"
                  strokeDasharray="180"
                  strokeLinecap="round"
                />
                {/* Confident hand-drawn checkmark */}
                <path
                  d="M 26 42 L 37 53 L 58 29"
                  stroke="var(--accent-blue)"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>
        )}
      </div>

      {/* 4. Bottom Area: Dev controls on left, Done Bowl in Bottom Right */}
      <footer className="w-full px-5 pb-3 flex items-end justify-between shrink-0 pointer-events-none z-20">
        {/* Left: Dev controls if ?dev=1 */}
        <div className="pointer-events-auto">
          {isDevMode && (
            <div className="flex items-center gap-1.5 p-1 rounded-sm bg-black/5 dark:bg-white/5 border border-[var(--ink-color)]/20">
              <button
                type="button"
                onClick={handleDevResetToday}
                className="px-2 py-0.5 font-mono-chit text-[10px] rounded-xs border border-[var(--ink-color)]/30 hover:bg-black/10 dark:hover:bg-white/10 cursor-pointer"
              >
                Reset today
              </button>
              <button
                type="button"
                onClick={handleDevAdvanceDay}
                className="px-2 py-0.5 font-mono-chit text-[10px] rounded-xs border border-[var(--ink-color)]/30 hover:bg-black/10 dark:hover:bg-white/10 cursor-pointer"
              >
                +1 day {devDayOffset > 0 ? `(+${devDayOffset}d)` : ''}
              </button>
            </div>
          )}
        </div>

        {/* Right: Done Bowl (stays unchanged in bottom right) */}
        <div className="pointer-events-auto">
          <DoneBowl
            doneCount={completedTopicIds.size}
            totalCount={topics.length}
            isSettling={isDoneSettling}
          />
        </div>
      </footer>

      {/* 5. Calendar Overlay Modal */}
      <CalendarModal
        isOpen={isCalendarOpen}
        onClose={() => setIsCalendarOpen(false)}
        history={history}
        topics={topics}
        todayStr={todayStr}
      />

      {/* 6. Curriculum Overlay Modal */}
      <CurriculumModal
        isOpen={isCurriculumOpen}
        onClose={() => setIsCurriculumOpen(false)}
        topics={topics}
        history={history}
        onImportData={handleImportData}
      />

      <style>{`
        @keyframes stampFlash {
          0% {
            transform: scale(0.6) rotate(-10deg);
            opacity: 0;
          }
          30% {
            transform: scale(1.1) rotate(4deg);
            opacity: 1;
          }
          60% {
            transform: scale(1.0) rotate(0deg);
            opacity: 0.95;
          }
          100% {
            transform: scale(1.05) translateY(-8px);
            opacity: 0;
          }
        }
        .animate-stamp-flash {
          animation: stampFlash 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
    </div>
  );
}
