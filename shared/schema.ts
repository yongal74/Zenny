import { sql } from "drizzle-orm";
import {
  pgTable,
  text,
  varchar,
  serial,
  integer,
  boolean,
  timestamp,
  date,
  real,
  jsonb,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  displayName: text("display_name"),
  onboardingCompleted: boolean("onboarding_completed").default(false),
  personalityProfile: jsonb("personality_profile"),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const characters = pgTable("characters", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id")
    .notNull()
    .references(() => users.id),
  name: text("name").notNull(),
  species: text("species").notNull().default("cloud"),
  evolutionStage: integer("evolution_stage").notNull().default(1),
  level: integer("level").notNull().default(1),
  totalExp: integer("total_exp").notNull().default(0),
  currentMood: jsonb("current_mood").default({}),
  visualState: jsonb("visual_state").default({}),
  emotionGrowth: integer("emotion_growth").notNull().default(0),
  feelingGrowth: integer("feeling_growth").notNull().default(0),
  stressManagement: integer("stress_management").notNull().default(0),
  spiritualGrowth: integer("spiritual_growth").notNull().default(0),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const emotionLogs = pgTable("emotion_logs", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id")
    .notNull()
    .references(() => users.id),
  emotions: jsonb("emotions").notNull().default([]),
  tags: jsonb("tags").default([]),
  note: text("note"),
  loggedAt: timestamp("logged_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const feelingLogs = pgTable("feeling_logs", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id")
    .notNull()
    .references(() => users.id),
  bodyParts: jsonb("body_parts").default([]),
  sensations: jsonb("sensations").default([]),
  energyLevel: integer("energy_level").notNull().default(3),
  freeText: text("free_text"),
  linkedEmotionLogId: integer("linked_emotion_log_id"),
  loggedAt: timestamp("logged_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const structuredCheckins = pgTable("structured_checkins", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id")
    .notNull()
    .references(() => users.id),
  scene: text("scene").notNull(),
  emotions: text("emotions").notNull(),
  bodyFeeling: text("body_feeling").notNull(),
  pattern: text("pattern"),
  aiFeedback: text("ai_feedback"),
  loggedAt: timestamp("logged_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const quests = pgTable("quests", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id")
    .notNull()
    .references(() => users.id),
  type: text("type").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull().default("refresh"),
  expReward: integer("exp_reward").notNull().default(10),
  status: text("status").notNull().default("suggested"),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const conversations = pgTable("conversations", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id),
  title: text("title").notNull(),
  mode: text("mode").notNull().default("chat"),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  conversationId: integer("conversation_id")
    .notNull()
    .references(() => conversations.id, { onDelete: "cascade" }),
  role: text("role").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const weeklyReports = pgTable("weekly_reports", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id")
    .notNull()
    .references(() => users.id),
  characterId: integer("character_id")
    .notNull()
    .references(() => characters.id),
  weekStart: date("week_start").notNull(),
  weekEnd: date("week_end").notNull(),
  letterContent: text("letter_content").notNull(),
  topEmotions: jsonb("top_emotions").default([]),
  patternsFound: jsonb("patterns_found"),
  growthSummary: jsonb("growth_summary").default({}),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const breathingSessions = pgTable("breathing_sessions", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id")
    .notNull()
    .references(() => users.id),
  durationSeconds: integer("duration_seconds").notNull().default(60),
  narrationContent: text("narration_content"),
  completedAt: timestamp("completed_at")
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type Character = typeof characters.$inferSelect;
export type EmotionLog = typeof emotionLogs.$inferSelect;
export type FeelingLog = typeof feelingLogs.$inferSelect;
export type StructuredCheckin = typeof structuredCheckins.$inferSelect;
export type Quest = typeof quests.$inferSelect;
export type Conversation = typeof conversations.$inferSelect;
export type Message = typeof messages.$inferSelect;
export type WeeklyReport = typeof weeklyReports.$inferSelect;
export type BreathingSession = typeof breathingSessions.$inferSelect;
