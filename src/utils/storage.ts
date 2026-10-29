import { Topic, DEFAULT_TOPICS } from '../data/topics';

export interface ChitRecord {
  topicId: string;
  pulledAt: number;
  doneAt?: number;
}

export type HistoryMap = Record<string, ChitRecord[]>;

export const STORAGE_KEYS = {
  THEME: 'pickachit_theme',
  DEV_OFFSET: 'pickachit_dev_offset',
  HISTORY: 'pickachit_history',
  ACTIVE_TOPIC_ID: 'pickachit_active_topic_id',
  ACTIVE_TOPIC_DATE: 'pickachit_active_topic_date',
  CUSTOM_TOPICS: 'pickachit_custom_topics',
} as const;

/**
 * Returns YYYY-MM-DD string for local time with optional day offset (for dev mode)
 */
export function getLocalDateString(dayOffset = 0): string {
  const d = new Date();
  if (dayOffset !== 0) {
    d.setDate(d.getDate() + dayOffset);
  }
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getOffsetDate(dayOffset = 0): Date {
  const d = new Date();
  if (dayOffset !== 0) {
    d.setDate(d.getDate() + dayOffset);
  }
  return d;
}

/**
 * Normalizes old history format (where value was a single object) into an array of ChitRecord
 */
export function normalizeHistory(raw: unknown): HistoryMap {
  const result: HistoryMap = {};
  if (!raw || typeof raw !== 'object') return result;
  for (const [date, val] of Object.entries(raw as Record<string, unknown>)) {
    if (Array.isArray(val)) {
      result[date] = val as ChitRecord[];
    } else if (val && typeof val === 'object' && 'topicId' in (val as Record<string, unknown>)) {
      result[date] = [val as ChitRecord];
    }
  }
  return result;
}

/**
 * Calculates current streak of consecutive days with at least one completed topic.
 * Resets to 0 if a day passes with nothing completed.
 */
export function calculateStreak(history: HistoryMap, todayStr: string): number {
  const parseDate = (str: string) => {
    const [y, m, d] = str.split('-').map(Number);
    return new Date(y, m - 1, d);
  };

  const getPrevDateStr = (dateStr: string) => {
    const d = parseDate(dateStr);
    d.setDate(d.getDate() - 1);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const hasDone = (dateStr: string) => {
    const list = history[dateStr];
    return Boolean(list && list.some((item) => item.doneAt));
  };

  let streak = 0;
  let checkDateStr = todayStr;

  // If today has at least one completed chit, start counting streak from today
  if (hasDone(todayStr)) {
    streak = 1;
    checkDateStr = getPrevDateStr(todayStr);
    while (hasDone(checkDateStr)) {
      streak++;
      checkDateStr = getPrevDateStr(checkDateStr);
    }
    return streak;
  }

  // Today is not completed yet. Check if yesterday had at least one completed chit.
  const yesterdayStr = getPrevDateStr(todayStr);
  if (hasDone(yesterdayStr)) {
    checkDateStr = yesterdayStr;
    while (hasDone(checkDateStr)) {
      streak++;
      checkDateStr = getPrevDateStr(checkDateStr);
    }
    return streak;
  }

  // Yesterday had no completion either -> streak broken / 0
  return 0;
}

export function getCompletedTopicIds(history: HistoryMap): Set<string> {
  const set = new Set<string>();
  Object.values(history).forEach((list) => {
    if (Array.isArray(list)) {
      list.forEach((item) => {
        if (item.doneAt) {
          set.add(item.topicId);
        }
      });
    }
  });
  return set;
}

export function loadStoredTopics(): Topic[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CUSTOM_TOPICS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch {
    // fallback
  }
  return DEFAULT_TOPICS;
}

export function saveStoredTopics(topics: Topic[]) {
  try {
    localStorage.setItem(STORAGE_KEYS.CUSTOM_TOPICS, JSON.stringify(topics));
  } catch (err) {
    console.error('Failed to save topics to localStorage', err);
  }
}

export function loadHistory(): HistoryMap {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.HISTORY);
    if (raw) {
      return normalizeHistory(JSON.parse(raw));
    }
  } catch {
    // fallback
  }
  return {};
}

export function saveHistory(history: HistoryMap) {
  try {
    localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(history));
  } catch (err) {
    console.error('Failed to save history to localStorage', err);
  }
}
