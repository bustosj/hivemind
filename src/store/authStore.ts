// ─────────────────────────────────────────
//  Auth Store — Simple Local Name Entry
//  No Google, no Firebase Auth
//  Uses AsyncStorage to persist name
// ─────────────────────────────────────────

import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type AuthStatus = 'loading' | 'unauthenticated' | 'needs-partner' | 'authenticated';

export interface PartnerInfo {
  id:           string;
  name:         string;
  avatarLetter: string;
}

export interface User {
  id:            string;
  name:          string;
  email:         string;
  avatarColor:   'A' | 'B';
  partnerLinked: boolean;
  partnerId?:    string;
}

interface AuthStore {
  status:      AuthStatus;
  currentUser: User | null;
  partner:     PartnerInfo | null;

  initialize:    () => Promise<void>;
  setName:       (name: string) => Promise<void>;
  setPartner:    (name: string) => Promise<void>;
  skipPartner:   () => Promise<void>;
  signOut:       () => Promise<void>;
  unlinkPartner: () => Promise<void>;
}

const USER_KEY    = 'hivemind_user';
const PARTNER_KEY = 'hivemind_partner';

export const useAuthStore = create<AuthStore>((set, get) => ({
  status:      'loading',
  currentUser: null,
  partner:     null,

  initialize: async () => {
    try {
      const stored = await AsyncStorage.getItem(USER_KEY);
      if (stored) {
        const user = JSON.parse(stored) as User;
        const partnerStored = await AsyncStorage.getItem(PARTNER_KEY);
        const partner = partnerStored ? JSON.parse(partnerStored) as PartnerInfo : null;
        set({ currentUser: user, partner, status: 'authenticated' });
      } else {
        set({ status: 'unauthenticated' });
      }
    } catch {
      set({ status: 'unauthenticated' });
    }
  },

  setName: async (name: string) => {
    try {
      const user: User = {
        id:            `user-${Date.now()}`,
        name:          name.trim(),
        email:         '',
        avatarColor:   'A',
        partnerLinked: false,
      };
      await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
      set({ currentUser: user, status: 'needs-partner' });
    } catch (e) {
      console.error('setName error:', e);
    }
  },

  setPartner: async (name: string) => {
    try {
      const partner: PartnerInfo = {
        id:           `partner-${Date.now()}`,
        name:         name.trim(),
        avatarLetter: name.trim()[0]?.toUpperCase() ?? 'B',
      };
      await AsyncStorage.setItem(PARTNER_KEY, JSON.stringify(partner));
      const user = get().currentUser;
      if (user) {
        const updated = { ...user, partnerLinked: true, partnerId: partner.id };
        await AsyncStorage.setItem(USER_KEY, JSON.stringify(updated));
        set({ partner, currentUser: updated, status: 'authenticated' });
      } else {
        set({ partner, status: 'authenticated' });
      }
    } catch (e) {
      console.error('setPartner error:', e);
      // Still navigate even if save fails
      set({ status: 'authenticated' });
    }
  },

  skipPartner: async () => {
    try {
      const user = get().currentUser;
      if (user) {
        await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
      }
    } catch (e) {
      console.error('skipPartner error:', e);
    } finally {
      set({ status: 'authenticated' });
    }
  },

  signOut: async () => {
    try {
      await AsyncStorage.removeItem(USER_KEY);
      await AsyncStorage.removeItem(PARTNER_KEY);
    } catch (e) {
      console.error('signOut error:', e);
    } finally {
      set({ status: 'unauthenticated', currentUser: null, partner: null });
    }
  },

  unlinkPartner: async () => {
    try {
      await AsyncStorage.removeItem(PARTNER_KEY);
      const user = get().currentUser;
      if (user) {
        const updated = { ...user, partnerLinked: false, partnerId: undefined };
        await AsyncStorage.setItem(USER_KEY, JSON.stringify(updated));
        set({ partner: null, currentUser: updated });
      }
    } catch (e) {
      console.error('unlinkPartner error:', e);
      set({ partner: null });
    }
  },
}));
