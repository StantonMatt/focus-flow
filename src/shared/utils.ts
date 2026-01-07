import type { BlockedSite, Schedule, SiteCategory } from './types';

// Extract domain from URL
export function extractDomain(url: string): string {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname.replace(/^www\./, '');
  } catch {
    return '';
  }
}

// Check if a URL matches a pattern
export function matchesPattern(url: string, pattern: string): boolean {
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.replace(/^www\./, '');
    const pathname = urlObj.pathname;
    const fullPath = hostname + pathname;
    
    // Simple pattern matching
    // Pattern can be "domain.com" or "domain.com/path"
    const normalizedPattern = pattern.replace(/^www\./, '').toLowerCase();
    const normalizedPath = fullPath.toLowerCase();
    
    return normalizedPath.startsWith(normalizedPattern) || 
           hostname.toLowerCase() === normalizedPattern ||
           hostname.toLowerCase().endsWith('.' + normalizedPattern);
  } catch {
    return false;
  }
}

// Check if current time is within a schedule
export function isWithinSchedule(schedule: Schedule): boolean {
  if (!schedule.enabled) return false;
  
  const now = new Date();
  const currentDay = now.getDay(); // 0-6
  const currentTime = now.getHours() * 60 + now.getMinutes();
  
  // Check if today is in the schedule
  if (!schedule.days.includes(currentDay)) return false;
  
  // Parse start and end times
  const [startHour, startMin] = schedule.startTime.split(':').map(Number);
  const [endHour, endMin] = schedule.endTime.split(':').map(Number);
  
  const startMinutes = startHour * 60 + startMin;
  const endMinutes = endHour * 60 + endMin;
  
  return currentTime >= startMinutes && currentTime <= endMinutes;
}

// Check if any schedule is active
export function isAnyScheduleActive(schedules: Schedule[]): boolean {
  return schedules.some(isWithinSchedule);
}

// Find matching blocked site for a URL (legacy - for flat array)
export function findMatchingBlockedSite(
  url: string, 
  blockedSites: BlockedSite[]
): BlockedSite | undefined {
  return blockedSites.find(site => 
    site.enabled && matchesPattern(url, site.pattern)
  );
}

// Find matching blocked site across all categories
export function findMatchingBlockedSiteInCategories(
  url: string,
  categories: SiteCategory[]
): BlockedSite | undefined {
  for (const category of categories) {
    // Skip disabled categories
    if (!category.enabled) continue;
    
    // Search sites within the category
    const matchingSite = category.sites.find(site => 
      site.enabled && matchesPattern(url, site.pattern)
    );
    
    if (matchingSite) {
      return matchingSite;
    }
  }
  
  return undefined;
}

// Format seconds as MM:SS
export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

// Format seconds as human readable (e.g., "1h 23m")
export function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
}

// Generate a unique ID
export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Get day name from number
export function getDayName(day: number): string {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  return days[day];
}

// Get full day name from number
export function getFullDayName(day: number): string {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[day];
}

