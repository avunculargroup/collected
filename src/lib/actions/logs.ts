"use server";

import { revalidatePath } from "next/cache";
import { eq, and, gte, lte } from "drizzle-orm";
import { db } from "@/lib/db";
import { dailyLogs, collectionMoments, reflections } from "@/lib/schema";
import { auth } from "@/lib/auth";
import { generateId, todayDate, getLast4Weeks, getCompletionRate } from "@/lib/utils";
import type { DailyLog, Reflection, Mood, CollectionMoment } from "@/lib/schema";

async function requireUserId(): Promise<string> {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated");
  return session.user.id;
}

export async function toggleLog(
  momentId: string,
  date: string
): Promise<DailyLog> {
  const userId = await requireUserId();

  const existing = await db
    .select()
    .from(dailyLogs)
    .where(
      and(
        eq(dailyLogs.userId, userId),
        eq(dailyLogs.momentId, momentId),
        eq(dailyLogs.date, date)
      )
    );

  if (existing.length > 0) {
    const current = existing[0];
    const [updated] = await db
      .update(dailyLogs)
      .set({
        completed: !current.completed,
        completedAt: !current.completed ? new Date().toISOString() : null,
      })
      .where(eq(dailyLogs.id, current.id))
      .returning();

    revalidatePath("/today");
    return updated;
  }

  const [log] = await db
    .insert(dailyLogs)
    .values({
      id: generateId(),
      userId,
      momentId,
      date,
      completed: true,
      completedAt: new Date().toISOString(),
    })
    .returning();

  revalidatePath("/today");
  return log;
}

export async function addReflection(
  date: string,
  mood: Mood,
  note: string
): Promise<Reflection> {
  const userId = await requireUserId();

  // Upsert reflection for the day
  const existing = await db
    .select()
    .from(reflections)
    .where(and(eq(reflections.userId, userId), eq(reflections.date, date)));

  if (existing.length > 0) {
    const [updated] = await db
      .update(reflections)
      .set({ mood, note })
      .where(eq(reflections.id, existing[0].id))
      .returning();
    revalidatePath("/today");
    return updated;
  }

  const [reflection] = await db
    .insert(reflections)
    .values({
      id: generateId(),
      userId,
      date,
      mood,
      note,
    })
    .returning();

  revalidatePath("/today");
  return reflection;
}

export type WeekLogData = {
  date: string;
  completionRate: number;
  completedCount: number;
  totalActive: number;
}[];

export async function getWeekLogs(startDate: string): Promise<WeekLogData> {
  const userId = await requireUserId();

  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + 6);
  const endDateStr = endDate.toISOString().split("T")[0];

  const [logs, moments] = await Promise.all([
    db
      .select()
      .from(dailyLogs)
      .where(
        and(
          eq(dailyLogs.userId, userId),
          gte(dailyLogs.date, startDate),
          lte(dailyLogs.date, endDateStr)
        )
      ),
    db
      .select()
      .from(collectionMoments)
      .where(and(eq(collectionMoments.userId, userId), eq(collectionMoments.active, true))),
  ]);

  const result: WeekLogData = [];
  const current = new Date(startDate);
  while (current.toISOString().split("T")[0] <= endDateStr) {
    const date = current.toISOString().split("T")[0];
    const rate = getCompletionRate(date, logs, moments);
    result.push({
      date,
      completionRate: rate,
      completedCount: logs.filter((l) => l.date === date && l.completed).length,
      totalActive: moments.length,
    });
    current.setDate(current.getDate() + 1);
  }

  return result;
}

export type StreakInfo = {
  currentStreak: number;
  bestStreak: number;
  totalDays: number;
};

export async function getStreakData(userId?: string): Promise<StreakInfo> {
  const resolvedUserId = userId ?? (await requireUserId());

  const allDates = getLast4Weeks();
  const startDate = allDates[0];
  const endDate = allDates[allDates.length - 1];

  const [logs, moments] = await Promise.all([
    db
      .select()
      .from(dailyLogs)
      .where(
        and(
          eq(dailyLogs.userId, resolvedUserId),
          gte(dailyLogs.date, startDate),
          lte(dailyLogs.date, endDate)
        )
      ),
    db
      .select()
      .from(collectionMoments)
      .where(
        and(
          eq(collectionMoments.userId, resolvedUserId),
          eq(collectionMoments.active, true)
        )
      ),
  ]);

  const today = todayDate();
  const sortedDates = [...allDates].sort().reverse();
  const activeMoments = moments.filter((m) => m.active);

  let currentStreak = 0;
  let bestStreak = 0;
  let tempStreak = 0;
  let totalDays = 0;
  let currentStreakDone = false;

  for (const date of sortedDates) {
    if (date > today) continue;
    const rate = getCompletionRate(date, logs, activeMoments);
    const isStreak = activeMoments.length > 0 && rate >= 0.5;

    if (isStreak) {
      totalDays++;
      tempStreak++;
      if (tempStreak > bestStreak) bestStreak = tempStreak;
      if (!currentStreakDone) currentStreak = tempStreak;
    } else {
      if (date !== today) {
        // Only break current streak if it's not today (partial days allowed)
        currentStreakDone = true;
        tempStreak = 0;
      }
    }
  }

  return { currentStreak, bestStreak, totalDays };
}

export async function getTodayCompletions(date: string): Promise<DailyLog[]> {
  const userId = await requireUserId();

  return db
    .select()
    .from(dailyLogs)
    .where(and(eq(dailyLogs.userId, userId), eq(dailyLogs.date, date)));
}

export type MomentWithLog = CollectionMoment & {
  log: DailyLog | null;
};

export async function getTodayMoments(date: string): Promise<MomentWithLog[]> {
  const userId = await requireUserId();

  const [moments, logs] = await Promise.all([
    db
      .select()
      .from(collectionMoments)
      .where(
        and(eq(collectionMoments.userId, userId), eq(collectionMoments.active, true))
      )
      .orderBy(collectionMoments.sortOrder),
    db
      .select()
      .from(dailyLogs)
      .where(and(eq(dailyLogs.userId, userId), eq(dailyLogs.date, date))),
  ]);

  return moments.map((moment) => ({
    ...moment,
    log: logs.find((l) => l.momentId === moment.id) ?? null,
  }));
}

export async function getMonthLogs(): Promise<WeekLogData> {
  const userId = await requireUserId();
  const allDates = getLast4Weeks();
  const startDate = allDates[0];
  const endDate = allDates[allDates.length - 1];

  const [logs, moments] = await Promise.all([
    db
      .select()
      .from(dailyLogs)
      .where(
        and(
          eq(dailyLogs.userId, userId),
          gte(dailyLogs.date, startDate),
          lte(dailyLogs.date, endDate)
        )
      ),
    db
      .select()
      .from(collectionMoments)
      .where(
        and(eq(collectionMoments.userId, userId), eq(collectionMoments.active, true))
      ),
  ]);

  return allDates.map((date) => ({
    date,
    completionRate: getCompletionRate(date, logs, moments),
    completedCount: logs.filter((l) => l.date === date && l.completed).length,
    totalActive: moments.length,
  }));
}
