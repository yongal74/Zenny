import { db } from "./db";
import {
  users,
  characters,
  emotionLogs,
  feelingLogs,
  quests,
  conversations,
  messages,
  shopItems,
  userItems,
  coinTransactions,
  wellnessRecommendations,
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

    const coinReward = Math.max(Math.floor(exp / 4), 1);
    const updates: any = {
      totalExp: newTotalExp,
      level: newLevel,
      evolutionStage: newStage,
      soulCoins: (char.soulCoins || 0) + coinReward,
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

  async getShopItems() {
    return db.select().from(shopItems).where(eq(shopItems.isActive, true));
  },

  async getUserItems(userId: string) {
    return db.select().from(userItems).where(eq(userItems.userId, userId));
  },

  async purchaseItem(userId: string, itemId: number) {
    const [item] = await db.select().from(shopItems).where(eq(shopItems.id, itemId));
    if (!item) throw new Error("Item not found");

    const [user] = await db.select().from(users).where(eq(users.id, userId));
    if (!user) throw new Error("User not found");

    const [char] = await db.select().from(characters).where(eq(characters.userId, userId));
    if (!char) throw new Error("Character not found");
    if ((char.soulCoins || 0) < item.price) throw new Error("Not enough Soul Coins");

    const [existing] = await db.select().from(userItems).where(and(eq(userItems.userId, userId), eq(userItems.itemId, itemId)));
    if (existing) throw new Error("Already owned");

    await db.update(characters).set({ soulCoins: (char.soulCoins || 0) - item.price }).where(eq(characters.id, char.id));

    await db.insert(coinTransactions).values({
      userId, amount: -item.price, type: "purchase", description: `Purchased ${item.name}`,
    });

    const [userItem] = await db.insert(userItems).values({ userId, itemId }).returning();
    return userItem;
  },

  async equipItem(userId: string, itemId: number, category: string) {
    await db.update(userItems).set({ equipped: false }).where(and(eq(userItems.userId, userId)));
    
    const items = await db.select({ ui: userItems, si: shopItems })
      .from(userItems)
      .innerJoin(shopItems, eq(userItems.itemId, shopItems.id))
      .where(and(eq(userItems.userId, userId), eq(shopItems.category, category)));
    
    for (const i of items) {
      await db.update(userItems).set({ equipped: false }).where(eq(userItems.id, i.ui.id));
    }

    await db.update(userItems).set({ equipped: true }).where(and(eq(userItems.userId, userId), eq(userItems.itemId, itemId)));
  },

  async getWellnessRecommendations(emotionTrigger?: string) {
    if (emotionTrigger) {
      return db.select().from(wellnessRecommendations)
        .where(and(eq(wellnessRecommendations.isActive, true), eq(wellnessRecommendations.emotionTrigger, emotionTrigger)));
    }
    return db.select().from(wellnessRecommendations).where(eq(wellnessRecommendations.isActive, true));
  },

  async seedShopAndWellness() {
    const existingItems = await db.select().from(shopItems);
    if (existingItems.length > 0) return;

    await db.insert(shopItems).values([
      { name: "Starlight Skin", description: "A sparkling cosmic skin for your Maumie", category: "skin", price: 50, imageEmoji: "🌟", rarity: "common" },
      { name: "Ocean Wave Skin", description: "Cool ocean vibes", category: "skin", price: 75, imageEmoji: "🌊", rarity: "rare" },
      { name: "Cherry Blossom Skin", description: "Gentle pink bloom", category: "skin", price: 100, imageEmoji: "🌸", rarity: "rare" },
      { name: "Golden Aura Skin", description: "Legendary golden glow", category: "skin", price: 200, imageEmoji: "✨", rarity: "legendary" },
      { name: "Tiny Hat", description: "A cute mini hat", category: "accessory", price: 30, imageEmoji: "🎩", rarity: "common" },
      { name: "Star Glasses", description: "Stylish star-shaped glasses", category: "accessory", price: 40, imageEmoji: "⭐", rarity: "common" },
      { name: "Rainbow Scarf", description: "A colorful warm scarf", category: "accessory", price: 60, imageEmoji: "🌈", rarity: "rare" },
      { name: "Angel Wings", description: "Ethereal wings for your companion", category: "accessory", price: 150, imageEmoji: "👼", rarity: "epic" },
      { name: "Forest Background", description: "Peaceful forest scene", category: "background", price: 45, imageEmoji: "🌲", rarity: "common" },
      { name: "Night Sky Background", description: "Stars and moonlight", category: "background", price: 60, imageEmoji: "🌙", rarity: "rare" },
      { name: "Aurora Background", description: "Northern lights display", category: "background", price: 120, imageEmoji: "🌌", rarity: "epic" },
      { name: "Star Species", description: "Transform Maumie into a Star", category: "species", price: 100, imageEmoji: "⭐", rarity: "rare" },
      { name: "Drop Species", description: "Transform Maumie into a Water Drop", category: "species", price: 100, imageEmoji: "💧", rarity: "rare" },
      { name: "Flame Species", description: "Transform Maumie into a Flame", category: "species", price: 150, imageEmoji: "🔥", rarity: "epic" },
      { name: "Leaf Species", description: "Transform Maumie into a Leaf", category: "species", price: 100, imageEmoji: "🍃", rarity: "rare" },
    ]);

    await db.insert(wellnessRecommendations).values([
      { title: "Magnesium Glycinate", description: "Supports calmness and muscle relaxation. Great for anxiety and sleep.", category: "supplement", emotionTrigger: "anxiety", linkUrl: "https://www.amazon.com/s?k=magnesium+glycinate", imageEmoji: "💊" },
      { title: "Omega-3 Fish Oil", description: "Supports brain health and mood stability.", category: "supplement", emotionTrigger: "sadness", linkUrl: "https://www.amazon.com/s?k=omega+3+fish+oil", imageEmoji: "🐟" },
      { title: "Vitamin D3", description: "The sunshine vitamin — helps with mood and energy.", category: "supplement", emotionTrigger: "sadness", linkUrl: "https://www.amazon.com/s?k=vitamin+d3", imageEmoji: "☀️" },
      { title: "L-Theanine", description: "Promotes calm focus without drowsiness.", category: "supplement", emotionTrigger: "anxiety", linkUrl: "https://www.amazon.com/s?k=l-theanine", imageEmoji: "🍵" },
      { title: "Ashwagandha", description: "Adaptogen that helps manage stress and cortisol levels.", category: "supplement", emotionTrigger: "anger", linkUrl: "https://www.amazon.com/s?k=ashwagandha", imageEmoji: "🌿" },
      { title: "Understanding Emotions", description: "TED Talk: How emotions are made", category: "video", emotionTrigger: null, linkUrl: "https://www.youtube.com/results?search_query=how+emotions+are+made", imageEmoji: "🎥" },
      { title: "Body Scan Meditation", description: "Guided 10-min body scan for feeling awareness", category: "video", emotionTrigger: null, linkUrl: "https://www.youtube.com/results?search_query=body+scan+meditation+10+minutes", imageEmoji: "🧘" },
      { title: "Inside Out Explained", description: "The psychology behind Inside Out", category: "video", emotionTrigger: null, linkUrl: "https://www.youtube.com/results?search_query=inside+out+psychology+explained", imageEmoji: "🎬" },
      { title: "The Body Keeps the Score", description: "Bessel van der Kolk's groundbreaking book on how the body stores trauma", category: "book", emotionTrigger: null, linkUrl: "https://www.amazon.com/s?k=the+body+keeps+the+score", imageEmoji: "📚" },
      { title: "Atlas of the Heart", description: "Brené Brown maps 87 emotions we experience", category: "book", emotionTrigger: null, linkUrl: "https://www.amazon.com/s?k=atlas+of+the+heart", imageEmoji: "📖" },
    ]);
  },
};
