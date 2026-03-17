// ─────────────────────────────────────────
//  Welcome Screen — Enter Your Name
//  No Google, no Firebase, fully offline
// ─────────────────────────────────────────

import React, { useRef, useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  Animated, TextInput, KeyboardAvoidingView,
  Platform, ActivityIndicator,
} from 'react-native';
import { Colors, Typography, Spacing, Radii } from '../../theme';
import { useAuthStore } from '../../store/authStore';

const BEES = [
  { x: 0.08, y: 0.12, size: 28, delay: 0 },
  { x: 0.82, y: 0.08, size: 20, delay: 600 },
  { x: 0.68, y: 0.22, size: 24, delay: 300 },
  { x: 0.05, y: 0.52, size: 18, delay: 900 },
  { x: 0.88, y: 0.48, size: 22, delay: 450 },
];

import { Dimensions } from 'react-native';
const { width, height } = Dimensions.get('window');

function FloatingBee({ x, y, size, delay }: typeof BEES[0]) {
  const floatAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim  = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.delay(delay),
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
        Animated.loop(
          Animated.sequence([
            Animated.timing(floatAnim, { toValue: -10, duration: 2000, useNativeDriver: true }),
            Animated.timing(floatAnim, { toValue: 0,   duration: 2000, useNativeDriver: true }),
          ]),
        ),
      ]),
    ]).start();
  }, []);

  return (
    <Animated.Text style={{
      position:  'absolute',
      left:      x * width,
      top:       y * height,
      fontSize:  size,
      opacity:   fadeAnim,
      transform: [{ translateY: floatAnim }],
    }}>
      🐝
    </Animated.Text>
  );
}

export default function WelcomeScreen() {
  const { setName } = useAuthStore();
  const [name,    setNameInput] = useState('');
  const [loading, setLoading]   = useState(false);

  const logoAnim = useRef(new Animated.Value(0)).current;
  const formAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.stagger(200, [
      Animated.spring(logoAnim, { toValue: 1, useNativeDriver: true }),
      Animated.timing(formAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
    ]).start();
  }, []);

  const handleContinue = async () => {
    if (!name.trim()) return;
    setLoading(true);
    await setName(name.trim());
    setLoading(false);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {BEES.map((b, i) => <FloatingBee key={i} {...b} />)}

      <Animated.View style={[styles.logo, {
        opacity:   logoAnim,
        transform: [{ scale: logoAnim }],
      }]}>
        <View style={styles.logoHex}>
          <Text style={styles.logoEmoji}>🐝</Text>
        </View>
        <Text style={styles.logoTitle}>HiveMind</Text>
        <Text style={styles.logoTagline}>stay in sync, together</Text>
      </Animated.View>

      <Animated.View style={[styles.form, { opacity: formAnim }]}>
        <Text style={styles.formLabel}>what should we call you?</Text>
        <TextInput
          style={styles.input}
          placeholder="enter your name…"
          placeholderTextColor={Colors.text3}
          value={name}
          onChangeText={setNameInput}
          autoFocus
          returnKeyType="done"
          onSubmitEditing={handleContinue}
          maxLength={30}
        />

        <TouchableOpacity
          style={[styles.btn, (!name.trim() || loading) && styles.btnDisabled]}
          onPress={handleContinue}
          disabled={!name.trim() || loading}
          activeOpacity={0.85}
        >
          {loading
            ? <ActivityIndicator color={Colors.bg0} />
            : <Text style={styles.btnText}>enter the hive 🍯</Text>
          }
        </TouchableOpacity>

        <Text style={styles.note}>
          everything is saved on your phone · no account needed
        </Text>
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
  logo:        { alignItems: 'center', marginBottom: Spacing['2xl'] },
  logoHex: {
    width:           88, height: 88, borderRadius: 24,
    backgroundColor: Colors.bg1,
    borderWidth:     1, borderColor: Colors.border2,
    alignItems:      'center', justifyContent: 'center',
    marginBottom:    Spacing.lg,
    shadowColor:     Colors.accent,
    shadowOffset:    { width: 0, height: 0 },
    shadowOpacity:   0.3, shadowRadius: 24, elevation: 10,
  },
  logoEmoji:   { fontSize: 44 },
  logoTitle: {
    fontFamily: Typography.fonts.display,
    fontSize:   Typography.sizes['2xl'],
    color:      Colors.text1,
    letterSpacing: 1,
  },
  logoTagline: {
    fontFamily: Typography.fonts.body,
    fontSize:   Typography.sizes.sm,
    color:      Colors.text2,
    marginTop:  Spacing.xs,
  },
  form:      { width: '100%', alignItems: 'center' },
  formLabel: {
    fontFamily:   Typography.fonts.bodyMed,
    fontSize:     Typography.sizes.sm,
    color:        Colors.text2,
    marginBottom: Spacing.md,
    alignSelf:    'flex-start',
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
    shadowOffset:    { width: 0, height: 6 },
    shadowOpacity:   0.4, shadowRadius: 16, elevation: 8,
  },
  btnDisabled: { opacity: 0.5 },
  btnText: {
    fontFamily: Typography.fonts.display,
    fontSize:   Typography.sizes.base,
    color:      Colors.bg0,
  },
  note: {
    fontFamily: Typography.fonts.body,
    fontSize:   Typography.sizes.xs,
    color:      Colors.text3,
    marginTop:  Spacing.lg,
    textAlign:  'center',
  },
});
