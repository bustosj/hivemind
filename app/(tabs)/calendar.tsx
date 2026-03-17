// ─────────────────────────────────────────
//  Calendar Screen — Google Calendar Sync
// ─────────────────────────────────────────

import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet,
  TouchableOpacity, ActivityIndicator,
} from 'react-native';
import { format, startOfMonth, endOfMonth, eachDayOfInterval,
         isSameDay, isSameMonth, isToday, addMonths, subMonths } from 'date-fns';
import { Colors, Typography, Spacing, Radii } from '../../src/theme';
import { requestCalendarPermissions, fetchUpcomingEvents } from '../../src/utils/calendar';

const DAYS_OF_WEEK = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

// Demo event dots — replace with real calendar data
const DEMO_DOTS: Record<string, ('shared' | 'mine' | 'partner')[]> = {
  [format(new Date(), 'yyyy-MM-dd')]:                          ['shared', 'mine'],
  [format(addMonths(new Date(), 0).setDate(20) as any, 'yyyy-MM-dd')]: ['shared'],
  [format(addMonths(new Date(), 0).setDate(22) as any, 'yyyy-MM-dd')]: ['mine'],
};

const DOT_COLORS = {
  shared:  Colors.accent,
  mine:    Colors.accent2,
  partner: '#f472b6',
};

// Demo upcoming events
const DEMO_EVENTS = [
  { id: '1', emoji: '💊', title: 'Doctor appointment', time: '2:30 PM', type: 'shared' as const },
  { id: '2', emoji: '💍', title: 'Anniversary dinner', time: 'Fri · 7:00 PM', type: 'shared' as const },
  { id: '3', emoji: '✈️', title: 'Book flights to Lisbon', time: 'Next week', type: 'mine' as const },
];

export default function CalendarScreen() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate]  = useState(new Date());
  const [calGranted,   setCalGranted]    = useState(false);

  useEffect(() => {
    requestCalendarPermissions().then(setCalGranted);
  }, []);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd   = endOfMonth(currentMonth);
  const days       = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Pad start of month with empty cells
  const startPad = monthStart.getDay();
  const cells    = [...Array(startPad).fill(null), ...days];

  const getDots = (date: Date) =>
    DEMO_DOTS[format(date, 'yyyy-MM-dd')] ?? [];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.title}>{format(currentMonth, 'MMMM yyyy')}</Text>
            <Text style={styles.sub}>
              {calGranted ? 'synced with Google Calendar ✓' : 'tap to connect Google Calendar'}
            </Text>
          </View>
          <View style={styles.navRow}>
            <TouchableOpacity onPress={() => setCurrentMonth(m => subMonths(m, 1))} style={styles.navBtn}>
              <Text style={styles.navArrow}>‹</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setCurrentMonth(m => addMonths(m, 1))} style={styles.navBtn}>
              <Text style={styles.navArrow}>›</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* Mini calendar */}
        <View style={styles.calCard}>
          {/* Day headers */}
          <View style={styles.calRow}>
            {DAYS_OF_WEEK.map((d, i) => (
              <Text key={i} style={styles.calDayHeader}>{d}</Text>
            ))}
          </View>

          {/* Day grid */}
          {Array.from({ length: Math.ceil(cells.length / 7) }).map((_, weekIdx) => (
            <View key={weekIdx} style={styles.calRow}>
              {cells.slice(weekIdx * 7, weekIdx * 7 + 7).map((date, dayIdx) => {
                if (!date) return <View key={dayIdx} style={styles.calCell} />;
                const dots    = getDots(date);
                const today   = isToday(date);
                const selected = isSameDay(date, selectedDate);
                return (
                  <TouchableOpacity
                    key={dayIdx}
                    style={styles.calCell}
                    onPress={() => setSelectedDate(date)}
                    activeOpacity={0.7}
                  >
                    <View style={[
                      styles.calDayNum,
                      today    && styles.calDayToday,
                      selected && !today && styles.calDaySelected,
                    ]}>
                      <Text style={[
                        styles.calDayText,
                        today    && styles.calDayTextToday,
                        selected && !today && styles.calDayTextSelected,
                      ]}>
                        {format(date, 'd')}
                      </Text>
                    </View>
                    {dots.length > 0 && (
                      <View style={styles.dotsRow}>
                        {dots.slice(0, 3).map((type, di) => (
                          <View key={di} style={[styles.dot, { backgroundColor: DOT_COLORS[type] }]} />
                        ))}
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          ))}

          {/* Legend */}
          <View style={styles.legend}>
            {(['shared', 'mine', 'partner'] as const).map(type => (
              <View key={type} style={styles.legendItem}>
                <View style={[styles.dot, { backgroundColor: DOT_COLORS[type] }]} />
                <Text style={styles.legendText}>{type}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Selected day events */}
        <Text style={styles.sectionLabel}>
          {isToday(selectedDate) ? 'today' : format(selectedDate, 'EEE MMM d')}
        </Text>

        {DEMO_EVENTS.map(event => (
          <View key={event.id} style={styles.eventCard}>
            <View style={[
              styles.eventAccent,
              { backgroundColor: event.type === 'shared' ? Colors.accent : Colors.accent2 },
            ]} />
            <View style={styles.eventBody}>
              <Text style={styles.eventTitle}>{event.emoji}  {event.title}</Text>
              <Text style={styles.eventTime}>{event.time} · {event.type}</Text>
            </View>
          </View>
        ))}

        {/* Connect calendar CTA */}
        {!calGranted && (
          <TouchableOpacity
            style={styles.calCta}
            onPress={() => requestCalendarPermissions().then(setCalGranted)}
            activeOpacity={0.8}
          >
            <Text style={styles.calCtaEmoji}>📅</Text>
            <View>
              <Text style={styles.calCtaTitle}>connect Google Calendar</Text>
              <Text style={styles.calCtaSub}>sync reminders to your calendar</Text>
            </View>
          </TouchableOpacity>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>
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
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  title:     { fontFamily: Typography.fonts.display, fontSize: Typography.sizes.lg, color: Colors.text1 },
  sub:       { fontFamily: Typography.fonts.body, fontSize: Typography.sizes.xs, color: Colors.text2, marginTop: 2 },
  navRow:    { flexDirection: 'row', gap: Spacing.xs },
  navBtn:    { padding: Spacing.sm },
  navArrow:  { fontFamily: Typography.fonts.display, fontSize: 24, color: Colors.text2 },

  scroll:        { flex: 1 },
  scrollContent: { padding: Spacing.lg },

  calCard: {
    backgroundColor: Colors.bg1,
    borderRadius:    Radii.lg,
    borderWidth:     0.5,
    borderColor:     Colors.border,
    padding:         Spacing.md,
    marginBottom:    Spacing.lg,
  },
  calRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 2 },
  calDayHeader: {
    width: 28, textAlign: 'center',
    fontFamily: Typography.fonts.bodyMed,
    fontSize: Typography.sizes.xs,
    color: Colors.text3,
    paddingVertical: 3,
  },
  calCell:  { width: 28, alignItems: 'center', paddingVertical: 2 },
  calDayNum: { width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  calDayToday:    { backgroundColor: Colors.bg0, borderWidth: 1.5, borderColor: Colors.accent },
  calDaySelected: { backgroundColor: Colors.accent },
  calDayText:     { fontFamily: Typography.fonts.bodyMed, fontSize: 10, color: Colors.text2 },
  calDayTextToday:    { color: Colors.accent },
  calDayTextSelected: { color: Colors.bg0 },

  dotsRow: { flexDirection: 'row', gap: 2, marginTop: 1 },
  dot:     { width: 4, height: 4, borderRadius: 2 },

  legend:     { flexDirection: 'row', gap: Spacing.lg, marginTop: Spacing.md, justifyContent: 'center' },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  legendText: { fontFamily: Typography.fonts.body, fontSize: 9, color: Colors.text2 },

  sectionLabel: {
    fontFamily: Typography.fonts.bodyMed, fontSize: Typography.sizes.xs,
    color: Colors.text3, textTransform: 'uppercase', letterSpacing: 0.6,
    marginBottom: Spacing.sm,
  },

  eventCard: {
    flexDirection: 'row', backgroundColor: Colors.bg1,
    borderRadius: Radii.md, borderWidth: 0.5, borderColor: Colors.border,
    marginBottom: Spacing.sm, overflow: 'hidden',
  },
  eventAccent: { width: 3, backgroundColor: Colors.accent },
  eventBody:   { flex: 1, padding: Spacing.md },
  eventTitle:  { fontFamily: Typography.fonts.bodyMed, fontSize: Typography.sizes.sm, color: Colors.text1 },
  eventTime:   { fontFamily: Typography.fonts.body, fontSize: Typography.sizes.xs, color: Colors.text2, marginTop: 2 },

  calCta: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.md,
    backgroundColor: Colors.bg1,
    borderRadius: Radii.md, borderWidth: 0.5,
    borderColor: Colors.border2,
    padding: Spacing.md, marginTop: Spacing.lg,
  },
  calCtaEmoji: { fontSize: 28 },
  calCtaTitle: { fontFamily: Typography.fonts.bodyBold, fontSize: Typography.sizes.sm, color: Colors.accent },
  calCtaSub:   { fontFamily: Typography.fonts.body, fontSize: Typography.sizes.xs, color: Colors.text2, marginTop: 2 },
});
