import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../../constants/colors';

interface CharacterDisplayProps {
  characterType: 'hana' | 'sora' | 'tora' | 'mizu' | 'kaze';
  level: number;
  bgTheme: string;
}

const CHARACTER_EMOJIS: Record<string, string> = {
  hana: '✿', sora: '☁', tora: '🦊', mizu: '💧', kaze: '🍃',
};

const LEVEL_NAMES: Record<number, { en: string; ko: string }> = {
  1: { en: 'Seed', ko: '씨앗' },
  2: { en: 'Sprout', ko: '새싹' },
  3: { en: 'Blossom', ko: '꽃봉오리' },
  4: { en: 'Awakened', ko: '각성' },
  5: { en: 'Meditator', ko: '명상자' },
  6: { en: 'Practitioner', ko: '수련자' },
  7: { en: 'Sage', ko: '현자' },
};

export function CharacterDisplay({ characterType, level, bgTheme }: CharacterDisplayProps) {
  const emoji = CHARACTER_EMOJIS[characterType] ?? '✿';
  const levelName = LEVEL_NAMES[level] ?? LEVEL_NAMES[1];

  return (
    <View style={styles.wrapper}>
      {/* 글로우 링 레이어 */}
      <View style={styles.ringOuter} />
      <View style={styles.ringMid} />
      <View style={styles.ringInner} />

      {/* 캐릭터 이모지 (실제 구현에선 PNG 레이어) */}
      <Text style={styles.characterEmoji}>{emoji}</Text>

      {/* 캐릭터 이름 */}
      <Text style={styles.characterName}>
        {characterType.charAt(0).toUpperCase() + characterType.slice(1)}
      </Text>

      {/* 레벨 배지 */}
      <View style={styles.levelBadge}>
        <Text style={styles.levelText}>
          Lv.{level} {levelName.en}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },

  // 글로우 링 (절대 위치 겹쳐서 레이어 효과)
  ringOuter: {
    position: 'absolute',
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: COLORS.charGlow1,
  },
  ringMid: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.charGlow2,
  },
  ringInner: {
    position: 'absolute',
    width: 74,
    height: 74,
    borderRadius: 37,
    backgroundColor: COLORS.charGlow3,
  },

  characterEmoji: {
    fontSize: 48,
    zIndex: 1,
    marginBottom: 2,
  },
  characterName: {
    fontSize: 18,
    fontFamily: 'Fraunces_500Medium',
    color: COLORS.text,
    fontWeight: '500',
    zIndex: 1,
  },
  levelBadge: {
    backgroundColor: 'rgba(236,72,153,0.18)',
    paddingHorizontal: 14,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(236,72,153,0.25)',
    zIndex: 1,
  },
  levelText: {
    fontSize: 12,
    fontFamily: 'DMSans_600SemiBold',
    fontWeight: '600',
    color: COLORS.accent,
  },
});
