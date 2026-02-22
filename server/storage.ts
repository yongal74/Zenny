import { db } from "./db";
import {
  users,
  characters,
  emotionLogs,
  feelingLogs,
  quests,
  conversations,
  messages,
  type User,
  type InsertUser,
} from "@shared/schema";
import { eq, desc, and, count } from "drizzle-orm";

export const storage = {
  async getUser(id: string) {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  },

  async getUserByUsername(username: string) {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  },

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  },

  async getCharacterByUserId(userId: string) {
    const [char] = await db.select().from(characters).where(eq(characters.userId, userId));
    return char || null;
  },

  async createCharacter(data: { userId: string; name: string; species: string }) {
    const [char] = await db.insert(characters).values(data).returning();
    return char;
  },

  async addExp(characterId: number, exp: number, dimension?: "emotion" | "feeling" | "stress" | "spiritual") {
    const [char] = await db.select().from(characters).where(eq(characters.id, characterId));
    if (!char) return null;

    const newTotalExp = char.totalExp + exp;
    const newLevel = Math.floor(newTotalExp / 100) + 1;
    const newStage = Math.min(Math.floor(newLevel / 5) + 1, 5);

    const updates: any = {
      totalExp: newTotalExp,
      level: newLevel,
      evolutionStage: newStage,
      updatedAt: new Date(),
    };

    if (dimension === "emotion") updates.emotionGrowth = Math.min(char.emotionGrowth + Math.floor(exp / 2), 100);
    if (dimension === "feeling") updates.feelingGrowth = Math.min(char.feelingGrowth + Math.floor(exp / 2), 100);
    if (dimension === "stress") updates.stressManagement = Math.min(char.stressManagement + Math.floor(exp / 2), 100);
    if (dimension === "spiritual") updates.spiritualGrowth = Math.min(char.spiritualGrowth + Math.floor(exp / 2), 100);

    const [updated] = await db.update(characters).set(updates).where(eq(characters.id, characterId)).returning();
    return updated;
  },

  async createEmotionLog(data: { userId: string; emotions: any; tags?: any; note?: string }) {
    const [log] = await db.insert(emotionLogs).values({
      userId: data.userId,
      emotions: data.emotions,
      tags: data.tags || [],
      note: data.note || null,
    }).returning();
    return log;
  },

  async getEmotionLogs(userId: string, limit = 50) {
    return db.select().from(emotionLogs).where(eq(emotionLogs.userId, userId)).orderBy(desc(emotionLogs.loggedAt)).limit(limit);
  },

  async createFeelingLog(data: { userId: string; bodyParts?: any; sensations?: any; energyLevel: number; freeText?: string }) {
    const [log] = await db.insert(feelingLogs).values({
      userId: data.userId,
      bodyParts: data.bodyParts || [],
      sensations: data.sensations || [],
      energyLevel: data.energyLevel,
      freeText: data.freeText || null,
    }).returning();
    return log;
  },

  async getFeelingLogs(userId: string, limit = 50) {
    return db.select().from(feelingLogs).where(eq(feelingLogs.userId, userId)).orderBy(desc(feelingLogs.loggedAt)).limit(limit);
  },

  async createConversation(data: { userId?: string; title: string; mode?: string }) {
    const [conv] = await db.insert(conversations).values({
      userId: data.userId || null,
      title: data.title,
      mode: data.mode || "chat",
    }).returning();
    return conv;
  },

  async getConversationMessages(conversationId: number) {
    return db.select().from(messages).where(eq(messages.conversationId, conversationId)).orderBy(messages.createdAt);
  },

  async createMessage(conversationId: number, role: string, content: string) {
    const [msg] = await db.insert(messages).values({ conversationId, role, content }).returning();
    return msg;
  },

  async getDashboardStats(userId: string) {
    const [emotionCount] = await db.select({ count: count() }).from(emotionLogs).where(eq(emotionLogs.userId, userId));
    const [feelingCount] = await db.select({ count: count() }).from(feelingLogs).where(eq(feelingLogs.userId, userId));
    const [questCount] = await db.select({ count: count() }).from(quests).where(and(eq(quests.userId, userId), eq(quests.status, "completed")));

    return {
      totalEmotionLogs: emotionCount?.count || 0,
      totalFeelingLogs: feelingCount?.count || 0,
      totalQuests: questCount?.count || 0,
      streak: 0,
    };
  },
};
