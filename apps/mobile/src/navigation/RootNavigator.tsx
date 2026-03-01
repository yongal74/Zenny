import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, View } from 'react-native';
import { COLORS } from '../constants/colors';

// Screens
import { HomeScreen } from '../screens/home/HomeScreen';
import { AICoachScreen } from '../screens/ai-coach/AICoachScreen';
import { ShopScreen } from '../screens/shop/ShopScreen';
import { QuestScreen } from '../screens/quest/QuestScreen';
import { SplashScreen } from '../screens/auth/SplashScreen';
import { LoginScreen } from '../screens/auth/LoginScreen';
import { OnboardingScreen } from '../screens/auth/OnboardingScreen';

// Types
export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
};
export type AuthStackParamList = {
  Splash: undefined;
  Login: undefined;
  Onboarding: undefined;
};
export type MainTabParamList = {
  Home: undefined;
  Quest: undefined;
  AICoach: undefined;
  Shop: undefined;
};

const RootStack = createNativeStackNavigator<RootStackParamList>();
const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const MainTab = createBottomTabNavigator<MainTabParamList>();

// ─── Tab Icon ─────────────────────────────────────────────────
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
        tabBarLabelStyle: {
          fontSize: 11,
          fontFamily: 'DMSans_400Regular',
          marginTop: -2,
        },
      }}
    >
      <MainTab.Screen
        name="Home"
        component={HomeScreen}
        options={{ tabBarLabel: 'Home', tabBarIcon: ({ focused }) => <TabIcon label="🏠" focused={focused} /> }}
      />
      <MainTab.Screen
        name="Quest"
        component={QuestScreen}
        options={{ tabBarLabel: 'Quest', tabBarIcon: ({ focused }) => <TabIcon label="✦" focused={focused} /> }}
      />
      <MainTab.Screen
        name="AICoach"
        component={AICoachScreen}
        options={{ tabBarLabel: 'Zen AI', tabBarIcon: ({ focused }) => <TabIcon label="✿" focused={focused} /> }}
      />
      <MainTab.Screen
        name="Shop"
        component={ShopScreen}
        options={{ tabBarLabel: 'Shop', tabBarIcon: ({ focused }) => <TabIcon label="💎" focused={focused} /> }}
      />
    </MainTab.Navigator>
  );
}

// ─── Auth Stack ───────────────────────────────────────────────
function AuthNavigator() {
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      <AuthStack.Screen name="Splash" component={SplashScreen} />
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="Onboarding" component={OnboardingScreen} />
    </AuthStack.Navigator>
  );
}

// ─── Root ─────────────────────────────────────────────────────
export function RootNavigator() {
  // TODO: useAuthStore로 로그인 상태 확인
  const isAuthenticated = false;

  return (
    <RootStack.Navigator screenOptions={{ headerShown: false }}>
      {isAuthenticated ? (
        <RootStack.Screen name="Main" component={MainTabs} />
      ) : (
        <RootStack.Screen name="Auth" component={AuthNavigator} />
      )}
    </RootStack.Navigator>
  );
}
