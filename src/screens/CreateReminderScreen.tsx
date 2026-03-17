// ─────────────────────────────────────────
//  Create Reminder Screen
//  Supports: ⏰ Reminder · ☑️ Checklist · 📅 Event
// ─────────────────────────────────────────

import React, { useState } from 'react';
import {
  View, Text, TextInput, ScrollView, StyleSheet,
  TouchableOpacity, Switch, Alert, Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { router } from 'expo-router';
import { format } from 'date-fns';
import { useReminderStore } from '../store/reminderStore';
import { useChecklistStore } from '../store/checklistStore';
import { useAuthStore } from '../store/authStore';
import { Colors, Typography, Spacing, Radii } from '../theme';
import { ReminderType } from '../types';

const EMOJI_OPTIONS = ['⏰','🏠','💊','🎂','✈️','🐝','💪','🛒','📚','🎬','🧘','🌿','💍','🎵','🎮'];

type TabType = 'reminder' | 'checklist' | 'event';

const TABS: { key: TabType; label: string; emoji: string }[] = [
  { key: 'reminder',  label: 'Reminder',  emoji: '⏰' },
  { key: 'checklist', label: 'Checklist', emoji: '☑️' },
  { key: 'event',     label: 'Event',     emoji: '📅' },
];

export default function CreateReminderScreen() {
  const { createReminder } = useReminderStore();
  const { createChecklist } = useChecklistStore();
  const currentUser = useAuthStore(s => s.currentUser);
  const partner     = useAuthStore(s => s.partner);

  const [tab,           setTab]           = useState<TabType>('reminder');
  const [title,         setTitle]         = useState('');
  const [emoji,         setEmoji]         = useState('⏰');
  const [datetime,      setDatetime]      = useState<Date | null>(null);
  const [showPicker,    setShowPicker]    = useState(false);
  const [pickerMode,    setPickerMode]    = useState<'date' | 'time'>('date');
  const [location,      setLocation]      = useState('');
  const [notes,         setNotes]         = useState('');
  const [checkItems,    setCheckItems]    = useState<string[]>(['']);
  const [isShared,      setIsShared]      = useState(!!partner);
  const [syncCal,       setSyncCal]       = useState(true);
  const [notifyPartner, setNotifyPartner] = useState(true);
  const [saving,        setSaving]        = useState(false);

  const CURRENT_USER_ID = currentUser?.id ?? '';
  const PARTNER_USER_ID = partner?.id;
  const partnerName     = partner?.name ?? 'Partner';

  // ── Checklist item helpers ──
  const updateItem = (i: number, val: string) => {
    const updated = [...checkItems];
    updated[i] = val;
    // Auto-add new row when last item is filled
    if (i === checkItems.length - 1 && val.trim()) updated.push('');
    setCheckItems(updated);
  };

  const removeItem = (i: number) => {
    if (checkItems.length === 1) return;
    setCheckItems(checkItems.filter((_, idx) => idx !== i));
  };

  // ── Date/time picker ──
  const openDatePicker = () => {
    setPickerMode('date');
    setShowPicker(true);
  };

  const handleDateChange = (_: any, selected?: Date) => {
    if (!selected) { setShowPicker(false); return; }
    if (pickerMode === 'date') {
      setDatetime(selected);
      setPickerMode('time');
    } else {
      setDatetime(prev => {
        const base = prev ?? new Date();
        base.setHours(selected.getHours(), selected.getMinutes());
        return new Date(base);
      });
      setShowPicker(false);
    }
  };

  // ── Save ──
  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert('Missing title', 'Give your reminder a name!');
      return;
    }
    if (!CURRENT_USER_ID) return;

    setSaving(true);
    try {
      if (tab === 'checklist') {
        const items = checkItems.filter(i => i.trim());
        if (items.length === 0) {
          Alert.alert('Empty list', 'Add at least one item!');
          setSaving(false);
          return;
        }
        await createChecklist({
          title:         title.trim(),
          emoji,
          items,
          isShared,
          sharedWith:    isShared ? PARTNER_USER_ID : undefined,
          syncToCalendar: false,
          notifyPartner,
        }, CURRENT_USER_ID);
      } else {
        await createReminder({
          type:          tab,
          title:         title.trim(),
          emoji,
          datetime:      datetime ?? undefined,
          location:      location.trim() || undefined,
          notes:         notes.trim() || undefined,
          isShared,
          sharedWith:    isShared ? PARTNER_USER_ID : undefined,
          syncToCalendar: syncCal && !!datetime,
          notifyPartner,
        }, CURRENT_USER_ID);
      }
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
        <Text style={styles.headerTitle}>new reminder 🐝</Text>
      </View>

      {/* Type tabs */}
      <View style={styles.typeRow}>
        {TABS.map(t => (
          <TouchableOpacity
            key={t.key}
            style={[styles.typeTab, tab === t.key && styles.typeTabActive]}
            onPress={() => setTab(t.key)}
          >
            <Text style={styles.typeTabEmoji}>{t.emoji}</Text>
            <Text style={[styles.typeTabLabel, tab === t.key && styles.typeTabLabelActive]}>
              {t.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* Title */}
        <TextInput
          style={styles.titleInput}
          placeholder={
            tab === 'reminder'  ? 'e.g. Doctor appointment'  :
            tab === 'checklist' ? 'e.g. Grocery run'          :
                                  'e.g. Anniversary dinner'
          }
          placeholderTextColor={Colors.text3}
          value={title}
          onChangeText={setTitle}
          autoFocus
        />

        {/* Emoji row */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.emojiRow}>
          {EMOJI_OPTIONS.map(e => (
            <TouchableOpacity
              key={e}
              onPress={() => setEmoji(e)}
              style={[styles.emojiBtn, emoji === e && styles.emojiBtnActive]}
            >
              <Text style={{ fontSize: 22 }}>{e}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* ── REMINDER / EVENT fields ── */}
        {tab !== 'checklist' && (
          <>
            {/* Date & time */}
            <Text style={styles.fieldLabel}>date & time</Text>
            <TouchableOpacity style={styles.fieldRow} onPress={openDatePicker}>
              <Text style={styles.fieldRowEmoji}>📅</Text>
              <Text style={[styles.fieldRowText, !datetime && styles.fieldRowPlaceholder]}>
                {datetime ? format(datetime, 'EEE, MMM d · h:mm a') : 'set a date & time…'}
              </Text>
            </TouchableOpacity>

            {showPicker && (
              <DateTimePicker
                value={datetime ?? new Date()}
                mode={pickerMode}
                is24Hour={false}
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={handleDateChange}
                themeVariant="dark"
              />
            )}

            {/* Location */}
            <Text style={styles.fieldLabel}>location (optional)</Text>
            <View style={styles.fieldRow}>
              <Text style={styles.fieldRowEmoji}>📍</Text>
              <TextInput
                style={styles.fieldInput}
                placeholder="add a place…"
                placeholderTextColor={Colors.text3}
                value={location}
                onChangeText={setLocation}
              />
            </View>

            {/* Notes */}
            <Text style={styles.fieldLabel}>notes (optional)</Text>
            <TextInput
              style={[styles.fieldRow, styles.notesInput]}
              placeholder="add a note…"
              placeholderTextColor={Colors.text3}
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={3}
            />
          </>
        )}

        {/* ── CHECKLIST fields ── */}
        {tab === 'checklist' && (
          <>
            <Text style={styles.fieldLabel}>list items</Text>
            <View style={styles.checklistCard}>
              {checkItems.map((item, i) => (
                <View key={i} style={[styles.checkItemRow, i < checkItems.length - 1 && styles.checkItemBorder]}>
                  <View style={styles.checkboxEmpty} />
                  <TextInput
                    style={styles.checkItemInput}
                    placeholder={`item ${i + 1}…`}
                    placeholderTextColor={Colors.text3}
                    value={item}
                    onChangeText={v => updateItem(i, v)}
                    returnKeyType="next"
                  />
                  {checkItems.length > 1 && (
                    <TouchableOpacity onPress={() => removeItem(i)} style={styles.removeBtn}>
                      <Text style={styles.removeBtnText}>×</Text>
                    </TouchableOpacity>
                  )}
                </View>
              ))}
            </View>
          </>
        )}

        {/* ── SHARED settings (all types) ── */}
        <View style={styles.settingsCard}>

          {/* Share with partner */}
          {partner && (
            <View style={[styles.settingRow, styles.settingBorder]}>
              <View style={styles.settingLeft}>
                <Text style={styles.settingLabel}>
                  🐝 share with {partnerName}
                </Text>
                <Text style={styles.settingSub}>
                  {tab === 'checklist'
                    ? 'live sync when items are checked'
                    : "add to partner's reminders"}
                </Text>
              </View>
              <Switch
                value={isShared}
                onValueChange={setIsShared}
                thumbColor={Colors.bg0}
                trackColor={{ false: Colors.bg3, true: Colors.accent }}
              />
            </View>
          )}

          {/* Sync to calendar (reminder + event only) */}
          {tab !== 'checklist' && (
            <View style={[styles.settingRow, styles.settingBorder]}>
              <View style={styles.settingLeft}>
                <Text style={styles.settingLabel}>🗓 sync to Google Calendar</Text>
                <Text style={styles.settingSub}>add to both calendars</Text>
              </View>
              <Switch
                value={syncCal}
                onValueChange={setSyncCal}
                thumbColor={Colors.bg0}
                trackColor={{ false: Colors.bg3, true: Colors.accent }}
              />
            </View>
          )}

          {/* Notify partner */}
          {partner && isShared && (
            <View style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <Text style={styles.settingLabel}>
                  🔔 buzz {partnerName}
                  {tab === 'checklist' ? ' when I check off' : ''}
                </Text>
                <Text style={styles.settingSub}>send a push notification</Text>
              </View>
              <Switch
                value={notifyPartner}
                onValueChange={setNotifyPartner}
                thumbColor={Colors.bg0}
                trackColor={{ false: Colors.bg3, true: Colors.accent }}
              />
            </View>
          )}
        </View>

        {/* Reminder timing chips */}
        {tab !== 'checklist' && datetime && (
          <>
            <Text style={styles.fieldLabel}>remind me</Text>
            <View style={styles.chipRow}>
              {['15 min', '30 min', '1 hour', '1 day'].map((label, i) => (
                <TouchableOpacity
                  key={label}
                  style={[styles.chip, i === 1 && styles.chipActive]}
                >
                  <Text style={[styles.chipText, i === 1 && styles.chipTextActive]}>{label} before</Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}

        {/* Save */}
        <TouchableOpacity
          style={[styles.saveBtn, saving && { opacity: 0.6 }]}
          onPress={handleSave}
          disabled={saving}
          activeOpacity={0.85}
        >
          <Text style={styles.saveBtnText}>
            {saving ? 'saving…' : `save & share 🍯`}
          </Text>
        </TouchableOpacity>

        <View style={{ height: 60 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container:  { flex: 1, backgroundColor: Colors.bg0 },

  header: {
    flexDirection:     'row',
    alignItems:        'center',
    gap:               Spacing.md,
    padding:           Spacing.lg,
    paddingTop:        Spacing.xl,
    backgroundColor:   Colors.bg1,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.border,
  },
  backBtn:     { padding: 4 },
  backArrow:   { fontFamily: Typography.fonts.display, fontSize: 28, color: Colors.text2, lineHeight: 28 },
  headerTitle: { fontFamily: Typography.fonts.display, fontSize: Typography.sizes.md, color: Colors.text1 },

  // Type tabs
  typeRow: {
    flexDirection:   'row',
    backgroundColor: Colors.bg1,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.border,
    paddingHorizontal: Spacing.lg,
    paddingBottom:   Spacing.md,
    gap:             Spacing.sm,
  },
  typeTab: {
    flex:           1,
    flexDirection:  'row',
    alignItems:     'center',
    justifyContent: 'center',
    gap:            6,
    paddingVertical:  Spacing.sm,
    borderRadius:   Radii.md,
    backgroundColor: Colors.bg2,
    borderWidth:    0.5,
    borderColor:    Colors.border,
  },
  typeTabActive:      { backgroundColor: Colors.accent, borderColor: Colors.accent },
  typeTabEmoji:       { fontSize: 14 },
  typeTabLabel:       { fontFamily: Typography.fonts.bodyMed, fontSize: Typography.sizes.xs, color: Colors.text2 },
  typeTabLabelActive: { color: Colors.bg0 },

  scroll:        { flex: 1 },
  scrollContent: { padding: Spacing.lg },

  titleInput: {
    fontFamily:      Typography.fonts.displayMed,
    fontSize:        Typography.sizes.lg,
    color:           Colors.text1,
    paddingVertical: Spacing.md,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.border2,
    marginBottom:    Spacing.md,
  },

  emojiRow: {
    marginHorizontal: -Spacing.lg,
    paddingHorizontal: Spacing.lg,
    marginBottom:     Spacing.lg,
  },
  emojiBtn:       { padding: Spacing.sm, borderRadius: Radii.sm, marginRight: Spacing.xs },
  emojiBtnActive: { backgroundColor: Colors.accentAlpha(0.15), borderWidth: 1, borderColor: Colors.border2 },

  fieldLabel: {
    fontFamily:    Typography.fonts.bodyMed,
    fontSize:      Typography.sizes.xs,
    color:         Colors.text3,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom:  Spacing.sm,
    marginTop:     Spacing.lg,
  },
  fieldRow: {
    flexDirection:   'row',
    alignItems:      'center',
    gap:             Spacing.sm,
    backgroundColor: Colors.bg1,
    borderRadius:    Radii.md,
    borderWidth:     0.5,
    borderColor:     Colors.border,
    padding:         Spacing.md,
    marginBottom:    Spacing.sm,
  },
  fieldRowEmoji:       { fontSize: 16 },
  fieldRowText:        { fontFamily: Typography.fonts.body, fontSize: Typography.sizes.sm, color: Colors.text1, flex: 1 },
  fieldRowPlaceholder: { color: Colors.text3 },
  fieldInput: {
    flex: 1, fontFamily: Typography.fonts.body,
    fontSize: Typography.sizes.sm, color: Colors.text1,
  },
  notesInput: { alignItems: 'flex-start', minHeight: 80 },

  // Checklist
  checklistCard: {
    backgroundColor: Colors.bg1,
    borderRadius:    Radii.md,
    borderWidth:     0.5,
    borderColor:     Colors.border,
    overflow:        'hidden',
  },
  checkItemRow: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           Spacing.sm,
    padding:       Spacing.md,
  },
  checkItemBorder: { borderBottomWidth: 0.5, borderBottomColor: Colors.border },
  checkboxEmpty: {
    width: 16, height: 16, borderRadius: 5,
    borderWidth: 1.5, borderColor: Colors.border2,
    backgroundColor: Colors.bg2,
  },
  checkItemInput: {
    flex: 1, fontFamily: Typography.fonts.body,
    fontSize: Typography.sizes.sm, color: Colors.text1,
  },
  removeBtn:     { padding: 4 },
  removeBtnText: { fontFamily: Typography.fonts.bodyBold, fontSize: 18, color: Colors.text3, lineHeight: 20 },

  // Settings
  settingsCard: {
    backgroundColor: Colors.bg1,
    borderRadius:    Radii.md,
    borderWidth:     0.5,
    borderColor:     Colors.border,
    marginTop:       Spacing.lg,
    overflow:        'hidden',
  },
  settingRow: { flexDirection: 'row', alignItems: 'center', padding: Spacing.md },
  settingBorder: { borderBottomWidth: 0.5, borderBottomColor: Colors.border },
  settingLeft:  { flex: 1, marginRight: Spacing.md },
  settingLabel: { fontFamily: Typography.fonts.bodyMed, fontSize: Typography.sizes.sm, color: Colors.text1 },
  settingSub:   { fontFamily: Typography.fonts.body, fontSize: Typography.sizes.xs, color: Colors.text2, marginTop: 2 },

  // Chips
  chipRow: { flexDirection: 'row', gap: Spacing.sm, flexWrap: 'wrap', marginBottom: Spacing.sm },
  chip: {
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs,
    borderRadius: Radii.full, backgroundColor: Colors.bg2,
    borderWidth: 0.5, borderColor: Colors.border,
  },
  chipActive:     { backgroundColor: Colors.accent, borderColor: Colors.accent },
  chipText:       { fontFamily: Typography.fonts.bodyMed, fontSize: Typography.sizes.xs, color: Colors.text2 },
  chipTextActive: { color: Colors.bg0 },

  saveBtn: {
    backgroundColor: Colors.accent,
    borderRadius:    Radii.lg,
    padding:         Spacing.lg,
    alignItems:      'center',
    marginTop:       Spacing.xl,
    shadowColor:     Colors.accent,
    shadowOffset:    { width: 0, height: 4 },
    shadowOpacity:   0.35,
    shadowRadius:    10,
    elevation:       6,
  },
  saveBtnText: { fontFamily: Typography.fonts.display, fontSize: Typography.sizes.base, color: Colors.bg0 },
});
