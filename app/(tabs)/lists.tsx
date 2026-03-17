// ─────────────────────────────────────────
//  Lists Screen — Shared Checklists
// ─────────────────────────────────────────

import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet,
  TouchableOpacity, ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { useChecklistStore } from '../../src/store/checklistStore';
import { useAuthStore } from '../../src/store/authStore';
import { Colors, Typography, Spacing, Radii } from '../../src/theme';
import { Checklist } from '../../src/types';

export default function ListsScreen() {
  const { checklists, loading, loadChecklists, toggleItem } =
    useChecklistStore();
  const currentUser     = useAuthStore(s => s.currentUser);
  const CURRENT_USER_ID = currentUser?.id ?? '';

  useEffect(() => {
    loadChecklists();
  }, []);

  const handleToggle = async (listId: string, itemId: string) => {
    await toggleItem(listId, itemId, CURRENT_USER_ID);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.title}>hive lists 🐝</Text>
            <Text style={styles.sub}>shared checklists · live sync</Text>
          </View>
          <View style={styles.liveChip}>
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>live</Text>
          </View>
        </View>
      </View>

      {loading ? (
        <ActivityIndicator color={Colors.accent} style={{ marginTop: 40 }} />
      ) : (
        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {checklists.length === 0 ? (
            // Demo list when empty
            <DemoList onToggle={() => {}} />
          ) : (
            checklists.map(list => (
              <ChecklistCard
                key={list.id}
                list={list}
                currentUserId={CURRENT_USER_ID}
                onToggle={handleToggle}
              />
            ))
          )}
          <View style={{ height: 100 }} />
        </ScrollView>
      )}

      {/* FAB */}
      <TouchableOpacity style={styles.fab} onPress={() => {}} activeOpacity={0.85}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

// ── Checklist Card Component ──────────────

function ChecklistCard({
  list, currentUserId, onToggle,
}: {
  list: Checklist;
  currentUserId: string;
  onToggle: (listId: string, itemId: string) => void;
}) {
  const checked = list.items.filter(i => i.checked).length;
  const total   = list.items.length;
  const pct     = total > 0 ? Math.round((checked / total) * 100) : 0;

  return (
    <View style={styles.card}>
      {/* Card header */}
      <View style={styles.cardHeader}>
        <View style={styles.cardHeaderLeft}>
          <Text style={styles.cardTitle}>{list.emoji}  {list.title}</Text>
          <Text style={styles.cardSub}>
            {checked} of {total} gathered 🍯
          </Text>
        </View>
        <Text style={styles.pct}>{pct}%</Text>
      </View>

      {/* Progress bar */}
      <View style={styles.progressBg}>
        <View style={[styles.progressFill, { width: `${pct}%` as any }]} />
      </View>

      {/* Live indicator */}
      {list.isShared && (
        <View style={styles.liveRow}>
          <View style={styles.liveDotSmall} />
          <Text style={styles.liveRowText}>Jamie can see this list live</Text>
        </View>
      )}

      {/* Items */}
      <View style={styles.items}>
        {list.items.map(item => (
          <TouchableOpacity
            key={item.id}
            style={styles.item}
            onPress={() => onToggle(list.id, item.id)}
            activeOpacity={0.7}
          >
            <View style={[styles.checkbox, item.checked && styles.checkboxChecked]}>
              {item.checked && <Text style={styles.checkmark}>✓</Text>}
            </View>
            <Text style={[styles.itemText, item.checked && styles.itemTextDone]}>
              {item.text}
            </Text>
            {item.checkedBy && (
              <View style={[
                styles.itemWho,
                item.checkedBy === currentUserId
                  ? { backgroundColor: Colors.partnerA.bg }
                  : { backgroundColor: Colors.partnerB.bg },
              ]}>
                <Text style={styles.itemWhoText}>
                  {item.checkedBy === currentUserId ? 'A' : 'J'}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        ))}

        {/* Add item row */}
        <View style={styles.addRow}>
          <Text style={styles.addText}>+ add to the hive…</Text>
        </View>
      </View>
    </View>
  );
}

// ── Demo list (shown when no real data yet) ─

function DemoList({ onToggle }: { onToggle: (id: string) => void }) {
  const [items, setItems] = useState([
    { id: '1', text: '🥛 Oat milk',       checked: true,  who: 'A' },
    { id: '2', text: '🍞 Sourdough bread', checked: true,  who: 'J' },
    { id: '3', text: '🥑 Avocados (x3)',   checked: false, who: null },
    { id: '4', text: '🍫 Dark chocolate',  checked: false, who: null },
    { id: '5', text: '🧀 Brie cheese',     checked: false, who: null },
    { id: '6', text: '🌿 Fresh basil',     checked: false, who: null },
  ]);

  const checked = items.filter(i => i.checked).length;
  const pct     = Math.round((checked / items.length) * 100);

  const toggle = (id: string) => {
    setItems(prev => prev.map(i =>
      i.id === id ? { ...i, checked: !i.checked, who: !i.checked ? 'A' : null } : i,
    ));
  };

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.cardHeaderLeft}>
          <Text style={styles.cardTitle}>🛒  Grocery run</Text>
          <Text style={styles.cardSub}>{checked} of {items.length} gathered 🍯</Text>
        </View>
        <Text style={styles.pct}>{pct}%</Text>
      </View>
      <View style={styles.progressBg}>
        <View style={[styles.progressFill, { width: `${pct}%` as any }]} />
      </View>
      <View style={styles.liveRow}>
        <View style={styles.liveDotSmall} />
        <Text style={styles.liveRowText}>Jamie is viewing this list right now</Text>
      </View>
      <View style={styles.items}>
        {items.map(item => (
          <TouchableOpacity
            key={item.id} style={styles.item}
            onPress={() => toggle(item.id)} activeOpacity={0.7}
          >
            <View style={[styles.checkbox, item.checked && styles.checkboxChecked]}>
              {item.checked && <Text style={styles.checkmark}>✓</Text>}
            </View>
            <Text style={[styles.itemText, item.checked && styles.itemTextDone]}>
              {item.text}
            </Text>
            {item.who && (
              <View style={[
                styles.itemWho,
                { backgroundColor: item.who === 'A' ? Colors.partnerA.bg : Colors.partnerB.bg },
              ]}>
                <Text style={styles.itemWhoText}>{item.who}</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
        <View style={styles.addRow}>
          <Text style={styles.addText}>+ add to the hive…</Text>
        </View>
      </View>
      {/* Activity feed */}
      <View style={styles.activityFeed}>
        <Text style={styles.activityTitle}>🐝 just now</Text>
        <Text style={styles.activityItem}>Jamie checked off "Sourdough bread" ✓</Text>
        <Text style={[styles.activityItem, { color: Colors.text3, marginTop: 3 }]}>
          5 min ago · you checked off "Oat milk" ✓
        </Text>
      </View>
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
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title:     { fontFamily: Typography.fonts.display, fontSize: Typography.sizes.lg, color: Colors.text1 },
  sub:       { fontFamily: Typography.fonts.body, fontSize: Typography.sizes.xs, color: Colors.text2, marginTop: 2 },

  liveChip: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: 'rgba(74,222,128,0.08)',
    borderRadius: Radii.full, borderWidth: 0.5,
    borderColor: 'rgba(74,222,128,0.25)',
    paddingHorizontal: Spacing.sm, paddingVertical: 4,
  },
  liveDot:  { width: 6, height: 6, borderRadius: 3, backgroundColor: '#4ade80' },
  liveText: { fontFamily: Typography.fonts.bodyMed, fontSize: 9, color: '#4ade80' },

  scroll:        { flex: 1 },
  scrollContent: { padding: Spacing.lg },

  card: {
    backgroundColor: Colors.bg1,
    borderRadius:    Radii.lg,
    borderWidth:     0.5,
    borderColor:     Colors.border,
    marginBottom:    Spacing.md,
    overflow:        'hidden',
  },
  cardHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'flex-start', padding: Spacing.md, paddingBottom: Spacing.sm,
  },
  cardHeaderLeft: { flex: 1 },
  cardTitle: { fontFamily: Typography.fonts.bodyBold, fontSize: Typography.sizes.sm, color: Colors.text1 },
  cardSub:   { fontFamily: Typography.fonts.body, fontSize: Typography.sizes.xs, color: Colors.text2, marginTop: 2 },
  pct:       { fontFamily: Typography.fonts.bodyMed, fontSize: Typography.sizes.xs, color: Colors.accent },

  progressBg:   { height: 4, backgroundColor: Colors.bg3, marginHorizontal: Spacing.md },
  progressFill: { height: 4, backgroundColor: Colors.accent, borderRadius: 2 },

  liveRow: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    margin: Spacing.sm, marginBottom: 2,
    backgroundColor: 'rgba(245,200,66,0.06)',
    borderRadius: Radii.sm, padding: 5,
    borderWidth: 0.5, borderColor: Colors.border,
  },
  liveDotSmall:  { width: 5, height: 5, borderRadius: 3, backgroundColor: Colors.accent },
  liveRowText:   { fontFamily: Typography.fonts.body, fontSize: 9, color: Colors.accent },

  items: { padding: Spacing.md, paddingTop: Spacing.sm },
  item:  { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, paddingVertical: 6, borderBottomWidth: 0.5, borderBottomColor: Colors.border },

  checkbox: {
    width: 16, height: 16, borderRadius: 5,
    borderWidth: 1.5, borderColor: Colors.border2,
    backgroundColor: Colors.bg2,
    alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },
  checkboxChecked: { backgroundColor: Colors.accent, borderColor: Colors.accent },
  checkmark:       { fontFamily: Typography.fonts.bodyBold, fontSize: 9, color: Colors.bg0 },

  itemText:     { flex: 1, fontFamily: Typography.fonts.body, fontSize: Typography.sizes.sm, color: Colors.text1 },
  itemTextDone: { textDecorationLine: 'line-through', color: Colors.text3 },

  itemWho:     { width: 14, height: 14, borderRadius: 7, alignItems: 'center', justifyContent: 'center' },
  itemWhoText: { fontFamily: Typography.fonts.bodyBold, fontSize: 7, color: Colors.text1 },

  addRow:  { paddingVertical: 8 },
  addText: { fontFamily: Typography.fonts.body, fontSize: Typography.sizes.sm, color: Colors.text3 },

  activityFeed: {
    backgroundColor: Colors.bg2,
    borderTopWidth:  0.5, borderTopColor: Colors.border,
    padding: Spacing.md,
  },
  activityTitle: { fontFamily: Typography.fonts.bodyMed, fontSize: 9, color: Colors.accent, marginBottom: 3 },
  activityItem:  { fontFamily: Typography.fonts.body, fontSize: Typography.sizes.xs, color: Colors.text1 },

  fab: {
    position: 'absolute', bottom: 28, right: Spacing.lg,
    width: 52, height: 52, borderRadius: 26,
    backgroundColor: Colors.accent,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: Colors.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4, shadowRadius: 12, elevation: 8,
  },
  fabText: { fontFamily: Typography.fonts.display, fontSize: 28, color: Colors.bg0, lineHeight: 32 },
});
