import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import { db } from "@/lib/db";
import { dailyLogs, collectionMoments } from "@/lib/schema";
import { and, eq, gte, lte } from "drizzle-orm";
import { getCompletionRate } from "@/lib/utils";

export const assessProgressTool = createTool({
  id: "assess-progress",
  description:
    "Analyzes a user's collection practice over a date range. Returns completion rates, streak data, patterns by moment type, and personalized encouragement. Use when a parent asks how they're doing or wants to reflect on their practice.",
  inputSchema: z.object({
    userId: z.string().describe("The user's ID"),
    startDate: z
      .string()
      .describe("Start of date range in YYYY-MM-DD format"),
    endDate: z.string().describe("End of date range in YYYY-MM-DD format"),
  }),
  outputSchema: z.object({
    completionRate: z.number().describe("Overall completion rate 0-1"),
    currentStreak: z.number(),
    bestStreak: z.number(),
    strongestMomentType: z.string(),
    weakestMomentType: z.string(),
    totalCheckins: z.number(),
    pattern: z
      .string()
      .describe("Natural language insight about their practice patterns"),
    encouragement: z
      .string()
      .describe("Warm, specific praise for their efforts"),
  }),
  execute: async (inputData) => {
    const { userId, startDate, endDate } = inputData;

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
          and(
            eq(collectionMoments.userId, userId),
            eq(collectionMoments.active, true)
          )
        ),
    ]);

    const activeMoments = moments.filter((m) => m.active);
    if (activeMoments.length === 0) {
      return {
        completionRate: 0,
        currentStreak: 0,
        bestStreak: 0,
        strongestMomentType: "none",
        weakestMomentType: "none",
        totalCheckins: 0,
        pattern: "No active moments found. Try adding some collection moments to get started.",
        encouragement:
          "The fact that you're here means you care. That already sets you apart.",
      };
    }

    const completedLogs = logs.filter((l) => l.completed);
    const totalCheckins = completedLogs.length;

    // Calculate completion rate
    const dateRange = getDatesInRange(startDate, endDate);
    const totalPossible = dateRange.length * activeMoments.length;
    const completionRate = totalPossible > 0 ? totalCheckins / totalPossible : 0;

    // Streaks
    let currentStreak = 0;
    let bestStreak = 0;
    let tempStreak = 0;
    const today = new Date().toISOString().split("T")[0];
    const sortedDates = [...dateRange].sort().reverse();

    for (const date of sortedDates) {
      if (date > today) continue;
      const rate = getCompletionRate(date, logs, activeMoments);
      if (rate >= 0.5) {
        tempStreak++;
        if (tempStreak > bestStreak) bestStreak = tempStreak;
        if (currentStreak === tempStreak - 1) currentStreak = tempStreak;
      } else if (date !== today) {
        if (currentStreak === 0) currentStreak = 0;
        tempStreak = 0;
      }
    }

    // Per-type analysis
    const typeStats: Record<string, { completed: number; total: number }> = {};
    for (const moment of activeMoments) {
      const typeLogs = completedLogs.filter((l) => l.momentId === moment.id);
      const type = moment.type;
      if (!typeStats[type]) typeStats[type] = { completed: 0, total: 0 };
      typeStats[type].completed += typeLogs.length;
      typeStats[type].total += dateRange.length;
    }

    const typeRates = Object.entries(typeStats)
      .filter(([, s]) => s.total > 0)
      .map(([type, s]) => ({ type, rate: s.completed / s.total }))
      .sort((a, b) => b.rate - a.rate);

    const strongestMomentType = typeRates[0]?.type ?? "none";
    const weakestMomentType = typeRates[typeRates.length - 1]?.type ?? "none";

    // Generate pattern insight
    const pattern = generatePatternInsight(
      completionRate,
      currentStreak,
      strongestMomentType,
      weakestMomentType,
      dateRange.length
    );

    const encouragement = generateEncouragement(
      completionRate,
      currentStreak,
      totalCheckins
    );

    return {
      completionRate,
      currentStreak,
      bestStreak,
      strongestMomentType,
      weakestMomentType,
      totalCheckins,
      pattern,
      encouragement,
    };
  },
});

function getDatesInRange(start: string, end: string): string[] {
  const dates: string[] = [];
  const current = new Date(start + "T12:00:00");
  const endDate = new Date(end + "T12:00:00");
  while (current <= endDate) {
    dates.push(current.toISOString().split("T")[0]);
    current.setDate(current.getDate() + 1);
  }
  return dates;
}

function generatePatternInsight(
  rate: number,
  streak: number,
  strongest: string,
  weakest: string,
  days: number
): string {
  const typeLabels: Record<string, string> = {
    morning: "mornings",
    transition: "transitions",
    afterschool: "after-school time",
    play: "play time",
    bedtime: "bedtimes",
    holdonto: "separation bridging",
    custom: "custom moments",
  };

  const strongLabel = typeLabels[strongest] ?? strongest;
  const weakLabel = typeLabels[weakest] ?? weakest;

  if (rate >= 0.9) {
    return `Outstanding consistency over ${days} days. ${capitalize(strongLabel)} are your strongest area${strongest !== weakest ? `, while ${weakLabel} has some room to grow` : ""}. Your child is getting a powerful, reliable message of connection.`;
  } else if (rate >= 0.7) {
    return `Strong practice over ${days} days — you're completing ${Math.round(rate * 100)}% of your moments. ${capitalize(strongLabel)} are where you shine. When life gets busy, ${weakLabel} sometimes slip through. That's human.`;
  } else if (rate >= 0.5) {
    return `You're completing about half your moments, which is real, meaningful connection. ${capitalize(strongLabel)} tend to happen reliably. ${capitalize(weakLabel)} are harder — consider whether the moment needs adapting to fit your real life.`;
  } else if (rate >= 0.25) {
    return `Life has been full lately — your completion rate is ${Math.round(rate * 100)}%. Even partial practice keeps the attachment thread alive. ${capitalize(strongLabel)} are your anchor right now. Start there and let the rest follow.`;
  } else {
    return `You're in a tough stretch, and even looking at this data shows you care. One moment done with full presence is worth ten done half-heartedly. Pick the one that feels most natural and start there.`;
  }
}

function generateEncouragement(
  rate: number,
  streak: number,
  totalCheckins: number
): string {
  if (streak >= 14) {
    return `${streak} days in a row is extraordinary. Your child is building an internal working model of you as reliably present — that shapes how they relate to the world for life.`;
  } else if (streak >= 7) {
    return `A week-long streak is real habit formation. What you're building isn't just routine — it's the felt sense in your child that they matter to you every single day.`;
  } else if (streak >= 3) {
    return `Three or more days in a row means something is clicking. Consistency doesn't require perfection — it requires showing up most of the time. You're doing it.`;
  } else if (totalCheckins >= 10) {
    return `${totalCheckins} collection moments means ${totalCheckins} times your child felt found. That accumulates. Even if the days aren't consecutive, the message is getting through.`;
  } else if (totalCheckins >= 1) {
    return `Every check-in is a vote for the relationship. You showed up ${totalCheckins} time${totalCheckins !== 1 ? "s" : ""}, and that counts more than you might think.`;
  } else {
    return `You're here, looking at this, thinking about connection. That intention already matters. The first step is often the hardest. Tomorrow is a fresh page.`;
  }
}

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
