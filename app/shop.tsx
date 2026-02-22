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

type Category = "all" | "skin" | "accessory" | "background" | "species";

const CATEGORIES: { key: Category; label: string; icon: string }[] = [
  { key: "all", label: "All", icon: "grid" },
  { key: "skin", label: "Skins", icon: "color-palette" },
  { key: "accessory", label: "Accessories", icon: "glasses" },
  { key: "background", label: "Backgrounds", icon: "image" },
  { key: "species", label: "Species", icon: "paw" },
];

const RARITY_COLORS: Record<string, string> = {
  common: "#8A9FC0",
  rare: "#6B9FE8",
  epic: "#C39BFF",
  legendary: "#FFD93D",
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
      Alert.alert("Purchased!", "Item added to your collection ✨");
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
        <Text style={[styles.title, { color: colors.text }]}>Soul Shop</Text>
        <View style={[styles.coinBadge, { backgroundColor: colors.tint + "20" }]}>
          <Text style={{ fontSize: 16 }}>🪙</Text>
          <Text style={[styles.coinText, { color: colors.tint }]}>{character?.soulCoins || 0}</Text>
        </View>
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

      <ScrollView contentContainerStyle={styles.itemGrid} showsVerticalScrollIndicator={false}>
        {filtered.map((item: any) => {
          const owned = ownedIds.has(item.id);
          const rarityColor = RARITY_COLORS[item.rarity] || RARITY_COLORS.common;
          return (
            <View key={item.id} style={[styles.itemCard, { backgroundColor: colors.surface, borderColor: owned ? colors.tint + "50" : colors.border }]}>
              <View style={[styles.rarityDot, { backgroundColor: rarityColor }]} />
              <Text style={styles.itemEmoji}>{item.imageEmoji}</Text>
              <Text style={[styles.itemName, { color: colors.text }]} numberOfLines={1}>{item.name}</Text>
              <Text style={[styles.itemDesc, { color: colors.textSecondary }]} numberOfLines={2}>{item.description}</Text>
              <View style={[styles.rarityLabel, { backgroundColor: rarityColor + "20" }]}>
                <Text style={[styles.rarityText, { color: rarityColor }]}>{item.rarity}</Text>
              </View>
              {owned ? (
                <View style={[styles.ownedBadge, { backgroundColor: colors.tint + "20" }]}>
                  <Ionicons name="checkmark-circle" size={14} color={colors.tint} />
                  <Text style={{ color: colors.tint, fontSize: 12, fontWeight: "600" }}>Owned</Text>
                </View>
              ) : (
                <TouchableOpacity
                  style={[styles.buyBtn, { backgroundColor: colors.tint }]}
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
  title: { fontSize: 22, fontWeight: "700", flex: 1 },
  coinBadge: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  coinText: { fontSize: 16, fontWeight: "700" },
  categoryBar: { maxHeight: 48, marginBottom: 12 },
  categoryChip: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1 },
  itemGrid: { flexDirection: "row", flexWrap: "wrap", paddingHorizontal: 16, gap: 12 },
  itemCard: { width: "47%", borderRadius: 16, borderWidth: 1, padding: 14, alignItems: "center", gap: 6, flexGrow: 1, maxWidth: "48%" },
  rarityDot: { position: "absolute", top: 10, right: 10, width: 8, height: 8, borderRadius: 4 },
  itemEmoji: { fontSize: 36 },
  itemName: { fontSize: 14, fontWeight: "700", textAlign: "center" },
  itemDesc: { fontSize: 11, textAlign: "center", lineHeight: 16 },
  rarityLabel: { paddingHorizontal: 10, paddingVertical: 2, borderRadius: 8 },
  rarityText: { fontSize: 10, fontWeight: "600", textTransform: "capitalize" },
  buyBtn: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 12, marginTop: 4 },
  buyBtnText: { color: "#1B2A4A", fontSize: 14, fontWeight: "700" },
  ownedBadge: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, marginTop: 4 },
});
