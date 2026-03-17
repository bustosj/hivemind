// ─────────────────────────────────────────
//  Google Calendar Integration
//  Uses expo-calendar to read/write events
// ─────────────────────────────────────────

import * as Calendar from 'expo-calendar';
import { Platform } from 'react-native';
import { Reminder } from '../types';

// ── Request calendar permissions ──────────

export async function requestCalendarPermissions(): Promise<boolean> {
  const { status } = await Calendar.requestCalendarPermissionsAsync();
  if (status !== 'granted') return false;

  if (Platform.OS === 'ios') {
    const { status: reminderStatus } = await Calendar.requestRemindersPermissionsAsync();
    return reminderStatus === 'granted';
  }

  return true;
}

// ── Get or create HiveMind calendar ──────

export async function getOrCreateHiveMindCalendar(): Promise<string> {
  const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
  const existing  = calendars.find(c => c.title === 'HiveMind 🐝');

  if (existing) return existing.id;

  // Create a new calendar
  const defaultCalendar = calendars.find(c =>
    Platform.OS === 'ios' ? c.source.type === 'local' : c.isPrimary,
  );

  const calendarId = await Calendar.createCalendarAsync({
    title:            'HiveMind 🐝',
    color:            '#f5c842',
    entityType:       Calendar.EntityTypes.EVENT,
    sourceId:         defaultCalendar?.source.id,
    source: {
      isLocalAccount: true,
      name:           'HiveMind',
      type:           Calendar.CalSourceTypes.LOCAL,
    },
    name:             'hivemind',
    ownerAccount:     'personal',
    accessLevel:      Calendar.CalendarAccessLevel.OWNER,
  });

  return calendarId;
}

// ── Add reminder to calendar ─────────────

export async function addReminderToCalendar(reminder: Reminder): Promise<string | null> {
  if (!reminder.datetime) return null;

  const hasPermission = await requestCalendarPermissions();
  if (!hasPermission) return null;

  const calendarId = await getOrCreateHiveMindCalendar();

  // Set reminder 30 min before
  const alarmOffset = -30; // minutes

  const eventId = await Calendar.createEventAsync(calendarId, {
    title:      `${reminder.emoji} ${reminder.title}`,
    location:   reminder.location,
    notes:      reminder.notes,
    startDate:  reminder.datetime,
    endDate:    new Date(reminder.datetime.getTime() + 60 * 60 * 1000), // 1 hour default
    alarms:     [{ relativeOffset: alarmOffset }],
    timeZone:   Intl.DateTimeFormat().resolvedOptions().timeZone,
  });

  return eventId;
}

// ── Remove event from calendar ───────────

export async function removeCalendarEvent(eventId: string): Promise<void> {
  try {
    await Calendar.deleteEventAsync(eventId);
  } catch (err) {
    console.error('Failed to remove calendar event:', err);
  }
}

// ── Fetch upcoming events (for calendar view) ──

export async function fetchUpcomingEvents(days: number = 30): Promise<Calendar.Event[]> {
  const hasPermission = await requestCalendarPermissions();
  if (!hasPermission) return [];

  const now     = new Date();
  const end     = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
  const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);

  const events = await Calendar.getEventsAsync(
    calendars.map(c => c.id),
    now,
    end,
  );

  return events;
}
