import type { Express } from "express";
import { createServer, type Server } from "node:http";
import { storage } from "./storage";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});

const DEFAULT_USER_ID = "default-user";

async function ensureDefaultUser() {
  let user = await storage.getUserByUsername("default");
  if (!user) {
    user = await storage.createUser({ username: "default", password: "unused" });
  }
  return user;
}

async function ensureCharacter(userId: string) {
  let char = await storage.getCharacterByUserId(userId);
  if (!char) {
    char = await storage.createCharacter({ userId, name: "마음이", species: "cloud" });
  }
  return char;
}

export async function registerRoutes(app: Express): Promise<Server> {
  app.get("/api/character", async (req, res) => {
    try {
      const user = await ensureDefaultUser();
      const char = await ensureCharacter(user.id);
      res.json(char);
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: "Failed to get character" });
    }
  });

  app.post("/api/emotions", async (req, res) => {
    try {
      const user = await ensureDefaultUser();
      const { emotions, tags, note } = req.body;
      const log = await storage.createEmotionLog({ userId: user.id, emotions, tags, note });
      const char = await ensureCharacter(user.id);
      await storage.addExp(char.id, 20, "emotion");
      res.json(log);
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: "Failed to save emotion" });
    }
  });

  app.get("/api/emotions", async (req, res) => {
    try {
      const user = await ensureDefaultUser();
      const logs = await storage.getEmotionLogs(user.id);
      res.json(logs);
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: "Failed to get emotions" });
    }
  });

  app.post("/api/feelings", async (req, res) => {
    try {
      const user = await ensureDefaultUser();
      const { bodyParts, sensations, energyLevel, freeText } = req.body;
      const log = await storage.createFeelingLog({ userId: user.id, bodyParts, sensations, energyLevel, freeText });
      const char = await ensureCharacter(user.id);
      await storage.addExp(char.id, 20, "feeling");
      res.json(log);
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: "Failed to save feeling" });
    }
  });

  app.get("/api/feelings", async (req, res) => {
    try {
      const user = await ensureDefaultUser();
      const logs = await storage.getFeelingLogs(user.id);
      res.json(logs);
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: "Failed to get feelings" });
    }
  });

  app.post("/api/conversations", async (req, res) => {
    try {
      const user = await ensureDefaultUser();
      const { title, mode } = req.body;
      const conv = await storage.createConversation({ userId: user.id, title, mode });
      res.json(conv);
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: "Failed to create conversation" });
    }
  });

  app.post("/api/conversations/:id/messages", async (req, res) => {
    try {
      const convId = parseInt(req.params.id);
      const { content } = req.body;

      await storage.createMessage(convId, "user", content);

      const prevMessages = await storage.getConversationMessages(convId);

      const systemPrompt = `너는 사용자의 마음 친구이자 정서적 동반자 "마음이"야.
감정과 느낌을 구분해서 대화해줘:
- 감정(emotion): 기쁨, 슬픔, 분노, 불안, 평온, 혐오, 놀람
- 느낌(feeling): 몸에서 느껴지는 감각 (가슴이 답답함, 어깨가 무거움 등)
대화 스타일:
- 반말로 다정하게 대화해
- 공감을 먼저 하고, 사용자가 스스로 탐색하도록 질문해
- 간결하게 2-3문장으로 응답해
- 절대 진단하거나 조언을 강요하지 마
- Inside Out 이론처럼 여러 감정이 함께 존재할 수 있다는 것을 인정해`;

      const chatMessages = [
        { role: "system" as const, content: systemPrompt },
        ...prevMessages.map((m) => ({ role: m.role as "user" | "assistant", content: m.content })),
      ];

      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");

      const stream = await openai.chat.completions.create({
        model: "gpt-4.1-mini",
        messages: chatMessages,
        stream: true,
        max_tokens: 300,
      });

      let fullResponse = "";
      for await (const chunk of stream) {
        const content2 = chunk.choices[0]?.delta?.content || "";
        if (content2) {
          fullResponse += content2;
          res.write(`data: ${JSON.stringify({ content: content2 })}\n\n`);
        }
      }

      await storage.createMessage(convId, "assistant", fullResponse);

      const user = await ensureDefaultUser();
      const char = await ensureCharacter(user.id);
      await storage.addExp(char.id, 10, "spiritual");

      res.write("data: [DONE]\n\n");
      res.end();
    } catch (e) {
      console.error(e);
      if (!res.headersSent) {
        res.status(500).json({ error: "Failed to send message" });
      } else {
        res.end();
      }
    }
  });

  app.get("/api/dashboard", async (req, res) => {
    try {
      const user = await ensureDefaultUser();
      const stats = await storage.getDashboardStats(user.id);
      res.json(stats);
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: "Failed to get dashboard" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
