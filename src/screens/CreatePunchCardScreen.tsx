// ─────────────────────────────────────────
//  Create Punch Card Screen
// ─────────────────────────────────────────

import React, { useState } from 'react';
import {
  View, Text, TextInput, ScrollView, StyleSheet,
  TouchableOpacity, Switch, Alert,
} from 'react-native';
import { router } from 'expo-router';
import { usePunchCardStore } from '../store/punchCardStore';
import { useAuthStore } from '../store/authStore';
import { Colors, Typography, Spacing, Radii } from '../theme';
import { PunchCardWhoCanPunch } from '../types';

// IDs resolved from auth store inside the component

const EMOJI_OPTIONS = ['🍳','🏃','🧘','🎬','📚','🐝','💪','🌿','🎵','🧹','💆','🌅','🎮','✈️','🍷'];
const COUNT_OPTIONS = [5, 7, 10, 14, 20, 30];

type WhoOption = { value: PunchCardWhoCanPunch; label: string; sub: string };
const WHO_OPTIONS: WhoOption[] = [
  { value: 'both',    label: '👥 Both of us',   sub: 'either partner can punch' },
  { value: 'mine',    label: '🙋 Just me',       sub: 'only I can punch' },
  { value: 'partner', label: '💌 Partner only',  sub: 'only partner can punch' },
];

export default function CreatePunchCardScreen() {
  const { createCard } = usePunchCardStore();
  const currentUser     = useAuthStore(s => s.currentUser);
  const partner         = useAuthStore(s => s.partner);
  const CURRENT_USER_ID = currentUser?.id ?? '';
  const PARTNER_USER_ID = partner?.id ?? '';

  const [title,        setTitle]        = useState('');
  const [emoji,        setEmoji]        = useState('🍳');
  const [reward,       setReward]       = useState('');
  const [rewardEmoji,  setRewardEmoji]  = useState('🍽️');
  const [targetCount,  setTargetCount]  = useState(10);
  const [whoCanPunch,  setWhoCanPunch]  = useState<PunchCardWhoCanPunch>('both');
  const [isShared,     setIsShared]     = useState(true);
  const [notifyPunch,  setNotifyPunch]  = useState(true);
  const [saving,       setSaving]       = useState(false);

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert('Missing title', 'Give your punch card a name!');
      return;
    }
    if (!reward.trim()) {
      Alert.alert('Missing reward', 'What do you win when complete?');
      return;
    }

    setSaving(true);
    try {
      await createCard({
        title:         title.trim(),
        emoji,
        reward:        reward.trim(),
        rewardEmoji,
        targetCount,
        whoCanPunch,
        isShared,
        sharedWith:    isShared ? PARTNER_USER_ID : undefined,
        notifyOnPunch: notifyPunch,
      }, CURRENT_USER_ID);

      router.back();
    } catch (err) {
      Alert.alert('Error', 'Could not save. Try again!');
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backArrow}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>new punch card 🎫</Text>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>

        {/* Title */}
        <Text style={styles.label}>what&apos;s the challenge?</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. cook together at home"
          placeholderTextColor={Colors.text3}
          value={title}
          onChangeText={setTitle}
        />

        {/* Emoji picker */}
        <Text style={styles.label}>pick an emoji</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.emojiScroll}>
          {EMOJI_OPTIONS.map(e => (
            <TouchableOpacity
              key={e}
              onPress={() => setEmoji(e)}
              style={[styles.emojiBtn, emoji === e && styles.emojiBtnActive]}
            >
              <Text style={styles.emojiText}>{e}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Target count */}
        <Text style={styles.label}>punches to complete</Text>
        <View style={styles.countRow}>
          {COUNT_OPTIONS.map(n => (
            <TouchableOpacity
              key={n}
              onPress={() => setTargetCount(n)}
              style={[styles.countChip, targetCount === n && styles.countChipActive]}
            >
              <Text style={[styles.countChipText, targetCount === n && styles.countChipTextActive]}>
                {n}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Reward */}
        <Text style={styles.label}>reward when complete 🏆</Text>
        <View style={styles.rewardRow}>
          <TouchableOpacity
            style={styles.rewardEmojiBtn}
            onPress={() => {/* open emoji picker */}}
          >
            <Text style={{ fontSize: 20 }}>{rewardEmoji}</Text>
          </TouchableOpacity>
          <TextInput
            style={[styles.input, { flex: 1, marginBottom: 0 }]}
            placeholder="e.g. go out for a fancy dinner"
            placeholderTextColor={Colors.text3}
            value={reward}
            onChangeText={setReward}
          />
        </View>

        {/* Who can punch */}
        <Text style={styles.label}>who can punch this card</Text>
        {WHO_OPTIONS.map(opt => (
          <TouchableOpacity
            key={opt.value}
            onPress={() => setWhoCanPunch(opt.value)}
            style={[styles.whoRow, whoCanPunch === opt.value && styles.whoRowActive]}
          >
            <View style={styles.whoLeft}>
              <Text style={styles.whoLabel}>{opt.label}</Text>
              <Text style={styles.whoSub}>{opt.sub}</Text>
            </View>
            <View style={[styles.radio, whoCanPunch === opt.value && styles.radioActive]}>
              {whoCanPunch === opt.value && <View style={styles.radioDot} />}
            </View>
          </TouchableOpacity>
        ))}

        {/* Toggles */}
        <View style={styles.toggleCard}>
          <View style={styles.toggleRow}>
            <View style={styles.toggleLeft}>
              <Text style={styles.toggleLabel}>🐝 share with Jamie</Text>
              <Text style={styles.toggleSub}>Jamie can punch & track progress</Text>
            </View>
            <Switch
              value={isShared}
              onValueChange={setIsShared}
              thumbColor={Colors.bg0}
              trackColor={{ false: Colors.bg3, true: Colors.accent }}
            />
          </View>
          <View style={[styles.toggleRow, { borderBottomWidth: 0 }]}>
            <View style={styles.toggleLeft}>
              <Text style={styles.toggleLabel}>🔔 buzz on each punch</Text>
              <Text style={styles.toggleSub}>notify partner when punched</Text>
            </View>
            <Switch
              value={notifyPunch}
              onValueChange={setNotifyPunch}
              thumbColor={Colors.bg0}
              trackColor={{ false: Colors.bg3, true: Colors.accent }}
            />
          </View>
        </View>

        {/* Save */}
        <TouchableOpacity
          style={[styles.saveBtn, saving && { opacity: 0.6 }]}
          onPress={handleSave}
          disabled={saving}
        >
          <Text style={styles.saveBtnText}>
            {saving ? 'saving…' : 'create punch card 🎫'}
          </Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg0 },
  header: {
    flexDirection:   'row',
    alignItems:      'center',
    gap:             Spacing.md,
    padding:         Spacing.lg,
    paddingTop:      Spacing.xl,
    backgroundColor: Colors.bg1,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.border,
  },
  backBtn: { padding: 4 },
  backArrow: {
    fontFamily: Typography.fonts.display,
    fontSize:   28,
    color:      Colors.text2,
    lineHeight: 28,
  },
  headerTitle: {
    fontFamily: Typography.fonts.display,
    fontSize:   Typography.sizes.md,
    color:      Colors.text1,
  },

  scroll:        { flex: 1 },
  scrollContent: { padding: Spacing.lg },

  label: {
    fontFamily:   Typography.fonts.bodyMed,
    fontSize:     Typography.sizes.xs,
    color:        Colors.text3,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom:  Spacing.sm,
    marginTop:     Spacing.lg,
  },

  input: {
    backgroundColor: Colors.bg2,
    borderRadius:    Radii.md,
    borderWidth:     0.5,
    borderColor:     Colors.border2,
    padding:         Spacing.md,
    fontFamily:      Typography.fonts.body,
    fontSize:        Typography.sizes.sm,
    color:           Colors.text1,
    marginBottom:    Spacing.sm,
  },

  emojiScroll: { marginHorizontal: -Spacing.lg, paddingHorizontal: Spacing.lg },
  emojiBtn: {
    padding:      Spacing.sm,
    borderRadius: Radii.sm,
    marginRight:  Spacing.xs,
  },
  emojiBtnActive: {
    backgroundColor: Colors.accentAlpha(0.15),
    borderWidth:     1,
    borderColor:     Colors.border2,
  },
  emojiText: { fontSize: 22 },

  countRow: { flexDirection: 'row', gap: Spacing.sm, flexWrap: 'wrap' },
  countChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical:   Spacing.xs,
    borderRadius:      Radii.sm,
    backgroundColor:   Colors.bg2,
    borderWidth:       0.5,
    borderColor:       Colors.border,
  },
  countChipActive: {
    backgroundColor: Colors.accent,
    borderColor:     Colors.accent,
  },
  countChipText: {
    fontFamily: Typography.fonts.bodyMed,
    fontSize:   Typography.sizes.sm,
    color:      Colors.text2,
  },
  countChipTextActive: { color: Colors.bg0 },

  rewardRow: { flexDirection: 'row', gap: Spacing.sm, alignItems: 'center' },
  rewardEmojiBtn: {
    width:           48,
    height:          48,
    borderRadius:    Radii.md,
    backgroundColor: Colors.bg2,
    borderWidth:     0.5,
    borderColor:     Colors.border2,
    alignItems:      'center',
    justifyContent:  'center',
  },

  whoRow: {
    flexDirection:  'row',
    alignItems:     'center',
    backgroundColor: Colors.bg1,
    borderRadius:   Radii.md,
    padding:        Spacing.md,
    marginBottom:   Spacing.sm,
    borderWidth:    0.5,
    borderColor:    Colors.border,
  },
  whoRowActive: { borderColor: Colors.accent },
  whoLeft:  { flex: 1 },
  whoLabel: {
    fontFamily: Typography.fonts.bodyMed,
    fontSize:   Typography.sizes.sm,
    color:      Colors.text1,
  },
  whoSub: {
    fontFamily: Typography.fonts.body,
    fontSize:   Typography.sizes.xs,
    color:      Colors.text2,
    marginTop:  2,
  },
  radio: {
    width:           18,
    height:          18,
    borderRadius:    9,
    borderWidth:     1.5,
    borderColor:     Colors.border2,
    alignItems:      'center',
    justifyContent:  'center',
  },
  radioActive:  { borderColor: Colors.accent },
  radioDot: {
    width:           8,
    height:          8,
    borderRadius:    4,
    backgroundColor: Colors.accent,
  },

  toggleCard: {
    backgroundColor: Colors.bg1,
    borderRadius:    Radii.md,
    borderWidth:     0.5,
    borderColor:     Colors.border,
    marginTop:       Spacing.lg,
    overflow:        'hidden',
  },
  toggleRow: {
    flexDirection:  'row',
    justifyContent: 'space-between',
    alignItems:     'center',
    padding:        Spacing.md,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.border,
  },
  toggleLeft: { flex: 1, marginRight: Spacing.md },
  toggleLabel: {
    fontFamily: Typography.fonts.bodyMed,
    fontSize:   Typography.sizes.sm,
    color:      Colors.text1,
  },
  toggleSub: {
    fontFamily: Typography.fonts.body,
    fontSize:   Typography.sizes.xs,
    color:      Colors.text2,
    marginTop:  2,
  },

  saveBtn: {
    backgroundColor: Colors.accent,
    borderRadius:    Radii.md,
    padding:         Spacing.lg,
    alignItems:      'center',
    marginTop:       Spacing.xl,
    shadowColor:     Colors.accent,
    shadowOffset:    { width: 0, height: 4 },
    shadowOpacity:   0.35,
    shadowRadius:    10,
    elevation:       6,
  },
  saveBtnText: {
    fontFamily: Typography.fonts.display,
    fontSize:   Typography.sizes.base,
    color:      Colors.bg0,
  },
});
