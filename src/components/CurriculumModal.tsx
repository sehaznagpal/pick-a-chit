import React, { useState, useEffect, useRef } from 'react';
import { Topic } from '../data/topics';
import { HistoryMap } from '../utils/storage';
import { X, Check, Download, Upload } from 'lucide-react';

interface CurriculumModalProps {
  isOpen: boolean;
  onClose: () => void;
  topics: Topic[];
  history: HistoryMap;
  onImportData: (data: { topics?: Topic[]; history?: HistoryMap }) => void;
}

export const CurriculumModal: React.FC<CurriculumModalProps> = ({
  isOpen,
  onClose,
  topics,
  history,
  onImportData,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [importStatus, setImportStatus] = useState<string | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Set of completed topic IDs
  const completedTopicIds = new Set<string>();
  Object.values(history).forEach((entry) => {
    if (Array.isArray(entry)) {
      entry.forEach((item) => {
        if (item.doneAt) {
          completedTopicIds.add(item.topicId);
        }
      });
    } else if (entry && typeof entry === 'object' && (entry as { doneAt?: number }).doneAt) {
      completedTopicIds.add((entry as { topicId: string }).topicId);
    }
  });

  const doneCount = completedTopicIds.size;
  const totalCount = topics.length;

  // Group topics by unit
  const unitsMap: Record<string, Topic[]> = {};
  topics.forEach((t) => {
    const unit = t.unit || 'General';
    if (!unitsMap[unit]) {
      unitsMap[unit] = [];
    }
    unitsMap[unit].push(t);
  });

  // Handle Export
  const handleExport = () => {
    const exportPayload = {
      exportedAt: new Date().toISOString(),
      topics,
      history,
    };
    const blob = new Blob([JSON.stringify(exportPayload, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `pick-a-chit-data-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Handle Import
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (Array.isArray(parsed)) {
          onImportData({ topics: parsed });
          setImportStatus('Topics imported');
        } else if (parsed && typeof parsed === 'object') {
          onImportData({
            topics: parsed.topics,
            history: parsed.history,
          });
          setImportStatus('Data imported');
        }
        setTimeout(() => setImportStatus(null), 2500);
      } catch (err) {
        console.error('Invalid JSON file', err);
        setImportStatus('Error importing JSON');
        setTimeout(() => setImportStatus(null), 2500);
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Curriculum overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/50 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-[500px] max-h-[92dvh] flex flex-col rounded-xl border-[2.5px] border-[var(--ink-color)] bg-[var(--modal-bg)] text-[var(--ink-color)] shadow-none overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b-2 border-[var(--ink-color)]/20">
          <div className="flex items-baseline gap-2">
            <span className="font-title font-bold text-base">Curriculum</span>
            <span className="font-mono-chit text-[12px] opacity-70">
              {doneCount}/{totalCount}
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close curriculum"
            className="p-1 rounded-md hover:bg-black/10 dark:hover:bg-white/10 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-blue)]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Units List */}
        <div className="p-4 overflow-y-auto custom-scrollbar flex-1 flex flex-col gap-6">
          {Object.entries(unitsMap).map(([unitName, unitTopics]) => {
            const unitDoneCount = unitTopics.filter((t) =>
              completedTopicIds.has(t.id)
            ).length;

            return (
              <div key={unitName} className="flex flex-col gap-2">
                {/* Unit Section Title */}
                <div className="flex items-center justify-between pb-1 border-b border-[var(--ink-color)]/20">
                  <h2 className="font-title text-[13px] font-bold uppercase tracking-wider text-[var(--ink-color)]">
                    {unitName}
                  </h2>
                  <span className="font-mono-chit text-[11px] opacity-60">
                    {unitDoneCount}/{unitTopics.length}
                  </span>
                </div>

                {/* Topics in this unit */}
                <div className="flex flex-col gap-1.5 pt-1">
                  {unitTopics.map((item) => {
                    const isDone = completedTopicIds.has(item.id);
                    return (
                      <div
                        key={item.id}
                        className={`p-2.5 rounded-lg border transition-colors flex items-start gap-2.5 ${
                          isDone
                            ? 'border-[var(--ink-color)]/15 bg-[var(--card-bg)]/40 opacity-70'
                            : 'border-[var(--ink-color)]/25 bg-[var(--card-bg)] hover:border-[var(--ink-color)]/40'
                        }`}
                      >
                        {/* Checkbox indicator */}
                        <div
                          className={`mt-0.5 w-4 h-4 rounded-xs border-2 flex items-center justify-center shrink-0 ${
                            isDone
                              ? 'border-[var(--accent-blue)] bg-[var(--accent-blue)] text-white dark:text-[#1C1C1E]'
                              : 'border-[var(--ink-color)]/50 bg-transparent'
                          }`}
                        >
                          {isDone && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>

                        {/* Topic Text */}
                        <div className="flex-1 min-w-0">
                          <p
                            className={`font-mono-chit text-[12px] leading-snug text-[var(--ink-color)] ${
                              isDone ? 'line-through opacity-65' : 'font-medium'
                            }`}
                          >
                            {item.topic}
                          </p>
                          {item.covers && (
                            <p className="font-mono-chit text-[10px] text-[var(--ink-color)] opacity-55 mt-1 line-clamp-1">
                              {item.covers}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer: Export / Import */}
        <div className="p-3 border-t-2 border-[var(--ink-color)]/20 bg-[var(--modal-bg)] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleExport}
              aria-label="Export topics and history as JSON"
              className="py-1.5 px-3 rounded-md border border-[var(--ink-color)] bg-[var(--card-bg)] text-[var(--ink-color)] font-mono-chit text-[11px] font-medium flex items-center gap-1.5 cursor-pointer hover:bg-black/10 dark:hover:bg-white/10 outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-blue)] active:scale-95"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export</span>
            </button>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              aria-label="Import topics and history from JSON"
              className="py-1.5 px-3 rounded-md border border-[var(--ink-color)] bg-[var(--card-bg)] text-[var(--ink-color)] font-mono-chit text-[11px] font-medium flex items-center gap-1.5 cursor-pointer hover:bg-black/10 dark:hover:bg-white/10 outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-blue)] active:scale-95"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Import</span>
            </button>

            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>

          {importStatus && (
            <span className="font-mono-chit text-[11px] text-[var(--accent-blue)] font-semibold">
              {importStatus}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
