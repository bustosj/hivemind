// ─────────────────────────────────────────
//  Checklist Store — Local AsyncStorage
//  Fully offline, no Firebase needed
// ─────────────────────────────────────────

import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Checklist, ChecklistItem } from '../types';

const STORAGE_KEY = 'hivemind_checklists';

interface ChecklistStore {
  checklists: Checklist[];
  loading:    boolean;
  loadChecklists:  () => Promise<void>;
  createChecklist: (data: CreateChecklistInput, userId: string) => Promise<string>;
  addItem:         (checklistId: string, text: string) => Promise<void>;
  toggleItem:      (checklistId: string, itemId: string, userId: string) => Promise<void>;
  deleteItem:      (checklistId: string, itemId: string) => Promise<void>;
  deleteChecklist: (checklistId: string) => Promise<void>;
}

interface CreateChecklistInput {
  title:   string;
  emoji:   string;
  items:   string[];
  isShared: boolean;
}

async function saveLists(lists: Checklist[]) {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(lists));
}

export const useChecklistStore = create<ChecklistStore>((set, get) => ({
  checklists: [],
  loading:    false,

  loadChecklists: async () => {
    set({ loading: true });
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      const lists  = stored ? JSON.parse(stored) as Checklist[] : [];
      set({ checklists: lists, loading: false });
    } catch {
      set({ loading: false });
    }
  },

  createChecklist: async (data, userId) => {
    const items: ChecklistItem[] = data.items
      .filter(t => t.trim())
      .map((text, i) => ({
        id:      `item-${Date.now()}-${i}`,
        text,
        checked: false,
      }));

    const newList: Checklist = {
      id:             `list-${Date.now()}`,
      type:           'checklist',
      title:          data.title,
      emoji:          data.emoji,
      owner:          userId,
      isShared:       data.isShared,
      syncToCalendar: false,
      notifyPartner:  false,
      completed:      false,
      items,
      createdAt:      new Date(),
      updatedAt:      new Date(),
    };

    const lists = [...get().checklists, newList];
    await saveLists(lists);
    set({ checklists: lists });
    return newList.id;
  },

  addItem: async (checklistId, text) => {
    const newItem: ChecklistItem = {
      id:      `item-${Date.now()}`,
      text,
      checked: false,
    };
    const lists = get().checklists.map(l =>
      l.id === checklistId
        ? { ...l, items: [...l.items, newItem], updatedAt: new Date() }
        : l,
    );
    await saveLists(lists);
    set({ checklists: lists });
  },

  toggleItem: async (checklistId, itemId, userId) => {
    const lists = get().checklists.map(l => {
      if (l.id !== checklistId) return l;
      const items = l.items.map(item => {
        if (item.id !== itemId) return item;
        return {
          ...item,
          checked:   !item.checked,
          checkedBy: !item.checked ? userId : undefined,
          checkedAt: !item.checked ? new Date() : undefined,
        };
      });
      return { ...l, items, completed: items.every(i => i.checked), updatedAt: new Date() };
    });
    await saveLists(lists);
    set({ checklists: lists });
  },

  deleteItem: async (checklistId, itemId) => {
    const lists = get().checklists.map(l =>
      l.id === checklistId
        ? { ...l, items: l.items.filter(i => i.id !== itemId) }
        : l,
    );
    await saveLists(lists);
    set({ checklists: lists });
  },

  deleteChecklist: async (checklistId) => {
    const lists = get().checklists.filter(l => l.id !== checklistId);
    await saveLists(lists);
    set({ checklists: lists });
  },
}));
