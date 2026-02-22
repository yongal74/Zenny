import React, { useEffect, useRef, useState, useCallback } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Platform,
  Animated,
  Easing,
  TextInput,
  FlatList,
  KeyboardAvoidingView,
  ActivityIndicator,
  Image,
  Dimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import Colors from "@/constants/colors";
import { getApiUrl } from "@/lib/api";
import { LinearGradient } from "expo-linear-gradient";

const CHARACTER_IMAGES: Record<string, any> = {
  cloud: require("@/assets/characters/cloud.png"),
  star: require("@/assets/characters/star.png"),
  drop: require("@/assets/characters/drop.png"),
  flame: require("@/assets/characters/flame.png"),
  leaf: require("@/assets/characters/leaf.png"),
  egg: require("@/assets/characters/egg.png"),
};

const EMOTIONS = [
  { key: "joy", label: "Joy", emoji: "😊", color: Colors.emotions.joy },
  { key: "sadness", label: "Sadness", emoji: "😢", color: Colors.emotions.sadness },
  { key: "anger", label: "Anger", emoji: "😠", color: Colors.emotions.anger },
  { key: "anxiety", label: "Anxiety", emoji: "😰", color: Colors.emotions.anxiety },
  { key: "calm", label: "Calm", emoji: "😌", color: Colors.emotions.calm },
  { key: "disgust", label: "Disgust", emoji: "🤢", color: Colors.emotions.disgust },
  { key: "surprise", label: "Surprise", emoji: "😲", color: Colors.emotions.surprise },
];

const FEELINGS = [
  { key: "tight_chest", label: "Tight chest", emoji: "💔" },
  { key: "heavy_shoulders", label: "Heavy shoulders", emoji: "🏋️" },
  { key: "stomach_ache", label: "Stomach ache", emoji: "🤕" },
  { key: "shaky_hands", label: "Shaky hands", emoji: "🫨" },
  { key: "clear_head", label: "Clear head", emoji: "✨" },
  { key: "light_body", label: "Light body", emoji: "🪶" },
  { key: "tired_eyes", label: "Tired eyes", emoji: "😵" },
  { key: "stiff_neck", label: "Stiff neck", emoji: "🦴" },
];

const ACTIVITIES = [
  { key: "breath", label: "1-Min Breath", emoji: "🌬️", exp: 30 },
  { key: "meditation", label: "Meditation", emoji: "🧘", exp: 25 },
  { key: "gratitude", label: "Gratitude Journal", emoji: "📝", exp: 25 },
  { key: "water", label: "Drink Water", emoji: "💧", exp: 15 },
  { key: "gaze", label: "Look Far Away", emoji: "👀", exp: 15 },
  { key: "stretch", label: "Stand & Stretch", emoji: "🙆", exp: 20 },
  { key: "neck", label: "Neck & Shoulder", emoji: "💆", exp: 25 },
  { key: "music", label: "Favorite Song", emoji: "🎵", exp: 15 },
  { key: "window", label: "Open a Window", emoji: "🪟", exp: 10 },
];

type ChatMsg = {
  id: string;
  role: "assistant" | "user";
  content: string;
  buttons?: { label: string; emoji?: string; action: string; data?: any }[];
};

type ConvoState =
  | "greeting"
  | "choose_type"
  | "pick_emotion"
  | "pick_feeling"
  | "write_note"
  | "suggest_activity"
  | "activity_offered"
  | "reward"
  | "free_chat";

const BASE_CHAR_SIZE = 120;
const LEVEL_SCALE_STEP = 0.04;
const MAX_SCALE = 2.0;

function CharacterView({ character, onPress }: { character: any; onPress: () => void }) {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.04, duration: 2800, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 2800, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ])
    ).start();
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, { toValue: -10, duration: 3200, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(floatAnim, { toValue: 0, duration: 3200, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const species = character?.species || "cloud";
  const stage = character?.evolutionStage || 1;
  const level = character?.level || 1;
  const charName = character?.name || "Maumie";
  const imgKey = stage < 2 ? "egg" : species;
  const charImage = CHARACTER_IMAGES[imgKey] || CHARACTER_IMAGES.cloud;

  const growthScale = Math.min(1 + (level - 1) * LEVEL_SCALE_STEP, MAX_SCALE);
  const imgSize = BASE_CHAR_SIZE * growthScale;
  const glowSize = imgSize + 40;

  const xpForNext = 100;
  const currentXpInLevel = (character?.totalExp || 0) % 100;
  const xpProgress = currentXpInLevel / xpForNext;

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.85} style={styles.characterContainer}>
      <Animated.View style={[styles.characterGlow, { width: glowSize, height: glowSize, borderRadius: glowSize / 2, transform: [{ scale: pulseAnim }] }]}>
        <Animated.View style={{ transform: [{ translateY: floatAnim }] }}>
          <Image source={charImage} style={{ width: imgSize, height: imgSize }} resizeMode="contain" />
        </Animated.View>
      </Animated.View>
      <Text style={styles.characterName}>{charName}</Text>
      <View style={styles.levelRow}>
        <View style={styles.levelPill}>
          <Text style={styles.levelText}>Lv.{level}</Text>
        </View>
        <View style={styles.xpBarOuter}>
          <View style={[styles.xpBarInner, { width: `${Math.max(xpProgress * 100, 4)}%` }]} />
        </View>
        <Text style={styles.xpLabel}>{currentXpInLevel}/{xpForNext}</Text>
      </View>
    </TouchableOpacity>
  );
}

export default function HomeScreen() {
  const colors = Colors.light;
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();
  const flatListRef = useRef<FlatList>(null);
  const topInset = Platform.OS === "web" ? 67 : insets.top;
  const bottomInset = Platform.OS === "web" ? 34 : Math.max(insets.bottom, 8);

  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [convoState, setConvoState] = useState<ConvoState>("greeting");
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedEmotion, setSelectedEmotion] = useState<string | null>(null);
  const [selectedFeeling, setSelectedFeeling] = useState<string | null>(null);
  const [conversationId, setConversationId] = useState<number | null>(null);
  const [showCharacterPicker, setShowCharacterPicker] = useState(false);

  const { data: character } = useQuery({
    queryKey: ["character"],
    queryFn: async () => {
      const res = await fetch(getApiUrl("/api/character"));
      if (!res.ok) return null;
      return res.json();
    },
  });

  const addMsg = useCallback((msg: Omit<ChatMsg, "id">) => {
    const newMsg = { ...msg, id: Date.now().toString() + Math.random() };
    setMessages((prev) => [...prev, newMsg]);
    return newMsg;
  }, []);

  useEffect(() => {
    if (messages.length === 0) {
      addMsg({
        role: "assistant",
        content: "Hey there! How are you doing today? 💜",
        buttons: [
          { label: "Check in my emotions", emoji: "🫧", action: "start_emotion" },
          { label: "Check in my feelings", emoji: "🌊", action: "start_feeling" },
          { label: "Just chat", emoji: "💬", action: "free_chat" },
        ],
      });
      setConvoState("choose_type");
    }
  }, []);

  const handleButtonPress = useCallback(async (action: string, data?: any) => {
    switch (action) {
      case "start_emotion":
        addMsg({ role: "user", content: "I want to check in my emotions" });
        setTimeout(() => {
          addMsg({
            role: "assistant",
            content: "Which emotions are you feeling right now? Take your time 🌈",
            buttons: EMOTIONS.map((e) => ({ label: e.label, emoji: e.emoji, action: "select_emotion", data: e.key })),
          });
          setConvoState("pick_emotion");
        }, 400);
        break;

      case "start_feeling":
        addMsg({ role: "user", content: "I want to check in my body feelings" });
        setTimeout(() => {
          addMsg({
            role: "assistant",
            content: "What do you notice in your body right now? 🧘",
            buttons: FEELINGS.map((f) => ({ label: f.label, emoji: f.emoji, action: "select_feeling", data: f.key })),
          });
          setConvoState("pick_feeling");
        }, 400);
        break;

      case "select_emotion": {
        const emo = EMOTIONS.find((e) => e.key === data);
        setSelectedEmotion(data);
        addMsg({ role: "user", content: `${emo?.emoji} ${emo?.label}` });
        setTimeout(() => {
          addMsg({
            role: "assistant",
            content: `${emo?.label} — got it. Want to share a bit more about what's going on?`,
          });
          setConvoState("write_note");
        }, 400);
        break;
      }

      case "select_feeling": {
        const feel = FEELINGS.find((f) => f.key === data);
        setSelectedFeeling(data);
        addMsg({ role: "user", content: `${feel?.emoji} ${feel?.label}` });
        setTimeout(() => {
          addMsg({
            role: "assistant",
            content: `I hear you. Your body is telling you something important. Want to add a quick note?`,
          });
          setConvoState("write_note");
        }, 400);
        break;
      }

      case "skip_note":
        await saveLog("");
        break;

      case "do_activity":
        addMsg({ role: "user", content: `I'll try: ${data.label}` });
        setTimeout(() => {
          const reasons: Record<string, string> = {
            breath: "Deep breathing activates your parasympathetic nervous system, shifting your body from fight-or-flight to rest-and-digest mode.",
            meditation: "Meditation strengthens your prefrontal cortex, the part of the brain responsible for emotional regulation and self-awareness.",
            gratitude: "Gratitude journaling rewires neural pathways toward positive thinking. Psychologically, it shifts focus from scarcity to abundance.",
            water: "Dehydration increases cortisol. A glass of water helps your nervous system recalibrate.",
            gaze: "Looking at distant objects relaxes the ciliary muscles and reduces mental tension through the optic-vagal connection.",
            stretch: "Standing activates your vestibular system, resetting your body's relationship with gravity and reducing stress hormones.",
            neck: "Tension in the neck and shoulders stores unprocessed emotions. Releasing it is a form of somatic healing.",
            music: "Music activates the limbic system and releases dopamine, creating an immediate mood shift.",
            window: "Fresh air increases oxygen to the brain and shifts your sensory experience, grounding you in the present moment.",
          };
          const reason = reasons[data.key] || "This activity helps restore your mind-body balance.";
          addMsg({
            role: "assistant",
            content: `Great choice! Here's why this helps:\n\n✨ ${reason}\n\nLet me know when you're done!`,
            buttons: [
              { label: "Done! ✅", emoji: "✅", action: "complete_activity", data },
              { label: "Skip for now", emoji: "⏭️", action: "skip_activity" },
            ],
          });
          setConvoState("activity_offered");
        }, 400);
        break;

      case "complete_activity":
        addMsg({ role: "user", content: "Done! ✅" });
        try {
          await fetch(getApiUrl(`/api/quests/${data.key}/complete`), {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({}),
          });
          queryClient.invalidateQueries({ queryKey: ["character"] });
        } catch {}
        setTimeout(() => {
          addMsg({
            role: "assistant",
            content: `Amazing! You earned +${data.exp} XP and +5 Soul Coins! 🎉\n\nYour Maumie grew a little from this. Keep it up! 💜`,
            buttons: [
              { label: "Check in again", emoji: "🔄", action: "restart" },
              { label: "Chat with Maumie", emoji: "💬", action: "free_chat" },
            ],
          });
          setConvoState("reward");
        }, 400);
        break;

      case "skip_activity":
        addMsg({ role: "user", content: "Skip for now" });
        setTimeout(() => {
          addMsg({
            role: "assistant",
            content: "No worries at all! Remember, every small step counts. I'm always here 💜",
            buttons: [
              { label: "Check in again", emoji: "🔄", action: "restart" },
              { label: "Chat with Maumie", emoji: "💬", action: "free_chat" },
            ],
          });
        }, 400);
        break;

      case "free_chat":
        addMsg({ role: "user", content: "I want to chat" });
        setTimeout(() => {
          addMsg({
            role: "assistant",
            content: "I'm all ears! Type anything you want to share — no judgment here 😊",
          });
          setConvoState("free_chat");
        }, 400);
        break;

      case "restart":
        addMsg({ role: "user", content: "Let me check in again" });
        setSelectedEmotion(null);
        setSelectedFeeling(null);
        setTimeout(() => {
          addMsg({
            role: "assistant",
            content: "Sure! What would you like to check in on?",
            buttons: [
              { label: "Check in my emotions", emoji: "🫧", action: "start_emotion" },
              { label: "Check in my feelings", emoji: "🌊", action: "start_feeling" },
              { label: "Just chat", emoji: "💬", action: "free_chat" },
            ],
          });
          setConvoState("choose_type");
        }, 400);
        break;
    }
  }, [addMsg, queryClient]);

  const saveLog = useCallback(async (note: string) => {
    try {
      if (selectedEmotion) {
        await fetch(getApiUrl("/api/emotions"), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ emotions: [{ type: selectedEmotion, intensity: 3 }], tags: [], note }),
        });
      } else if (selectedFeeling) {
        const feel = FEELINGS.find((f) => f.key === selectedFeeling);
        await fetch(getApiUrl("/api/feelings"), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ bodyParts: [], sensations: [feel?.label || ""], energyLevel: 3, freeText: note }),
        });
      }
      queryClient.invalidateQueries({ queryKey: ["character"] });

      const suggested = ACTIVITIES[Math.floor(Math.random() * ACTIVITIES.length)];
      addMsg({
        role: "assistant",
        content: `Logged! Your Maumie felt that 💜\n\nHere's something that might help:`,
        buttons: [
          { label: `${suggested.emoji} ${suggested.label}`, emoji: suggested.emoji, action: "do_activity", data: suggested },
          { label: "Show me more options", emoji: "📋", action: "show_all_activities" },
          { label: "I'm good for now", emoji: "👋", action: "restart" },
        ],
      });
      setConvoState("suggest_activity");
    } catch {
      addMsg({ role: "assistant", content: "Hmm, something went wrong saving that. Could you try again?" });
    }
  }, [selectedEmotion, selectedFeeling, addMsg, queryClient]);

  const handleShowAllActivities = useCallback(() => {
    addMsg({ role: "user", content: "Show me all options" });
    setTimeout(() => {
      addMsg({
        role: "assistant",
        content: "Here are all the refresh activities you can try:",
        buttons: ACTIVITIES.map((a) => ({ label: `${a.emoji} ${a.label}`, emoji: a.emoji, action: "do_activity", data: a })),
      });
    }, 300);
  }, [addMsg]);

  const sendFreeMessage = useCallback(async () => {
    if (!inputText.trim() || isLoading) return;
    const text = inputText.trim();
    addMsg({ role: "user", content: text });
    setInputText("");
    setIsLoading(true);

    if (convoState === "write_note") {
      await saveLog(text);
      setIsLoading(false);
      return;
    }

    try {
      let convId = conversationId;
      if (!convId) {
        const createRes = await fetch(getApiUrl("/api/conversations"), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title: "Chat", mode: "chat" }),
        });
        const conv = await createRes.json();
        convId = conv.id;
        setConversationId(convId);
      }

      const res = await fetch(getApiUrl(`/api/conversations/${convId}/messages`), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: text }),
      });

      const assistantId = Date.now().toString() + "ai";
      let fullContent = "";
      setMessages((prev) => [...prev, { id: assistantId, role: "assistant", content: "" }]);

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      if (reader) {
        let done = false;
        while (!done) {
          const { value, done: readerDone } = await reader.read();
          done = readerDone;
          if (value) {
            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk.split("\n").filter((l) => l.startsWith("data: "));
            for (const line of lines) {
              try {
                const parsed = JSON.parse(line.slice(6));
                if (parsed.content) {
                  fullContent += parsed.content;
                  setMessages((prev) => prev.map((m) => m.id === assistantId ? { ...m, content: fullContent } : m));
                }
              } catch {}
            }
          }
        }
      }
      queryClient.invalidateQueries({ queryKey: ["character"] });
    } catch {
      addMsg({ role: "assistant", content: "Sorry, connection seems unstable. Try again?" });
    } finally {
      setIsLoading(false);
    }
  }, [inputText, isLoading, convoState, conversationId, saveLog, addMsg, queryClient]);

  const charSpecies = character?.species || "cloud";
  const charImgKey = (character?.evolutionStage || 1) < 2 ? "egg" : charSpecies;
  const avatarImg = CHARACTER_IMAGES[charImgKey] || CHARACTER_IMAGES.cloud;

  const renderMessage = ({ item }: { item: ChatMsg }) => {
    const isUser = item.role === "user";
    return (
      <View style={{ marginVertical: 4 }}>
        <View style={[styles.bubble, isUser ? styles.userBubble : styles.assistantBubble]}>
          {!isUser && (
            <Image source={avatarImg} style={styles.botAvatar} resizeMode="contain" />
          )}
          <View style={{ flex: 1 }}>
            <Text style={[styles.bubbleText, isUser ? styles.userText : styles.assistantText]}>
              {item.content || (isLoading ? "..." : "")}
            </Text>
          </View>
        </View>
        {item.buttons && item.buttons.length > 0 && (
          <View style={styles.buttonsWrap}>
            {item.buttons.map((btn, i) => (
              <TouchableOpacity
                key={i}
                style={styles.actionBtn}
                onPress={() => {
                  if (btn.action === "show_all_activities") {
                    handleShowAllActivities();
                  } else {
                    handleButtonPress(btn.action, btn.data);
                  }
                }}
                activeOpacity={0.7}
              >
                {btn.emoji && <Text style={styles.actionEmoji}>{btn.emoji}</Text>}
                <Text style={styles.actionLabel}>{btn.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
    );
  };

  const showTextInput = convoState === "write_note" || convoState === "free_chat";

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={90}
    >
      <LinearGradient
        colors={["#E8DEFF", "#EDE5FF", "#F5F1FF"]}
        style={[styles.topArea, { paddingTop: topInset + 8 }]}
      >
        <CharacterView character={character} onPress={() => setShowCharacterPicker(true)} />
      </LinearGradient>

      <View style={styles.divider}>
        <View style={styles.dividerHandle} />
      </View>

      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        style={styles.chatArea}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 8, paddingTop: 12 }}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="interactive"
      />

      <View style={[styles.inputBar, { paddingBottom: bottomInset }]}>
        {showTextInput ? (
          <>
            {convoState === "write_note" && (
              <TouchableOpacity style={styles.skipBtn} onPress={() => saveLog("")}>
                <Text style={styles.skipText}>Skip</Text>
              </TouchableOpacity>
            )}
            <TextInput
              style={styles.textInput}
              placeholder={convoState === "write_note" ? "Write a short note..." : "Type a message..."}
              placeholderTextColor={colors.textSecondary}
              value={inputText}
              onChangeText={setInputText}
              onSubmitEditing={sendFreeMessage}
              multiline
              maxLength={500}
            />
            <TouchableOpacity
              style={[styles.sendBtn, { backgroundColor: inputText.trim() ? colors.tint : colors.border }]}
              onPress={sendFreeMessage}
              disabled={!inputText.trim() || isLoading}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#FFF" />
              ) : (
                <Ionicons name="arrow-up" size={18} color="#FFF" />
              )}
            </TouchableOpacity>
          </>
        ) : (
          <View style={styles.inputPlaceholder}>
            <Text style={[styles.inputHint, { color: colors.textSecondary }]}>Tap a button above to get started</Text>
          </View>
        )}
      </View>

      {showCharacterPicker && (
        <View style={styles.pickerOverlay}>
          <View style={styles.pickerCard}>
            <Text style={styles.pickerTitle}>Choose Your Maumie</Text>
            <View style={styles.speciesRow}>
              {[
                { key: "cloud", label: "Cloud" },
                { key: "star", label: "Star" },
                { key: "drop", label: "Drop" },
                { key: "flame", label: "Flame" },
                { key: "leaf", label: "Leaf" },
              ].map((s) => (
                <TouchableOpacity
                  key={s.key}
                  style={[styles.speciesBtn, character?.species === s.key && styles.speciesSelected]}
                  onPress={async () => {
                    try {
                      await fetch(getApiUrl("/api/character/species"), {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ species: s.key }),
                      });
                      queryClient.invalidateQueries({ queryKey: ["character"] });
                      setShowCharacterPicker(false);
                    } catch {}
                  }}
                >
                  <Image source={CHARACTER_IMAGES[s.key]} style={{ width: 48, height: 48 }} resizeMode="contain" />
                  <Text style={styles.speciesLabel}>{s.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity style={styles.pickerClose} onPress={() => setShowCharacterPicker(false)}>
              <Text style={styles.pickerCloseText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  topArea: {
    alignItems: "center",
    paddingBottom: 4,
  },
  characterContainer: { alignItems: "center", paddingVertical: 4 },
  characterGlow: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(124,109,197,0.06)",
  },
  characterName: { fontSize: 18, fontWeight: "800", color: "#2D2B3D", marginTop: 6, letterSpacing: -0.3 },
  levelRow: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 6 },
  levelPill: {
    backgroundColor: "rgba(124,109,197,0.12)",
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
  },
  levelText: { fontSize: 12, fontWeight: "700", color: "#7C6DC5" },
  xpBarOuter: {
    width: 80,
    height: 6,
    borderRadius: 3,
    backgroundColor: "rgba(124,109,197,0.12)",
    overflow: "hidden",
  },
  xpBarInner: {
    height: "100%",
    borderRadius: 3,
    backgroundColor: "#7C6DC5",
  },
  xpLabel: { fontSize: 10, fontWeight: "600", color: "#9B97B0" },
  divider: {
    alignItems: "center",
    paddingVertical: 6,
    backgroundColor: "#F5F1FF",
  },
  dividerHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: "rgba(124,109,197,0.2)",
  },
  chatArea: { flex: 1, backgroundColor: "#F5F1FF" },
  bubble: { maxWidth: "82%", padding: 14, borderRadius: 20, flexDirection: "row", gap: 8, alignItems: "flex-start" },
  userBubble: {
    alignSelf: "flex-end", backgroundColor: "#7C6DC5",
    borderBottomRightRadius: 6, marginLeft: "18%",
  },
  assistantBubble: {
    alignSelf: "flex-start", backgroundColor: "#FFFFFF",
    borderBottomLeftRadius: 6, marginRight: "18%",
    shadowColor: "#7C6DC5",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 1,
  },
  botAvatar: { width: 24, height: 24, marginTop: 2 },
  bubbleText: { fontSize: 15, lineHeight: 22 },
  userText: { color: "#FFFFFF" },
  assistantText: { color: "#2D2B3D" },
  buttonsWrap: {
    flexDirection: "row", flexWrap: "wrap", gap: 8,
    paddingLeft: 40, paddingTop: 8, paddingRight: 16,
  },
  actionBtn: {
    flexDirection: "row", alignItems: "center", gap: 6,
    backgroundColor: "#FFFFFF", paddingHorizontal: 14, paddingVertical: 10,
    borderRadius: 20, borderWidth: 1.5, borderColor: "#EDE8F5",
    shadowColor: "#7C6DC5",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  actionEmoji: { fontSize: 16 },
  actionLabel: { fontSize: 13, fontWeight: "600", color: "#7C6DC5" },
  inputBar: {
    flexDirection: "row", alignItems: "flex-end", gap: 8,
    paddingHorizontal: 12, paddingTop: 10,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1, borderTopColor: "#EDE8F5",
  },
  textInput: {
    flex: 1, minHeight: 40, maxHeight: 100, borderRadius: 22,
    backgroundColor: "#F8F5FF", paddingHorizontal: 16, paddingVertical: 10,
    fontSize: 15, color: "#2D2B3D",
  },
  sendBtn: {
    width: 38, height: 38, borderRadius: 19,
    alignItems: "center", justifyContent: "center", marginBottom: 1,
  },
  skipBtn: {
    paddingHorizontal: 12, paddingVertical: 10,
  },
  skipText: { color: "#9B97B0", fontSize: 14, fontWeight: "600" },
  inputPlaceholder: { flex: 1, alignItems: "center", paddingVertical: 14 },
  inputHint: { fontSize: 14 },
  pickerOverlay: {
    position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: "rgba(0,0,0,0.4)", zIndex: 100,
    justifyContent: "center", alignItems: "center",
  },
  pickerCard: {
    backgroundColor: "#FFFFFF", borderRadius: 24, padding: 24,
    width: "85%", alignItems: "center",
    shadowColor: "#000", shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15, shadowRadius: 24, elevation: 8,
  },
  pickerTitle: { fontSize: 20, fontWeight: "700", color: "#2D2B3D", marginBottom: 20 },
  speciesRow: { flexDirection: "row", gap: 12, marginBottom: 20 },
  speciesBtn: {
    alignItems: "center", padding: 12, borderRadius: 16,
    borderWidth: 2, borderColor: "#EDE8F5", gap: 4,
  },
  speciesSelected: { borderColor: "#7C6DC5", backgroundColor: "rgba(124,109,197,0.08)" },
  speciesLabel: { fontSize: 11, fontWeight: "600", color: "#2D2B3D" },
  pickerClose: { paddingVertical: 10, paddingHorizontal: 24 },
  pickerCloseText: { fontSize: 15, fontWeight: "600", color: "#9B97B0" },
});
