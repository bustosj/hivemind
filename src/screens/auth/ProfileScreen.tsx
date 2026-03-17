// ─────────────────────────────────────────
//  Profile Screen — Local Account Settings
// ─────────────────────────────────────────

import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, Alert, Switch,
} from 'react-native';
import { Colors, Typography, Spacing, Radii } from '../../theme';
import { useAuthStore } from '../../store/authStore';

export default function ProfileScreen() {
  const { currentUser, partner, signOut, unlinkPartner } = useAuthStore();

  const [notifyChecks,  setNotifyChecks]  = useState(true);
  const [notifyPunches, setNotifyPunches] = useState(true);
  const [notifyEvents,  setNotifyEvents]  = useState(true);

  const userLetter    = currentUser?.name?.[0]?.toUpperCase() ?? 'A';
  const partnerLetter = partner?.name?.[0]?.toUpperCase() ?? 'B';

  const handleSignOut = () => {
    Alert.alert(
      'Sign out?',
      'This will clear your name and partner info. Your reminders and cards will stay saved.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign out', style: 'destructive', onPress: () => signOut() },
      ],
    );
  };

  const handleUnlink = () => {
    Alert.alert(
      'Remove partner?',
      `This will remove ${partner?.name} from your hive.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Remove', style: 'destructive', onPress: () => unlinkPartner() },
      ],
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>our hive 🍯</Text>
        <Text style={styles.sub}>account & settings</Text>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* Pair card */}
        <View style={styles.pairCard}>
          <View style={styles.pairAvatars}>
            <View style={[styles.pairAvatar, { backgroundColor: Colors.partnerA.bg }]}>
              <Text style={[styles.pairAvatarText, { color: Colors.partnerA.text }]}>{userLetter}</Text>
            </View>
            <Text style={styles.pairHeart}>🐝</Text>
            <View style={[styles.pairAvatar, { backgroundColor: Colors.partnerB.bg }]}>
              <Text style={[styles.pairAvatarText, { color: Colors.partnerB.text }]}>{partnerLetter}</Text>
            </View>
          </View>

          {partner ? (
            <>
              <Text style={styles.pairNames}>{currentUser?.name} & {partner.name}</Text>
              <View style={styles.linkedChip}>
                <View style={styles.linkedDot} />
                <Text style={styles.linkedText}>linked locally</Text>
              </View>
            </>
          ) : (
            <>
              <Text style={styles.pairNames}>{currentUser?.name}</Text>
              <Text style={styles.pairSub}>no partner added yet</Text>
            </>
          )}
        </View>

        {/* My account */}
        <Text style={styles.sectionLabel}>my account</Text>
        <View style={styles.card}>
          <View style={styles.row}>
            <View style={[styles.rowAvatar, { backgroundColor: Colors.partnerA.bg }]}>
              <Text style={[styles.rowAvatarText, { color: Colors.partnerA.text }]}>{userLetter}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.rowTitle}>{currentUser?.name}</Text>
              <Text style={styles.rowSub}>saved on this device</Text>
            </View>
          </View>
        </View>

        {/* Notifications */}
        <Text style={styles.sectionLabel}>reminders</Text>
        <View style={styles.card}>
          {[
            { label: '☑️ checklist checks',   value: notifyChecks,  set: setNotifyChecks },
            { label: '🎫 punch card punches',  value: notifyPunches, set: setNotifyPunches },
            { label: '📅 upcoming events',     value: notifyEvents,  set: setNotifyEvents },
          ].map((item, i, arr) => (
            <View key={item.label} style={[
              styles.toggleRow,
              i < arr.length - 1 && { borderBottomWidth: 0.5, borderBottomColor: Colors.border },
            ]}>
              <Text style={[styles.toggleLabel, { flex: 1, marginRight: Spacing.md }]}>{item.label}</Text>
              <Switch
                value={item.value}
                onValueChange={item.set}
                thumbColor={Colors.bg0}
                trackColor={{ false: Colors.bg3, true: Colors.accent }}
              />
            </View>
          ))}
        </View>

        {/* Partner actions */}
        {partner && (
          <>
            <Text style={styles.sectionLabel}>partner</Text>
            <View style={styles.card}>
              <TouchableOpacity onPress={handleUnlink} style={styles.actionRow}>
                <Text style={[styles.actionText, { color: '#f87171' }]}>⚠️ remove {partner.name}</Text>
                <Text style={styles.actionArrow}>›</Text>
              </TouchableOpacity>
            </View>
          </>
        )}

        <TouchableOpacity style={styles.signOutBtn} onPress={handleSignOut} activeOpacity={0.8}>
          <Text style={styles.signOutText}>change name / reset</Text>
        </TouchableOpacity>

        <Text style={styles.version}>HiveMind 🐝 · saved on device</Text>
        <View style={{ height: 60 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container:  { flex: 1, backgroundColor: Colors.bg0 },
  header: {
    backgroundColor: Colors.bg1, paddingTop: Spacing.xl,
    paddingHorizontal: Spacing.lg, paddingBottom: Spacing.md,
    borderBottomWidth: 0.5, borderBottomColor: Colors.border,
  },
  title: { fontFamily: Typography.fonts.display, fontSize: Typography.sizes.lg, color: Colors.text1 },
  sub:   { fontFamily: Typography.fonts.body, fontSize: Typography.sizes.xs, color: Colors.text2, marginTop: 2 },
  scroll: { flex: 1 },
  scrollContent: { padding: Spacing.lg },
  pairCard: {
    backgroundColor: Colors.bg1, borderRadius: Radii.xl,
    borderWidth: 1, borderColor: Colors.border2,
    padding: Spacing.xl, alignItems: 'center', marginBottom: Spacing.xl,
    shadowColor: Colors.accent, shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.1, shadowRadius: 20, elevation: 4,
  },
  pairAvatars: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, marginBottom: Spacing.md },
  pairAvatar: {
    width: 56, height: 56, borderRadius: 28,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1.5, borderColor: Colors.border2,
  },
  pairAvatarText: { fontFamily: Typography.fonts.display, fontSize: 22 },
  pairHeart:  { fontSize: 22 },
  pairNames:  { fontFamily: Typography.fonts.displayMed, fontSize: Typography.sizes.md, color: Colors.text1, marginBottom: 8 },
  pairSub:    { fontFamily: Typography.fonts.body, fontSize: Typography.sizes.xs, color: Colors.text2 },
  linkedChip: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: 'rgba(74,222,128,0.1)', borderRadius: Radii.full,
    borderWidth: 0.5, borderColor: 'rgba(74,222,128,0.25)',
    paddingHorizontal: Spacing.sm, paddingVertical: 4,
  },
  linkedDot:  { width: 6, height: 6, borderRadius: 3, backgroundColor: '#4ade80' },
  linkedText: { fontFamily: Typography.fonts.bodyMed, fontSize: 9, color: '#4ade80' },
  sectionLabel: {
    fontFamily: Typography.fonts.bodyMed, fontSize: Typography.sizes.xs,
    color: Colors.text3, textTransform: 'uppercase', letterSpacing: 0.6,
    marginBottom: Spacing.sm,
  },
  card: {
    backgroundColor: Colors.bg1, borderRadius: Radii.md,
    borderWidth: 0.5, borderColor: Colors.border,
    marginBottom: Spacing.lg, overflow: 'hidden',
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, padding: Spacing.md },
  rowAvatar: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  rowAvatarText: { fontFamily: Typography.fonts.bodyBold, fontSize: 14 },
  rowTitle: { fontFamily: Typography.fonts.bodyMed, fontSize: Typography.sizes.sm, color: Colors.text1 },
  rowSub:   { fontFamily: Typography.fonts.body, fontSize: Typography.sizes.xs, color: Colors.text2, marginTop: 1 },
  toggleRow:   { flexDirection: 'row', alignItems: 'center', padding: Spacing.md },
  toggleLabel: { fontFamily: Typography.fonts.bodyMed, fontSize: Typography.sizes.sm, color: Colors.text1 },
  actionRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: Spacing.md,
  },
  actionText:  { fontFamily: Typography.fonts.bodyMed, fontSize: Typography.sizes.sm, color: Colors.text1 },
  actionArrow: { fontFamily: Typography.fonts.display, fontSize: 20, color: Colors.text3 },
  signOutBtn: {
    backgroundColor: Colors.bg1, borderRadius: Radii.md,
    borderWidth: 0.5, borderColor: 'rgba(248,113,113,0.3)',
    padding: Spacing.lg, alignItems: 'center', marginBottom: Spacing.lg,
  },
  signOutText: { fontFamily: Typography.fonts.bodyMed, fontSize: Typography.sizes.sm, color: '#f87171' },
  version: { fontFamily: Typography.fonts.body, fontSize: Typography.sizes.xs, color: Colors.text3, textAlign: 'center' },
});
