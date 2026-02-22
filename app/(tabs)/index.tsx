import React, { useEffect, useRef } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Platform,
  Animated,
  Easing,
  ScrollView,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Colors from "@/constants/colors";
import { getApiUrl } from "@/lib/api";

const EMOTIONS: { key: string; icon: string; color: string; label: string }[] = [
  { key: "joy", icon: "sunny", color: Colors.emotions.joy, label: "Joy" },
  { key: "sadness", icon: "water", color: Colors.emotions.sadness, label: "Sadness" },
  { key: "anger", icon: "flame", color: Colors.emotions.anger, label: "Anger" },
  { key: "anxiety", icon: "thunderstorm", color: Colors.emotions.anxiety, label: "Anxiety" },
  { key: "calm", icon: "leaf", color: Colors.emotions.calm, label: "Calm" },
  { key: "disgust", icon: "shield", color: Colors.emotions.disgust, label: "Disgust" },
  { key: "surprise", icon: "flash", color: Colors.emotions.surprise, label: "Surprise" },
];

function CharacterView({ character }: { character: any }) {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;
  const colors = Colors.light;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.06, duration: 2000, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 2000, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ])
    ).start();
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, { toValue: -6, duration: 3000, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(floatAnim, { toValue: 0, duration: 3000, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const speciesEmoji: Record<string, string> = { cloud: "☁️", star: "⭐", drop: "💧", flame: "🔥", leaf: "🍃" };
  const species = character?.species || "cloud";
  const emoji = speciesEmoji[species] || "☁️";
  const stage = character?.evolutionStage || 1;
  const stageNames = ["Egg", "Baby", "Child", "Teen", "Adult"];
  const level = character?.level || 1;
  const charName = character?.name || "Maumie";

  return (
    <View style={styles.characterContainer}>
      <Animated.View style={[styles.characterOuter, { borderColor: colors.tint + "40", transform: [{ scale: pulseAnim }] }]}>
        <Animated.View style={{ transform: [{ translateY: floatAnim }] }}>
          <Text style={styles.characterEmoji}>{stage >= 3 ? emoji : stage >= 2 ? "🥚" : "✨"}</Text>
        </Animated.View>
      </Animated.View>
      <Text style={[styles.characterName, { color: colors.text }]}>{charName}</Text>
      <View style={[styles.levelBadge, { backgroundColor: colors.tint + "20" }]}>
        <Text style={[styles.levelText, { color: colors.tint }]}>Lv.{level} · {stageNames[stage - 1]}</Text>
      </View>
    </View>
  );
}

export default function HomeScreen() {
  const colors = Colors.light;
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();
  const topInset = Platform.OS === "web" ? 67 : insets.top;

  const { data: character } = useQuery({
    queryKey: ["character"],
    queryFn: async () => {
      const res = await fetch(getApiUrl("/api/character"));
      if (!res.ok) return null;
      return res.json();
    },
  });

  const quickLog = useMutation({
    mutationFn: async (emotionKey: string) => {
      const res = await fetch(getApiUrl("/api/emotions"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emotions: [{ type: emotionKey, intensity: 3 }], tags: [], note: "" }),
      });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["character"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background, paddingTop: topInset + 16 }]} contentContainerStyle={{ paddingBottom: 100 }}>
      <View style={styles.header}>
        <Text style={[styles.greeting, { color: colors.text }]}>How are you feeling?</Text>
        <Text style={[styles.date, { color: colors.textSecondary }]}>
          {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
        </Text>
      </View>

      <CharacterView character={character} />

      <View style={[styles.speechBubble, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Text style={[styles.speechText, { color: colors.text }]}>
          {character?.name
            ? `Hey! So glad to see you today 😊`
            : "Nice to meet you! Let's start this journey together."}
        </Text>
      </View>

      <Text style={[styles.sectionTitle, { color: colors.text }]}>Quick Check-in</Text>
      <View style={styles.emotionGrid}>
        {EMOTIONS.map(({ key, icon, color, label }) => (
          <TouchableOpacity
            key={key}
            style={[styles.emotionButton, { backgroundColor: color + "15", borderColor: color + "35" }]}
            activeOpacity={0.7}
            onPress={() => quickLog.mutate(key)}
          >
            <Ionicons name={icon as any} size={24} color={color} />
            <Text style={[styles.emotionLabel, { color: colors.text }]}>{label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={[styles.tipCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Ionicons name="bulb" size={18} color={colors.tint} />
        <Text style={[styles.tipText, { color: colors.textSecondary }]}>
          Tip: Emotions and feelings are different. Emotions are psychological (joy, anger), while feelings are physical sensations in your body.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 20 },
  header: { marginBottom: 8 },
  greeting: { fontSize: 24, fontWeight: "700" },
  date: { fontSize: 14, marginTop: 4 },
  characterContainer: { alignItems: "center", marginVertical: 16 },
  characterOuter: {
    width: 150, height: 150, borderRadius: 75, borderWidth: 2,
    alignItems: "center", justifyContent: "center",
    backgroundColor: "rgba(126,217,87,0.06)",
  },
  characterEmoji: { fontSize: 60 },
  characterName: { fontSize: 20, fontWeight: "700", marginTop: 10 },
  levelBadge: { marginTop: 6, paddingHorizontal: 14, paddingVertical: 4, borderRadius: 12 },
  levelText: { fontSize: 13, fontWeight: "600" },
  speechBubble: { borderRadius: 16, borderWidth: 1, padding: 14, marginBottom: 20, alignItems: "center" },
  speechText: { fontSize: 15, lineHeight: 22, textAlign: "center" },
  sectionTitle: { fontSize: 17, fontWeight: "700", marginBottom: 12 },
  emotionGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10, justifyContent: "center" },
  emotionButton: {
    alignItems: "center", justifyContent: "center",
    width: 76, height: 72, borderRadius: 16, borderWidth: 1, gap: 4,
  },
  emotionLabel: { fontSize: 11, fontWeight: "500" },
  tipCard: {
    flexDirection: "row", gap: 10, padding: 14, borderRadius: 14,
    borderWidth: 1, marginTop: 20, alignItems: "flex-start",
  },
  tipText: { flex: 1, fontSize: 13, lineHeight: 20 },
});
