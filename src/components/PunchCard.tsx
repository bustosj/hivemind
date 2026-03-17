// ─────────────────────────────────────────
//  PunchCard Component
//  The physical punch-card UI with perforations,
//  punched slots, bonus reward slot
// ─────────────────────────────────────────

import React, { useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Animated,
} from 'react-native';
import { Colors, Typography, Spacing, Radii } from '../theme';
import {
  PunchCard as PunchCardType,
  getPunchCount, isCardComplete, getPunchesLeft, getProgressPercent,
} from '../types';

interface Props {
  card:          PunchCardType;
  currentUserId: string;
  onPress:       (card: PunchCardType) => void;
  onPunch:       (cardId: string) => void;
  compact?:      boolean;
}

export function PunchCard({ card, currentUserId, onPress, onPunch, compact = true }: Props) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const complete  = isCardComplete(card);
  const punchCount = getPunchCount(card);
  const left       = getPunchesLeft(card);
  const pct        = getProgressPercent(card);

  // Who punched each slot
  const punchByIndex = card.punches.reduce((acc, p, i) => {
    acc[i] = p.punchedBy === card.owner ? 'A' : 'B';
    return acc;
  }, {} as Record<number, 'A' | 'B'>);

  const canPunch =
    !complete &&
    (card.whoCanPunch === 'both' ||
     (card.whoCanPunch === 'mine' && currentUserId === card.owner) ||
     (card.whoCanPunch === 'partner' && currentUserId !== card.owner));

  const handlePunch = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 0.96, duration: 80, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true }),
    ]).start();
    onPunch(card.id);
  };

  return (
    <Animated.View style={[styles.card, complete && styles.cardComplete, { transform: [{ scale: scaleAnim }] }]}>
      {/* Side notches (decorative) */}
      <View style={[styles.notch, styles.notchLeft]} />
      <View style={[styles.notch, styles.notchRight]} />

      {/* Header */}
      <TouchableOpacity onPress={() => onPress(card)} activeOpacity={0.7} style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.title}>{card.emoji}  {card.title}</Text>
          <Text style={styles.rewardText}>reward: {card.reward}</Text>
        </View>
        <View style={[styles.badge, complete && styles.badgeComplete]}>
          <Text style={[styles.badgeText, complete && styles.badgeTextComplete]}>
            {complete ? '🎉 done!' : `${punchCount} / ${card.targetCount}`}
          </Text>
        </View>
      </TouchableOpacity>

      {/* Perforation */}
      <View style={styles.perfRow}>
        {Array.from({ length: 24 }).map((_, i) => (
          <View key={i} style={styles.perfDot} />
        ))}
      </View>

      {/* Punch slots */}
      <View style={styles.punches}>
        {Array.from({ length: card.targetCount }).map((_, i) => {
          const isFilled  = i < punchCount;
          const isNext    = i === punchCount && !complete;
          const isReward  = i === card.targetCount - 1;
          const whoLabel  = punchByIndex[i];

          return (
            <View key={i} style={styles.punchWrap}>
              <TouchableOpacity
                onPress={isNext && canPunch ? handlePunch : undefined}
                activeOpacity={isNext ? 0.7 : 1}
                style={[
                  styles.punch,
                  isFilled  && styles.punchFilled,
                  isNext    && styles.punchNext,
                  isReward  && !isFilled && styles.punchBonus,
                  isReward  && isFilled  && styles.punchBonusFilled,
                ]}
              >
                <Text style={styles.punchEmoji}>
                  {isFilled
                    ? (isReward ? card.rewardEmoji : card.emoji)
                    : isReward
                      ? card.rewardEmoji
                      : isNext ? '+' : '·'}
                </Text>
              </TouchableOpacity>

              {/* Who-punched avatar */}
              {isFilled && whoLabel && (
                <View style={[
                  styles.punchWho,
                  whoLabel === 'A' ? styles.whoA : styles.whoB,
                ]}>
                  <Text style={styles.punchWhoText}>{whoLabel}</Text>
                </View>
              )}
            </View>
          );
        })}
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        {complete && card.rewardRedeemed ? (
          <View style={styles.rewardChip}>
            <Text style={styles.rewardChipText}>{card.rewardEmoji} reward redeemed ✓</Text>
          </View>
        ) : complete ? (
          <View style={styles.rewardChip}>
            <Text style={styles.rewardChipText}>{card.rewardEmoji} {card.reward} unlocked!</Text>
          </View>
        ) : (
          <View style={styles.footerAvatars}>
            {card.isShared && (
              <>
                <View style={[styles.footerAvatar, styles.whoA]}>
                  <Text style={styles.footerAvatarText}>A</Text>
                </View>
                <View style={[styles.footerAvatar, styles.whoB]}>
                  <Text style={styles.footerAvatarText}>B</Text>
                </View>
                <Text style={styles.footerShared}>shared card</Text>
              </>
            )}
          </View>
        )}
        {!complete && (
          <Text style={styles.footerCount}>{left} left 🐝</Text>
        )}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.bg1,
    borderRadius:    Radii.lg,
    borderWidth:     0.5,
    borderColor:     Colors.border2,
    marginBottom:    Spacing.md,
    overflow:        'hidden',
    position:        'relative',
  },
  cardComplete: {
    borderColor: 'rgba(134,239,172,0.3)',
  },

  // Side notches
  notch: {
    position:        'absolute',
    width:           14,
    height:          14,
    borderRadius:    7,
    backgroundColor: Colors.bg0,
    borderWidth:     0.5,
    borderColor:     Colors.border2,
    top:             '50%',
    marginTop:       -7,
    zIndex:          2,
  },
  notchLeft:  { left: -7 },
  notchRight: { right: -7 },

  header: {
    flexDirection:  'row',
    justifyContent: 'space-between',
    alignItems:     'flex-start',
    padding:        Spacing.md,
    paddingBottom:  Spacing.sm,
  },
  headerLeft: { flex: 1, marginRight: Spacing.sm },
  title: {
    fontFamily: Typography.fonts.bodyBold,
    fontSize:   Typography.sizes.sm,
    color:      Colors.text1,
  },
  rewardText: {
    fontFamily: Typography.fonts.body,
    fontSize:   Typography.sizes.xs,
    color:      Colors.text2,
    marginTop:  2,
  },
  badge: {
    backgroundColor: Colors.accentAlpha(0.12),
    borderWidth:     0.5,
    borderColor:     Colors.accentAlpha(0.3),
    borderRadius:    Radii.sm,
    paddingHorizontal: 8,
    paddingVertical:   3,
  },
  badgeComplete: {
    backgroundColor: 'rgba(134,239,172,0.12)',
    borderColor:     'rgba(134,239,172,0.3)',
  },
  badgeText: {
    fontFamily: Typography.fonts.bodyMed,
    fontSize:   Typography.sizes.xs,
    color:      Colors.accent,
  },
  badgeTextComplete: { color: '#86efac' },

  // Perforation
  perfRow: {
    flexDirection:  'row',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    marginBottom:   2,
  },
  perfDot: {
    width:           4,
    height:          1,
    backgroundColor: Colors.border2,
    borderRadius:    1,
  },

  // Punches
  punches: {
    flexDirection: 'row',
    flexWrap:      'wrap',
    gap:           6,
    padding:       Spacing.md,
    paddingTop:    Spacing.sm,
  },
  punchWrap: { position: 'relative' },
  punch: {
    width:           28,
    height:          28,
    borderRadius:    Radii.sm,
    borderWidth:     1.5,
    borderColor:     Colors.border2,
    backgroundColor: Colors.bg2,
    alignItems:      'center',
    justifyContent:  'center',
  },
  punchFilled: {
    backgroundColor: Colors.accent,
    borderColor:     Colors.accent,
  },
  punchNext: {
    borderColor:     Colors.accent,
    borderStyle:     'dashed',
    backgroundColor: Colors.accentAlpha(0.07),
  },
  punchBonus: {
    backgroundColor: Colors.bg3,
    borderColor:     Colors.honey,
    borderStyle:     'dashed',
  },
  punchBonusFilled: {
    backgroundColor: Colors.honey,
    borderColor:     Colors.honey,
  },
  punchEmoji: { fontSize: 13 },

  // Who-punched avatar
  punchWho: {
    position:        'absolute',
    bottom:          -4,
    right:           -4,
    width:           12,
    height:          12,
    borderRadius:    6,
    borderWidth:     1.5,
    borderColor:     Colors.bg1,
    alignItems:      'center',
    justifyContent:  'center',
    zIndex:          1,
  },
  whoA: { backgroundColor: Colors.partnerA.bg },
  whoB: { backgroundColor: Colors.partnerB.bg },
  punchWhoText: {
    fontSize:   7,
    fontFamily: Typography.fonts.bodyBold,
    color:      Colors.text1,
  },

  // Footer
  footer: {
    flexDirection:  'row',
    justifyContent: 'space-between',
    alignItems:     'center',
    paddingHorizontal: Spacing.md,
    paddingBottom:  Spacing.md,
    paddingTop:     2,
  },
  footerAvatars: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  footerAvatar: {
    width:           18,
    height:          18,
    borderRadius:    9,
    borderWidth:     1,
    borderColor:     Colors.border2,
    alignItems:      'center',
    justifyContent:  'center',
  },
  footerAvatarText: {
    fontSize:   8,
    fontFamily: Typography.fonts.bodyBold,
    color:      Colors.text1,
  },
  footerShared: {
    fontFamily: Typography.fonts.body,
    fontSize:   Typography.sizes.xs,
    color:      Colors.text2,
    marginLeft: 4,
  },
  footerCount: {
    fontFamily: Typography.fonts.bodyMed,
    fontSize:   Typography.sizes.xs,
    color:      Colors.accent,
  },

  // Reward chip
  rewardChip: {
    backgroundColor: Colors.accentAlpha(0.09),
    borderWidth:     0.5,
    borderColor:     Colors.accentAlpha(0.25),
    borderRadius:    20,
    paddingHorizontal: 10,
    paddingVertical:   4,
  },
  rewardChipText: {
    fontFamily: Typography.fonts.bodyMed,
    fontSize:   Typography.sizes.xs,
    color:      Colors.accent,
  },
});
