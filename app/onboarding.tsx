import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Dimensions,
  Platform,
  Image,
} from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";

const { width } = Dimensions.get("window");

const SLIDES = [
  {
    title: "Welcome to Maumie",
    subtitle: "Your Personal Wellness Companion",
    body: "In the AI era, your emotions and inner world are your most valuable assets. Maumie helps you understand and manage them — one check-in at a time.",
    icon: "heart-circle" as const,
    color: "#FF6B9D",
  },
  {
    title: "Emotions & Feelings",
    subtitle: "Two Sides of Your Inner World",
    body: "Log your emotions (psychological states like joy, sadness, anxiety) and feelings (physical sensations in your body). Understanding both is the key to true self-awareness.",
    icon: "sparkles" as const,
    color: "#A78BFA",
  },
  {
    title: "Grow Together",
    subtitle: "Your Tamagotchi Evolves With You",
    body: "Your Maumie companion mirrors your growth. As you meditate, breathe, and check in with yourself, your character levels up and evolves — just like you.",
    icon: "trending-up" as const,
    color: "#7ED957",
  },
  {
    title: "Meditation & Breathing",
    subtitle: "Guided Wellness Practices",
    body: "Access guided breathing exercises and calming meditation music. These ancient practices, backed by modern neuroscience, help you build resilience and inner peace.",
    icon: "leaf" as const,
    color: "#5B7AE8",
  },
  {
    title: "Deep Growth",
    subtitle: "Philosophy · Psychology · Neuroscience · Spirituality",
    body: "Grow not just emotionally, but intellectually. Explore insights from philosophy, psychology, brain science, and spiritual traditions that expand your understanding of yourself.",
    icon: "book" as const,
    color: "#FFB347",
  },
  {
    title: "Customize Your Maumie",
    subtitle: "80+ Items to Express Yourself",
    body: "Dress up your companion with hats, glasses, clothes, wings, pets, and more. Earn Soul Coins through wellness activities and make your Maumie uniquely yours.",
    icon: "color-palette" as const,
    color: "#FF9A8B",
  },
];

export default function OnboardingScreen() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const topInset = Platform.OS === "web" ? 67 : insets.top;
  const bottomInset = Platform.OS === "web" ? 34 : insets.bottom;

  const slide = SLIDES[currentSlide];
  const isLast = currentSlide === SLIDES.length - 1;

  const handleNext = async () => {
    if (isLast) {
      await AsyncStorage.setItem("onboarding_completed", "true");
      router.replace("/(tabs)");
    } else {
      setCurrentSlide((prev) => prev + 1);
    }
  };

  const handleSkip = async () => {
    await AsyncStorage.setItem("onboarding_completed", "true");
    router.replace("/(tabs)");
  };

  return (
    <LinearGradient
      colors={["#5B7AE8", "#7B6BC5", "#9B7FD4"]}
      style={[styles.container, { paddingTop: topInset }]}
    >
      <View style={styles.topBar}>
        {currentSlide > 0 ? (
          <TouchableOpacity onPress={() => setCurrentSlide((p) => p - 1)} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
          </TouchableOpacity>
        ) : (
          <View style={{ width: 40 }} />
        )}
        <TouchableOpacity onPress={handleSkip}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <View style={[styles.iconCircle, { backgroundColor: slide.color + "25" }]}>
          <Ionicons name={slide.icon} size={64} color={slide.color} />
        </View>

        <Text style={styles.title}>{slide.title}</Text>
        <Text style={styles.subtitle}>{slide.subtitle}</Text>
        <Text style={styles.body}>{slide.body}</Text>
      </View>

      <View style={[styles.bottomArea, { paddingBottom: bottomInset + 24 }]}>
        <View style={styles.dots}>
          {SLIDES.map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                i === currentSlide && styles.dotActive,
              ]}
            />
          ))}
        </View>

        <TouchableOpacity style={styles.nextBtn} onPress={handleNext} activeOpacity={0.8}>
          <Text style={styles.nextBtnText}>
            {isLast ? "Get Started" : "Next"}
          </Text>
          <Ionicons
            name={isLast ? "checkmark-circle" : "arrow-forward"}
            size={20}
            color="#5B7AE8"
          />
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  skipText: {
    fontSize: 15,
    fontWeight: "600",
    color: "rgba(255,255,255,0.8)",
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 40,
  },
  iconCircle: {
    width: 130,
    height: 130,
    borderRadius: 65,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#FFFFFF",
    textAlign: "center",
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "rgba(255,255,255,0.75)",
    textAlign: "center",
    marginBottom: 20,
    letterSpacing: 0.3,
  },
  body: {
    fontSize: 15,
    lineHeight: 24,
    color: "rgba(255,255,255,0.9)",
    textAlign: "center",
  },
  bottomArea: {
    paddingHorizontal: 32,
    gap: 24,
  },
  dots: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(255,255,255,0.3)",
  },
  dotActive: {
    width: 24,
    backgroundColor: "#FFFFFF",
  },
  nextBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingVertical: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
  },
  nextBtnText: {
    fontSize: 17,
    fontWeight: "700",
    color: "#5B7AE8",
  },
});
