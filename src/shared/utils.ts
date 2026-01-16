import type { BlockedSite, Schedule, SiteCategory, DailyTimeStats } from './types';
import { getStatsCategoryForDomain } from './domain-categories';

// Time period types for stats
export type StatsPeriod = 'day' | 'week' | 'month' | 'year';

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

// ============================================
// Date Range & Stats Aggregation Utilities
// ============================================

// Format date as YYYY-MM-DD (for storage keys)
export function formatDateKey(date: Date): string {
  return date.toISOString().split('T')[0];
}

// Get date range for a period with offset
export function getDateRange(
  period: StatsPeriod, 
  offset: number = 0
): { start: Date; end: Date; label: string } {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  
  let start: Date;
  let end: Date;
  let label: string;
  
  switch (period) {
    case 'day': {
      start = new Date(now);
      start.setDate(start.getDate() + offset);
      end = new Date(start);
      
      const isToday = offset === 0;
      const isYesterday = offset === -1;
      
      if (isToday) {
        label = 'Today';
      } else if (isYesterday) {
        label = 'Yesterday';
      } else {
        label = start.toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric',
          year: start.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
        });
      }
      break;
    }
    
    case 'week': {
      // Start from current week (Sunday) and add offset weeks
      start = new Date(now);
      start.setDate(start.getDate() - start.getDay() + (offset * 7));
      end = new Date(start);
      end.setDate(end.getDate() + 6);
      
      const startMonth = start.toLocaleDateString('en-US', { month: 'short' });
      const endMonth = end.toLocaleDateString('en-US', { month: 'short' });
      
      if (startMonth === endMonth) {
        label = `${startMonth} ${start.getDate()} - ${end.getDate()}`;
      } else {
        label = `${startMonth} ${start.getDate()} - ${endMonth} ${end.getDate()}`;
      }
      break;
    }
    
    case 'month': {
      // Current month + offset
      start = new Date(now.getFullYear(), now.getMonth() + offset, 1);
      end = new Date(now.getFullYear(), now.getMonth() + offset + 1, 0);
      
      label = start.toLocaleDateString('en-US', { 
        month: 'long', 
        year: 'numeric' 
      });
      break;
    }
    
    case 'year': {
      // Current year + offset
      start = new Date(now.getFullYear() + offset, 0, 1);
      end = new Date(now.getFullYear() + offset, 11, 31);
      
      label = start.getFullYear().toString();
      break;
    }
  }
  
  return { start, end, label };
}

// Get all dates between start and end (inclusive)
export function getDatesBetween(start: Date, end: Date): string[] {
  const dates: string[] = [];
  const current = new Date(start);
  
  while (current <= end) {
    dates.push(formatDateKey(current));
    current.setDate(current.getDate() + 1);
  }
  
  return dates;
}

// Aggregate stats for a date range
export function aggregateStats(
  allStats: Record<string, DailyTimeStats>,
  startDate: Date,
  endDate: Date
): { 
  dailyTotals: { date: string; total: number }[];
  domains: DailyTimeStats;
  total: number;
} {
  const dates = getDatesBetween(startDate, endDate);
  const domains: DailyTimeStats = {};
  
  const dailyTotals = dates.map(date => {
    const dayStats = allStats[date] || {};
    let dayTotal = 0;
    
    for (const [domain, seconds] of Object.entries(dayStats)) {
      dayTotal += seconds;
      domains[domain] = (domains[domain] || 0) + seconds;
    }
    
    return { date, total: dayTotal };
  });
  
  const total = Object.values(domains).reduce((a, b) => a + b, 0);
  
  return { dailyTotals, domains, total };
}

// Aggregate stats by month for year view
export function aggregateStatsByMonth(
  allStats: Record<string, DailyTimeStats>,
  year: number
): { month: number; label: string; total: number }[] {
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  return monthNames.map((label, month) => {
    const start = new Date(year, month, 1);
    const end = new Date(year, month + 1, 0);
    const dates = getDatesBetween(start, end);
    
    let total = 0;
    for (const date of dates) {
      const dayStats = allStats[date] || {};
      total += Object.values(dayStats).reduce((a, b) => a + b, 0);
    }
    
    return { month, label, total };
  });
}

// Get category for a domain from blocked sites
export function getCategoryForDomain(
  domain: string,
  categories: SiteCategory[]
): { id: string; name: string; nameKey?: string; icon: string } | null {
  // Normalize domain for comparison
  const normalizedDomain = domain.replace(/^www\./, '').toLowerCase();
  
  for (const category of categories) {
    for (const site of category.sites) {
      const pattern = site.pattern.replace(/^www\./, '').toLowerCase();
      
      // Check if domain matches pattern
      if (normalizedDomain === pattern || 
          normalizedDomain.endsWith('.' + pattern) ||
          normalizedDomain.startsWith(pattern + '/')) {
        return {
          id: category.id,
          name: category.name,
          nameKey: category.nameKey,
          icon: category.icon
        };
      }
    }
  }
  
  return null;
}

// Group stats by category (uses blocked sites first, then falls back to stats categories)
export function groupByCategory(
  stats: DailyTimeStats,
  categories: SiteCategory[]
): { 
  categoryStats: { id: string; name: string; nameKey?: string; icon: string; seconds: number }[];
  uncategorized: DailyTimeStats;
} {
  const categoryMap = new Map<string, { 
    id: string; 
    name: string; 
    nameKey?: string; 
    icon: string; 
    seconds: number 
  }>();
  const uncategorized: DailyTimeStats = {};
  
  for (const [domain, seconds] of Object.entries(stats)) {
    // First try blocked sites categories
    let category = getCategoryForDomain(domain, categories);
    
    // Fall back to stats categories for broader categorization
    if (!category) {
      const statsCategory = getStatsCategoryForDomain(domain);
      if (statsCategory) {
        category = {
          id: statsCategory.id,
          name: statsCategory.nameKey, // Will be translated in the component
          nameKey: statsCategory.nameKey,
          icon: statsCategory.icon
        };
      }
    }
    
    if (category) {
      const existing = categoryMap.get(category.id);
      if (existing) {
        existing.seconds += seconds;
      } else {
        categoryMap.set(category.id, { ...category, seconds });
      }
    } else {
      uncategorized[domain] = seconds;
    }
  }
  
  // Sort by time spent (descending)
  const categoryStats = Array.from(categoryMap.values())
    .sort((a, b) => b.seconds - a.seconds);
  
  return { categoryStats, uncategorized };
}

// Aggregate stats by week for month view
export function aggregateStatsByWeek(
  allStats: Record<string, DailyTimeStats>,
  start: Date,
  end: Date
): { week: number; label: string; total: number }[] {
  const weeks: { week: number; total: number }[] = [];
  const current = new Date(start);
  let weekNum = 1;
  
  while (current <= end) {
    // Get the week's start (current) and end (6 days later or month end)
    const weekStart = new Date(current);
    const weekEnd = new Date(current);
    weekEnd.setDate(weekEnd.getDate() + 6);
    
    // Don't go past the month end
    const actualEnd = weekEnd > end ? end : weekEnd;
    
    // Sum up the days in this week
    const dates = getDatesBetween(weekStart, actualEnd);
    let total = 0;
    
    for (const date of dates) {
      const dayStats = allStats[date] || {};
      total += Object.values(dayStats).reduce((a, b) => a + b, 0);
    }
    
    weeks.push({ week: weekNum, total });
    
    // Move to next week
    current.setDate(current.getDate() + 7);
    weekNum++;
  }
  
  return weeks.map(w => ({
    week: w.week,
    label: `W${w.week}`,
    total: w.total
  }));
}

// Get chart data points for different periods
export function getChartDataPoints(
  period: StatsPeriod,
  allStats: Record<string, DailyTimeStats>,
  offset: number = 0
): { label: string; value: number; date?: string }[] {
  const { start, end } = getDateRange(period, offset);
  
  if (period === 'year') {
    const year = start.getFullYear();
    return aggregateStatsByMonth(allStats, year).map(m => ({
      label: m.label,
      value: m.total
    }));
  }
  
  if (period === 'month') {
    // For month view, aggregate by weeks
    return aggregateStatsByWeek(allStats, start, end).map(w => ({
      label: w.label,
      value: w.total
    }));
  }
  
  const { dailyTotals } = aggregateStats(allStats, start, end);
  
  if (period === 'day') {
    // For day view, just return single point
    return dailyTotals.map(d => ({
      label: 'Total',
      value: d.total,
      date: d.date
    }));
  }
  
  // For week, return daily data points
  return dailyTotals.map(d => {
    const date = new Date(d.date);
    return { 
      label: getDayName(date.getDay()), 
      value: d.total, 
      date: d.date 
    };
  });
}
