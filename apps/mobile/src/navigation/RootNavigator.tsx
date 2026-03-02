import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';
import { COLORS } from '../constants/colors';

// Screens
import { HomeScreen } from '../screens/home/HomeScreen';
import { AICoachScreen } from '../screens/ai-coach/AICoachScreen';
import { ShopScreen } from '../screens/shop/ShopScreen';
import { QuestScreen } from '../screens/quest/QuestScreen';
import { SplashScreen, LoginScreen, OnboardingScreen } from '../screens/auth/AuthScreens';

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

// createStackNavigator — web 호환 (react-native-screens 불필요)
const RootStack = createStackNavigator<RootStackParamList>();
const AuthStack = createStackNavigator<AuthStackParamList>();
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
  const isAuthenticated = false; // TODO: useAuthStore

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
