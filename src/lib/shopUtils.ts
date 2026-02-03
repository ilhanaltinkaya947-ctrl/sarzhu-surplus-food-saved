// Types for per-day business hours
export interface DayHours {
  open: string | null;
  close: string | null;
}

export interface BusinessHours {
  mon?: DayHours;
  tue?: DayHours;
  wed?: DayHours;
  thu?: DayHours;
  fri?: DayHours;
  sat?: DayHours;
  sun?: DayHours;
}

// Helper function to determine if a shop is currently open based on business hours
export function isShopCurrentlyOpen(
  businessHours: BusinessHours | null | undefined,
  // Fallback to legacy fields if businessHours not set
  legacyOpeningTime?: string | null,
  legacyClosingTime?: string | null,
  legacyDaysOpen?: string[] | null
): boolean {
  const now = new Date();
  const dayNames = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'] as const;
  const currentDay = dayNames[now.getDay()];
  const currentTime = now.toTimeString().slice(0, 5); // "HH:MM"
  
  // Use per-day business hours if available
  if (businessHours && businessHours[currentDay]) {
    const daySchedule = businessHours[currentDay];
    if (!daySchedule?.open || !daySchedule?.close) return false; // Closed this day
    if (currentTime < daySchedule.open || currentTime >= daySchedule.close) return false;
    return true;
  }
  
  // Fallback to legacy single time fields
  if (!legacyOpeningTime || !legacyClosingTime) return true;
  const effectiveDaysOpen = legacyDaysOpen || ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
  if (!effectiveDaysOpen.includes(currentDay)) return false;
  if (currentTime < legacyOpeningTime || currentTime >= legacyClosingTime) return false;
  
  return true;
}

// Get today's hours from business hours
export function getTodayHours(businessHours: BusinessHours | null | undefined): DayHours | null {
  if (!businessHours) return null;
  const dayNames = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'] as const;
  const currentDay = dayNames[new Date().getDay()];
  return businessHours[currentDay] || null;
}

// Format time for display (e.g., "09:00" -> "9:00 AM" or keep as is)
export function formatTime(time: string | null | undefined): string {
  if (!time) return '';
  return time;
}

// Day abbreviations for display
export const DAY_OPTIONS = [
  { id: 'mon', labelKey: 'days.mon' },
  { id: 'tue', labelKey: 'days.tue' },
  { id: 'wed', labelKey: 'days.wed' },
  { id: 'thu', labelKey: 'days.thu' },
  { id: 'fri', labelKey: 'days.fri' },
  { id: 'sat', labelKey: 'days.sat' },
  { id: 'sun', labelKey: 'days.sun' },
] as const;

// Default business hours
export const DEFAULT_BUSINESS_HOURS: BusinessHours = {
  mon: { open: '09:00', close: '21:00' },
  tue: { open: '09:00', close: '21:00' },
  wed: { open: '09:00', close: '21:00' },
  thu: { open: '09:00', close: '21:00' },
  fri: { open: '09:00', close: '21:00' },
  sat: { open: '10:00', close: '18:00' },
  sun: { open: '10:00', close: '18:00' },
};
