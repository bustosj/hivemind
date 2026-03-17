// ─────────────────────────────────────────
//  Streaks Screen — Punch Card Feed
// ─────────────────────────────────────────

import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet,
  TouchableOpacity, ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { usePunchCardStore } from '../store/punchCardStore';
import { PunchCard } from '../components/PunchCard';
import { Colors, Typography, Spacing, Radii } from '../theme';
import { PunchCard as PunchCardType, isCardComplete } from '../types';

import { useAuthStore } from '../store/authStore';

type Filter = 'all' | 'shared' | 'mine' | 'done';

export default function StreaksScreen() {
  const { cards, loading, loadCards, punchCard } = usePunchCardStore();
  const currentUser = useAuthStore(s => s.currentUser);
  const CURRENT_USER_ID = currentUser?.id ?? '';
  const [filter, setFilter] = useState<Filter>('all');

  useEffect(() => {
    loadCards();
  }, []);

  const filtered = cards.filter(card => {
    if (filter === 'all')    return !card.completed || card.rewardRedeemed === false;
    if (filter === 'shared') return card.isShared;
    if (filter === 'mine')   return card.owner === CURRENT_USER_ID;
    if (filter === 'done')   return isCardComplete(card);
    return true;
  });

  const handlePunch = async (cardId: string) => {
    await punchCard(cardId, CURRENT_USER_ID);
  };

  const handleOpenCard = (card: PunchCardType) => {
    router.push(`/streak/${card.id}`);
  };

  const filters: { key: Filter; label: string }[] = [
    { key: 'all',    label: '🍯 All' },
    { key: 'shared', label: 'Shared' },
    { key: 'mine',   label: 'Mine' },
    { key: 'done',   label: 'Done' },
  ];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.headerTitle}>our streaks 🐝</Text>
            <Text style={styles.headerSub}>punch cards for two</Text>
          </View>
          <View style={styles.avatarRow}>
            <View style={[styles.avatar, styles.avatarA]}>
              <Text style={styles.avatarText}>A</Text>
            </View>
            <View style={[styles.avatar, styles.avatarB]}>
              <Text style={styles.avatarText}>B</Text>
            </View>
          </View>
        </View>

        {/* Filter pills */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.pillsRow}>
          {filters.map(f => (
            <TouchableOpacity
              key={f.key}
              onPress={() => setFilter(f.key)}
              style={[styles.pill, filter === f.key && styles.pillActive]}
            >
              <Text style={[styles.pillText, filter === f.key && styles.pillTextActive]}>
                {f.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Card feed */}
      {loading ? (
        <ActivityIndicator color={Colors.accent} style={{ marginTop: 40 }} />
      ) : (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {filtered.length === 0 ? (
            <View style={styles.empty}>
              <Text style={styles.emptyEmoji}>🐝</Text>
              <Text style={styles.emptyTitle}>no punch cards yet</Text>
              <Text style={styles.emptySub}>tap + to create your first one</Text>
            </View>
          ) : (
            filtered.map(card => (
              <PunchCard
                key={card.id}
                card={card}
                currentUserId={CURRENT_USER_ID}
                onPress={handleOpenCard}
                onPunch={handlePunch}
              />
            ))
          )}
          <View style={{ height: 80 }} />
        </ScrollView>
      )}

      {/* FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push('/streak/new')}
        activeOpacity={0.85}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex:            1,
    backgroundColor: Colors.bg0,
  },

  header: {
    backgroundColor: Colors.bg1,
    paddingTop:      Spacing.xl,
    paddingHorizontal: Spacing.lg,
    paddingBottom:   Spacing.md,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.border,
  },
  headerTop: {
    flexDirection:  'row',
    justifyContent: 'space-between',
    alignItems:     'center',
    marginBottom:   Spacing.md,
  },
  headerTitle: {
    fontFamily: Typography.fonts.display,
    fontSize:   Typography.sizes.lg,
    color:      Colors.text1,
  },
  headerSub: {
    fontFamily: Typography.fonts.body,
    fontSize:   Typography.sizes.xs,
    color:      Colors.text2,
    marginTop:  2,
  },
  avatarRow: { flexDirection: 'row', gap: 6 },
  avatar: {
    width:           28,
    height:          28,
    borderRadius:    14,
    borderWidth:     1.5,
    borderColor:     Colors.border2,
    alignItems:      'center',
    justifyContent:  'center',
  },
  avatarA: { backgroundColor: Colors.partnerA.bg },
  avatarB: { backgroundColor: Colors.partnerB.bg },
  avatarText: {
    fontFamily: Typography.fonts.bodyBold,
    fontSize:   Typography.sizes.xs,
    color:      Colors.text1,
  },

  pillsRow: { marginHorizontal: -Spacing.lg, paddingHorizontal: Spacing.lg },
  pill: {
    paddingHorizontal: Spacing.md,
    paddingVertical:   Spacing.xs,
    borderRadius:      20,
    backgroundColor:   Colors.bg2,
    borderWidth:       0.5,
    borderColor:       Colors.border,
    marginRight:       Spacing.sm,
  },
  pillActive: {
    backgroundColor: Colors.accent,
    borderColor:     Colors.accent,
  },
  pillText: {
    fontFamily: Typography.fonts.bodyMed,
    fontSize:   Typography.sizes.xs,
    color:      Colors.text2,
  },
  pillTextActive: { color: Colors.bg0 },

  scroll: { flex: 1 },
  scrollContent: {
    padding:    Spacing.lg,
    paddingTop: Spacing.md,
  },

  empty: { alignItems: 'center', marginTop: 60 },
  emptyEmoji: { fontSize: 48, marginBottom: Spacing.md },
  emptyTitle: {
    fontFamily: Typography.fonts.displayMed,
    fontSize:   Typography.sizes.md,
    color:      Colors.text1,
    marginBottom: Spacing.xs,
  },
  emptySub: {
    fontFamily: Typography.fonts.body,
    fontSize:   Typography.sizes.sm,
    color:      Colors.text3,
  },

  fab: {
    position:        'absolute',
    bottom:          28,
    right:           Spacing.lg,
    width:           52,
    height:          52,
    borderRadius:    26,
    backgroundColor: Colors.accent,
    alignItems:      'center',
    justifyContent:  'center',
    shadowColor:     Colors.accent,
    shadowOffset:    { width: 0, height: 4 },
    shadowOpacity:   0.4,
    shadowRadius:    12,
    elevation:       8,
  },
  fabText: {
    fontFamily: Typography.fonts.display,
    fontSize:   28,
    color:      Colors.bg0,
    lineHeight: 32,
  },
});
