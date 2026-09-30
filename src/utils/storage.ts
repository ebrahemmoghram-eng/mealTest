import { DayRecord, Language, LoggedActivity, LoggedMeal, UserProfile } from '../types';
import { getDefaultProfile } from './nutrition';

const STORAGE_KEYS = {
  PROFILE: 'mometer_user_profile',
  LANGUAGE: 'mometer_language',
  CURRENT_DAY: 'mometer_today_record',
  HISTORY: 'mometer_history_records',
};

export function getTodayKey(): string {
  const now = new Date();
  return now.toISOString().split('T')[0];
}

export function loadUserProfile(): UserProfile | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PROFILE);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load user profile from localStorage', e);
    return null;
  }
}

export function saveUserProfile(profile: UserProfile): void {
  try {
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
  } catch (e) {
    console.error('Failed to save user profile to localStorage', e);
  }
}

export function loadLanguage(): Language {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.LANGUAGE) as Language | null;
    if (saved === 'ar' || saved === 'en') return saved;
  } catch (e) {
    // ignore
  }
  return 'ar'; // Default Arabic as requested
}

export function saveLanguage(lang: Language): void {
  try {
    localStorage.setItem(STORAGE_KEYS.LANGUAGE, lang);
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  } catch (e) {
    console.error('Failed to save language', e);
  }
}

export function loadTodayRecord(): DayRecord {
  const today = getTodayKey();
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CURRENT_DAY);
    if (raw) {
      const parsed: DayRecord = JSON.parse(raw);
      if (parsed.date === today) {
        return parsed;
      }
      // If it belongs to a past date, archive it to history
      archiveDayRecord(parsed);
    }
  } catch (e) {
    console.error('Failed to load today record', e);
  }

  // Create new today record
  const freshRecord: DayRecord = {
    date: today,
    waterMl: 500, // starting glass of morning water
    meals: [],
    activities: [],
  };
  saveTodayRecord(freshRecord);
  return freshRecord;
}

export function saveTodayRecord(record: DayRecord): void {
  try {
    localStorage.setItem(STORAGE_KEYS.CURRENT_DAY, JSON.stringify(record));
  } catch (e) {
    console.error('Failed to save today record', e);
  }
}

function archiveDayRecord(record: DayRecord): void {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.HISTORY);
    const history: DayRecord[] = raw ? JSON.parse(raw) : [];
    // remove existing for same date if any
    const filtered = history.filter((r) => r.date !== record.date);
    filtered.unshift(record);
    // keep last 30 days
    localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(filtered.slice(0, 30)));
  } catch (e) {
    console.error('Failed to archive day record', e);
  }
}

export function clearAllAppData(): void {
  try {
    localStorage.removeItem(STORAGE_KEYS.PROFILE);
    localStorage.removeItem(STORAGE_KEYS.CURRENT_DAY);
    localStorage.removeItem(STORAGE_KEYS.HISTORY);
  } catch (e) {
    console.error('Failed to clear app data', e);
  }
}
