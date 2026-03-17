// ─────────────────────────────────────────
//  Partner Name Screen
//  Just asks for your partner's name
//  Stored locally, no sync needed
// ─────────────────────────────────────────

import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  TextInput, Animated, KeyboardAvoidingView, Platform,
} from 'react-native';
import { Colors, Typography, Spacing, Radii } from '../../theme';
import { useAuthStore } from '../../store/authStore';

export default function PartnerLinkScreen() {
  const { setPartner, skipPartner, currentUser } = useAuthStore();
  const [partnerName, setPartnerName] = useState('');
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
  }, []);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <Animated.View style={[styles.inner, { opacity: fadeAnim }]}>

        <Text style={styles.emoji}>🐝🍯🐝</Text>
        <Text style={styles.title}>hey {currentUser?.name}!</Text>
        <Text style={styles.sub}>
          what&apos;s your partner&apos;s name?{'\n'}
          we&apos;ll use it to label shared items
        </Text>

        <TextInput
          style={styles.input}
          placeholder="partner's name…"
          placeholderTextColor={Colors.text3}
          value={partnerName}
          onChangeText={setPartnerName}
          autoFocus
          returnKeyType="done"
          onSubmitEditing={() => partnerName.trim() && setPartner(partnerName)}
          maxLength={30}
        />

        <TouchableOpacity
          style={[styles.btn, !partnerName.trim() && styles.btnDisabled]}
          onPress={() => setPartner(partnerName)}
          disabled={!partnerName.trim()}
          activeOpacity={0.85}
        >
          <Text style={styles.btnText}>let&apos;s go 🚀</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => skipPartner()} style={styles.skipBtn}>
          <Text style={styles.skipText}>skip for now</Text>
        </TouchableOpacity>

      </Animated.View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex:            1,
    backgroundColor: Colors.bg0,
    alignItems:      'center',
    justifyContent:  'center',
    paddingHorizontal: Spacing.xl,
  },
  inner:   { width: '100%', alignItems: 'center' },
  emoji:   { fontSize: 40, marginBottom: Spacing.lg },
  title: {
    fontFamily:   Typography.fonts.display,
    fontSize:     Typography.sizes.xl,
    color:        Colors.text1,
    marginBottom: Spacing.sm,
  },
  sub: {
    fontFamily:   Typography.fonts.body,
    fontSize:     Typography.sizes.sm,
    color:        Colors.text2,
    textAlign:    'center',
    lineHeight:   22,
    marginBottom: Spacing.xl,
  },
  input: {
    width:           '100%',
    backgroundColor: Colors.bg1,
    borderRadius:    Radii.lg,
    borderWidth:     1,
    borderColor:     Colors.border2,
    padding:         Spacing.lg,
    fontFamily:      Typography.fonts.displayMed,
    fontSize:        Typography.sizes.lg,
    color:           Colors.text1,
    marginBottom:    Spacing.lg,
    textAlign:       'center',
  },
  btn: {
    width:           '100%',
    backgroundColor: Colors.accent,
    borderRadius:    Radii.lg,
    paddingVertical: Spacing.lg,
    alignItems:      'center',
    shadowColor:     Colors.accent,
    shadowOffset:    { width: 0, height: 4 },
    shadowOpacity:   0.35, shadowRadius: 12, elevation: 6,
  },
  btnDisabled: { opacity: 0.5 },
  btnText: {
    fontFamily: Typography.fonts.display,
    fontSize:   Typography.sizes.base,
    color:      Colors.bg0,
  },
  skipBtn:  { marginTop: Spacing.lg },
  skipText: {
    fontFamily:         Typography.fonts.body,
    fontSize:           Typography.sizes.xs,
    color:              Colors.text3,
    textDecorationLine: 'underline',
  },
});
