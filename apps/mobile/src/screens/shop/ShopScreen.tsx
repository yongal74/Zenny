import React, { useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  ScrollView, Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { COLORS } from '../../constants/colors';
import { CustomizeModal } from '../../components/character/CustomizeModal';
import { useCharacterStore } from '../../stores/characterStore';
import { MeditationPlayerScreen } from '../meditation/MeditationPlayerScreen';
import type { MeditationTrack } from '../../types';

import { API_BASE } from '../../utils/api';

export function ShopScreen() {
  const [showCustomize, setShowCustomize] = useState(false);
  const [selectedTrack, setSelectedTrack] = useState<MeditationTrack | null>(null);
  const { lang } = useCharacterStore();

  // 추천 트랙
  const { data: recommended = [] } = useQuery({
    queryKey: ['recommended-tracks'],
    queryFn: async () => {
      const { data } = await axios.get(`${API_BASE}/meditation/recommend`, {
        params: { lang },
      });
      return data.tracks ?? [];
    },
  });

  // 전체 트랙
  const { data: allTracks = [] } = useQuery({
    queryKey: ['all-tracks', lang],
    queryFn: async () => {
      const { data } = await axios.get(`${API_BASE}/meditation/tracks`, {
        params: { lang },
      });
      return data ?? [];
    },
  });

  if (selectedTrack) {
    return (
      <MeditationPlayerScreen
        track={selectedTrack}
        onClose={() => setSelectedTrack(null)}
        lang={lang}
      />
    );
  }

  const title = lang === 'ko' ? '💎 Zen 상점' : '💎 Zen Shop';
  const meditTitle = lang === 'ko' ? '명상 트랙' : 'Meditation Tracks';
  const recommendedTitle = lang === 'ko' ? '✦ 추천' : '✦ Recommended';

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <ScrollView style={s.scroll} showsVerticalScrollIndicator={false}>
        {/* 헤더 */}
        <View style={s.header}>
          <Text style={s.title}>{title}</Text>
        </View>

        {/* 캐릭터 꾸미기 버튼 */}
        <TouchableOpacity style={s.customizeCard} onPress={() => setShowCustomize(true)} activeOpacity={0.85}>
          <View style={s.customizeLeft}>
            <Text style={s.customizeEmoji}>✿</Text>
            <View>
              <Text style={s.customizeTitle}>{lang === 'ko' ? '캐릭터 꾸미기' : 'Character Customize'}</Text>
              <Text style={s.customizeSub}>{lang === 'ko' ? '스킨 · 악세사리 · 오라' : 'Skins · Accessories · Aura'}</Text>
            </View>
          </View>
          <Text style={s.arrowText}>→</Text>
        </TouchableOpacity>

        {/* 명상 트랙 추천 */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>{recommendedTitle}</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.trackRow}>
            {recommended.slice(0, 5).map((track: MeditationTrack) => (
              <TrackCard key={track.id} track={track} lang={lang} onPress={() => setSelectedTrack(track)} />
            ))}
          </ScrollView>
        </View>

        {/* 전체 트랙 */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>{meditTitle}</Text>
          {allTracks.map((track: MeditationTrack) => (
            <TrackListItem key={track.id} track={track} lang={lang} onPress={() => setSelectedTrack(track)} />
          ))}
        </View>
      </ScrollView>

      {/* Customize Modal */}
      <CustomizeModal visible={showCustomize} onClose={() => setShowCustomize(false)} />
    </SafeAreaView>
  );
}

// ─── 트랙 카드 (가로 스크롤) ──────────────────────────────────
function TrackCard({ track, lang, onPress }: { track: MeditationTrack; lang: string; onPress: () => void }) {
  const TYPE_EMOJI: Record<string, string> = { breathing: '🌬️', bodyscan: '🧘', guided: '✿', nature: '🌿' };
  const dur = `${Math.floor(track.duration / 60)}:${String(track.duration % 60).padStart(2, '0')}`;
  return (
    <TouchableOpacity style={s.trackCard} onPress={onPress} activeOpacity={0.85}>
      <View style={s.trackCardIcon}><Text style={s.trackEmoji}>{TYPE_EMOJI[track.type] ?? '✿'}</Text></View>
      <Text style={s.trackCardTitle} numberOfLines={2}>
        {lang === 'ko' ? (track.titleKo || track.title) : track.title}
      </Text>
      <Text style={s.trackCardDur}>{dur}</Text>
    </TouchableOpacity>
  );
}

// ─── 트랙 리스트 아이템 ────────────────────────────────────────
function TrackListItem({ track, lang, onPress }: { track: MeditationTrack; lang: string; onPress: () => void }) {
  const TYPE_EMOJI: Record<string, string> = { breathing: '🌬️', bodyscan: '🧘', guided: '✿', nature: '🌿' };
  const dur = `${Math.floor(track.duration / 60)} min`;
  return (
    <TouchableOpacity style={s.trackListItem} onPress={onPress} activeOpacity={0.8}>
      <View style={s.trackListIcon}><Text style={{ fontSize: 22 }}>{TYPE_EMOJI[track.type] ?? '✿'}</Text></View>
      <View style={{ flex: 1 }}>
        <Text style={s.trackListTitle} numberOfLines={1}>
          {lang === 'ko' ? (track.titleKo || track.title) : track.title}
        </Text>
        <Text style={s.trackListType}>{track.type}</Text>
      </View>
      <Text style={s.trackListDur}>{dur}</Text>
    </TouchableOpacity>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  scroll: { flex: 1 },
  header: { padding: 24, paddingBottom: 12 },
  title: { fontSize: 24, fontFamily: 'Fraunces_500Medium', color: COLORS.text },

  customizeCard: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    marginHorizontal: 20, marginBottom: 24, backgroundColor: COLORS.surface,
    borderRadius: 18, padding: 18, borderWidth: 1.5, borderColor: COLORS.primary,
  },
  customizeLeft: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  customizeEmoji: { fontSize: 32 },
  customizeTitle: { fontSize: 16, fontFamily: 'DMSans_700Bold', color: COLORS.text, marginBottom: 2 },
  customizeSub: { fontSize: 12, color: COLORS.text2, fontFamily: 'DMSans_400Regular' },
  arrowText: { fontSize: 18, color: COLORS.accent },

  section: { paddingHorizontal: 20, marginBottom: 20 },
  sectionTitle: { fontSize: 16, fontFamily: 'DMSans_700Bold', color: COLORS.text, marginBottom: 12 },

  trackRow: { gap: 12, paddingRight: 8 },
  trackCard: {
    width: 140, backgroundColor: COLORS.surface, borderRadius: 16, padding: 14, gap: 8,
  },
  trackCardIcon: { width: 44, height: 44, borderRadius: 22, backgroundColor: COLORS.bg, justifyContent: 'center', alignItems: 'center' },
  trackEmoji: { fontSize: 22 },
  trackCardTitle: { fontSize: 13, fontFamily: 'DMSans_600SemiBold', color: COLORS.text, lineHeight: 18 },
  trackCardDur: { fontSize: 11, color: COLORS.text3, fontFamily: 'DMSans_400Regular' },

  trackListItem: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: COLORS.surface, borderRadius: 12, padding: 14, marginBottom: 8,
  },
  trackListIcon: { width: 44, height: 44, borderRadius: 22, backgroundColor: COLORS.bg, justifyContent: 'center', alignItems: 'center' },
  trackListTitle: { fontSize: 14, fontFamily: 'DMSans_600SemiBold', color: COLORS.text },
  trackListType: { fontSize: 11, color: COLORS.text3, fontFamily: 'DMSans_400Regular', marginTop: 2 },
  trackListDur: { fontSize: 12, color: COLORS.text2, fontFamily: 'DMSans_400Regular' },
});
