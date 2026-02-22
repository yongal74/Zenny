import React, { useState, useRef, useEffect } from "react";
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
import Colors from "@/constants/colors";

const QUESTS = [
  { type: "breathing", title: "1-Min Breathing", desc: "Use the 4-4-6 method to calm your mind", icon: "leaf", exp: 30 },
  { type: "walking", title: "Walking Meditation", desc: "Walk for 5 minutes, focus on your steps", icon: "walk", exp: 35 },
  { type: "gratitude", title: "Gratitude Journal", desc: "Write 3 things you're grateful for today", icon: "heart", exp: 25 },
  { type: "water", title: "Drink Water", desc: "Slowly drink a glass of cool water", icon: "water", exp: 15 },
  { type: "gaze", title: "Look Far Away", desc: "Gaze at a distant point for 30 seconds", icon: "eye", exp: 15 },
  { type: "standup", title: "Stand & Stretch", desc: "Stand up and stretch your body", icon: "body", exp: 20 },
  { type: "stretch", title: "Neck & Shoulders", desc: "Gently roll your neck and shoulders", icon: "fitness", exp: 25 },
  { type: "music", title: "Favorite Song", desc: "Listen to a song that makes you feel good", icon: "musical-notes", exp: 15 },
  { type: "ventilate", title: "Open a Window", desc: "Let some fresh air in and breathe deeply", icon: "cloudy", exp: 10 },
];

function BreathingGuide({ onComplete }: { onComplete: () => void }) {
  const scaleAnim = useRef(new Animated.Value(0.4)).current;
  const [phase, setPhase] = useState<"inhale" | "hold" | "exhale">("inhale");
  const [timer, setTimer] = useState(60);
  const [isActive, setIsActive] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const colors = Colors.light;

  const startBreathing = () => {
    setIsActive(true);
    setTimer(60);
    timerRef.current = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) { stopBreathing(); onComplete(); return 0; }
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
          Animated.timing(scaleAnim, { toValue: 0.4, duration: 6000, easing: Easing.inOut(Easing.sin), useNativeDriver: true }).start(() => cycle());
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

  useEffect(() => { return () => { if (timerRef.current) clearInterval(timerRef.current); }; }, []);

  const phaseText = { inhale: "Breathe In", hold: "Hold", exhale: "Breathe Out" };
  const phaseColor = { inhale: Colors.emotions.calm, hold: Colors.emotions.anxiety, exhale: Colors.emotions.sadness };

  return (
    <View style={styles.breathingContainer}>
      <Animated.View style={[styles.breathCircle, { backgroundColor: phaseColor[phase] + "20", borderColor: phaseColor[phase], transform: [{ scale: scaleAnim }] }]}>
        <Text style={[styles.breathPhase, { color: phaseColor[phase] }]}>{isActive ? phaseText[phase] : "Start"}</Text>
      </Animated.View>
      {isActive && <Text style={[styles.breathTimer, { color: colors.text }]}>{timer}s remaining</Text>}
      <TouchableOpacity style={[styles.breathBtn, { backgroundColor: isActive ? colors.accent : colors.tint }]} onPress={isActive ? stopBreathing : startBreathing}>
        <Text style={[styles.breathBtnText, { color: "#1B2A4A" }]}>{isActive ? "Stop" : "Start 1-Min Breathing"}</Text>
      </TouchableOpacity>
    </View>
  );
}

export default function BreatheScreen() {
  const colors = Colors.light;
  const insets = useSafeAreaInsets();
  const [showNarration, setShowNarration] = useState(false);
  const [completedQuests, setCompletedQuests] = useState<string[]>([]);
  const topInset = Platform.OS === "web" ? 67 : insets.top;

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: topInset + 16 }]}>
      <Text style={[styles.title, { color: colors.text }]}>Breathe & Refresh</Text>
      <ScrollView showsVerticalScrollIndicator={false}>
        <BreathingGuide onComplete={() => setShowNarration(true)} />
        {showNarration && (
          <View style={[styles.narrationCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Ionicons name="sparkles" size={18} color={colors.tint} />
            <Text style={[styles.narrationText, { color: colors.text }]}>
              When your breath slows down, the amygdala quiets and your prefrontal cortex awakens.
              Like a sea after a storm, a calm wave is rising in your mind. You created this stillness.
            </Text>
          </View>
        )}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Today's Refresh Quests</Text>
        {QUESTS.map((q) => {
          const done = completedQuests.includes(q.type);
          return (
            <TouchableOpacity key={q.type}
              style={[styles.questCard, { backgroundColor: done ? colors.tint + "10" : colors.surface, borderColor: done ? colors.tint + "40" : colors.border }]}
              onPress={() => !done && setCompletedQuests((prev) => [...prev, q.type])}
              activeOpacity={0.7} disabled={done}>
              <View style={[styles.questIcon, { backgroundColor: (done ? colors.tint : colors.accent) + "15" }]}>
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
  breathCircle: { width: 180, height: 180, borderRadius: 90, borderWidth: 3, alignItems: "center", justifyContent: "center", marginBottom: 16 },
  breathPhase: { fontSize: 18, fontWeight: "700" },
  breathTimer: { fontSize: 16, marginBottom: 12 },
  breathBtn: { paddingHorizontal: 32, paddingVertical: 12, borderRadius: 24 },
  breathBtnText: { fontSize: 16, fontWeight: "700" },
  narrationCard: { borderWidth: 1, borderRadius: 16, padding: 16, marginBottom: 24, flexDirection: "row", gap: 10, alignItems: "flex-start" },
  narrationText: { flex: 1, fontSize: 14, lineHeight: 22 },
  sectionTitle: { fontSize: 18, fontWeight: "700", marginBottom: 12 },
  questCard: { flexDirection: "row", alignItems: "center", padding: 14, borderRadius: 14, borderWidth: 1, marginBottom: 10, gap: 12 },
  questIcon: { width: 44, height: 44, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  questInfo: { flex: 1 },
  questTitle: { fontSize: 15, fontWeight: "600" },
  questDesc: { fontSize: 12, marginTop: 2 },
  questRight: { alignItems: "flex-end", gap: 4 },
  questExp: { fontSize: 13, fontWeight: "700" },
});
