import React, { useState, useEffect } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../constants/colors';

// Screens — 실제 구현 파일 사용
import { HomeScreen } from '../screens/home/HomeScreen';
import { AICoachScreen } from '../screens/ai-coach/AICoachScreen';
import { ShopScreen } from '../screens/shop/ShopScreen';
import { QuestScreen } from '../screens/quest/QuestScreen';
import { LoginScreen } from '../screens/auth/LoginScreen';
import { OnboardingScreen } from '../screens/auth/OnboardingScreen';

// Types
export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
};
export type AuthStackParamList = {
  Login: undefined;
  Onboarding: undefined;
};
export type MainTabParamList = {
  Home: undefined;
  Quest: undefined;
  AICoach: undefined;
  Shop: undefined;
};

// Navigators — createStackNavigator (web 호환, react-native-screens 불필요)
const RootStack = createStackNavigator<RootStackParamList>();
const AuthStack = createStackNavigator<AuthStackParamList>();
const MainTab = createBottomTabNavigator<MainTabParamList>();

// ─── Splash View (navigator 밖에서 state로 관리) ─────────────
function SplashView() {
  return (
    <View style={styles.splash}>
      <Text style={styles.logo}>✿</Text>
      <Text style={styles.appName}>Zenny</Text>
      <Text style={styles.tagline}>Your Zen Companion</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  splash: { flex: 1, backgroundColor: COLORS.bg, justifyContent: 'center', alignItems: 'center' },
  logo: { fontSize: 64, color: '#C4B5FD', marginBottom: 12 },
  appName: { fontSize: 36, color: COLORS.text, fontWeight: '700', marginBottom: 4 },
  tagline: { fontSize: 14, color: COLORS.text2 },
});

const TabIcon = ({ label, focused }: { label: string; focused: boolean }) => (
  <Text style={{ fontSize: 20, opacity: focused ? 1 : 0.4 }}>{label}</Text>
);

// ─── Main Tabs ────────────────────────────────────────────────
function MainTabs() {
  return (
    <MainTab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: COLORS.surface,
          borderTopColor: COLORS.border,
          borderTopWidth: 1,
          height: 64,
          paddingBottom: 8,
        },
        tabBarActiveTintColor: COLORS.accent,
        tabBarInactiveTintColor: COLORS.text3,
        tabBarLabelStyle: { fontSize: 11, marginTop: -2 },
      }}
    >
      <MainTab.Screen name="Home" component={HomeScreen}
        options={{ tabBarLabel: 'Home', tabBarIcon: ({ focused }) => <TabIcon label="🏠" focused={focused} /> }} />
      <MainTab.Screen name="Quest" component={QuestScreen}
        options={{ tabBarLabel: 'Quest', tabBarIcon: ({ focused }) => <TabIcon label="✦" focused={focused} /> }} />
      <MainTab.Screen name="AICoach" component={AICoachScreen}
        options={{ tabBarLabel: 'Zen AI', tabBarIcon: ({ focused }) => <TabIcon label="✿" focused={focused} /> }} />
      <MainTab.Screen name="Shop" component={ShopScreen}
        options={{ tabBarLabel: 'Shop', tabBarIcon: ({ focused }) => <TabIcon label="💎" focused={focused} /> }} />
    </MainTab.Navigator>
  );
}

// ─── Auth Stack (Login → Onboarding) ─────────────────────────
function AuthNavigator() {
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="Onboarding" component={OnboardingScreen} />
    </AuthStack.Navigator>
  );
}

// ─── Root — Splash는 state로, Auth/Main은 Stack으로 ─────────
export function RootNavigator() {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setShowSplash(false), 1000);
    return () => clearTimeout(t);
  }, []);

  if (showSplash) return <SplashView />;

  // Auth → Login → navigation.replace('Main') 가능하도록
  // Main이 Root Stack에 존재해야 함
  return (
    <RootStack.Navigator screenOptions={{ headerShown: false }} initialRouteName="Auth">
      <RootStack.Screen name="Auth" component={AuthNavigator} />
      <RootStack.Screen name="Main" component={MainTabs} />
    </RootStack.Navigator>
  );
}
