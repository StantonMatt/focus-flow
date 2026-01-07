// Content Filter Registry
// This module manages all content filters for various platforms

import type { ContentFilters } from '../../shared/types';

// Filter interface that all platform filters must implement
export interface ContentFilter {
  platform: string;
  filterName: string;
  filterKey: keyof ContentFilters;
  matches: (url: string) => boolean;
  init: () => void;
  cleanup: () => void;
}

// Registry of all filters
const filterRegistry: ContentFilter[] = [];

// Active filters on current page
const activeFilters: ContentFilter[] = [];

// Register a filter
export function registerFilter(filter: ContentFilter): void {
  filterRegistry.push(filter);
}

// Initialize filters based on settings and current URL
export function initFilters(settings: ContentFilters, url: string): void {
  // Clean up any active filters first
  cleanupFilters();
  
  // Find and initialize matching filters
  for (const filter of filterRegistry) {
    if (settings[filter.filterKey] && filter.matches(url)) {
      try {
        filter.init();
        activeFilters.push(filter);
      } catch (e) {
        console.error(`Focus Flow: Failed to init ${filter.filterName}:`, e);
      }
    }
  }
}

// Cleanup all active filters
export function cleanupFilters(): void {
  for (const filter of activeFilters) {
    try {
      filter.cleanup();
    } catch (e) {
      console.error(`Focus Flow: Failed to cleanup ${filter.filterName}:`, e);
    }
  }
  activeFilters.length = 0;
}

// Check if any filter is active
export function hasActiveFilters(): boolean {
  return activeFilters.length > 0;
}

// Get list of active filter names
export function getActiveFilterNames(): string[] {
  return activeFilters.map(f => `${f.platform}: ${f.filterName}`);
}

// Helper to inject CSS
export function injectCSS(id: string, css: string): HTMLStyleElement | null {
  if (document.getElementById(id)) return null;
  
  const style = document.createElement('style');
  style.id = id;
  style.textContent = css;
  
  const target = document.head || document.documentElement;
  target.appendChild(style);
  
  return style;
}

// Helper to remove injected CSS
export function removeCSS(id: string): void {
  const style = document.getElementById(id);
  if (style) {
    style.remove();
  }
}

// Helper to create a mutation observer
export function createDOMObserver(
  callback: (mutations: MutationRecord[]) => void,
  options: MutationObserverInit = { childList: true, subtree: true }
): MutationObserver {
  const observer = new MutationObserver(callback);
  
  if (document.body) {
    observer.observe(document.body, options);
  } else {
    // Wait for body to exist
    const waitForBody = new MutationObserver(() => {
      if (document.body) {
        waitForBody.disconnect();
        observer.observe(document.body, options);
      }
    });
    waitForBody.observe(document.documentElement, { childList: true });
  }
  
  return observer;
}

// Note: Filter files are imported directly in content/index.ts
// They auto-register when imported via registerFilter()

