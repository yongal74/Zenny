import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  TextInput,
  useColorScheme,
  Platform,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Colors from "@/constants/colors";
import { getApiUrl } from "@/lib/api";

type TabMode = "emotion" | "feeling" | "detailed";

const EMOTIONS = [
  { key: "joy", label: "기쁨", icon: "sunny", color: Colors.emotions.joy },
  { key: "sadness", label: "슬픔", icon: "water", color: Colors.emotions.sadness },
  { key: "anger", label: "분노", icon: "flame", color: Colors.emotions.anger },
  { key: "anxiety", label: "불안", icon: "thunderstorm", color: Colors.emotions.anxiety },
  { key: "calm", label: "평온", icon: "leaf", color: Colors.emotions.calm },
  { key: "disgust", label: "혐오", icon: "shield", color: Colors.emotions.disgust },
  { key: "surprise", label: "놀람", icon: "flash", color: Colors.emotions.surprise },
];

const SENSATIONS = [
  "가슴이 답답함", "어깨가 무거움", "속이 시원함", "손이 떨림",
  "머리가 맑음", "몸이 뻣뻣함", "배가 아픔", "눈이 피로함",
  "온몸이 가벼움", "다리가 무거움",
];

const BODY_PARTS = [
  "머리", "눈", "가슴", "어깨", "배", "등", "팔", "다리", "손", "발",
];

export default function LogScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const colors = isDark ? Colors.dark : Colors.light;
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState<TabMode>("emotion");
  const [selectedEmotions, setSelectedEmotions] = useState<Record<string, number>>({});
  const [emotionNote, setEmotionNote] = useState("");
  const [selectedSensations, setSelectedSensations] = useState<string[]>([]);
  const [selectedBodyParts, setSelectedBodyParts] = useState<string[]>([]);
  const [energyLevel, setEnergyLevel] = useState(3);
  const [feelingText, setFeelingText] = useState("");

  const topInset = Platform.OS === "web" ? 67 : insets.top;

  const toggleEmotion = (key: string) => {
    setSelectedEmotions((prev) => {
      const next = { ...prev };
      if (next[key]) {
        delete next[key];
      } else {
        next[key] = 3;
      }
      return next;
    });
  };

  const setIntensity = (key: string, value: number) => {
    setSelectedEmotions((prev) => ({ ...prev, [key]: value }));
  };

  const toggleSensation = (s: string) => {
    setSelectedSensations((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]
    );
  };

  const toggleBodyPart = (p: string) => {
    setSelectedBodyParts((prev) =>
      prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]
    );
  };

  const saveEmotion = useMutation({
    mutationFn: async () => {
      const emotions = Object.entries(selectedEmotions).map(([type, intensity]) => ({
        type,
        intensity,
      }));
      const res = await fetch(getApiUrl("/api/emotions"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emotions, note: emotionNote, tags: [] }),
      });
      if (!res.ok) throw new Error("Failed to save");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["character"] });
      queryClient.invalidateQueries({ queryKey: ["emotionLogs"] });
      setSelectedEmotions({});
      setEmotionNote("");
      Alert.alert("기록 완료", "감정이 기록되었어요 ✨");
    },
  });

  const saveFeeling = useMutation({
    mutationFn: async () => {
      const res = await fetch(getApiUrl("/api/feelings"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bodyParts: selectedBodyParts,
          sensations: selectedSensations,
          energyLevel,
          freeText: feelingText,
        }),
      });
      if (!res.ok) throw new Error("Failed to save");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["character"] });
      queryClient.invalidateQueries({ queryKey: ["feelingLogs"] });
      setSelectedSensations([]);
      setSelectedBodyParts([]);
      setEnergyLevel(3);
      setFeelingText("");
      Alert.alert("기록 완료", "느낌이 기록되었어요 ✨");
    },
  });

  const tabs: { key: TabMode; label: string }[] = [
    { key: "emotion", label: "감정 기록" },
    { key: "feeling", label: "느낌 기록" },
    { key: "detailed", label: "상세 기록" },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: topInset + 16 }]}>
      <Text style={[styles.title, { color: colors.text }]}>기록</Text>
      <View style={[styles.tabBar, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[
              styles.tab,
              activeTab === tab.key && { backgroundColor: colors.tint + "20" },
            ]}
            onPress={() => setActiveTab(tab.key)}
          >
            <Text
              style={[
                styles.tabText,
                { color: activeTab === tab.key ? colors.tint : colors.textSecondary },
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {activeTab === "emotion" && (
          <View>
            <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>
              지금 느끼는 감정을 선택하세요 (복수 선택 가능)
            </Text>
            <View style={styles.emotionGrid}>
              {EMOTIONS.map((e) => {
                const selected = e.key in selectedEmotions;
                return (
                  <TouchableOpacity
                    key={e.key}
                    style={[
                      styles.emotionCard,
                      {
                        backgroundColor: selected ? e.color + "25" : colors.surface,
                        borderColor: selected ? e.color : colors.border,
                      },
                    ]}
                    onPress={() => toggleEmotion(e.key)}
                    activeOpacity={0.7}
                  >
                    <Ionicons name={e.icon as any} size={28} color={e.color} />
                    <Text style={[styles.emotionName, { color: colors.text }]}>{e.label}</Text>
                    {selected && (
                      <View style={styles.intensityRow}>
                        {[1, 2, 3, 4, 5].map((v) => (
                          <TouchableOpacity
                            key={v}
                            onPress={() => setIntensity(e.key, v)}
                            style={[
                              styles.intensityDot,
                              {
                                backgroundColor:
                                  v <= (selectedEmotions[e.key] || 3) ? e.color : e.color + "30",
                              },
                            ]}
                          />
                        ))}
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
            <TextInput
              style={[styles.noteInput, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
              placeholder="메모 (선택)"
              placeholderTextColor={colors.textSecondary}
              value={emotionNote}
              onChangeText={setEmotionNote}
              multiline
            />
            <TouchableOpacity
              style={[styles.saveButton, { backgroundColor: colors.tint, opacity: Object.keys(selectedEmotions).length > 0 ? 1 : 0.5 }]}
              onPress={() => saveEmotion.mutate()}
              disabled={Object.keys(selectedEmotions).length === 0 || saveEmotion.isPending}
            >
              <Text style={styles.saveButtonText}>
                {saveEmotion.isPending ? "저장 중..." : "감정 기록하기"}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {activeTab === "feeling" && (
          <View>
            <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>
              몸에서 느껴지는 감각을 선택하세요
            </Text>
            <Text style={[styles.subLabel, { color: colors.textSecondary }]}>신체 부위</Text>
            <View style={styles.chipGrid}>
              {BODY_PARTS.map((p) => {
                const selected = selectedBodyParts.includes(p);
                return (
                  <TouchableOpacity
                    key={p}
                    style={[
                      styles.chip,
                      {
                        backgroundColor: selected ? colors.tint + "20" : colors.surface,
                        borderColor: selected ? colors.tint : colors.border,
                      },
                    ]}
                    onPress={() => toggleBodyPart(p)}
                  >
                    <Text style={{ color: selected ? colors.tint : colors.text, fontSize: 14 }}>{p}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            <Text style={[styles.subLabel, { color: colors.textSecondary }]}>느낌</Text>
            <View style={styles.chipGrid}>
              {SENSATIONS.map((s) => {
                const selected = selectedSensations.includes(s);
                return (
                  <TouchableOpacity
                    key={s}
                    style={[
                      styles.chip,
                      {
                        backgroundColor: selected ? colors.accent + "20" : colors.surface,
                        borderColor: selected ? colors.accent : colors.border,
                      },
                    ]}
                    onPress={() => toggleSensation(s)}
                  >
                    <Text style={{ color: selected ? colors.accent : colors.text, fontSize: 13 }}>{s}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            <Text style={[styles.subLabel, { color: colors.textSecondary }]}>
              에너지 수준: {energyLevel}/5
            </Text>
            <View style={styles.energyRow}>
              {[1, 2, 3, 4, 5].map((v) => (
                <TouchableOpacity
                  key={v}
                  style={[
                    styles.energyBtn,
                    {
                      backgroundColor: v <= energyLevel ? colors.tint : colors.surface,
                      borderColor: colors.border,
                    },
                  ]}
                  onPress={() => setEnergyLevel(v)}
                >
                  <Text style={{ color: v <= energyLevel ? "#fff" : colors.text, fontWeight: "600" }}>
                    {v}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <TextInput
              style={[styles.noteInput, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
              placeholder="자유롭게 느낌을 적어보세요 (선택)"
              placeholderTextColor={colors.textSecondary}
              value={feelingText}
              onChangeText={setFeelingText}
              multiline
            />
            <TouchableOpacity
              style={[styles.saveButton, { backgroundColor: colors.accent, opacity: selectedSensations.length > 0 || selectedBodyParts.length > 0 ? 1 : 0.5 }]}
              onPress={() => saveFeeling.mutate()}
              disabled={(selectedSensations.length === 0 && selectedBodyParts.length === 0) || saveFeeling.isPending}
            >
              <Text style={styles.saveButtonText}>
                {saveFeeling.isPending ? "저장 중..." : "느낌 기록하기"}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {activeTab === "detailed" && (
          <View style={styles.detailedSection}>
            <Ionicons name="sparkles" size={48} color={colors.tint} style={{ alignSelf: "center" }} />
            <Text style={[styles.detailedTitle, { color: colors.text }]}>
              AI 가이드 상세 기록
            </Text>
            <Text style={[styles.detailedDesc, { color: colors.textSecondary }]}>
              AI가 대화를 통해 장면 → 감정 → 몸의 느낌 → 패턴까지{"\n"}
              4단계로 기록을 도와줍니다.
            </Text>
            <TouchableOpacity
              style={[styles.saveButton, { backgroundColor: colors.tint }]}
            >
              <Text style={styles.saveButtonText}>상세 기록 시작하기</Text>
            </TouchableOpacity>
          </View>
        )}
        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 20 },
  title: { fontSize: 24, fontWeight: "700", marginBottom: 12 },
  tabBar: {
    flexDirection: "row",
    borderRadius: 12,
    borderWidth: 1,
    padding: 3,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 8,
    borderRadius: 10,
  },
  tabText: { fontSize: 13, fontWeight: "600" },
  content: { flex: 1 },
  sectionLabel: { fontSize: 14, marginBottom: 12, lineHeight: 20 },
  subLabel: { fontSize: 13, fontWeight: "600", marginTop: 16, marginBottom: 8 },
  emotionGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  emotionCard: {
    width: "30%",
    alignItems: "center",
    padding: 12,
    borderRadius: 14,
    borderWidth: 1.5,
    gap: 4,
    flexGrow: 1,
    maxWidth: "32%",
  },
  emotionName: { fontSize: 13, fontWeight: "600" },
  intensityRow: { flexDirection: "row", gap: 4, marginTop: 4 },
  intensityDot: { width: 10, height: 10, borderRadius: 5 },
  chipGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  energyRow: { flexDirection: "row", gap: 10, marginBottom: 8 },
  energyBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  noteInput: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    marginTop: 16,
    minHeight: 60,
    fontSize: 14,
    textAlignVertical: "top",
  },
  saveButton: {
    marginTop: 16,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
  },
  saveButtonText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  detailedSection: { alignItems: "center", paddingTop: 40, gap: 12 },
  detailedTitle: { fontSize: 20, fontWeight: "700" },
  detailedDesc: { fontSize: 14, textAlign: "center", lineHeight: 22 },
});
