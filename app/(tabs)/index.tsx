import React, { useEffect, useRef } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  useColorScheme,
  Platform,
  Animated,
  Easing,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import Colors from "@/constants/colors";
import { getApiUrl } from "@/lib/api";

const EMOTION_ICONS: Record<string, { icon: string; color: string; label: string }> = {
  joy: { icon: "sunny", color: Colors.emotions.joy, label: "기쁨" },
  sadness: { icon: "water", color: Colors.emotions.sadness, label: "슬픔" },
  anger: { icon: "flame", color: Colors.emotions.anger, label: "분노" },
  anxiety: { icon: "thunderstorm", color: Colors.emotions.anxiety, label: "불안" },
  calm: { icon: "leaf", color: Colors.emotions.calm, label: "평온" },
  disgust: { icon: "shield", color: Colors.emotions.disgust, label: "혐오" },
  surprise: { icon: "flash", color: Colors.emotions.surprise, label: "놀람" },
};

function CharacterView({ character, colors }: { character: any; colors: any }) {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.08,
          duration: 2000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: -8,
          duration: 3000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 3000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const speciesEmoji: Record<string, string> = {
    cloud: "☁️",
    star: "⭐",
    drop: "💧",
    flame: "🔥",
    leaf: "🍃",
  };

  const species = character?.species || "cloud";
  const emoji = speciesEmoji[species] || "☁️";
  const level = character?.level || 1;
  const stage = character?.evolutionStage || 1;
  const stageNames = ["알", "아기", "어린이", "청소년", "성인"];
  const stageName = stageNames[(stage - 1)] || "알";
  const charName = character?.name || "마음이";

  const moodColor = Colors.emotions.calm;

  return (
    <View style={styles.characterContainer}>
      <Animated.View
        style={[
          styles.characterOuter,
          {
            backgroundColor: moodColor + "15",
            borderColor: moodColor + "30",
            transform: [{ scale: pulseAnim }],
          },
        ]}
      >
        <Animated.View
          style={[
            styles.characterInner,
            { transform: [{ translateY: floatAnim }] },
          ]}
        >
          <Text style={styles.characterEmoji}>
            {stage >= 3 ? emoji : stage >= 2 ? "🥚" : "✨"}
          </Text>
        </Animated.View>
      </Animated.View>
      <Text style={[styles.characterName, { color: colors.text }]}>
        {charName}
      </Text>
      <View style={styles.levelBadge}>
        <Text style={[styles.levelText, { color: colors.tint }]}>
          Lv.{level} · {stageName}
        </Text>
      </View>
    </View>
  );
}

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const colors = isDark ? Colors.dark : Colors.light;
  const insets = useSafeAreaInsets();

  const { data: character } = useQuery({
    queryKey: ["character"],
    queryFn: async () => {
      const res = await fetch(getApiUrl("/api/character"));
      if (!res.ok) return null;
      return res.json();
    },
  });

  const topInset = Platform.OS === "web" ? 67 : insets.top;

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: topInset + 16 }]}>
      <View style={styles.header}>
        <Text style={[styles.greeting, { color: colors.text }]}>
          오늘의 마음은 어떤가요?
        </Text>
        <Text style={[styles.date, { color: colors.textSecondary }]}>
          {new Date().toLocaleDateString("ko-KR", {
            year: "numeric",
            month: "long",
            day: "numeric",
            weekday: "long",
          })}
        </Text>
      </View>

      <CharacterView character={character} colors={colors} />

      <View style={[styles.speechBubble, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Text style={[styles.speechText, { color: colors.text }]}>
          {character?.name
            ? `안녕! 오늘도 함께 해서 기뻐 😊`
            : "처음 만나서 반가워! 나와 함께 마음 여행을 시작해볼까?"}
        </Text>
      </View>

      <View style={styles.quickCheckSection}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          빠른 감정 체크인
        </Text>
        <View style={styles.emotionGrid}>
          {Object.entries(EMOTION_ICONS).map(([key, { icon, color, label }]) => (
            <TouchableOpacity
              key={key}
              style={[styles.emotionButton, { backgroundColor: color + "20", borderColor: color + "40" }]}
              activeOpacity={0.7}
            >
              <Ionicons name={icon as any} size={24} color={color} />
              <Text style={[styles.emotionLabel, { color: colors.text }]}>{label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    marginBottom: 8,
  },
  greeting: {
    fontSize: 24,
    fontWeight: "700",
  },
  date: {
    fontSize: 14,
    marginTop: 4,
  },
  characterContainer: {
    alignItems: "center",
    marginVertical: 16,
  },
  characterOuter: {
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  characterInner: {
    alignItems: "center",
    justifyContent: "center",
  },
  characterEmoji: {
    fontSize: 64,
  },
  characterName: {
    fontSize: 20,
    fontWeight: "700",
    marginTop: 12,
  },
  levelBadge: {
    marginTop: 4,
  },
  levelText: {
    fontSize: 14,
    fontWeight: "600",
  },
  speechBubble: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 20,
    alignItems: "center",
  },
  speechText: {
    fontSize: 15,
    lineHeight: 22,
    textAlign: "center",
  },
  quickCheckSection: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 12,
  },
  emotionGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    justifyContent: "center",
  },
  emotionButton: {
    alignItems: "center",
    justifyContent: "center",
    width: 76,
    height: 72,
    borderRadius: 16,
    borderWidth: 1,
    gap: 4,
  },
  emotionLabel: {
    fontSize: 12,
    fontWeight: "500",
  },
});
