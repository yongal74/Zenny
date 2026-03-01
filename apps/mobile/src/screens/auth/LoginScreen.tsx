import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  TextInput, KeyboardAvoidingView, Platform, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import { COLORS } from '../../constants/colors';
import { useCharacterStore } from '../../stores/characterStore';

const API_BASE = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000/api';

export function SplashScreen() {
  const navigation = useNavigation<any>();

  return (
    <View style={splash.container}>
      <LinearGradient colors={[COLORS.bg2, COLORS.bg]} style={splash.gradient}>
        {/* 글로우 링 */}
        <View style={splash.ringOuter} />
        <View style={splash.ringMid} />
        <Text style={splash.logo}>✿</Text>
        <Text style={splash.appName}>Zenny</Text>
        <Text style={splash.tagline}>Your Zen Companion</Text>
      </LinearGradient>
    </View>
  );
}

export function LoginScreen() {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation<any>();
  const { setLang } = useCharacterStore();

  const handleSubmit = async () => {
    if (!email || !password) return Alert.alert('입력 오류', '이메일과 비밀번호를 입력하세요');
    setLoading(true);
    try {
      const endpoint = mode === 'login' ? '/auth/login' : '/auth/register';
      const { data } = await axios.post(`${API_BASE}${endpoint}`, { email, password });

      // 토큰 저장 (추후 AsyncStorage 사용)
      if (data.lang) setLang(data.lang);

      if (mode === 'register') {
        navigation.replace('Onboarding');
      } else {
        navigation.replace('Main');
      }
    } catch (err: any) {
      Alert.alert('오류', err?.response?.data?.error ?? '다시 시도해주세요');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={login.safe} edges={['top', 'bottom']}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={login.container}>
        <LinearGradient colors={[COLORS.bg2, COLORS.bg]} style={login.header}>
          <Text style={login.logo}>✿</Text>
          <Text style={login.title}>Zenny</Text>
          <Text style={login.subtitle}>Your Zen Companion</Text>
        </LinearGradient>

        <View style={login.form}>
          {/* 탭 */}
          <View style={login.modeTabs}>
            {(['login', 'register'] as const).map((m) => (
              <TouchableOpacity key={m} style={[login.modeTab, mode === m && login.modeTabActive]} onPress={() => setMode(m)}>
                <Text style={[login.modeTabText, mode === m && login.modeTabTextActive]}>
                  {m === 'login' ? '로그인' : '회원가입'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* 이메일 */}
          <TextInput
            style={login.input}
            value={email}
            onChangeText={setEmail}
            placeholder="Email"
            placeholderTextColor={COLORS.text3}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          {/* 비밀번호 */}
          <TextInput
            style={login.input}
            value={password}
            onChangeText={setPassword}
            placeholder="Password"
            placeholderTextColor={COLORS.text3}
            secureTextEntry
          />

          {/* 제출 버튼 */}
          <TouchableOpacity style={login.submitBtn} onPress={handleSubmit} disabled={loading} activeOpacity={0.85}>
            <Text style={login.submitText}>
              {loading ? '...' : mode === 'login' ? '로그인 ✦' : '시작하기 ✦'}
            </Text>
          </TouchableOpacity>

          {/* 언어 선택 */}
          <View style={login.langRow}>
            <Text style={login.langLabel}>언어 /  Language: </Text>
            {(['ko', 'en'] as const).map((l) => (
              <TouchableOpacity key={l} style={login.langBtn} onPress={() => setLang(l)}>
                <Text style={login.langBtnText}>{l === 'ko' ? '한국어' : 'EN'}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ─── Styles ────────────────────────────────────────────────────
const splash = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  gradient: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 10 },
  ringOuter: { position: 'absolute', width: 200, height: 200, borderRadius: 100, backgroundColor: 'rgba(99,102,241,0.06)' },
  ringMid: { position: 'absolute', width: 130, height: 130, borderRadius: 65, backgroundColor: 'rgba(99,102,241,0.1)' },
  logo: { fontSize: 72, zIndex: 1 },
  appName: { fontSize: 42, fontFamily: 'Fraunces_500Medium', color: COLORS.text, zIndex: 1 },
  tagline: { fontSize: 15, color: COLORS.text2, fontFamily: 'DMSans_400Regular', zIndex: 1 },
});

const login = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  container: { flex: 1 },
  header: { flex: 0.4, justifyContent: 'center', alignItems: 'center', gap: 8, paddingBottom: 20 },
  logo: { fontSize: 48 },
  title: { fontSize: 32, fontFamily: 'Fraunces_500Medium', color: COLORS.text },
  subtitle: { fontSize: 14, color: COLORS.text2, fontFamily: 'DMSans_400Regular' },

  form: { flex: 0.6, padding: 28, gap: 14 },
  modeTabs: { flexDirection: 'row', backgroundColor: COLORS.surface, borderRadius: 14, padding: 4, marginBottom: 4 },
  modeTab: { flex: 1, height: 40, justifyContent: 'center', alignItems: 'center', borderRadius: 11 },
  modeTabActive: { backgroundColor: COLORS.primary },
  modeTabText: { fontSize: 14, color: COLORS.text3, fontFamily: 'DMSans_600SemiBold' },
  modeTabTextActive: { color: COLORS.text },

  input: {
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    height: 52,
    paddingHorizontal: 18,
    fontSize: 15,
    color: COLORS.text,
    fontFamily: 'DMSans_400Regular',
  },

  submitBtn: { backgroundColor: COLORS.primary, borderRadius: 16, height: 54, justifyContent: 'center', alignItems: 'center', marginTop: 4 },
  submitText: { fontSize: 16, fontFamily: 'DMSans_700Bold', color: COLORS.text },

  langRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 4 },
  langLabel: { fontSize: 12, color: COLORS.text3, fontFamily: 'DMSans_400Regular' },
  langBtn: { paddingHorizontal: 12, paddingVertical: 5, backgroundColor: COLORS.surface2, borderRadius: 10 },
  langBtnText: { fontSize: 12, color: COLORS.text2, fontFamily: 'DMSans_600SemiBold' },
});
