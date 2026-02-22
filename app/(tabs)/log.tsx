import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Platform,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import Colors from "@/constants/colors";
import { getApiUrl } from "@/lib/api";

type TabMode = "emotion" | "feeling" | "detailed";

const EMOTIONS = [
  { key: "joy", label: "Joy", icon: "sunny", color: Colors.emotions.joy },
  { key: "sadness", label: "Sadness", icon: "water", color: Colors.emotions.sadness },
  { key: "anger", label: "Anger", icon: "flame", color: Colors.emotions.anger },
  { key: "anxiety", label: "Anxiety", icon: "thunderstorm", color: Colors.emotions.anxiety },
  { key: "calm", label: "Calm", icon: "leaf", color: Colors.emotions.calm },
  { key: "disgust", label: "Disgust", icon: "shield", color: Colors.emotions.disgust },
  { key: "surprise", label: "Surprise", icon: "flash", color: Colors.emotions.surprise },
];

const SENSATIONS = [
  "Tight chest", "Heavy shoulders", "Stomach relief", "Shaky hands",
  "Clear head", "Stiff body", "Stomach ache", "Tired eyes",
  "Light body", "Heavy legs",
];

const BODY_PARTS = ["Head", "Eyes", "Chest", "Shoulders", "Stomach", "Back", "Arms", "Legs", "Hands", "Feet"];

export default function LogScreen() {
  const colors = Colors.light;
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
      if (next[key]) delete next[key]; else next[key] = 3;
      return next;
    });
  };

  const setIntensity = (key: string, value: number) => {
    setSelectedEmotions((prev) => ({ ...prev, [key]: value }));
  };

  const saveEmotion = useMutation({
    mutationFn: async () => {
      const emotions = Object.entries(selectedEmotions).map(([type, intensity]) => ({ type, intensity }));
      const res = await fetch(getApiUrl("/api/emotions"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emotions, note: emotionNote, tags: [] }),
      });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["character"] });
      setSelectedEmotions({});
      setEmotionNote("");
      Alert.alert("Saved", "Your emotions have been recorded ✨");
    },
  });

  const saveFeeling = useMutation({
    mutationFn: async () => {
      const res = await fetch(getApiUrl("/api/feelings"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bodyParts: selectedBodyParts, sensations: selectedSensations, energyLevel, freeText: feelingText }),
      });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["character"] });
      setSelectedSensations([]);
      setSelectedBodyParts([]);
      setEnergyLevel(3);
      setFeelingText("");
      Alert.alert("Saved", "Your feelings have been recorded ✨");
    },
  });

  const tabs: { key: TabMode; label: string }[] = [
    { key: "emotion", label: "Emotions" },
    { key: "feeling", label: "Feelings" },
    { key: "detailed", label: "Guided" },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: topInset + 16 }]}>
      <Text style={[styles.title, { color: colors.text }]}>Log</Text>
      <View style={[styles.tabBar, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tab, activeTab === tab.key && { backgroundColor: colors.tint + "25" }]}
            onPress={() => setActiveTab(tab.key)}
          >
            <Text style={[styles.tabText, { color: activeTab === tab.key ? colors.tint : colors.textSecondary }]}>{tab.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {activeTab === "emotion" && (
          <View>
            <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>
              What emotions are you feeling right now? (select multiple)
            </Text>
            <View style={styles.emotionGrid}>
              {EMOTIONS.map((e) => {
                const selected = e.key in selectedEmotions;
                return (
                  <TouchableOpacity
                    key={e.key}
                    style={[styles.emotionCard, { backgroundColor: selected ? e.color + "20" : colors.surface, borderColor: selected ? e.color : colors.border }]}
                    onPress={() => toggleEmotion(e.key)}
                    activeOpacity={0.7}
                  >
                    <Ionicons name={e.icon as any} size={26} color={e.color} />
                    <Text style={[styles.emotionName, { color: colors.text }]}>{e.label}</Text>
                    {selected && (
                      <View style={styles.intensityRow}>
                        {[1, 2, 3, 4, 5].map((v) => (
                          <TouchableOpacity key={v} onPress={() => setIntensity(e.key, v)}
                            style={[styles.intensityDot, { backgroundColor: v <= (selectedEmotions[e.key] || 3) ? e.color : e.color + "30" }]}
                          />
                        ))}
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
            <TextInput
              style={[styles.noteInput, { backgroundColor: colors.inputBg, borderColor: colors.border, color: colors.text }]}
              placeholder="Add a note (optional)"
              placeholderTextColor={colors.textSecondary}
              value={emotionNote}
              onChangeText={setEmotionNote}
              multiline
            />
            <TouchableOpacity
              style={[styles.saveButton, { backgroundColor: colors.tint, opacity: Object.keys(selectedEmotions).length > 0 ? 1 : 0.4 }]}
              onPress={() => saveEmotion.mutate()}
              disabled={Object.keys(selectedEmotions).length === 0 || saveEmotion.isPending}
            >
              <Text style={styles.saveButtonText}>{saveEmotion.isPending ? "Saving..." : "Save Emotions"}</Text>
            </TouchableOpacity>
          </View>
        )}

        {activeTab === "feeling" && (
          <View>
            <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>What do you feel in your body?</Text>
            <Text style={[styles.subLabel, { color: colors.textSecondary }]}>Body Parts</Text>
            <View style={styles.chipGrid}>
              {BODY_PARTS.map((p) => {
                const selected = selectedBodyParts.includes(p);
                return (
                  <TouchableOpacity key={p} style={[styles.chip, { backgroundColor: selected ? colors.tint + "20" : colors.surface, borderColor: selected ? colors.tint : colors.border }]}
                    onPress={() => setSelectedBodyParts((prev) => prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p])}>
                    <Text style={{ color: selected ? colors.tint : colors.text, fontSize: 14 }}>{p}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            <Text style={[styles.subLabel, { color: colors.textSecondary }]}>Sensations</Text>
            <View style={styles.chipGrid}>
              {SENSATIONS.map((s) => {
                const selected = selectedSensations.includes(s);
                return (
                  <TouchableOpacity key={s} style={[styles.chip, { backgroundColor: selected ? colors.accent + "20" : colors.surface, borderColor: selected ? colors.accent : colors.border }]}
                    onPress={() => setSelectedSensations((prev) => prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s])}>
                    <Text style={{ color: selected ? colors.accent : colors.text, fontSize: 13 }}>{s}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            <Text style={[styles.subLabel, { color: colors.textSecondary }]}>Energy Level: {energyLevel}/5</Text>
            <View style={styles.energyRow}>
              {[1, 2, 3, 4, 5].map((v) => (
                <TouchableOpacity key={v} style={[styles.energyBtn, { backgroundColor: v <= energyLevel ? colors.tint : colors.surface, borderColor: colors.border }]}
                  onPress={() => setEnergyLevel(v)}>
                  <Text style={{ color: v <= energyLevel ? "#1B2A4A" : colors.text, fontWeight: "600" }}>{v}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <TextInput
              style={[styles.noteInput, { backgroundColor: colors.inputBg, borderColor: colors.border, color: colors.text }]}
              placeholder="Describe what you feel (optional)"
              placeholderTextColor={colors.textSecondary}
              value={feelingText}
              onChangeText={setFeelingText}
              multiline
            />
            <TouchableOpacity
              style={[styles.saveButton, { backgroundColor: colors.accent, opacity: selectedSensations.length > 0 || selectedBodyParts.length > 0 ? 1 : 0.4 }]}
              onPress={() => saveFeeling.mutate()}
              disabled={(selectedSensations.length === 0 && selectedBodyParts.length === 0) || saveFeeling.isPending}
            >
              <Text style={styles.saveButtonText}>{saveFeeling.isPending ? "Saving..." : "Save Feelings"}</Text>
            </TouchableOpacity>
          </View>
        )}

        {activeTab === "detailed" && (
          <View style={styles.detailedSection}>
            <Ionicons name="sparkles" size={48} color={colors.tint} />
            <Text style={[styles.detailedTitle, { color: colors.text }]}>AI Guided Journal</Text>
            <Text style={[styles.detailedDesc, { color: colors.textSecondary }]}>
              Your AI companion guides you through 4 steps:{"\n"}
              Scene → Emotion → Body Feeling → Pattern
            </Text>
            <TouchableOpacity style={[styles.saveButton, { backgroundColor: colors.tint }]}>
              <Text style={styles.saveButtonText}>Start Guided Session</Text>
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
  tabBar: { flexDirection: "row", borderRadius: 12, borderWidth: 1, padding: 3, marginBottom: 16 },
  tab: { flex: 1, alignItems: "center", paddingVertical: 8, borderRadius: 10 },
  tabText: { fontSize: 13, fontWeight: "600" },
  content: { flex: 1 },
  sectionLabel: { fontSize: 14, marginBottom: 12, lineHeight: 20 },
  subLabel: { fontSize: 13, fontWeight: "600", marginTop: 16, marginBottom: 8 },
  emotionGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  emotionCard: { width: "30%", alignItems: "center", padding: 12, borderRadius: 14, borderWidth: 1.5, gap: 4, flexGrow: 1, maxWidth: "32%" },
  emotionName: { fontSize: 13, fontWeight: "600" },
  intensityRow: { flexDirection: "row", gap: 4, marginTop: 4 },
  intensityDot: { width: 10, height: 10, borderRadius: 5 },
  chipGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1 },
  energyRow: { flexDirection: "row", gap: 10, marginBottom: 8 },
  energyBtn: { width: 44, height: 44, borderRadius: 22, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  noteInput: { borderWidth: 1, borderRadius: 12, padding: 14, marginTop: 16, minHeight: 60, fontSize: 14, textAlignVertical: "top" },
  saveButton: { marginTop: 16, paddingVertical: 14, borderRadius: 14, alignItems: "center" },
  saveButtonText: { color: "#1B2A4A", fontSize: 16, fontWeight: "700" },
  detailedSection: { alignItems: "center", paddingTop: 40, gap: 12 },
  detailedTitle: { fontSize: 20, fontWeight: "700" },
  detailedDesc: { fontSize: 14, textAlign: "center", lineHeight: 22 },
});
