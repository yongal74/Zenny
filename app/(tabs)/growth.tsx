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
import Svg, { Polygon, Circle, Line, Text as SvgText } from "react-native-svg";
import Colors from "@/constants/colors";
import { getApiUrl } from "@/lib/api";

function RadarChart({ data }: { data: { emotion: number; feeling: number; stress: number; spiritual: number } }) {
  const colors = Colors.light;
  const size = 200;
  const cx = size / 2, cy = size / 2, r = 70, maxVal = 100;
  const labels = [
    { key: "emotion", label: "Emotion", angle: -90 },
    { key: "feeling", label: "Feeling", angle: 0 },
    { key: "stress", label: "Stress Mgmt", angle: 90 },
    { key: "spiritual", label: "Spiritual", angle: 180 },
  ];

  const toXY = (angle: number, value: number) => {
    const rad = (angle * Math.PI) / 180;
    return { x: cx + r * (value / maxVal) * Math.cos(rad), y: cy + r * (value / maxVal) * Math.sin(rad) };
  };

  const points = labels.map((l) => { const p = toXY(l.angle, data[l.key as keyof typeof data] || 0); return `${p.x},${p.y}`; }).join(" ");

  return (
    <Svg width={size} height={size}>
      {[0.25, 0.5, 0.75, 1].map((ratio) => (
        <Polygon key={ratio} points={labels.map((l) => { const p = toXY(l.angle, maxVal * ratio); return `${p.x},${p.y}`; }).join(" ")} fill="none" stroke={colors.border} strokeWidth={1} />
      ))}
      {labels.map((l) => { const end = toXY(l.angle, maxVal); return <Line key={l.key} x1={cx} y1={cy} x2={end.x} y2={end.y} stroke={colors.border} strokeWidth={0.5} />; })}
      <Polygon points={points} fill={colors.tint + "30"} stroke={colors.tint} strokeWidth={2} />
      {labels.map((l) => { const p = toXY(l.angle, data[l.key as keyof typeof data] || 0); return <Circle key={l.key} cx={p.x} cy={p.y} r={4} fill={colors.tint} />; })}
      {labels.map((l) => { const lp = toXY(l.angle, maxVal + 22); return <SvgText key={l.key + "-l"} x={lp.x} y={lp.y} textAnchor="middle" alignmentBaseline="middle" fill={colors.text} fontSize={10} fontWeight="600">{l.label}</SvgText>; })}
    </Svg>
  );
}

export default function GrowthScreen() {
  const colors = Colors.light;
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const topInset = Platform.OS === "web" ? 67 : insets.top;

  const { data: character } = useQuery({
    queryKey: ["character"],
    queryFn: async () => { const res = await fetch(getApiUrl("/api/character")); if (!res.ok) return null; return res.json(); },
  });

  const { data: dashboard } = useQuery({
    queryKey: ["dashboard"],
    queryFn: async () => { const res = await fetch(getApiUrl("/api/dashboard")); if (!res.ok) return null; return res.json(); },
  });

  const growthData = { emotion: character?.emotionGrowth || 0, feeling: character?.feelingGrowth || 0, stress: character?.stressManagement || 0, spiritual: character?.spiritualGrowth || 0 };
  const level = character?.level || 1;
  const totalExp = character?.totalExp || 0;
  const nextLevelExp = level * 100;
  const progress = Math.min((totalExp % nextLevelExp) / nextLevelExp, 1);
  const stageNames = ["Egg", "Baby", "Child", "Teen", "Adult"];
  const stage = character?.evolutionStage || 1;
  const stats = dashboard || { totalEmotionLogs: 0, totalFeelingLogs: 0, totalQuests: 0, streak: 0 };

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: topInset + 16 }]}>
      <Text style={[styles.title, { color: colors.text }]}>Growth</Text>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>4D Growth</Text>
          <View style={styles.chartCenter}><RadarChart data={growthData} /></View>
        </View>

        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>Evolution</Text>
          <View style={styles.evolutionRow}>
            <Text style={{ fontSize: 36 }}>{stage >= 3 ? "☁️" : stage >= 2 ? "🥚" : "✨"}</Text>
            <View style={styles.evolutionInfo}>
              <Text style={[styles.evolutionName, { color: colors.text }]}>{character?.name || "Maumie"} · Lv.{level}</Text>
              <Text style={[styles.evolutionStage, { color: colors.tint }]}>{stageNames[stage - 1]} Stage</Text>
              <View style={[styles.expBar, { backgroundColor: colors.border }]}>
                <View style={[styles.expFill, { width: `${progress * 100}%`, backgroundColor: colors.tint }]} />
              </View>
              <Text style={[styles.expText, { color: colors.textSecondary }]}>{totalExp % nextLevelExp} / {nextLevelExp} EXP</Text>
            </View>
          </View>
        </View>

        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>Stats</Text>
          <View style={styles.statsGrid}>
            {[
              { label: "Emotion Logs", value: stats.totalEmotionLogs, icon: "heart" },
              { label: "Feeling Logs", value: stats.totalFeelingLogs, icon: "body" },
              { label: "Quests Done", value: stats.totalQuests, icon: "checkmark-circle" },
              { label: "Day Streak", value: stats.streak, icon: "flame" },
            ].map((s) => (
              <View key={s.label} style={styles.statItem}>
                <Ionicons name={s.icon as any} size={20} color={colors.tint} />
                <Text style={[styles.statValue, { color: colors.text }]}>{s.value}</Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{s.label}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.reportHeader}>
            <Text style={[styles.cardTitle, { color: colors.text }]}>Weekly Report</Text>
            <Ionicons name="mail" size={20} color={colors.tint} />
          </View>
          <View style={[styles.letterCard, { backgroundColor: colors.primary + "80" }]}>
            <Text style={[styles.letterText, { color: colors.textSecondary }]}>
              Your first weekly report hasn't arrived yet.{"\n"}
              Keep logging your emotions and feelings — Maumie will write you a letter! 💌
            </Text>
          </View>
        </View>

        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>Soul Coins</Text>
          <View style={styles.coinRow}>
            <Text style={{ fontSize: 28 }}>🪙</Text>
            <Text style={[styles.coinValue, { color: colors.tint }]}>{character?.soulCoins || 0}</Text>
            <Text style={[styles.coinLabel, { color: colors.textSecondary }]}>coins earned</Text>
          </View>
          <Text style={[styles.coinHint, { color: colors.textSecondary }]}>
            Earn coins by logging emotions, feelings, and completing quests!
          </Text>
        </View>

        <TouchableOpacity style={[styles.shopBtn, { backgroundColor: colors.tint }]} onPress={() => router.push("/shop")}>
          <Ionicons name="storefront" size={20} color="#1B2A4A" />
          <Text style={styles.shopBtnText}>Soul Shop</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.wellnessBtn, { backgroundColor: colors.accent }]} onPress={() => router.push("/wellness")}>
          <Ionicons name="heart-circle" size={20} color="#1B2A4A" />
          <Text style={styles.shopBtnText}>Wellness Picks</Text>
        </TouchableOpacity>

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 20 },
  title: { fontSize: 24, fontWeight: "700", marginBottom: 16 },
  card: { borderWidth: 1, borderRadius: 16, padding: 16, marginBottom: 16 },
  cardTitle: { fontSize: 17, fontWeight: "700", marginBottom: 12 },
  chartCenter: { alignItems: "center" },
  evolutionRow: { flexDirection: "row", gap: 16, alignItems: "center" },
  evolutionInfo: { flex: 1 },
  evolutionName: { fontSize: 16, fontWeight: "700" },
  evolutionStage: { fontSize: 13, fontWeight: "600", marginTop: 2 },
  expBar: { height: 8, borderRadius: 4, marginTop: 8, overflow: "hidden" },
  expFill: { height: "100%", borderRadius: 4 },
  expText: { fontSize: 12, marginTop: 4 },
  statsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  statItem: { width: "46%", alignItems: "center", padding: 12, gap: 4 },
  statValue: { fontSize: 24, fontWeight: "700" },
  statLabel: { fontSize: 12 },
  reportHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  letterCard: { borderRadius: 12, padding: 16 },
  letterText: { fontSize: 14, lineHeight: 22, textAlign: "center" },
  coinRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  coinValue: { fontSize: 28, fontWeight: "700" },
  coinLabel: { fontSize: 14 },
  coinHint: { fontSize: 12, marginTop: 8, lineHeight: 18 },
  shopBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 8, paddingVertical: 14, borderRadius: 14, marginBottom: 8,
  },
  wellnessBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 8, paddingVertical: 14, borderRadius: 14, marginBottom: 8,
  },
  shopBtnText: { color: "#1B2A4A", fontSize: 16, fontWeight: "700" },
});
