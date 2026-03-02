import React, { useState, useEffect } from 'react';
import { View, StatusBar, Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  useFonts,
  DMSans_400Regular,
  DMSans_600SemiBold,
  DMSans_700Bold,
} from '@expo-google-fonts/dm-sans';
import { Fraunces_500Medium } from '@expo-google-fonts/fraunces';
import * as SplashScreen from 'expo-splash-screen';
import { registerRootComponent } from 'expo';
import { RootNavigator } from './src/navigation/RootNavigator';
import { COLORS } from './src/constants/colors';

// Native 전용으로 SplashScreen 적용
if (Platform.OS !== 'web') {
  SplashScreen.preventAutoHideAsync().catch(() => { });
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 1000 * 60 * 5, retry: 2 },
  },
});

function App() {
  const isWeb = Platform.OS === 'web';

  const [fontsLoaded, fontError] = useFonts({
    DMSans_400Regular,
    DMSans_600SemiBold,
    DMSans_700Bold,
    Fraunces_500Medium,
  });

  useEffect(() => {
    if (!isWeb && (fontsLoaded || fontError)) {
      SplashScreen.hideAsync().catch(() => { });
    }
  }, [fontsLoaded, fontError, isWeb]);

  // Web: 즉시 렌더 / Native: 폰트 로딩 후 렌더
  if (!isWeb && !fontsLoaded && !fontError) return null;

  return (
    <QueryClientProvider client={queryClient}>
      <NavigationContainer>
        <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />
        <View style={{ flex: 1, backgroundColor: COLORS.bg }}>
          <RootNavigator />
        </View>
      </NavigationContainer>
    </QueryClientProvider>
  );
}

// Web DOM 마운트를 위해 필수
export default registerRootComponent(App);
