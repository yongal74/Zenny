import React from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import Colors from "@/constants/colors";
import { getApiUrl } from "@/lib/api";

const CHAKRA_LEVELS = [
  { level: 1, name: "Root", color: Colors.chakra.root, meaning: "Stability & Foundation", range: "Lv 1–5" },
  { level: 2, name: "Sacral", color: Colors.chakra.sacral, meaning: "Emotions & Creativity", range: "Lv 6–10" },
  { level: 3, name: "Solar Plexus", color: Colors.chakra.solarPlexus, meaning: "Confidence & Willpower", range: "Lv 11–15" },
  { level: 4, name: "Heart", color: Colors.chakra.heart, meaning: "Love & Empathy", range: "Lv 16–20" },
  { level: 5, name: "Throat", color: Colors.chakra.throat, meaning: "Communication & Truth", range: "Lv 21–25" },
  { level: 6, name: "Third Eye", color: Colors.chakra.thirdEye, meaning: "Intuition & Insight", range: "Lv 26–30" },
  { level: 7, name: "Crown", color: Colors.chakra.crown, meaning: "Awakening & Connection", range: "Lv 31+" },
];

function getChakraStage(level: number) {
  if (level >= 31) return 6;
  if (level >= 26) return 5;
  if (level >= 21) return 4;
  if (level >= 16) return 3;
  if (level >= 11) return 2;
  if (level >= 6) return 1;
  return 0;
}

export default function GrowthScreen() {
  const colors = Colors.light;
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const topInset = Platform.OS === "web" ? 67 : insets.top;

  const { data: character } = useQuery({
    queryKey: ["character"],
    queryFn: async () => {
      const res = await fetch(getApiUrl("/api/character"));
      if (!res.ok) return null;
      return res.json();
    },
  });

  const { data: emotionLogs = [] } = useQuery({
    queryKey: ["emotionHistory"],
    queryFn: async () => {
      const res = await fetch(getApiUrl("/api/emotions"));
      if (!res.ok) return [];
      return res.json();
    },
  });

  const { data: feelingLogs = [] } = useQuery({
    queryKey: ["feelingHistory"],
    queryFn: async () => {
      const res = await fetch(getApiUrl("/api/feelings"));
      if (!res.ok) return [];
      return res.json();
    },
  });

  const level = character?.level || 1;
  const chakraIdx = getChakraStage(level);
  const currentChakra = CHAKRA_LEVELS[chakraIdx];
  const totalExp = character?.totalExp || 0;
  const nextLevelExp = level * 100;
  const progress = Math.min((totalExp % nextLevelExp) / nextLevelExp, 1);

  const recentEmotionBubbles = emotionLogs.slice(0, 4).map((log: any) => {
    const emotions = Array.isArray(log.emotions) ? log.emotions : [];
    return emotions[0]?.type || "calm";
  });
  const recentFeelingBubbles = feelingLogs.slice(0, 4).map((log: any) => {
    const sensations = Array.isArray(log.sensations) ? log.sensations : [];
    return sensations[0] || "—";
  });

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: topInset + 12 }]}>
      <Text style={styles.title}>Growth</Text>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>

        <View style={styles.forestCard}>
          <Text style={styles.forestTitle}>Your Inner Forest</Text>
          <View style={styles.quadrantGrid}>
            <View style={[styles.quadrant, { backgroundColor: "rgba(255,154,139,0.08)" }]}>
              <Text style={styles.quadrantLabel}>🫧 Emotions</Text>
              <View style={styles.bubblesArea}>
                {recentEmotionBubbles.length > 0 ? recentEmotionBubbles.map((e: string, i: number) => (
                  <View key={i} style={[styles.speechBubble, { backgroundColor: Colors.emotions[e as keyof typeof Colors.emotions] || "#EDE8F5" }]}>
                    <Text style={styles.speechText}>{e}</Text>
                  </View>
                )) : <Text style={styles.emptyText}>Log emotions to grow</Text>}
              </View>
            </View>
            <View style={[styles.quadrant, { backgroundColor: "rgba(167,139,250,0.08)" }]}>
              <Text style={styles.quadrantLabel}>🌊 Feelings</Text>
              <View style={styles.bubblesArea}>
                {recentFeelingBubbles.length > 0 ? recentFeelingBubbles.map((f: string, i: number) => (
                  <View key={i} style={[styles.speechBubble, { backgroundColor: "#E8DEFF" }]}>
                    <Text style={styles.speechText}>{f}</Text>
                  </View>
                )) : <Text style={styles.emptyText}>Log feelings to grow</Text>}
              </View>
            </View>
            <View style={[styles.quadrant, { backgroundColor: "rgba(126,217,87,0.08)" }]}>
              <Text style={styles.quadrantLabel}>🍃 Stress Mgmt</Text>
              <View style={styles.bubblesArea}>
                <Text style={styles.growthValue}>{character?.stressManagement || 0}</Text>
                <Text style={styles.emptyText}>points</Text>
              </View>
            </View>
            <View style={[styles.quadrant, { backgroundColor: "rgba(255,179,71,0.08)" }]}>
              <Text style={styles.quadrantLabel}>✨ Spiritual</Text>
              <View style={styles.bubblesArea}>
                <Text style={styles.growthValue}>{character?.spiritualGrowth || 0}</Text>
                <Text style={styles.emptyText}>points</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.chakraCard}>
          <Text style={styles.chakraTitle}>Chakra Level</Text>
          <View style={styles.chakraRow}>
            {CHAKRA_LEVELS.map((c, i) => {
              const isActive = i <= chakraIdx;
              const isCurrent = i === chakraIdx;
              return (
                <View key={c.name} style={styles.chakraItem}>
                  <View style={[
                    styles.chakraDot,
                    { backgroundColor: isActive ? c.color : "#EDE8F5" },
                    isCurrent && styles.chakraCurrent,
                  ]}>
                    {isCurrent && <View style={[styles.chakraPulse, { borderColor: c.color }]} />}
                  </View>
                  {isCurrent && (
                    <View style={[styles.chakraLabel, { backgroundColor: c.color + "20" }]}>
                      <Text style={[styles.chakraLabelText, { color: c.color }]}>{c.name}</Text>
                    </View>
                  )}
                </View>
              );
            })}
          </View>
          <View style={styles.chakraInfo}>
            <Text style={[styles.chakraName, { color: currentChakra.color }]}>{currentChakra.name} Chakra</Text>
            <Text style={styles.chakraMeaning}>{currentChakra.meaning}</Text>
            <View style={styles.expRow}>
              <View style={styles.expBarBg}>
                <View style={[styles.expBarFill, { width: `${progress * 100}%`, backgroundColor: currentChakra.color }]} />
              </View>
              <Text style={styles.expText}>Lv.{level} · {totalExp % nextLevelExp}/{nextLevelExp} XP</Text>
            </View>
          </View>
        </View>

        <View style={styles.coinCard}>
          <View style={styles.coinHeader}>
            <Text style={{ fontSize: 28 }}>🪙</Text>
            <View>
              <Text style={styles.coinValue}>{character?.soulCoins || 0}</Text>
              <Text style={styles.coinLabel}>Soul Coins</Text>
            </View>
          </View>
        </View>

        <TouchableOpacity style={styles.linkBtn} onPress={() => router.push("/shop")} activeOpacity={0.7}>
          <View style={[styles.linkIcon, { backgroundColor: "rgba(124,109,197,0.1)" }]}>
            <Ionicons name="storefront" size={20} color={colors.tint} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.linkTitle}>Soul Shop</Text>
            <Text style={styles.linkDesc}>Customize your Maumie</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.linkBtn} onPress={() => router.push("/wellness")} activeOpacity={0.7}>
          <View style={[styles.linkIcon, { backgroundColor: "rgba(255,154,139,0.1)" }]}>
            <Ionicons name="heart-circle" size={20} color={colors.accent} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.linkTitle}>Wellness Picks</Text>
            <Text style={styles.linkDesc}>Curated recommendations for you</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
        </TouchableOpacity>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 20 },
  title: { fontSize: 26, fontWeight: "800", color: "#2D2B3D", marginBottom: 16, letterSpacing: -0.5 },
  forestCard: { backgroundColor: "#FFFFFF", borderRadius: 20, padding: 16, marginBottom: 16, shadowColor: "#7C6DC5", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 12, elevation: 2 },
  forestTitle: { fontSize: 17, fontWeight: "700", color: "#2D2B3D", marginBottom: 12 },
  quadrantGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  quadrant: { width: "48%", borderRadius: 14, padding: 12, minHeight: 100, flexGrow: 1 },
  quadrantLabel: { fontSize: 12, fontWeight: "700", color: "#2D2B3D", marginBottom: 8 },
  bubblesArea: { flexDirection: "row", flexWrap: "wrap", gap: 4 },
  speechBubble: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10 },
  speechText: { fontSize: 10, fontWeight: "600", color: "#2D2B3D", textTransform: "capitalize" },
  emptyText: { fontSize: 11, color: "#C4BFD6" },
  growthValue: { fontSize: 24, fontWeight: "800", color: "#2D2B3D" },
  chakraCard: { backgroundColor: "#FFFFFF", borderRadius: 20, padding: 20, marginBottom: 16, shadowColor: "#7C6DC5", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 12, elevation: 2 },
  chakraTitle: { fontSize: 17, fontWeight: "700", color: "#2D2B3D", marginBottom: 16 },
  chakraRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16, paddingHorizontal: 4 },
  chakraItem: { alignItems: "center" },
  chakraDot: { width: 20, height: 20, borderRadius: 10 },
  chakraCurrent: { width: 28, height: 28, borderRadius: 14 },
  chakraPulse: { width: 36, height: 36, borderRadius: 18, borderWidth: 2, position: "absolute", top: -4, left: -4, opacity: 0.4 },
  chakraLabel: { marginTop: 6, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
  chakraLabelText: { fontSize: 9, fontWeight: "700" },
  chakraInfo: { alignItems: "center", gap: 4 },
  chakraName: { fontSize: 18, fontWeight: "800" },
  chakraMeaning: { fontSize: 13, color: "#9B97B0" },
  expRow: { width: "100%", marginTop: 8 },
  expBarBg: { height: 6, backgroundColor: "#EDE8F5", borderRadius: 3, overflow: "hidden" },
  expBarFill: { height: "100%", borderRadius: 3 },
  expText: { fontSize: 12, color: "#9B97B0", textAlign: "center", marginTop: 4 },
  coinCard: { backgroundColor: "#FFFFFF", borderRadius: 20, padding: 20, marginBottom: 12, shadowColor: "#7C6DC5", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 12, elevation: 2 },
  coinHeader: { flexDirection: "row", alignItems: "center", gap: 14 },
  coinValue: { fontSize: 28, fontWeight: "800", color: "#2D2B3D" },
  coinLabel: { fontSize: 13, color: "#9B97B0" },
  linkBtn: { flexDirection: "row", alignItems: "center", backgroundColor: "#FFFFFF", borderRadius: 16, padding: 16, marginBottom: 10, gap: 14, shadowColor: "#7C6DC5", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 6, elevation: 1 },
  linkIcon: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  linkTitle: { fontSize: 15, fontWeight: "700", color: "#2D2B3D" },
  linkDesc: { fontSize: 12, color: "#9B97B0", marginTop: 1 },
});
