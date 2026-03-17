// ─────────────────────────────────────────
//  Home Screen — Reminders Feed
// ─────────────────────────────────────────

import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet,
  TouchableOpacity, ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { Colors, Typography, Spacing, Radii } from '../../src/theme';
import { useChecklistStore } from '../../src/store/checklistStore';
import { useReminderStore } from '../../src/store/reminderStore';
import { useAuthStore } from '../../src/store/authStore';

// Demo reminder data (shown until real data loads)
const DEMO_REMINDERS = [
  {
    id: '1', emoji: '💊', title: 'Doctor appointment',
    meta: '2:30 PM · Dr. Smith', type: 'shared', urgent: false,
    partners: true,
  },
  {
    id: '2', emoji: '🛒', title: 'Grocery run',
    meta: '5:00 PM · 4 items left', type: 'checklist', urgent: false,
    progress: 0.5, progressLabel: '2 of 4 checked off',
  },
  {
    id: '3', emoji: '🎂', title: "Mom's birthday gift",
    meta: '⚠️ Due today!', type: 'partner', urgent: true,
    addedBy: 'Jamie',
  },
];

const UPCOMING = [
  { id: '4', emoji: '💍', title: 'Anniversary dinner', meta: 'Fri · La Maison · 7 PM', shared: true },
  { id: '5', emoji: '✈️', title: 'Book flights to Lisbon', meta: 'Next week', shared: false },
];

export default function HomeScreen() {
  const { checklists, loadChecklists } = useChecklistStore();
  const { reminders, loadReminders }   = useReminderStore();
  const currentUser = useAuthStore(s => s.currentUser);
  const partner     = useAuthStore(s => s.partner);
  const [greeting, setGreeting] = useState('');

  const userName      = currentUser?.name?.split(' ')[0] ?? 'there';
  const partnerLetter = partner?.name?.[0]?.toUpperCase() ?? 'J';

  useEffect(() => {
    const h = new Date().getHours();
    if (h < 12)      setGreeting('good morning');
    else if (h < 17) setGreeting('good afternoon');
    else             setGreeting('good evening');
  }, []);

  useEffect(() => {
    loadReminders();
    loadChecklists();
  }, []);

  const todayCount = DEMO_REMINDERS.length;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.title}>{greeting}, {userName} 🐝</Text>
            <Text style={styles.sub}>
              {todayCount} thing{todayCount !== 1 ? 's' : ''} buzzing today
            </Text>
          </View>
          <View style={styles.avatarRow}>
            <View style={[styles.avatar, { backgroundColor: Colors.partnerA.bg }]}>
              <Text style={styles.avatarText}>{userName[0]?.toUpperCase() ?? 'A'}</Text>
            </View>
            {partner && (
              <View style={[styles.avatar, { backgroundColor: Colors.partnerB.bg }]}>
                <Text style={styles.avatarText}>{partnerLetter}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Filter pills */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.pillsWrap}>
          {['🍯 All', 'Mine', 'Shared', 'Lists'].map((label, i) => (
            <TouchableOpacity key={label} style={[styles.pill, i === 0 && styles.pillActive]}>
              <Text style={[styles.pillText, i === 0 && styles.pillTextActive]}>{label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* Streak teaser */}
        <TouchableOpacity
          style={styles.streakBanner}
          onPress={() => router.push('/(tabs)/streaks')}
          activeOpacity={0.8}
        >
          <Text style={styles.streakFire}>🔥</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.streakTitle}>7-day streak!</Text>
            <Text style={styles.streakSub}>one more for the hive 🍯</Text>
          </View>
          <Text style={styles.streakArrow}>›</Text>
        </TouchableOpacity>

        {/* Today section */}
        <Text style={styles.sectionLabel}>today</Text>

        {DEMO_REMINDERS.map(item => (
          <TouchableOpacity
            key={item.id}
            style={[styles.card, item.urgent && styles.cardUrgent]}
            activeOpacity={0.75}
            onPress={() => {}}
          >
            <View style={styles.cardTop}>
              <View style={styles.cardLeft}>
                <Text style={styles.cardTitle}>{item.emoji}  {item.title}</Text>
                <Text style={styles.cardMeta}>{item.meta}</Text>
              </View>
              {item.type === 'shared' && (
                <View style={styles.tagShared}><Text style={styles.tagText}>Shared 🐝</Text></View>
              )}
              {item.type === 'checklist' && (
                <View style={styles.tagMine}><Text style={[styles.tagText, { color: Colors.accent2 }]}>Checklist</Text></View>
              )}
              {item.type === 'partner' && (
                <View style={styles.tagUrgent}><Text style={[styles.tagText, { color: '#f87171' }]}>Urgent</Text></View>
              )}
            </View>

            {/* Progress bar for checklists */}
            {item.progress !== undefined && (
              <View style={{ marginTop: Spacing.sm }}>
                <View style={styles.progressBg}>
                  <View style={[styles.progressFill, { width: `${item.progress * 100}%` as any }]} />
                </View>
                <Text style={styles.progressLabel}>{item.progressLabel}</Text>
              </View>
            )}

            {/* Partner attribution */}
            {item.addedBy && (
              <View style={styles.partnerRow}>
                <View style={[styles.miniAvatar, { backgroundColor: Colors.partnerB.bg }]}>
                  <Text style={styles.miniAvatarText}>J</Text>
                </View>
                <Text style={styles.partnerLabel}>{item.addedBy} added this</Text>
              </View>
            )}

            {/* Shared avatars */}
            {item.partners && (
              <View style={styles.partnerRow}>
                <View style={[styles.miniAvatar, { backgroundColor: Colors.partnerA.bg }]}>
                  <Text style={styles.miniAvatarText}>A</Text>
                </View>
                <View style={[styles.miniAvatar, { backgroundColor: Colors.partnerB.bg }]}>
                  <Text style={styles.miniAvatarText}>J</Text>
                </View>
                <Text style={styles.partnerLabel}>both reminded</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}

        {/* Upcoming section */}
        <Text style={[styles.sectionLabel, { marginTop: Spacing.md }]}>upcoming</Text>
        {UPCOMING.map(item => (
          <TouchableOpacity key={item.id} style={styles.card} activeOpacity={0.75}>
            <View style={styles.cardTop}>
              <View style={styles.cardLeft}>
                <Text style={styles.cardTitle}>{item.emoji}  {item.title}</Text>
                <Text style={styles.cardMeta}>{item.meta}</Text>
              </View>
              {item.shared && (
                <View style={styles.tagShared}><Text style={styles.tagText}>Shared 🐝</Text></View>
              )}
            </View>
          </TouchableOpacity>
        ))}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push('/reminder/new')}
        activeOpacity={0.85}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container:  { flex: 1, backgroundColor: Colors.bg0 },

  header: {
    backgroundColor:   Colors.bg1,
    paddingTop:        Spacing.xl,
    paddingHorizontal: Spacing.lg,
    paddingBottom:     Spacing.md,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.border,
  },
  headerTop: {
    flexDirection:  'row',
    justifyContent: 'space-between',
    alignItems:     'center',
    marginBottom:   Spacing.md,
  },
  title: {
    fontFamily: Typography.fonts.display,
    fontSize:   Typography.sizes.lg,
    color:      Colors.text1,
  },
  sub: {
    fontFamily: Typography.fonts.body,
    fontSize:   Typography.sizes.xs,
    color:      Colors.text2,
    marginTop:  2,
  },
  avatarRow: { flexDirection: 'row', gap: 5 },
  avatar: {
    width:           28, height: 28, borderRadius: 14,
    borderWidth:     1.5, borderColor: Colors.border2,
    alignItems:      'center', justifyContent: 'center',
  },
  avatarText: { fontFamily: Typography.fonts.bodyBold, fontSize: 10, color: Colors.text1 },

  pillsWrap: { marginHorizontal: -Spacing.lg, paddingHorizontal: Spacing.lg },
  pill: {
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs,
    borderRadius: 20, backgroundColor: Colors.bg2,
    borderWidth: 0.5, borderColor: Colors.border, marginRight: Spacing.sm,
  },
  pillActive:     { backgroundColor: Colors.accent, borderColor: Colors.accent },
  pillText:       { fontFamily: Typography.fonts.bodyMed, fontSize: Typography.sizes.xs, color: Colors.text2 },
  pillTextActive: { color: Colors.bg0 },

  scroll:        { flex: 1 },
  scrollContent: { padding: Spacing.lg },

  // Streak banner
  streakBanner: {
    flexDirection:   'row',
    alignItems:      'center',
    gap:             Spacing.sm,
    backgroundColor: Colors.bg1,
    borderRadius:    Radii.md,
    borderWidth:     0.5,
    borderColor:     'rgba(245,200,66,0.25)',
    padding:         Spacing.md,
    marginBottom:    Spacing.md,
  },
  streakFire:  { fontSize: 22 },
  streakTitle: { fontFamily: Typography.fonts.bodyBold, fontSize: Typography.sizes.sm, color: Colors.accent },
  streakSub:   { fontFamily: Typography.fonts.body, fontSize: Typography.sizes.xs, color: Colors.text2 },
  streakArrow: { fontFamily: Typography.fonts.display, fontSize: 22, color: Colors.text3 },

  sectionLabel: {
    fontFamily:    Typography.fonts.bodyMed,
    fontSize:      Typography.sizes.xs,
    color:         Colors.text3,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom:  Spacing.sm,
  },

  card: {
    backgroundColor: Colors.bg1,
    borderRadius:    Radii.md,
    borderWidth:     0.5,
    borderColor:     Colors.border,
    padding:         Spacing.md,
    marginBottom:    Spacing.sm,
  },
  cardUrgent: { borderLeftWidth: 2, borderLeftColor: '#f87171' },
  cardTop:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  cardLeft:   { flex: 1, marginRight: Spacing.sm },
  cardTitle:  { fontFamily: Typography.fonts.bodyMed, fontSize: Typography.sizes.sm, color: Colors.text1 },
  cardMeta:   { fontFamily: Typography.fonts.body, fontSize: Typography.sizes.xs, color: Colors.text2, marginTop: 2 },

  tagShared:  { backgroundColor: Colors.accentAlpha(0.12), borderRadius: Radii.sm, paddingHorizontal: 7, paddingVertical: 3 },
  tagMine:    { backgroundColor: Colors.honeyAlpha(0.12), borderRadius: Radii.sm, paddingHorizontal: 7, paddingVertical: 3 },
  tagUrgent:  { backgroundColor: 'rgba(248,113,113,0.12)', borderRadius: Radii.sm, paddingHorizontal: 7, paddingVertical: 3 },
  tagText:    { fontFamily: Typography.fonts.bodyMed, fontSize: 9, color: Colors.accent },

  progressBg:    { height: 4, borderRadius: 2, backgroundColor: Colors.bg3 },
  progressFill:  { height: 4, borderRadius: 2, backgroundColor: Colors.accent },
  progressLabel: { fontFamily: Typography.fonts.body, fontSize: 9, color: Colors.text2, marginTop: 3 },

  partnerRow:     { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: Spacing.sm },
  miniAvatar:     { width: 16, height: 16, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  miniAvatarText: { fontFamily: Typography.fonts.bodyBold, fontSize: 7, color: Colors.text1 },
  partnerLabel:   { fontFamily: Typography.fonts.body, fontSize: 9, color: Colors.text2 },

  fab: {
    position:     'absolute', bottom: 28, right: Spacing.lg,
    width: 52, height: 52, borderRadius: 26,
    backgroundColor: Colors.accent,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: Colors.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4, shadowRadius: 12, elevation: 8,
  },
  fabText: { fontFamily: Typography.fonts.display, fontSize: 28, color: Colors.bg0, lineHeight: 32 },
});
