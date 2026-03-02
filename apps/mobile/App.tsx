import React, { useCallback, useEffect, useState } from 'react';
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
import { RootNavigator } from './src/navigation/RootNavigator';
import { COLORS } from './src/constants/colors';

// Web에서는 SplashScreen이 지원 안 될 수 있으므로 try/catch
if (Platform.OS !== 'web') {
  SplashScreen.preventAutoHideAsync().catch(() => { });
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 1000 * 60 * 5, retry: 2 },
  },
});

export default function App() {
  const [appReady, setAppReady] = useState(Platform.OS === 'web'); // web은 바로 ready
  const [fontsLoaded, fontError] = useFonts({
    DMSans_400Regular,
    DMSans_600SemiBold,
    DMSans_700Bold,
    Fraunces_500Medium,
  });

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded || fontError) {
      if (Platform.OS !== 'web') {
        await SplashScreen.hideAsync().catch(() => { });
      }
      setAppReady(true);
    }
  }, [fontsLoaded, fontError]);

  // web에서 폰트 로딩 완료 감지
  useEffect(() => {
    if (Platform.OS === 'web' && (fontsLoaded || fontError)) {
      setAppReady(true);
    }
  }, [fontsLoaded, fontError]);

  // web: 바로 렌더, native: 폰트 로딩 완료 후 렌더
  if (!appReady && Platform.OS !== 'web') return null;

  return (
    <QueryClientProvider client={queryClient}>
      <NavigationContainer>
        <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />
        <View
          style={{ flex: 1, backgroundColor: COLORS.bg }}
          onLayout={onLayoutRootView}
        >
          <RootNavigator />
        </View>
      </NavigationContainer>
    </QueryClientProvider>
  );
}
