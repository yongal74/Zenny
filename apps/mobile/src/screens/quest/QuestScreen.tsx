import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../../constants/colors';

export function QuestScreen() {
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Text style={styles.title}>✦ Daily Quests</Text>
      <Text style={styles.sub}>Complete quests to earn Zen Coins</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg, padding: 24 },
  title: { fontSize: 24, fontFamily: 'Fraunces_500Medium', color: COLORS.text, marginBottom: 4 },
  sub: { fontSize: 13, color: COLORS.text2, fontFamily: 'DMSans_400Regular' },
});
