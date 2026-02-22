import React, { useState, useRef, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  useColorScheme,
  Platform,
  Animated,
  Easing,
  ScrollView,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import Colors from "@/constants/colors";

const QUESTS = [
  { type: "breathing", title: "1분 호흡", desc: "4-4-6 호흡법으로 마음을 가라앉혀요", icon: "leaf", exp: 30, category: "호흡/명상" },
  { type: "walking", title: "걷기 명상", desc: "5분간 걸으며 발바닥에 집중해보세요", icon: "walk", exp: 35, category: "호흡/명상" },
  { type: "gratitude", title: "감사 일기", desc: "오늘 감사한 것 3가지를 적어보세요", icon: "heart", exp: 25, category: "기록/성찰" },
  { type: "water", title: "물 마시기", desc: "시원한 물 한 잔을 천천히 마셔보세요", icon: "water", exp: 15, category: "리프레시" },
  { type: "gaze", title: "멀리 바라보기", desc: "30초간 창밖 먼 곳을 바라보세요", icon: "eye", exp: 15, category: "리프레시" },
  { type: "standup", title: "자리에서 일어나기", desc: "잠시 일어나서 기지개를 켜보세요", icon: "body", exp: 20, category: "리프레시" },
  { type: "stretch", title: "짧은 스트레칭", desc: "목과 어깨를 천천히 돌려보세요", icon: "fitness", exp: 25, category: "리프레시" },
  { type: "music", title: "좋아하는 노래", desc: "좋아하는 노래 한 곡을 들어보세요", icon: "musical-notes", exp: 15, category: "환경/감각" },
  { type: "ventilate", title: "창문 열기", desc: "신선한 공기를 들이마셔 보세요", icon: "cloudy", exp: 10, category: "환경/감각" },
];

function BreathingGuide({ colors, onComplete }: { colors: any; onComplete: () => void }) {
  const scaleAnim = useRef(new Animated.Value(0.4)).current;
  const [phase, setPhase] = useState<"inhale" | "hold" | "exhale">("inhale");
  const [timer, setTimer] = useState(60);
  const [isActive, setIsActive] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const phaseRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startBreathing = () => {
    setIsActive(true);
    setTimer(60);

    timerRef.current = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          stopBreathing();
          onComplete();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    runCycle();
  };

  const runCycle = () => {
    const cycle = () => {
      setPhase("inhale");
      Animated.timing(scaleAnim, { toValue: 1, duration: 4000, easing: Easing.inOut(Easing.sin), useNativeDriver: true }).start(() => {
        setPhase("hold");
        setTimeout(() => {
          setPhase("exhale");
          Animated.timing(scaleAnim, { toValue: 0.4, duration: 6000, easing: Easing.inOut(Easing.sin), useNativeDriver: true }).start(() => {
            cycle();
          });
        }, 4000);
      });
    };
    cycle();
  };

  const stopBreathing = () => {
    setIsActive(false);
    if (timerRef.current) clearInterval(timerRef.current);
    scaleAnim.stopAnimation();
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const phaseText = { inhale: "들이쉬기", hold: "참기", exhale: "내쉬기" };
  const phaseColor = { inhale: Colors.emotions.calm, hold: Colors.emotions.anxiety, exhale: Colors.emotions.sadness };

  return (
    <View style={styles.breathingContainer}>
      <Animated.View
        style={[
          styles.breathCircle,
          {
            backgroundColor: phaseColor[phase] + "30",
            borderColor: phaseColor[phase],
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <Text style={[styles.breathPhase, { color: phaseColor[phase] }]}>
          {isActive ? phaseText[phase] : "시작"}
        </Text>
      </Animated.View>
      {isActive && (
        <Text style={[styles.breathTimer, { color: colors.text }]}>
          {timer}초 남음
        </Text>
      )}
      <TouchableOpacity
        style={[styles.breathBtn, { backgroundColor: isActive ? colors.accent : colors.tint }]}
        onPress={isActive ? stopBreathing : startBreathing}
      >
        <Text style={styles.breathBtnText}>
          {isActive ? "중단" : "1분 호흡 시작"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

export default function BreatheScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const colors = isDark ? Colors.dark : Colors.light;
  const insets = useSafeAreaInsets();
  const [showNarration, setShowNarration] = useState(false);
  const [completedQuests, setCompletedQuests] = useState<string[]>([]);

  const topInset = Platform.OS === "web" ? 67 : insets.top;

  const completeQuest = (type: string) => {
    if (!completedQuests.includes(type)) {
      setCompletedQuests((prev) => [...prev, type]);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: topInset + 16 }]}>
      <Text style={[styles.title, { color: colors.text }]}>호흡 & 리프레시</Text>
      <ScrollView showsVerticalScrollIndicator={false}>
        <BreathingGuide colors={colors} onComplete={() => setShowNarration(true)} />

        {showNarration && (
          <View style={[styles.narrationCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Ionicons name="sparkles" size={20} color={colors.tint} />
            <Text style={[styles.narrationText, { color: colors.text }]}>
              호흡이 가라앉을 때, 뇌의 편도체는 조용해지고 전전두엽이 깨어나요.
              마치 폭풍이 지나간 바다처럼, 지금 당신의 마음에도 고요한 파도가 일고 있어요.
              이 고요함은 당신이 만든 거예요.
            </Text>
          </View>
        )}

        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          오늘의 리프레시 퀘스트
        </Text>
        {QUESTS.map((q) => {
          const done = completedQuests.includes(q.type);
          return (
            <TouchableOpacity
              key={q.type}
              style={[
                styles.questCard,
                {
                  backgroundColor: done ? colors.tint + "10" : colors.surface,
                  borderColor: done ? colors.tint + "40" : colors.border,
                },
              ]}
              onPress={() => completeQuest(q.type)}
              activeOpacity={0.7}
              disabled={done}
            >
              <View style={[styles.questIcon, { backgroundColor: (done ? colors.tint : colors.accent) + "20" }]}>
                <Ionicons name={q.icon as any} size={22} color={done ? colors.tint : colors.accent} />
              </View>
              <View style={styles.questInfo}>
                <Text style={[styles.questTitle, { color: colors.text }]}>{q.title}</Text>
                <Text style={[styles.questDesc, { color: colors.textSecondary }]}>{q.desc}</Text>
              </View>
              <View style={styles.questRight}>
                <Text style={[styles.questExp, { color: colors.tint }]}>+{q.exp}</Text>
                {done && <Ionicons name="checkmark-circle" size={20} color={colors.tint} />}
              </View>
            </TouchableOpacity>
          );
        })}
        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 20 },
  title: { fontSize: 24, fontWeight: "700", marginBottom: 16 },
  breathingContainer: { alignItems: "center", marginBottom: 24 },
  breathCircle: {
    width: 180,
    height: 180,
    borderRadius: 90,
    borderWidth: 3,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  breathPhase: { fontSize: 18, fontWeight: "700" },
  breathTimer: { fontSize: 16, marginBottom: 12 },
  breathBtn: {
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 24,
  },
  breathBtnText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  narrationCard: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    flexDirection: "row",
    gap: 10,
    alignItems: "flex-start",
  },
  narrationText: { flex: 1, fontSize: 14, lineHeight: 22 },
  sectionTitle: { fontSize: 18, fontWeight: "700", marginBottom: 12 },
  questCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 10,
    gap: 12,
  },
  questIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  questInfo: { flex: 1 },
  questTitle: { fontSize: 15, fontWeight: "600" },
  questDesc: { fontSize: 12, marginTop: 2 },
  questRight: { alignItems: "flex-end", gap: 4 },
  questExp: { fontSize: 13, fontWeight: "700" },
});
