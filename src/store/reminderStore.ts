// ─────────────────────────────────────────
//  Reminder Store — Local AsyncStorage
//  Fully offline, no Firebase needed
// ─────────────────────────────────────────

import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Reminder, ReminderType } from '../types';

const STORAGE_KEY = 'hivemind_reminders';

interface ReminderStore {
  reminders: Reminder[];
  loading:   boolean;
  loadReminders:   () => Promise<void>;
  createReminder:  (data: CreateReminderInput, userId: string) => Promise<string>;
  completeReminder: (id: string) => Promise<void>;
  deleteReminder:  (id: string) => Promise<void>;
}

interface CreateReminderInput {
  type:          ReminderType;
  title:         string;
  emoji:         string;
  datetime?:     Date;
  location?:     string;
  notes?:        string;
  isShared:      boolean;
  syncToCalendar: boolean;
  notifyPartner: boolean;
}

async function saveReminders(reminders: Reminder[]) {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(reminders));
}

export const useReminderStore = create<ReminderStore>((set, get) => ({
  reminders: [],
  loading:   false,

  loadReminders: async () => {
    set({ loading: true });
    try {
      const stored    = await AsyncStorage.getItem(STORAGE_KEY);
      const reminders = stored ? JSON.parse(stored) as Reminder[] : [];
      set({ reminders, loading: false });
    } catch {
      set({ loading: false });
    }
  },

  createReminder: async (data, userId) => {
    const newReminder: Reminder = {
      id:             `reminder-${Date.now()}`,
      type:           data.type,
      title:          data.title,
      emoji:          data.emoji,
      datetime:       data.datetime,
      location:       data.location,
      notes:          data.notes,
      owner:          userId,
      isShared:       data.isShared,
      syncToCalendar: data.syncToCalendar,
      notifyPartner:  data.notifyPartner,
      completed:      false,
      createdAt:      new Date(),
      updatedAt:      new Date(),
    };
    const reminders = [...get().reminders, newReminder];
    await saveReminders(reminders);
    set({ reminders });
    return newReminder.id;
  },

  completeReminder: async (id) => {
    const reminders = get().reminders.map(r =>
      r.id === id ? { ...r, completed: true, updatedAt: new Date() } : r,
    );
    await saveReminders(reminders);
    set({ reminders });
  },

  deleteReminder: async (id) => {
    const reminders = get().reminders.filter(r => r.id !== id);
    await saveReminders(reminders);
    set({ reminders });
  },
}));
