import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS } from '../../constants/colors';
import { useNavigation } from '@react-navigation/native';
import { useCharacterStore } from '../../stores/characterStore';
import { Character } from '../../types';

export const LoginScreen = () => {
  const navigation = useNavigation();
  const setCharacter = useCharacterStore((s) => s.setCharacter);

  const handleStart = () => {
    // Initialize mock character
    const mockCharacter: Character = {
      userId: 'user_001',
      characterType: 'hana',
      level: 3,
      exp: 275,
      hunger: 80,
      mood: 85,
      equippedSkin: 'starlight',
      equippedItems: {},
      ownedItems: ['starlight'],
      bgTheme: 'starlight',
      lastFedAt: new Date().toISOString(),
    };
    setCharacter(mockCharacter);
    navigation.navigate('MainTabs' as never);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.logo}>✿</Text>
      <Text style={styles.title}>Welcome to Zenny</Text>
      <TouchableOpacity style={styles.button} onPress={handleStart}>
        <Text style={styles.buttonText}>Start Your Journey</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  logo: {
    fontSize: 80,
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 40,
  },
  button: {
    backgroundColor: COLORS.accent,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
  },
  buttonText: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '600',
  },
});
