"use server";

import { revalidatePath } from "next/cache";
import { eq, and, asc } from "drizzle-orm";
import { db } from "@/lib/db";
import { collectionMoments, dailyLogs } from "@/lib/schema";
import { auth } from "@/lib/auth";
import { generateId } from "@/lib/utils";
import type { CollectionMoment, MomentType } from "@/lib/schema";

export type CreateMomentInput = {
  type: MomentType;
  title: string;
  description: string;
  childId?: string;
  source?: "default" | "ai" | "manual";
};

async function requireUserId(): Promise<string> {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated");
  return session.user.id;
}

export async function createMoment(data: CreateMomentInput): Promise<CollectionMoment> {
  const userId = await requireUserId();

  // Get max sort order
  const existing = await db
    .select({ sortOrder: collectionMoments.sortOrder })
    .from(collectionMoments)
    .where(eq(collectionMoments.userId, userId))
    .orderBy(asc(collectionMoments.sortOrder));

  const maxOrder = existing.length > 0
    ? Math.max(...existing.map((m) => m.sortOrder))
    : 0;

  const [moment] = await db
    .insert(collectionMoments)
    .values({
      id: generateId(),
      userId,
      type: data.type,
      title: data.title,
      description: data.description,
      childId: data.childId ?? null,
      source: data.source ?? "manual",
      sortOrder: maxOrder + 1,
      active: true,
    })
    .returning();

  revalidatePath("/today");
  revalidatePath("/moments");
  return moment;
}

export async function updateMoment(
  id: string,
  data: Partial<Pick<CollectionMoment, "title" | "description" | "type" | "active">>
): Promise<CollectionMoment> {
  const userId = await requireUserId();

  const [moment] = await db
    .update(collectionMoments)
    .set(data)
    .where(and(eq(collectionMoments.id, id), eq(collectionMoments.userId, userId)))
    .returning();

  revalidatePath("/today");
  revalidatePath("/moments");
  return moment;
}

export async function deleteMoment(id: string): Promise<void> {
  const userId = await requireUserId();

  // Delete logs first
  await db
    .delete(dailyLogs)
    .where(and(eq(dailyLogs.momentId, id), eq(dailyLogs.userId, userId)));

  await db
    .delete(collectionMoments)
    .where(and(eq(collectionMoments.id, id), eq(collectionMoments.userId, userId)));

  revalidatePath("/today");
  revalidatePath("/moments");
}

export async function toggleMomentActive(id: string): Promise<CollectionMoment> {
  const userId = await requireUserId();

  const [current] = await db
    .select()
    .from(collectionMoments)
    .where(and(eq(collectionMoments.id, id), eq(collectionMoments.userId, userId)));

  if (!current) throw new Error("Moment not found");

  const [updated] = await db
    .update(collectionMoments)
    .set({ active: !current.active })
    .where(and(eq(collectionMoments.id, id), eq(collectionMoments.userId, userId)))
    .returning();

  revalidatePath("/today");
  revalidatePath("/moments");
  return updated;
}

export async function getMoments(): Promise<CollectionMoment[]> {
  const userId = await requireUserId();

  return db
    .select()
    .from(collectionMoments)
    .where(eq(collectionMoments.userId, userId))
    .orderBy(asc(collectionMoments.sortOrder));
}

export async function seedDefaultMoments(userId: string): Promise<void> {
  const existing = await db
    .select({ id: collectionMoments.id })
    .from(collectionMoments)
    .where(eq(collectionMoments.userId, userId));

  if (existing.length > 0) return; // Already seeded

  const defaults: CreateMomentInput[] = [
    {
      type: "morning",
      title: "Morning eye contact greeting",
      description:
        "Before the day begins, find their eyes with yours and smile. Let them know they are the first thing on your mind.",
      source: "default",
    },
    {
      type: "transition",
      title: "Joyful pickup greeting",
      description:
        "When you pick them up, be genuinely glad to see them before asking about their day. Your face is their signal that all is well.",
      source: "default",
    },
    {
      type: "afterschool",
      title: "Decompression snack time",
      description:
        "Sit together with a snack for 5–10 minutes. Let them lead. Don't push for information — just be present.",
      source: "default",
    },
    {
      type: "play",
      title: "Follow their lead play",
      description:
        "Give them 15 minutes where they choose the activity and you follow. No phones. No directing. Pure togetherness.",
      source: "default",
    },
    {
      type: "bedtime",
      title: "Day's best moment ritual",
      description:
        "At bedtime, share the best part of your day and invite them to share theirs. End with something warm and predictable.",
      source: "default",
    },
  ];

  for (let i = 0; i < defaults.length; i++) {
    await db.insert(collectionMoments).values({
      id: generateId(),
      userId,
      type: defaults[i].type,
      title: defaults[i].title,
      description: defaults[i].description,
      source: "default",
      sortOrder: i + 1,
      active: true,
      childId: null,
    });
  }
}
