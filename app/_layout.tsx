// ─────────────────────────────────────────
//  Root Layout — Expo Router
// ─────────────────────────────────────────

import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFonts, Syne_600SemiBold, Syne_700Bold } from '@expo-google-fonts/syne';
import {
  Nunito_400Regular, Nunito_600SemiBold, Nunito_700Bold,
} from '@expo-google-fonts/nunito';
import * as SplashScreen from 'expo-splash-screen';
import { Colors } from '../src/theme';
import { AuthGate } from '../src/components/AuthGate';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Syne_700Bold,
    Syne_600SemiBold,
    Nunito_400Regular,
    Nunito_600SemiBold,
    Nunito_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded) SplashScreen.hideAsync();
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <AuthGate>
      <StatusBar style="light" backgroundColor={Colors.bg0} />
      <Stack
        screenOptions={{
          headerShown:  false,
          contentStyle: { backgroundColor: Colors.bg0 },
          animation:    'slide_from_right',
        }}
      >
        <Stack.Screen name="(tabs)"        options={{ headerShown: false }} />
        <Stack.Screen name="streak/[id]" />
        <Stack.Screen name="streak/new"  />
        <Stack.Screen name="reminder/new" />
      </Stack>
    </AuthGate>
  );
}
