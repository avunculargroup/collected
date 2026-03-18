import { nanoid } from "nanoid";
import type { DailyLog, CollectionMoment } from "./schema";

export function generateId(): string {
  return nanoid();
}

export function todayDate(): string {
  return new Date().toISOString().split("T")[0];
}

export function formatDate(date: Date): string {
  return date.toISOString().split("T")[0];
}

export function parseDate(dateStr: string): Date {
  return new Date(dateStr + "T00:00:00");
}

export function getWeekDates(startDate: Date, numDays = 7): string[] {
  return Array.from({ length: numDays }, (_, i) => {
    const d = new Date(startDate);
    d.setDate(d.getDate() + i);
    return formatDate(d);
  });
}

export function getLast4Weeks(): string[] {
  const today = new Date();
  const start = new Date(today);
  start.setDate(today.getDate() - 27); // 28 days back
  return getWeekDates(start, 28);
}

/**
 * A day counts toward streak if >= 50% of active moments were completed.
 */
export function isStreakDay(
  date: string,
  logs: DailyLog[],
  activeMoments: CollectionMoment[]
): boolean {
  if (activeMoments.length === 0) return false;
  const dayLogs = logs.filter((l) => l.date === date && l.completed);
  return dayLogs.length / activeMoments.length >= 0.5;
}

export interface StreakData {
  currentStreak: number;
  bestStreak: number;
  totalDays: number;
}

export function calculateStreak(
  logs: DailyLog[],
  moments: CollectionMoment[]
): StreakData {
  const activeMoments = moments.filter((m) => m.active);
  const today = todayDate();
  const dates = getLast4Weeks();
  const allDates = [...dates];

  // Add today if not in array
  if (!allDates.includes(today)) {
    allDates.push(today);
  }

  // Sort descending
  const sortedDates = allDates.sort().reverse();

  let currentStreak = 0;
  let bestStreak = 0;
  let tempStreak = 0;
  let totalDays = 0;

  for (const date of sortedDates) {
    if (date > today) continue;
    const isStreak = isStreakDay(date, logs, activeMoments);

    if (isStreak) {
      totalDays++;
      tempStreak++;
      if (tempStreak > bestStreak) bestStreak = tempStreak;
      // Current streak only counts consecutive days from today backward
      if (date === today || currentStreak > 0) {
        currentStreak = tempStreak;
      }
    } else {
      // Today with no completions doesn't break current streak
      if (date !== today) {
        if (currentStreak === 0) {
          // Haven't broken streak yet from today
        }
        tempStreak = 0;
        if (currentStreak > 0) break; // streak is broken
      }
    }
  }

  return { currentStreak, bestStreak, totalDays };
}

export function getDayOfWeekLabel(dateStr: string): string {
  const days = ["S", "M", "T", "W", "T", "F", "S"];
  const date = parseDate(dateStr);
  return days[date.getDay()];
}

export function getCompletionRate(
  date: string,
  logs: DailyLog[],
  activeMoments: CollectionMoment[]
): number {
  if (activeMoments.length === 0) return 0;
  const completed = logs.filter(
    (l) => l.date === date && l.completed
  ).length;
  return completed / activeMoments.length;
}
