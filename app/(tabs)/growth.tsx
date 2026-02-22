import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  useColorScheme,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import Svg, { Polygon, Circle, Line, Text as SvgText } from "react-native-svg";
import Colors from "@/constants/colors";
import { getApiUrl } from "@/lib/api";

function RadarChart({ data, colors }: { data: { emotion: number; feeling: number; stress: number; spiritual: number }; colors: any }) {
  const size = 200;
  const cx = size / 2;
  const cy = size / 2;
  const r = 70;
  const maxVal = 100;

  const labels = [
    { key: "emotion", label: "감정", angle: -90 },
    { key: "feeling", label: "느낌", angle: 0 },
    { key: "stress", label: "스트레스", angle: 90 },
    { key: "spiritual", label: "영적 성장", angle: 180 },
  ];

  const toXY = (angle: number, value: number) => {
    const rad = (angle * Math.PI) / 180;
    const ratio = value / maxVal;
    return {
      x: cx + r * ratio * Math.cos(rad),
      y: cy + r * ratio * Math.sin(rad),
    };
  };

  const points = labels
    .map((l) => {
      const val = data[l.key as keyof typeof data] || 0;
      const p = toXY(l.angle, val);
      return `${p.x},${p.y}`;
    })
    .join(" ");

  return (
    <Svg width={size} height={size}>
      {[0.25, 0.5, 0.75, 1].map((ratio) => {
        const gridPoints = labels
          .map((l) => {
            const p = toXY(l.angle, maxVal * ratio);
            return `${p.x},${p.y}`;
          })
          .join(" ");
        return (
          <Polygon
            key={ratio}
            points={gridPoints}
            fill="none"
            stroke={colors.border}
            strokeWidth={1}
          />
        );
      })}
      {labels.map((l) => {
        const end = toXY(l.angle, maxVal);
        return (
          <Line
            key={l.key}
            x1={cx}
            y1={cy}
            x2={end.x}
            y2={end.y}
            stroke={colors.border}
            strokeWidth={0.5}
          />
        );
      })}
      <Polygon
        points={points}
        fill={colors.tint + "30"}
        stroke={colors.tint}
        strokeWidth={2}
      />
      {labels.map((l) => {
        const val = data[l.key as keyof typeof data] || 0;
        const p = toXY(l.angle, val);
        return <Circle key={l.key} cx={p.x} cy={p.y} r={4} fill={colors.tint} />;
      })}
      {labels.map((l) => {
        const labelPos = toXY(l.angle, maxVal + 22);
        return (
          <SvgText
            key={l.key + "-label"}
            x={labelPos.x}
            y={labelPos.y}
            textAnchor="middle"
            alignmentBaseline="middle"
            fill={colors.text}
            fontSize={11}
            fontWeight="600"
          >
            {l.label}
          </SvgText>
        );
      })}
    </Svg>
  );
}

export default function GrowthScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const colors = isDark ? Colors.dark : Colors.light;
  const insets = useSafeAreaInsets();
  const [period, setPeriod] = useState<"week" | "month">("week");

  const topInset = Platform.OS === "web" ? 67 : insets.top;

  const { data: character } = useQuery({
    queryKey: ["character"],
    queryFn: async () => {
      const res = await fetch(getApiUrl("/api/character"));
      if (!res.ok) return null;
      return res.json();
    },
  });

  const { data: dashboard } = useQuery({
    queryKey: ["dashboard"],
    queryFn: async () => {
      const res = await fetch(getApiUrl("/api/dashboard"));
      if (!res.ok) return null;
      return res.json();
    },
  });

  const growthData = {
    emotion: character?.emotionGrowth || 0,
    feeling: character?.feelingGrowth || 0,
    stress: character?.stressManagement || 0,
    spiritual: character?.spiritualGrowth || 0,
  };

  const level = character?.level || 1;
  const totalExp = character?.totalExp || 0;
  const nextLevelExp = level * 100;
  const progress = Math.min((totalExp % nextLevelExp) / nextLevelExp, 1);
  const stageNames = ["알", "아기", "어린이", "청소년", "성인"];
  const stage = character?.evolutionStage || 1;

  const stats = dashboard || { totalEmotionLogs: 0, totalFeelingLogs: 0, totalQuests: 0, streak: 0 };

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: topInset + 16 }]}>
      <Text style={[styles.title, { color: colors.text }]}>성장</Text>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>4차원 성장</Text>
          <View style={styles.chartCenter}>
            <RadarChart data={growthData} colors={colors} />
          </View>
        </View>

        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>캐릭터 진화</Text>
          <View style={styles.evolutionRow}>
            <Text style={{ fontSize: 36 }}>
              {stage >= 3 ? "☁️" : stage >= 2 ? "🥚" : "✨"}
            </Text>
            <View style={styles.evolutionInfo}>
              <Text style={[styles.evolutionName, { color: colors.text }]}>
                {character?.name || "마음이"} · Lv.{level}
              </Text>
              <Text style={[styles.evolutionStage, { color: colors.tint }]}>
                {stageNames[stage - 1]} 단계
              </Text>
              <View style={[styles.expBar, { backgroundColor: colors.border }]}>
                <View style={[styles.expFill, { width: `${progress * 100}%`, backgroundColor: colors.tint }]} />
              </View>
              <Text style={[styles.expText, { color: colors.textSecondary }]}>
                {totalExp % nextLevelExp} / {nextLevelExp} EXP
              </Text>
            </View>
          </View>
        </View>

        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>누적 기록</Text>
          <View style={styles.statsGrid}>
            {[
              { label: "감정 기록", value: stats.totalEmotionLogs, icon: "heart" },
              { label: "느낌 기록", value: stats.totalFeelingLogs, icon: "body" },
              { label: "완료 퀘스트", value: stats.totalQuests, icon: "checkmark-circle" },
              { label: "연속 기록일", value: stats.streak, icon: "flame" },
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
            <Text style={[styles.cardTitle, { color: colors.text }]}>주간 리포트</Text>
            <Ionicons name="mail" size={20} color={colors.tint} />
          </View>
          <View style={[styles.letterCard, { backgroundColor: colors.primary + "30" }]}>
            <Text style={[styles.letterText, { color: colors.text }]}>
              아직 첫 주간 리포트가 도착하지 않았어요.{"\n"}
              감정과 느낌을 기록하면 캐릭터가 편지를 보내줄 거예요! 💌
            </Text>
          </View>
        </View>
        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 20 },
  title: { fontSize: 24, fontWeight: "700", marginBottom: 16 },
  card: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  cardTitle: { fontSize: 17, fontWeight: "700", marginBottom: 12 },
  chartCenter: { alignItems: "center" },
  evolutionRow: { flexDirection: "row", gap: 16, alignItems: "center" },
  evolutionInfo: { flex: 1 },
  evolutionName: { fontSize: 16, fontWeight: "700" },
  evolutionStage: { fontSize: 13, fontWeight: "600", marginTop: 2 },
  expBar: {
    height: 8,
    borderRadius: 4,
    marginTop: 8,
    overflow: "hidden",
  },
  expFill: { height: "100%", borderRadius: 4 },
  expText: { fontSize: 12, marginTop: 4 },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  statItem: {
    width: "46%",
    alignItems: "center",
    padding: 12,
    gap: 4,
  },
  statValue: { fontSize: 24, fontWeight: "700" },
  statLabel: { fontSize: 12 },
  reportHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  letterCard: {
    borderRadius: 12,
    padding: 16,
  },
  letterText: { fontSize: 14, lineHeight: 22, textAlign: "center" },
});
