import React, { useState, useEffect } from 'react';
import { HistoryMap } from '../utils/storage';
import { Topic } from '../data/topics';
import { ChevronLeft, ChevronRight, X, ChevronDown, ChevronUp } from 'lucide-react';

interface CalendarModalProps {
  isOpen: boolean;
  onClose: () => void;
  history: HistoryMap;
  topics: Topic[];
  todayStr: string;
}

export const CalendarModal: React.FC<CalendarModalProps> = ({
  isOpen,
  onClose,
  history,
  topics,
  todayStr,
}) => {
  // Current calendar month/year view state
  const [currentYear, setCurrentYear] = useState(() => {
    const [y] = todayStr.split('-').map(Number);
    return y || new Date().getFullYear();
  });
  const [currentMonth, setCurrentMonth] = useState(() => {
    const [, m] = todayStr.split('-').map(Number);
    return m ? m - 1 : new Date().getMonth();
  });

  const [selectedDateStr, setSelectedDateStr] = useState<string>(todayStr);
  const [expandedChitIdx, setExpandedChitIdx] = useState<number | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Reset expanded row when switching selected date
  useEffect(() => {
    setExpandedChitIdx(null);
  }, [selectedDateStr]);

  if (!isOpen) return null;

  const topicsById = new Map(topics.map((t) => [t.id, t]));

  // Month navigation
  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  // Calendar generation for currentMonth
  const firstDayOfWeek = new Date(currentYear, currentMonth, 1).getDay(); // 0 is Sunday
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const daysArray: (number | null)[] = [];
  for (let i = 0; i < firstDayOfWeek; i++) {
    daysArray.push(null);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    daysArray.push(d);
  }

  // Selected date's list of chits
  const dayItems = history[selectedDateStr] || [];
  const completedDayItems = dayItems.filter((i) => i.doneAt);

  const formatTime = (ts: number) => {
    const date = new Date(ts);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Daily ritual calendar"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/50 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-[430px] max-h-[92dvh] flex flex-col rounded-xl border-[2.5px] border-[var(--ink-color)] bg-[var(--modal-bg)] text-[var(--ink-color)] shadow-none overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-3.5 border-b-2 border-[var(--ink-color)]/20">
          <div className="flex items-center gap-2">
            <span className="font-title font-bold text-base">
              {monthNames[currentMonth]} {currentYear}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={prevMonth}
              aria-label="Previous month"
              className="p-1 rounded-md hover:bg-black/10 dark:hover:bg-white/10 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-blue)]"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={nextMonth}
              aria-label="Next month"
              className="p-1 rounded-md hover:bg-black/10 dark:hover:bg-white/10 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-blue)]"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close calendar"
              className="ml-2 p-1 rounded-md hover:bg-black/10 dark:hover:bg-white/10 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-blue)]"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Month Grid & Details */}
        <div className="p-3.5 overflow-y-auto custom-scrollbar flex-1 flex flex-col gap-3">
          {/* Day of Week Headers */}
          <div className="grid grid-cols-7 text-center font-mono-chit text-[11px] opacity-60">
            <span>Su</span>
            <span>Mo</span>
            <span>Tu</span>
            <span>We</span>
            <span>Th</span>
            <span>Fr</span>
            <span>Sa</span>
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1 text-center">
            {daysArray.map((day, idx) => {
              if (day === null) {
                return <div key={`empty-${idx}`} className="h-9 w-9" />;
              }

              const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
              const isToday = dateStr === todayStr;
              const isSelected = dateStr === selectedDateStr;
              const records = history[dateStr] || [];
              const doneCount = records.filter((r) => r.doneAt).length;
              const isPulledIncomplete = records.some((r) => !r.doneAt);

              return (
                <button
                  type="button"
                  key={dateStr}
                  onClick={() => setSelectedDateStr(dateStr)}
                  className={`h-9 w-9 mx-auto rounded-full flex flex-col items-center justify-center relative cursor-pointer font-mono-chit text-[12px] transition-colors outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-blue)] ${
                    isSelected
                      ? 'bg-[var(--ink-color)] text-[var(--modal-bg)] font-bold'
                      : 'hover:bg-black/10 dark:hover:bg-white/10'
                  } ${
                    isToday && !isSelected
                      ? 'ring-2 ring-[var(--accent-blue)] ring-offset-1 ring-offset-[var(--modal-bg)]'
                      : ''
                  }`}
                >
                  <span className="leading-none">{day}</span>
                  {/* Status Indicator: 1 dot, or dot + tiny count if >= 2 */}
                  <span className="absolute bottom-0.5 flex items-center justify-center gap-0.5">
                    {doneCount === 1 && (
                      <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-blue)]" />
                    )}
                    {doneCount >= 2 && (
                      <span className="flex items-center gap-0.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-blue)]" />
                        <span className="font-mono-chit text-[8px] leading-none text-[var(--accent-blue)] font-bold">
                          {doneCount}
                        </span>
                      </span>
                    )}
                    {doneCount === 0 && isPulledIncomplete && (
                      <span className="w-1.5 h-1.5 rounded-full border border-[var(--accent-blue)]" />
                    )}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Selected Day Info: Compact scrollable list of completed chits */}
          <div className="pt-2.5 border-t border-[var(--ink-color)]/20 flex flex-col">
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono-chit text-[12px] font-semibold">
                {selectedDateStr} {selectedDateStr === todayStr ? '(Today)' : ''}
              </span>
              <span className="font-mono-chit text-[11px] text-[var(--accent-blue)] font-medium">
                {completedDayItems.length > 0
                  ? `${completedDayItems.length} completed`
                  : dayItems.some((i) => !i.doneAt)
                  ? 'In progress'
                  : 'No chits'}
              </span>
            </div>

            {/* List of chits for the selected day */}
            {dayItems.length > 0 ? (
              <div className="max-h-[170px] overflow-y-auto custom-scrollbar flex flex-col gap-1.5 pr-0.5">
                {dayItems.map((record, index) => {
                  const topicObj = topicsById.get(record.topicId);
                  const isExpanded = expandedChitIdx === index;
                  const isDone = Boolean(record.doneAt);

                  return (
                    <div
                      key={`${record.topicId}-${index}`}
                      onClick={() => setExpandedChitIdx(isExpanded ? null : index)}
                      className={`p-2 rounded-lg border cursor-pointer transition-colors ${
                        isExpanded
                          ? 'border-[var(--accent-blue)] bg-[var(--card-bg)]'
                          : 'border-[var(--ink-color)]/20 bg-[var(--card-bg)] hover:border-[var(--ink-color)]/40'
                      }`}
                    >
                      {/* Compact Single Line Row: time + topic name truncated */}
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          <span className="font-mono-chit text-[10px] opacity-60 shrink-0">
                            {isDone && record.doneAt
                              ? formatTime(record.doneAt)
                              : 'pulled'}
                          </span>
                          <span
                            className={`font-mono-chit text-[12px] truncate ${
                              isDone ? 'font-medium' : 'italic opacity-75'
                            }`}
                          >
                            {topicObj ? topicObj.topic : record.topicId}
                          </span>
                        </div>
                        <div className="text-[var(--ink-color)] opacity-50 shrink-0">
                          {isExpanded ? (
                            <ChevronUp className="w-3.5 h-3.5" />
                          ) : (
                            <ChevronDown className="w-3.5 h-3.5" />
                          )}
                        </div>
                      </div>

                      {/* Expanded View: Full topic name, handwriting preview, and covers text */}
                      {isExpanded && topicObj && (
                        <div className="mt-2 pt-2 border-t border-[var(--ink-color)]/15 flex flex-col gap-1 animate-fade-in">
                          <span className="font-mono-chit text-[9px] uppercase tracking-wider opacity-60">
                            {topicObj.unit}
                          </span>
                          <p className="font-handwriting text-[18px] leading-snug text-[var(--accent-blue)] font-semibold select-text">
                            {topicObj.topic}
                          </p>
                          {topicObj.covers && (
                            <p className="font-mono-chit text-[10px] opacity-65 leading-relaxed mt-0.5 select-text">
                              covers: {topicObj.covers}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="font-mono-chit text-[11px] opacity-40 py-2">
                No topic recorded for this day.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
