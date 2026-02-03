// Helper function to determine if a shop is currently open based on business hours
export function isShopCurrentlyOpen(
  openingTime: string | null | undefined,
  closingTime: string | null | undefined,
  daysOpen: string[] | null | undefined
): boolean {
  // Default to open if no hours are set
  if (!openingTime || !closingTime) return true;
  
  const now = new Date();
  const dayNames = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
  const currentDay = dayNames[now.getDay()];
  const currentTime = now.toTimeString().slice(0, 5); // "HH:MM"
  
  // Check if current day is in days_open
  const effectiveDaysOpen = daysOpen || ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
  if (!effectiveDaysOpen.includes(currentDay)) return false;
  
  // Check if current time is within opening hours
  if (currentTime < openingTime || currentTime >= closingTime) return false;
  
  return true;
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
