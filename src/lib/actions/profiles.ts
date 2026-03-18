"use server";

import { revalidatePath } from "next/cache";
import { eq, and } from "drizzle-orm";
import { db } from "@/lib/db";
import { childProfiles, partnerLinks, users } from "@/lib/schema";
import { auth } from "@/lib/auth";
import { generateId } from "@/lib/utils";
import type { ChildProfile } from "@/lib/schema";

async function requireUserId(): Promise<string> {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated");
  return session.user.id;
}

export type CreateChildInput = {
  name: string;
  age: number;
  interests: string[];
  challenges: string;
};

export async function createChildProfile(
  data: CreateChildInput
): Promise<ChildProfile> {
  const userId = await requireUserId();

  const [profile] = await db
    .insert(childProfiles)
    .values({
      id: generateId(),
      userId,
      name: data.name,
      age: data.age,
      interests: JSON.stringify(data.interests),
      challenges: data.challenges,
    })
    .returning();

  revalidatePath("/settings");
  return profile;
}

export async function updateChildProfile(
  id: string,
  data: Partial<CreateChildInput>
): Promise<ChildProfile> {
  const userId = await requireUserId();

  const updateData: Partial<{
    name: string;
    age: number;
    interests: string;
    challenges: string;
  }> = {};

  if (data.name !== undefined) updateData.name = data.name;
  if (data.age !== undefined) updateData.age = data.age;
  if (data.interests !== undefined)
    updateData.interests = JSON.stringify(data.interests);
  if (data.challenges !== undefined) updateData.challenges = data.challenges;

  const [profile] = await db
    .update(childProfiles)
    .set(updateData)
    .where(and(eq(childProfiles.id, id), eq(childProfiles.userId, userId)))
    .returning();

  revalidatePath("/settings");
  return profile;
}

export async function deleteChildProfile(id: string): Promise<void> {
  const userId = await requireUserId();

  await db
    .delete(childProfiles)
    .where(and(eq(childProfiles.id, id), eq(childProfiles.userId, userId)));

  revalidatePath("/settings");
}

export async function getChildProfiles(): Promise<ChildProfile[]> {
  const userId = await requireUserId();

  return db
    .select()
    .from(childProfiles)
    .where(eq(childProfiles.userId, userId));
}

export async function invitePartner(email: string): Promise<{ token: string }> {
  const userId = await requireUserId();

  const token = generateId();

  await db.insert(partnerLinks).values({
    id: generateId(),
    userAId: userId,
    inviteToken: token,
    inviteEmail: email,
    status: "pending",
  });

  return { token };
}

export async function acceptPartnerInvite(token: string): Promise<void> {
  const userId = await requireUserId();

  const [link] = await db
    .select()
    .from(partnerLinks)
    .where(eq(partnerLinks.inviteToken, token));

  if (!link || link.status !== "pending") {
    throw new Error("Invalid or expired invite");
  }

  await db
    .update(partnerLinks)
    .set({
      userBId: userId,
      status: "active",
      inviteToken: null,
    })
    .where(eq(partnerLinks.id, link.id));

  revalidatePath("/settings");
}

export async function getPartnerInfo(): Promise<{
  partnerId: string;
  partnerName: string | null;
  partnerEmail: string;
} | null> {
  const userId = await requireUserId();

  const links = await db
    .select()
    .from(partnerLinks)
    .where(and(eq(partnerLinks.status, "active")));

  const myLink = links.find(
    (l) => l.userAId === userId || l.userBId === userId
  );
  if (!myLink) return null;

  const partnerId = myLink.userAId === userId ? myLink.userBId : myLink.userAId;
  if (!partnerId) return null;

  const [partner] = await db
    .select({ name: users.name, email: users.email })
    .from(users)
    .where(eq(users.id, partnerId));

  if (!partner) return null;

  return {
    partnerId,
    partnerName: partner.name,
    partnerEmail: partner.email ?? "",
  };
}
