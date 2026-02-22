import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Platform,
  Linking,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import Colors from "@/constants/colors";
import { getApiUrl } from "@/lib/api";

type WellnessCategory = "all" | "supplement" | "video" | "book";

const CATEGORIES: { key: WellnessCategory; label: string; icon: string }[] = [
  { key: "all", label: "All", icon: "apps" },
  { key: "supplement", label: "Supplements", icon: "fitness" },
  { key: "video", label: "Videos", icon: "play-circle" },
  { key: "book", label: "Books", icon: "book" },
];

export default function WellnessScreen() {
  const colors = Colors.light;
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState<WellnessCategory>("all");
  const topInset = Platform.OS === "web" ? 67 : insets.top;

  const { data: recommendations = [] } = useQuery({
    queryKey: ["wellness"],
    queryFn: async () => {
      const res = await fetch(getApiUrl("/api/wellness"));
      if (!res.ok) return [];
      return res.json();
    },
  });

  const filtered = activeCategory === "all"
    ? recommendations
    : recommendations.filter((r: any) => r.category === activeCategory);

  const EMOTION_TAGS = ["anxiety", "sadness", "anger"];

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: topInset }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>Wellness Picks</Text>
      </View>

      <View style={[styles.infoBanner, { backgroundColor: colors.tint + "10", borderColor: colors.tint + "30" }]}>
        <Ionicons name="sparkles" size={18} color={colors.tint} />
        <Text style={[styles.infoText, { color: colors.textSecondary }]}>
          Curated recommendations based on your emotional patterns. Tap any item to learn more.
        </Text>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryBar} contentContainerStyle={{ gap: 8, paddingHorizontal: 20 }}>
        {CATEGORIES.map((c) => (
          <TouchableOpacity key={c.key}
            style={[styles.categoryChip, { backgroundColor: activeCategory === c.key ? colors.tint + "25" : colors.surface, borderColor: activeCategory === c.key ? colors.tint : colors.border }]}
            onPress={() => setActiveCategory(c.key)}>
            <Ionicons name={c.icon as any} size={16} color={activeCategory === c.key ? colors.tint : colors.textSecondary} />
            <Text style={{ color: activeCategory === c.key ? colors.tint : colors.textSecondary, fontSize: 13, fontWeight: "600" }}>{c.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
        {filtered.map((rec: any) => (
          <TouchableOpacity key={rec.id}
            style={[styles.recCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={() => rec.linkUrl && Linking.openURL(rec.linkUrl)}
            activeOpacity={0.7}>
            <Text style={styles.recEmoji}>{rec.imageEmoji}</Text>
            <View style={styles.recInfo}>
              <Text style={[styles.recTitle, { color: colors.text }]}>{rec.title}</Text>
              <Text style={[styles.recDesc, { color: colors.textSecondary }]}>{rec.description}</Text>
              <View style={styles.recTags}>
                <View style={[styles.categoryTag, { backgroundColor: colors.accent + "15" }]}>
                  <Text style={[styles.categoryTagText, { color: colors.accent }]}>{rec.category}</Text>
                </View>
                {rec.emotionTrigger && (
                  <View style={[styles.categoryTag, { backgroundColor: Colors.emotions[rec.emotionTrigger as keyof typeof Colors.emotions] + "20" }]}>
                    <Text style={[styles.categoryTagText, { color: Colors.emotions[rec.emotionTrigger as keyof typeof Colors.emotions] || colors.text }]}>for {rec.emotionTrigger}</Text>
                  </View>
                )}
              </View>
            </View>
            <Ionicons name="open-outline" size={18} color={colors.textSecondary} />
          </TouchableOpacity>
        ))}
        <View style={{ height: 60 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: "row", alignItems: "center", paddingHorizontal: 20, paddingVertical: 12, gap: 12 },
  backBtn: { padding: 4 },
  title: { fontSize: 22, fontWeight: "700", flex: 1 },
  infoBanner: { marginHorizontal: 20, borderRadius: 12, borderWidth: 1, padding: 12, flexDirection: "row", gap: 10, alignItems: "flex-start", marginBottom: 12 },
  infoText: { flex: 1, fontSize: 13, lineHeight: 19 },
  categoryBar: { maxHeight: 48, marginBottom: 12 },
  categoryChip: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1 },
  list: { flex: 1, paddingHorizontal: 20 },
  recCard: { flexDirection: "row", alignItems: "center", padding: 14, borderRadius: 14, borderWidth: 1, marginBottom: 10, gap: 12 },
  recEmoji: { fontSize: 32 },
  recInfo: { flex: 1 },
  recTitle: { fontSize: 15, fontWeight: "700" },
  recDesc: { fontSize: 12, lineHeight: 18, marginTop: 2 },
  recTags: { flexDirection: "row", gap: 6, marginTop: 6 },
  categoryTag: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  categoryTagText: { fontSize: 10, fontWeight: "600", textTransform: "capitalize" },
});
