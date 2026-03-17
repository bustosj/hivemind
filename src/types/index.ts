// ─────────────────────────────────────────
//  HiveMind — Data Types
// ─────────────────────────────────────────

export type UserID = string;

export interface User {
  id: UserID;
  name: string;
  email: string;
  avatarColor: 'A' | 'B'; // which partner slot
  partnerId?: UserID;
  partnerLinked: boolean;
}

// ── Reminders ────────────────────────────

export type ReminderType = 'reminder' | 'checklist' | 'event';
export type ReminderOwner = 'mine' | 'partner' | 'shared';

export interface Reminder {
  id: string;
  type: ReminderType;
  title: string;
  emoji: string;
  datetime?: Date;
  location?: string;
  notes?: string;
  owner: UserID;
  sharedWith?: UserID;
  isShared: boolean;
  syncToCalendar: boolean;
  calendarEventId?: string;
  notifyPartner: boolean;
  completed: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// ── Checklists ───────────────────────────

export interface ChecklistItem {
  id: string;
  text: string;
  checked: boolean;
  checkedBy?: UserID;
  checkedAt?: Date;
}

export interface Checklist extends Reminder {
  type: 'checklist';
  items: ChecklistItem[];
}

// ── Punch Cards / Streaks ────────────────

export type PunchCardWhoCanPunch = 'both' | 'mine' | 'partner';

export interface Punch {
  id: string;
  punchedBy: UserID;
  punchedAt: Date;
  note?: string;        // optional "Jamie cooked pasta 🍝"
}

export interface PunchCard {
  id: string;
  title: string;
  emoji: string;
  reward: string;        // "🍽️ go out for a fancy dinner"
  rewardEmoji: string;
  targetCount: number;   // 5 | 7 | 10 | 14 | 30
  punches: Punch[];
  whoCanPunch: PunchCardWhoCanPunch;
  owner: UserID;
  sharedWith?: UserID;
  isShared: boolean;
  notifyOnPunch: boolean;
  completed: boolean;
  rewardRedeemed: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Derived helpers
export const getPunchCount = (card: PunchCard) => card.punches.length;
export const isCardComplete = (card: PunchCard) =>
  card.punches.length >= card.targetCount;
export const getPunchesLeft = (card: PunchCard) =>
  Math.max(0, card.targetCount - card.punches.length);
export const getProgressPercent = (card: PunchCard) =>
  Math.min(100, Math.round((card.punches.length / card.targetCount) * 100));
