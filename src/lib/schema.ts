import { sql } from "drizzle-orm";
import {
  text,
  integer,
  sqliteTable,
  uniqueIndex,
  primaryKey,
} from "drizzle-orm/sqlite-core";

// ===== NextAuth Tables (must match @auth/drizzle-adapter expectations) =====

export const users = sqliteTable("user", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name"),
  email: text("email").unique(),
  emailVerified: integer("emailVerified", { mode: "timestamp_ms" }),
  image: text("image"),
});

export const accounts = sqliteTable(
  "account",
  {
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("providerAccountId").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (account) => [
    primaryKey({ columns: [account.provider, account.providerAccountId] }),
  ]
);

export const sessions = sqliteTable("session", {
  sessionToken: text("sessionToken").primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: integer("expires", { mode: "timestamp_ms" }).notNull(),
});

export const verificationTokens = sqliteTable(
  "verificationToken",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: integer("expires", { mode: "timestamp_ms" }).notNull(),
  },
  (t) => [primaryKey({ columns: [t.identifier, t.token] })]
);

// ===== App Tables =====

export const childProfiles = sqliteTable("child_profiles", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  age: integer("age").notNull(),
  interests: text("interests").default("[]"),
  challenges: text("challenges").default(""),
  createdAt: text("created_at").default(sql`(datetime('now'))`),
});

export const partnerLinks = sqliteTable("partner_links", {
  id: text("id").primaryKey(),
  userAId: text("user_a_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  userBId: text("user_b_id").references(() => users.id, {
    onDelete: "cascade",
  }),
  inviteToken: text("invite_token").unique(),
  inviteEmail: text("invite_email"),
  status: text("status", { enum: ["pending", "active"] })
    .notNull()
    .default("pending"),
  createdAt: text("created_at").default(sql`(datetime('now'))`),
});

export const collectionMoments = sqliteTable("collection_moments", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  childId: text("child_id").references(() => childProfiles.id, {
    onDelete: "set null",
  }),
  type: text("type", {
    enum: [
      "morning",
      "transition",
      "afterschool",
      "play",
      "bedtime",
      "holdonto",
      "custom",
    ],
  })
    .notNull()
    .default("custom"),
  title: text("title").notNull(),
  description: text("description").notNull().default(""),
  active: integer("active", { mode: "boolean" }).notNull().default(true),
  source: text("source", { enum: ["default", "ai", "manual"] })
    .notNull()
    .default("manual"),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: text("created_at").default(sql`(datetime('now'))`),
});

export const dailyLogs = sqliteTable(
  "daily_logs",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    momentId: text("moment_id")
      .notNull()
      .references(() => collectionMoments.id, { onDelete: "cascade" }),
    date: text("date").notNull(),
    completed: integer("completed", { mode: "boolean" })
      .notNull()
      .default(false),
    note: text("note"),
    completedAt: text("completed_at"),
  },
  (t) => [uniqueIndex("user_moment_date_idx").on(t.userId, t.momentId, t.date)]
);

export const reflections = sqliteTable("reflections", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  date: text("date").notNull(),
  mood: text("mood", {
    enum: ["connected", "struggling", "mixed", "growing"],
  }).notNull(),
  note: text("note").default(""),
  createdAt: text("created_at").default(sql`(datetime('now'))`),
});

// Types
export type User = typeof users.$inferSelect;
export type ChildProfile = typeof childProfiles.$inferSelect;
export type PartnerLink = typeof partnerLinks.$inferSelect;
export type CollectionMoment = typeof collectionMoments.$inferSelect;
export type DailyLog = typeof dailyLogs.$inferSelect;
export type Reflection = typeof reflections.$inferSelect;
export type MomentType = CollectionMoment["type"];
export type Mood = Reflection["mood"];
