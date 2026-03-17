// ─────────────────────────────────────────
//  AuthGate — Routes based on local auth state
// ─────────────────────────────────────────

import React, { useEffect, useRef, useState } from 'react';
import { View, ActivityIndicator, StyleSheet, Animated, Text } from 'react-native';
import { useAuthStore } from '../store/authStore';
import WelcomeScreen     from '../screens/auth/WelcomeScreen';
import PartnerLinkScreen from '../screens/auth/PartnerLinkScreen';
import { Colors } from '../theme';

function LoadingScreen() {
  return (
    <View style={styles.loading}>
      <Text style={styles.emoji}>🐝</Text>
      <ActivityIndicator color={Colors.accent} style={{ marginTop: 16 }} />
    </View>
  );
}

export function AuthGate({ children }: { children: React.ReactNode }) {
  const { status, initialize } = useAuthStore();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    initialize().then(() => setReady(true));
  }, []);

  if (!ready || status === 'loading') return <LoadingScreen />;
  if (status === 'unauthenticated')   return <WelcomeScreen />;
  if (status === 'needs-partner')     return <PartnerLinkScreen />;

  return <>{children}</>;
}

const styles = StyleSheet.create({
  loading: {
    flex:            1,
    backgroundColor: Colors.bg0,
    alignItems:      'center',
    justifyContent:  'center',
  },
  emoji: { fontSize: 52 },
});
