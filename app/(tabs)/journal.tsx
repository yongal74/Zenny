import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Colors from "@/constants/colors";
import { getApiUrl } from "@/lib/api";

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

type TabMode = "activity" | "report" | "stats";

export default function JournalScreen() {
  const colors = Colors.light;
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<TabMode>("activity");
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

  const completeActivity = useMutation({
    mutationFn: async (activity: typeof ACTIVITIES[0]) => {
      const res = await fetch(getApiUrl(`/api/quests/${activity.key}/complete`), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["character"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });

  const stats = dashboard || { totalEmotionLogs: 0, totalFeelingLogs: 0, totalQuests: 0, streak: 0 };
  const tabs: { key: TabMode; label: string; icon: string }[] = [
    { key: "activity", label: "Activity Log", icon: "checkbox" },
    { key: "report", label: "Weekly Report", icon: "mail" },
    { key: "stats", label: "Stats", icon: "bar-chart" },
  ];

  const recentEmotions = emotionLogs.slice(0, 8);
  const recentFeelings = feelingLogs.slice(0, 8);

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: topInset + 12 }]}>
      <Text style={styles.title}>Journal</Text>

      <View style={styles.tabBar}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tab, activeTab === tab.key && styles.tabActive]}
            onPress={() => setActiveTab(tab.key)}
          >
            <Ionicons name={tab.icon as any} size={16} color={activeTab === tab.key ? colors.tint : colors.textSecondary} />
            <Text style={[styles.tabText, { color: activeTab === tab.key ? colors.tint : colors.textSecondary }]}>{tab.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        {activeTab === "activity" && (
          <View>
            <Text style={styles.sectionTitle}>Quick Activity Log</Text>
            <Text style={styles.sectionDesc}>Did an activity on your own? Tap to log it and earn rewards.</Text>
            <View style={styles.activityGrid}>
              {ACTIVITIES.map((a) => (
                <TouchableOpacity
                  key={a.key}
                  style={styles.activityCard}
                  onPress={() => completeActivity.mutate(a)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.activityEmoji}>{a.emoji}</Text>
                  <Text style={styles.activityLabel}>{a.label}</Text>
                  <Text style={styles.activityExp}>+{a.exp} XP</Text>
                </TouchableOpacity>
              ))}
            </View>

            {recentEmotions.length > 0 && (
              <>
                <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Recent Emotion Logs</Text>
                {recentEmotions.map((log: any) => {
                  const emotions = Array.isArray(log.emotions) ? log.emotions : [];
                  const labels = emotions.map((e: any) => e.type).join(", ");
                  const d = new Date(log.loggedAt);
                  return (
                    <View key={log.id} style={styles.logItem}>
                      <View style={[styles.logDot, { backgroundColor: Colors.emotions[emotions[0]?.type as keyof typeof Colors.emotions] || colors.tint }]} />
                      <View style={{ flex: 1 }}>
                        <Text style={styles.logText}>{labels || "—"}</Text>
                        {log.note && <Text style={styles.logNote}>{log.note}</Text>}
                      </View>
                      <Text style={styles.logTime}>{d.toLocaleDateString("en-US", { month: "short", day: "numeric" })}</Text>
                    </View>
                  );
                })}
              </>
            )}

            {recentFeelings.length > 0 && (
              <>
                <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Recent Feeling Logs</Text>
                {recentFeelings.map((log: any) => {
                  const sensations = Array.isArray(log.sensations) ? log.sensations : [];
                  const d = new Date(log.loggedAt);
                  return (
                    <View key={log.id} style={styles.logItem}>
                      <View style={[styles.logDot, { backgroundColor: colors.accent }]} />
                      <View style={{ flex: 1 }}>
                        <Text style={styles.logText}>{sensations.join(", ") || "—"}</Text>
                        {log.freeText && <Text style={styles.logNote}>{log.freeText}</Text>}
                      </View>
                      <Text style={styles.logTime}>{d.toLocaleDateString("en-US", { month: "short", day: "numeric" })}</Text>
                    </View>
                  );
                })}
              </>
            )}
          </View>
        )}

        {activeTab === "report" && (
          <View style={styles.reportSection}>
            <View style={styles.reportCard}>
              <Ionicons name="mail-unread" size={48} color={colors.tint} />
              <Text style={styles.reportTitle}>Weekly Report</Text>
              <Text style={styles.reportDesc}>
                Your weekly insight report will appear here once you've logged enough emotions and feelings.{"\n\n"}
                Maumie analyzes your patterns and writes you a personal letter every week. Keep logging to unlock your first report! 💌
              </Text>
            </View>
          </View>
        )}

        {activeTab === "stats" && (
          <View>
            <View style={styles.statsRow}>
              {[
                { label: "Emotion Logs", value: stats.totalEmotionLogs, icon: "heart", color: "#FF9A8B" },
                { label: "Feeling Logs", value: stats.totalFeelingLogs, icon: "body", color: "#A78BFA" },
                { label: "Quests Done", value: stats.totalQuests, icon: "checkmark-circle", color: "#7ED957" },
                { label: "Day Streak", value: stats.streak, icon: "flame", color: "#FFB347" },
              ].map((s) => (
                <View key={s.label} style={styles.statCard}>
                  <View style={[styles.statIcon, { backgroundColor: s.color + "15" }]}>
                    <Ionicons name={s.icon as any} size={22} color={s.color} />
                  </View>
                  <Text style={styles.statValue}>{s.value}</Text>
                  <Text style={styles.statLabel}>{s.label}</Text>
                </View>
              ))}
            </View>

            <View style={styles.growthCard}>
              <Text style={styles.growthTitle}>Growth Summary</Text>
              <View style={styles.growthRow}>
                {[
                  { label: "Emotion", value: character?.emotionGrowth || 0, color: "#FF9A8B" },
                  { label: "Feeling", value: character?.feelingGrowth || 0, color: "#A78BFA" },
                  { label: "Stress", value: character?.stressManagement || 0, color: "#7ED957" },
                  { label: "Spiritual", value: character?.spiritualGrowth || 0, color: "#FFB347" },
                ].map((g) => (
                  <View key={g.label} style={styles.growthItem}>
                    <View style={styles.growthBarBg}>
                      <View style={[styles.growthBarFill, { height: `${Math.min(g.value, 100)}%`, backgroundColor: g.color }]} />
                    </View>
                    <Text style={styles.growthBarLabel}>{g.label}</Text>
                    <Text style={[styles.growthBarValue, { color: g.color }]}>{g.value}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 20 },
  title: { fontSize: 26, fontWeight: "800", color: "#2D2B3D", marginBottom: 16, letterSpacing: -0.5 },
  tabBar: { flexDirection: "row", backgroundColor: "#FFFFFF", borderRadius: 16, padding: 4, marginBottom: 20, gap: 4, shadowColor: "#7C6DC5", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
  tab: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", paddingVertical: 10, borderRadius: 12, gap: 4 },
  tabActive: { backgroundColor: "rgba(124,109,197,0.1)" },
  tabText: { fontSize: 12, fontWeight: "600" },
  sectionTitle: { fontSize: 18, fontWeight: "700", color: "#2D2B3D", marginBottom: 6 },
  sectionDesc: { fontSize: 13, color: "#9B97B0", marginBottom: 16, lineHeight: 19 },
  activityGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  activityCard: {
    width: "31%", backgroundColor: "#FFFFFF", borderRadius: 16, padding: 14,
    alignItems: "center", gap: 6, flexGrow: 1, maxWidth: "32%",
    shadowColor: "#7C6DC5", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 1,
  },
  activityEmoji: { fontSize: 28 },
  activityLabel: { fontSize: 11, fontWeight: "600", color: "#2D2B3D", textAlign: "center" },
  activityExp: { fontSize: 10, fontWeight: "700", color: "#7C6DC5" },
  logItem: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: "#EDE8F5" },
  logDot: { width: 8, height: 8, borderRadius: 4 },
  logText: { fontSize: 14, fontWeight: "600", color: "#2D2B3D", textTransform: "capitalize" },
  logNote: { fontSize: 12, color: "#9B97B0", marginTop: 2 },
  logTime: { fontSize: 11, color: "#C4BFD6" },
  reportSection: { alignItems: "center", paddingTop: 30 },
  reportCard: { backgroundColor: "#FFFFFF", borderRadius: 20, padding: 30, alignItems: "center", gap: 12, width: "100%", shadowColor: "#7C6DC5", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 12, elevation: 2 },
  reportTitle: { fontSize: 20, fontWeight: "700", color: "#2D2B3D" },
  reportDesc: { fontSize: 14, color: "#9B97B0", textAlign: "center", lineHeight: 22 },
  statsRow: { flexDirection: "row", flexWrap: "wrap", gap: 12, marginBottom: 20 },
  statCard: { width: "47%", backgroundColor: "#FFFFFF", borderRadius: 16, padding: 16, alignItems: "center", gap: 6, flexGrow: 1, shadowColor: "#7C6DC5", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 1 },
  statIcon: { width: 44, height: 44, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  statValue: { fontSize: 28, fontWeight: "800", color: "#2D2B3D" },
  statLabel: { fontSize: 12, color: "#9B97B0", fontWeight: "500" },
  growthCard: { backgroundColor: "#FFFFFF", borderRadius: 20, padding: 20, shadowColor: "#7C6DC5", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 12, elevation: 2 },
  growthTitle: { fontSize: 16, fontWeight: "700", color: "#2D2B3D", marginBottom: 16 },
  growthRow: { flexDirection: "row", justifyContent: "space-around", alignItems: "flex-end", height: 140 },
  growthItem: { alignItems: "center", gap: 6 },
  growthBarBg: { width: 32, height: 100, backgroundColor: "#F5F1FF", borderRadius: 16, overflow: "hidden", justifyContent: "flex-end" },
  growthBarFill: { width: "100%", borderRadius: 16, minHeight: 4 },
  growthBarLabel: { fontSize: 10, fontWeight: "600", color: "#9B97B0" },
  growthBarValue: { fontSize: 14, fontWeight: "700" },
});
