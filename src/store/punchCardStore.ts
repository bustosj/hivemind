// ─────────────────────────────────────────
//  Punch Card Store — Local AsyncStorage
//  Fully offline, no Firebase needed
// ─────────────────────────────────────────

import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PunchCard, Punch, PunchCardWhoCanPunch } from '../types';

const STORAGE_KEY = 'hivemind_punchcards';

interface PunchCardStore {
  cards:   PunchCard[];
  loading: boolean;
  loadCards:   () => Promise<void>;
  createCard:  (data: CreateCardInput, userId: string) => Promise<string>;
  punchCard:   (cardId: string, userId: string, note?: string) => Promise<void>;
  redeemReward: (cardId: string) => Promise<void>;
  deleteCard:  (cardId: string) => Promise<void>;
}

interface CreateCardInput {
  title:         string;
  emoji:         string;
  reward:        string;
  rewardEmoji:   string;
  targetCount:   number;
  whoCanPunch:   PunchCardWhoCanPunch;
  isShared:      boolean;
  notifyOnPunch: boolean;
}

async function saveCards(cards: PunchCard[]) {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(cards));
}

export const usePunchCardStore = create<PunchCardStore>((set, get) => ({
  cards:   [],
  loading: false,

  loadCards: async () => {
    set({ loading: true });
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      const cards  = stored ? JSON.parse(stored) as PunchCard[] : [];
      set({ cards, loading: false });
    } catch {
      set({ loading: false });
    }
  },

  createCard: async (data, userId) => {
    const newCard: PunchCard = {
      id:             `card-${Date.now()}`,
      title:          data.title,
      emoji:          data.emoji,
      reward:         data.reward,
      rewardEmoji:    data.rewardEmoji,
      targetCount:    data.targetCount,
      whoCanPunch:    data.whoCanPunch,
      owner:          userId,
      isShared:       data.isShared,
      notifyOnPunch:  data.notifyOnPunch,
      punches:        [],
      completed:      false,
      rewardRedeemed: false,
      createdAt:      new Date(),
      updatedAt:      new Date(),
    };
    const cards = [...get().cards, newCard];
    await saveCards(cards);
    set({ cards });
    return newCard.id;
  },

  punchCard: async (cardId, userId, note) => {
    const cards = get().cards.map(card => {
      if (card.id !== cardId || card.completed) return card;
      const newPunch: Punch = {
        id:        `punch-${Date.now()}`,
        punchedBy: userId,
        punchedAt: new Date(),
        note,
      };
      const punches   = [...card.punches, newPunch];
      const completed = punches.length >= card.targetCount;
      return { ...card, punches, completed, updatedAt: new Date() };
    });
    await saveCards(cards);
    set({ cards });
  },

  redeemReward: async (cardId) => {
    const cards = get().cards.map(c =>
      c.id === cardId ? { ...c, rewardRedeemed: true, updatedAt: new Date() } : c,
    );
    await saveCards(cards);
    set({ cards });
  },

  deleteCard: async (cardId) => {
    const cards = get().cards.filter(c => c.id !== cardId);
    await saveCards(cards);
    set({ cards });
  },
}));
