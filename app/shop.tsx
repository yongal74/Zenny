import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Platform,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Colors from "@/constants/colors";
import { getApiUrl } from "@/lib/api";

type Category = "all" | "hat" | "glasses" | "sunglasses" | "clothes" | "bag" | "badge" | "wings" | "pet";

const CATEGORIES: { key: Category; label: string; icon: string }[] = [
  { key: "all", label: "All", icon: "grid" },
  { key: "hat", label: "Hats", icon: "baseball" },
  { key: "glasses", label: "Glasses", icon: "glasses" },
  { key: "sunglasses", label: "Sunglasses", icon: "sunny" },
  { key: "clothes", label: "Clothes", icon: "shirt" },
  { key: "bag", label: "Bags", icon: "bag-handle" },
  { key: "badge", label: "Badges", icon: "ribbon" },
  { key: "wings", label: "Wings", icon: "sparkles" },
  { key: "pet", label: "Pets", icon: "paw" },
];

const RARITY_COLORS: Record<string, string> = {
  common: "#9B97B0",
  rare: "#6B9FE8",
  epic: "#A78BFA",
  legendary: "#FFB347",
};

export default function ShopScreen() {
  const colors = Colors.light;
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [activeCategory, setActiveCategory] = useState<Category>("all");
  const topInset = Platform.OS === "web" ? 67 : insets.top;

  const { data: shopItems = [] } = useQuery({
    queryKey: ["shopItems"],
    queryFn: async () => {
      const res = await fetch(getApiUrl("/api/shop"));
      if (!res.ok) return [];
      return res.json();
    },
  });

  const { data: ownedItems = [] } = useQuery({
    queryKey: ["ownedItems"],
    queryFn: async () => {
      const res = await fetch(getApiUrl("/api/shop/owned"));
      if (!res.ok) return [];
      return res.json();
    },
  });

  const { data: character } = useQuery({
    queryKey: ["character"],
    queryFn: async () => {
      const res = await fetch(getApiUrl("/api/character"));
      if (!res.ok) return null;
      return res.json();
    },
  });

  const purchase = useMutation({
    mutationFn: async (itemId: number) => {
      const res = await fetch(getApiUrl("/api/shop/purchase"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Purchase failed");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shopItems"] });
      queryClient.invalidateQueries({ queryKey: ["ownedItems"] });
      queryClient.invalidateQueries({ queryKey: ["character"] });
      Alert.alert("Purchased!", "Item added to your collection");
    },
    onError: (err: Error) => {
      Alert.alert("Oops", err.message);
    },
  });

  const ownedIds = new Set(ownedItems.map((i: any) => i.itemId));
  const filtered = activeCategory === "all" ? shopItems : shopItems.filter((i: any) => i.category === activeCategory);

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: topInset }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Soul Shop</Text>
        <View style={styles.coinBadge}>
          <Text style={{ fontSize: 16 }}>🪙</Text>
          <Text style={styles.coinText}>{character?.soulCoins || 0}</Text>
        </View>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryBar} contentContainerStyle={{ gap: 8, paddingHorizontal: 20 }}>
        {CATEGORIES.map((c) => (
          <TouchableOpacity key={c.key}
            style={[styles.categoryChip, activeCategory === c.key && styles.categoryActive]}
            onPress={() => setActiveCategory(c.key)}>
            <Ionicons name={c.icon as any} size={16} color={activeCategory === c.key ? colors.tint : colors.textSecondary} />
            <Text style={{ color: activeCategory === c.key ? colors.tint : colors.textSecondary, fontSize: 13, fontWeight: "600" }}>{c.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView contentContainerStyle={styles.itemGrid} showsVerticalScrollIndicator={false}>
        {filtered.map((item: any) => {
          const owned = ownedIds.has(item.id);
          const rarityColor = RARITY_COLORS[item.rarity] || RARITY_COLORS.common;
          return (
            <View key={item.id} style={[styles.itemCard, owned && { borderColor: colors.tint + "40" }]}>
              <View style={[styles.rarityDot, { backgroundColor: rarityColor }]} />
              <Text style={styles.itemEmoji}>{item.imageEmoji}</Text>
              <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
              <Text style={styles.itemDesc} numberOfLines={2}>{item.description}</Text>
              <View style={[styles.rarityLabel, { backgroundColor: rarityColor + "15" }]}>
                <Text style={[styles.rarityText, { color: rarityColor }]}>{item.rarity}</Text>
              </View>
              {owned ? (
                <View style={styles.ownedBadge}>
                  <Ionicons name="checkmark-circle" size={14} color={colors.tint} />
                  <Text style={{ color: colors.tint, fontSize: 12, fontWeight: "600" }}>Owned</Text>
                </View>
              ) : (
                <TouchableOpacity
                  style={styles.buyBtn}
                  onPress={() => purchase.mutate(item.id)}
                  disabled={purchase.isPending}>
                  <Text style={{ fontSize: 14 }}>🪙</Text>
                  <Text style={styles.buyBtnText}>{item.price}</Text>
                </TouchableOpacity>
              )}
            </View>
          );
        })}
        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: "row", alignItems: "center", paddingHorizontal: 20, paddingVertical: 12, gap: 12 },
  backBtn: { padding: 4 },
  title: { fontSize: 22, fontWeight: "800", color: "#2D2B3D", flex: 1, letterSpacing: -0.3 },
  coinBadge: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: "rgba(124,109,197,0.1)", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  coinText: { fontSize: 16, fontWeight: "700", color: "#7C6DC5" },
  categoryBar: { maxHeight: 48, marginBottom: 12 },
  categoryChip: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#EDE8F5" },
  categoryActive: { backgroundColor: "rgba(124,109,197,0.1)", borderColor: "#7C6DC5" },
  itemGrid: { flexDirection: "row", flexWrap: "wrap", paddingHorizontal: 16, gap: 12 },
  itemCard: { width: "47%", borderRadius: 16, backgroundColor: "#FFFFFF", padding: 14, alignItems: "center", gap: 6, flexGrow: 1, maxWidth: "48%", shadowColor: "#7C6DC5", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 1, borderWidth: 1, borderColor: "#EDE8F5" },
  rarityDot: { position: "absolute", top: 10, right: 10, width: 8, height: 8, borderRadius: 4 },
  itemEmoji: { fontSize: 36 },
  itemName: { fontSize: 14, fontWeight: "700", color: "#2D2B3D", textAlign: "center" },
  itemDesc: { fontSize: 11, textAlign: "center", lineHeight: 16, color: "#9B97B0" },
  rarityLabel: { paddingHorizontal: 10, paddingVertical: 2, borderRadius: 8 },
  rarityText: { fontSize: 10, fontWeight: "600", textTransform: "capitalize" },
  buyBtn: { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: "#7C6DC5", paddingHorizontal: 16, paddingVertical: 8, borderRadius: 12, marginTop: 4 },
  buyBtnText: { color: "#FFFFFF", fontSize: 14, fontWeight: "700" },
  ownedBadge: { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: "rgba(124,109,197,0.1)", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, marginTop: 4 },
});
